const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const connectToDb = require('../db');

// Basis-Pfade (anpassen falls nötig)
const uploadBase = path.join(__dirname, '../uploads');
const zipBase = path.join(__dirname, '../zips');

// 1) GET /download/:uploadId → Passwortabfrage oder direkter Download
router.get('/download/:uploadId', async (req, res) => {
  const uploadId = req.params.uploadId;
  const db = await connectToDb();
  const collection = db.collection('uploads');
  const upload = await collection.findOne({ uploadId });

  if (!upload) return res.status(404).send('Datei nicht gefunden');
  if (new Date() > upload.expiresAt) return res.status(410).send('Link abgelaufen');

  if (upload.passwordHash) {
    // Passwort erforderlich → zeige Formular
    return res.send(`
      <h2>Passwort erforderlich</h2>
      <form method="POST" action="/download-secure/${uploadId}">
        <input type="password" name="password" required />
        <button type="submit">Download starten</button>
      </form>
    `);
  }

  // Kein Passwort → direkt weiterleiten zum Download
  if (upload.files.length === 1) {
    const filePath = path.join(uploadBase, uploadId, upload.files[0].originalName);
    if (!fs.existsSync(filePath)) return res.status(404).send('Datei nicht gefunden');
    return res.download(filePath);
  } else {
    const zipPath = path.join(zipBase, `${uploadId}.zip`);
    if (!fs.existsSync(zipPath)) return res.status(404).send('ZIP-Datei nicht gefunden');
    return res.download(zipPath);
  }
});

// 2) POST /download-secure/:uploadId → Passwort prüfen und Datei senden
router.post('/download-secure/:uploadId', express.urlencoded({ extended: true }), async (req, res) => {
  const uploadId = req.params.uploadId;
  const enteredPassword = req.body.password;

  const db = await connectToDb();
  const upload = await db.collection('uploads').findOne({ uploadId });

  if (!upload) return res.status(404).send('Datei nicht gefunden');
  if (!upload.passwordHash) return res.status(400).send('Kein Passwort erforderlich');
  if (new Date() > upload.expiresAt) return res.status(410).send('Link abgelaufen');

  const isValid = await bcrypt.compare(enteredPassword, upload.passwordHash);
  if (!isValid) return res.status(403).send('Falsches Passwort');

  // Passwort korrekt → Datei senden
  if (upload.files.length === 1) {
    const filePath = path.join(uploadBase, uploadId, upload.files[0].originalName);
    if (!fs.existsSync(filePath)) return res.status(404).send('Datei nicht gefunden');
    return res.download(filePath);
  } else {
    const zipPath = path.join(zipBase, `${uploadId}.zip`);
    if (!fs.existsSync(zipPath)) return res.status(404).send('ZIP-Datei nicht gefunden');
    return res.download(zipPath);
  }
});

module.exports = router;

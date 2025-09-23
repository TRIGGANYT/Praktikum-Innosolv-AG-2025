const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const connectToDb = require('../db');

// ==============================
// Basis-Pfade
// ==============================
const uploadBase = path.join(__dirname, '../uploads');
const zipBase = path.join(__dirname, '../zips');

// ==============================
// Multer Speicher-Konfiguration
// ==============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadId = req.uploadId;
    const uploadFolder = path.join(uploadBase, uploadId);

    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder, { recursive: true });
    }

    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// ==============================
// Middleware zur Generierung einer eindeutigen Upload-ID
// ==============================
function assignUploadId(req, res, next) {
  req.uploadId = uuidv4();
  next();
}

// ==============================
// Routen: Links erzeugen & abrufen
// ==============================

// 1) Alle aktiven (nicht abgelaufenen) Download-Links holen
router.get('/active-links', async (req, res) => {
  try {
    const db = await connectToDb();
    const collection = db.collection('uploads');
    const now = new Date();
    const uploads = await collection.find({ expiresAt: { $gt: now } }).sort({ createdAt: -1 }).toArray();

    const links = uploads.map(u => ({
      downloadLink: u.downloadLink,
      uploadId: u.uploadId,
      expiresAt: u.expiresAt,
      createdAt: u.createdAt
    }));

    res.json({ links });
  } catch (err) {
    console.error('Fehler beim Laden der aktiven Links:', err);
    res.status(500).json({ error: 'Fehler beim Laden der aktiven Links' });
  }
});

// 2) Upload + Download-Link generieren
router.post('/', assignUploadId, upload.array('files', 10), handleFileUpload);

// 3) Download der ZIP-Datei
router.get('/download/:uploadId', async (req, res) => {
  const { uploadId } = req.params;

  try {
    const db = await connectToDb();
    const collection = db.collection('uploads');
    const record = await collection.findOne({ uploadId });

    if (!record) {
      return res.status(404).send('Download nicht gefunden');
    }

    // Ablaufzeit prüfen
    if (record.expiresAt < new Date()) {
      return res.status(410).send('Download-Link ist abgelaufen');
    }

    const zipFilePath = path.join(zipBase, `${uploadId}.zip`);
    if (!fs.existsSync(zipFilePath)) {
      return res.status(404).send('ZIP-Datei nicht gefunden');
    }

    res.download(zipFilePath);
  } catch (err) {
    console.error('Fehler beim Download:', err);
    res.status(500).send('Interner Serverfehler');
  }
});

// ==============================
// Route: Dateien und Uploads löschen
// ==============================

router.post('/delete-file', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ success: false, message: 'Keine URL angegeben' });
  }

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const parts = pathname.split('/').filter(Boolean);

    if (parts.length < 2) {
      return res.status(400).json({ success: false, message: 'Ungültiger Pfad in URL' });
    }

    let uploadId, filePathToDelete, zipPathToDelete;

    if (parts[0] === 'uploads') {
      uploadId = parts[1];
      const filename = parts.slice(2).join('/');
      filePathToDelete = path.join(uploadBase, uploadId, filename);
      zipPathToDelete = path.join(zipBase, `${uploadId}.zip`);
    } else if (parts[0] === 'download') {
      uploadId = parts[1];
      filePathToDelete = null;
      zipPathToDelete = path.join(zipBase, `${uploadId}.zip`);
    } else {
      return res.status(400).json({ success: false, message: 'Unbekanntes URL-Format' });
    }

    // Dateien und Ordner löschen
    const deletePromises = [];

    if (filePathToDelete) {
      deletePromises.push(deleteFile(filePathToDelete));
    }

    if (uploadId) {
      const uploadFolder = path.join(uploadBase, uploadId);
      deletePromises.push(deleteFolder(uploadFolder));
    }

    if (zipPathToDelete) {
      deletePromises.push(deleteFile(zipPathToDelete));
    }

    await Promise.all(deletePromises);

    // Datenbank-Eintrag löschen
    const db = await connectToDb();
    const collection = db.collection('uploads');
    await collection.deleteOne({ uploadId });

    res.json({ success: true });
  } catch (err) {
    console.error('Fehler beim Löschen:', err);
    res.status(500).json({ success: false, message: 'Fehler beim Löschen der Dateien' });
  }
});

// ==============================
// Upload-Handler-Funktion
// ==============================
async function handleFileUpload(req, res) {
  const uploadId = req.uploadId;
  const uploadFolder = path.join(uploadBase, uploadId);

  const expirationSeconds = parseInt(req.body.expiration) || 3600; // Standard 1 Stunde
  const expiresAt = new Date(Date.now() + expirationSeconds * 1000);

  let downloadLink;

  if (req.files.length === 1) {
    const file = req.files[0];
    downloadLink = `${req.protocol}://${req.get('host')}/uploads/${uploadId}/${file.originalname}`;
  } else {
    const zipFilePath = path.join(zipBase, `${uploadId}.zip`);

    try {
      await createZipFromFolder(uploadFolder, zipFilePath);
      downloadLink = `${req.protocol}://${req.get('host')}/download/${uploadId}`;
    } catch (err) {
      console.error('ZIP-Erstellung fehlgeschlagen:', err);
      return res.status(500).json({ error: 'ZIP-Erstellung fehlgeschlagen' });
    }
  }

  try {
    const db = await connectToDb();
    const collection = db.collection('uploads');

    await collection.insertOne({
      uploadId,
      downloadLink,
      createdAt: new Date(),
      expiresAt,
      files: req.files.map(file => ({
        originalName: file.originalname,
        size: file.size
      }))
    });
  } catch (err) {
    console.error('Fehler beim Speichern in MongoDB:', err);
    return res.status(500).json({ error: 'Fehler beim Speichern in der Datenbank' });
  }

  res.json({ downloadLink });
}

// ==============================
// Hilfsfunktionen
// ==============================

// ZIP aus Ordner erstellen
function createZipFromFolder(sourceFolder, outputFilePath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('error', err => reject(err));

    archive.pipe(output);
    archive.directory(sourceFolder, false);
    archive.finalize();
  });
}

// Datei löschen
function deleteFile(filePath) {
  return new Promise((resolve, reject) => {
    if (!filePath) return resolve();

    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') return reject(err);
      resolve();
    });
  });
}

// Ordner löschen
function deleteFolder(folderPath) {
  return new Promise((resolve, reject) => {
    fs.rm(folderPath, { recursive: true, force: true }, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

module.exports = router;

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const connectToDb = require('../db');

const uploadBase = path.join(__dirname, '../uploads');
const zipBase = path.join(__dirname, '../zips');

// Multer Speicher-Konfiguration
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

// Middleware zur Generierung einer eindeutigen Upload-ID
function assignUploadId(req, res, next) {
  req.uploadId = uuidv4();
  next();
}

// Haupt-Upload-Handler
async function handleFileUpload(req, res) {
  const uploadId = req.uploadId;
  const uploadFolder = path.join(uploadBase, uploadId);

  // Ablaufzeit holen (von Client geschickt)
  const expirationSeconds = parseInt(req.body.expiration) || 3600;
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

  // MongoDB: Metadaten speichern
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


// Funktion: Ordner in ZIP umwandeln
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

// DELETE-Route zum Löschen von Dateien basierend auf Download-Link
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

    // Datei- und Ordner-Löschfunktionen (wie du sie hast)...

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

    // Jetzt den DB-Eintrag löschen
    const db = await connectToDb();
    const collection = db.collection('uploads');
    await collection.deleteOne({ uploadId });

    res.json({ success: true });

  } catch (err) {
    console.error('Fehler beim Löschen:', err);
    res.status(500).json({ success: false, message: 'Fehler beim Löschen der Dateien' });
  }
});


router.post('/', assignUploadId, upload.array('files', 10), handleFileUpload);

// Funktion Datei löschen
function deleteFile(filePath) {
  return new Promise((resolve, reject) => {
    if (!filePath) return resolve();
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        return reject(err);
      }
      resolve();
    });
  });
}

// Funktion Ordner löschen
function deleteFolder(folderPath) {
  return new Promise((resolve, reject) => {
    fs.rm(folderPath, { recursive: true, force: true }, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}


// Route für /download/:uploadId
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
    const now = new Date();
    if (record.expiresAt < now) {
      return res.status(410).send('Download-Link ist abgelaufen');
    }

    // Pfad zur ZIP-Datei
    const zipFilePath = path.join(zipBase, `${uploadId}.zip`);
    if (!fs.existsSync(zipFilePath)) {
      return res.status(404).send('ZIP-Datei nicht gefunden');
    }

    // Datei senden
    res.download(zipFilePath);
  } catch (err) {
    console.error('Fehler beim Download:', err);
    res.status(500).send('Interner Serverfehler');
  }
});

module.exports = router;
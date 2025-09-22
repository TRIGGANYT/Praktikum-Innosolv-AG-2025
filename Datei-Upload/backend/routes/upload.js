const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const uploadBase = path.join(__dirname, '../uploads');
const zipBase = path.join(__dirname, '../zips');
const upload = multer({ storage });

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

// Middleware zur Generierung einer eindeutigen Upload-ID
function assignUploadId(req, res, next) {
  req.uploadId = uuidv4();
  next();
}

// Haupt-Upload-Handler
async function handleFileUpload(req, res) {
  const uploadId = req.uploadId;
  const uploadFolder = path.join(uploadBase, uploadId);

  if (req.files.length === 1) {
    // Direktlink zur Einzeldatei zurückgeben
    const file = req.files[0];
    const downloadLink = `${req.protocol}://${req.get('host')}/uploads/${uploadId}/${file.originalname}`;
    return res.json({ downloadLink });
  }

  // Mehrere Dateien → ZIP erstellen
  const zipFilePath = path.join(zipBase, `${uploadId}.zip`);

  try {
    await createZipFromFolder(uploadFolder, zipFilePath);

    const downloadLink = `${req.protocol}://${req.get('host')}/download/${uploadId}`;

    res.json({ downloadLink });
  } catch (err) {
    console.error('ZIP-Erstellung fehlgeschlagen:', err);
    res.status(500).json({ error: 'ZIP-Erstellung fehlgeschlagen' });
  }
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
router.post('/delete-file', (req, res) => {
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
      // Einzeldatei: /uploads/uploadId/filename.ext
      uploadId = parts[1];
      const filename = parts.slice(2).join('/');

      filePathToDelete = path.join(uploadBase, uploadId, filename);
      zipPathToDelete = path.join(zipBase, `${uploadId}.zip`);

    } else if (parts[0] === 'download') {
      uploadId = parts[1];
      filePathToDelete = null; // Keine einzelne Datei löschen, sondern Ordner
      zipPathToDelete = path.join(zipBase, `${uploadId}.zip`);
    } else {
      return res.status(400).json({ success: false, message: 'Unbekanntes URL-Format' });
    }

    // Funktion file löschen
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

    // Funktion ordner löschen
    function deleteFolder(folderPath) {
      return new Promise((resolve, reject) => {
        fs.rm(folderPath, { recursive: true, force: true }, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }

    // Löschen starten
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

    Promise.all(deletePromises)
      .then(() => {
        res.json({ success: true });
      })
      .catch((err) => {
        console.error('Fehler beim Löschen:', err);
        res.status(500).json({ success: false, message: 'Fehler beim Löschen der Dateien' });
      });

  } catch (err) {
    console.error('Ungültige URL:', err);
    return res.status(400).json({ success: false, message: 'Ungültige URL' });
  }
});

router.post('/', assignUploadId, upload.array('files', 10), handleFileUpload);

module.exports = router;

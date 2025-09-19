const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Basispfade für Uploads und ZIPs
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

// POST-Route für Dateiupload
router.post('/', assignUploadId, upload.array('files', 10), handleFileUpload);

module.exports = router;

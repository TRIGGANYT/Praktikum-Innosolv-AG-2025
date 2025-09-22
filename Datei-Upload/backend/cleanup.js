// cleanup.js
const fs = require('fs');
const path = require('path');
const connectToDb = require('./db');

const uploadBase = path.join(__dirname, 'uploads');
const zipBase = path.join(__dirname, 'zips');

async function cleanupExpiredFiles() {
  try {
    const db = await connectToDb();
    const collection = db.collection('uploads');

    // Alle noch existierenden Upload-IDs aus der DB holen
    const existingUploads = await collection.find({}).project({ uploadId: 1 }).toArray();
    const activeUploadIds = existingUploads.map(entry => entry.uploadId);

    // Alle Verzeichnisse im uploads/ Verzeichnis
    const uploadDirs = fs.existsSync(uploadBase) ? fs.readdirSync(uploadBase) : [];
    const zipFiles = fs.existsSync(zipBase) ? fs.readdirSync(zipBase) : [];

    // Durchgehen und löschen, wenn nicht mehr in DB vorhanden
    for (const folder of uploadDirs) {
      if (!activeUploadIds.includes(folder)) {
        const fullPath = path.join(uploadBase, folder);
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`Abgelaufene Dateien gelöscht: ${fullPath}`);
      }
    }

    for (const zip of zipFiles) {
      const uploadId = zip.replace('.zip', '');
      if (!activeUploadIds.includes(uploadId)) {
        const fullPath = path.join(zipBase, zip);
        fs.unlinkSync(fullPath);
        console.log(`Abgelaufene ZIP-Dateien gelöscht: ${fullPath}`);
      }
    }

    console.log('Cleanup abgeschlossen!');

  } 
  catch (err) {
    console.error('Fehler beim Cleanup:', err);
  }
}

cleanupExpiredFiles();
module.exports = cleanupExpiredFiles;
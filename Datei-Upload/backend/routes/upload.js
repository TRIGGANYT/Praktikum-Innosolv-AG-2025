const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const upload = multer({ storage });

// Speicher konfigurieren
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

// Upload-Route
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Keine Datei hochgeladen" });

  // Du kannst hier noch einen Download-Link zurückgeben
  const downloadLink = `http://localhost:3000/uploads/${req.file.filename}`;

  res.json({ message: "Upload erfolgreich", downloadLink, file: req.file });
});

module.exports = router; 

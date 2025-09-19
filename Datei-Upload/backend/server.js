const express = require("express");
const multer = require("multer");
const path = require("path");
const app = express();
const PORT = 3000;
const { v4: uuidv4 } = require('uuid');
const upload = multer({ storage });

// Frontend statisch bereitstellen
app.use(express.static(path.join(__dirname, '../frontend')));

// Speicherort & Dateinamen-Konfiguration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// Upload-Endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Keine Datei hochgeladen" });
  }

  // Link zum Zugriff auf die Datei (beispielhaft)
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

  res.json({
    message: "Datei erfolgreich hochgeladen",
    downloadLink: fileUrl,
    originalName: req.file.originalname,
  });
});

// Statische Dateien aus "uploads" ausliefern
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});


// Root-Route gibt index.html aus dem Frontend zurück
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});



/* server.js

const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Routen importieren
const uploadRoutes = require("./routes/upload");

app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routen aktivieren
app.use("/api", uploadRoutes);

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

*/

const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 3000;

// Speicherort & Dateinamen-Konfiguration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");  // Ordner muss existieren!
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

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
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
});

const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Upload-Router importieren
const uploadRouter = require('./routes/upload');

// Frontend statisch bereitstellen
app.use(express.static(path.join(__dirname, '../frontend')));

// Upload-Router mounten
app.use('/upload', uploadRouter);

// Statische Dateien aus "uploads" ausliefern
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

// Root-Route gibt index.html aus dem Frontend zurück
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});



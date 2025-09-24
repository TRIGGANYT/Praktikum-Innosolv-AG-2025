const express = require("express");
const path = require("path");
const fs = require('fs');
const app = express();
const PORT = 3000;
const uploadRouter = require('./routes/upload');
const cleanup = require('./cleanup');
const downloadRoutes = require('./routes/download');

app.use('/', downloadRoutes);

app.use (express.json());

app.use('/zips', express.static(path.join(__dirname, 'zips')));

// Frontend statisch bereitstellen
app.use(express.static(path.join(__dirname, '../frontend')));

// Upload-Router mounten
app.use('/upload', uploadRouter);

// Statische Dateien aus "uploads" ausliefern
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);

  setInterval(() => {
    console.log('Starte Cleanup abgelaufener Dateien...');
    cleanup();
  }, 5 * 60 * 1000); // Alle 5 minuten
});

// Root-Route gibt index.html aus dem Frontend zurück
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/download/:id', (req, res) => {
  const zipPath = path.join(__dirname, 'zips', `${req.params.id}.zip`);

  if (fs.existsSync(zipPath)) {
    res.download(zipPath, `${req.params.id}.zip`);
  } 
  else {
    res.status(404).send('Datei nicht gefunden.');
  }
});
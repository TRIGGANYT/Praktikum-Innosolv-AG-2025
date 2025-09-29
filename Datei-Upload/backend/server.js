const express = require("express");
const path = require("path");
const fs = require("fs");
const https = require("https");

const app = express();
const PORT = 3000;

const uploadRouter = require("./routes/upload");
const cleanup = require("./cleanup");
const downloadRoutes = require("./routes/download");

const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
};

// Views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Reihenfolge: Middleware → statics → Routen
app.use(express.json());

// Downloads (eigene Router)
app.use("/", downloadRoutes);

// Statische Ordner
app.use("/zips", express.static(path.join(__dirname, "zips")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Frontend statisch
app.use(express.static(path.join(__dirname, "../frontend")));

// Upload-Router
app.use("/upload", uploadRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Direkt-Download ZIP
app.get("/download/:id", (req, res) => {
  const zipPath = path.join(__dirname, "zips", `${req.params.id}.zip`);
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, `${req.params.id}.zip`);
  } else {
    res.status(404).send("Datei nicht gefunden.");
  }
});

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS-Server läuft unter https://localhost:${PORT}`);

  // Cleanup alle 5 Minuten
  setInterval(() => {
    console.log("Starte Cleanup abgelaufener Dateien...");
    cleanup();
  }, 5 * 60 * 1000);
});
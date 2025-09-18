// server.js

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

/* routes/upload.js

const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const uploadController = require("../controllers/uploadController");


// Speicherort & Dateinamen-Konfiguration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// POST /upload
router.post("/upload", upload.single("file"), uploadController.uploadFile);

module.exports = router;

*/

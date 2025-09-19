const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
// Speicherort & Dateinamen-Konfiguration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Multi-File Upload-Endpoint (max 10 Dateien)
router.post('/', upload.array('files', 10), (req, res) => {
	if (!req.files || !req.files.length) {
		return res.status(400).json({ error: 'Keine Dateien hochgeladen' });
	}
	const downloadLinks = req.files.map(file => ({
		link: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
		originalName: file.originalname
	}));
	res.json({
		message: 'Dateien erfolgreich hochgeladen',
		downloadLinks
	});
});

module.exports = router;


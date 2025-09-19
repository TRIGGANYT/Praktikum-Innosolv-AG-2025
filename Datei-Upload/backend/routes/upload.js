const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const upload = multer({ storage });

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

// Upload-Endpoint
router.post('/', upload.single('file'), (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: 'Keine Datei hochgeladen' });
	}
	// Link zum Zugriff auf die Datei
	const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
	res.json({
		message: 'Datei erfolgreich hochgeladen',
		downloadLink: fileUrl,
		originalName: req.file.originalname,
	});
});

module.exports = router;


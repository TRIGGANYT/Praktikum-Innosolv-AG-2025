/* backend/controllers/uploadController.js

exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Keine Datei hochgeladen" });
  }

  // Download-Link erzeugen
  const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;

  res.json({
    message: "Datei erfolgreich hochgeladen",
    downloadLink: fileUrl,
    originalName: req.file.originalname,
  });
};

*/

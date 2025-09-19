// Elemente der Dropzone mit IDs versehen.
const dropzone = document.getElementById('dropzone');
const dropzoneText = document.getElementById('dropzone-text');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('fileInput');
const customFileBtn = document.getElementById('customFileBtn');
const fileResult = document.getElementById('file-result');
const allowedExtensions = ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx", "txt"];

// Neu: Download-Link Bereich & Copy-Button
const downloadArea = document.getElementById('download-area');
const downloadUrlLink = document.getElementById('download-url');
const copyLinkBtn = document.getElementById('copy-link-btn');

const deleteLinkBtn = document.getElementById('delete-link-btn')

let selectedFiles = [];

// Upload-Button erst anzeigen, sobald Datei in Dropzone
uploadBtn.style.display = 'none';

// Öffnet den Datei-Explorer beim Klick auf "Datei auswählen"
customFileBtn.addEventListener('click', openFileExplorer);

// Dateiauswahl per Klick
fileInput.addEventListener('change', handleFileChange);

// Copy-Link Button Funktion
copyLinkBtn.addEventListener('click', () => {
  if (!downloadUrlLink.href) return;
  navigator.clipboard.writeText(downloadUrlLink.href)
    .then(() => alert('Link kopiert!'))
    .catch(() => alert('Kopieren fehlgeschlagen!'));
});

deleteLinkBtn.addEventListener('click', async () => {
  const downloadUrl = downloadUrlLink.href;
  if (!downloadUrl) {
    alert("Kein Download-Link vorhanden.");
    return;
  }

  // Optional: Bestätigung vor dem Löschen
  if (!confirm("Willst du den Download-Link und die Dateien wirklich löschen?")) return;

  try {
    const response = await fetch('/upload/delete-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: downloadUrl })
    });

    const result = await response.json();

    if (result.success) {
      alert('Link und Dateien wurden gelöscht.');

      // UI zurücksetzen
      downloadUrlLink.href = '';
      downloadUrlLink.textContent = '';
      deleteLinkBtn.style.display = 'none';

      fileResult.textContent = ''; // Kein Ergebnistext
      dropzoneText.textContent = 'Datei hinein ziehen oder auswählen';
      selectedFiles = [];
      uploadBtn.style.display = 'none';
      fileInput.value = ''; // Datei-Input zurücksetzen
      // UI anpassen
      downloadUrlLink.href = '';
      downloadUrlLink.textContent = '';
      deleteLinkBtn.style.display = 'none';
      qrBox.style.display = 'none';

    } else {
      alert('Fehler beim Löschen: ' + result.message);
    }
  } catch (err) {
    alert('Fehler beim Löschen.');
    console.error(err);
  }
});


// Drag & Drop Event-Handler
dropzone.addEventListener('dragover', dragoverHandler);
dropzone.addEventListener('dragleave', dragleaveHandler);
dropzone.addEventListener('drop', dropHandler);

function openFileExplorer() {
  fileInput.click();
}

function handleFileChange(event) {
  if (event.target.files.length > 0) {
    selectedFiles = Array.from(event.target.files);
    updateUIAfterFileSelect();
  }
}

// Datei-Endungen überprüfen
function isAllowedFileType(fileName) {
  const fileExtension = fileName.split('.').pop().toLowerCase();
  return allowedExtensions.includes(fileExtension);
}

// Drag & Drop Funktionen
function dragoverHandler(event) {
  event.preventDefault();
  dropzone.classList.add('dragover');
}

function dragleaveHandler(event) {
  dropzone.classList.remove('dragover');
}

function dropHandler(event) {
  event.preventDefault();
  dropzone.classList.remove('dragover');
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    selectedFiles = Array.from(files);
    updateUIAfterFileSelect();
  }
}

// Validierung einzelner Datei
function validateFile(file) {
  const fileName = file.name;
  const fileSize = file.size;
  const fileMb = fileSize / 1024 ** 2;

  if (!isAllowedFileType(fileName)) {
    return { valid: false, message: `${fileName}: Dateityp nicht erlaubt.` };
  }
  if (fileMb >= 50) {
    return { valid: false, message: `${fileName}: Zu gross. Wählen Sie eine Datei kleiner als 50MB.` };
  }
  return { valid: true, message: `${fileName} (${fileMb.toFixed(1)} MB) bereit zum Hochladen.` };
}

// UI nach Dateiauswahl updaten
function updateUIAfterFileSelect() {
  if (!selectedFiles.length) {
    fileResult.textContent = '';
    uploadBtn.style.display = 'none';
    return;
  }

  let allValid = true;
  let messages = [];

  selectedFiles.forEach(file => {
    const { valid, message } = validateFile(file);
    if (!valid) allValid = false;
    messages.push(message);
  });

  fileResult.textContent = messages.join('\n');
  dropzoneText.textContent = `Ausgewählt: ${selectedFiles.map(f => f.name).join(', ')}`;
  uploadBtn.style.display = allValid ? 'inline-block' : 'none';


  downloadUrlLink.href = '';
  downloadUrlLink.textContent = '';
}

// Upload-Button Handler
uploadBtn.onclick = async function () {
  if (!selectedFiles.length) return;

  const formData = new FormData();
  selectedFiles.forEach(file => formData.append('files', file));

  // Gültigkeitsdauer aus dem Dropdown auslesen (in Sekunden)
  const expirationSelect = document.getElementById('link-expiration');
  const expirationSeconds = expirationSelect ? expirationSelect.value : '3600'; // default 1 Stunde
  formData.append('expiration', expirationSeconds);

  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (result.downloadLink) {
      downloadUrlLink.href = result.downloadLink;
      downloadUrlLink.textContent = result.downloadLink;

      if (typeof generateQRCode === 'function') {
        generateQRCode(result.downloadLink);
      }

      fileResult.textContent = 'Upload erfolgreich!';
      uploadBtn.style.display = 'none';
      dropzoneText.textContent = 'Datei(en) hochgeladen.';
      selectedFiles = [];
    } else {
      fileResult.textContent = result.error || 'Fehler beim Upload.';
    }
  } catch (err) {
    fileResult.textContent = 'Fehler beim Upload.';
  }
};


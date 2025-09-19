// Elemente der Dropzone mit IDs versehen.
const dropzone = document.getElementById('dropzone');
const dropzoneText = document.getElementById('dropzone-text')
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('fileInput')
const customFileBtn = document.getElementById('customFileBtn');
const fileResult = document.getElementById('file-result');
const allowedExtensions = ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx", "txt"];

// Explorer öffnet sich sobald auf Datei auswählen geklickt wird
customFileBtn.addEventListener('click', openFileExplorer);

// Dateiauswahl per klick über html Button
fileInput.addEventListener('change', handleFileChange);


// Multi-File Support: Array für ausgewählte Dateien
let selectedFiles = [];

// upload btn erst anzeigen, sobald Datei in dropzone
uploadBtn.style.display = 'none';

function openFileExplorer() {
  fileInput.click();
}

function handleFileChange(event) {
  if (event.target.files.length > 0) {
    selectedFiles = Array.from(event.target.files);
    updateUIAfterFileSelect();
  }
}

// Fileextensions Whitelist
function isAllowedFileType(fileName) {
  const fileExtension = fileName.split('.').pop().toLowerCase();
  return allowedExtensions.includes(fileExtension);
}

// Drag and Drop Handler Funktionen
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

// Aktionen auf dropzone erkennen
dropzone.addEventListener('dragover', dragoverHandler);
dropzone.addEventListener('dragleave', dragleaveHandler);
dropzone.addEventListener('drop', dropHandler);


// UI-Aktualisierung nach Dateiauswahl
function updateUIAfterFileSelect() {
  if (!selectedFiles.length) {
    fileResult.textContent = '';
    uploadBtn.style.display = 'none';
    return;
  }
  let allValid = true;
  let messages = [];
  selectedFiles.forEach(file => {
    const fileName = file.name;
    const fileSize = file.size;
    const fileMb = fileSize / 1024 ** 2;
    if (!isAllowedFileType(fileName)) {
      messages.push(`${fileName}: Dateityp nicht erlaubt.`);
      allValid = false;
    } else if (fileMb >= 2) {
      messages.push(`${fileName}: Zu groß (>2MB).`);
      allValid = false;
    } else {
      messages.push(`${fileName} (${fileMb.toFixed(1)} MB) bereit zum Hochladen.`);
    }
  });
  fileResult.textContent = messages.join('\n');
  dropzoneText.textContent = `Ausgewählt: ${selectedFiles.map(f => f.name).join(', ')}`;
  uploadBtn.style.display = allValid ? 'inline-block' : 'none';
}

// Upload-Button Handler für mehrere Dateien
uploadBtn.onclick = async function () {
  if (!selectedFiles.length) return;
  const formData = new FormData();
  selectedFiles.forEach(file => formData.append('files', file));
  try {
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    if (result.downloadLinks) {
      // Zeige alle Links wie den ersten Link im Download-Link-Feld an
      const downloadUrlSpan = document.getElementById('download-url');
      // Für jeden Link einen Button generieren
      const allLinks = '<br>' + result.downloadLinks.map((l, idx) =>
        `<span style="display:inline-block;margin-bottom:4px;">
          <a class="download-link-static" href="${l.link}" target="_blank">${l.link}</a>
          <button class="copy-link-btn" data-link="${l.link}" style="margin-left:8px;">Kopieren</button>
        </span>`
      ).join('<br>');
      downloadUrlSpan.innerHTML = allLinks;
      // Event-Listener für alle Kopieren-Buttons
      document.querySelectorAll('.copy-link-btn').forEach(btn => {
        btn.onclick = function() {
          const link = btn.getAttribute('data-link');
          navigator.clipboard.writeText(link).then(() => {
            btn.textContent = 'Kopiert!';
            setTimeout(() => btn.textContent = 'Kopieren', 3000);
          });
        };
      });
      // QR-Code für den ersten Link
      if (typeof generateQRCode === 'function') {
        generateQRCode(result.downloadLinks[0].link);
      }
    } else {
      fileResult.textContent = result.error || 'Fehler beim Upload.';
    }
  } catch (err) {
    fileResult.textContent = 'Fehler beim Upload.';
  }
};
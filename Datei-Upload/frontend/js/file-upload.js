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


// Grundzustand - keine Datei ausgewählt ist.
let selectedFile = null;

// upload btn erst anzeigen, sobald Datei in dropzone
uploadBtn.style.display = 'none';

function openFileExplorer() {
  fileInput.click();
}

function handleFileChange(event) {
  if (event.target.files.length > 0) {
    selectedFile = event.target.files[0];
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
    selectedFile = files[0];
    updateUIAfterFileSelect(); 
  }
}

// Aktionen auf dropzone erkennen
dropzone.addEventListener('dragover', dragoverHandler);
dropzone.addEventListener('dragleave', dragleaveHandler);
dropzone.addEventListener('drop', dropHandler);

// UI-Aktualisierung nach Dateiauswahl

function updateUIAfterFileSelect() {
  if (!selectedFile) {
    fileResult.textContent = '';
    uploadBtn.style.display = 'none';
    return;
  }
  // Whitelist- und Größenprüfung
  const fileName = selectedFile.name;
  const fileSize = selectedFile.size;
  const fileMb = fileSize / 1024 ** 2;
  if (!isAllowedFileType(fileName)) {
    fileResult.textContent = 'Dateityp nicht erlaubt. Erlaubt: ' + allowedExtensions.join(', ');
    uploadBtn.style.display = 'none';
    return;
  }
  if (fileMb >= 2) {
    fileResult.textContent = 'Bitte wähle eine Datei kleiner als 2MB.';
    uploadBtn.style.display = 'none';
    return;
  }
  fileResult.textContent = 'Datei OK: ' + fileName + ' (' + fileMb.toFixed(1) + ' MB)';
  dropzoneText.textContent = `Ausgewählt: ${selectedFile.name}`;
  uploadBtn.style.display = 'inline-block';
}
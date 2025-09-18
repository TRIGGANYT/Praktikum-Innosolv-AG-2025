// Elemente der Dropzone mit IDs versehen.
const dropzone = document.getElementById('dropzone');
const dropzoneText = document.getElementById('dropzone-text')
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('fileInput')
const customFileBtn = document.getElementById('customFileBtn');

// Explorer öffnet sich sobald auf Datei auswählen geklickt wird
customFileBtn.addEventListener('click', () => {
  fileInput.click();
});

// Dateiauswahl per klick über html Button
fileInput.addEventListener('change', (event) => {
  if (event.target.files.length > 0) {
    selectedFile = event.target.files[0];
    updateUIAfterFileSelect();
  }
});

// Grundzustand - keine Datei ausgewählt ist.
let selectedFile = null;

// upload btn erst anzeigen, sobald Datei in dropzone
uploadBtn.style.display = 'none';


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
  dropzoneText.textContent = `Ausgewählt: ${selectedFile.name}`;
  uploadBtn.style.display = 'inline-block';
}
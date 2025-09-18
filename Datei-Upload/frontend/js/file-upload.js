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

// upload btn soll erst angezeigt werden, sobald sich eine Datei in der dropzone befindet, deshalb ist er versteckt
uploadBtn.style.display = 'none';

// function Datei wird in die Dropzone gezogen

function dragoverHandler(event) {
  event.preventDefault();
  dropzone.classList.add('dragover');
}

function dragleaveHandler(event) {
  dropzone.classList.remove('dragover');
}

function dropHandler(event) {
  event.preventDefault(); // Standardverhalten unterbinden (z. B. Datei öffnen)
  dropzone.classList.remove('dragover');

  const files = event.dataTransfer.files; // die Dateien, die fallen gelassen wurden

  if (files.length > 0) {
    selectedFile = files[0]; // nur die erste Datei verwenden
    updateUIAfterFileSelect(); // eigene Funktion zur UI-Aktualisierung
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
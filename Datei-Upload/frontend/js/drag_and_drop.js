let selectedFile = null;

const dropzone = document.getElementById('dropzone');
const dropText = document.getElementById('dropzone-text');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('fileInput');

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
    dropText.textContent = `Ausgewählt: ${selectedFile.name}`;
    uploadBtn.style.display = 'inline-block';
  }
}

fileInput.addEventListener('change', (event) => {
  if (event.target.files.length > 0) {
    selectedFile = event.target.files[0];
    dropText.textContent = `Ausgewählt: ${selectedFile.name}`;
    uploadBtn.style.display = 'inline-block';
  }
});

dropzone.addEventListener('dragover', dragoverHandler);
dropzone.addEventListener('dragleave', dragleaveHandler);
dropzone.addEventListener('drop', dropHandler);

uploadBtn.addEventListener('click', () => {
  if (!selectedFile) {
    alert("Keine Datei ausgewählt!");
    return;
  }

  const formData = new FormData();
  formData.append('file', selectedFile);

  fetch('/upload', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) throw new Error('Upload fehlgeschlagen');
    return response.json();
  })
  .then(data => {
    alert('Datei erfolgreich hochgeladen!');
    dropText.textContent = 'Datei hinein ziehen oder auswählen';
    uploadBtn.style.display = 'none';
    fileInput.value = '';
    selectedFile = null;
  })
  .catch(err => {
    alert('Fehler beim Hochladen');
    console.error(err);
  });
});

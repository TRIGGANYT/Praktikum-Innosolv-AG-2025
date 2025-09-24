// ==============================
// Element-Referenzen
// ==============================

const dropzone = document.getElementById('dropzone');
const dropzoneText = document.getElementById('dropzone-text');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('fileInput');
const customFileBtn = document.getElementById('customFileBtn');
const fileResult = document.getElementById('file-result');
const allowedExtensions = ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx", "txt"];

const downloadUrlLink = document.getElementById('download-url');
const copyLinkBtn = document.getElementById('copy-link-btn');
const deleteLinkBtn = document.getElementById('delete-link-btn');
const qrcodeBtn = document.getElementById('qrcode-btn');
const activeLinksList = document.getElementById('active-links');

let selectedFiles = [];


// ==============================
// Initial UI-Zustand
// ==============================

uploadBtn.style.display = 'none';
copyLinkBtn.style.display = 'none';
qrcodeBtn.style.display = 'none';


// ==============================
// Event Listener
// ==============================

// Datei auswählen per Klick
customFileBtn.addEventListener('click', openFileExplorer);
fileInput.addEventListener('change', handleFileChange);

// Drag & Drop
dropzone.addEventListener('dragover', dragoverHandler);
dropzone.addEventListener('dragleave', dragleaveHandler);
dropzone.addEventListener('drop', dropHandler);

// Link kopieren
copyLinkBtn.addEventListener('click', copyCurrentDownloadLink);

// Link löschen
deleteLinkBtn.addEventListener('click', deleteCurrentDownloadLink);

// Datei-Upload starten
uploadBtn.onclick = uploadSelectedFiles;

// Aktive Links beim Seitenladen laden
window.addEventListener('DOMContentLoaded', loadActiveLinks);


// ==============================
// Copy / Delete Funktionen
// ==============================

function copyCurrentDownloadLink() {
  if (!downloadUrlLink.href) return;

  navigator.clipboard.writeText(downloadUrlLink.href)
    .then(() => alert('Link kopiert!'))
    .catch(() => alert('Kopieren fehlgeschlagen!'));
}

async function deleteCurrentDownloadLink() {
  const downloadUrl = downloadUrlLink.href;
  if (!downloadUrl) return;

  const confirmed = confirm("Willst du den Download-Link und die Dateien wirklich löschen?");
  if (!confirmed) return;

  try {
    const result = await deleteDownloadLink(downloadUrl);
    if (result.success) {
      alert('Link und Dateien wurden gelöscht.');
      resetUIAfterDelete();
    } else {
      alert('Fehler beim Löschen: ' + result.message);
    }
  } catch (err) {
    alert('Fehler beim Löschen.');
    console.error(err);
  }
}


// ==============================
// Upload-Funktionen
// ==============================

async function uploadSelectedFiles() {
  if (!selectedFiles.length) return;

  const formData = new FormData();
  selectedFiles.forEach(file => formData.append('files', file));

  const expirationSelect = document.getElementById('link-expiration');
  const expirationSeconds = expirationSelect ? expirationSelect.value : '3600';
  formData.append('expiration', expirationSeconds);

  const passwordInput = document.querySelector('input[name="password"]');
  formData.append('password', passwordInput.value);

  try {
    const result = await uploadFiles(formData);

    if (result.downloadLink) {
      updateUIAfterUpload(result.downloadLink);
    } else {
      fileResult.textContent = result.error || 'Fehler beim Upload.';
    }
  } catch (err) {
    fileResult.textContent = 'Fehler beim Upload.';
    console.error(err);
  }
}

async function uploadFiles(formData) {
  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });
  return response.json();
}


// ==============================
// Datei Handling (Input, Drag & Drop)
// ==============================

function openFileExplorer() {
  fileInput.click();
}

function handleFileChange(event) {
  if (event.target.files.length > 0) {
    selectedFiles = Array.from(event.target.files);
    updateUIAfterFileSelect();
  }
}

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


// ==============================
// Datei-Validierung
// ==============================

function isAllowedFileType(fileName) {
  const fileExtension = fileName.split('.').pop().toLowerCase();
  return allowedExtensions.includes(fileExtension);
}

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


// ==============================
// UI-Aktualisierungen
// ==============================

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

function updateUIAfterUpload(downloadLink) {
  downloadUrlLink.href = downloadLink;
  downloadUrlLink.textContent = downloadLink;
  downloadUrlLink.style.display = 'inline-block';

  deleteLinkBtn.style.display = 'inline-block';
  copyLinkBtn.style.display = 'inline-block';
  qrcodeBtn.style.display = 'inline-block';

  if (typeof generateQRCode === 'function') {
    generateQRCode(downloadLink);
  }

  addActiveLinkToList(downloadLink);

  fileResult.textContent = 'Upload erfolgreich!';
  uploadBtn.style.display = 'none';
  dropzoneText.textContent = 'Datei(en) hochgeladen.';
  selectedFiles = [];

  const passwordInput = document.querySelector('input[name="password"]');
  if (passwordInput) {
    passwordInput.value = '';
  }

  setTimeout(() => {
    resetUIAfterDelete();
  }, 3000);
}

function resetUIAfterDelete() {
  fileResult.textContent = '';
  dropzoneText.textContent = 'Datei hinein ziehen oder auswählen';
  selectedFiles = [];
  uploadBtn.style.display = 'none';
  fileInput.value = '';
}


// ==============================
// Aktive Links laden & anzeigen
// ==============================

async function loadActiveLinks() {
  try {
    const res = await fetch('/upload/active-links');
    const data = await res.json();

    if (data.links && Array.isArray(data.links)) {
      data.links.forEach(linkObj => {
        addActiveLinkToList(linkObj.downloadLink);
      });
    }
  } catch (err) {
    console.error('Fehler beim Laden der aktiven Links:', err);
  }
}

async function deleteDownloadLink(url) {
  const response = await fetch('/upload/delete-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });

  return response.json();
}

function addActiveLinkToList(downloadLink) {
  if (!activeLinksList) return;

  const li = document.createElement('li');
  li.style.marginBottom = '8px';

  const a = document.createElement('a');
  a.href = downloadLink;
  a.textContent = downloadLink;
  a.target = '_blank';
  a.className = 'download-link';
  li.appendChild(a);

  // QR-Code
  const qrBtn = document.createElement('button');
  qrBtn.className = 'qr-btn';
  qrBtn.innerHTML = '<i class="fa-solid fa-qrcode"></i>';
  qrBtn.title = 'QR-Code anzeigen';
  qrBtn.style.marginLeft = '12px';
  qrBtn.onclick = () => {
    if (typeof generateQRCode === 'function') {
      generateQRCode(downloadLink);
    }
  };
  li.appendChild(qrBtn);

  // Kopieren
  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
  copyBtn.title = 'Link kopieren';
  copyBtn.style.marginLeft = '8px';
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(downloadLink)
      .then(() => alert('Link kopiert!'))
      .catch(() => alert('Kopieren fehlgeschlagen!'));
  };
  li.appendChild(copyBtn);

  // Löschen
  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn';
  delBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
  delBtn.title = 'Link & Datei(en) löschen';
  delBtn.style.marginLeft = '8px';
  delBtn.onclick = async () => {
    const confirmed = confirm('Willst du den Download-Link und die Dateien wirklich löschen?');
    if (!confirmed) return;

    try {
      const result = await deleteDownloadLink(downloadLink);
      if (result.success) {
        alert('Link und Dateien wurden gelöscht.');
        li.remove();
      } else {
        alert('Fehler beim Löschen: ' + result.message);
      }
    } catch (err) {
      alert('Fehler beim Löschen.');
      console.error(err);
    }
  };
  li.appendChild(delBtn);

  // An Liste anhängen
  activeLinksList.appendChild(li);
}

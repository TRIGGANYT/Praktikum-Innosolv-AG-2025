// Elemente der Dropzone mit IDs versehen.
const dropzone = document.getElementById('dropzone');
const dropzoneText = document.getElementById('dropzone-text');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('fileInput');
const customFileBtn = document.getElementById('customFileBtn');
const fileResult = document.getElementById('file-result');
const allowedExtensions = ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx", "txt"];

// Download-Link Bereich & Copy-Button
const downloadArea = document.getElementById('download-area');
const downloadUrlLink = document.getElementById('download-url');
const copyLinkBtn = document.getElementById('copy-link-btn');
const activeLinksList = document.getElementById('active-links');

// Hilfsfunktion: Link als Listeneintrag mit Icons einfügen
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


  // QR-Code Icon
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

  // Kopieren Icon
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

  // Löschen Icon
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

  activeLinksList.appendChild(li);
}

// Lade alle aktiven Links beim Seitenaufruf
window.addEventListener('DOMContentLoaded', async () => {
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
});

const deleteLinkBtn = document.getElementById('delete-link-btn')
const qrcodeBtn = document.getElementById('qrcode-btn');
let selectedFiles = [];

// Bei start ausgeblendete Buttons
uploadBtn.style.display = 'none';
copyLinkBtn.style.display = 'none';
qrcodeBtn.style.display = 'none';

// Drag & Drop Event-Handler
dropzone.addEventListener('dragover', dragoverHandler);
dropzone.addEventListener('dragleave', dragleaveHandler);
dropzone.addEventListener('drop', dropHandler);

// Öffnet Datei-Explorer beim Klick auf "Datei auswählen"
customFileBtn.addEventListener('click', openFileExplorer);

// Dateiauswahl per Klick
fileInput.addEventListener('change', handleFileChange);

// Kopiert den Download-Link in die Zwischenablage beim Klick auf den copyLinkBtn
copyLinkBtn.addEventListener('click', () => {
  if (!downloadUrlLink.href) return;
  navigator.clipboard.writeText(downloadUrlLink.href)
    .then(() => alert('Link kopiert!'))
    .catch(() => alert('Kopieren fehlgeschlagen!'));
});

// Löscht den Download-Link und die zugehörigen Dateien beim Klick auf das Mülleimer-Icon
deleteLinkBtn.addEventListener('click', async () => {
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
});

// Funktion Datei-Explorer öffnen
function openFileExplorer() {
  fileInput.click();
}

// Drag and Drop Funktionen
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

// Datei-Endungen überprüfen
function isAllowedFileType(fileName) {
  const fileExtension = fileName.split('.').pop().toLowerCase();
  return allowedExtensions.includes(fileExtension);
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

// UI nach Dateiauswahl aktualisieren
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
  
  if (allValid) {
    uploadBtn.style.display = 'inline-block';
  } 
  else {
    uploadBtn.style.display = 'none';
  }

  downloadUrlLink.href = '';
  downloadUrlLink.textContent = '';
}

// Upload-Button Handler

async function uploadFiles(formData) {
  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });
  return response.json();
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

  // Neuen Link als Listeneintrag unter "Aktive Download-Links" anhängen
  if (activeLinksList) {
    const li = document.createElement('li');
    li.style.marginBottom = '8px';
    const a = document.createElement('a');
    a.href = downloadLink;
    a.textContent = downloadLink;
    a.target = '_blank';
    a.className = 'download-link';
    li.appendChild(a);


    // QR-Code Icon
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

    // Kopieren Icon
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

    // Löschen Icon
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

    activeLinksList.appendChild(li);
  }

  fileResult.textContent = 'Upload erfolgreich!';
  uploadBtn.style.display = 'none';
  dropzoneText.textContent = 'Datei(en) hochgeladen.';
  selectedFiles = [];

  // UI nach 3 Sekunden zurücksetzen
  setTimeout(() => {
    resetUIAfterDelete();
  }, 3000);
}

uploadBtn.onclick = async function () {
  if (!selectedFiles.length) return;

  const formData = new FormData();
  selectedFiles.forEach(file => formData.append('files', file));

  const expirationSelect = document.getElementById('link-expiration');
  const expirationSeconds = expirationSelect ? expirationSelect.value : '3600';
  formData.append('expiration', expirationSeconds);

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
};

// Link löschen und UI Reset Funktion
async function deleteDownloadLink(url) {
  const response = await fetch('/upload/delete-file', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url })
  });
  return response.json();
}

function resetUIAfterDelete() {
  fileResult.textContent = '';
  dropzoneText.textContent = 'Datei hinein ziehen oder auswählen';
  selectedFiles = [];
  uploadBtn.style.display = 'none';
  fileInput.value = '';
}



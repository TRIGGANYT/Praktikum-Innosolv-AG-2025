// Zeigt eine Fehlermeldung für Textdateien, wenn Pandoc fehlt oder Konvertierung fehlschlägt
function showTextPreviewNotAvailable() {
  const previewContainer = document.getElementById('vorschau');
  const previewFrame = document.getElementById('pdf-preview-frame');
  const fallback = document.getElementById('pdf-preview-fallback');
  if (!previewContainer || !fallback) return;
  previewFrame.src = '';
  previewContainer.classList.add('visible');
  fallback.classList.add('visible');
  fallback.textContent = 'Für Textdateien ist keine Vorschau möglich.';
  fallback.style.color = '#b00';
  previewContainer.querySelector('h1').textContent = 'Dateivorschau';
  previewContainer.scrollIntoView({ behavior: 'smooth' });
}
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
const copyPasswordBtn = document.getElementById('copy-password-btn');
const folderInput = document.getElementById('folderInput');
const folderLink = document.getElementById('selectFolderLink');

let selectedFiles = [];
let folderName = '';

// ==============================
// Initial UI-Zustand
// ==============================

uploadBtn.classList.add('hidden');
copyLinkBtn.classList.add('hidden');
qrcodeBtn.classList.add('hidden');


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

// Passwort kopieren Button (neben Passwortfeld)
if (copyPasswordBtn) {
  copyPasswordBtn.addEventListener('click', () => {
    const passwordInput = document.querySelector('input[name="password"]');
  });
}

// ==============================
// Copy / Delete Funktionen
// ==============================

function copyCurrentDownloadLink() {
  const downloadUrlLink = document.getElementById('downloadUrlLink');
  const icon = document.getElementById('copyIcon');

  if (!downloadUrlLink || !downloadUrlLink.href) return;

  navigator.clipboard.writeText(downloadUrlLink.href)
    .then(() => {
      // Icon: Kopieren → Haken
      icon.classList.replace('fa-copy', 'fa-check');

      // Nach 4 Sekunden zurück
      setTimeout(() => {
        icon.classList.replace('fa-check', 'fa-copy');
      }, 4000);
    })
    .catch(() => {
      // Optional: Icon rot machen bei Fehler
      icon.style.color = 'red';
      icon.classList.replace('fa-copy', 'fa-xmark');

      setTimeout(() => {
        icon.classList.replace('fa-xmark', 'fa-copy');
        icon.style.color = '';
      }, 4000);
    });
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

function getUploadedFolderName(files) {
  if (!files.length) return null;

  const firstPath = files[0].webkitRelativePath;
  if (firstPath && firstPath.includes('/')) {
    return firstPath.split('/')[0];
  }

  return null;
}

async function uploadSelectedFiles() {
  if (!selectedFiles.length) return;

  const formData = new FormData();
  selectedFiles.forEach(file => formData.append('files', file));

  const expirationSelect = document.getElementById('link-expiration');
  const expirationSeconds = expirationSelect ? expirationSelect.value : '3600';
  formData.append('expiration', expirationSeconds);


  const passwordInput = document.querySelector('input[name="password"]');
  formData.append('password', passwordInput.value);

  // Anzeigename bestimmen
  const displayNameInput = document.querySelector('input[name="displayName"]');
  let displayName = displayNameInput ? displayNameInput.value.trim() : '';
  if (!displayName) {
    if (selectedFiles.length === 1) {
      displayName = selectedFiles[0].name;
    } else if (selectedFiles.length > 1) {
      const folderName = getUploadedFolderName(selectedFiles);

      if (folderName) {
        displayName = folderName;
      }

      else {
        const zipCount = (window.activeLinksList && window.activeLinksList.children)
          ? Array.from(window.activeLinksList.children).filter(li => li.textContent && li.textContent.toLowerCase().includes('zip')).length + 1
          : 1;
        displayName = `zip ${zipCount}`;
      }

      if (!displayName.toLowerCase().endsWith('.zip')) {
        displayName += '.zip';
      }
    }
  }

  else {
    // Wenn Name eingegeben, Dateiendung anhängen
    if (selectedFiles.length === 1) {
      const orig = selectedFiles[0].name;
      const ext = orig.includes('.') ? orig.substring(orig.lastIndexOf('.')) : '';
      if (ext && !displayName.toLowerCase().endsWith(ext.toLowerCase())) {
        displayName += ext;
      }
    }
    else if (selectedFiles.length > 1) {
      if (!displayName.toLowerCase().endsWith('.zip')) {
        displayName += '.zip';
      }
    }
  }
  formData.append('displayName', displayName);

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
    folderName = getUploadedFolderName(selectedFiles);
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
    folderName = getUploadedFolderName(selectedFiles);
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

  return { valid: true/* , message: `${fileName} (${fileMb.toFixed(1)} MB) bereit zum Hochladen.` */ };
}


// ==============================
// UI-Aktualisierungen
// ==============================

function updateUIAfterFileSelect() {
  if (!selectedFiles.length) {
    fileResult.textContent = '';
    uploadBtn.classList.add('hidden');

    const displayNameInput = document.querySelector('input[name="displayName"]');
    if (displayNameInput) {
      displayNameInput.value = '';
    }

    const folderNameDisplay = document.getElementById('folderNameDisplay');
    if (folderNameDisplay) {
      folderNameDisplay.textContent = '';
    }

    return;
  }

  const folderNameDisplay = document.getElementById('folderNameDisplay');
  if (folderNameDisplay) {
    folderNameDisplay.textContent = folderName
      ? `Ordner: ${folderName}`
      : '';
  }

  let allValid = true;
  let messages = [];

  selectedFiles.forEach(file => {
    const { valid, message } = validateFile(file);
    if (!valid) allValid = false;
    messages.push(message);
  });

  fileResult.textContent = messages.join('\n');
  if (folderName) {
    dropzoneText.textContent = `"${folderName}" ist bereit zum Hochladen.`;
  } else {
    const fileNames = selectedFiles.map(f => f.name);
    dropzoneText.textContent = fileNames.length === 1
      ? `${fileNames[0]} ist bereit zum Hochladen.`
      : `${fileNames.join(', ')} sind bereit zum Hochladen.`;
  }

  if (allValid) {
    uploadBtn.classList.remove('hidden');
    uploadBtn.classList.add('inline-block');
  } else {
    uploadBtn.classList.add('hidden');
    uploadBtn.classList.remove('inline-block');
  }

  downloadUrlLink.href = '';
  downloadUrlLink.textContent = '';
}

function updateUIAfterUpload(downloadLink) {
  downloadUrlLink.href = downloadLink;
  downloadUrlLink.textContent = downloadLink;
  downloadUrlLink.classList.add('inline-block');
  deleteLinkBtn.classList.add('inline-block');
  copyLinkBtn.classList.add('inline-block');
  qrcodeBtn.classList.add('inline-block');
  uploadBtn.classList.add('hidden');

  if (typeof generateQRCode === 'function') {
    generateQRCode(downloadLink);
  }

  // Nur das neue Link-Objekt aus /upload/active-links holen und zur Liste hinzufügen
  fetch('/upload/active-links')
    .then(res => res.json())
    .then(data => {
      if (data.links && Array.isArray(data.links)) {
        const found = data.links.find(l => l.downloadLink === downloadLink);
        if (found) addActiveLinkToList(found);
      }
    });

  fileResult.textContent = 'Upload erfolgreich!';
  uploadBtn.classList.add('hidden');
  dropzoneText.textContent = 'Datei(en) hochgeladen.';
  selectedFiles = [];

  const passwordInput = document.querySelector('input[name="password"]');
  if (passwordInput) {
    passwordInput.value = '';
  }
  resetUIAfterDelete();;
}

function resetUIAfterDelete() {
  fileResult.textContent = '';
  dropzoneText.textContent = 'Datei hinein ziehen oder auswählen';
  selectedFiles = [];
  folderName = '';
  uploadBtn.classList.add('hidden');
  uploadBtn.classList.remove('inline-block');
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
        addActiveLinkToList(linkObj); // übergebe das ganze Objekt, nicht nur den Link!
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


// Hilfsfunktion: Hole Passwort für einen Link (aus Backend)
async function fetchPasswordForLink(downloadLink) {
  try {
    const res = await fetch('/upload/active-links');
    const data = await res.json();
    if (data.links && Array.isArray(data.links)) {
      const found = data.links.find(l => l.downloadLink === downloadLink);
      return found && found.password ? found.password : null;
    }
  } catch (e) { }
  return null;
}

function addActiveLinkToList(linkObjOrUrl) {
  if (!activeLinksList) return;

  // Kompatibilität: Akzeptiere alten String oder neues Objekt

  let downloadLink, password, displayName;
  if (typeof linkObjOrUrl === 'string') {
    downloadLink = linkObjOrUrl;
    password = null;
    displayName = null;
  } else {
    downloadLink = linkObjOrUrl.downloadLink;
    password = linkObjOrUrl.password || null;
    displayName = linkObjOrUrl.displayName || null;
  }

  const li = document.createElement('li');
  li.classList.add('mb-8');


  const a = document.createElement('a');
  a.href = '#';
  a.textContent = displayName || downloadLink;
  a.className = 'download-link';
  // Dateiendung bestimmen
  let ext = '';
  if (displayName && displayName.includes('.')) {
    ext = displayName.substring(displayName.lastIndexOf('.')).toLowerCase();
  } else if (downloadLink && downloadLink.includes('.')) {
    ext = downloadLink.substring(downloadLink.lastIndexOf('.')).toLowerCase();
  }
  // Vorschau bei unterstützten Dateitypen
  const officeExts = ['.docx', '.xlsx', '.pptx'];
  const previewExts = ['.pdf', '.txt', '.csv', '.md', '.log'];
  if (officeExts.includes(ext)) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      showOfficePreviewNotAvailable();
    });
    a.title = 'Für Office-Dokumente ist keine Vorschau möglich.';
  } else if (previewExts.includes(ext)) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      showPdfPreview(downloadLink, ext, displayName);
    });
    a.title = 'Vorschau anzeigen';
  } else {
    a.title = 'Keine Vorschau verfügbar';
    a.classList.add('disabled-link');
  }
  // Zeigt eine Meldung an, dass Office-Dokumente nicht als Vorschau unterstützt werden
  function showOfficePreviewNotAvailable() {
    const previewContainer = document.getElementById('vorschau');
    const previewFrame = document.getElementById('pdf-preview-frame');
    const fallback = document.getElementById('pdf-preview-fallback');
    if (!previewContainer || !fallback) return;
    previewFrame.src = '';
    previewContainer.classList.add('visible');
    fallback.classList.add('visible');
    fallback.textContent = 'Für Office-Dokumente ist keine Vorschau möglich.';
    previewContainer.querySelector('h1').textContent = 'Dateivorschau';
    previewContainer.scrollIntoView({ behavior: 'smooth' });
  }
  li.appendChild(a);
  // Zeigt die PDF-Vorschau für Office-Dateien an
  function showPdfPreview(originalUrl, ext, displayName) {
    // PDF-URL ableiten (Backend muss /pdf-preview/:uploadId unterstützen)
    // Annahme: downloadLink enthält /uploads/{uploadId}/{filename} oder /download/{uploadId}
    let uploadId = null;
    if (originalUrl.includes('/uploads/')) {
      const parts = originalUrl.split('/uploads/')[1].split('/');
      uploadId = parts[0];
    } else if (originalUrl.includes('/download/')) {
      const parts = originalUrl.split('/download/')[1].split('/');
      uploadId = parts[0];
    }
    if (!uploadId) {
      showPdfPreviewFallback();
      return;
    }
    const pdfUrl = `/upload/pdf-preview/${uploadId}`;

    const previewContainer = document.getElementById('vorschau');
    const previewFrame = document.getElementById('pdf-preview-frame');
    const fallback = document.getElementById('pdf-preview-fallback');
    if (!previewContainer || !previewFrame) return;

    // HEAD-Request prüfen, ob PDF generiert werden konnte (z.B. Pandoc-Fehler)
    fetch(pdfUrl, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          if (["txt", "csv", "md", "log"].includes(ext)) {
            showTextPreviewNotAvailable();
          } else {
            showPdfPreviewFallback();
          }
          return;
        }
        previewFrame.src = pdfUrl;
        previewContainer.classList.add('visible');
        fallback.classList.remove('visible');
        previewContainer.querySelector('h1').textContent = `Vorschau: ${displayName || 'Datei'}`;
        previewContainer.scrollIntoView({ behavior: 'smooth' });
      })
      .catch(() => {
        if (["txt", "csv", "md", "log"].includes(ext)) {
          showTextPreviewNotAvailable();
        } else {
          showPdfPreviewFallback();
        }
      });
  }

  function showPdfPreviewFallback() {
    const previewContainer = document.getElementById('vorschau');
    const fallback = document.getElementById('pdf-preview-fallback');
    if (previewContainer && fallback) {
      previewContainer.classList.add('visible');
      fallback.classList.add('visible');
    }
  }

  // Lock-Icon (nur wenn Passwort gesetzt)
  if (password) {
    const lockBtn = document.createElement('button');
    lockBtn.className = 'password-btn';
    lockBtn.classList.add('ml-8');
    lockBtn.innerHTML = '<i class="fa-solid fa-lock"></i>';
    lockBtn.title = 'Passwort kopieren';
    lockBtn.onclick = () => {
      const icon = lockBtn.querySelector('i');
      if (!icon) return;

      navigator.clipboard.writeText(password)
        .then(() => {
          icon.classList.replace('fa-lock', 'fa-check');
          icon.style.color = '#75bf73'; // Grün für Erfolg

          setTimeout(() => {
            icon.classList.replace('fa-check', 'fa-lock');
            icon.style.color = '';
          }, 4000);
        })
        .catch(() => {
          icon.classList.replace('fa-lock', 'fa-xmark');
          icon.style.color = '#803425'; // Rot für Fehler

          setTimeout(() => {
            icon.classList.replace('fa-xmark', 'fa-lock');
            icon.style.color = '';
          }, 4000);
        });
    };

    lockBtn.disabled = false;
    lockBtn.style.opacity = '1'; // Optional: kann entfernt werden, falls nicht benötigt
    li.appendChild(lockBtn);
  }

  // QR-Code
  const qrBtn = document.createElement('button');
  qrBtn.className = 'qr-btn';
  qrBtn.innerHTML = '<i class="fa-solid fa-qrcode"></i>';
  qrBtn.title = 'QR-Code anzeigen';
  qrBtn.classList.add('ml-12');
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
  copyBtn.classList.add('ml-8');

  copyBtn.onclick = () => {
    const icon = copyBtn.querySelector('i');
    if (!icon) return;

    navigator.clipboard.writeText(downloadLink)
      .then(() => {
        icon.classList.replace('fa-regular', 'fa-solid');
        icon.classList.replace('fa-copy', 'fa-check');

        icon.style.color = '#75bf73';

        setTimeout(() => {
          icon.classList.replace('fa-solid', 'fa-regular');
          icon.classList.replace('fa-check', 'fa-copy');

          icon.style.color = '';
        }, 4000);
      })
      .catch(() => {
        icon.classList.replace('fa-copy', 'fa-xmark');
        icon.style.color = '#803425';

        setTimeout(() => {
          icon.classList.replace('fa-xmark', 'fa-copy');
          icon.style.color = '';
        }, 4000);
      });
  };


  li.appendChild(copyBtn);

  // Löschen
  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn';
  delBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
  delBtn.title = 'Link & Datei(en) löschen';
  delBtn.classList.add('ml-8');
  const modal = document.getElementById('delete-confirm-modal');
  const confirmBtn = document.getElementById('confirm-delete');
  const cancelBtn = document.getElementById('cancel-delete');

  delBtn.onclick = () => {
    modal.classList.remove('hidden');

    confirmBtn.onclick = async () => {
      modal.classList.add('hidden');
      try {
        const result = await deleteDownloadLink(downloadLink);
        if (result.success) {
          li.remove();
        } else {
          alert('Fehler beim Löschen: ' + result.message);
        }
      } catch (err) {
        alert('Fehler beim Löschen.');
      }
    };

    cancelBtn.onclick = () => {
      modal.classList.add('hidden');
    };
  };

  li.appendChild(delBtn);

  // An Liste anhängen
  activeLinksList.appendChild(li);
}

// Klick auf den Link öffnet Ordner-Auswahl
folderLink.addEventListener('click', function (e) {
  e.preventDefault();
  folderInput.click();
});

// Wenn Ordner ausgewählt wurde
folderInput.addEventListener('change', function (event) {
  if (event.target.files.length > 0) {
    selectedFiles = Array.from(event.target.files);
    folderName = getUploadedFolderName(selectedFiles);
    updateUIAfterFileSelect();
  }
});

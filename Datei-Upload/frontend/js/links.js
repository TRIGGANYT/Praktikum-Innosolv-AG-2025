// links.js
import { showPdfPreview, showOfficePreviewNotAvailable } from './preview.js';
import { resetUIAfterDelete } from './ui.js';

// ==============================
// Copy / Delete Funktionen
// ==============================

export function copyCurrentDownloadLink() {
  const downloadUrlLink = document.getElementById('downloadUrlLink');
  const icon = document.getElementById('copyIcon');

  if (!downloadUrlLink || !downloadUrlLink.href) return;

  navigator.clipboard.writeText(downloadUrlLink.href)
    .then(() => {
      icon.classList.replace('fa-copy', 'fa-check');
      setTimeout(() => {
        icon.classList.replace('fa-check', 'fa-copy');
      }, 4000);
    })
    .catch(() => {
      icon.style.color = 'red';
      icon.classList.replace('fa-copy', 'fa-xmark');
      setTimeout(() => {
        icon.classList.replace('fa-xmark', 'fa-copy');
        icon.style.color = '';
      }, 4000);
    });
}

export async function deleteCurrentDownloadLink() {
  const downloadUrl = document.getElementById('download-url').href;
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
// Aktive Links laden & anzeigen
// ==============================

export async function loadActiveLinks() {
  try {
    const res = await fetch('/upload/active-links');
    const data = await res.json();

    if (data.links && Array.isArray(data.links)) {
      data.links.forEach(linkObj => {
        addActiveLinkToList(linkObj);
      });
    }
  } catch (err) {
    console.error('Fehler beim Laden der aktiven Links:', err);
  }
}

export async function deleteDownloadLink(url) {
  const response = await fetch('/upload/delete-file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  return response.json();
}

// Hilfsfunktion: Hole Passwort für einen Link (aus Backend)
export async function fetchPasswordForLink(downloadLink) {
  try {
    const res = await fetch('/upload/active-links');
    const data = await res.json();
    if (data.links && Array.isArray(data.links)) {
      const found = data.links.find(l => l.downloadLink === downloadLink);
      return found && found.password ? found.password : null;
    }
  } catch (e) {}
  return null;
}

// ==============================
// Link in Liste einfügen
// ==============================

export function addActiveLinkToList(linkObjOrUrl) {
  const activeLinksList = document.getElementById('active-links');
  if (!activeLinksList) return;

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

  // Vorschau-Handler
  const officeExts = ['.docx', '.xlsx', '.pptx'];
  const previewExts = ['.pdf', '.txt', '.csv', '.md', '.log'];

  if (officeExts.includes(ext)) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (typeof showOfficePreviewNotAvailable === 'function') {
        showOfficePreviewNotAvailable();
      }
    });
    a.title = 'Für Office-Dokumente ist keine Vorschau möglich.';
  } else if (previewExts.includes(ext)) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (typeof showPdfPreview === 'function') {
        showPdfPreview(downloadLink, ext, displayName);
      }
    });
    a.title = 'Vorschau anzeigen';
  } else {
    a.title = 'Keine Vorschau verfügbar';
    a.classList.add('disabled-link');
  }

  li.appendChild(a);

  // Passwort-Kopieren Button
  if (password) {
    const lockBtn = document.createElement('button');
    lockBtn.className = 'password-btn ml-8';
    lockBtn.innerHTML = '<i class="fa-solid fa-lock"></i>';
    lockBtn.title = 'Passwort kopieren';
    lockBtn.onclick = () => {
      const icon = lockBtn.querySelector('i');
      if (!icon) return;

      navigator.clipboard.writeText(password)
        .then(() => {
          icon.classList.replace('fa-lock', 'fa-check');
          icon.style.color = '#75bf73';
          setTimeout(() => {
            icon.classList.replace('fa-check', 'fa-lock');
            icon.style.color = '';
          }, 4000);
        })
        .catch(() => {
          icon.classList.replace('fa-lock', 'fa-xmark');
          icon.style.color = '#803425';
          setTimeout(() => {
            icon.classList.replace('fa-xmark', 'fa-lock');
            icon.style.color = '';
          }, 4000);
        });
    };
    li.appendChild(lockBtn);
  }

  // QR-Code Button
  const qrBtn = document.createElement('button');
  qrBtn.className = 'qr-btn ml-12';
  qrBtn.innerHTML = '<i class="fa-solid fa-qrcode"></i>';
  qrBtn.title = 'QR-Code anzeigen';
  qrBtn.onclick = () => {
    if (typeof generateQRCode === 'function') {
      generateQRCode(downloadLink);
    }
  };
  li.appendChild(qrBtn);

  // Kopieren Button
  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn ml-8';
  copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
  copyBtn.title = 'Link kopieren';
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

  // Löschen Button
  const delBtn = document.createElement('button');
  delBtn.className = 'delete-btn ml-8';
  delBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
  delBtn.title = 'Link & Datei(en) löschen';

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

  activeLinksList.appendChild(li);
}

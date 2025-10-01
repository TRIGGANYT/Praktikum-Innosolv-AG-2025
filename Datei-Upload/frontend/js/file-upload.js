// file-upload.js (Einstiegspunkt)

import { openFileExplorer, handleFileChange, dragoverHandler, dragleaveHandler, dropHandler } from './dragdrop.js';
import { uploadSelectedFiles } from './upload.js';
import { copyCurrentDownloadLink, deleteCurrentDownloadLink, loadActiveLinks } from './links.js';

// ==============================
// Element-Referenzen
// ==============================
const dropzone = document.getElementById('dropzone');
const customFileBtn = document.getElementById('customFileBtn');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('upload-btn');
const copyLinkBtn = document.getElementById('copy-link-btn');
const deleteLinkBtn = document.getElementById('delete-link-btn');
const copyPasswordBtn = document.getElementById('copy-password-btn');

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

// Passwort kopieren (neben Passwortfeld, falls vorhanden)
if (copyPasswordBtn) {
  copyPasswordBtn.addEventListener('click', () => {
    const passwordInput = document.querySelector('input[name="password"]');
    if (passwordInput) {
      navigator.clipboard.writeText(passwordInput.value);
    }
  });
}

// ==============================
// Vorschau Vollbild Umschalter
// ==============================

document.addEventListener('DOMContentLoaded', () => {
  const fullscreenBtn = document.getElementById('fullscreen-toggle');
  const vorschauContainer = document.getElementById('vorschau');
  if (!fullscreenBtn || !vorschauContainer) return;

  const icon = fullscreenBtn.querySelector('i');
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      vorschauContainer.requestFullscreen()
        .then(() => {
          icon.classList.replace('fa-expand', 'fa-compress');
          fullscreenBtn.title = 'Vollbild beenden';
        })
        .catch(err => console.error('Vollbild-Fehler:', err));
    } else {
      document.exitFullscreen()
        .then(() => {
          icon.classList.replace('fa-compress', 'fa-expand');
          fullscreenBtn.title = 'Vollbild anzeigen';
        });
    }
  });

  // ESC: Icon zurücksetzen
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      icon.classList.replace('fa-compress', 'fa-expand');
      fullscreenBtn.title = 'Vollbild anzeigen';
    }
  });
});

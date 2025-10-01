// dragdrop.js

import { setSelectedFiles, setFolderName, updateUIAfterFileSelect } from './ui.js';
import { getUploadedFolderName } from './upload.js';
import { validateFile } from './validation.js';

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const folderInput = document.getElementById('folderInput');
const folderLink = document.getElementById('selectFolderLink');

export function openFileExplorer() {
  fileInput.click();
}

export function handleFileChange(event) {
  if (event.target.files.length > 0) {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    setFolderName(getUploadedFolderName(files));
    updateUIAfterFileSelect(validateFile);
  }
}

export function dragoverHandler(event) {
  event.preventDefault();
  dropzone.classList.add('dragover');
}

export function dragleaveHandler(event) {
  dropzone.classList.remove('dragover');
}

export function dropHandler(event) {
  event.preventDefault();
  dropzone.classList.remove('dragover');

  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const fileArray = Array.from(files);
    setSelectedFiles(fileArray);
    setFolderName(getUploadedFolderName(fileArray));
    updateUIAfterFileSelect(validateFile);
  }
}

// ==============================
// Ordner-Auswahl
// ==============================

folderLink.addEventListener('click', function (e) {
  e.preventDefault();
  folderInput.click();
});

folderInput.addEventListener('change', function (event) {
  if (event.target.files.length > 0) {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    setFolderName(getUploadedFolderName(files));
    updateUIAfterFileSelect(validateFile);
  }
});

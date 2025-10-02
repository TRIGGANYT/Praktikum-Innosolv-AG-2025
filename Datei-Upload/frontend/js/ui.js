// ui.js

let selectedFiles = [];
let folderName = '';

export function setSelectedFiles(files) {
  selectedFiles = files;
}
export function getSelectedFiles() {
  return selectedFiles;
}
export function setFolderName(name) {
  folderName = name;
}
export function getFolderName() {
  return folderName;
}

const fileResult = document.getElementById('file-result');
const uploadBtn = document.getElementById('upload-btn');
const dropzoneText = document.getElementById('dropzone-text');
const downloadUrlLink = document.getElementById('download-url');
const deleteLinkBtn = document.getElementById('delete-link-btn');
const copyLinkBtn = document.getElementById('copy-link-btn');
const qrcodeBtn = document.getElementById('qrcode-btn');
const fileInput = document.getElementById('fileInput');

export function updateUIAfterFileSelect(validateFile) {
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
    folderNameDisplay.textContent = folderName ? `Ordner: ${folderName}` : '';
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

export function updateUIAfterUpload(downloadLink) {
  downloadUrlLink.href = downloadLink;
  downloadUrlLink.textContent = downloadLink;
  downloadUrlLink.classList.add('inline-block');
  deleteLinkBtn.classList.add('inline-block');
  copyLinkBtn.classList.add('inline-block');
  qrcodeBtn.classList.add('inline-block');
  uploadBtn.classList.add('hidden');

  const passwordInput = document.querySelector('input[name="password"]');
  const copyPasswordBtn = document.getElementById('password-btn');
  if (passwordInput && passwordInput.value && copyPasswordBtn) {
    copyPasswordBtn.classList.remove('hidden');
    copyPasswordBtn.classList.add('inline-block');
  } else if (copyPasswordBtn) {
    copyPasswordBtn.classList.add('hidden');
  }

  if (typeof generateQRCode === 'function') {
    generateQRCode(downloadLink);
  }

  fileResult.textContent = 'Upload erfolgreich!';
  uploadBtn.classList.add('hidden');
  dropzoneText.textContent = 'Datei(en) hochgeladen.';
  selectedFiles = [];

  if (passwordInput) {
    passwordInput.value = '';
  }
    window.location.reload();
}

export function resetUIAfterDelete() {
  fileResult.textContent = '';
  dropzoneText.textContent = 'Datei hinein ziehen oder auswählen';
  selectedFiles = [];
  folderName = '';
  uploadBtn.classList.add('hidden');
  uploadBtn.classList.remove('inline-block');
  fileInput.value = '';

  const copyPasswordBtn = document.getElementById('password-btn');
  if (copyPasswordBtn) {
    copyPasswordBtn.classList.add('hidden');
    copyPasswordBtn.classList.remove('inline-block');
  }
}

// upload.js

import { updateUIAfterUpload } from './ui.js';
import { getSelectedFiles, setSelectedFiles, getFolderName } from './ui.js';
import { addActiveLinkToList } from './links.js';

export function getUploadedFolderName(files) {
  if (!files.length) return null;

  const firstPath = files[0].webkitRelativePath;
  if (firstPath && firstPath.includes('/')) {
    return firstPath.split('/')[0];
  }
  return null;
}

export async function uploadSelectedFiles() {
  const selectedFiles = getSelectedFiles();
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
      const folderName = getFolderName();
      if (folderName) {
        displayName = folderName;
      } else {
        const activeLinksList = window.activeLinksList;
        const zipCount = (activeLinksList && activeLinksList.children)
          ? Array.from(activeLinksList.children)
              .filter(li => li.textContent && li.textContent.toLowerCase().includes('zip')).length + 1
          : 1;
        displayName = `zip ${zipCount}`;
      }

      if (!displayName.toLowerCase().endsWith('.zip')) {
        displayName += '.zip';
      }
    }
  } else {
    // Wenn Name eingegeben, ggf. Dateiendung anpassen
    if (selectedFiles.length === 1) {
      const orig = selectedFiles[0].name;
      const ext = orig.includes('.') ? orig.substring(orig.lastIndexOf('.')) : '';
      if (ext && !displayName.toLowerCase().endsWith(ext.toLowerCase())) {
        displayName += ext;
      }
    } else if (selectedFiles.length > 1) {
      if (!displayName.toLowerCase().endsWith('.zip')) {
        displayName += '.zip';
      }
    }
  }

  formData.append('displayName', displayName);

  try {
    const result = await uploadFiles(formData);

    if (result.downloadLink) {
      // UI aktualisieren
      updateUIAfterUpload(result.downloadLink);

      // Neuen Link sofort in Liste einfügen
      addActiveLinkToList({
        downloadLink: result.downloadLink,
        displayName: displayName,
        password: passwordInput.value || null
      });
    } else {
      document.getElementById('file-result').textContent =
        result.error || 'Fehler beim Upload.';
    }
  } catch (err) {
    document.getElementById('file-result').textContent = 'Fehler beim Upload.';
    console.error(err);
  }
}

export async function uploadFiles(formData) {
  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });
  return response.json();
}

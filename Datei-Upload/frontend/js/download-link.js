const copyLinkBtn = document.getElementById('copy-link-btn');

// Event Listener nur hinzufügen, wenn Button existiert
if (copyLinkBtn) {
  copyLinkBtn.addEventListener('click', handleCopyLinkClick);
}

// Dateiendung extrahieren. split trennt den Dateinamen am Punkt und pop gibt den letzten Teil zurück
function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

function onCopySuccess() {
    alert('Der Downloadlink wurde in die Zwischenablage kopiert.');
}

function onCopyError(err) {
    console.error('Fehler beim Kopieren: ', err);
    alert('Kopieren fehlgeschlagen.');
}

function handleCopyLinkClick() {
  const linkElement = document.getElementById('download-url');
  if (!linkElement) {
    alert('Download-Link Element nicht gefunden.');
    return;
  }

  const linkText = linkElement.textContent.trim();

  if (!linkText || linkText === 'Hier erscheint Ihr Download-Link') {
    alert("Sie haben noch keine Datei hochgeladen.");
    return;
  }

  navigator.clipboard.writeText(linkText)
    .then(onCopySuccess)
    .catch(onCopyError);
}


const copyLinkBtn = document.getElementById('copy-link-btn');

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
    const linkText = document.getElementById('download-url').textContent;
    
    if (!linkText || linkText === 'Hier erscheint Ihr Download-Link') {
        alert("Sie haben noch keine Datei hochgeladen.");
        return;
    }

    navigator.clipboard.writeText(linkText)
        .then(onCopySuccess)
        .catch(onCopyError);
}

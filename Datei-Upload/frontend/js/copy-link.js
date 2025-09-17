// Dateiendung extrahieren. split trennt den Dateinamen am Punkt und pop gibt den letzten Teil zurück

function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

// GUID generieren

function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Link zusammensetzen aus GUID und Dateiendung
function showDownloadLink() {

    const extension = getFileExtension(selectedFile.name);

    const guid = generateGUID();

    const downloadURL = `http://localhost:3000/files/${guid}.${extension}`;

    document.getElementById('download-url').textContent = downloadURL;
}

// Downloadlink auf Button-Klick anzeigen

uploadBtn.addEventListener('click', () => {
    showDownloadLink(); // Ruft deine Funktion auf
});


// Den generierten Link mit dem copy-link-btn verknüpfen

const copyLinkBtn = document.getElementById('copy-link-btn');

copyLinkBtn.addEventListener('click', () => {
    const linkText = document.getElementById('download-url').textContent;

    if (!linkText || linkText === 'Hier erscheint Ihr Download-Link') {
        alert("Sie haben noch keine Datei hochgeladen.");
        return;
    }

    navigator.clipboard.writeText(linkText).then(() => {
        alert('Der Downloadlink wurde in die Zwischenablage kopiert.');
    })
        .catch(err => {
            console.error('Fehler beim Kopieren: ', err);
            alert('Kopieren fehlgeschlagen.');
        });
});
const copyLinkBtn = document.getElementById('copy-link-btn');

// Downloadlink anzeigen, sobald Datei hochladen geklickt wird
uploadBtn.addEventListener('click', handleUploadClick);

// Auf Link kopieren klicken --> Link in die Zwischenablage kopiert
copyLinkBtn.addEventListener('click', handleCopyLinkClick);

// Dateiendung extrahieren. split trennt den Dateinamen am Punkt und pop gibt den letzten Teil zurück
function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

async function handleUploadClick() {
    if (!selectedFile) {
        alert("Bitte zuerst eine Datei auswählen.");
        return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile); // "file" muss zum Backend passen

    try {
        const response = await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (data.downloadLink) {
            // Link anzeigen
            document.getElementById('download-url').textContent = data.downloadLink;

            // QR-Code generieren
            generateQRCode(data.downloadLink);
        } else if (data.error) {
            alert("Fehler beim Hochladen: " + data.error);
        }
    } catch (error) {
        console.error("Upload fehlgeschlagen:", error);
        alert("Upload fehlgeschlagen.");
    }
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


/* GUID generieren
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

    generateQRCode(downloadURL);
} */

// auf Klick auf Upload-Button --> Link anzeigen // bei klick auch datei hochladen in backend/ uploads



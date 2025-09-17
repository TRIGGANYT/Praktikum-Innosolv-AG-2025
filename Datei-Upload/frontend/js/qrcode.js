const qrBox = document.getElementById('qr-box');
const qrCodeBtn = document.getElementById('qrcode-btn');

let qrCodeInstance = null;

function generateQRCode(text) {
    qrBox.innerHTML = ''; // Vorherigen QR-Code entfernen

    qrCodeOnstance = new QRCode(qrBox, {
        text: text,
        width:200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// QR-Code Button Event Listener
qrCodeBtn.addEventListener('click', () => {
    const linkText = document.getElementById('download-url').textContent;
    if (!linkText || linkText === 'Hier erscheint Ihr Download-Link') {
        alert("Bitte laden sie zuerst ihre Datei hoch, um den QR-Code zu generieren.");
        return;
    }

    generateQRCode(linkText);

});
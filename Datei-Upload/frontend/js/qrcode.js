const qrBox = document.getElementById('qr-box');

let qrCodeInstance = null;

// Funktion zum Generieren des QR-Codes
function generateQRCode(text) {
    if (!text) return;
    qrBox.innerHTML = '';
    qrBox.style.display = 'flex';
    qrCodeInstance = new QRCode(qrBox, {
        text: text,
        width:251,
        height: 251,
        colorDark: "#000000",
        colorLight: "#D4D4CA",
        correctLevel: QRCode.CorrectLevel.H
    });
}


const qrBox = document.getElementById('qr-box');

let qrCodeInstance = null;

// Funktion zum Generieren des QR-Codes
function generateQRCode(text) {
    if (!text) return;
    qrBox.innerHTML = '';
    qrBox.style.display = 'flex';
    qrCodeInstance = new QRCode(qrBox, {
        text: text,
        width:250,
        height: 250,
        colorDark: "#000000",
        colorLight: "#E5E5E5",
        correctLevel: QRCode.CorrectLevel.H
    });
}


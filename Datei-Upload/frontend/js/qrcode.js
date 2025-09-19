const qrBox = document.getElementById('qr-box');

let qrCodeInstance = null;

// Funktion zum Generieren des QR-Codes
function generateQRCode(text) {
    if (!text) return;
    qrBox.innerHTML = '';

    qrCodeInstance = new QRCode(qrBox, {
        text: text,
        width:200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}


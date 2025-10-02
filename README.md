# Datei-Upload & QR-Sharing

Eine einfache Webanwendung zum schnellen Teilen von Dateien zwischen Geräten.  
Dateien können per **Drag & Drop** oder Dateiauswahl hochgeladen werden.  
Nach dem Upload wird ein **Download-Link** und ein **QR-Code** generiert.

---

## Funktionen
- Datei-Upload per Drag & Drop oder Dateiauswahl
- Automatische Generierung eines Download-Links mit zufälliger GUID
- QR-Code zum Download-Link
- Whitelist für Dateiendungen
- Begrenzung der Dateigrösse
- Automatische Löschung nach bestimmter Zeit (mit MongoDB TTL)
- Passwortgeschützte Downloads (optional)
- Mehrfach-Upload → automatische ZIP-Bündelung
- Verzeichnis-Upload
- Vollbild-Dateivorschau für PDFs
- Individuelle Anzeigenamen für Dateien
- Responsive Design

---

## Technologie-Stack
**Frontend**
- HTML5, CSS3 (Grid & Flexbox)
- JavaScript (Drag & Drop, Filepicker, Upload, QRCode.js)
- Icons (FontAwesome)

**Backend**
- Node.js mit Express.js
- Multer (File-Upload)
- MongoDB Atlas (Cloud-Datenbank)
- Nodemon (Entwicklung)
- EJS (Passwortseite)

**Sicherheit**
- GUID-basierte Dateinamen
- HTTPS (lokal mit selbst signiertem Zertifikat)

---

## Installation & Setup

### 1. Repository klonen

git clone <repository-url>
cd datei-upload-qr

### 2. Abhängigkeiten installieren
npm install

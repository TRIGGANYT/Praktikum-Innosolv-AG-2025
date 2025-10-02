# File Upload & QR-Sharing

A simple web application for quickly sharing files between devices.  
Files can be uploaded via **Drag & Drop** or file selection.  
After the upload, a **download link** and a **QR code** are generated.

---

## Features
- File upload via Drag & Drop or file selection
- Automatic generation of a download link with a random GUID
- QR code for the download link
- Whitelist for allowed file extensions
- File size limitation
- Automatic deletion after a specified time (with MongoDB TTL)
- Password-protected downloads (optional)
- Multi-file upload → automatic ZIP bundling
- Directory upload
- Fullscreen file preview for PDFs
- Custom display names for files
- Responsive design

---

## Technology Stack
**Frontend**
- HTML5, CSS3 (Grid & Flexbox)
- JavaScript (Drag & Drop, Filepicker, Upload, QRCode.js)
- Icons (FontAwesome)

**Backend**
- Node.js with Express.js
- Multer (file upload)
- MongoDB Atlas (cloud database)
- Nodemon (development)
- EJS (password page)

**Security**
- GUID-based filenames
- HTTPS (local with self-signed certificate)

---

## Installation & Setup

### 1. Clone repository
```bash
git clone <repository-url>
cd file-upload-qr
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```

### 4. Start production server
```bash
npm start
```

---

## Project Structure
```
backend/
 ├── routes/          # API routes (upload, download)
 ├── utils/           # Helper functions (e.g. ZIP handling)
 ├── views/           # EJS templates (e.g. password page)
 ├── cert/            # SSL certificates (local)
 ├── uploads/         # Uploaded files
 ├── zips/            # Generated ZIP files
 ├── server.js        # Main server
 └── db.js            # Database connection

frontend/
 ├── index.html
 ├── js/              # JavaScript modules (dragdrop.js, preview.js, etc.)
 ├── style/           # CSS (responsive breakpoints)
 └── assets/          # Images, icons, fonts
```

---

## Usage
1. Upload a file (via Drag & Drop or file selection).  
2. The download link will be displayed and can be copied.  
3. Scan the QR code to open the file on another device.  
4. Optional: enable password protection or automatic deletion.  

---

## ToDo / Extensions
- Upload history for logged-in users
- Password-protected ZIP bundling
- Admin interface for file management

---

## License
This project was developed during an internship at **innosolv AG**.
License: Unauthorized copying, modification, or distribution of this project, via any medium, is strictly prohibited.

// validation.js

const allowedExtensions = ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx", "txt", "pptx", "odt", "rtf", "ods", "csv", "ppt", "odp", "zip"];

export function isAllowedFileType(fileName) {
  const fileExtension = fileName.split('.').pop().toLowerCase();
  return allowedExtensions.includes(fileExtension);
}

export function validateFile(file) {
  const fileName = file.name;
  const fileSize = file.size;
  const fileMb = fileSize / 1024 ** 2;

  if (!isAllowedFileType(fileName)) {
    return { valid: false, message: `${fileName}: Dateityp nicht erlaubt.` };
  }
  if (fileMb >= 50) {
    return { valid: false, message: `${fileName}: Zu gross. Wählen Sie eine Datei kleiner als 50MB.` };
  }

  return { valid: true, };
}

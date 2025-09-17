// Dateiendung extrahieren. split trennt den Dateinamen am Punkt und pop gibt den letzten Teil zurück

function getFileExtension(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
}



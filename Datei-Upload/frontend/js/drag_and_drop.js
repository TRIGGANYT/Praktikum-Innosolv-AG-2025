// Grundzustand ist, das keine Datei ausgewählt ist.

let selectedFile = null;

// Elemente der Dropzone mit IDs versehen.

const dropzone = document.getElementById('dropzone');
const dropzoneText = document.getElementById('dropzone-text')
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input')

// upload btn soll erst angezeigt werden, sobald sich eine Datei in der dropzone befindet, deshalb ist er versteckt
uploadBtn.style.display = 'none';


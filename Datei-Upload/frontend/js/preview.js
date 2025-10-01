// preview.js

export function showTextPreviewNotAvailable() {
  const previewContainer = document.getElementById('vorschau');
  const previewFrame = document.getElementById('pdf-preview-frame');
  const fallback = document.getElementById('pdf-preview-fallback');
  if (!previewContainer || !fallback) return;

  previewFrame.src = '';
  previewContainer.classList.add('visible');
  fallback.classList.add('visible');
  fallback.textContent = 'Für Textdateien ist keine Vorschau möglich.';
  fallback.style.color = '#b00';
  previewContainer.querySelector('h1').textContent = 'Dateivorschau';
  previewContainer.scrollIntoView({ behavior: 'smooth' });
}

export function showOfficePreviewNotAvailable() {
  const previewContainer = document.getElementById('vorschau');
  const previewFrame = document.getElementById('pdf-preview-frame');
  const fallback = document.getElementById('pdf-preview-fallback');
  if (!previewContainer || !fallback) return;

  previewFrame.src = '';
  previewContainer.classList.add('visible');
  fallback.classList.add('visible');
  fallback.textContent = 'Für Office-Dokumente ist keine Vorschau möglich.';
  previewContainer.querySelector('h1').textContent = 'Dateivorschau';
  previewContainer.scrollIntoView({ behavior: 'smooth' });
}

export function showPdfPreview(originalUrl, ext, displayName) {
  let uploadId = null;

  if (originalUrl.includes('/uploads/')) {
    const parts = originalUrl.split('/uploads/')[1].split('/');
    uploadId = parts[0];
  } else if (originalUrl.includes('/download/')) {
    const parts = originalUrl.split('/download/')[1].split('/');
    uploadId = parts[0];
  }

  if (!uploadId) {
    showPdfPreviewFallback();
    return;
  }

  const pdfUrl = `/upload/pdf-preview/${uploadId}`;
  const previewContainer = document.getElementById('vorschau');
  const previewFrame = document.getElementById('pdf-preview-frame');
  const fallback = document.getElementById('pdf-preview-fallback');

  if (!previewContainer || !previewFrame) return;

  fetch(pdfUrl, { method: 'HEAD' })
    .then(response => {
      if (!response.ok) {
        if (["txt", "csv", "md", "log"].includes(ext)) {
          showTextPreviewNotAvailable();
        } else {
          showPdfPreviewFallback();
        }
        return;
      }
      previewFrame.src = pdfUrl;
      previewContainer.classList.add('visible');
      fallback.classList.remove('visible');
      previewContainer.querySelector('h1').textContent = `Vorschau: ${displayName || 'Datei'}`;
      previewContainer.scrollIntoView({ behavior: 'smooth' });
    })
    .catch(() => {
      if (["txt", "csv", "md", "log"].includes(ext)) {
        showTextPreviewNotAvailable();
      } else {
        showPdfPreviewFallback();
      }
    });
}

export function showPdfPreviewFallback() {
  const previewContainer = document.getElementById('vorschau');
  const fallback = document.getElementById('pdf-preview-fallback');
  if (previewContainer && fallback) {
    previewContainer.classList.add('visible');
    fallback.classList.add('visible');
  }
}

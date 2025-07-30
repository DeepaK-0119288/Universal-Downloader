import React, { useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const downloadFile = async () => {
    setProgress(0);
    setStatus('Downloading...');

    try {
      const response = await fetch('http://localhost:4000/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error('Download failed');

      const contentDisposition = response.headers.get('content-disposition');
      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : null;

      const reader = response.body.getReader();
      const chunks = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loaded += value.length;

        if (total) {
          setProgress(Math.floor((loaded / total) * 100));
        }
      }

      if (total) {
        setProgress(100);
      }

      const blob = new Blob(chunks);
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = downloadUrl;

      let fileName = 'downloaded_file';
      if (contentDisposition && contentDisposition.includes('filename=')) {
        const match = contentDisposition.match(/filename="?(.+?)"?$/);
        if (match?.[1]) fileName = match[1];
      }

      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setStatus('Download complete');
    } catch (error) {
      console.error(error);
      setStatus('Download failed');
    }
  };

  return (
    <div className="app-container">
      <h2 className="app-heading">File Downloader</h2>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter file URL"
        className="url-input"
      />
      <button onClick={downloadFile} className="download-button">
        Download
      </button>

      {progress > 0 && status === 'Downloading...' && (
        <div className="progress-wrapper">
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="percentage">{progress}%</p>
        </div>
      )}

      {status && <p className="status-text">{status}</p>}
    </div>
  );
}

export default App;

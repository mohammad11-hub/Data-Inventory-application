import React, { useState, useRef } from 'react';

const FileConverter = () => {
  const [file, setFile] = useState(null);
  const [tableName, setTableName] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef();

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = () => setDragActive(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Browse button
  const handleBrowse = () => fileInputRef.current.click();

  // File input change
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Handle file selection
  const handleFile = (file) => {
    setFile(file);
    setTableName(file.name.split('.')[0].replace(/[^a-zA-Z0-9_]/g, '_'));
    setStatus('');
    setProgress(0);
  };

  // Convert file
  const handleConvert = async () => {
    if (!file || !tableName) {
      setStatus('Please select a file and enter a table name.');
      return;
    }
    setStatus('Converting...');
    setProgress(10);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setProgress(30);
        const arrayBuffer = e.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);

        // Send file data to main process
        const result = await window.electronAPI.convertFile({
          fileData: Array.from(uint8Array),
          fileName: file.name,
          tableName,
          fileType: file.name.endsWith('.csv') ? 'csv' : 'xlsx'
        });

        setProgress(100);
        if (result.success) {
          setStatus(`File converted successfully! ${result.rowsProcessed} rows processed.`);
        } else {
          setStatus(result.error || 'Conversion failed');
        }
      } catch (err) {
        setStatus('Error: ' + err.message);
      }
    };
    reader.onerror = () => setStatus('Error reading file');
    reader.readAsArrayBuffer(file);
  };

  // Listen for progress updates from main process (optional)
  React.useEffect(() => {
    if (window.electronAPI && window.electronAPI.onConversionProgress) {
      window.electronAPI.onConversionProgress((progress) => setProgress(progress));
    }
  }, []);

  return (
    <div className="container" style={{ maxWidth: 500, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #f0f1f2' }}>
      <h2>File Converter</h2>
      <div
        className={`drag-area${dragActive ? ' active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: '2px dashed #6c757d',
          borderRadius: 5,
          padding: 30,
          textAlign: 'center',
          margin: '20px 0',
          backgroundColor: dragActive ? '#e8f5e9' : '#f8f9fa',
          transition: 'all 0.3s ease'
        }}
      >
        <h4>Drag & Drop Files Here</h4>
        <span>OR</span>
        <button className="btn btn-primary mt-3" type="button" onClick={handleBrowse}>Browse Files</button>
        <input
          type="file"
          accept=".xlsx,.csv"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileInput}
        />
      </div>
      {file && (
        <div className="file-info" style={{ marginTop: 20 }}>
          <div>
            <strong>Selected file:</strong> {file.name}
          </div>
          <div className="mb-3">
            <label>Table Name</label>
            <input
              type="text"
              className="form-control"
              value={tableName}
              onChange={e => setTableName(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </div>
          <button className="btn btn-success" type="button" onClick={handleConvert}>Convert File</button>
        </div>
      )}
      {progress > 0 && progress < 100 && (
        <div className="progress" style={{ marginTop: 20 }}>
          <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: `${progress}%` }}></div>
        </div>
      )}
      {status && (
        <div className="mt-4 alert" style={{ color: status.startsWith('Error') ? 'red' : 'green' }}>
          {status}
        </div>
      )}
    </div>
  );
};

export default FileConverter; 
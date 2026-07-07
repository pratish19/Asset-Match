/**
 * UploadZone Component
 * * Handles all user file input methods including Drag & Drop, system file dialogs, 
 * and clipboard pasting. Also contains the triggers to open the adjacent sidebar.
 */
import React, { useState, useEffect } from 'react';

interface UploadZoneProps {
  onFileUpload: (file: File) => void;
  onClear: (e: React.MouseEvent) => void;
  previewUrl: string | null;
  loading: boolean;
  error: string | null;
  sidebarView: 'closed' | 'history' | 'filters';
  setSidebarView: React.Dispatch<React.SetStateAction<'closed' | 'history' | 'filters'>>;
}

export default function UploadZone({ 
  onFileUpload, onClear, previewUrl, loading, error, sidebarView, setSidebarView 
}: UploadZoneProps) {
  
  const [isDragging, setIsDragging] = useState(false);

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => { 
    e.preventDefault(); 
    setIsDragging(true); 
  };

  const handleDragLeave = (e: React.DragEvent) => { 
    e.preventDefault(); 
    setIsDragging(false); 
  };

  const handleDrop = (e: React.DragEvent) => { 
    e.preventDefault(); 
    setIsDragging(false); 
    const file = e.dataTransfer.files?.[0]; 
    if (file) {
      onFileUpload(file); 
    }
  };

  // Standard input click handler
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => { 
    const file = event.target.files?.[0]; 
    if (file) {
      onFileUpload(file); 
    }
  };

  // Listen for global paste events to allow quick screenshot uploads
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Don't intercept paste if user is typing in a text input (like search)
      if (e.target instanceof HTMLInputElement) return; 
      
      const file = e.clipboardData?.files?.[0];
      if (file) {
        onFileUpload(file);
      }
    };
    
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFileUpload]);

  return (
    <div className="hero-left">
      
      {/* Sidebar Toggle Controls */}
      <div className="top-right-actions">
        <button 
          className={`action-icon-btn ${sidebarView === 'history' ? 'active' : ''}`} 
          title="History"
          onClick={() => setSidebarView(sidebarView === 'history' ? 'closed' : 'history')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        </button>
        <button 
          className={`action-icon-btn ${sidebarView === 'filters' ? 'active' : ''}`} 
          title="Advanced Filters"
          onClick={() => setSidebarView(sidebarView === 'filters' ? 'closed' : 'filters')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
        </button>
      </div>

      <h2 style={{marginTop: 0, color: 'var(--color-primary)'}}>Find similar assets instantly.</h2>
      <p style={{color: 'var(--color-text-muted)', marginBottom: '25px'}}>
        Upload a reference image to scan the database using our AI vector engine.
      </p>
      
      {/* Main interactive drop zone */}
      <div 
        className={`upload-zone ${isDragging ? 'dragging' : ''} ${previewUrl ? 'filled' : 'empty'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !previewUrl && document.getElementById('file-upload')?.click()}
      >
        <input 
          type="file" 
          onChange={handleInputChange} 
          accept="image/png, image/jpeg" 
          id="file-upload" 
          style={{ display: 'none' }} 
        />
        
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Upload preview" className="inline-preview" />
            <div className="preview-actions">
              <button 
                className="icon-btn" 
                title="Upload different image" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  document.getElementById('file-upload')?.click(); 
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              </button>
              <button className="icon-btn" title="Clear image" onClick={onClear}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </>
        ) : (
          <>
            <h3>Drag & Drop, Paste, or Click</h3> 
            <p style={{color: 'var(--color-text-muted)', marginBottom: '10px'}}>
              Supported formats: JPG or PNG
            </p>
          </>
        )}
      </div>
      
      {loading && <p style={{color: 'var(--color-primary)', textAlign: 'center', fontWeight: 'bold'}}>Extracting visual vectors...</p>}
      {error && <p style={{color: '#ff4757', textAlign: 'center'}}>{error}</p>}
    </div>
  );
}
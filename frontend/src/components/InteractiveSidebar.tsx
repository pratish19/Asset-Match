/**
 * InteractiveSidebar Component
 * * Manages the collapsible side panel that houses both the user's upload history
 * and the advanced search filters. It allows users to toggle file types,
 * adjust aspect ratio preferences, and set the strictness of the similarity match.
 */
import React from 'react';
import type { HistoryItem } from '../types';

interface SidebarProps {
  view: 'closed' | 'history' | 'filters';
  setView: React.Dispatch<React.SetStateAction<'closed' | 'history' | 'filters'>>;
  history: HistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
  onHistoryClick: (file: File) => void;
  
  // Filter States
  maxDistance: number;
  setMaxDistance: (val: number) => void;
  fileTypes: string[];
  setFileTypes: (types: string[]) => void;
  minAspect: number;
  setMinAspect: (val: number) => void;
  maxAspect: number;
  setMaxAspect: (val: number) => void;
  
  onApplySearch: () => void;
}

export default function InteractiveSidebar({
  view, setView, history, setHistory, onHistoryClick,
  maxDistance, setMaxDistance, fileTypes, setFileTypes,
  minAspect, setMinAspect, maxAspect, setMaxAspect,
  onApplySearch
}: SidebarProps) {
  
  // If the panel is closed, render an empty div to maintain layout structure without content
  if (view === 'closed') return <div className="history-sidebar" />;

  /**
   * Toggles a file extension in or out of the active filter list.
   */
  const handleFileTypeToggle = (ext: string) => {
    if (fileTypes.includes(ext)) {
      setFileTypes(fileTypes.filter(t => t !== ext));
    } else {
      setFileTypes([...fileTypes, ext]);
    }
  };

  /**
   * Resets all advanced filters back to their default, broad-search states.
   */
  const handleResetFilters = () => {
    setFileTypes([]); 
    setMaxDistance(0.8); 
    setMinAspect(0); 
    setMaxAspect(10);
  };

  return (
    <div className={`history-sidebar expanded`}>
      {/* Header section with dynamic title and action buttons */}
      <div className="sidebar-header">
        <div className="sidebar-title" onClick={() => setView('closed')} title="Close Panel">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <span>{view === 'history' ? 'History' : 'Filters'}</span>
        </div>
        
        {view === 'history' ? (
          <button className="sidebar-clear" onClick={() => { setHistory([]); setView('closed'); }}>Clear</button>
        ) : (
          <button className="sidebar-clear" onClick={handleResetFilters}>Reset</button>
        )}
      </div>

      {/* --- HISTORY CONTENT --- */}
      {view === 'history' && (
        <div className="sidebar-grid">
          {history.length === 0 && (
            <p style={{textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '20px'}}>
              No recent searches.
            </p>
          )}
          
          {history.map((item) => (
            <div key={item.id} className="sidebar-history-item" onClick={() => onHistoryClick(item.file)}>
              <img src={item.url} alt="History thumbnail" />
              <button 
                className="delete-sidebar-btn" 
                onClick={(e) => { 
                  e.stopPropagation(); // Prevent triggering the search when deleting
                  setHistory(prev => prev.filter(h => h.id !== item.id)); 
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --- FILTERS CONTENT --- */}
      {view === 'filters' && (
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflowY: 'auto' }}>
          
          {/* File Type Filter */}
          <div className="filter-section">
            <div className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              File Type
            </div>
            <div className="filter-checkbox-group">
              <label><input type="checkbox" checked={fileTypes.includes('png')} onChange={() => handleFileTypeToggle('png')} /> PNG</label>
              <label><input type="checkbox" checked={fileTypes.includes('jpg')} onChange={() => handleFileTypeToggle('jpg')} /> JPG</label>
            
            </div>
          </div>

          {/* Orientation Filter (Aspect Ratio bounds) */}
          <div className="filter-section">
            <div className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
              Orientation
            </div>
            <div className="filter-checkbox-group">
              <label>
                <input type="radio" name="orientation" checked={minAspect === 0 && maxAspect === 10} onChange={() => { setMinAspect(0); setMaxAspect(10); }} /> All
              </label>
              <label>
                <input type="radio" name="orientation" checked={minAspect > 1.0} onChange={() => { setMinAspect(1.01); setMaxAspect(10); }} /> Horizontal
              </label>
              <label>
                <input type="radio" name="orientation" checked={maxAspect < 1.0} onChange={() => { setMinAspect(0); setMaxAspect(0.99); }} /> Vertical
              </label>
            </div>
          </div>

          {/* Result Variety Filter (Cosine Distance threshold) */}
          <div className="filter-section">
            <div className="filter-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              Result Variety
            </div>
            <p style={{fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0 0 10px 0'}}>
              Control how different you want the results to be.
            </p>
            <div className="segmented-control">
              {/* Thresholds map directly to pgvector distance limits */}
              <button className={`segment-btn ${maxDistance <= 0.15 ? 'active' : ''}`} onClick={() => setMaxDistance(0.15)}>Low</button>
              <button className={`segment-btn ${maxDistance > 0.15 && maxDistance <= 0.4 ? 'active' : ''}`} onClick={() => setMaxDistance(0.4)}>Medium</button>
              <button className={`segment-btn ${maxDistance > 0.4 ? 'active' : ''}`} onClick={() => setMaxDistance(0.8)}>High</button>
            </div>
          </div>

          <button className="apply-search-btn" onClick={onApplySearch}>
            Apply Search
          </button>
        </div>
      )}
    </div>
  );
}
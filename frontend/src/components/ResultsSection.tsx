/**
 * ResultsSection Component
 * * Displays the matched assets returned from the backend vector database.
 * Provides local sorting (by match percentage) and filtering (by filename keyword).
 * If no search has been performed, it displays a looping carousel of dummy assets.
 */
import { useState } from 'react';
import type { Match } from '../types';

// Fallback assets to display when the system is idle
const DUMMY_ASSETS = ['cloud4.png', 'treeOrange.png', 'bushOrange4.png', 'treePalm.png', 'cloud2.png', 'bushOrange3.png'];

export default function ResultsSection({ matches }: { matches: Match[] }) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  /**
   * Triggers a browser download by temporarily appending a hidden anchor link.
   */
  const handleDownload = (filename: string) => {
    const url = `http://localhost:8000/api/download/${filename}`;
    const link = document.createElement('a');
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process matches based on user's current local filter and sort settings
  const displayedMatches = matches
    .filter(m => m.filename.toLowerCase().includes(searchKeyword.toLowerCase()))
    .sort((a, b) => sortOrder === 'desc' 
      ? b.similarity_score - a.similarity_score 
      : a.similarity_score - b.similarity_score
    );

  // Idle state: show the rotating carousel
  if (matches.length === 0) {
    return (
      <div className="content-section">
        <h2 className="section-title">Available Database Assets</h2>
        <div className="carousel-container">
          <div className="carousel-track">
            {/* Duplicate array to create a seamless infinite loop effect */}
            {[...DUMMY_ASSETS, ...DUMMY_ASSETS].map((filename, i) => (
              <img key={i} src={`http://localhost:8000/assets/${filename}`} alt="Asset preview" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Active state: show the matched grid
  return (
    <div className="content-section">
      <div className="results-header">
        <h2 className="section-title">Match Results</h2>
        <div className="results-controls">
          <input 
            type="text" 
            placeholder="Search keywords..." 
            className="search-input"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <button 
            className="sort-btn" 
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          >
            Sort: {sortOrder === 'desc' ? 'High %' : 'Low %'}
          </button>
        </div>
      </div>

      <div className="grid-nx4">
        {displayedMatches.length > 0 ? displayedMatches.map((match, index) => (
          <div key={index} className="square-tile">
            <img src={`http://localhost:8000/assets/${match.filename}`} alt={match.filename} />
            <p style={{margin: '5px 0', fontWeight: 600, fontSize: '0.9rem'}}>{match.filename}</p>
            
            {/* Formatted percentage tag */}
            <span style={{
              background: 'var(--color-bg-light)', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              fontSize: '0.8rem', 
              color: 'var(--color-primary)', 
              marginBottom: 'auto'
            }}>
              Match: {(match.similarity_score * 100).toFixed(1)}%
            </span>
            
            <button className="download-btn" onClick={() => handleDownload(match.filename)}>
              Download
            </button>
          </div>
        )) : (
          <p style={{color: 'var(--color-text-muted)', gridColumn: '1 / -1', textAlign: 'center'}}>
            No matches found for "{searchKeyword}".
          </p>
        )}
      </div>
    </div>
  );
}
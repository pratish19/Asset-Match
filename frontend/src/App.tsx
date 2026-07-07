/**
 * App Main Entry Component
 * * Orchestrates the top-level state for the AssetMatch UI.
 * Handles the communication with the FastAPI backend, manages user upload history,
 * and passes filter states down to the Sidebar and Upload UI.
 */
import React, { useState } from 'react';
import './App.css';
import heroBg from './assets/hero-bg.png';
import type { Match, HistoryItem } from './types';

// Child Components
import UploadZone from './components/UploadZone';
import InteractiveSidebar from './components/InteractiveSidebar';
import ResultsSection from './components/ResultsSection';

function App() {
  const [activeTab, setActiveTab] = useState<'engine' | 'about'>('engine');
  
  // -- Core Application State --
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // -- Upload & History State --
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  // -- Sidebar & Filter UI State --
  const [sidebarView, setSidebarView] = useState<'closed' | 'history' | 'filters'>('closed');
  const [maxDistance, setMaxDistance] = useState<number>(0.7); 
  const [fileTypes, setFileTypes] = useState<string[]>([]); 
  const [minAspect, setMinAspect] = useState<number>(0.0);
  const [maxAspect, setMaxAspect] = useState<number>(10.0);

  /**
   * Processes a file upload, checks for duplicates in history, 
   * and dispatches the search payload to the backend.
   */
  const processFile = async (file: File) => {
    // Validate file type natively before hitting the backend
    if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file (PNG, JPG).");
        return;
    }

    // Keep track of the active file in case the user applies new filters
    setCurrentFile(file); 
    const objectUrl = URL.createObjectURL(file);
    
    // UI Reset for new search
    setPreviewUrl(objectUrl);
    setLoading(true);
    setError(null);
    setMatches([]);

    // Update History (Preventing exact duplicate entries)
    setHistory(prev => {
      const isDuplicate = prev.some(item => item.file.name === file.name && item.file.size === file.size);
      if (isDuplicate) return prev;
      return [{ id: Date.now().toString(), url: objectUrl, file }, ...prev];
    });

    // Package the image and current filter states into multipart/form-data
    const formData = new FormData();
    formData.append("reference_image", file);
    formData.append("max_distance", maxDistance.toString());
    formData.append("min_aspect", minAspect.toString());
    formData.append("max_aspect", maxAspect.toString());
    formData.append("file_types", fileTypes.join(",")); 

    try {
      const response = await fetch("http://localhost:8000/api/search", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Failed to process image");
      
      const data: { matches: Match[] } = await response.json();
      setMatches(data.matches);
    } catch (err) {
      console.error("Search Error:", err);
      setError("Failed to connect to the search engine. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Re-triggers the search with the active image but updated filter constraints.
   */
  const handleApplyFilters = () => {
    if (currentFile) {
      processFile(currentFile);
    } else {
      setError("Please upload an image first before applying filters.");
    }
  };

  /**
   * Completely clears the current search and UI state.
   */
  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setCurrentFile(null);
    setMatches([]);
    setError(null);
    
    // Reset hidden file input so the same file can be selected again if needed
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="app-wrapper">
      <nav className="navbar">
        <h1 className="nav-brand">AssetMatch</h1>
        <div className="nav-links">
          <button className={`nav-btn ${activeTab === 'engine' ? 'active' : ''}`} onClick={() => setActiveTab('engine')}>Engine</button>
          <button className={`nav-btn ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>About</button>
        </div>
      </nav>

      {activeTab === 'about' ? (
        <div className="about-page">
          <h2>The Story Behind - AssetMatch</h2>
          
          <h4>Context!</h4>
          
          <p>
            A while back, I was working as a software developer intern in the animation department at an EdTech company. Our team was a production powerhouse—we were constantly churning out multiple animations, interactive modules, and games every single month.
          </p>
          
          <p>
            But this fast-paced creativity came with a hidden cost: <strong>the digital graveyard.</strong>
          </p>
          
          <p>
            Whenever a project wrapped up, all of its beautifully crafted assets, background, character, and UI inspirations were dumped into massive storage drives. Fast forward a couple of months, and we’d inevitably land a new project that required a similar vibe. We knew we had the perfect pre-built background or character sitting <em>somewhere</em> in our archives, but finding it was a nightmare.
          </p>
          
          <p>
            We spent hours clicking through endless folders, blindly guessing file names like <code>bg_final_v3_real.png</code>. It was a massive drain on time and creativity. I realized then that relying on text and file names to find visual art is fundamentally broken.
          </p>

          <h3>The "Aha!" Moment</h3>
          <p>
            I started thinking: what if you could search for visual assets <em>visually</em>? What if you could just show the computer what you were looking for?
          </p>
          <p>
            That idea became <strong>AssetMatch</strong>—a reverse image search engine engineered specifically for creatives, animators, and developers.
          </p>

          <h3>What is it?</h3>
          <p>
            AssetMatch is an AI-powered platform where you can simply drag and drop a reference image—whether that’s a rough character sketch, a texture snippet, or a UI layout—and the system instantly scans your entire database to find visually similar assets for inspiration or immediate download.
          </p>

          <h3>What makes it special?</h3>
          <p>
            Instead of relying on human-entered tags or exact file names, AssetMatch actually "sees" the uploaded image. It uses a Machine Learning model to convert your image into a mathematical vector—a map of its visual features, colors, and shapes. It then compares that map against the database in milliseconds. 
          </p>
          <h3>Outcome?</h3>
          <p>
            It takes the heavy lifting out of asset management, letting creatives spend less time digging through folders, and more time actually creating.
          </p>
        </div>
      ) : (
        <>
          <div className="hero-section" style={{ backgroundImage: `url(${heroBg})` }}>
            <div className="hero-interactive-group">
              
              <UploadZone 
                onFileUpload={processFile} 
                onClear={clearSelection} 
                previewUrl={previewUrl} 
                loading={loading} 
                error={error} 
                sidebarView={sidebarView}
                setSidebarView={setSidebarView}
              />
              
              <InteractiveSidebar 
                view={sidebarView}
                setView={setSidebarView}
                history={history} 
                setHistory={setHistory} 
                onHistoryClick={processFile} 
                maxDistance={maxDistance}
                setMaxDistance={setMaxDistance}
                fileTypes={fileTypes}
                setFileTypes={setFileTypes}
                minAspect={minAspect}
                setMinAspect={setMinAspect}
                maxAspect={maxAspect}
                setMaxAspect={setMaxAspect}
                onApplySearch={handleApplyFilters}
              />

            </div>
          </div>
          
          <ResultsSection matches={matches} />
        </>
      )}

      <footer className="footer">
        <p>
          AssetMatch Vector Engine — 
          <a href="https://github.com/pratish19/Asset-Match" target="_blank" rel="noopener noreferrer"> GitHub Repository </a> | 
          <a href="https://drive.google.com/drive/folders/1B_40YpnOIqCEi3z5ocCGpUXM4R8ujn95?usp=sharing" target="_blank" rel="noopener noreferrer"> Documentation </a>
        </p>
      </footer>
    </div>
  );
}

export default App;

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, File, Image as ImageIcon, Video, FileText, Trash2, Star, 
  Search, Grid, List, Moon, Sun, UploadCloud, Plus, ArrowUpDown, 
  Share2, Shield, Flame, Snowflake, Thermometer, Check, Copy, User,
  ChevronDown, ExternalLink, Zap, AlertCircle, LogOut, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  localDB, FileItem, UserProfile, FREE_LIMIT_BYTES, 
  calculateSHA256, compressMedia 
} from '@/utils/db';
import { logoutUser } from '@/app/actions/auth';
import LandingPage from '@/app/components/LandingPage';

export default function Home() {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Auth & profile state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Database files state
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentTab, setCurrentTab] = useState<'All' | 'Favorites' | 'Trash'>('All');
  
  // Filters & UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Media' | 'Photos' | 'Videos' | 'Documents'>('All');
  const [viewMode, setViewMode] = useState<'Grid' | 'List'>('Grid');
  const [sortField, setSortField] = useState<'size' | 'created_at' | 'access_count'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Selection
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  
  // Upload & modal states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusMsg, setUploadStatusMsg] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  
  // Load initial configurations
  useEffect(() => {
    // Check local storage or system preference for theme
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }

    // Fetch active user session
    const initSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            const userData = data.user;
            
            // Load profile and dynamically sync current profile details
            let profile = localDB.getProfile(userData.id);
            if (
              profile.name !== userData.name || 
              profile.email !== userData.email || 
              profile.avatar_url !== userData.avatar_url
            ) {
              profile = localDB.updateProfile(userData.id, {
                name: userData.name,
                email: userData.email,
                avatar_url: userData.avatar_url
              });
            }
            
            setCurrentUser(profile);
            setFiles(localDB.getFiles(userData.id));
            setIsAuthenticated(true);
            return;
          }
        }
      } catch (error) {
        console.error('Session initialization failed:', error);
      }

      // Guest flow: Not authenticated, no session
      setIsAuthenticated(false);
      setCurrentUser(null);
    };

    initSession();
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleUpgradeToPro = () => {
    if (!currentUser) return;
    const updated = localDB.updateProfile(currentUser.id, { tier: 'Pro' });
    setCurrentUser(updated);
    setShowUpgradeModal(false);
    alert('Successfully upgraded to DaddyKart Pro! Enjoy unlimited cloud storage.');
  };

  const handleCancelSubscription = () => {
    if (!currentUser) return;
    const confirmCancel = window.confirm('Are you sure you want to cancel your DaddyKart Pro subscription? This will restore the 10GB storage limit and re-enable smart compression.');
    if (confirmCancel) {
      const updated = localDB.updateProfile(currentUser.id, { tier: 'Free' });
      setCurrentUser(updated);
      alert('Subscription cancelled. Your account has been reverted to the Free plan.');
    }
  };

  const handleNextFile = () => {
    if (!previewFile || !currentUser) return;
    const visibleFiles = getFilteredAndSortedFiles();
    const currentIdx = visibleFiles.findIndex(f => f.id === previewFile.id);
    if (currentIdx !== -1 && currentIdx < visibleFiles.length - 1) {
      const nextFile = visibleFiles[currentIdx + 1];
      const updated = files.map(f => f.id === nextFile.id ? { ...f, access_count: f.access_count + 1, last_accessed: new Date().toISOString() } : f);
      setFiles(updated);
      localDB.saveFiles(currentUser.id, updated);
      setPreviewFile({ ...nextFile, access_count: nextFile.access_count + 1, last_accessed: new Date().toISOString() });
    }
  };

  const handlePrevFile = () => {
    if (!previewFile || !currentUser) return;
    const visibleFiles = getFilteredAndSortedFiles();
    const currentIdx = visibleFiles.findIndex(f => f.id === previewFile.id);
    if (currentIdx > 0) {
      const prevFile = visibleFiles[currentIdx - 1];
      const updated = files.map(f => f.id === prevFile.id ? { ...f, access_count: f.access_count + 1, last_accessed: new Date().toISOString() } : f);
      setFiles(updated);
      localDB.saveFiles(currentUser.id, updated);
      setPreviewFile({ ...prevFile, access_count: prevFile.access_count + 1, last_accessed: new Date().toISOString() });
    }
  };

  // Keyboard navigation for lightbox preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!previewFile) return;
      if (e.key === 'ArrowRight') {
        handleNextFile();
      } else if (e.key === 'ArrowLeft') {
        handlePrevFile();
      } else if (e.key === 'Escape') {
        setPreviewFile(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewFile, files]);

  // Mock logout/login switch to simulate different users or reset state
  const handleResetData = () => {
    if (!currentUser) return;
    localStorage.removeItem(`daddykart_files_${currentUser.id}`);
    localStorage.removeItem(`daddykart_profile_${currentUser.id}`);
    const defaultUser = localDB.getProfile(currentUser.id);
    const defaultFiles = localDB.getFiles(currentUser.id);
    setCurrentUser(defaultUser);
    setFiles(defaultFiles);
    setSelectedFileIds([]);
    alert('Database has been successfully reset to defaults!');
  };

  const handleSignOut = async () => {
    await logoutUser();
    router.push('/login');
    router.refresh();
  };

  // Upload handler with resumable progress, compression and deduplication
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    // Check storage limits for Free tier
    if (currentUser.tier === 'Free' && currentUser.storage_used + file.size > FREE_LIMIT_BYTES) {
      setShowUpgradeModal(true);
      return;
    }

    setIsUploading(true);
    setUploadProgress(5);
    setUploadStatusMsg('Calculating SHA-256 Hash for Deduplication...');

    // 1. Calculate Hash (Client side)
    const fileHash = await calculateSHA256(file);
    setUploadProgress(20);

    // Check if hash already exists in database
    const existingFile = files.find(f => f.hash === fileHash && !f.is_trashed);
    
    let finalFile = file;
    let isCompressed = false;

    if (!existingFile) {
      // 2. Client-side compression if Free User
      if (currentUser.tier === 'Free') {
        setUploadStatusMsg('Smart Media Compression running (Free Tier Limit 60%)...');
        const compressed = await compressMedia(file, 0.6);
        isCompressed = compressed.size < file.size;
        finalFile = compressed;
        setUploadProgress(40);
      }
    }

    // 3. Simulated chunked resumable upload
    setUploadStatusMsg(existingFile ? 'Match found! Deduplicating...' : 'Uploading blocks to Cloudflare R2...');
    
    // Simulate chunks
    const chunkSteps = [60, 80, 100];
    for (const step of chunkSteps) {
      await new Promise((resolve) => setTimeout(resolve, existingFile ? 200 : 500));
      setUploadProgress(step);
    }

    // Prepare thumbnail preview if image
    let thumbnail: string | null = null;
    if (finalFile.type.startsWith('image/')) {
      thumbnail = URL.createObjectURL(finalFile);
    }

    // Insert database reference
    const uploaded = localDB.uploadFileReference(currentUser.id, {
      name: file.name,
      size: finalFile.size,
      type: finalFile.type,
      hash: fileHash,
      thumbnail
    });

    // Update frontend state
    const updatedFiles = localDB.getFiles(currentUser.id);
    setFiles(updatedFiles);
    
    // Sync current profile storage size
    const updatedProfile = localDB.getProfile(currentUser.id);
    setCurrentUser(updatedProfile);

    // Notify user of actions taken
    if (existingFile) {
      alert(`[DEDUPLICATION SUCCESS] Exact file content already exists on Cloudflare R2!\nCreated reference mapping without re-uploading bytes.`);
    } else if (isCompressed) {
      alert(`[COMPRESSION] File was optimized to 60% quality before upload.\nSaved space: ${((file.size - finalFile.size) / (1024 * 1024)).toFixed(2)} MB`);
    }

    setIsUploading(false);
    setUploadProgress(0);
    setUploadStatusMsg('');
    // Clear input
    event.target.value = '';
  };

  // Actions
  const handleToggleFavorite = (fileId: string) => {
    if (!currentUser) return;
    const updated = files.map(f => f.id === fileId ? { ...f, is_favorite: !f.is_favorite } : f);
    setFiles(updated);
    localDB.saveFiles(currentUser.id, updated);
  };

  const handleTrashFile = (fileId: string) => {
    if (!currentUser) return;
    const updated = files.map(f => f.id === fileId ? { ...f, is_trashed: true } : f);
    setFiles(updated);
    localDB.saveFiles(currentUser.id, updated);
    setSelectedFileIds(prev => prev.filter(id => id !== fileId));
  };

  const handleRestoreFile = (fileId: string) => {
    if (!currentUser) return;
    const updated = files.map(f => f.id === fileId ? { ...f, is_trashed: false } : f);
    setFiles(updated);
    localDB.saveFiles(currentUser.id, updated);
  };

  const handlePermanentDelete = (fileId: string) => {
    if (!currentUser) return;
    const updated = files.filter(f => f.id !== fileId);
    setFiles(updated);
    localDB.saveFiles(currentUser.id, updated);
  };

  const handleEmptyTrash = () => {
    if (!currentUser) return;
    const updated = files.filter(f => !f.is_trashed);
    setFiles(updated);
    localDB.saveFiles(currentUser.id, updated);
    setSelectedFileIds([]);
  };

  const handleShareFile = (file: FileItem) => {
    const publicUrl = `https://daddykart.share/${file.hash || file.id}`;
    setShareLink(publicUrl);
  };

  // Multi-select bulk actions
  const handleToggleSelectFile = (fileId: string, event: React.MouseEvent) => {
    if (event.shiftKey && selectedFileIds.length > 0) {
      // Find range
      const visibleFiles = getFilteredAndSortedFiles();
      const lastSelectedIdx = visibleFiles.findIndex(f => f.id === selectedFileIds[selectedFileIds.length - 1]);
      const currentIdx = visibleFiles.findIndex(f => f.id === fileId);
      
      if (lastSelectedIdx !== -1 && currentIdx !== -1) {
        const start = Math.min(lastSelectedIdx, currentIdx);
        const end = Math.max(lastSelectedIdx, currentIdx);
        const rangeIds = visibleFiles.slice(start, end + 1).map(f => f.id);
        
        setSelectedFileIds(prev => {
          const union = new Set([...prev, ...rangeIds]);
          return Array.from(union);
        });
        return;
      }
    }

    setSelectedFileIds(prev => 
      prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
    );
  };

  const handleBulkTrash = () => {
    if (!currentUser || selectedFileIds.length === 0) return;
    const updated = files.map(f => selectedFileIds.includes(f.id) ? { ...f, is_trashed: true } : f);
    setFiles(updated);
    localDB.saveFiles(currentUser.id, updated);
    setSelectedFileIds([]);
  };

  const handleBulkFavorite = () => {
    if (!currentUser || selectedFileIds.length === 0) return;
    const allFav = files.filter(f => selectedFileIds.includes(f.id)).every(f => f.is_favorite);
    const updated = files.map(f => selectedFileIds.includes(f.id) ? { ...f, is_favorite: !allFav } : f);
    setFiles(updated);
    localDB.saveFiles(currentUser.id, updated);
    setSelectedFileIds([]);
  };

  // Filter & sorting pipeline
  const getFilteredAndSortedFiles = () => {
    return files
      .filter(file => {
        // Tab filtering
        if (currentTab === 'Favorites') return file.is_favorite && !file.is_trashed;
        if (currentTab === 'Trash') return file.is_trashed;
        return !file.is_trashed;
      })
      .filter(file => {
        // Search filtering
        if (!searchQuery) return true;
        return file.name.toLowerCase().includes(searchQuery.toLowerCase());
      })
      .filter(file => {
        // Category type filtering
        if (filterType === 'All') return true;
        if (filterType === 'Media') return file.type.startsWith('image/') || file.type.startsWith('video/');
        if (filterType === 'Photos') return file.type.startsWith('image/');
        if (filterType === 'Videos') return file.type.startsWith('video/');
        if (filterType === 'Documents') return !file.type.startsWith('image/') && !file.type.startsWith('video/');
        return true;
      })
      .sort((a, b) => {
        let valA: number = 0;
        let valB: number = 0;

        if (sortField === 'created_at') {
          valA = new Date(a.created_at).getTime();
          valB = new Date(b.created_at).getTime();
        } else {
          valA = a[sortField] as number;
          valB = b[sortField] as number;
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="text-emerald-400" size={20} />;
    if (type.startsWith('video/')) return <Video className="text-amber-400" size={20} />;
    if (type.includes('pdf')) return <FileText className="text-red-400" size={20} />;
    if (type.includes('zip') || type.includes('tar') || type.includes('rar')) return <Shield className="text-purple-400" size={20} />;
    return <File className="text-blue-400" size={20} />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTierIcon = (tier: 'Hot' | 'Cold' | 'Frozen') => {
    switch (tier) {
      case 'Hot':
        return <span className="flex items-center gap-1 text-xs text-rose-500 font-medium px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20"><Flame size={12} /> Hot</span>;
      case 'Cold':
        return <span className="flex items-center gap-1 text-xs text-cyan-400 font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20"><Thermometer size={12} /> Cold</span>;
      case 'Frozen':
        return <span className="flex items-center gap-1 text-xs text-indigo-400 font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20"><Snowflake size={12} /> Frozen</span>;
    }
  };

  const storageLimit = currentUser?.tier === 'Pro' ? 100 * 1024 * 1024 * 1024 : FREE_LIMIT_BYTES;
  const storageUsedPercent = currentUser 
    ? Math.min((currentUser.storage_used / storageLimit) * 100, 100) 
    : 0;

  const currentVisibleFiles = getFilteredAndSortedFiles();

  if (isAuthenticated === null) {
    return (
      <div className="bg-[#0b1326] min-h-screen flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#a3e635] mx-auto" />
          <p className="text-xs text-neutral-400 font-mono tracking-widest uppercase">Initializing Daddykart...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage onSignInClick={() => router.push('/login')} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans">
      {/* PERSISTENT SIDEBAR */}
      <aside className="w-72 bg-charcoal text-white flex flex-col justify-between border-r border-neutral-800 shrink-0 select-none">
        <div>
          {/* Logo */}
          <div className="h-20 flex items-center px-6 gap-3 border-b border-neutral-800">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-[#a3e635] shadow-lg shadow-lime-500/20 shrink-0">
              <img src="/daddykart-new-logo.jpg" alt="Daddykart" className="w-full h-full object-cover object-top scale-110" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">daddy<span className="text-lime-accent">kart</span></span>
              <p className="text-[10px] text-neutral-400 tracking-widest uppercase font-semibold">Cloud Storage</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 px-4 space-y-1">
            <button
              onClick={() => { setCurrentTab('All'); setSelectedFileIds([]); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                currentTab === 'All' 
                  ? 'bg-lime-accent text-black shadow-lg shadow-lime-500/15' 
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Folder size={18} />
                <span>All Files</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-md ${currentTab === 'All' ? 'bg-black/10 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                {files.filter(f => !f.is_trashed).length}
              </span>
            </button>

            <button
              onClick={() => { setCurrentTab('Favorites'); setSelectedFileIds([]); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                currentTab === 'Favorites' 
                  ? 'bg-lime-accent text-black shadow-lg shadow-lime-500/15' 
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Star size={18} />
                <span>Favorites</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-md ${currentTab === 'Favorites' ? 'bg-black/10 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                {files.filter(f => f.is_favorite && !f.is_trashed).length}
              </span>
            </button>

            <button
              onClick={() => { setCurrentTab('Trash'); setSelectedFileIds([]); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                currentTab === 'Trash' 
                  ? 'bg-lime-accent text-black shadow-lg shadow-lime-500/15' 
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Trash2 size={18} />
                <span>Trash</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-md ${currentTab === 'Trash' ? 'bg-black/10 text-black' : 'bg-neutral-800 text-neutral-400'}`}>
                {files.filter(f => f.is_trashed).length}
              </span>
            </button>
          </nav>
        </div>

        {/* Storage status & upgrade */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-900/40 space-y-4">
          <div>
            <div className="flex justify-between text-xs text-neutral-400 mb-2 font-medium">
              <span>Storage Used</span>
              <span>
                {currentUser?.tier === 'Pro' 
                  ? `${formatSize(currentUser.storage_used)} of 100 GB`
                  : `${formatSize(currentUser?.storage_used || 0)} of 10 GB`
                }
              </span>
            </div>

            {/* Storage Progress Bar */}
            <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-lime-accent h-full transition-all duration-500 rounded-full" 
                style={{ width: `${storageUsedPercent}%` }}
              />
            </div>
          </div>

          {currentUser?.tier === 'Free' ? (
            <div className="bg-gradient-to-br from-lime-400/10 to-emerald-400/5 border border-lime-400/20 p-4 rounded-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Zap size={14} className="text-lime-accent animate-pulse" /> Upgrade to Pro
                </h4>
                <p className="text-[11px] text-neutral-400 mt-1 mb-3">
                  Unlock unlimited storage space, lossless media, & zero compression.
                </p>
                <button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="w-full bg-lime-accent hover:bg-lime-400 text-black font-bold text-xs py-2 px-3 rounded-xl transition-all duration-200 shadow-md shadow-lime-500/10 active:scale-95"
                >
                  Go Pro Now
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-charcoal-light border border-neutral-800 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-neutral-400 font-medium">Status</span>
                <p className="text-sm font-bold text-lime-accent flex items-center gap-1">
                  Pro Active <Check size={14} />
                </p>
              </div>
              <button 
                onClick={handleCancelSubscription}
                title="Cancel your Pro subscription"
                className="text-[10px] text-neutral-400 hover:text-rose-500 border border-neutral-800 hover:border-rose-500/20 px-2.5 py-1 rounded-lg bg-neutral-900 transition-colors font-bold"
              >
                Cancel Pro
              </button>
            </div>
          )}

          {/* Reset Database Button */}
          <button 
            onClick={handleResetData}
            title="Reset Database to default"
            className="w-full text-center text-xs font-bold py-2.5 rounded-xl border border-neutral-800 hover:border-neutral-700 bg-neutral-900/50 hover:bg-neutral-900 text-neutral-400 hover:text-rose-400 transition-colors"
          >
            Reset Database
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TOP NAVIGATION BAR */}
        <header className="h-20 border-b border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-[#1A1A1A]/70 backdrop-blur-md flex items-center justify-between px-8 z-10 shrink-0">
          {/* Search bar */}
          <div className="relative w-96">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <Search size={18} />
            </span>
            <input 
              type="text" 
              placeholder="Search files by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-neutral-100 dark:bg-neutral-900 text-sm rounded-xl border border-transparent focus:border-lime-accent/50 dark:focus:border-lime-accent/50 focus:bg-white dark:focus:bg-black focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Right Area */}
          <div className="flex items-center gap-4">
            {/* Filter tags */}
            <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1.5 rounded-xl border border-neutral-200/50 dark:border-neutral-800">
              {(['All', 'Media', 'Photos', 'Videos', 'Documents'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    filterType === type 
                      ? 'bg-white dark:bg-charcoal text-black dark:text-white shadow-sm' 
                      : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl border border-neutral-200/40 dark:border-neutral-800/40 transition-colors"
            >
              {isDarkMode ? <Sun size={18} className="text-lime-accent" /> : <Moon size={18} className="text-neutral-600" />}
            </button>

            {/* User Profile / Auth State Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 pl-3 border-l border-neutral-200 dark:border-neutral-800 focus:outline-none cursor-pointer"
              >
                <div className="text-right hidden md:block">
                  <h5 className="text-sm font-bold">{currentUser?.name || 'Guest User'}</h5>
                  <span className={`text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md ${
                    currentUser?.tier === 'Pro' 
                      ? 'bg-lime-accent/20 text-lime-accent border border-lime-accent/30' 
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                  }`}>
                    {currentUser?.tier || 'Free'} Tier
                  </span>
                </div>
                <img 
                  src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80'} 
                  alt="avatar" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-neutral-200 dark:border-neutral-800 hover:border-lime-accent transition-colors"
                />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <>
                    {/* Click outside backdrop */}
                    <div className="fixed inset-0 z-20" onClick={() => setShowProfileMenu(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1A1A1A] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl py-2 z-30"
                    >
                      <div className="px-4 py-2 border-b border-neutral-100 dark:border-neutral-800 text-left">
                        <p className="text-[9px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-black">Logged in as</p>
                        <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{currentUser?.email}</p>
                      </div>
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-2"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT CANVAS */}
        <div className="flex-1 overflow-y-auto px-8 py-6 relative">
          
          {/* Action header bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">
                {currentTab === 'All' ? 'All Storage Files' : currentTab === 'Favorites' ? 'Starred Favorites' : 'Trash Archive'}
              </h2>
              {currentTab === 'Trash' && files.some(f => f.is_trashed) && (
                <button
                  onClick={handleEmptyTrash}
                  className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold px-3 py-1.5 hover:bg-rose-500/10 rounded-xl transition-all border border-rose-500/20"
                >
                  <Trash2 size={13} />
                  Empty Trash
                </button>
              )}
            </div>

            {/* Utility action group */}
            <div className="flex items-center gap-3">
              {/* Multi-select operations bar */}
              {selectedFileIds.length > 0 && (
                <div className="flex items-center gap-2 bg-charcoal text-white dark:bg-neutral-800 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg">
                  <span>{selectedFileIds.length} selected</span>
                  <div className="w-[1px] h-4 bg-neutral-700 mx-1" />
                  <button onClick={handleBulkFavorite} className="hover:text-lime-accent flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors">
                    <Star size={13} /> Toggle Favorite
                  </button>
                  <button onClick={handleBulkTrash} className="hover:text-rose-400 flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors">
                    <Trash2 size={13} /> Trash
                  </button>
                  <button onClick={() => setSelectedFileIds([])} className="text-neutral-400 hover:text-white px-1 py-0.5">
                    Clear
                  </button>
                </div>
              )}

              {/* Sort controls */}
              <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3 py-1.5 rounded-xl">
                <ArrowUpDown size={14} className="text-neutral-400" />
                <select 
                  value={sortField} 
                  onChange={(e) => setSortField(e.target.value as any)}
                  className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                >
                  <option value="created_at" className="dark:bg-charcoal text-black dark:text-white">Upload Time</option>
                  <option value="size" className="dark:bg-charcoal text-black dark:text-white">Media Size</option>
                  <option value="access_count" className="dark:bg-charcoal text-black dark:text-white">Access Count</option>
                </select>
                <button 
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="text-neutral-400 hover:text-black dark:hover:text-white text-xs font-bold pl-1 border-l border-neutral-200 dark:border-neutral-800"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>

              {/* Grid/List View Toggle */}
              <div className="flex bg-neutral-200/50 dark:bg-neutral-800/50 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode('Grid')} 
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'Grid' ? 'bg-white dark:bg-charcoal shadow-sm text-black dark:text-lime-accent' : 'text-neutral-400'}`}
                >
                  <Grid size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('List')} 
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'List' ? 'bg-white dark:bg-charcoal shadow-sm text-black dark:text-lime-accent' : 'text-neutral-400'}`}
                >
                  <List size={16} />
                </button>
              </div>

              {/* Upload Button */}
              {currentTab !== 'Trash' && (
                <label className="flex items-center gap-2 bg-lime-accent hover:bg-lime-400 text-black font-extrabold px-4 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-lime-500/10 hover:shadow-lime-500/20 transition-all active:scale-95 text-xs select-none">
                  <UploadCloud size={16} />
                  Upload Media
                  <input 
                    type="file" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* ACTIVE UPLOAD LOADING BANNER */}
          {isUploading && (
            <div className="mb-6 bg-charcoal border border-neutral-800 text-white rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="bg-lime-accent/15 border border-lime-accent/30 p-2.5 rounded-xl text-lime-accent animate-bounce">
                  <UploadCloud size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Resumable Chunk Upload In Progress</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">{uploadStatusMsg}</p>
                </div>
              </div>
              <div className="flex-1 max-w-md w-full">
                <div className="flex justify-between text-xs font-semibold mb-1.5 text-neutral-300">
                  <span>Chunking Stream</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-lime-accent h-full transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {currentVisibleFiles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/50 dark:border-neutral-800 p-6 rounded-3xl mb-4 text-neutral-400">
                <Folder size={48} className="stroke-1" />
              </div>
              <h3 className="text-base font-bold">No files found</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                {searchQuery ? 'Try adjusting your search queries.' : 'Upload media or folders to start storing files safely.'}
              </p>
            </div>
          )}

          {/* GRID VIEW */}
          {viewMode === 'Grid' && currentVisibleFiles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentVisibleFiles.map((file) => {
                const isSelected = selectedFileIds.includes(file.id);
                return (
                  <div
                    key={file.id}
                    onClick={() => {
                      if (!currentUser) return;
                      const updated = files.map(f => f.id === file.id ? { ...f, access_count: f.access_count + 1, last_accessed: new Date().toISOString() } : f);
                      setFiles(updated);
                      localDB.saveFiles(currentUser.id, updated);
                      setPreviewFile({ ...file, access_count: file.access_count + 1, last_accessed: new Date().toISOString() });
                    }}
                    className={`group relative bg-white dark:bg-charcoal border rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-lime-500/5 select-none ${
                      isSelected 
                        ? 'border-lime-accent shadow-md shadow-lime-500/10' 
                        : 'border-neutral-200/80 dark:border-neutral-800/80'
                    }`}
                  >
                    {/* Media Preview Box */}
                    <div className="h-44 bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center relative overflow-hidden border-b border-neutral-100 dark:border-neutral-800/60">
                      {/* Selection checkbox */}
                      <div 
                        className={`absolute top-3 left-3 z-10 p-1 bg-black/60 backdrop-blur-md rounded-lg transition-opacity duration-200 border border-white/10 ${
                          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                        onClick={(e) => { e.stopPropagation(); handleToggleSelectFile(file.id, e as any); }}
                      >
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => {}} // handled by onClick
                          className="w-3.5 h-3.5 rounded border-neutral-600 text-lime-accent focus:ring-lime-accent cursor-pointer"
                        />
                      </div>

                      {file.thumbnail ? (
                        <img 
                          src={file.thumbnail} 
                          alt={file.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-neutral-400 group-hover:scale-110 transition-transform duration-200">
                          {getFileIcon(file.type)}
                        </div>
                      )}

                      {/* Storage tier tag overlay */}
                      <div className="absolute bottom-3 left-3">
                        {getTierIcon(file.storage_tier)}
                      </div>

                      {/* Favorites/Star button */}
                      {!file.is_trashed && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleFavorite(file.id); }}
                          className={`absolute top-3 right-3 p-1.5 rounded-lg backdrop-blur-md transition-all duration-200 shadow ${
                            file.is_favorite 
                              ? 'bg-lime-accent text-black scale-100' 
                              : 'bg-black/40 text-neutral-300 hover:text-white opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <Star size={14} className={file.is_favorite ? 'fill-black' : ''} />
                        </button>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="p-4">
                      <h4 className="text-sm font-bold truncate pr-6 text-neutral-900 dark:text-neutral-100" title={file.name}>
                        {file.name}
                      </h4>
                      <div className="flex justify-between items-center mt-2 text-xs text-neutral-400 font-semibold">
                        <span>{formatSize(file.size)}</span>
                        <span>{new Date(file.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Hover actions block */}
                    <div className="absolute bottom-16 right-4 flex gap-1 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm p-1 rounded-xl shadow-lg border border-neutral-200/50 dark:border-neutral-800/60 opacity-0 group-hover:opacity-100 transition-opacity">
                      {file.is_trashed ? (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRestoreFile(file.id); }}
                            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-lime-accent rounded-lg transition-colors"
                            title="Restore"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePermanentDelete(file.id); }}
                            className="p-1.5 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"
                            title="Delete Permanently"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleShareFile(file); }}
                            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-lg transition-colors"
                            title="Share Reference"
                          >
                            <Share2 size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleTrashFile(file.id); }}
                            className="p-1.5 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"
                            title="Move to Trash"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode === 'List' && currentVisibleFiles.length > 0 && (
            <div className="bg-white dark:bg-charcoal border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-xs font-extrabold text-neutral-400 uppercase bg-neutral-50/50 dark:bg-neutral-900/50">
                    <th className="px-6 py-4 w-12">Select</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Storage Tier</th>
                    <th className="px-6 py-4">File Size</th>
                    <th className="px-6 py-4">Access Count</th>
                    <th className="px-6 py-4">Uploaded</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/50 text-sm font-semibold">
                  {currentVisibleFiles.map((file) => {
                    const isSelected = selectedFileIds.includes(file.id);
                    return (
                      <tr 
                        key={file.id}
                        onClick={() => {
                          if (!currentUser) return;
                          const updated = files.map(f => f.id === file.id ? { ...f, access_count: f.access_count + 1, last_accessed: new Date().toISOString() } : f);
                          setFiles(updated);
                          localDB.saveFiles(currentUser.id, updated);
                          setPreviewFile({ ...file, access_count: file.access_count + 1, last_accessed: new Date().toISOString() });
                        }}
                        className={`hover:bg-neutral-50 dark:hover:bg-neutral-900/30 cursor-pointer transition-colors ${
                          isSelected ? 'bg-lime-accent/5 dark:bg-lime-accent/5' : ''
                        }`}
                      >
                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={(e) => handleToggleSelectFile(file.id, e as any)}
                            className="rounded border-neutral-300 text-lime-accent focus:ring-lime-accent"
                          />
                        </td>
                        <td className="px-6 py-4 flex items-center gap-3">
                          {getFileIcon(file.type)}
                          <span className="truncate max-w-[240px] text-neutral-950 dark:text-neutral-100" title={file.name}>
                            {file.name}
                          </span>
                          {file.is_favorite && !file.is_trashed && (
                            <Star size={12} className="text-lime-accent fill-lime-accent" />
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getTierIcon(file.storage_tier)}
                        </td>
                        <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">
                          {formatSize(file.size)}
                        </td>
                        <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">
                          {file.access_count}
                        </td>
                        <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">
                          {new Date(file.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {file.is_trashed ? (
                              <>
                                <button 
                                  onClick={() => handleRestoreFile(file.id)}
                                  className="p-1.5 hover:bg-lime-accent/10 text-lime-accent rounded-lg transition-colors"
                                  title="Restore File"
                                >
                                  <Plus size={14} />
                                </button>
                                <button 
                                  onClick={() => handlePermanentDelete(file.id)}
                                  className="p-1.5 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"
                                  title="Delete Permanently"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleToggleFavorite(file.id)}
                                  className={`p-1.5 rounded-lg transition-colors ${file.is_favorite ? 'text-lime-accent hover:bg-lime-accent/10' : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                                  title="Star/Favorite"
                                >
                                  <Star size={14} className={file.is_favorite ? 'fill-lime-accent' : ''} />
                                </button>
                                <button 
                                  onClick={() => handleShareFile(file)}
                                  className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-black dark:hover:text-white rounded-lg transition-colors"
                                  title="Share Link"
                                >
                                  <Share2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleTrashFile(file.id)}
                                  className="p-1.5 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"
                                  title="Move to Trash"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>

      {/* SHARE MODAL */}
      <AnimatePresence>
        {shareLink && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-charcoal text-white rounded-3xl p-8 max-w-md w-full border border-neutral-800 shadow-2xl"
            >
              <h3 className="text-lg font-bold">Secure Public Storage Link</h3>
              <p className="text-xs text-neutral-400 mt-1">This link allows read access to the deduplicated cloud resource reference.</p>
              
              <div className="flex gap-2 items-center bg-neutral-900 border border-neutral-800 p-3 rounded-2xl mt-5">
                <input 
                  type="text" 
                  value={shareLink} 
                  readOnly 
                  className="bg-transparent text-xs flex-1 outline-none text-lime-accent font-mono select-all"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    alert('Copied to clipboard!');
                  }}
                  className="bg-lime-accent hover:bg-lime-400 text-black p-2 rounded-xl active:scale-95 transition-all"
                  title="Copy URL"
                >
                  <Copy size={14} />
                </button>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShareLink(null)}
                  className="px-5 py-2.5 border border-neutral-800 hover:bg-neutral-800 rounded-xl text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPGRADE PRO MODAL */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-charcoal text-white rounded-3xl p-8 max-w-md w-full border border-neutral-800 shadow-2xl text-center relative overflow-hidden"
            >
              {/* Glow accent */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="w-16 h-16 bg-lime-accent/10 border border-lime-accent/25 rounded-2xl flex items-center justify-center text-lime-accent mx-auto mb-4">
                <Zap size={32} />
              </div>

              <h3 className="text-xl font-black">Upgrade to DaddyKart Pro</h3>
              <p className="text-xs text-neutral-400 mt-2 max-w-sm mx-auto">
                Your Free plan has a hard 10GB storage limit and compresses uploads to 60% quality to conserve server resources.
              </p>

              {/* Pricing comparison */}
              <div className="my-6 text-left bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-start gap-2.5 text-xs text-neutral-300">
                  <span className="text-lime-accent">✓</span>
                  <div>
                    <span className="font-bold text-white">Unlimited Cloud Storage</span>
                    <p className="text-[10px] text-neutral-400">Zero limits, store your full media catalog.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-neutral-300">
                  <span className="text-lime-accent">✓</span>
                  <div>
                    <span className="font-bold text-white">Bypass Smart Compression</span>
                    <p className="text-[10px] text-neutral-400">Files stored in 100% full original quality.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-neutral-300">
                  <span className="text-lime-accent">✓</span>
                  <div>
                    <span className="font-bold text-white">Priority Storage Tiering</span>
                    <p className="text-[10px] text-neutral-400">Instantly fetch from cold and frozen tiers.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3.5">
                <button
                  onClick={handleUpgradeToPro}
                  className="w-full bg-lime-accent hover:bg-lime-400 text-black font-extrabold text-sm py-3 px-4 rounded-xl transition-all shadow-lg shadow-lime-500/10 active:scale-98"
                >
                  Upgrade Instantly for $9/mo
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full py-3 px-4 border border-neutral-800 hover:bg-neutral-800 text-xs font-bold rounded-xl transition-colors text-neutral-400 hover:text-white"
                >
                  Cancel & Keep Free Plan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILE PREVIEW MODAL */}
      <AnimatePresence>
        {previewFile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-950/95 backdrop-blur-md z-50 flex flex-col justify-between select-none"
            onClick={() => setPreviewFile(null)}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
              <div className="flex items-center gap-3">
                <div className="text-lime-accent">
                  {getFileIcon(previewFile.type)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-100 max-w-[200px] sm:max-w-[400px] truncate" title={previewFile.name}>
                    {previewFile.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-neutral-400 font-mono font-semibold">{formatSize(previewFile.size)}</span>
                    <span className="w-1 h-1 rounded-full bg-neutral-600" />
                    <span className="text-[10px] text-neutral-400 font-mono font-semibold">Tier: {previewFile.storage_tier}</span>
                    {previewFile && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-neutral-600" />
                        <span className="text-[10px] text-lime-accent font-mono font-semibold">
                          File {currentVisibleFiles.findIndex(f => f.id === previewFile.id) + 1} of {currentVisibleFiles.length}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setPreviewFile(null)}
                className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white"
                title="Close Preview"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Content Area with Navigation Arrows */}
            <div className="flex-1 w-full flex items-center justify-center relative px-4 md:px-20 py-4 bg-neutral-950/20" onClick={(e) => e.stopPropagation()}>
              {/* Left Arrow Button */}
              {currentVisibleFiles.findIndex(f => f.id === previewFile.id) > 0 && (
                <button 
                  onClick={handlePrevFile}
                  className="absolute left-4 md:left-8 p-3.5 bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800/40 rounded-full text-white backdrop-blur hover:scale-105 active:scale-95 transition-all z-10 cursor-pointer"
                  title="Previous File"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {/* File Preview Display */}
              <div className="w-full h-full max-h-[70vh] flex items-center justify-center">
                {previewFile.thumbnail ? (
                  <img 
                    src={previewFile.thumbnail} 
                    alt={previewFile.name} 
                    className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl border border-neutral-900/40 select-none animate-[fadeIn_0.15s_ease-out]"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="bg-neutral-900 border border-neutral-800/80 p-8 rounded-[2rem] text-neutral-400 shadow-xl relative overflow-hidden">
                      <div className="absolute -top-12 -left-12 w-24 h-24 bg-lime-500/5 rounded-full blur-xl pointer-events-none" />
                      <div className="scale-[1.8] inline-block">{getFileIcon(previewFile.type)}</div>
                    </div>
                    <span className="text-xs text-neutral-400 uppercase tracking-widest font-mono pt-2">No Preview Available</span>
                  </div>
                )}
              </div>

              {/* Right Arrow Button */}
              {currentVisibleFiles.findIndex(f => f.id === previewFile.id) !== -1 && 
               currentVisibleFiles.findIndex(f => f.id === previewFile.id) < currentVisibleFiles.length - 1 && (
                <button 
                  onClick={handleNextFile}
                  className="absolute right-4 md:right-8 p-3.5 bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800/40 rounded-full text-white backdrop-blur hover:scale-105 active:scale-95 transition-all z-10 cursor-pointer"
                  title="Next File"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {/* Footer controls and stats */}
            <div className="px-6 py-4 bg-neutral-950 border-t border-neutral-900 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 z-10" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-6 text-xs text-neutral-400 font-semibold max-md:justify-between">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider">Uploaded</span>
                  <p className="text-neutral-200 mt-0.5">{new Date(previewFile.created_at).toLocaleDateString()}</p>
                </div>
                <div className="w-[1px] h-6 bg-neutral-800 hidden md:block" />
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider">Access Stats</span>
                  <p className="text-neutral-200 mt-0.5">{previewFile.access_count} access hits</p>
                </div>
                <div className="w-[1px] h-6 bg-neutral-800 hidden md:block" />
                <div className="truncate max-w-[200px]">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono tracking-wider">Storage Path</span>
                  <p className="text-neutral-200 mt-0.5 truncate font-mono text-[10px]">{previewFile.storage_path}</p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-2.5">
                <div className="flex items-center gap-2">
                  {/* Share Button */}
                  <button 
                    onClick={() => handleShareFile(previewFile)}
                    className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-extrabold px-4 py-2.5 rounded-xl transition-all active:scale-95 text-xs"
                    title="Share File Link"
                  >
                    <Share2 size={14} />
                    <span>Share</span>
                  </button>

                  {/* Favorite Button */}
                  <button 
                    onClick={() => {
                      handleToggleFavorite(previewFile.id);
                      setPreviewFile(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : null);
                    }}
                    className={`flex items-center gap-2 border font-extrabold px-4 py-2.5 rounded-xl transition-all active:scale-95 text-xs ${
                      previewFile.is_favorite 
                        ? 'bg-lime-accent/15 border-lime-accent text-lime-accent' 
                        : 'border-neutral-800 hover:bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    <Star size={14} className={previewFile.is_favorite ? 'fill-lime-accent text-lime-accent' : ''} />
                    <span>{previewFile.is_favorite ? 'Favorited' : 'Favorite'}</span>
                  </button>
                </div>

                {/* Trash Button */}
                <button 
                  onClick={() => {
                    handleTrashFile(previewFile.id);
                    setPreviewFile(null);
                  }}
                  className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-500 font-extrabold px-4 py-2.5 rounded-xl transition-all active:scale-95 text-xs"
                  title="Move to Trash"
                >
                  <Trash2 size={14} />
                  <span>Trash</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

/**
 * AuraTab Workspace - Dashboard Script
 * Implements high-performance mouse tracking, multi-playlist tracking engines, 
 * URL metadata resolution, and custom shortcut management.
 */

// 1. Motivational thoughts collection
const MOTIVATIONAL_QUOTES = [
  "Move fast with stable infrastructure.",
  "One elegant abstraction is worth ten thousand lines of boilerplate.",
  "Great systems aren't designed; they evolve through disciplined pruning.",
  "Simplicity is the ultimate sophistication in software architecture.",
  "Solve the problem first. Write the code second.",
  "Scale is a challenge of discipline and consistency, not just resources.",
  "Do not automate a process that should be deleted instead.",
  "Optimization before measurement is the root of all engineering waste.",
  "Clean code reads like well-written prose; design for the engineer who comes next.",
  "First, make it work. Then, make it right. Then, make it fast.",
  "Refactoring is not a chore; it is the hygiene of a healthy codebase.",
  "Every line of code you delete is a line you never have to debug or maintain.",
  "The best database query is the one you don't make.",
  "Design systems that fail gracefully. Resilience beats robustness."
];

// Time-of-Day Chrono greeting phrases (no emoji / names)
const getChronoGreeting = () => {
  const hour = new Date().getHours();
  
  const morning = [
    "Good morning. What's the project move?",
    "A fresh slate. What are we building today?",
    "System active. Define the morning milestone."
  ];
  
  const afternoon = [
    "Good afternoon. Reviewing active architectures?",
    "Midday check. What's the deployment target?",
    "Keep momentum high. What's the next step?"
  ];
  
  const evening = [
    "Good evening. Refining logic pipelines?",
    "Winding down. Let's commit final changes.",
    "Evening session. What's the current move?"
  ];
  
  const lateNight = [
    "Hustling late. What's the focus tonight?",
    "Midnight compile. Resolving constraints?",
    "Deep focus hours. What are we breaking down?"
  ];
  
  let list;
  if (hour >= 5 && hour < 12) {
    list = morning;
  } else if (hour >= 12 && hour < 17) {
    list = afternoon;
  } else if (hour >= 17 && hour < 22) {
    list = evening;
  } else {
    list = lateNight;
  }
  
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
};

// SVG Configuration Constants
const CIRCUMFERENCE = 534.07; // 2 * Math.PI * 85

// Default fallbacks
const defaultTracks = [
  { id: 'track-default-1', title: 'DSA Practice', completed: 12, total: 45, link: 'https://youtube.com/playlist?list=PL' }
];

const defaultShortcuts = [
  { 
    id: 'default-github', 
    name: 'GitHub', 
    url: 'https://github.com', 
    svg: `<svg class="shortcut-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>` 
  },
  { 
    id: 'default-leetcode', 
    name: 'LeetCode', 
    url: 'https://leetcode.com', 
    svg: `<svg class="shortcut-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M13.483 0a1.374 1.374 0 0 0-.961.414l-9.777 9.778a1.374 1.374 0 0 0 0 1.942l4 4a1.374 1.374 0 0 0 1.942 0l9.777-9.778A1.374 1.374 0 0 0 18.05 4L14.444.414A1.374 1.374 0 0 0 13.483 0zm-8.81 11.233L13.483 2.41 16.59 5.518l-8.81 8.81z" /><path d="M4.707 19.293a1 1 0 0 1 0-1.414l2.5-2.5a1 1 0 1 1 1.414 1.414l-2.5 2.5a1 1 0 0 1-1.414 0zm10-10a1 1 0 0 1 0-1.414l2.5-2.5a1 1 0 1 1 1.414 1.414l-2.5 2.5a1 1 0 0 1-1.414 0z" /></svg>` 
  },
  { 
    id: 'default-youtube', 
    name: 'YouTube', 
    url: 'https://youtube.com', 
    svg: `<svg class="shortcut-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>` 
  }
];

// 2. Storage Helper Framework (Caches directly to localStorage for instant persistence, fallbacks to extension storage)
const db = {
  async get(key, fallback) {
    try {
      const localVal = localStorage.getItem(key);
      if (localVal !== null) {
        return JSON.parse(localVal);
      }
      
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.get([key], (result) => {
            resolve(result[key] !== undefined ? result[key] : fallback);
          });
        });
      }
      return fallback;
    } catch (e) {
      console.warn("Storage fetch error, loading fallback.", e);
      return fallback;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.set({ [key]: value }, () => {
            resolve();
          });
        });
      }
    } catch (e) {
      console.error("Storage write error.", e);
    }
  }
};

// 3. Smooth Mouse Glow Tracker (lerp logic)
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let currentX = mouseX;
let currentY = mouseY;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
}, { passive: true });

window.addEventListener('resize', () => {
  mouseX = Math.min(Math.max(mouseX, 0), window.innerWidth);
  mouseY = Math.min(Math.max(mouseY, 0), window.innerHeight);
});

let isZenModeActive = false;

function animateGlow() {
  if (isZenModeActive) {
    requestAnimationFrame(animateGlow);
    return;
  }
  const ease = 0.08;
  currentX += (mouseX - currentX) * ease;
  currentY += (mouseY - currentY) * ease;

  const width = window.innerWidth || 1;
  const height = window.innerHeight || 1;
  const percentX = (currentX / width) * 100;
  const percentY = (currentY / height) * 100;

  document.documentElement.style.setProperty('--mouse-x', `${percentX.toFixed(2)}%`);
  document.documentElement.style.setProperty('--mouse-y', `${percentY.toFixed(2)}%`);

  requestAnimationFrame(animateGlow);
}
requestAnimationFrame(animateGlow);

// Helper to parse YouTube playlist IDs
const parsePlaylistId = (str) => {
  const match = str.match(/[&?]list=([^&]+)/);
  if (match) return match[1];
  if (/^PL[a-zA-Z0-9_-]{16,32}$/.test(str)) return str;
  return null;
};

// YouTube Playlist metadata resolver (CORS proxy wrapper + Regex parser)
const fetchPlaylistCount = async (playlistId) => {
  try {
    const targetUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
    const proxyUrl = `https://corsproxy.io/?` + encodeURIComponent(targetUrl);
    
    // 8-second timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(proxyUrl, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Regex scanning targeting: "totalVideos":(\d+) OR "videoCount":"(\d+)"
    const totalVideosMatch = html.match(/"totalVideos"\s*:\s*(\d+)/);
    const videoCountMatch = html.match(/"videoCount"\s*:\s*"(\d+)"/);
    
    let total = null;
    if (totalVideosMatch) {
      total = parseInt(totalVideosMatch[1], 10);
    } else if (videoCountMatch) {
      total = parseInt(videoCountMatch[1], 10);
    }
    
    if (!total || isNaN(total)) {
      throw new Error("Could not parse playlist video count from HTML payload.");
    }
    
    // Extract title from metadata
    let title = "YouTube Playlist";
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) || 
                       html.match(/<meta\s+name="title"\s+content="([^"]+)"/i) ||
                       html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
      title = titleMatch[1].replace(/ - YouTube$/i, '').trim();
    }
    
    return {
      title,
      total
    };
  } catch (error) {
    console.error("Scraper logic failed, executing fallback popup handler:", error);
    return null;
  }
};

// Helper to fetch favicon domain safely
const getFaviconUrl = (urlStr) => {
  try {
    const url = new URL(urlStr);
    return `https://www.google.com/s2/favicons?sz=32&domain=${url.hostname}`;
  } catch (e) {
    return '';
  }
};

// Helper to format custom URL submissions
const formatUrl = (url) => {
  let trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('chrome://') && !trimmed.startsWith('file://')) {
    trimmed = 'https://' + trimmed;
  }
  return trimmed;
};

// 4. Initializing Extension Dashboard and Interactions
const initDashboard = async () => {
  // Immediately render chrono-greeting to prevent layout shift or text flicker
  const greetingEl = document.getElementById('dashboard-greeting');
  if (greetingEl) {
    greetingEl.textContent = getChronoGreeting();
  }

  // Select DOM Nodes
  const quoteBox = document.getElementById('quote-box');
  const sidebar = document.getElementById('tracks-sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const tracksList = document.getElementById('tracks-list');
  const addTrackBtn = document.getElementById('add-track-btn');
  
  // Track creation modal selectors
  const trackModal = document.getElementById('track-modal');
  const trackNameInput = document.getElementById('track-name-input');
  const trackUrlInput = document.getElementById('track-url-input');
  const trackTotalInputContainer = document.getElementById('track-total-input-container');
  const trackTotalInput = document.getElementById('track-total-input');
  const trackCancelBtn = document.getElementById('track-cancel-btn');
  const trackSaveBtn = document.getElementById('track-save-btn');
  
  const shortcutsGrid = document.getElementById('shortcuts-grid');
  const shortcutModal = document.getElementById('shortcut-modal');
  const shortcutNameInput = document.getElementById('shortcut-name-input');
  const shortcutUrlInput = document.getElementById('shortcut-url-input');
  const shortcutCancelBtn = document.getElementById('shortcut-cancel-btn');
  const shortcutSaveBtn = document.getElementById('shortcut-save-btn');

  // Multi-Theme & Space Matrix Toggles
  const themeToggle = document.getElementById('theme-toggle');
  const matrixButtons = document.querySelectorAll('.matrix-btn');

  // Command Palette DOM Selectors
  const commandPaletteModal = document.getElementById('command-palette-modal');
  const commandPaletteInput = document.getElementById('command-palette-input');
  const commandPaletteResults = document.getElementById('command-palette-results');

  // State arrays & parameters
  let tracks = await db.get('aura_tracks', defaultTracks);
  let activeTrackId = await db.get('aura_active_track', 'track-default-1');
  let customShortcuts = await db.get('aura_shortcuts', []);
  let activeThemeMode = await db.get('aura_theme_mode', 'dark'); // 'dark' | 'light'
  let activeGradientGlow = await db.get('aura_gradient_glow', 'theme-deep-cosmic');

  let pendingTrack = null; // Stash title details during fallback input sequence

  // Theme application logic
  const applyTheme = (mode, glow) => {
    if (mode === 'light') {
      document.body.classList.add('light-mode');
      document.querySelector('.sun-icon')?.classList.remove('hidden');
      document.querySelector('.moon-icon')?.classList.add('hidden');
    } else {
      document.body.classList.remove('light-mode');
      document.querySelector('.sun-icon')?.classList.add('hidden');
      document.querySelector('.moon-icon')?.classList.remove('hidden');
    }

    // Strip existing gradient matrix classes
    document.body.classList.remove('theme-deep-cosmic', 'theme-matrix-neon', 'theme-sunset-crimson', 'theme-slate-studio');
    document.body.classList.add(glow);

    // Sync active dot in control buttons
    matrixButtons.forEach(btn => {
      if (btn.dataset.theme === glow) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  };

  // Set default initial theme states
  applyTheme(activeThemeMode, activeGradientGlow);

  // Toggle Light / Dark Mode
  themeToggle.addEventListener('click', async () => {
    activeThemeMode = document.body.classList.contains('light-mode') ? 'dark' : 'light';
    await db.set('aura_theme_mode', activeThemeMode);
    applyTheme(activeThemeMode, activeGradientGlow);
  });

  // Switch Gradient Matrix themes
  matrixButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      activeGradientGlow = e.currentTarget.dataset.theme;
      await db.set('aura_gradient_glow', activeGradientGlow);
      applyTheme(activeThemeMode, activeGradientGlow);
    });
  });

  // Renders motivational quote
  const selectRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    quoteBox.textContent = `“${MOTIVATIONAL_QUOTES[randomIndex]}”`;
  };
  selectRandomQuote();

  // Sidebar slide toggle logic (mobile devices)
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Render Sidebar Track Elements with mini circular progress SVG chart
  const renderTracks = () => {
    tracksList.innerHTML = '';
    
    tracks.forEach(track => {
      const card = document.createElement('div');
      card.className = `track-card ${track.id === activeTrackId ? 'active' : ''}`;
      card.dataset.id = track.id;
      
      const percent = Math.round((track.completed / track.total) * 100);
      
      // Circumference of mini circle: 2 * Math.PI * 14 = 87.96
      const miniCircumference = 87.96;
      const strokeDashoffset = miniCircumference - (percent / 100) * miniCircumference;
      
      card.innerHTML = `
        <div class="mini-chart-wrapper" style="position: relative; width: 36px; height: 36px; flex-shrink: 0;" title="Left-click chart to increment, Right-click card to clear progress">
          <svg width="36" height="36" viewBox="0 0 36 36" style="transform: rotate(-90deg); transform-origin: 50% 50%;">
            <circle cx="18" cy="18" r="14" fill="transparent" stroke="rgba(255, 255, 255, 0.05)" stroke-width="3.5" />
            <circle class="mini-progress-fill" cx="18" cy="18" r="14" fill="transparent" stroke="var(--accent-color)" stroke-width="3.5" stroke-dasharray="${miniCircumference}" stroke-dashoffset="${strokeDashoffset}" stroke-linecap="round" />
          </svg>
          <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-size: 8px; font-weight: 700; color: var(--text-primary);">
            ${percent}%
          </div>
        </div>
        
        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 0.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
            <a href="${track.link || '#'}" target="_blank" class="track-title-link" title="Open YouTube Playlist">
              ${track.title}
            </a>
            <button class="track-delete-btn" title="Delete Track" data-id="${track.id}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
          <div class="track-meta">
            <span>${track.completed} / ${track.total} vids</span>
          </div>
        </div>
      `;
      
      // Select Track Card click swaps active highlighted track
      card.addEventListener('click', (e) => {
        // Prevent trigger if clicking delete, title link, or mini-chart
        if (e.target.closest('.track-delete-btn') || e.target.closest('.track-title-link') || e.target.closest('.mini-chart-wrapper')) return;
        setActiveTrack(track.id);
      });
      
      // Left click on miniature SVG chart increments completions count
      const miniChart = card.querySelector('.mini-chart-wrapper');
      miniChart.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (activeTrackId !== track.id) {
          setActiveTrack(track.id);
        }
        if (track.completed < track.total) {
          track.completed += 1;
          await db.set('aura_tracks', tracks);
          renderTracks();
          updateCentralProgress();
        }
      });
      
      // Right-Click on track card resets completions to 0
      card.addEventListener('contextmenu', async (e) => {
        e.preventDefault();
        if (e.target.closest('.track-delete-btn') || e.target.closest('.track-title-link')) return;
        
        track.completed = 0;
        await db.set('aura_tracks', tracks);
        renderTracks();
        updateCentralProgress();
      });
      
      // Delete Track click
      card.querySelector('.track-delete-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        tracks = tracks.filter(t => t.id !== track.id);
        await db.set('aura_tracks', tracks);
        
        // Handle deletion of active track
        if (activeTrackId === track.id) {
          activeTrackId = tracks.length > 0 ? tracks[0].id : '';
          await db.set('aura_active_track', activeTrackId);
        }
        
        renderTracks();
        updateCentralProgress();
      });

      tracksList.appendChild(card);
    });
  };

  // Set active track ID and redraw UI
  const setActiveTrack = (id) => {
    activeTrackId = id;
    db.set('aura_active_track', id);
    renderTracks();
    updateCentralProgress();
  };

  // Redraw progress updates safely (keeping central code framework intact but decoupled from DOM changes)
  const updateCentralProgress = () => {
    const active = tracks.find(t => t.id === activeTrackId);
    
    // Safely check for any central progress elements if needed in future spatial mockups
    const progressVal = document.getElementById('progress-val');
    const progressTotalText = document.querySelector('.progress-total');
    const progressLabel = document.querySelector('.progress-label');
    const progressFillArc = document.getElementById('progress-fill-arc');
    
    if (progressVal) progressVal.textContent = active ? active.completed : '0';
    if (progressTotalText) progressTotalText.textContent = active ? active.total : '0';
    if (progressLabel) progressLabel.textContent = active ? active.title : 'add track';
    
    if (progressFillArc) {
      if (!active) {
        progressFillArc.style.strokeDashoffset = CIRCUMFERENCE;
      } else {
        const fraction = active.completed / active.total;
        const offset = CIRCUMFERENCE - (fraction * CIRCUMFERENCE);
        progressFillArc.style.strokeDashoffset = offset;
      }
    }
  };

  // Reset Track Adding Input forms
  const resetTrackForm = () => {
    trackModal.classList.add('hidden');
    trackNameInput.value = '';
    trackNameInput.disabled = false;
    trackUrlInput.value = '';
    trackUrlInput.disabled = false;
    trackTotalInput.value = '';
    trackTotalInputContainer.classList.add('hidden');
    pendingTrack = null;
  };

  // Add Track Button displays the minimal modal overlay
  addTrackBtn.addEventListener('click', () => {
    trackModal.classList.remove('hidden');
    trackNameInput.focus();
  });

  // Cancel form click
  trackCancelBtn.addEventListener('click', (e) => {
    e.preventDefault();
    resetTrackForm();
  });

  // Form submission handler (collects both name input and target URL)
  trackSaveBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const nameStr = trackNameInput.value.trim();
    const urlStr = trackUrlInput.value.trim();
    
    if (!nameStr && !urlStr) return;

    // Handle manual entry fallback flow (when total tasks are prompted)
    if (!trackTotalInputContainer.classList.contains('hidden')) {
      const total = parseInt(trackTotalInput.value.trim());
      if (isNaN(total) || total <= 0) {
        trackTotalInput.focus();
        return;
      }

      const newTrack = {
        id: 'track-' + Date.now(),
        title: nameStr || pendingTrack?.title || 'Custom Track',
        completed: 0,
        total: total,
        link: urlStr ? formatUrl(urlStr) : (pendingTrack ? pendingTrack.link : '')
      };

      tracks.push(newTrack);
      await db.set('aura_tracks', tracks);
      resetTrackForm();
      setActiveTrack(newTrack.id);
      return;
    }

    // Try parsing as playlist link
    const playlistId = parsePlaylistId(urlStr);
    if (playlistId) {
      trackSaveBtn.textContent = 'Fetching...';
      trackSaveBtn.disabled = true;

      const metadata = await fetchPlaylistCount(playlistId);

      trackSaveBtn.textContent = 'Add';
      trackSaveBtn.disabled = false;

      if (metadata) {
        const newTrack = {
          id: 'track-' + Date.now(),
          title: nameStr || metadata.title,
          completed: 0,
          total: metadata.total,
          link: urlStr.startsWith('http') ? urlStr : `https://youtube.com/playlist?list=${playlistId}`
        };

        tracks.push(newTrack);
        await db.set('aura_tracks', tracks);
        resetTrackForm();
        setActiveTrack(newTrack.id);
      } else {
        // Fallback popup input helper for dead links or proxy network timeouts
        pendingTrack = {
          title: nameStr || 'YouTube Playlist',
          link: urlStr.startsWith('http') ? urlStr : `https://youtube.com/playlist?list=${playlistId}`
        };
        trackNameInput.disabled = true;
        trackUrlInput.disabled = true;
        trackTotalInputContainer.classList.remove('hidden');
        trackTotalInput.focus();
      }
    } else {
      // It is a custom tracking task (e.g. "Leetcode DSA")
      pendingTrack = {
        title: nameStr || urlStr,
        link: urlStr ? formatUrl(urlStr) : ''
      };
      trackNameInput.disabled = true;
      trackUrlInput.disabled = true;
      trackTotalInputContainer.classList.remove('hidden');
      trackTotalInput.focus();
    }
  });

  // Close modal when clicking on backdrop
  trackModal.addEventListener('click', (e) => {
    if (e.target === trackModal) {
      resetTrackForm();
    }
  });

  // Render Shortcut capsule buttons
  const renderShortcuts = () => {
    // Clear dynamic shortcuts container
    shortcutsGrid.innerHTML = '';

    // Append Default Slots
    defaultShortcuts.forEach(item => {
      const link = document.createElement('a');
      link.href = item.url;
      link.target = '_blank';
      link.className = 'shortcut-capsule';
      link.id = item.id;
      link.innerHTML = `${item.svg}<span>${item.name}</span>`;
      shortcutsGrid.appendChild(link);
    });

    // Append Custom Slots
    customShortcuts.forEach(item => {
      const link = document.createElement('a');
      link.href = item.url;
      link.target = '_blank';
      link.className = 'shortcut-capsule';
      link.id = `shortcut-custom-${item.id}`;
      
      const iconUrl = getFaviconUrl(item.url);
      const iconHtml = iconUrl 
        ? `<img src="${iconUrl}" width="16" height="16" class="shortcut-icon" alt="" style="border-radius: 2px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline'"/>
           <svg class="shortcut-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="display:none;"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`
        : `<svg class="shortcut-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`;

      link.innerHTML = `
        ${iconHtml}
        <span>${item.name}</span>
        <button class="shortcut-delete" title="Delete Shortcut" data-id="${item.id}">&times;</button>
      `;
      
      // Delete button listener
      link.querySelector('.shortcut-delete').addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        customShortcuts = customShortcuts.filter(s => s.id !== item.id);
        await db.set('aura_shortcuts', customShortcuts);
        renderShortcuts();
      });

      shortcutsGrid.appendChild(link);
    });

    // Append the "+" custom capsule trigger
    const addShortcutBtn = document.createElement('button');
    addShortcutBtn.className = 'shortcut-capsule add-shortcut-btn';
    addShortcutBtn.id = 'add-shortcut-trigger';
    addShortcutBtn.innerHTML = `
      <svg class="shortcut-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      <span>Add</span>
    `;
    
    addShortcutBtn.addEventListener('click', () => {
      shortcutModal.classList.remove('hidden');
      shortcutNameInput.focus();
    });
    
    shortcutsGrid.appendChild(addShortcutBtn);
  };

  // Close shortcuts modal on cancel
  shortcutCancelBtn.addEventListener('click', () => {
    shortcutModal.classList.add('hidden');
    shortcutNameInput.value = '';
    shortcutUrlInput.value = '';
  });

  // Save custom shortcuts handler
  shortcutSaveBtn.addEventListener('click', async () => {
    const name = shortcutNameInput.value.trim();
    const rawUrl = shortcutUrlInput.value.trim();

    if (!name || !rawUrl) return;

    const formatted = formatUrl(rawUrl);
    const newShortcut = {
      id: 'shortcut-' + Date.now(),
      name: name,
      url: formatted
    };

    customShortcuts.push(newShortcut);
    await db.set('aura_shortcuts', customShortcuts);
    
    // Reset modal and inputs
    shortcutModal.classList.add('hidden');
    shortcutNameInput.value = '';
    shortcutUrlInput.value = '';

    renderShortcuts();
  });

  // Close modal when clicking on backdrop
  shortcutModal.addEventListener('click', (e) => {
    if (e.target === shortcutModal) {
      shortcutCancelBtn.click();
    }
  });

  // ==========================================
  // COMMAND PALETTE LOGIC
  // ==========================================

  // Palette Commands Definition
  const PALETTE_COMMANDS = [
    {
      id: 'cmd-zen',
      title: '/zen',
      type: 'command',
      execute: () => {
        enterZenMode();
      }
    },
    { 
      id: 'cmd-cosmic', 
      title: '/theme cosmic', 
      type: 'command', 
      execute: async () => { 
        activeGradientGlow = 'theme-deep-cosmic'; 
        await db.set('aura_gradient_glow', 'theme-deep-cosmic'); 
        applyTheme(activeThemeMode, 'theme-deep-cosmic'); 
      } 
    },
    { 
      id: 'cmd-matrix', 
      title: '/theme matrix', 
      type: 'command', 
      execute: async () => { 
        activeGradientGlow = 'theme-matrix-neon'; 
        await db.set('aura_gradient_glow', 'theme-matrix-neon'); 
        applyTheme(activeThemeMode, 'theme-matrix-neon'); 
      } 
    },
    { 
      id: 'cmd-sunset', 
      title: '/theme sunset', 
      type: 'command', 
      execute: async () => { 
        activeGradientGlow = 'theme-sunset-crimson'; 
        await db.set('aura_gradient_glow', 'theme-sunset-crimson'); 
        applyTheme(activeThemeMode, 'theme-sunset-crimson'); 
      } 
    },
    { 
      id: 'cmd-slate', 
      title: '/theme slate', 
      type: 'command', 
      execute: async () => { 
        activeGradientGlow = 'theme-slate-studio'; 
        await db.set('aura_gradient_glow', 'theme-slate-studio'); 
        applyTheme(activeThemeMode, 'theme-slate-studio'); 
      } 
    }
  ];

  let zenClockInterval = null;

  const updateZenClock = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const clockEl = document.getElementById('zen-clock');
    if (clockEl) {
      clockEl.textContent = `${hours}:${minutes}`;
    }
  };

  const enterZenMode = () => {
    isZenModeActive = true;
    document.body.classList.add('zen-active');
    const zenOverlay = document.getElementById('zen-overlay');
    if (zenOverlay) {
      zenOverlay.classList.remove('hidden');
      void zenOverlay.offsetWidth;
      zenOverlay.classList.add('active');
    }
    updateZenClock();
    zenClockInterval = setInterval(updateZenClock, 1000);
  };

  const exitZenMode = () => {
    isZenModeActive = false;
    document.body.classList.remove('zen-active');
    const zenOverlay = document.getElementById('zen-overlay');
    if (zenOverlay) {
      zenOverlay.classList.remove('active');
      setTimeout(() => {
        if (!isZenModeActive) {
          zenOverlay.classList.add('hidden');
        }
      }, 600);
    }
    if (zenClockInterval) {
      clearInterval(zenClockInterval);
      zenClockInterval = null;
    }
  };

  let filteredItems = [];
  let selectedIndex = -1;

  const openCommandPalette = () => {
    commandPaletteModal.classList.remove('hidden');
    commandPaletteInput.value = '';
    commandPaletteInput.focus();
    renderPaletteResults('');
  };

  const closeCommandPalette = () => {
    commandPaletteModal.classList.add('hidden');
    commandPaletteInput.value = '';
    commandPaletteResults.innerHTML = '';
    filteredItems = [];
    selectedIndex = -1;
  };

  const getPaletteResults = (query) => {
    const term = query.toLowerCase().trim();
    const results = [];

    // 1. Match Commands
    if (term.startsWith('/') || term === '') {
      PALETTE_COMMANDS.forEach(cmd => {
        if (cmd.title.toLowerCase().includes(term)) {
          results.push({
            id: cmd.id,
            title: cmd.title,
            type: 'command',
            execute: cmd.execute
          });
        }
      });
    }

    // 2. Match Custom Shortcuts
    customShortcuts.forEach(sc => {
      if (sc.name.toLowerCase().includes(term) || sc.url.toLowerCase().includes(term)) {
        results.push({
          id: sc.id,
          title: sc.name,
          type: 'shortcut',
          execute: () => window.open(sc.url, '_blank')
        });
      }
    });

    // 3. Match Default Shortcuts
    defaultShortcuts.forEach(sc => {
      if (sc.name.toLowerCase().includes(term) || sc.url.toLowerCase().includes(term)) {
        results.push({
          id: sc.id,
          title: sc.name,
          type: 'shortcut',
          execute: () => window.open(sc.url, '_blank')
        });
      }
    });

    // 4. Match Playlist Tracks
    tracks.forEach(track => {
      if (track.title.toLowerCase().includes(term)) {
        results.push({
          id: track.id,
          title: track.title,
          type: 'track',
          execute: () => setActiveTrack(track.id)
        });
      }
    });

    return results;
  };

  const renderPaletteResults = (query) => {
    filteredItems = getPaletteResults(query);
    selectedIndex = filteredItems.length > 0 ? 0 : -1;
    
    commandPaletteResults.innerHTML = '';
    
    filteredItems.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = `command-palette-item ${index === selectedIndex ? 'active' : ''}`;
      itemEl.dataset.index = index;
      
      const typeLabel = item.type === 'command' ? 'Command' : (item.type === 'track' ? 'Track' : 'Shortcut');
      
      itemEl.innerHTML = `
        <span class="item-title">${item.title}</span>
        <span class="item-type">${typeLabel}</span>
      `;
      
      itemEl.addEventListener('click', () => {
        item.execute();
        closeCommandPalette();
      });
      
      commandPaletteResults.appendChild(itemEl);
    });
  };

  const updateActiveItem = () => {
    const items = commandPaletteResults.querySelectorAll('.command-palette-item');
    items.forEach((item, index) => {
      if (index === selectedIndex) {
        item.classList.add('active');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });
  };

  // Keyboard navigation & parsing listeners inside palette
  commandPaletteInput.addEventListener('input', (e) => {
    renderPaletteResults(e.target.value);
  });

  commandPaletteInput.addEventListener('keydown', async (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredItems.length === 0) return;
      selectedIndex = (selectedIndex + 1) % filteredItems.length;
      updateActiveItem();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredItems.length === 0) return;
      selectedIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
      updateActiveItem();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const val = commandPaletteInput.value.trim().toLowerCase();
      
      // Parse direct user typing commands immediately
      if (val === '/zen') {
        enterZenMode();
        closeCommandPalette();
        return;
      }
      
      if (val.startsWith('/theme ')) {
        const themeName = val.replace('/theme ', '').trim();
        let targetTheme = '';
        if (themeName === 'cosmic') targetTheme = 'theme-deep-cosmic';
        else if (themeName === 'matrix') targetTheme = 'theme-matrix-neon';
        else if (themeName === 'sunset') targetTheme = 'theme-sunset-crimson';
        else if (themeName === 'slate') targetTheme = 'theme-slate-studio';

        if (targetTheme) {
          activeGradientGlow = targetTheme;
          await db.set('aura_gradient_glow', targetTheme);
          applyTheme(activeThemeMode, targetTheme);
        }
        closeCommandPalette();
        return;
      }
      
      if (selectedIndex >= 0 && selectedIndex < filteredItems.length) {
        filteredItems[selectedIndex].execute();
        closeCommandPalette();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeCommandPalette();
    }
  });

  // Global Keydown "/" listener to trigger Command Palette & "Escape" for Zen Mode exit
  document.addEventListener('keydown', (e) => {
    if (isZenModeActive && e.key === 'Escape') {
      e.preventDefault();
      exitZenMode();
      return;
    }
    
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    if (e.key === '/') {
      e.preventDefault();
      openCommandPalette();
    }
  });

  // Close palette if user clicks backdrop
  commandPaletteModal.addEventListener('click', (e) => {
    if (e.target === commandPaletteModal) {
      closeCommandPalette();
    }
  });

  // Minimalist Analog Clock Engine
  const updateAnalogClock = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const minAngle = (minutes * 6) + (seconds * 0.1);
    const hourAngle = (hours * 30) + (minutes * 0.5);

    const minHand = document.getElementById('clock-minute-hand');
    const hourHand = document.getElementById('clock-hour-hand');

    if (minHand) {
      minHand.style.transform = `rotate(${minAngle}deg)`;
    }
    if (hourHand) {
      hourHand.style.transform = `rotate(${hourAngle}deg)`;
    }
  };

  // Tick immediately on load to prevent jumping
  updateAnalogClock();
  setInterval(updateAnalogClock, 1000);

  // Initialize UI Render
  renderTracks();
  updateCentralProgress();
  renderShortcuts();
};

// Safe lifecycle initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}

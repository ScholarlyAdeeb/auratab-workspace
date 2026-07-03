/**
 * AuraTab Workspace — Dashboard Script
 * Mountain parallax, shortcut tiles, mini calendar, GitHub, LeetCode, tracks, themes.
 */

// ============================================================
// 1. MOTIVATIONAL QUOTES
// ============================================================
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

// ============================================================
// 2. TIME-OF-DAY GREETING (returns HTML with optional name)
// ============================================================
const getChronoGreeting = (name = '') => {
  const hour = new Date().getHours();

  const nameHtml = name
    ? `, <span class="name-accent">${name}</span>`
    : '';

  const morning   = ["Good morning",  "Fresh start",  "System active"];
  const afternoon = ["Good afternoon", "Midday check", "Keep the momentum"];
  const evening   = ["Good evening",  "Evening session", "Winding down"];
  const lateNight = ["Late night",    "Deep focus",   "Midnight grind"];

  let list;
  if      (hour >= 5  && hour < 12) list = morning;
  else if (hour >= 12 && hour < 17) list = afternoon;
  else if (hour >= 17 && hour < 22) list = evening;
  else                               list = lateNight;

  const phrase = list[Math.floor(Math.random() * list.length)];
  return `${phrase}${nameHtml}.`;
};

// ============================================================
// 3. CONSTANTS & DEFAULTS
// ============================================================
const CIRCUMFERENCE = 534.07; // 2 * Math.PI * 85

const defaultTracks = [
  { id: 'track-default-1', title: 'DSA Practice', completed: 12, total: 45, link: 'https://youtube.com/playlist?list=PL' }
];

const defaultShortcuts = [
  {
    id: 'default-youtube',
    name: 'YouTube',
    url: 'https://youtube.com',
    svg: `<svg viewBox="0 0 24 24" width="22" height="22" fill="#ff0000"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
  }
];

// ============================================================
// 4. STORAGE HELPER
// ============================================================
const db = {
  async get(key, fallback) {
    try {
      const localVal = localStorage.getItem(key);
      if (localVal !== null) return JSON.parse(localVal);
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise(resolve => {
          chrome.storage.local.get([key], result => {
            resolve(result[key] !== undefined ? result[key] : fallback);
          });
        });
      }
      return fallback;
    } catch (e) {
      console.warn('Storage fetch error, using fallback.', e);
      return fallback;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise(resolve => {
          chrome.storage.local.set({ [key]: value }, () => resolve());
        });
      }
    } catch (e) {
      console.error('Storage write error.', e);
    }
  }
};

// ============================================================
// 5. MOUSE TRACKING — grid glow effect
// ============================================================
let mouseX = window.innerWidth  / 2;
let mouseY = window.innerHeight / 2;
let glowX  = mouseX;
let glowY  = mouseY;

window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });
window.addEventListener('resize', () => {
  mouseX = Math.min(Math.max(mouseX, 0), window.innerWidth);
  mouseY = Math.min(Math.max(mouseY, 0), window.innerHeight);
});

let isZenModeActive = false;

function animateGlow() {
  if (!isZenModeActive) {
    const ease = 0.08;
    glowX += (mouseX - glowX) * ease;
    glowY += (mouseY - glowY) * ease;
    const pctX = (glowX / (window.innerWidth  || 1)) * 100;
    const pctY = (glowY / (window.innerHeight || 1)) * 100;
    document.documentElement.style.setProperty('--mouse-x', `${pctX.toFixed(2)}%`);
    document.documentElement.style.setProperty('--mouse-y', `${pctY.toFixed(2)}%`);
  }
  requestAnimationFrame(animateGlow);
}
requestAnimationFrame(animateGlow);

// ============================================================
// 6. MOUSE GRADIENT — live update of --mouse-x / --mouse-y
//    (already handled by animateGlow above, nothing extra needed)
// ============================================================

// ============================================================
// 7. MINI CALENDAR RENDERER
// ============================================================
function renderMiniCalendar() {
  const container = document.getElementById('mini-calendar');
  if (!container) return;

  const now     = new Date();
  const year    = now.getFullYear();
  const month   = now.getMonth();
  const today   = now.getDate();

  const monthNames = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];
  const dayLabels  = ['S','M','T','W','T','F','S'];

  const firstDay    = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let gridHtml = '';
  for (let i = 0; i < firstDay; i++) gridHtml += `<div class="cal-cell empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    gridHtml += `<div class="cal-cell${d === today ? ' today' : ''}">${d}</div>`;
  }

  container.innerHTML = `
    <div class="cal-header">
      <span class="cal-month-year">${monthNames[month]} ${year}</span>
      <span class="cal-today-badge">Today ${today}</span>
    </div>
    <div class="cal-days-row">${dayLabels.map(d => `<div class="cal-day-label">${d}</div>`).join('')}</div>
    <div class="cal-grid">${gridHtml}</div>
  `;
}

// ============================================================
// 8. YOUTUBE PLAYLIST HELPERS
// ============================================================
const parsePlaylistId = str => {
  const match = str.match(/[&?]list=([^&]+)/);
  if (match) return match[1];
  if (/^PL[a-zA-Z0-9_-]{16,32}$/.test(str)) return str;
  return null;
};

const fetchPlaylistCount = async playlistId => {
  try {
    const targetUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
    const proxyUrl  = `https://corsproxy.io/?` + encodeURIComponent(targetUrl);
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(tid);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    const totalMatch = html.match(/"totalVideos"\s*:\s*(\d+)/) || html.match(/"videoCount"\s*:\s*"(\d+)"/);
    const total = totalMatch ? parseInt(totalMatch[1], 10) : null;
    if (!total || isNaN(total)) throw new Error('Could not parse count.');
    let title = 'YouTube Playlist';
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
                       html.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) title = titleMatch[1].replace(/ - YouTube$/i, '').trim();
    return { title, total };
  } catch (err) {
    console.error('Playlist scrape failed:', err);
    return null;
  }
};

// ============================================================
// 9. URL / FAVICON HELPERS
// ============================================================
const getFaviconUrl = urlStr => {
  try {
    const url = new URL(urlStr);
    return `https://www.google.com/s2/favicons?sz=64&domain=${url.hostname}`;
  } catch { return ''; }
};

const formatUrl = url => {
  const t = url.trim();
  if (!t.startsWith('http://') && !t.startsWith('https://') &&
      !t.startsWith('chrome://') && !t.startsWith('file://')) return 'https://' + t;
  return t;
};

// ============================================================
// 10. MAIN DASHBOARD INIT
// ============================================================
const initDashboard = async () => {

  // ── Greeting (immediate to prevent flicker) ──────────────
  const greetingEl = document.getElementById('dashboard-greeting');
  if (greetingEl) greetingEl.innerHTML = getChronoGreeting();

  // ── DOM References ───────────────────────────────────────
  const quoteBox     = document.getElementById('quote-box');
  const sidebar      = document.getElementById('tracks-sidebar');
  const tracksList   = document.getElementById('tracks-list');
  const addTrackBtn  = document.getElementById('add-track-btn');

  const trackModal               = document.getElementById('track-modal');
  const trackNameInput           = document.getElementById('track-name-input');
  const trackUrlInput            = document.getElementById('track-url-input');
  const trackTotalInputContainer = document.getElementById('track-total-input-container');
  const trackTotalInput          = document.getElementById('track-total-input');
  const trackCancelBtn           = document.getElementById('track-cancel-btn');
  const trackSaveBtn             = document.getElementById('track-save-btn');

  const shortcutsGrid    = document.getElementById('shortcuts-grid');
  const shortcutModal    = document.getElementById('shortcut-modal');
  const shortcutNameInput = document.getElementById('shortcut-name-input');
  const shortcutUrlInput  = document.getElementById('shortcut-url-input');
  const shortcutCancelBtn = document.getElementById('shortcut-cancel-btn');
  const shortcutSaveBtn   = document.getElementById('shortcut-save-btn');

  const themeToggle    = document.getElementById('theme-toggle');
  const matrixButtons  = document.querySelectorAll('.matrix-btn');

  const commandPaletteModal   = document.getElementById('command-palette-modal');
  const commandPaletteInput   = document.getElementById('command-palette-input');
  const commandPaletteResults = document.getElementById('command-palette-results');

  // ── Load State ───────────────────────────────────────────
  let tracks           = await db.get('aura_tracks',        defaultTracks);
  let activeTrackId    = await db.get('aura_active_track',  'track-default-1');
  let customShortcuts  = await db.get('aura_shortcuts',     []);
  let activeThemeMode  = await db.get('aura_theme_mode',    'dark');
  let activeGradientGlow = await db.get('aura_gradient_glow', 'theme-deep-cosmic');
  let pendingTrack     = null;
  let githubUsername   = await db.get('aura_github_username', '');

  // ── Visibility Settings State ────────────────────────────
  let showSidebar = await db.get('aura_show_sidebar', true);
  let showGitHub  = await db.get('aura_show_github',  true);
  let showLeetCode = await db.get('aura_show_leetcode', true);

  const settingsModal = document.getElementById('settings-modal');
  const settingsTrigger = document.getElementById('settings-trigger');
  const settingsCloseBtn = document.getElementById('settings-close-btn');

  const toggleSidebarInput = document.getElementById('setting-toggle-sidebar');
  const toggleGitHubInput  = document.getElementById('setting-toggle-github');
  const toggleLeetCodeInput = document.getElementById('setting-toggle-leetcode');

  const centerContainer = document.getElementById('center-container');
  const tracksSidebar = document.getElementById('tracks-sidebar');
  const widgetsRow = document.getElementById('widgets-row');

  // Set initial checkbox values
  if (toggleSidebarInput) toggleSidebarInput.checked = showSidebar;
  if (toggleGitHubInput) toggleGitHubInput.checked = showGitHub;
  if (toggleLeetCodeInput) toggleLeetCodeInput.checked = showLeetCode;

  const applyVisibilitySettings = () => {
    // Sidebar
    if (showSidebar) {
      tracksSidebar?.classList.remove('hidden');
      centerContainer?.classList.remove('sidebar-hidden');
    } else {
      tracksSidebar?.classList.add('hidden');
      centerContainer?.classList.add('sidebar-hidden');
    }

    // GitHub & LeetCode
    const ghCard = document.getElementById('github-contributions-container');
    const lcCard = document.getElementById('leetcode-container');

    if (ghCard) ghCard.classList.toggle('hidden', !showGitHub);
    if (lcCard) lcCard.classList.toggle('hidden', !showLeetCode);

    // Dynamic grid symmetry
    if (widgetsRow) {
      const visibleCount = (showGitHub ? 1 : 0) + (showLeetCode ? 1 : 0);
      widgetsRow.classList.toggle('hidden', visibleCount === 0);
      widgetsRow.classList.toggle('single-widget', visibleCount === 1);
    }
  };

  // ── Drag Resizing Logic ──────────────────────────────────
  const resizer = document.getElementById('stats-resizer');
  const ghPanel = document.getElementById('github-contributions-container');
  const lcPanel = document.getElementById('leetcode-container');

  let savedRatio = await db.get('aura_stats_ratio', 0.75); // default 3:1 = 0.75

  const applyResizedRatio = (ratio) => {
    if (ghPanel && lcPanel) {
      ghPanel.style.flex = ratio;
      lcPanel.style.flex = 1 - ratio;
    }
  };

  applyResizedRatio(savedRatio);

  resizer?.addEventListener('mousedown', initDrag);

  function initDrag(e) {
    e.preventDefault();
    document.body.style.cursor = 'col-resize';
    resizer.classList.add('dragging');
    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);
  }

  function doDrag(e) {
    if (!widgetsRow || !ghPanel || !lcPanel) return;
    const rect = widgetsRow.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    let ratio = offsetX / rect.width;
    ratio = Math.max(0.15, Math.min(0.85, ratio)); // bound limit
    applyResizedRatio(ratio);
    savedRatio = ratio;
  }

  async function stopDrag() {
    document.body.style.cursor = '';
    resizer.classList.remove('dragging');
    window.removeEventListener('mousemove', doDrag);
    window.removeEventListener('mouseup', stopDrag);
    await db.set('aura_stats_ratio', savedRatio);
  }

  applyVisibilitySettings();

  // Settings Event Listeners
  settingsTrigger?.addEventListener('click', () => settingsModal?.classList.remove('hidden'));
  settingsCloseBtn?.addEventListener('click', () => settingsModal?.classList.add('hidden'));
  settingsModal?.addEventListener('click', e => { if (e.target === settingsModal) settingsModal.classList.add('hidden'); });

  toggleSidebarInput?.addEventListener('change', async e => {
    showSidebar = e.target.checked;
    await db.set('aura_show_sidebar', showSidebar);
    applyVisibilitySettings();
  });

  toggleGitHubInput?.addEventListener('change', async e => {
    showGitHub = e.target.checked;
    await db.set('aura_show_github', showGitHub);
    applyVisibilitySettings();
  });

  toggleLeetCodeInput?.addEventListener('change', async e => {
    showLeetCode = e.target.checked;
    await db.set('aura_show_leetcode', showLeetCode);
    applyVisibilitySettings();
  });

  // ── Mini Calendar ────────────────────────────────────────
  renderMiniCalendar();

  // ── Theme Logic ──────────────────────────────────────────
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
    const themeClasses = Array.from(document.body.classList).filter(c => c.startsWith('theme-'));
    themeClasses.forEach(c => document.body.classList.remove(c));
    document.body.classList.add(glow);
    matrixButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.theme === glow));
  };

  applyTheme(activeThemeMode, activeGradientGlow);

  themeToggle.addEventListener('click', async () => {
    activeThemeMode = document.body.classList.contains('light-mode') ? 'dark' : 'light';
    await db.set('aura_theme_mode', activeThemeMode);
    applyTheme(activeThemeMode, activeGradientGlow);
  });

  matrixButtons.forEach(btn => {
    btn.addEventListener('click', async e => {
      activeGradientGlow = e.currentTarget.dataset.theme;
      await db.set('aura_gradient_glow', activeGradientGlow);
      applyTheme(activeThemeMode, activeGradientGlow);
    });
  });

  // ── Quote ────────────────────────────────────────────────
  const selectRandomQuote = () => {
    quoteBox.textContent = `"${MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]}"`;
  };
  selectRandomQuote();

  // ── Update greeting with GitHub name ─────────────────────
  const refreshGreeting = () => {
    if (greetingEl) greetingEl.innerHTML = getChronoGreeting(githubUsername);
  };
  refreshGreeting();

  // ── Shortcut Tiles Renderer ──────────────────────────────
  const renderShortcuts = () => {
    shortcutsGrid.innerHTML = '';

    // Default shortcuts
    defaultShortcuts.forEach(item => {
      const link = document.createElement('a');
      link.href      = item.url;
      link.target    = '_blank';
      link.className = 'shortcut-tile';
      link.id        = item.id;

      const faviconUrl = getFaviconUrl(item.url);
      link.innerHTML = `
        <div class="tile-icon">
          ${faviconUrl
            ? `<img src="${faviconUrl}" width="28" height="28" alt="${item.name}"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='flex';"
                    style="border-radius:7px;" />
               <div style="display:none;width:28px;height:28px;align-items:center;justify-content:center;">
                 ${item.svg}
               </div>`
            : item.svg
          }
        </div>
        <span class="tile-label">${item.name}</span>
      `;
      shortcutsGrid.appendChild(link);
    });

    // Custom shortcuts
    customShortcuts.forEach(item => {
      const link = document.createElement('a');
      link.href      = item.url;
      link.target    = '_blank';
      link.className = 'shortcut-tile';
      link.id        = `shortcut-custom-${item.id}`;

      const faviconUrl = getFaviconUrl(item.url);
      link.innerHTML = `
        <div class="tile-icon">
          ${faviconUrl
            ? `<img src="${faviconUrl}" width="28" height="28" alt="${item.name}"
                    onerror="this.style.display='none';"
                    style="border-radius:7px;" />`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
               </svg>`
          }
        </div>
        <span class="tile-label">${item.name}</span>
        <button class="tile-delete" data-id="${item.id}" title="Remove">&times;</button>
      `;

      link.querySelector('.tile-delete').addEventListener('click', async e => {
        e.preventDefault();
        e.stopPropagation();
        customShortcuts = customShortcuts.filter(s => s.id !== item.id);
        await db.set('aura_shortcuts', customShortcuts);
        renderShortcuts();
      });

      shortcutsGrid.appendChild(link);
    });
  };

  // ── Shortcut Modal Logic ─────────────────────────────────
  shortcutCancelBtn.addEventListener('click', () => {
    shortcutModal.classList.add('hidden');
    shortcutNameInput.value = '';
    shortcutUrlInput.value  = '';
  });

  shortcutSaveBtn.addEventListener('click', async () => {
    const name   = shortcutNameInput.value.trim();
    const rawUrl = shortcutUrlInput.value.trim();
    if (!name || !rawUrl) return;
    const newShortcut = { id: 'shortcut-' + Date.now(), name, url: formatUrl(rawUrl) };
    customShortcuts.push(newShortcut);
    await db.set('aura_shortcuts', customShortcuts);
    shortcutModal.classList.add('hidden');
    shortcutNameInput.value = '';
    shortcutUrlInput.value  = '';
    renderShortcuts();
  });

  shortcutModal.addEventListener('click', e => { if (e.target === shortcutModal) shortcutCancelBtn.click(); });

  // ── Tracks Renderer ──────────────────────────────────────
  const renderTracks = () => {
    tracksList.innerHTML = '';
    tracks.forEach(track => {
      const card    = document.createElement('div');
      const percent = Math.round((track.completed / track.total) * 100);
      const miniC   = 87.96;
      const offset  = miniC - (percent / 100) * miniC;

      card.className = `track-card ${track.id === activeTrackId ? 'active' : ''}`;
      card.dataset.id = track.id;
      card.innerHTML = `
        <div class="mini-chart-wrapper" style="position:relative;width:36px;height:36px;flex-shrink:0;" title="Click to increment · Right-click to reset">
          <svg width="36" height="36" viewBox="0 0 36 36" style="transform:rotate(-90deg);transform-origin:50% 50%;">
            <circle cx="18" cy="18" r="14" fill="transparent" stroke="rgba(255,255,255,0.05)" stroke-width="3.5"/>
            <circle cx="18" cy="18" r="14" fill="transparent" stroke="var(--accent-color)" stroke-width="3.5"
                    stroke-dasharray="${miniC}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
          </svg>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
                      font-family:var(--font-mono);font-size:8px;font-weight:700;color:var(--text-primary);">
            ${percent}%
          </div>
        </div>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:0.25rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">
            <a href="${track.link || '#'}" target="_blank" class="track-title-link" title="Open Playlist">${track.title}</a>
            <button class="track-delete-btn" title="Delete" data-id="${track.id}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
          <div class="track-meta"><span>${track.completed} / ${track.total} vids</span></div>
        </div>
      `;

      card.addEventListener('click', e => {
        if (e.target.closest('.track-delete-btn') || e.target.closest('.track-title-link') || e.target.closest('.mini-chart-wrapper')) return;
        setActiveTrack(track.id);
      });

      card.querySelector('.mini-chart-wrapper').addEventListener('click', async e => {
        e.stopPropagation();
        if (activeTrackId !== track.id) setActiveTrack(track.id);
        if (track.completed < track.total) {
          track.completed += 1;
          await db.set('aura_tracks', tracks);
          renderTracks();
          updateCentralProgress();
        }
      });

      card.addEventListener('contextmenu', async e => {
        e.preventDefault();
        if (e.target.closest('.track-delete-btn') || e.target.closest('.track-title-link')) return;
        track.completed = 0;
        await db.set('aura_tracks', tracks);
        renderTracks();
        updateCentralProgress();
      });

      card.querySelector('.track-delete-btn').addEventListener('click', async e => {
        e.stopPropagation();
        tracks = tracks.filter(t => t.id !== track.id);
        await db.set('aura_tracks', tracks);
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

  const setActiveTrack = id => {
    activeTrackId = id;
    db.set('aura_active_track', id);
    renderTracks();
    updateCentralProgress();
  };

  const updateCentralProgress = () => {
    const active = tracks.find(t => t.id === activeTrackId);
    const progressVal      = document.getElementById('progress-val');
    const progressTotal    = document.querySelector('.progress-total');
    const progressLabel    = document.querySelector('.progress-label');
    const progressFillArc  = document.getElementById('progress-fill-arc');
    if (progressVal)   progressVal.textContent   = active ? active.completed : '0';
    if (progressTotal) progressTotal.textContent  = active ? active.total     : '0';
    if (progressLabel) progressLabel.textContent  = active ? active.title     : 'add track';
    if (progressFillArc) {
      const frac   = active ? active.completed / active.total : 0;
      progressFillArc.style.strokeDashoffset = CIRCUMFERENCE - frac * CIRCUMFERENCE;
    }
  };

  // ── Track Modal Logic ────────────────────────────────────
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

  addTrackBtn.addEventListener('click', () => {
    trackModal.classList.remove('hidden');
    trackNameInput.focus();
  });

  trackCancelBtn.addEventListener('click', e => { e.preventDefault(); resetTrackForm(); });
  trackModal.addEventListener('click', e => { if (e.target === trackModal) resetTrackForm(); });

  trackSaveBtn.addEventListener('click', async e => {
    e.preventDefault();
    const nameStr = trackNameInput.value.trim();
    const urlStr  = trackUrlInput.value.trim();
    if (!nameStr && !urlStr) return;

    if (!trackTotalInputContainer.classList.contains('hidden')) {
      const total = parseInt(trackTotalInput.value.trim());
      if (isNaN(total) || total <= 0) { trackTotalInput.focus(); return; }
      const newTrack = {
        id: 'track-' + Date.now(),
        title: nameStr || pendingTrack?.title || 'Custom Track',
        completed: 0, total,
        link: urlStr ? formatUrl(urlStr) : (pendingTrack ? pendingTrack.link : '')
      };
      tracks.push(newTrack);
      await db.set('aura_tracks', tracks);
      resetTrackForm();
      setActiveTrack(newTrack.id);
      return;
    }

    const playlistId = parsePlaylistId(urlStr);
    if (playlistId) {
      trackSaveBtn.textContent = 'Fetching…';
      trackSaveBtn.disabled = true;
      const metadata = await fetchPlaylistCount(playlistId);
      trackSaveBtn.textContent = 'Add';
      trackSaveBtn.disabled = false;
      if (metadata) {
        const newTrack = {
          id: 'track-' + Date.now(),
          title: nameStr || metadata.title,
          completed: 0, total: metadata.total,
          link: urlStr.startsWith('http') ? urlStr : `https://youtube.com/playlist?list=${playlistId}`
        };
        tracks.push(newTrack);
        await db.set('aura_tracks', tracks);
        resetTrackForm();
        setActiveTrack(newTrack.id);
      } else {
        pendingTrack = {
          title: nameStr || 'YouTube Playlist',
          link: urlStr.startsWith('http') ? urlStr : `https://youtube.com/playlist?list=${playlistId}`
        };
        trackNameInput.disabled = true;
        trackUrlInput.disabled  = true;
        trackTotalInputContainer.classList.remove('hidden');
        trackTotalInput.focus();
      }
    } else {
      pendingTrack = { title: nameStr || urlStr, link: urlStr ? formatUrl(urlStr) : '' };
      trackNameInput.disabled = true;
      trackUrlInput.disabled  = true;
      trackTotalInputContainer.classList.remove('hidden');
      trackTotalInput.focus();
    }
  });

  // ── Command Palette ──────────────────────────────────────
  const PALETTE_COMMANDS = [
    { id: 'cmd-zen',       title: '/zen',              type: 'command', execute: () => enterZenMode() },
    { id: 'cmd-cosmic',    title: '/theme cosmic',     type: 'command', execute: async () => { activeGradientGlow = 'theme-deep-cosmic';    await db.set('aura_gradient_glow', activeGradientGlow); applyTheme(activeThemeMode, activeGradientGlow); } },
    { id: 'cmd-matrix',    title: '/theme matrix',     type: 'command', execute: async () => { activeGradientGlow = 'theme-matrix-neon';    await db.set('aura_gradient_glow', activeGradientGlow); applyTheme(activeThemeMode, activeGradientGlow); } },
    { id: 'cmd-sunset',    title: '/theme sunset',     type: 'command', execute: async () => { activeGradientGlow = 'theme-sunset-crimson'; await db.set('aura_gradient_glow', activeGradientGlow); applyTheme(activeThemeMode, activeGradientGlow); } },
    { id: 'cmd-slate',     title: '/theme slate',      type: 'command', execute: async () => { activeGradientGlow = 'theme-slate-studio';   await db.set('aura_gradient_glow', activeGradientGlow); applyTheme(activeThemeMode, activeGradientGlow); } },
    { id: 'cmd-gold',      title: '/theme gold',       type: 'command', execute: async () => { activeGradientGlow = 'theme-cyberpunk-gold'; await db.set('aura_gradient_glow', activeGradientGlow); applyTheme(activeThemeMode, activeGradientGlow); } },
    { id: 'cmd-sakura',    title: '/theme sakura',     type: 'command', execute: async () => { activeGradientGlow = 'theme-sakura-blossom'; await db.set('aura_gradient_glow', activeGradientGlow); applyTheme(activeThemeMode, activeGradientGlow); } },
    { id: 'cmd-frost',     title: '/theme frost',      type: 'command', execute: async () => { activeGradientGlow = 'theme-nordic-frost';   await db.set('aura_gradient_glow', activeGradientGlow); applyTheme(activeThemeMode, activeGradientGlow); } },
    { id: 'cmd-synthwave', title: '/theme synthwave',  type: 'command', execute: async () => { activeGradientGlow = 'theme-retro-synthwave';await db.set('aura_gradient_glow', activeGradientGlow); applyTheme(activeThemeMode, activeGradientGlow); } },
    { id: 'cmd-aurora',    title: '/theme aurora',     type: 'command', execute: async () => { activeGradientGlow = 'theme-aurora-teal';    await db.set('aura_gradient_glow', activeGradientGlow); applyTheme(activeThemeMode, activeGradientGlow); } },
    { id: 'cmd-royal',     title: '/theme royal',      type: 'command', execute: async () => { activeGradientGlow = 'theme-midnight-royal'; await db.set('aura_gradient_glow', activeGradientGlow); applyTheme(activeThemeMode, activeGradientGlow); } },
    { id: 'cmd-dracula',   title: '/theme dracula',    type: 'command', execute: async () => { activeGradientGlow = 'theme-dracula-orchid'; await db.set('aura_gradient_glow', activeGradientGlow); applyTheme(activeThemeMode, activeGradientGlow); } },
    { id: 'cmd-forest',    title: '/theme forest',     type: 'command', execute: async () => { activeGradientGlow = 'theme-forest-ember';   await db.set('aura_gradient_glow', activeGradientGlow); applyTheme(activeThemeMode, activeGradientGlow); } },
  ];

  let zenClockInterval = null;
  const updateZenClock = () => {
    const now = new Date();
    const clockEl = document.getElementById('zen-clock');
    if (clockEl) clockEl.textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  };
  const enterZenMode = () => {
    isZenModeActive = true;
    document.body.classList.add('zen-active');
    const ov = document.getElementById('zen-overlay');
    if (ov) { ov.classList.remove('hidden'); void ov.offsetWidth; ov.classList.add('active'); }
    updateZenClock();
    zenClockInterval = setInterval(updateZenClock, 1000);
  };
  const exitZenMode = () => {
    isZenModeActive = false;
    document.body.classList.remove('zen-active');
    const ov = document.getElementById('zen-overlay');
    if (ov) {
      ov.classList.remove('active');
      setTimeout(() => { if (!isZenModeActive) ov.classList.add('hidden'); }, 600);
    }
    if (zenClockInterval) { clearInterval(zenClockInterval); zenClockInterval = null; }
  };

  let filteredItems = [], selectedIndex = -1;

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
    filteredItems = []; selectedIndex = -1;
  };

  const getPaletteResults = query => {
    const term = query.toLowerCase().trim();
    const results = [];
    if (term.startsWith('/') || term === '') {
      PALETTE_COMMANDS.forEach(cmd => { if (cmd.title.toLowerCase().includes(term)) results.push({ ...cmd }); });
    }
    customShortcuts.forEach(sc => {
      if (sc.name.toLowerCase().includes(term) || sc.url.toLowerCase().includes(term))
        results.push({ id: sc.id, title: sc.name, type: 'shortcut', execute: () => window.open(sc.url, '_blank') });
    });
    defaultShortcuts.forEach(sc => {
      if (sc.name.toLowerCase().includes(term) || sc.url.toLowerCase().includes(term))
        results.push({ id: sc.id, title: sc.name, type: 'shortcut', execute: () => window.open(sc.url, '_blank') });
    });
    tracks.forEach(track => {
      if (track.title.toLowerCase().includes(term))
        results.push({ id: track.id, title: track.title, type: 'track', execute: () => setActiveTrack(track.id) });
    });
    return results;
  };

  const renderPaletteResults = query => {
    filteredItems  = getPaletteResults(query);
    selectedIndex  = filteredItems.length > 0 ? 0 : -1;
    commandPaletteResults.innerHTML = '';
    filteredItems.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = `command-palette-item ${idx === selectedIndex ? 'active' : ''}`;
      el.dataset.index = idx;
      const typeLabel = item.type === 'command' ? 'Command' : item.type === 'track' ? 'Track' : 'Shortcut';
      el.innerHTML = `<span class="item-title">${item.title}</span><span class="item-type">${typeLabel}</span>`;
      el.addEventListener('click', () => { item.execute(); closeCommandPalette(); });
      commandPaletteResults.appendChild(el);
    });
  };

  const updateActiveItem = () => {
    commandPaletteResults.querySelectorAll('.command-palette-item').forEach((el, idx) => {
      el.classList.toggle('active', idx === selectedIndex);
      if (idx === selectedIndex) el.scrollIntoView({ block: 'nearest' });
    });
  };

  commandPaletteInput.addEventListener('input', e => renderPaletteResults(e.target.value));
  commandPaletteInput.addEventListener('keydown', async e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!filteredItems.length) return;
      selectedIndex = (selectedIndex + 1) % filteredItems.length;
      updateActiveItem();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!filteredItems.length) return;
      selectedIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
      updateActiveItem();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const val = commandPaletteInput.value.trim().toLowerCase();
      if (val === '/zen') { enterZenMode(); closeCommandPalette(); return; }
      if (val.startsWith('/theme ')) {
        const map = { cosmic:'theme-deep-cosmic', matrix:'theme-matrix-neon', sunset:'theme-sunset-crimson',
                      slate:'theme-slate-studio', gold:'theme-cyberpunk-gold', sakura:'theme-sakura-blossom',
                      frost:'theme-nordic-frost', synthwave:'theme-retro-synthwave', aurora:'theme-aurora-teal',
                      royal:'theme-midnight-royal', dracula:'theme-dracula-orchid', forest:'theme-forest-ember' };
        const t = map[val.replace('/theme ','').trim()];
        if (t) { activeGradientGlow = t; await db.set('aura_gradient_glow', t); applyTheme(activeThemeMode, t); }
        closeCommandPalette(); return;
      }
      if (selectedIndex >= 0 && selectedIndex < filteredItems.length) { filteredItems[selectedIndex].execute(); closeCommandPalette(); }
    } else if (e.key === 'Escape') { e.preventDefault(); closeCommandPalette(); }
  });

  document.addEventListener('keydown', e => {
    if (isZenModeActive && e.key === 'Escape') { e.preventDefault(); exitZenMode(); return; }
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === '/') { e.preventDefault(); openCommandPalette(); }
    if (e.key === 'B' && e.shiftKey) {
      e.preventDefault();
      shortcutModal.classList.remove('hidden');
      shortcutNameInput.focus();
    }
  });

  commandPaletteModal.addEventListener('click', e => { if (e.target === commandPaletteModal) closeCommandPalette(); });

  // ── Analog clock (for zen mode / any future use) ─────────
  const updateAnalogClock = () => {
    const now = new Date();
    const minH = document.getElementById('clock-minute-hand');
    const hrH  = document.getElementById('clock-hour-hand');
    if (minH) minH.style.transform = `rotate(${now.getMinutes() * 6 + now.getSeconds() * 0.1}deg)`;
    if (hrH)  hrH.style.transform  = `rotate(${now.getHours() * 30 + now.getMinutes() * 0.5}deg)`;
  };
  updateAnalogClock();
  setInterval(updateAnalogClock, 1000);

  // ============================================================
  // GITHUB CONTRIBUTIONS
  // ============================================================
  const fetchGitHubContributions = async username => {
    const response = await fetch(`https://github-contributions-api.deno.dev/${username}.json`);
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
    return response.json();
  };

  const generateCalendarHTML = data => {
    const flatDays = data.contributions.flat().filter(Boolean);
    const dateMap  = {};
    flatDays.forEach(d => { dateMap[d.date] = d; });

    const dates       = flatDays.map(d => d.date).sort();
    const endDateStr  = dates[dates.length - 1] || new Date().toISOString().split('T')[0];
    const endDate     = new Date(endDateStr + 'T00:00:00');
    const calEnd      = new Date(endDate);
    calEnd.setDate(calEnd.getDate() + (6 - endDate.getDay()));
    const calStart    = new Date(calEnd);
    calStart.setDate(calStart.getDate() - 370);

    const shortMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const levelMap    = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

    let html = `<table class="ContributionCalendar-grid" style="border-collapse:separate;border-spacing:3px;">`;
    html += `<thead><tr style="height:15px"><td></td>`;

    let curMonth = '', colCount = 0;
    const monthSpans = [];
    for (let w = 0; w < 53; w++) {
      const fd = new Date(calStart); fd.setDate(calStart.getDate() + w * 7);
      const mn = shortMonths[fd.getMonth()];
      if (mn !== curMonth) { if (colCount > 0) monthSpans.push({ name: curMonth, col: colCount }); curMonth = mn; colCount = 1; }
      else colCount++;
    }
    if (colCount > 0) monthSpans.push({ name: curMonth, col: colCount });
    monthSpans.forEach(m => { html += `<td class="ContributionCalendar-label" colspan="${m.col}"><span aria-hidden="true">${m.name}</span></td>`; });
    html += `</tr></thead><tbody>`;

    const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
    for (let d = 0; d < 7; d++) {
      html += `<tr style="height:11px"><td class="ContributionCalendar-label" style="position:relative;width:29px;">
               <span aria-hidden="true" style="position:absolute;top:-3px;left:0;white-space:nowrap;">${dayLabels[d]}</span></td>`;
      for (let w = 0; w < 53; w++) {
        const cellDate = new Date(calStart); cellDate.setDate(calStart.getDate() + w * 7 + d);
        const ds = `${cellDate.getFullYear()}-${String(cellDate.getMonth()+1).padStart(2,'0')}-${String(cellDate.getDate()).padStart(2,'0')}`;
        if (cellDate <= calEnd) {
          const day = dateMap[ds];
          const level = day ? (levelMap[day.contributionLevel] ?? 0) : 0;
          const count = day ? day.contributionCount : 0;
          const tip   = `${count === 0 ? 'No' : count} contribution${count === 1 ? '' : 's'} on ${cellDate.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}.`;
          html += `<td class="ContributionCalendar-day" data-level="${level}" data-date="${ds}" title="${tip}"></td>`;
        } else {
          html += `<td style="background:transparent!important;pointer-events:none;"></td>`;
        }
      }
      html += `</tr>`;
    }
    return html + `</tbody></table>`;
  };

  const renderGitHubContributions = async () => {
    const container = document.getElementById('github-contributions-container');
    if (!container) return;

    if (!githubUsername) {
      container.innerHTML = `
        <div class="github-empty-state">
          <p>Connect GitHub to track your contribution streak</p>
          <div class="github-input-group">
            <input type="text" id="github-username-input" placeholder="GitHub username" />
            <button id="github-save-username" class="github-btn">Connect</button>
          </div>
        </div>`;
      document.getElementById('github-save-username')?.addEventListener('click', async () => {
        const input = document.getElementById('github-username-input');
        const name  = input?.value.trim();
        if (name) { githubUsername = name; await db.set('aura_github_username', name); refreshGreeting(); renderGitHubContributions(); }
      });
      return;
    }

    container.innerHTML = `<div class="github-loading">Loading contributions for @${githubUsername}…</div>`;
    try {
      const data      = await fetchGitHubContributions(githubUsername);
      const tableHTML = generateCalendarHTML(data);
      container.innerHTML = `
        <div class="github-card-header">
          <span class="github-card-title">${data.totalContributions} contributions this year</span>
          <div class="github-card-actions">
            <button id="github-refresh-btn" class="github-action-btn" title="Refresh">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
            </button>
            <button id="github-edit-btn" class="github-action-btn" title="Change Username">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="github-table-container">${tableHTML}</div>
        <div class="github-footer-row">
          <span>@${githubUsername}</span>
          <div class="github-legend">
            <span>Less</span>
            <div class="github-legend-box" data-level="0"></div>
            <div class="github-legend-box" data-level="1"></div>
            <div class="github-legend-box" data-level="2"></div>
            <div class="github-legend-box" data-level="3"></div>
            <div class="github-legend-box" data-level="4"></div>
            <span>More</span>
          </div>
        </div>`;

      document.getElementById('github-refresh-btn')?.addEventListener('click', renderGitHubContributions);
      document.getElementById('github-edit-btn')?.addEventListener('click', async () => {
        const newName = prompt('Enter your GitHub username:', githubUsername);
        if (newName !== null) { githubUsername = newName.trim(); await db.set('aura_github_username', githubUsername); refreshGreeting(); renderGitHubContributions(); }
      });
    } catch (err) {
      container.innerHTML = `
        <div class="github-error">
          <p>Failed to load contributions for @${githubUsername}</p>
          <p style="font-size:11px;opacity:0.75;">${err.message}</p>
          <div style="display:flex;gap:0.5rem;margin-top:0.5rem;">
            <button id="github-retry-btn" class="github-btn" style="padding:0.4rem 0.8rem;font-size:11px;">Retry</button>
            <button id="github-change-btn" class="github-btn" style="padding:0.4rem 0.8rem;font-size:11px;background:transparent;border:1px solid var(--input-border);color:var(--text-primary);">Change</button>
          </div>
        </div>`;
      document.getElementById('github-retry-btn')?.addEventListener('click', renderGitHubContributions);
      document.getElementById('github-change-btn')?.addEventListener('click', async () => {
        const newName = prompt('Enter your GitHub username:', githubUsername);
        if (newName !== null) { githubUsername = newName.trim(); await db.set('aura_github_username', githubUsername); refreshGreeting(); renderGitHubContributions(); }
      });
    }
  };

  // GitHub → navigate to profile
  const githubContainer = document.getElementById('github-contributions-container');
  if (githubContainer) {
    githubContainer.style.cursor = 'pointer';
    githubContainer.addEventListener('click', e => {
      if (e.target.closest('.github-action-btn') || e.target.closest('.github-btn') || e.target.closest('input')) return;
      window.open(githubUsername ? `https://github.com/${githubUsername}` : 'https://github.com', '_blank');
    });
  }

  // ============================================================
  // LEETCODE
  // ============================================================
  let leetcodeUsername = await db.get('aura_leetcode_username', '');
  let leetcodeEasy     = await db.get('aura_leetcode_easy',     16);
  let leetcodeMedium   = await db.get('aura_leetcode_medium',   1);
  let leetcodeHard     = await db.get('aura_leetcode_hard',     0);
  let leetcodeBeats    = await db.get('aura_leetcode_beats',    23.2);

  const fetchLeetCodeGraphQL = async username => {
    const query = {
      query: `query userProblemsSolved($username: String!) {
        matchedUser(username: $username) {
          submitStats { acSubmissionNum { difficulty count } }
          problemsSolvedBeatsStats { difficulty percentage }
        }
      }`,
      variables: { username }
    };
    const proxyUrl = `https://corsproxy.io/?` + encodeURIComponent('https://leetcode.com/graphql');
    const res = await fetch(proxyUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) });
    if (!res.ok) throw new Error('GraphQL fetch failed');
    const json = await res.json();
    if (!json.data?.matchedUser) throw new Error('User not found');
    const acs  = json.data.matchedUser.submitStats.acSubmissionNum;
    return {
      easy:   acs.find(a => a.difficulty === 'Easy')?.count   || 0,
      medium: acs.find(a => a.difficulty === 'Medium')?.count || 0,
      hard:   acs.find(a => a.difficulty === 'Hard')?.count   || 0,
      beats:  parseFloat((json.data.matchedUser.problemsSolvedBeatsStats?.find(b => b.difficulty === 'All')?.percentage || 0).toFixed(1))
    };
  };

  const fetchLeetCodeStats = async username => {
    const urls = [
      `https://leetcode-stats-api.herokuapp.com/${username}`,
      `https://leetcode-api-faisal.vercel.app/api/${username}`
    ];
    let lastErr = null;
    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const d = await res.json();
          if (d.status === 'success' || d.totalSolved !== undefined) {
            return { easy: d.easySolved || 0, medium: d.mediumSolved || 0, hard: d.hardSolved || 0, beats: d.acceptanceRate || 0 };
          }
        }
      } catch (err) { lastErr = err; }
    }
    throw lastErr || new Error('Failed to fetch LeetCode data');
  };

  const leetcodeModal        = document.getElementById('leetcode-modal');
  const leetcodeUsernameInput = document.getElementById('leetcode-username-input');

  const openLeetCodeModal  = () => { leetcodeModal.classList.remove('hidden'); leetcodeUsernameInput.value = leetcodeUsername; leetcodeUsernameInput.focus(); };
  const closeLeetCodeModal = () => { leetcodeModal.classList.add('hidden'); };

  document.getElementById('leetcode-cancel-btn')?.addEventListener('click', closeLeetCodeModal);
  leetcodeModal?.addEventListener('click', e => { if (e.target === leetcodeModal) closeLeetCodeModal(); });

  document.getElementById('leetcode-save-btn')?.addEventListener('click', async () => {
    const user = leetcodeUsernameInput.value.trim();
    leetcodeUsername = user;
    await db.set('aura_leetcode_username', user);
    closeLeetCodeModal();
    if (user) {
      const c = document.getElementById('leetcode-container');
      if (c) c.querySelector('.github-card-title')?.textContent && (c.querySelector('.github-card-title').textContent = 'Syncing…');
      try {
        let stats;
        try { stats = await fetchLeetCodeGraphQL(user); } catch { stats = await fetchLeetCodeStats(user); }
        leetcodeEasy = stats.easy; leetcodeMedium = stats.medium; leetcodeHard = stats.hard;
        if (stats.beats > 0) leetcodeBeats = stats.beats;
        await db.set('aura_leetcode_easy', leetcodeEasy);
        await db.set('aura_leetcode_medium', leetcodeMedium);
        await db.set('aura_leetcode_hard', leetcodeHard);
        await db.set('aura_leetcode_beats', leetcodeBeats);
      } catch (err) { console.error(err); }
    }
    renderLeetCode();
  });

  const renderLeetCode = () => {
    const container = document.getElementById('leetcode-container');
    if (!container) return;
    const total = leetcodeEasy + leetcodeMedium + leetcodeHard;

    container.innerHTML = `
      <div class="github-card-header">
        <span class="github-card-title">LeetCode Stats</span>
        <div class="github-card-actions">
          ${leetcodeUsername ? `
            <button id="leetcode-refresh-btn" class="github-action-btn" title="Refresh Stats">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
            </button>` : ''}
          <button id="leetcode-edit-btn" class="github-action-btn" title="Configure">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:1rem;padding:0.4rem 0;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;">
          <div>
            <div style="font-size:0.82rem;color:var(--text-muted);font-weight:500;margin-bottom:0.2rem;">Total Solved</div>
            <div style="font-size:1.75rem;font-weight:700;color:var(--accent-color);">
              ${total}<span style="font-size:0.95rem;font-weight:500;color:var(--text-primary);margin-left:0.3rem;">problems</span>
            </div>
          </div>
          ${leetcodeBeats > 0 ? `
            <div style="font-size:0.88rem;color:var(--text-muted);display:flex;align-items:center;gap:0.3rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="opacity:0.7;">
                <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5"/>
                <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6"/>
                <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
                <path d="M6 14v-1.5a1.5 1.5 0 0 0-3 0V18a6 6 0 0 0 6 6h4c3.3 0 6-2.7 6-6v-3a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2"/>
              </svg>
              Beats ${leetcodeBeats}%
            </div>` : ''}
        </div>
        <div style="display:flex;gap:0.6rem;flex-wrap:wrap;">
          <div style="background:rgba(44,187,55,0.10);border:1px solid rgba(44,187,55,0.18);border-radius:8px;padding:0.4rem 0.75rem;display:flex;gap:1.25rem;align-items:center;font-size:0.85rem;">
            <span style="color:#2cbb37;font-weight:600;">Easy</span>
            <span style="color:var(--text-primary);font-family:var(--font-mono);font-weight:700;">${leetcodeEasy}</span>
          </div>
          <div style="background:rgba(231,164,19,0.10);border:1px solid rgba(231,164,19,0.18);border-radius:8px;padding:0.4rem 0.75rem;display:flex;gap:1.25rem;align-items:center;font-size:0.85rem;">
            <span style="color:#e7a413;font-weight:600;">Med.</span>
            <span style="color:var(--text-primary);font-family:var(--font-mono);font-weight:700;">${leetcodeMedium}</span>
          </div>
          <div style="background:rgba(242,44,61,0.10);border:1px solid rgba(242,44,61,0.18);border-radius:8px;padding:0.4rem 0.75rem;display:flex;gap:1.25rem;align-items:center;font-size:0.85rem;">
            <span style="color:#f22c3d;font-weight:600;">Hard</span>
            <span style="color:var(--text-primary);font-family:var(--font-mono);font-weight:700;">${leetcodeHard}</span>
          </div>
        </div>
      </div>`;

    document.getElementById('leetcode-edit-btn')?.addEventListener('click', openLeetCodeModal);
    document.getElementById('leetcode-refresh-btn')?.addEventListener('click', async () => {
      if (!leetcodeUsername) return;
      try {
        let stats;
        try { stats = await fetchLeetCodeGraphQL(leetcodeUsername); } catch { stats = await fetchLeetCodeStats(leetcodeUsername); }
        leetcodeEasy = stats.easy; leetcodeMedium = stats.medium; leetcodeHard = stats.hard;
        if (stats.beats > 0) leetcodeBeats = stats.beats;
        await db.set('aura_leetcode_easy', leetcodeEasy);
        await db.set('aura_leetcode_medium', leetcodeMedium);
        await db.set('aura_leetcode_hard', leetcodeHard);
        await db.set('aura_leetcode_beats', leetcodeBeats);
      } catch (err) { console.error(err); alert('Sync failed. Using cached data.'); }
      renderLeetCode();
    });
  };

  // LeetCode → navigate to profile
  const leetcodeContainer = document.getElementById('leetcode-container');
  if (leetcodeContainer) {
    leetcodeContainer.style.cursor = 'pointer';
    leetcodeContainer.addEventListener('click', e => {
      if (e.target.closest('.github-action-btn') || e.target.closest('.github-btn') || e.target.closest('input')) return;
      window.open(leetcodeUsername ? `https://leetcode.com/u/${leetcodeUsername}` : 'https://leetcode.com', '_blank');
    });
  }

  // ── Initialize all renders ───────────────────────────────
  renderTracks();
  updateCentralProgress();
  renderShortcuts();
  renderGitHubContributions();
  renderLeetCode();
};

// ============================================================
// 11. LIFECYCLE INIT
// ============================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}

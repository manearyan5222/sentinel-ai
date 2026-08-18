/**
 * SENTINEL AI - VANILLA JAVASCRIPT ENGINE WITH GEMINI AI INTEGRATION
 * Handles Live CCTV Canvas Simulation, Real-Time Alerts, 5-Second UX Triage Modal,
 * Gemini AI Analysis, AI Chat Assistant Drawer, Visitor Directory, and Analytics.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // --- STATE MANAGEMENT ---
  const state = {
    activeTab: 'grid',
    activeFilter: 'ALL',
    subTab: 'residents',
    searchQuery: '',
    selectedAlert: null,
    aiStatus: 'DISABLED',
    cameras: [
      { id: 'cam-01', name: 'Main Gate & Entry', zone: 'North Gate Access', isRestricted: false, risk: 25, label: 'RESIDENT', trackId: 'TRACK-#0102' },
      { id: 'cam-02', name: 'Perimeter Fence South', zone: 'Restricted Boundary', isRestricted: true, risk: 85, label: 'UNRECOGNIZED', trackId: 'TRACK-#0104' },
      { id: 'cam-03', name: 'Lobby Entrance', zone: 'Building A Reception', isRestricted: false, risk: 20, label: 'RESIDENT', trackId: 'TRACK-#0108' },
      { id: 'cam-04', name: 'Pool & Garden Area', zone: 'Amenities Area', isRestricted: false, risk: 15, label: 'EXPECTED_VISITOR', trackId: 'TRACK-#0110' },
    ],
    alerts: [
      {
        id: 'alt-101',
        camera_id: 'cam-02',
        camera_name: 'Perimeter Fence South',
        location_zone: 'Restricted Boundary',
        risk_score: 85,
        risk_level: 'HIGH',
        entity_label: 'Track #0104 (Unrecognized)',
        identity_type: 'UNRECOGNIZED',
        dwell_time_seconds: 24,
        status: 'ACTIVE',
        created_at: new Date(Date.now() - 120000).toISOString(),
        risk_reasons: [
          'Unrecognized Person (+25)',
          'Restricted Zone Violation (+30)',
          'Extended Dwell Time 24s (+15)',
          'No Active Visitor Pass (+15)'
        ],
        action_protocol: {
          who: 'Unrecognized Subject (Track #0104)',
          where: 'Perimeter Fence South (Restricted Zone)',
          when: '2 minutes ago (Dwell: 24s)',
          what: 'Person loitering near restricted fence boundary for 24s.',
          why: [
            'No matching face/embedding in Resident DB',
            'Boundary zone marked strict restricted',
            'Extended dwell duration exceeds threshold'
          ],
          recommended_action: 'Dispatch patrol guard to verify identity or escort off premises.'
        }
      },
      {
        id: 'alt-102',
        camera_id: 'cam-01',
        camera_name: 'Main Gate & Entry',
        location_zone: 'North Gate Access',
        risk_score: 60,
        risk_level: 'ELEVATED',
        entity_label: 'Track #0109 (Delivery Driver)',
        identity_type: 'UNRECOGNIZED',
        dwell_time_seconds: 12,
        status: 'ACTIVE',
        created_at: new Date(Date.now() - 300000).toISOString(),
        risk_reasons: [
          'Unrecognized Person (+25)',
          'No Active Visitor Reg (+20)',
          'Night Access (+15)'
        ],
        action_protocol: {
          who: 'Unrecognized Individual',
          where: 'Main Gate Access',
          when: '5 minutes ago (Dwell: 12s)',
          what: 'Individual approaching intercom without pre-registered QR code.',
          why: ['Unrecognized face ID', 'No expected visitor pass for Unit 402'],
          recommended_action: 'Verify driver ID over intercom before granting gate open.'
        }
      }
    ],
    residents: [
      { id: 'p-01', name: 'Dr. Sarah Jenkins', type: 'RESIDENT', unit: 'A-402', access: 'FULL_RESIDENT', notes: 'Primary owner, vehicle #CA-9801' },
      { id: 'p-02', name: 'Marcus Vance', type: 'RESIDENT', unit: 'B-104', access: 'FULL_RESIDENT', notes: 'HOA Board Member' },
      { id: 'p-03', name: 'Elena Rostova', type: 'CONTRACTOR', unit: 'FACILITIES', access: 'RESTRICTED_DAYTIME', notes: 'Landscape maintenance head' }
    ],
    visitors: [
      { id: 'v-01', name: 'Robert Chen', host: 'Dr. Sarah Jenkins (A-402)', unit: 'A-402', vehicle: 'NY-4591', status: 'PENDING' },
      { id: 'v-02', name: 'FedEx Express Courier', host: 'Building Reception', unit: 'LOBBY', vehicle: 'US-8812', status: 'CHECKED_IN' }
    ]
  };

  // --- CLOCK CONTROLLER ---
  function updateClock() {
    const now = new Date();
    const clockEl = document.getElementById('clock-display');
    if (clockEl) {
      clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  const API_HOST = (window.location.origin && window.location.origin.startsWith('http')) ? '' : 'http://localhost:8000';

  // --- FETCH GEMINI AI STATUS ---
  async function checkAiStatus() {
    try {
      const res = await fetch(`${API_HOST}/api/ai/status`);
      if (res.ok) {
        const data = await res.json();
        state.aiStatus = data.status;
        const textEl = document.getElementById('gemini-status-text');
        if (textEl) {
          textEl.textContent = `AI: ${data.status}`;
          textEl.className = data.status === 'ONLINE' ? 'val emerald' : 'val amber';
        }
      }
    } catch {
      state.aiStatus = 'DISABLED';
    }
  }
  checkAiStatus();


  // --- NAV TABS ---
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });
      const selectedContent = document.getElementById(`tab-${targetTab}`);
      if (selectedContent) {
        selectedContent.classList.add('active');
      }
      state.activeTab = targetTab;
      render();
    });
  });

  // --- CANVAS CAMERA STREAMS ---
  const animFrameIds = {};
  function renderCameraGrid() {
    const gridContainer = document.getElementById('camera-grid');
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    state.cameras.forEach(cam => {
      const card = document.createElement('div');
      card.className = 'camera-card';

      const isHigh = cam.risk >= 75;
      const isElevated = cam.risk >= 50;
      const riskClass = isHigh ? 'risk-high' : isElevated ? 'risk-elevated' : 'risk-low';

      card.innerHTML = `
        <div class="camera-card-header">
          <div class="cam-title-box">
            <span class="live-dot"></span>
            <span>${cam.name}</span>
            ${cam.isRestricted ? '<span class="restricted-tag">RESTRICTED ZONE</span>' : ''}
          </div>
          <span class="cam-zone">${cam.zone}</span>
        </div>
        <div class="camera-canvas-wrapper">
          <canvas id="canvas-${cam.id}" width="480" height="270"></canvas>
          <div class="cam-overlay-risk ${riskClass}">RISK: ${cam.risk}/100</div>
        </div>
        <div class="camera-card-footer">
          <span style="font-family: var(--font-mono); color: var(--text-muted)">Track: ${cam.trackId}</span>
          <button class="btn btn-secondary btn-sm" onclick="triggerTriageModalForCam('${cam.id}')">
            <i data-lucide="alert-octagon"></i> Triage Alert
          </button>
        </div>
      `;
      gridContainer.appendChild(card);

      initCanvasStream(cam);
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function initCanvasStream(cam) {
    const canvas = document.getElementById(`canvas-${cam.id}`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (animFrameIds[cam.id]) {
      cancelAnimationFrame(animFrameIds[cam.id]);
    }

    let boxX = 60 + Math.random() * 100;
    let boxY = 80 + Math.random() * 40;
    let dx = (Math.random() > 0.5 ? 1 : -1) * 1.2;
    let dy = (Math.random() > 0.5 ? 1 : -1) * 0.8;

    function renderFrame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 40) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
      }

      boxX += dx;
      boxY += dy;
      if (boxX < 40 || boxX > canvas.width - 120) dx = -dx;
      if (boxY < 40 || boxY > canvas.height - 140) dy = -dy;

      const isHigh = cam.risk >= 75;
      const isElevated = cam.risk >= 50;
      const color = isHigh ? '#f43f5e' : isElevated ? '#f59e0b' : '#10b981';

      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(boxX, boxY, 80, 120);

      const len = 10;
      ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(boxX, boxY + len); ctx.lineTo(boxX, boxY); ctx.lineTo(boxX + len, boxY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(boxX + 80 - len, boxY); ctx.lineTo(boxX + 80, boxY); ctx.lineTo(boxX + 80, boxY + len); ctx.stroke();

      ctx.fillStyle = color;
      ctx.fillRect(boxX, boxY - 22, 110, 22);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`${cam.label} [${cam.risk}]`, boxX + 4, boxY - 6);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(boxX, boxY + 122, 80, 18);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText(cam.trackId, boxX + 4, boxY + 135);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(10, 10, 150, 20);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '11px monospace';
      ctx.fillText(`REC • ${cam.id.toUpperCase()}`, 16, 24);

      animFrameIds[cam.id] = requestAnimationFrame(renderFrame);
    }

    renderFrame();
  }

  // --- RENDER SIDEBAR ALERTS ---
  function renderSidebarAlerts() {
    const feed = document.getElementById('sidebar-feed');
    const badge = document.getElementById('pending-alert-count');
    const headerBadge = document.getElementById('active-alert-badge');
    if (!feed) return;

    const activeAlerts = state.alerts.filter(a => a.status === 'ACTIVE');
    if (badge) badge.textContent = `${activeAlerts.length} PENDING`;
    if (headerBadge) headerBadge.textContent = `${activeAlerts.length}`;

    feed.innerHTML = '';
    state.alerts.forEach(alert => {
      const item = document.createElement('div');
      item.className = 'sidebar-item';
      item.onclick = () => openTriageModal(alert);

      const isHigh = alert.risk_score >= 75;
      const badgeColor = isHigh ? 'risk-high' : 'risk-elevated';

      item.innerHTML = `
        <div class="sidebar-item-top">
          <span class="cam-overlay-risk ${badgeColor}">${alert.risk_level} (${alert.risk_score})</span>
          <span class="status-tag status-${alert.status.toLowerCase()}">${alert.status}</span>
        </div>
        <div class="sidebar-item-title">${alert.entity_label}</div>
        <div class="sidebar-item-sub">${alert.camera_name} • ${alert.location_zone}</div>
      `;
      feed.appendChild(item);
    });
  }

  // --- RENDER ALERT CENTER LOGS ---
  function renderAlertLogs() {
    const container = document.getElementById('alert-logs-container');
    if (!container) return;
    container.innerHTML = '';

    const filtered = state.alerts.filter(a => {
      if (state.activeFilter === 'ALL') return true;
      return a.status === state.activeFilter;
    });

    filtered.forEach(alert => {
      const card = document.createElement('div');
      card.className = 'alert-log-card';
      card.onclick = () => openTriageModal(alert);

      card.innerHTML = `
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
            <strong style="font-size:0.85rem">${alert.entity_label}</strong>
            <span class="cam-overlay-risk ${alert.risk_score >= 75 ? 'risk-high' : 'risk-elevated'}">SCORE: ${alert.risk_score}</span>
          </div>
          <p style="font-size:0.75rem; color:var(--text-muted)">
            ${alert.camera_name} • ${alert.location_zone} • ${new Date(alert.created_at).toLocaleTimeString()}
          </p>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.5rem">
          <span class="status-tag status-${alert.status.toLowerCase()}">${alert.status}</span>
          <span style="font-size:0.75rem; color:var(--accent-blue); font-weight:600">Inspect 5s Protocol →</span>
        </div>
      `;
      container.appendChild(card);
    });
  }

  // Filter Buttons
  document.querySelectorAll('#alert-filters .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#alert-filters .filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeFilter = btn.getAttribute('data-filter');
      renderAlertLogs();
    });
  });

  // --- RENDER VISITOR & RESIDENT DIRECTORY ---
  function renderDirectoryTable() {
    const table = document.getElementById('directory-table');
    const resCount = document.getElementById('res-count');
    const visCount = document.getElementById('vis-count');
    if (!table) return;

    if (resCount) resCount.textContent = state.residents.length;
    if (visCount) visCount.textContent = state.visitors.length;

    const isResidents = state.subTab === 'residents';

    if (isResidents) {
      table.innerHTML = `
        <thead>
          <tr>
            <th>Full Name & ID</th>
            <th>Identity Type</th>
            <th>Unit Number</th>
            <th>Access Level</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${state.residents
            .filter(r => r.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || r.unit.toLowerCase().includes(state.searchQuery.toLowerCase()))
            .map(r => `
              <tr>
                <td><strong>${r.name}</strong> <br><span style="font-family:var(--font-mono); font-size:0.65rem; color:var(--text-dim)">${r.id}</span></td>
                <td><span class="version-tag">${r.type}</span></td>
                <td style="font-family:var(--font-mono); font-weight:700">${r.unit}</td>
                <td>${r.access}</td>
                <td>${r.notes}</td>
              </tr>
            `).join('')}
        </tbody>
      `;
    } else {
      table.innerHTML = `
        <thead>
          <tr>
            <th>Visitor Name</th>
            <th>Resident Host</th>
            <th>Unit Number</th>
            <th>Vehicle Plate</th>
            <th>Registration Status</th>
          </tr>
        </thead>
        <tbody>
          ${state.visitors
            .filter(v => v.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || v.unit.toLowerCase().includes(state.searchQuery.toLowerCase()))
            .map(v => `
              <tr>
                <td><strong>${v.name}</strong></td>
                <td>${v.host}</td>
                <td style="font-family:var(--font-mono); font-weight:700">${v.unit}</td>
                <td style="font-family:var(--font-mono)">${v.vehicle}</td>
                <td><span class="status-tag ${v.status === 'CHECKED_IN' ? 'status-legitimate' : 'status-escalated'}">${v.status}</span></td>
              </tr>
            `).join('')}
        </tbody>
      `;
    }
  }

  // Directory Subtabs & Search
  document.getElementById('subtab-residents')?.addEventListener('click', () => {
    document.getElementById('subtab-residents').classList.add('active');
    document.getElementById('subtab-visitors').classList.remove('active');
    state.subTab = 'residents';
    renderDirectoryTable();
  });
  document.getElementById('subtab-visitors')?.addEventListener('click', () => {
    document.getElementById('subtab-visitors').classList.add('active');
    document.getElementById('subtab-residents').classList.remove('active');
    state.subTab = 'visitors';
    renderDirectoryTable();
  });
  document.getElementById('visitor-search')?.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderDirectoryTable();
  });

  // --- RENDER ANALYTICS CHARTS (SVG) ---
  function renderAnalyticsCharts() {
    const trendContainer = document.getElementById('chart-risk-trend');
    const barContainer = document.getElementById('chart-zone-bar');

    if (trendContainer) {
      trendContainer.innerHTML = `
        <svg viewBox="0 0 500 200" style="width:100%; height:100%;">
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path d="M0,160 Q75,140 150,90 T300,120 T450,40 L500,60 L500,200 L0,200 Z" fill="url(#grad)" />
          <path d="M0,160 Q75,140 150,90 T300,120 T450,40 L500,60" fill="none" stroke="#3b82f6" stroke-width="3" />
          <circle cx="150" cy="90" r="5" fill="#3b82f6" />
          <circle cx="450" cy="40" r="5" fill="#f43f5e" />
          <text x="150" y="75" fill="#fff" font-size="11" font-family="sans-serif">08:00 (45)</text>
          <text x="440" y="25" fill="#f43f5e" font-size="11" font-family="sans-serif">20:00 (72)</text>
        </svg>
      `;
    }

    if (barContainer) {
      barContainer.innerHTML = `
        <svg viewBox="0 0 500 200" style="width:100%; height:100%;">
          <rect x="30" y="30" width="80" height="140" fill="#10b981" rx="4" />
          <text x="70" y="20" fill="#a7f3d0" font-size="11" text-anchor="middle">18 Flags</text>
          <text x="70" y="190" fill="#94a3b8" font-size="10" text-anchor="middle">Restricted Zone</text>

          <rect x="150" y="70" width="80" height="100" fill="#3b82f6" rx="4" />
          <text x="190" y="60" fill="#bfdbfe" font-size="11" text-anchor="middle">12 Flags</text>
          <text x="190" y="190" fill="#94a3b8" font-size="10" text-anchor="middle">Main Gate</text>

          <rect x="270" y="120" width="80" height="50" fill="#f59e0b" rx="4" />
          <text x="310" y="110" fill="#fde68a" font-size="11" text-anchor="middle">5 Flags</text>
          <text x="310" y="190" fill="#94a3b8" font-size="10" text-anchor="middle">Lobby</text>

          <rect x="390" y="140" width="80" height="30" fill="#8b5cf6" rx="4" />
          <text x="430" y="130" fill="#ddd6fe" font-size="11" text-anchor="middle">3 Flags</text>
          <text x="430" y="190" fill="#94a3b8" font-size="10" text-anchor="middle">Pool</text>
        </svg>
      `;
    }
  }

  // --- 5-SECOND UX RULE TRIAGE MODAL CONTROLLER & GEMINI AI ANALYSIS ---
  function openTriageModal(alert) {
    state.selectedAlert = alert;
    const modal = document.getElementById('triage-modal');
    if (!modal) return;

    document.getElementById('modal-risk-level-title').textContent = `${alert.risk_level} RISK INCIDENT TRIAGE`;
    document.getElementById('modal-risk-score-pill').textContent = `SCORE: ${alert.risk_score}/100`;

    document.getElementById('sum-who-val').textContent = alert.identity_type;
    document.getElementById('sum-where-val').textContent = alert.camera_name;
    document.getElementById('sum-when-val').textContent = `Dwell: ${alert.dwell_time_seconds}s`;

    document.getElementById('protocol-what-desc').textContent = alert.action_protocol.what;
    document.getElementById('protocol-action-desc').textContent = alert.action_protocol.recommended_action;

    const reasonsList = document.getElementById('protocol-reasons-list');
    reasonsList.innerHTML = alert.risk_reasons.map(r => `<li>${r}</li>`).join('');

    // Reset AI Analysis content
    const aiContent = document.getElementById('ai-analysis-content');
    if (aiContent) {
      aiContent.classList.add('hidden');
      aiContent.innerHTML = '';
    }

    modal.classList.remove('hidden');
  }

  async function generateAiAnalysis() {
    if (!state.selectedAlert) return;
    const aiContent = document.getElementById('ai-analysis-content');
    if (!aiContent) return;

    aiContent.classList.remove('hidden');
    aiContent.innerHTML = '<p style="color:var(--accent-purple); font-family:var(--font-mono)">Querying Google Gemini AI Layer...</p>';

    try {
      const res = await fetch(`${API_HOST}/api/ai/explain-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_id: state.selectedAlert.id, force_refresh: false })
      });
      if (res.ok) {
        const data = await res.json();
        aiContent.innerHTML = `
          <div><strong>Summary:</strong> ${data.summary}</div>
          <div><strong style="color:var(--accent-amber)">Risk Explanation:</strong> ${data.risk_explanation}</div>
          <div><strong style="color:var(--accent-emerald)">Recommended Action:</strong> ${data.recommended_action}</div>
          <div><strong style="color:var(--accent-blue)">Verification Steps:</strong>
            <ul style="padding-left:1rem; margin-top:0.25rem">
              ${(data.verification_steps || []).map(s => `<li>✓ ${s}</li>`).join('')}
            </ul>
          </div>
          <div style="font-style:italic; opacity:0.8; margin-top:0.25rem">Caveat: ${data.uncertainty}</div>
        `;
        return;
      }
    } catch {
      // Fallback
    }


    // Fallback UI
    aiContent.innerHTML = `
      <div><strong>Summary:</strong> Unrecognized entity loitering in ${state.selectedAlert.camera_name}.</div>
      <div><strong style="color:var(--accent-amber)">Risk Explanation:</strong> Risk score is ${state.selectedAlert.risk_score}/100 based on rule factors.</div>
      <div><strong style="color:var(--accent-emerald)">Recommended Action:</strong> Verify live camera feed and check expected arrivals list.</div>
      <div><strong style="color:var(--accent-blue)">Verification Steps:</strong>
        <ul style="padding-left:1rem; margin-top:0.25rem">
          <li>✓ Confirm subject visual on live feed</li>
          <li>✓ Check resident directory</li>
        </ul>
      </div>
      <div style="font-style:italic; opacity:0.8; margin-top:0.25rem">Caveat: Standalone rule-based fallback.</div>
    `;
  }

  document.getElementById('btn-generate-ai')?.addEventListener('click', generateAiAnalysis);

  function closeTriageModal() {
    const modal = document.getElementById('triage-modal');
    if (modal) modal.classList.add('hidden');
  }

  document.getElementById('btn-close-triage-modal')?.addEventListener('click', closeTriageModal);

  document.getElementById('btn-mark-legitimate')?.addEventListener('click', () => {
    if (state.selectedAlert) {
      state.selectedAlert.status = 'LEGITIMATE';
      closeTriageModal();
      render();
    }
  });

  document.getElementById('btn-escalate-incident')?.addEventListener('click', () => {
    if (state.selectedAlert) {
      state.selectedAlert.status = 'ESCALATED';
      closeTriageModal();
      render();
    }
  });

  // Global helper for camera card triage button
  window.triggerTriageModalForCam = function(camId) {
    const cam = state.cameras.find(c => c.id === camId);
    if (!cam) return;

    const mockAlert = {
      id: `alt-${Date.now()}`,
      camera_id: cam.id,
      camera_name: cam.name,
      location_zone: cam.zone,
      risk_score: cam.risk,
      risk_level: cam.risk >= 75 ? 'HIGH' : cam.risk >= 50 ? 'ELEVATED' : 'LOW',
      entity_label: `${cam.trackId} (${cam.label})`,
      identity_type: cam.label,
      dwell_time_seconds: 28,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      risk_reasons: [
        'Unrecognized Person (+25)',
        cam.isRestricted ? 'Restricted Zone Violation (+30)' : 'Unexpected Entry (+15)',
        'Extended Dwell Time 28s (+15)',
        'No Visitor Pre-Registration (+15)'
      ],
      action_protocol: {
        who: `${cam.label} (${cam.trackId})`,
        where: `${cam.name} (${cam.zone})`,
        when: 'Just Now (Dwell: 28s)',
        what: `Subject detected loitering in ${cam.zone}.`,
        why: ['No matching identity embedding', 'Extended presence in monitored camera sector'],
        recommended_action: 'Dispatch security patrol guard to check credentials and assist subject.'
      }
    };
    openTriageModal(mockAlert);
  };

  // --- FLOATING AI ASSISTANT DRAWER CONTROLLER ---
  const aiWidgetBtn = document.getElementById('btn-toggle-ai-widget');
  const aiDrawer = document.getElementById('ai-widget-drawer');
  const aiCloseBtn = document.getElementById('btn-close-ai-drawer');
  const aiChatForm = document.getElementById('ai-chat-form');
  const aiChatInput = document.getElementById('ai-chat-input');
  const aiMessages = document.getElementById('ai-chat-messages');

  aiWidgetBtn?.addEventListener('click', () => {
    aiDrawer?.classList.toggle('hidden');
  });
  aiCloseBtn?.addEventListener('click', () => {
    aiDrawer?.classList.add('hidden');
  });

  aiChatForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = aiChatInput.value.trim();
    if (!query) return;

    // Append User Message
    const userDiv = document.createElement('div');
    userDiv.className = 'chat-msg user';
    userDiv.innerHTML = `<p>${query}</p>`;
    aiMessages.appendChild(userDiv);
    aiChatInput.value = '';
    aiMessages.scrollTop = aiMessages.scrollHeight;

    // Append Loading Indicator
    const loadDiv = document.createElement('div');
    loadDiv.className = 'chat-msg bot';
    loadDiv.innerHTML = `<p style="color:var(--accent-purple); font-family:var(--font-mono)">Querying event logs...</p>`;
    aiMessages.appendChild(loadDiv);
    aiMessages.scrollTop = aiMessages.scrollHeight;

    try {
      const res = await fetch(`${API_HOST}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });
      if (res.ok) {
        const data = await res.json();
        loadDiv.innerHTML = `<p>${data.answer}</p>`;
        aiMessages.scrollTop = aiMessages.scrollHeight;
        return;
      }
    } catch {
      // Fallback
    }


    loadDiv.innerHTML = `<p>Active Alerts: ${state.alerts.filter(a => a.status === 'ACTIVE').length} active pending guard triage. System operating normally.</p>`;
    aiMessages.scrollTop = aiMessages.scrollHeight;
  });

  // --- VISITOR MODAL CONTROLLER ---
  const visitorModal = document.getElementById('visitor-modal');
  document.getElementById('btn-open-visitor-modal')?.addEventListener('click', () => {
    visitorModal?.classList.remove('hidden');
  });
  document.getElementById('btn-close-visitor-modal')?.addEventListener('click', () => {
    visitorModal?.classList.add('hidden');
  });
  document.getElementById('btn-cancel-visitor')?.addEventListener('click', () => {
    visitorModal?.classList.add('hidden');
  });

  document.getElementById('visitor-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('form-vis-name').value;
    const unit = document.getElementById('form-vis-unit').value;
    const host = document.getElementById('form-vis-host').value || `Resident Unit ${unit}`;
    const plate = document.getElementById('form-vis-plate').value || 'Walking Pass';

    state.visitors.unshift({
      id: `v-${Date.now()}`,
      name,
      unit,
      host,
      vehicle: plate,
      status: 'PENDING'
    });

    visitorModal?.classList.add('hidden');
    document.getElementById('visitor-form').reset();
    renderDirectoryTable();
  });

  // --- BACKEND WEBSOCKET AUTO-CONNECT ---
  function tryConnectWebSocket() {
    try {
      const ws = new WebSocket('ws://localhost:8000/ws/alerts');
      ws.onopen = () => {
        const syncText = document.getElementById('sync-text');
        if (syncText) {
          syncText.textContent = 'FASTAPI WS CONNECTED';
          syncText.className = 'val emerald';
        }
      };
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'ALERT') {
          state.alerts.unshift(msg.data);
          renderSidebarAlerts();
          renderAlertLogs();
        }
      };
    } catch (e) {
      console.log('Standalone mode active.');
    }
  }
  tryConnectWebSocket();

  // --- INITIAL RENDER ---
  function render() {
    renderCameraGrid();
    renderSidebarAlerts();
    renderAlertLogs();
    renderDirectoryTable();
    renderAnalyticsCharts();
  }

  render();
});

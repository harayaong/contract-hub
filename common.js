// 📋 Contract Hub: 기관 계약 관리 시스템
// common.js

const CH = {
  API: 'https://script.google.com/macros/s/AKfycbx7SNtdVTDbe66mXwcU-Fc_rrZrsC1t4NLNKsyU1cOu8gQEFRlPEqr9-cRtwOsbq1tp9w/exec',

  // ==============================
  // 인증
  // ==============================
  get token()  { return localStorage.getItem('ch_token');  },
  get role()   { return localStorage.getItem('ch_role');   },
  get branch() { return localStorage.getItem('ch_branch'); },
  get name()   { return localStorage.getItem('ch_name');   },

  requireAuth() {
    if (!this.token) { location.href = 'index.html'; return false; }
    return true;
  },

  logout() {
    localStorage.clear();
    location.href = 'index.html';
  },

  // ==============================
  // API 호출
  // ==============================
  async get(params) {
    const qs = new URLSearchParams({ ...params, token: this.token });
    const r  = await fetch(`${this.API}?${qs}`);
    return r.json();
  },

  async post(action, data) {
    const requestId = Date.now() + '_' + Math.random().toString(36).slice(2);
    const r = await fetch(this.API, {
      method: 'POST',
      body: JSON.stringify({ action, token: this.token, data, requestId })
    });
    return r.json();
  },

  // ==============================
  // 날짜 포맷 (KST)
  // ==============================
  fmtDate(val) {
    if (!val || val === '') return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    const pad = n => String(n).padStart(2, '0');
    const yyyy = kst.getUTCFullYear();
    const mm   = pad(kst.getUTCMonth() + 1);
    const dd   = pad(kst.getUTCDate());
    const hh   = pad(kst.getUTCHours());
    const mi   = pad(kst.getUTCMinutes());
    const ss   = pad(kst.getUTCSeconds());
    if (hh === '00' && mi === '00' && ss === '00') return `${yyyy}-${mm}-${dd}`;
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  },

  // ==============================
  // 진행단계
  // ==============================
  STAGE_LABELS: ['계약', 'Admin 등록', 'siteID 부여', '설치 완료', '업로드 확인', '서비스 오픈', '취소'],

  stageTagClass(stage) {
    const map = { 1:'tag-1', 2:'tag-2', 3:'tag-3', 4:'tag-4', 5:'tag-5', 6:'tag-6', 7:'tag-7' };
    return map[parseInt(stage)] || 'tag-1';
  },

  stageLabel(stage) {
    return this.STAGE_LABELS[parseInt(stage) - 1] || '';
  },

  // ==============================
  // OMS 상태 뱃지
  // ==============================
  badgeStatus(status) {
    if (!status) return '<span class="badge badge-etc">-</span>';
    const s = String(status).toUpperCase();
    if (s === 'ON' || s === 'APPROVED') return `<span class="badge badge-on">${status}</span>`;
    if (s === 'OFF')                    return `<span class="badge badge-off">${status}</span>`;
    if (s.includes('SANITY'))           return `<span class="badge badge-sanity">${status}</span>`;
    return `<span class="badge badge-etc">${status}</span>`;
  },

  // ==============================
  // 토스트
  // ==============================
  showToast(msg, loading = false) {
    let t = document.getElementById('ch-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'ch-toast';
      t.style.cssText = 'position:fixed;bottom:24px;right:24px;color:#fff;padding:12px 20px;border-radius:12px;font-size:14px;font-weight:500;display:none;z-index:999;box-shadow:0 4px 16px rgba(0,0,0,0.15);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;';
      document.body.appendChild(t);
    }
    t.textContent = loading ? '⏳ ' + msg : '✓ ' + msg;
    t.style.background = loading ? '#64748b' : '#0f172a';
    t.style.display = 'block';
    if (!loading) setTimeout(() => t.style.display = 'none', 2500);
  },

  // ==============================
  // 헤더 렌더링 (공통 사이드바/탭바)
  // ==============================
  MENUS: {
    admin:   [
      { id: 'overview',  icon: '🏠', label: '전체 현황',  href: 'overview.html'  },
      { id: 'filter',    icon: '🔍', label: '필터 검색',  href: 'filter.html'    },
      { id: 'contract',  icon: '✍️', label: '계약 입력',  href: 'contract.html'  },
      { id: 'logs',      icon: '🕓', label: '변경 로그',  href: 'logs.html'      },
    ],
    bizteam: [
      { id: 'overview',  icon: '🏠', label: '전체 현황',  href: 'overview.html'  },
      { id: 'filter',    icon: '🔍', label: '필터 검색',  href: 'filter.html'    },
      { id: 'contract',  icon: '✍️', label: '계약 입력',  href: 'contract.html'  },
      { id: 'logs',      icon: '🕓', label: '변경 로그',  href: 'logs.html'      },
    ],
    branch:  [
      { id: 'contract',  icon: '✍️', label: '계약 입력',  href: 'contract.html'  },
      { id: 'filter',    icon: '🔍', label: '기관 현황',  href: 'filter.html'    },
    ],
  },

  renderNav(activeId) {
    const menus = this.MENUS[this.role] || this.MENUS.branch;

    // 사이드바
    const sideNav = document.getElementById('sideNav');
    if (sideNav) {
      sideNav.innerHTML = menus.map(m => `
        <a href="${m.href}" class="nav-item ${m.id === activeId ? 'active' : ''}">
          <span class="nav-icon">${m.icon}</span>${m.label}
        </a>
      `).join('');
    }

    // 하단 탭바
    const bottomNav = document.getElementById('bottomNav');
    if (bottomNav) {
      bottomNav.innerHTML = menus.map(m => `
        <a href="${m.href}" class="bottom-item ${m.id === activeId ? 'active' : ''}">
          <span class="b-icon">${m.icon}</span>${m.label}
        </a>
      `).join('');
    }

    // 유저 정보
    const avatar = document.getElementById('userAvatar');
    const uname  = document.getElementById('userName');
    const urole  = document.getElementById('userRole');
    if (avatar) avatar.textContent = (this.name || 'U').charAt(0).toUpperCase();
    if (uname)  uname.textContent  = this.name || '';
    if (urole)  urole.textContent  = this.role === 'branch' ? this.branch : this.role;
  },

  // ==============================
  // 공통 CSS (각 페이지에서 <link> 대신 inline으로 삽입)
  // ==============================
  COMMON_STYLE: `
    *{box-sizing:border-box;margin:0;padding:0;}
    :root{
      --primary:#1a3a6b;--primary-light:#2563eb;
      --sidebar-w:220px;--header-h:60px;--bottombar-h:60px;
      --bg:#f0f4f8;--card:#fff;--border:#e2e8f0;
      --text:#0f172a;--text-sub:#64748b;--text-hint:#94a3b8;
    }
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}
    .sidebar{position:fixed;top:0;left:0;width:var(--sidebar-w);height:100vh;background:var(--primary);display:flex;flex-direction:column;z-index:200;}
    .sidebar-logo{height:var(--header-h);display:flex;align-items:center;gap:10px;padding:0 20px;border-bottom:1px solid rgba(255,255,255,0.08);}
    .sidebar-logo .icon{width:32px;height:32px;background:rgba(255,255,255,0.15);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;}
    .sidebar-logo span{font-size:15px;font-weight:700;color:#fff;}
    .sidebar-nav{flex:1;padding:16px 12px;display:flex;flex-direction:column;gap:4px;}
    .nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;font-size:14px;font-weight:500;color:rgba(255,255,255,0.55);cursor:pointer;transition:all 0.15s;text-decoration:none;}
    .nav-item:hover{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.85);}
    .nav-item.active{background:rgba(255,255,255,0.15);color:#fff;}
    .nav-icon{font-size:16px;width:20px;text-align:center;}
    .sidebar-footer{padding:16px 12px;border-top:1px solid rgba(255,255,255,0.08);}
    .user-info{display:flex;align-items:center;gap:10px;padding:10px 12px;}
    .user-avatar{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0;}
    .user-name{font-size:13px;font-weight:600;color:#fff;}
    .user-role{font-size:11px;color:rgba(255,255,255,0.45);}
    .logout-btn{margin-top:8px;width:100%;padding:8px;border-radius:8px;background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.55);border:none;font-size:13px;cursor:pointer;transition:all 0.15s;}
    .logout-btn:hover{background:rgba(255,255,255,0.14);color:#fff;}
    .main{margin-left:var(--sidebar-w);min-height:100vh;display:flex;flex-direction:column;}
    .topbar{height:var(--header-h);background:var(--card);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 24px;position:sticky;top:0;z-index:100;}
    .topbar-title{font-size:16px;font-weight:700;}
    .topbar-sub{font-size:12px;color:var(--text-hint);margin-top:1px;}
    .content{padding:24px;flex:1;}
    .card{background:var(--card);border-radius:16px;border:1px solid var(--border);padding:24px;margin-bottom:20px;}
    .card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
    .card-title{font-size:15px;font-weight:700;}
    .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
    .form-group{display:flex;flex-direction:column;gap:6px;}
    .form-group.full{grid-column:1/-1;}
    .form-group label{font-size:11px;font-weight:700;color:var(--text-sub);text-transform:uppercase;letter-spacing:0.5px;}
    .form-group input,.form-group select,.form-group textarea{padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:14px;color:var(--text);background:#f8fafc;outline:none;transition:border-color 0.2s;font-family:inherit;}
    .form-group input:focus,.form-group select:focus{border-color:var(--primary-light);background:#fff;}
    .form-group input[readonly]{background:#f1f5f9;color:var(--text-hint);cursor:default;}
    .form-group textarea{resize:vertical;}
    .btn{padding:10px 20px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;border:none;transition:all 0.15s;font-family:inherit;}
    .btn-primary{background:var(--primary);color:#fff;}
    .btn-primary:hover{background:#1e4080;}
    .btn-warn{background:#f59e0b;color:#fff;}
    .btn-warn:hover{background:#d97706;}
    .btn-secondary{background:#f1f5f9;color:var(--text-sub);border:1px solid var(--border);}
    .btn-secondary:hover{background:var(--border);}
    .btn-sm{padding:6px 12px;font-size:12px;border-radius:8px;}
    .btn-row{display:flex;gap:8px;margin-top:20px;justify-content:flex-end;}
    .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;}
    .badge-on{background:#d1fae5;color:#065f46;}
    .badge-off{background:#fee2e2;color:#991b1b;}
    .badge-sanity{background:#fef3c7;color:#92400e;}
    .badge-etc{background:#f1f5f9;color:#475569;}
    .stage-tag{font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;white-space:nowrap;}
    .tag-1{background:#fef3c7;color:#92400e;}
    .tag-2{background:#dbeafe;color:#1e40af;}
    .tag-3{background:#ede9fe;color:#5b21b6;}
    .tag-4{background:#d1fae5;color:#065f46;}
    .tag-5{background:#d1fae5;color:#065f46;}
    .tag-6{background:#0f172a;color:#fff;}
    .tag-7{background:#fee2e2;color:#991b1b;}
    .tag-tmp{font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;background:#fef3c7;color:#92400e;}
    .table-wrap{overflow-x:auto;}
    table{width:100%;border-collapse:collapse;font-size:13px;}
    th{padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text-sub);text-transform:uppercase;letter-spacing:0.4px;background:#f8fafc;border-bottom:1px solid var(--border);white-space:nowrap;}
    td{padding:12px 14px;border-bottom:1px solid #f1f5f9;vertical-align:middle;}
    tr:last-child td{border-bottom:none;}
    tr:hover td{background:#f8fafc;}
    .empty{text-align:center;padding:48px 20px;color:var(--text-hint);font-size:14px;}
    .search-input{width:100%;padding:10px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:14px;outline:none;background:#f8fafc;transition:border-color 0.2s;font-family:inherit;}
    .search-input:focus{border-color:var(--primary-light);background:#fff;}
    .bottombar{display:none;position:fixed;bottom:0;left:0;right:0;height:var(--bottombar-h);background:var(--primary);z-index:200;border-top:1px solid rgba(255,255,255,0.1);}
    .bottombar-inner{display:flex;height:100%;}
    .bottom-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;color:rgba(255,255,255,0.45);font-size:10px;font-weight:600;text-decoration:none;}
    .bottom-item.active{color:#fff;}
    .b-icon{font-size:18px;}
    @media(max-width:768px){
      .sidebar{display:none;}
      .bottombar{display:block;}
      .main{margin-left:0;padding-bottom:var(--bottombar-h);}
      .topbar{padding:0 16px;}
      .content{padding:16px;}
      .form-grid{grid-template-columns:1fr;}
      .card{padding:16px;border-radius:12px;}
    }
    @media(max-width:375px){
      .content{padding:12px;}
      .card{padding:14px;}
      .form-group input,.form-group select{font-size:16px;}
    }
  `,

  injectStyle() {
    const s = document.createElement('style');
    s.textContent = this.COMMON_STYLE;
    document.head.appendChild(s);
  },
};

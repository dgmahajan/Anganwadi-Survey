// ── Survey Application Logic ──────────────────────────────────

window.SURVEYS = window.SURVEYS || [];
let currentSurvey = null;
let answers = {};

// ── In-page camera (no file picker): live view + capture button ──
function openCamera(onPhoto, onFail) {
  const ov = document.createElement('div');
  ov.className = 'cam-overlay';
  // Inline styles so the camera is always full-screen, even if the page CSS is old or cached
  ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;width:100%;height:100%;background:#000;z-index:99999;display:flex;flex-direction:column;';
  ov.innerHTML = '<video autoplay playsinline muted style="flex:1;width:100%;min-height:0;object-fit:cover;background:#000;"></video>' +
    '<div class="cam-bar" style="display:flex;gap:12px;padding:16px;background:#000;justify-content:space-between;">' +
    '<button type="button" class="cam-cancel" style="flex:1;padding:16px;font-size:20px;border:none;border-radius:10px;background:#ddd;color:#222;">रद्द करा</button>' +
    '<button type="button" class="cam-shot" style="flex:1;padding:16px;font-size:20px;border:none;border-radius:10px;background:#1a6b3a;color:#fff;font-weight:700;">📷 फोटो घ्या</button></div>';
  document.body.appendChild(ov);
  document.body.style.overflow = 'hidden';
  const video = ov.querySelector('video');
  let stream = null;
  const close = () => { if (stream) stream.getTracks().forEach(t => t.stop()); ov.remove(); document.body.style.overflow = ''; };
  navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false
  }).then(st => { stream = st; video.srcObject = st; }).catch(() => { close(); onFail(); });
  ov.querySelector('.cam-cancel').onclick = close;
  ov.querySelector('.cam-shot').onclick = () => {
    if (!video.videoWidth) return;
    const sc = Math.min(1, 1280 / video.videoWidth);
    const c = document.createElement('canvas');
    c.width = Math.round(video.videoWidth * sc); c.height = Math.round(video.videoHeight * sc);
    c.getContext('2d').drawImage(video, 0, 0, c.width, c.height);
    const url = c.toDataURL('image/jpeg', 0.72);
    close(); onPhoto(url);
  };
}

// ── Load survey files dynamically ────────────────────────────
async function loadSurveyFiles() {
  for (const id of SURVEY_INDEX) {
    await new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = `surveys/${id}.js?v=${Date.now()}`;
      s.onload = resolve;
      s.onerror = () => { console.warn('Could not load: ' + id); resolve(); };
      document.head.appendChild(s);
    });
  }
}

// ── Date helpers ──────────────────────────────────────────────
function today() {
  return new Date().toISOString().split('T')[0];
}

function isActive(survey) {
  const t = today();
  return t >= survey.start && t <= survey.end;
}

// ── Main init ─────────────────────────────────────────────────
async function initApp() {
  await loadSurveyFiles();
  let active = (window.SURVEYS || []).filter(isActive);
  // Direct link: ?s=<survey id> opens only that survey, with no choice screen.
  const wanted = new URLSearchParams(location.search).get('s');
  if (wanted) {
    const hit = active.filter(x => x.id === wanted);
    if (hit.length) { showSurvey(hit[0]); return; }
  }
  // Surveys marked unlisted:true never appear on the shared link; they open only through their own ?s= link.
  active = active.filter(x => !x.unlisted);
  if (active.length === 0) {
    showNoSurveys();
  } else if (active.length === 1) {
    showSurvey(active[0]);
  } else {
    showSurveyList(active);
  }
}

// ── Screen: No active surveys ─────────────────────────────────
function showNoSurveys() {
  document.getElementById('app').innerHTML = `
    <div class="card">
      <div class="header"><h1>अंगणवाडी सर्वेक्षण</h1><p>Angawadi Survey Portal</p></div>
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h2>सध्या कोणतेही सर्वेक्षण उपलब्ध नाही</h2>
        <p>No active surveys at this time.<br/>Please check back later.</p>
      </div>
    </div>`;
}

// ── Screen: Survey list ───────────────────────────────────────
function showSurveyList(surveys) {
  window.SURVEYS_MAP = {};
  surveys.forEach(s => window.SURVEYS_MAP[s.id] = s);
  const items = surveys.map(s => `
    <div class="survey-card" onclick="showSurvey(SURVEYS_MAP['${s.id}'])">
      <div class="survey-card-name">${s.name}</div>
      <div class="survey-card-sub">${s.subtitle || ''}</div>
      <div class="survey-card-dates">📅 ${s.start} ते ${s.end}</div>
    </div>`).join('');
  document.getElementById('app').innerHTML = `
    <div class="card">
      <div class="header"><h1>अंगणवाडी सर्वेक्षण</h1><p>Angawadi Survey Portal</p></div>
      <p class="section-title">सक्रिय सर्वेक्षण निवडा</p>
      <p class="section-sub">Select a survey to answer</p>
      ${items}
    </div>`;
}

// ── Screen: Survey form ───────────────────────────────────────
function showSurvey(survey) {
  currentSurvey = survey;
  answers = {};
  const sorted = [...survey.schools].sort((a, b) => a.name.localeCompare(b.name, 'mr'));
  const udiseOpts = sorted.map(s => `<option value="${s.udise}">${s.udise}</option>`).join('');
  const nameOpts  = sorted.map(s => `<option value="${s.udise}">${s.name}</option>`).join('');
  // Project -> sector -> Anganwadi: only when the survey's list carries project/sector for its schools
  const hasGroups = survey.schools.some(x => x.project);
  const uniq = arr => [...new Set(arr)].sort((a, b) => a.localeCompare(b, 'mr'));
  const projOpts = hasGroups ? uniq(survey.schools.map(x => x.project || 'इतर')).map(p => `<option value="${p}">${p}</option>`).join('') : '';

  document.getElementById('app').innerHTML = `
    <div class="card">
      <div class="header"><h1>${survey.name}</h1><p>${survey.subtitle || ''}</p></div>
      ${survey.intro ? `<div class="intro-box"><div class="intro-title">${survey.intro.title}</div><ol>${survey.intro.steps.map(x => '<li>' + x + '</li>').join('')}</ol></div>` : ''}
      <form id="survey-form">
        ${hasGroups ? `<label>प्रकल्प निवडा *</label>
        <select id="sel-project"><option value="">-- प्रकल्प निवडा --</option>${projOpts}</select>
        <label style="margin-top:14px;">सेक्टर निवडा *</label>
        <select id="sel-sector" disabled><option value="">-- आधी प्रकल्प निवडा --</option></select>` : ''}
        <label${hasGroups ? ' style="margin-top:14px;"' : ''}>अंगणवाडी क्रमांक निवडा *</label>
        <select id="sel-udise"${hasGroups ? ' disabled' : ''}><option value="">-- अंगणवाडी क्रमांक निवडा --</option>${udiseOpts}</select>
        <label style="margin-top:14px;">अंगणवाडीचे नाव निवडा *</label>
        <select id="sel-name"><option value="">-- अंगणवाडीचे नाव निवडा --</option>${nameOpts}</select>
        <div id="match-ok"    class="match-ok"    style="display:none;">✓ अंगणवाडी क्रमांक आणि अंगणवाडीचे नाव जुळते.</div>
        <div id="match-fail"  class="match-fail"  style="display:none;">✗ अंगणवाडी क्रमांक आणि अंगणवाडीचे नाव जुळत नाही. कृपया पुन्हा निवडा.</div>
        <div id="prior-notice" class="prior-notice" style="display:none;">
          ✏️ तुमच्या अंगणवाडीने आधीच उत्तर दिले आहे. तुम्ही खाली बदल करून पुन्हा सादर करू शकता.<br/>
          ${survey.marathiOnly ? '' : '<small>Your Anganwadi already submitted. You can edit and resubmit below.</small>'}
        </div>
        <div id="geo-panel" style="display:none;">
          <div class="geo-box">
            <div id="geo-status" class="geo-status"></div>
            <div id="geo-acc" class="geo-acc"></div>
          </div>
          <button type="button" class="submit-btn" id="geo-next" disabled>पुढे</button>
          <button type="button" class="geo-retry" id="geo-retry" style="display:none;">पुन्हा प्रयत्न करा</button>
        </div>
        <div id="questions-section" style="display:none;">
          <div id="mobile-block">
            <div id="mobile-confirm" style="display:none;margin-top:20px;"></div>
            <div id="mobile-entry">
              <label id="mobile-label" style="margin-top:20px;">मोबाइल नंबर *</label>
              <div class="subtext">${survey.marathiOnly ? '' : 'Mobile number (10 digits)'}</div>
              <input type="tel" id="mobile-number" placeholder="10-अंकी मोबाइल नंबर" maxlength="10" />
            </div>
          </div>
          <div id="questions-container"></div>
          <button type="submit" class="submit-btn" id="submit-btn">${survey.marathiOnly ? 'सादर करा' : 'सादर करा (Submit)'}</button>
        </div>
      </form>
    </div>`;

  if (hasGroups) {
    const selP = document.getElementById('sel-project'), selS = document.getElementById('sel-sector');
    const selU = document.getElementById('sel-udise'),   selN = document.getElementById('sel-name');
    const fillSchools = () => {
      const p = selP.value, sec = selS.value;
      const list = (p && sec) ? sorted.filter(x => (x.project || 'इतर') === p && (x.sector || 'इतर') === sec) : [];
      selU.innerHTML = '<option value="">-- अंगणवाडी क्रमांक निवडा --</option>' + list.map(x => `<option value="${x.udise}">${x.udise}</option>`).join('');
      selN.innerHTML = '<option value="">-- अंगणवाडीचे नाव निवडा --</option>' + list.map(x => `<option value="${x.udise}">${x.name}</option>`).join('');
      selU.disabled = selN.disabled = !(p && sec);
      checkMatch();
    };
    selP.addEventListener('change', () => {
      const p = selP.value;
      const secs = p ? uniq(survey.schools.filter(x => (x.project || 'इतर') === p).map(x => x.sector || 'इतर')) : [];
      selS.innerHTML = '<option value="">' + (p ? '-- सेक्टर निवडा --' : '-- आधी प्रकल्प निवडा --') + '</option>' + secs.map(x => `<option value="${x}">${x}</option>`).join('');
      selS.disabled = !p;
      fillSchools();
    });
    selS.addEventListener('change', fillSchools);
    selN.disabled = true;
  }
  document.getElementById('sel-udise').addEventListener('change', checkMatch);
  document.getElementById('sel-name').addEventListener('change', checkMatch);
  document.getElementById('survey-form').addEventListener('submit', submitSurvey);
  buildQuestions(survey);
}

// ── Mobile number: confirm the saved Sevika number (last 4 digits shown) or type a new one ──
let mobileState = 'enter';     // 'enter' | 'confirmed' | 'change'
let priorMobile = '';
let mobileHidden = false;

function setupMobile(school) {
  const sv = currentSurvey;
  mobileState = 'enter';
  const confirmBox = document.getElementById('mobile-confirm');
  const entry      = document.getElementById('mobile-entry');
  document.getElementById('mobile-label').textContent =
    sv.phoneConfirm ? 'अंगणवाडी सेविकेचा मोबाईल नंबर *' : 'मोबाइल नंबर *';
  confirmBox.style.display = 'none'; confirmBox.innerHTML = '';
  entry.style.display = '';
  if (!(sv.phoneConfirm && school && /^[0-9]{4}$/.test(String(school.phone4 || '')))) return;
  mobileState = '';              // must choose
  entry.style.display = 'none';
  confirmBox.style.display = 'block';
  confirmBox.innerHTML = `
    <label>अंगणवाडी सेविकेचा मोबाईल नंबर *</label>
    <div class="phone-shown">XXXXXX<b>${school.phone4}</b></div>
    <div class="subtext">हा नंबर बरोबर आहे का?</div>
    <div class="yesno-row" id="row-phone">
      <button type="button" class="yesno-btn yes" data-val="yes">होय, बरोबर आहे</button>
      <button type="button" class="yesno-btn no"  data-val="no">नाही, बदला</button>
    </div>`;
  confirmBox.querySelectorAll('.yesno-btn').forEach(btn => btn.addEventListener('click', () => {
    confirmBox.querySelectorAll('.yesno-btn').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    mobileState = btn.dataset.val === 'yes' ? 'confirmed' : 'change';
    entry.style.display = mobileState === 'change' ? '' : 'none';
  }));
}

// ── GPS check at the Anganwadi door ──────────────────────────
let geoWatch = null, geoTimer = null, geoBest = null, geoStart = 0, geoResult = null;

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000, rad = x => x * Math.PI / 180;
  const dp = rad(lat2 - lat1), dl = rad(lon2 - lon1);
  const a = Math.sin(dp/2)**2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dl/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function stopGeo() {
  if (geoWatch !== null && navigator.geolocation) navigator.geolocation.clearWatch(geoWatch);
  if (geoTimer) clearInterval(geoTimer);
  geoWatch = null; geoTimer = null;
}

function revealQuestions() {
  document.getElementById('geo-panel').style.display = 'none';
  document.getElementById('questions-section').style.display = 'block';
}

function startGeo(school) {
  const cfg = currentSurvey.geo || {};
  const GOOD = cfg.goodAcc || 10, MAXW = cfg.maxWait || 60, RADIUS = cfg.radius || 50;
  const panel = document.getElementById('geo-panel');
  const stat  = document.getElementById('geo-status');
  const accEl = document.getElementById('geo-acc');
  const next  = document.getElementById('geo-next');
  const retry = document.getElementById('geo-retry');
  stopGeo(); geoBest = null; geoResult = null; geoStart = Date.now();
  panel.style.display = 'block';
  next.disabled = true; retry.style.display = 'none';
  next.onclick = null;

  // Admin preview entries (TEST...) have no location: skip the check
  if (String(school.udise).indexOf('TEST') === 0) {
    stat.textContent = 'चाचणी (TEST) अंगणवाडी — लोकेशन तपासणी वगळली आहे.';
    accEl.textContent = '';
    next.disabled = false;
    next.onclick = () => { geoResult = { status: 'TEST' }; revealQuestions(); };
    return;
  }
  if (!navigator.geolocation) {
    stat.textContent = 'या फोनमध्ये लोकेशन सुविधा उपलब्ध नाही. दुसऱ्या फोनवर प्रयत्न करा.';
    return;
  }
  stat.textContent = 'लोकेशन शोधत आहे… कृपया बाहेर मोकळ्या जागेत थांबा.';
  accEl.textContent = '';

  const refresh = () => {
    const secs = Math.round((Date.now() - geoStart) / 1000);
    if (!geoBest) {
      accEl.textContent = 'वेळ: ' + secs + ' सेकंद';
      if (secs > MAXW) {
        stat.textContent = 'लोकेशन मिळाले नाही. फोनमध्ये लोकेशन (GPS) चालू आहे का ते तपासा.';
        retry.style.display = 'inline-block';
      }
      return;
    }
    const acc = Math.round(geoBest.acc * 10) / 10;
    const good = geoBest.acc <= GOOD;
    accEl.innerHTML = 'सध्याची अचूकता: <b>' + acc + ' मीटर</b> (लक्ष्य: सुमारे ५ मीटर) — वेळ: ' + secs + ' सेकंद';
    stat.textContent = good ? '✓ लोकेशन तयार आहे. "पुढे" दाबा.'
      : (secs >= MAXW ? 'अचूकता कमी आहे, तरी "पुढे" दाबू शकता.' : 'अचूकता वाढेपर्यंत थांबा…');
    next.disabled = !(good || secs >= MAXW);
  };
  geoTimer = setInterval(refresh, 1000);
  geoWatch = navigator.geolocation.watchPosition(pos => {
    const c = pos.coords;
    if (!geoBest || c.accuracy < geoBest.acc) geoBest = { lat: c.latitude, lng: c.longitude, acc: c.accuracy };
    refresh();
  }, err => {
    if (err.code === 1) {
      stat.textContent = 'लोकेशनची परवानगी नाकारली आहे. फोनच्या सेटिंगमध्ये ब्राउझरला लोकेशनची परवानगी द्या आणि पुन्हा प्रयत्न करा.';
      retry.style.display = 'inline-block';
    }
  }, { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 });

  retry.onclick = () => startGeo(school);
  next.onclick = () => {
    if (!geoBest) return;
    stopGeo();
    const hasRef = school.lat != null && school.lng != null;
    const dist = hasRef ? haversine(geoBest.lat, geoBest.lng, Number(school.lat), Number(school.lng)) : null;
    geoResult = {
      gps_lat: geoBest.lat, gps_lng: geoBest.lng,
      gps_acc: Math.round(geoBest.acc * 10) / 10,
      gps_dist_m: dist === null ? '' : Math.round(dist),
      gps_status: dist === null ? 'NO_REF' : (dist <= RADIUS ? 'MATCH' : 'MISMATCH') + (geoBest.acc > GOOD ? '_LOWACC' : ''),
    };
    revealQuestions();
  };
}

const MR = () => !!(currentSurvey && currentSurvey.marathiOnly);   // Marathi-only surveys drop English text

// ── Check UDISE + name match ──────────────────────────────────
async function checkMatch() {
  const u = document.getElementById('sel-udise').value;
  const n = document.getElementById('sel-name').value;
  document.getElementById('match-ok').style.display     = 'none';
  document.getElementById('match-fail').style.display   = 'none';
  document.getElementById('prior-notice').style.display = 'none';
  document.getElementById('questions-section').style.display = 'none';
  document.getElementById('geo-panel').style.display = 'none';
  stopGeo(); geoResult = null;
  document.getElementById('mobile-block').style.display = '';
  mobileHidden = false; priorMobile = '';
  // re-selecting an Anganwadi: forget the once-only items of the previous one and show them again
  (currentSurvey.questions || []).filter(q => q.once).forEach(q => {
    delete answers[q.id];
    const b = document.getElementById('block-' + q.id);
    if (b) b.classList.remove('hidden');
  });
  document.getElementById('mobile-number').value = '';
  if (!u || !n) return;
  if (u !== n) { document.getElementById('match-fail').style.display = 'block'; return; }
  const school = currentSurvey.schools.find(s => s.udise === u);
  setupMobile(school);

  // Fetch prior data silently, then reveal everything at once
  let hasPrior = false;
  try {
    const res  = await fetch(SUBMIT_URL + '?udise=' + u + '&tab=' + encodeURIComponent(currentSurvey.sheet_tab));
    const data = await res.json();
    if (data.submitted && data.prior) {
      hasPrior = true;
      priorMobile = String(data.prior.mobile || '').trim();
      if (/^[0-9]{10}$/.test(priorMobile)) document.getElementById('mobile-number').value = priorMobile;
      // "once" items (mobile number + once-only photo questions): saved on an earlier visit ->
      // never ask again. With mobileOnce they go TOGETHER: all hidden only when ALL are on file,
      // otherwise all show. Saved values stay in the form data so a resubmit never erases them.
      const onceQs   = currentSurvey.questions.filter(q => q.once);
      const photosOk = onceQs.every(q => String(data.prior[q.id] || '').startsWith('http'));
      const mobileOk = /^[0-9]{10}$/.test(priorMobile) || priorMobile === 'CONFIRMED';
      const hideMobile = currentSurvey.mobileOnce && mobileOk && photosOk;
      const hideOnce   = currentSurvey.mobileOnce ? hideMobile : photosOk;
      prefillAnswers(data.prior);
      if (hideMobile) { document.getElementById('mobile-block').style.display = 'none'; mobileHidden = true; }
      if (hideOnce) onceQs.forEach(q => {
        const block = document.getElementById('block-' + q.id);
        if (block) block.classList.add('hidden');
      });
    }
  } catch (err) { /* allow on network error */ }

  // Reveal form only now — fully populated, all at once
  document.getElementById('match-ok').style.display    = 'block';
  if (hasPrior) document.getElementById('prior-notice').style.display = 'block';
  if (currentSurvey.geoCheck) startGeo(school);
  else document.getElementById('questions-section').style.display = 'block';
}

// ── Build questions ───────────────────────────────────────────
function buildQuestions(survey) {
  answers = {};
  const container = document.getElementById('questions-container');
  container.innerHTML = '';
  survey.questions.forEach(q => {
    const block = document.createElement('div');
    block.className = 'question-block' + (q.showIf ? ' hidden' : '');
    block.id = 'block-' + q.id;
    const lbl = document.createElement('label');
    lbl.textContent = q.text;
    block.appendChild(lbl);
    if (q.subtext) {
      const sub = document.createElement('div');
      sub.className = 'subtext';
      sub.textContent = q.subtext;
      block.appendChild(sub);
    }
    if (q.image) {
      const imgSrc = `surveys/${survey.id}/${q.image}`;
      const wrap = document.createElement('div');
      wrap.className = 'q-image-wrap';
      wrap.innerHTML = `
        <img class="q-thumb" src="${imgSrc}" alt="प्रश्नाशी संबंधित चित्र"
             onclick="openLightbox('${imgSrc}')" />
        <div class="q-thumb-hint">👆 चित्र मोठे पाहण्यासाठी स्पर्श करा / Tap to enlarge</div>`;
      block.appendChild(wrap);
    }
    if (q.type === 'yesno' || q.type === 'yesnodk' || q.type === 'choice') {
      const row = document.createElement('div');
      row.className = 'yesno-row';
      row.id = 'row-' + q.id;
      const opts = q.type === 'choice'
        ? q.options.map(o => ({val: String(o), label: '✔ ' + o, cls: 'yes'}))
        : q.type === 'yesnodk'
        ? [{val:'yes',label:MR()?'होय':'होय (Yes)',cls:'yes'},{val:'no',label:MR()?'नाही':'नाही (No)',cls:'no'},{val:'dk',label:MR()?'माहीत नाही':"माहीत नाही (Don't Know)",cls:'dk'}]
        : [{val:'yes',label:MR()?'होय':'होय (Yes)',cls:'yes'},{val:'no',label:MR()?'नाही':'नाही (No)',cls:'no'}];
      opts.forEach(({val, label, cls}) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'yesno-btn ' + cls;
        btn.textContent = label;
        btn.dataset.val = val;
        btn.addEventListener('click', () => {
          row.querySelectorAll('.yesno-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          answers[q.id] = val;
          updateConditionals();
        });
        row.appendChild(btn);
      });
      block.appendChild(row);
    } else if (q.type === 'number') {
      const inp = document.createElement('input');
      inp.type = 'number'; inp.id = 'inp-' + q.id;
      inp.min = q.min != null ? q.min : 1; inp.max = q.max != null ? q.max : 99;
      inp.placeholder = `${q.min || 1} ते ${q.max || 99}`;
      inp.addEventListener('input', () => { answers[q.id] = inp.value; });
      block.appendChild(inp);
    } else if (q.type === 'textdk') {
      // Single-line entry (e.g. consumer number) plus a "don't know" tick box that stores the text "माहित नाही"
      const inp = document.createElement('input');
      inp.type = 'text'; inp.id = 'inp-' + q.id;
      inp.inputMode = q.numeric ? 'numeric' : 'text';
      inp.placeholder = 'येथे लिहा...';
      inp.addEventListener('input', () => { answers[q.id] = inp.value.trim(); if (!answers[q.id]) delete answers[q.id]; });
      block.appendChild(inp);
      const lab = document.createElement('label');
      lab.style.cssText = 'display:flex;align-items:center;gap:10px;margin-top:12px;font-size:18px;';
      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.id = 'dk-' + q.id; cb.style.cssText = 'width:26px;height:26px;';
      cb.addEventListener('change', () => {
        if (cb.checked) { inp.value = ''; inp.disabled = true; answers[q.id] = 'माहित नाही'; }
        else { inp.disabled = false; delete answers[q.id]; }
      });
      lab.appendChild(cb);
      lab.appendChild(document.createTextNode('माहित नाही'));
      block.appendChild(lab);
    } else if (q.type === 'text') {
      const ta = document.createElement('textarea');
      ta.id = 'inp-' + q.id;
      ta.placeholder = 'येथे लिहा...';
      ta.addEventListener('input', () => { answers[q.id] = ta.value; });
      block.appendChild(ta);
    } else if (q.type === 'photo') {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      if (currentSurvey && currentSurvey.cameraOnly) fileInput.setAttribute('capture', 'environment');   // open the camera directly, not the file picker
      fileInput.id = 'inp-' + q.id;
      fileInput.style.cssText = 'visibility:hidden;position:absolute;width:0;height:0;';

      const uploadLabel = document.createElement('label');
      uploadLabel.className = 'photo-upload-btn';
      uploadLabel.innerHTML = `<span class="icon">📷</span><span>${MR() ? 'फोटो काढा' : 'फोटो काढा / Take photo using any GPS camera app'}</span>`;
      uploadLabel.appendChild(fileInput);

      const note = document.createElement('div');
      note.className = 'photo-optional-note';
      note.textContent = q.optional === false ? (MR() ? '(आवश्यक)' : '(आवश्यक — Required)') : (MR() ? '(ऐच्छिक)' : '(ऐच्छिक — Optional)');

      const previewWrap = document.createElement('div');
      previewWrap.className = 'photo-preview-wrap';
      previewWrap.style.display = 'none';

      const previewImg = document.createElement('img');
      previewImg.className = 'photo-preview';
      previewImg.addEventListener('click', () => openLightbox(previewImg.src));

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'photo-remove';
      removeBtn.textContent = '✕';
      removeBtn.addEventListener('click', () => {
        delete answers[q.id];
        fileInput.value = '';
        previewImg.src = '';
        previewWrap.style.display = 'none';
        uploadLabel.style.display = 'flex';
      });

      previewWrap.appendChild(previewImg);
      previewWrap.appendChild(removeBtn);

      fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file) return;
        uploadLabel.innerHTML = `<span class="icon">⏳</span><span>${MR() ? 'फोटो तयार होत आहे…' : 'Compressing…'}</span>`;
        const compressed = await compressImage(file);
        answers[q.id] = compressed;
        previewImg.src = compressed;
        previewWrap.style.display = 'inline-block';
        uploadLabel.style.display = 'none';
        uploadLabel.innerHTML = `<span class="icon">📷</span><span>${MR() ? 'फोटो काढा' : 'फोटो काढा / Take photo using any GPS camera app'}</span>`;
      });

      block.appendChild(uploadLabel);
      block.appendChild(previewWrap);
      block.appendChild(note);
      if (currentSurvey && currentSurvey.liveCamera && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        uploadLabel.addEventListener('click', ev => {
          ev.preventDefault();                       // do not open the file picker
          openCamera(url => {
            answers[q.id] = url;
            previewImg.src = url;
            previewWrap.style.display = 'inline-block';
            uploadLabel.style.display = 'none';
          }, () => fileInput.click());               // camera blocked/unavailable -> fall back to picker
        });
      }
    }
    container.appendChild(block);
  });
}

// ── Pre-fill from prior submission ────────────────────────────
function prefillAnswers(prior) {
  if (!currentSurvey) return;
  currentSurvey.questions.forEach(q => {
    const raw = prior[q.id];
    if (raw === undefined || raw === null || raw === '') return;
    // A photo that changes every visit (not once-only) is never carried over: a fresh one is always required.
    if (q.type === 'photo' && !q.once) return;
    const val = String(raw).trim();
    answers[q.id] = val;
    if (q.type === 'yesno' || q.type === 'yesnodk' || q.type === 'choice') {
      const row = document.getElementById('row-' + q.id);
      if (row) row.querySelectorAll('.yesno-btn').forEach(btn => {
        if (btn.dataset.val === val) btn.classList.add('active');
      });
    } else if (q.type === 'photo') {
      const block = document.getElementById('block-' + q.id);
      if (block && val.startsWith('http')) {
        const div = document.createElement('div');
        div.className = 'prior-photo-notice';
        div.innerHTML = `📷 <strong>आधीचा फोटो सादर आहे.</strong><br/>
          <a href="${val}" target="_blank">पाहण्यासाठी येथे क्लिक करा${MR() ? '' : ' / Click to view submitted photo'}</a><br/>
          <small>नवीन फोटो अपलोड केल्यास तो बदलेल${MR() ? '' : ' / Upload a new photo to replace it'}</small>`;
        const uploadLabel = block.querySelector('.photo-upload-btn');
        if (uploadLabel) block.insertBefore(div, uploadLabel);
        else block.appendChild(div);
      }
    } else {
      const inp = document.getElementById('inp-' + q.id);
      if (inp) inp.value = val;
    }
  });
  updateConditionals();
}

// ── Show/hide conditional questions ──────────────────────────
function updateConditionals() {
  if (!currentSurvey) return;
  currentSurvey.questions.forEach(q => {
    if (!q.showIf) return;
    const block = document.getElementById('block-' + q.id);
    if (!block) return;
    if (answers[q.showIf.id] === q.showIf.value) {
      block.classList.remove('hidden');
    } else {
      block.classList.add('hidden');
      delete answers[q.id];
    }
  });
}

// ── Submit ────────────────────────────────────────────────────
async function submitSurvey(e) {
  e.preventDefault();
  const udise  = document.getElementById('sel-udise').value;
  let mobile = document.getElementById('mobile-number').value.trim();
  if (!udise || document.getElementById('sel-name').value !== udise) {
    document.getElementById('match-fail').style.display = 'block'; return;
  }
  if (currentSurvey.geoCheck && !geoResult) { alert('कृपया आधी लोकेशन तपासणी पूर्ण करा आणि "पुढे" दाबा.'); return; }
  if (mobileHidden) {
    mobile = priorMobile;                         // already on file: send it back unchanged
  } else if (mobileState === 'confirmed') {
    mobile = 'CONFIRMED';                         // Sevika confirmed the number we hold
  } else if (mobileState === '') {
    alert('कृपया सेविकेचा मोबाईल नंबर बरोबर आहे का ते निवडा.'); return;
  } else if (!/^[0-9]{10}$/.test(mobile)) {
    alert('कृपया 10-अंकी मोबाइल नंबर टाका.' + (MR() ? '' : '\nPlease enter a valid 10-digit mobile number.')); return;
  }
  for (const q of currentSurvey.questions) {
    const block = document.getElementById('block-' + q.id);
    if (!block || block.classList.contains('hidden') || q.optional || (q.type === 'photo' && q.optional !== false)) continue;
    if (!answers[q.id] && answers[q.id] !== 0) {
      const qt = String(q.text || '').replace(/<[^>]+>/g, '').slice(0, 70);
      block.scrollIntoView({behavior: 'smooth', block: 'center'});
      block.style.outline = '3px solid #d32f2f';
      alert('कृपया सर्व प्रश्नांची उत्तरे द्या.\n\nउत्तर राहिलेला प्रश्न:\n' + qt + '…' + (MR() ? '' : '\nPlease answer all required questions.')); return;
    }
  }
  const school = currentSurvey.schools.find(s => s.udise === udise);
  const payload = {
    udise: school.udise, anganwadi_name: school.name, taluka: school.taluka,
    mobile, timestamp: new Date().toISOString(), sheet_tab: currentSurvey.sheet_tab, ...answers, ...(geoResult || {}),
    // Question headings for the Google Sheet (used only when the script creates a brand-new tab)
    dynamic: !!currentSurvey.dynamicColumns,
    question_ids: currentSurvey.questions.filter(q => q.column).map(q => q.id),
    column_headings: Object.fromEntries(currentSurvey.questions.filter(q => q.column).map(q => [q.id, q.column])),
  };
  const btn = document.getElementById('submit-btn');
  btn.disabled = true; btn.textContent = 'सादर होत आहे...';
  try {
    await fetch(SUBMIT_URL, { method:'POST', mode:'no-cors', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });

    // Verify the record actually landed in the sheet
    btn.textContent = MR() ? 'तपासत आहे...' : 'तपासत आहे... / Verifying...';
    let verified = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      await new Promise(r => setTimeout(r, 2000));
      try {
        const check = await fetch(SUBMIT_URL + '?udise=' + encodeURIComponent(udise) + '&tab=' + encodeURIComponent(currentSurvey.sheet_tab));
        const result = await check.json();
        if (result.submitted) { verified = true; break; }
      } catch(_) { /* retry */ }
    }

    if (!verified) throw new Error('नोंद सापडली नाही / Record not confirmed in sheet after submission.');

    document.getElementById('app').innerHTML = `
      <div class="card">
        <div class="success-screen">
          <div class="success-icon">✅</div>
          <h2>धन्यवाद!</h2>
          <p>तुमचा प्रतिसाद यशस्वीरित्या नोंदवला गेला.${MR() ? '' : '<br/>Thank you — your response has been recorded.'}</p>
          <p class="success-school">${school.name}<br/><small>${MR() ? 'क्रमांक' : 'UDISE'}: ${school.udise}</small></p>
        </div>
      </div>`;
  } catch (err) {
    alert('सादर करताना त्रुटी आली — तुमचा डेटा सेव्ह झाला नाही. इंटरनेट तपासा आणि पुन्हा प्रयत्न करा.' + (MR() ? '' : '\nSubmission failed — your data was NOT saved. Check your internet and try again.'));
    btn.disabled = false; btn.textContent = 'सादर करा (Submit)';
  }
}

// ── Image compression ─────────────────────────────────────────
function compressImage(file, maxWidth = 1024, quality = 0.72) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ── Lightbox ──────────────────────────────────────────────────
function openLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').classList.add('open');
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lightbox-img').src = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

// ── Start ─────────────────────────────────────────────────────
initApp();

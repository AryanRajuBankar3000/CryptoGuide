"use client";

import { useEffect, useRef } from "react";

const htmlContent = `
<main class="app-shell">
  <div class="ambient-bubbles" aria-hidden="true">
    <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
  </div>
  <div class="cursor-tail" aria-hidden="true"></div>
  <aside class="sidebar" aria-label="Main navigation">
    <div class="brand"><span class="brand-mark">C</span><span>CryptoGuide</span></div>
    <p class="brand-caption">Automotive cryptography advisor</p>
    <nav class="nav-list">
      <button class="nav-item active" data-view="dashboard">Overview</button>
      <button class="nav-item" data-view="workspace">Recommendation workspace</button>
      <button class="nav-item" data-view="summary">Multi-use-case summary</button>
      <button class="nav-item" data-view="knowledge">Knowledge base</button>
      <button class="nav-item" data-view="settings">Settings</button>
    </nav>
    <div class="sidebar-footer"><span class="status-dot"></span> Knowledge base reviewed: Aug 2026</div>
  </aside>

  <section class="content">
    <header class="topbar">
      <div><p class="eyebrow">CRYPTOGUIDE / ENGINEERING WORKSPACE</p><h1 id="page-title">Security overview</h1></div>
      <button class="outline-button" id="start-button">New recommendation</button>
    </header>

    <section class="view active" id="dashboard-view">
      <div class="hero-card">
        <div><p class="eyebrow blue">CONTEXT-AWARE RECOMMENDATIONS</p><h2>Choose cryptography with confidence.</h2><p>Evaluate algorithms for automotive systems using lifetime, hardware, threat level, regulation, and post-quantum readiness.</p><button class="primary-button go-workspace">Start a recommendation</button></div>
        <div class="hero-badge" aria-hidden="true"><span>128</span><small>bit minimum<br>security target</small></div>
      </div>
      <div class="metric-grid">
        <article class="metric-card"><span>8</span><p>Supported use-case categories</p></article>
        <article class="metric-card"><span>15–20</span><p>Year vehicle-lifetime planning</p></article>
        <article class="metric-card"><span>PQC</span><p>Migration path included</p></article>
      </div>
      <section class="section-heading"><div><p class="eyebrow">QUICK START</p><h2>What are you securing?</h2></div></section>
      <div class="quick-grid" id="quick-start"></div>
    </section>

    <section class="view" id="workspace-view">
      <div class="workspace-grid">
        <form class="panel input-panel" id="recommendation-form">
          <div class="panel-heading"><div><p class="eyebrow">PROJECT CONTEXT</p><h2>Tell us about the system</h2></div><span class="step">1 / 2</span></div>
          <label for="profile">Project profile <span class="help" data-tip="Pre-fills common automotive constraints. You can edit any value afterwards.">i</span></label><select id="profile"><option value="custom">Custom project</option><option value="body">Body ECU</option><option value="gateway">Gateway ECU</option><option value="v2x">V2X unit</option><option value="infotainment">Infotainment system</option></select>
          <label>Use cases <span class="required">*</span></label>
          <div class="use-case-grid" id="use-case-options"></div>
          <div class="form-row"><div><label for="lifetime">Vehicle lifetime</label><select id="lifetime"><option value="5">Up to 5 years</option><option value="10">6–10 years</option><option value="15" selected>11–15 years</option><option value="20">16–20 years</option></select></div><div><label for="threat">Threat level</label><select id="threat"><option value="standard">Standard</option><option value="high" selected>High</option><option value="critical">Safety-critical</option></select></div></div>
          <div class="form-row"><div><label for="hardware">Target hardware</label><select id="hardware"><option value="constrained">Constrained ECU</option><option value="standard" selected>Standard ECU</option><option value="hsm">ECU with HSM</option></select></div><div><label for="pqc">Post-quantum readiness</label><select id="pqc"><option value="none">Not required</option><option value="plan" selected>Plan migration</option><option value="adopt">Adopt where feasible</option></select></div></div>
          <label for="regulation">Regulatory scope</label><select id="regulation"><option>ISO/SAE 21434</option><option>UNECE R155 / R156</option><option>Global / internal policy</option></select>
          <label for="note">Additional context <span class="muted">(optional)</span></label><textarea id="note" rows="3" placeholder="For example: OTA package is verified by a constrained body-control ECU."></textarea>
          <button class="primary-button full" type="submit">Generate recommendation</button>
        </form>

        <div class="right-column">
          <section class="panel chat-panel"><div class="panel-heading"><div><p class="eyebrow">CRYPTOGUIDE ASSISTANT</p><h2>Ask in plain language</h2></div><span class="online">● Online</span></div><div class="messages" id="messages"><div class="message bot">Hello. Tell me what you are protecting, or use the project context form. I will explain the recommendation in plain English.</div></div><div class="starter-prompts"><button type="button">Recommend crypto for OTA signing</button><button type="button">Check SecOC for CAN</button><button type="button">Create PQC migration plan</button></div><form class="chat-input" id="chat-form"><input id="chat-text" aria-label="Ask CryptoGuide" placeholder="Ask about OTA signing, SecOC, V2X…"><button class="primary-button" type="submit">Send</button></form></section>
          <section class="panel result-panel" id="result-panel"><div class="empty-result"><span class="shield">⌁</span><h2>Your recommendation will appear here</h2><p>Select one or more use cases, then generate a recommendation.</p></div></section>
        </div>
      </div>
    </section>

    <section class="view" id="summary-view"><div class="section-heading"><div><p class="eyebrow">PROJECT PORTFOLIO</p><h2>Multi-use-case summary</h2><p class="subtext">Generate a recommendation first to view your project-level priorities.</p></div><button class="outline-button go-workspace">Edit project context</button></div><div id="summary-content" class="summary-content empty-summary">No project analysis yet.</div></section>

    <section class="view" id="knowledge-view"><div class="section-heading"><div><p class="eyebrow">TRANSPARENT DECISIONS</p><h2>Cryptographic knowledge base</h2><p class="subtext">Reference information used by the recommendation engine.</p></div></div><div class="table-wrap"><table><thead><tr><th>Algorithm</th><th>Primary use</th><th>Security status</th><th>Post-quantum</th><th>Reference</th></tr></thead><tbody id="knowledge-rows"></tbody></table></div></section>
    
    <section class="view" id="settings-view"><div class="section-heading"><div><p class="eyebrow">ACCESSIBILITY & APPEARANCE</p><h2>Settings</h2><p class="subtext">Control decorative visual effects without changing the recommendation engine.</p></div></div><section class="panel settings-panel"><label class="toggle-row"><span><strong>Floating background bubbles</strong><small>Show animated blue bubbles behind the interface.</small></span><input id="bubble-toggle" type="checkbox" checked></label><label class="toggle-row"><span><strong>Cursor tail</strong><small>Show the white particle trail when your cursor moves.</small></span><input id="cursor-toggle" type="checkbox" checked></label><label class="toggle-row"><span><strong>Reduce all motion</strong><small>Disable background and cursor animations.</small></span><input id="motion-toggle" type="checkbox"></label></section></section>
  </section>
</main>
`;

export default function Home() {
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    const root = containerRef.current;
    const $ = s => root.querySelector(s);
    const $$ = s => [...root.querySelectorAll(s)];
    
    const useCases = [
      {id:'secure_boot', backendKey: 'SecureBoot', name:'Secure Boot',desc:'Verify ECU firmware before execution',algorithm:'ECDSA P-256 with SHA-256',pqc:'ML-DSA-65 migration target',reference:'NIST FIPS 186-5 · FIPS 204',risk:'Protect the root public key and enforce anti-rollback counters.',critical:3},
      {id:'ota', backendKey: 'Signatures', name:'OTA Updates',desc:'Authenticate software update packages',algorithm:'ECDSA P-256 with SHA-256',pqc:'Hybrid ECDSA P-256 + ML-DSA-65',reference:'NIST FIPS 186-5 · FIPS 204 · UNECE R156',risk:'Signing keys must be in an HSM; prevent downgrade/rollback attacks.',critical:3},
      {id:'v2x', backendKey: 'Communication', name:'V2X Communication',desc:'Protect vehicle-to-everything messages',algorithm:'ECDSA P-256 + AES-128-GCM',pqc:'Evaluate hybrid certificate and ML-KEM support',reference:'NIST FIPS 186-5 · SP 800-38D · FIPS 203',risk:'Monitor certificate lifecycle, latency, and bandwidth constraints.',critical:3},
      {id:'secoc', backendKey: 'MAC_SecOC', name:'MAC / SecOC',desc:'Authenticate in-vehicle network messages',algorithm:'AES-CMAC-128',pqc:'AES-256 is a long-term symmetric option',reference:'NIST SP 800-38B',risk:'Use freshness values and protect keys from ECU extraction.',critical:2},
      {id:'encryption', backendKey: 'DataEncryption', name:'Data Encryption',desc:'Protect stored or transmitted data',algorithm:'AES-256-GCM',pqc:'Already strong margin; retain crypto agility',reference:'NIST FIPS 197 · SP 800-38D',risk:'Never reuse a nonce with the same AES-GCM key.',critical:2},
      {id:'key_exchange', backendKey: 'KeyExchange', name:'Key Exchange',desc:'Establish shared secrets',algorithm:'ECDH P-256 + HKDF-SHA-256',pqc:'Hybrid ECDH P-256 + ML-KEM-768',reference:'NIST SP 800-56A · FIPS 203',risk:'Classical ECDH is vulnerable to future cryptographically relevant quantum computers.',critical:3},
      {id:'integrity', backendKey: 'Integrity', name:'Integrity / Hashing',desc:'Detect unauthorized data changes',algorithm:'SHA-256',pqc:'SHA-384/512 provides higher quantum margin',reference:'NIST FIPS 180-4',risk:'A hash alone does not authenticate the sender.',critical:1},
      {id:'rng', backendKey: 'RNG', name:'Random Number Generation',desc:'Generate cryptographic random values',algorithm:'HMAC_DRBG with approved entropy source',pqc:'No public-key migration required',reference:'NIST SP 800-90A · SP 800-90B',risk:'Validate entropy-source health tests and reseeding.',critical:2}
    ];
    
    const knowledge = [
      ['AES-256-GCM','Authenticated encryption','Recommended','Strong symmetric margin','NIST FIPS 197 / SP 800-38D','recommended'],
      ['AES-CMAC-128','Message authentication / SecOC','Recommended','Strong symmetric margin','NIST SP 800-38B','recommended'],
      ['ECDSA P-256 + SHA-256','Secure Boot / signing','Recommended today','Migration needed','NIST FIPS 186-5','recommended'],
      ['ECDH P-256','Classical key establishment','Recommended today','Migration needed','NIST SP 800-56A','planning'],
      ['ML-KEM-768','Post-quantum key establishment','PQC standard','Quantum-resistant','NIST FIPS 203','recommended'],
      ['ML-DSA-65','Post-quantum signing','PQC standard','Quantum-resistant','NIST FIPS 204','recommended'],
      ['SHA-1','Legacy integrity','Do not use','Not suitable','NIST SP 800-131A','legacy']
    ];
    
    let selected = new Set(['ota']); 
    let lastResults = [];
    
    function renderUseCases(){
      $('#quick-start').innerHTML = useCases.map(u=>`<button class="quick-card" data-select="${u.id}"><strong>${u.name}</strong><span>${u.desc}</span></button>`).join('');
      $('#use-case-options').innerHTML = useCases.map(u=>`<button type="button" class="use-option ${selected.has(u.id)?'selected':''}" data-toggle="${u.id}">${u.name}</button>`).join('');
      
      $$('[data-select]').forEach(b=>b.onclick=()=>{
        selected=new Set([b.dataset.select]);
        renderUseCases();
        showView('workspace');
      });
      $$('[data-toggle]').forEach(b=>b.onclick=()=>{
        selected.has(b.dataset.toggle)?selected.delete(b.dataset.toggle):selected.add(b.dataset.toggle);
        renderUseCases();
      });
    }
    
    function showView(name){
      $$('.view').forEach(v=>v.classList.toggle('active',v.id===name+'-view'));
      $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===name));
      const titles = {dashboard:'Security overview',workspace:'Recommendation workspace',summary:'Multi-use-case summary',knowledge:'Knowledge base',settings:'Settings'};
      $('#page-title').textContent=titles[name];
      window.scrollTo({top:0,behavior:'smooth'});
    }
    
    $$('.nav-item').forEach(n=>n.onclick=()=>showView(n.dataset.view));
    $$('.go-workspace').forEach(b=>b.onclick=()=>showView('workspace'));
    $('#start-button').onclick=()=>showView('workspace');
    
    const profiles={
      body:{uses:['secure_boot','secoc'],life:'15',threat:'high',hardware:'constrained',pqc:'plan',regulation:'ISO/SAE 21434'},
      gateway:{uses:['secure_boot','ota','secoc','key_exchange'],life:'15',threat:'critical',hardware:'hsm',pqc:'plan',regulation:'UNECE R155 / R156'},
      v2x:{uses:['v2x','key_exchange'],life:'10',threat:'critical',hardware:'hsm',pqc:'adopt',regulation:'UNECE R155 / R156'},
      infotainment:{uses:['ota','encryption','rng'],life:'10',threat:'high',hardware:'standard',pqc:'plan',regulation:'ISO/SAE 21434'}
    };
    
    $('#profile').onchange=event=>{
      const profile=profiles[event.target.value];
      if(!profile)return;
      selected=new Set(profile.uses);
      $('#lifetime').value=profile.life;
      $('#threat').value=profile.threat;
      $('#hardware').value=profile.hardware;
      $('#pqc').value=profile.pqc;
      $('#regulation').value=profile.regulation;
      renderUseCases();
      addBot(`${event.target.options[event.target.selectedIndex].text} profile applied. You can still adjust the fields.`);
    };
    
    async function buildResults(){
      if(!selected.size){alert('Please select at least one use case.');return}
      $('#result-panel').innerHTML='<div class="loading-result"><div class="loader"></div><strong>Analysing project context…</strong><span>Checking lifetime, hardware, risk, and PQC readiness via engine.</span></div>';
      
      const life = parseInt($('#lifetime').value);
      const pqc = $('#pqc').value;
      const hardware = $('#hardware').value;
      
      const threatMap = { 'standard': 'Medium', 'high': 'High', 'critical': 'Critical' };
      const threatLevel = threatMap[$('#threat').value];
      const pqcRequired = pqc !== 'none';
      
      const queries = Array.from(selected).map(id => {
        const uc = useCases.find(u => u.id === id);
        return {
          useCaseKey: uc.backendKey,
          vehicleLifetimeYears: life,
          threatLevel: threatLevel,
          pqcRequired: pqcRequired
        };
      });

      try {
        const payload = queries.length === 1 ? queries[0] : { queries };
        const res = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        const individual = data.individual || [data];
        lastResults = individual.map((result, i) => {
          const original = useCases.find(u => result.useCase.includes(u.name) || u.backendKey === queries[i].useCaseKey) || useCases[0];
          return {
            ...original,
            algorithm: result.algorithm,
            risk: result.reason || result.riskFlags?.join(', '),
            pqc: result.migrationPath || original.pqc,
            reference: result.standards?.join(' · ') || original.reference,
            critical: result.risk === '🔴' ? 3 : result.risk === '🟡' ? 2 : 1,
            life, pqc, hardware
          };
        });

        renderRecommendation(lastResults[0]);
        renderSummary(data.combinedSummary);
        
        addBot(`I analysed ${lastResults.length} use case${lastResults.length>1?'s':''}. The highest-priority selection is ${lastResults[0].name}: ${lastResults[0].algorithm}.`);

      } catch (err) {
        $('#result-panel').innerHTML='<div class="empty-result"><span class="shield">❌</span><h2>Connection Error</h2><p>Failed to reach the recommendation engine.</p></div>';
      }
    }
    
    function renderRecommendation(primary) {
      if (!primary) return;
      const hardware=$('#hardware').value;
      const pqc=$('#pqc').value;
      const life=+$('#lifetime').value;
      
      const pqNote = pqc==='adopt' ? primary.pqc : pqc==='plan' && life>=15 ? primary.pqc : 'Review post-quantum readiness at the next platform refresh.'; 
      const confidence = selected.size && $('#regulation').value && $('#hardware').value ? 'High' : 'Needs review';
      const hardwareText = hardware==='constrained' ? 'Minimise signature size and RAM; use an accelerator if available.' : hardware==='hsm' ? 'Store signing and shared-secret keys in the HSM.' : 'Validate flash, RAM, and crypto-library support on the ECU.';
      
      $('#result-panel').innerHTML=`<div class="result-header"><div><p class="eyebrow">PRIMARY RECOMMENDATION</p><h2>${primary.name}</h2><div class="confidence">Recommendation confidence <b>${confidence}</b></div></div><span class="tag ${primary.critical===3?'amber':'green'}">${primary.critical===3?'High priority':'Recommended'}</span></div><div class="result-grid"><div><h3>Recommended algorithm</h3><p class="recommendation-name">${primary.algorithm}</p><h3>Why this fits</h3><p>Selected for a ${life}-year vehicle context${hardware==='constrained'?', with constrained-ECU awareness':''}. It provides an appropriate current security baseline for this use case.</p></div><div><h3>Risk flags</h3><ul><li>${primary.risk}</li>${life>=15?'<li>Long lifetime: maintain a crypto-agility and PQC migration plan.</li>':''}</ul><h3 style="margin-top:14px">Migration path</h3><p>${pqNote}</p><p class="reference">${primary.reference}</p></div></div><div class="hardware-impact"><h3>Hardware impact <span class="help" data-tip="This is a planning indicator, not a measured benchmark for a particular ECU.">i</span></h3><div class="impact-list"><span><b>Flash / storage</b>${primary.algorithm.includes('ML-')?'Higher for PQC':'Low to moderate'}</span><span><b>Runtime cost</b>${hardware==='constrained'?'Review carefully':'Suitable for selected ECU'}</span><span><b>Key protection</b>${hardwareText}</span></div></div><div class="migration-timeline"><h3>Security lifecycle</h3><div class="timeline"><div class="timeline-step"><i></i><b>Now</b>Deploy ${primary.algorithm}</div><div class="timeline-step"><i></i><b>Platform review</b>Reassess at 5 years</div><div class="timeline-step"><i></i><b>PQC target</b>${pqc==='none'?'Maintain crypto agility':primary.pqc}</div></div></div><div class="comparison-panel" id="comparison-panel"><h3>Algorithm comparison</h3><div class="comparison-grid"><div class="compare-card"><strong>${primary.algorithm}</strong>Current recommendation<br>Compatibility: high</div><div class="compare-card"><strong>Hybrid migration</strong>${primary.pqc}<br>Compatibility: assess</div><div class="compare-card"><strong>Legacy alternative</strong>Not recommended for new long-life designs<br>Risk: higher</div></div></div><div class="result-actions"><button class="outline-button" id="compare-button">Compare options</button><button class="primary-button" id="export-button">Export Markdown report</button></div>`;
      
      $('#compare-button').onclick=()=>$('#comparison-panel').classList.toggle('visible');
      $('#export-button').onclick=exportReport;
    }
    
    function renderSummary(summaryData) {
      if(!lastResults.length) return;
      const critical=[...lastResults].sort((a,b)=>b.critical-a.critical)[0];
      
      $('#summary-content').className='summary-content';
      $('#summary-content').innerHTML=`<article class="priority-card critical"><p class="eyebrow">MOST SECURITY-CRITICAL SELECTION</p><h3>${critical.name}: ${critical.algorithm}</h3><p>${critical.risk}</p></article>${lastResults.map((u,i)=>`<article class="priority-card"><p class="eyebrow">PRIORITY ${i+1}</p><h3>${u.name}</h3><p><strong>${u.algorithm}</strong><br>${u.pqc}</p></article>`).join('')}`;
    }
    
    function exportReport(){
      const lines=['# CryptoGuide Recommendation Report','',`Generated: ${new Date().toLocaleString()}`,'',...lastResults.flatMap((item,index)=>[`## ${index+1}. ${item.name}`,`- Recommended algorithm: ${item.algorithm}`,`- Risk flag: ${item.risk}`,`- PQC path: ${item.pqc}`,`- Standard reference: ${item.reference}`,''])];
      const blob=new Blob([lines.join('\\n')],{type:'text/markdown'});
      const link=document.createElement('a');
      link.href=URL.createObjectURL(blob);
      link.download='cryptoguide-recommendation.md';
      link.click();
      URL.revokeObjectURL(link.href);
    }
    
    $('#recommendation-form').onsubmit = e => {
      e.preventDefault();
      buildResults();
    };
    
    function addBot(text) {
      $('#messages').insertAdjacentHTML('beforeend', `<div class="message bot">${text}</div>`);
      $('#messages').scrollTop = $('#messages').scrollHeight;
    }
    
    $('#chat-form').onsubmit = async e => {
      e.preventDefault();
      const input = $('#chat-text'), text = input.value.trim();
      if(!text) return;
      
      $('#messages').insertAdjacentHTML('beforeend', `<div class="message user">${text}</div>`);
      input.value = '';
      
      try {
        const res = await fetch('/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ naturalQuery: text })
        });
        const data = await res.json();
        
        let answer = "";
        if (data.useCase) {
           answer = `Based on your scenario: I identified **${data.useCase}**. I recommend **${data.algorithm}**. Risk assessment: ${data.reason}.`;
           
           // Optionally select this usecase in the UI
           const matchedUC = useCases.find(u => data.useCase.includes(u.name)) || useCases[0];
           if (matchedUC) {
             selected = new Set([matchedUC.id]);
             renderUseCases();
           }
        } else if (data.nlpExtraction) {
           answer = `I identified multiple use cases: ${data.nlpExtraction.detectedUseCases?.join(', ')}. Go to the Multi-use-case summary tab to see the batch analysis.`;
        } else {
           answer = "I couldn't confidently parse a use case from that. Try specifying 'OTA', 'SecOC', or 'V2X'.";
        }
        
        setTimeout(() => addBot(answer), 250);
      } catch (err) {
        setTimeout(() => addBot('Sorry, the engine is currently unavailable.'), 250);
      }
    };
    
    $$('.starter-prompts button').forEach(button=>button.onclick=()=>{ 
      $('#chat-text').value=button.textContent; 
      $('#chat-form').requestSubmit(); 
    });
    
    $('#bubble-toggle').onchange=e=>root.classList.toggle('no-bubbles',!e.target.checked);
    $('#cursor-toggle').onchange=e=>root.classList.toggle('no-cursor',!e.target.checked);
    $('#motion-toggle').onchange=e=>root.classList.toggle('reduced-motion',e.target.checked);
    
    $('#knowledge-rows').innerHTML=knowledge.map(k=>`<tr><td>${k[0]}</td><td>${k[1]}</td><td><span class="status ${k[5]}">${k[2]}</span></td><td>${k[3]}</td><td><a class="link" href="https://csrc.nist.gov" target="_blank" rel="noreferrer">${k[4]}</a></td></tr>`).join('');
    
    renderUseCases();

    const tailContainer = $('.cursor-tail');
    const tailDots = Array.from({length:18}, (_, index) => {
      const dot = document.createElement('span');
      const size = Math.max(2, 10 - index * .42);
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.opacity = String(.9 - index * .045);
      tailContainer.appendChild(dot);
      return {dot, x:-40, y:-40};
    });
    
    let cursorX = -40, cursorY = -40;
    const updateCursor = event => { cursorX = event.clientX; cursorY = event.clientY; };
    window.addEventListener('pointermove', updateCursor);
    
    let animationId;
    function animateCursorTail(){
      let followX = cursorX, followY = cursorY;
      tailDots.forEach((tail, index) => {
        const speed = index === 0 ? .42 : .28;
        tail.x += (followX - tail.x) * speed;
        tail.y += (followY - tail.y) * speed;
        tail.dot.style.transform = `translate3d(${tail.x}px, ${tail.y}px, 0) translate(-50%, -50%)`;
        followX = tail.x;
        followY = tail.y;
      });
      animationId = requestAnimationFrame(animateCursorTail);
    }
    animateCursorTail();

    // Cleanup listeners
    return () => {
      window.removeEventListener('pointermove', updateCursor);
      cancelAnimationFrame(animationId);
    };

  }, []);

  return (
    <div ref={containerRef} dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}

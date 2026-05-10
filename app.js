// ── Student Dashboard ──
function renderStudent(){
  const q=STATE.studentSearch||'';
  let found=null;
  if(q) found=STATE.students.find(s=>s.route.toLowerCase().includes(q.toLowerCase())||s.busId.toLowerCase().includes(q.toLowerCase())||s.name.toLowerCase().includes(q.toLowerCase()));
  const featured=found||STATE.students[0];
  const bus=getBus(featured.busId);

  window._stuSearch=v=>{STATE.studentSearch=v;render();};

  return `
  <div class="section-title">🎓 Student — Smart Bus Finder</div>

  <div class="card mb16">
    <div class="search-wrap">
      <span class="search-icon">🔍</span>
      <input id="stuSearch" type="text" placeholder="Search by route, bus number or name..." value="${q}" oninput="window._stuSearch(this.value)"/>
    </div>
    <div class="xs text-m mt8">Try: Route 3, RJ14-07, Arjun, Priya, Chopasni</div>
  </div>

  ${bus?`
  <div class="g2 mb16">
    <div class="card green">
      <div class="card-title">📍 My Assigned Bus</div>
      <div class="stat-num orb" style="font-size:26px;color:var(--blue)">${bus.id}</div>
      <div class="small text-m mb12">${bus.routeName} — ${bus.route}</div>
      <div class="info-row"><span class="info-label">Current Stand</span><span class="badge b-green glow-a">${bus.stand}</span></div>
      <div class="info-row"><span class="info-label">Status</span>${statusBadge(bus.status)}</div>
      <div class="info-row"><span class="info-label">Driver</span><span class="info-val">${bus.driver}</span></div>
      <div class="info-row"><span class="info-label">Departure</span>${countdownHTML(bus)}</div>
      <div class="info-row"><span class="info-label">Speed</span><span class="orb" style="color:var(--green)">${bus.speed} km/h</span></div>
      <div class="info-row"><span class="info-label">Passengers</span><span>${bus.pax}/${bus.cap}</span></div>
    </div>
    <div class="card">
      <div class="card-title">👤 My Info — ${featured.name}</div>
      <div class="mb12">${statusBadge(featured.status)}</div>
      ${featured.boardTime?`<div class="info-row"><span class="info-label">✅ Boarded</span><span class="text-g bold">${featured.boardTime}</span></div>`:''}
      <div class="info-row"><span class="info-label">Stop</span><span>${featured.stop}</span></div>
      <div class="info-row"><span class="info-label">Guardian</span><span>${featured.parent}</span></div>
      <div class="info-row"><span class="info-label">Contact</span><span class="text-m small">${featured.parentPhone}</span></div>
      <div class="mt16">
        <button class="btn btn-green w100" onclick="window._stuBoard&&window._stuBoard()">📱 Scan QR — Board Bus</button>
      </div>
      <div class="mt8">
        <button class="btn btn-muted w100 btn-sm" onclick="toast('Notification','Stand update alerts enabled for ${bus.id}','blue')">🔔 Enable Alerts</button>
      </div>
    </div>
  </div>

  <div class="card mb16">
    <div class="section-title">🗺 Campus Stand Map — Find Stand <span class="badge b-green">${bus.stand}</span></div>
    <div class="campus-map">${renderMap(bus.stand,true,false)}</div>
    <div class="mt8 text-c small text-m">🟢 Highlighted = <strong class="text-g">${bus.stand}</strong> — your assigned stand</div>
  </div>

  <div class="card">
    <div class="section-title">📋 All Active Buses</div>
    <div class="tw">
      <table>
        <thead><tr><th>Bus</th><th>Route</th><th>Stand</th><th>Status</th><th>Departs</th><th>Speed</th></tr></thead>
        <tbody>${STATE.buses.map(b=>`<tr ${b.id===bus.id?'style="background:rgba(0,255,136,0.04)"':''}>
          <td class="orb text-blue bold">${b.id} ${b.id===bus.id?'⭐':''}</td>
          <td>${b.routeName}</td>
          <td><span class="badge b-blue">${b.stand}</span></td>
          <td>${statusBadge(b.status)}</td>
          <td>${countdownHTML(b)}</td>
          <td class="orb small" style="color:var(--green)">${b.speed} km/h</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>
  </div>`:''}`;

  window._stuBoard=()=>{
    if(featured.status==='Boarded'){toast('Already Boarded','You are marked as boarded','orange');return;}
    featured.status='Boarded';featured.boardTime=fmtTime();
    STATE.scanLog.push({time:fmtTime(),type:'board',text:`${featured.name} boarded ${featured.busId} at Stand ${featured.stand} — Stop: ${featured.stop}`});
    toast('✅ Boarding Confirmed',`${featured.name} boarded ${featured.busId}`,'green');
    toast('👨‍👩‍👦 Parent Alert',`${featured.parent} notified: child boarded at ${featured.boardTime}`,'blue');
    render();
  };
}

// ── Driver Dashboard ──
function renderDriver(){
  const ds=STATE.driverState;
  const bus=getBus(ds.busId)||STATE.buses[0];

  window._drvBus=v=>{ds.busId=v;const b=getBus(v);if(b){ds.selectedStand=b.stand;ds.busStatus=b.status;ds.passengerCount=b.pax;}render();};
  window._drvTrip=()=>{
    ds.tripActive=!ds.tripActive;bus.status=ds.tripActive?'Boarding':'Parked';bus.tripActive=ds.tripActive;
    toast(ds.tripActive?'Trip Started':'Trip Ended',`Bus ${bus.id} — ${bus.status}`,ds.tripActive?'green':'blue');render();
  };
  window._drvStand=v=>{ds.selectedStand=v;moveBusToStand(ds.busId,v);render();};
  window._drvStatus=v=>{ds.busStatus=v;bus.status=v;bus.tripActive=(v!=='Parked');notify();render();};
  window._drvPax=(d)=>{ds.passengerCount=Math.max(0,Math.min(bus.cap,ds.passengerCount+d));bus.pax=ds.passengerCount;render();};
  window._drvScan=()=>{
    const pending=STATE.students.filter(s=>s.busId===ds.busId&&s.status==='Pending');
    if(!pending.length){toast('All Boarded','No pending students','green');return;}
    const s=pending[Math.floor(Math.random()*pending.length)];
    s.status='Boarded';s.boardTime=fmtTime();bus.pax=Math.min(bus.pax+1,bus.cap);ds.passengerCount=bus.pax;
    STATE.scanLog.push({time:fmtTime(),type:'board',text:`${s.name} boarded ${bus.id} at Stand ${bus.stand}`});
    toast('📱 QR Scanned',`${s.name} verified — ${s.id}`,'green');render();
  };
  window._drvSOS=()=>{triggerSOS(ds.busId);render();};
  window._drvBreak=()=>{bus.breakdown=!bus.breakdown;bus.status=bus.breakdown?'Breakdown':'Parked';bus.tripActive=false;
    addAlert(`🔧 Breakdown reported: Bus ${bus.id} at Stand ${bus.stand}`,'red');
    toast(bus.breakdown?'🔧 Breakdown Reported':'✅ Bus Restored',`Bus ${bus.id}`,'orange');render();
  };

  const pct=Math.round(bus.pax/bus.cap*100);
  return `
  <div class="flex justify-b items-c mb16 flex-wrap gap8">
    <div class="section-title mb4">🚌 Driver Command Panel</div>
    <div class="flex gap8 items-c flex-wrap">
      <select style="font-size:12px;padding:6px 10px;width:auto" onchange="window._drvBus(this.value)">
        ${STATE.buses.map(b=>`<option value="${b.id}" ${b.id===ds.busId?'selected':''}>${b.id} — ${b.routeName}</option>`).join('')}
      </select>
    </div>
  </div>

  <div class="g3 mb16">
    <div class="card" style="grid-column:span 2">
      <div class="g2">
        <div>
          <div class="card-title mb8">Trip Control</div>
          <button class="btn ${ds.tripActive?'btn-red':'btn-green'} btn-lg" onclick="window._drvTrip()">
            ${ds.tripActive?'⏹ End Trip':'▶ Start Trip'}
          </button>
          <div class="xs text-m text-c mt8">Status: <strong class="${ds.tripActive?'text-g':'text-m'}">${ds.tripActive?'ACTIVE':'INACTIVE'}</strong></div>
          <hr class="gl">
          <div class="mb8"><label>Parking Stand</label>
            <select onchange="window._drvStand(this.value)">
              ${STANDS.map(s=>`<option value="${s}" ${s===ds.selectedStand?'selected':''}>${s}</option>`).join('')}
            </select>
          </div>
          <div><label>Bus Status</label>
            <select onchange="window._drvStatus(this.value)">
              ${['Parked','Boarding','Departing','En Route','Breakdown'].map(s=>`<option ${s===ds.busStatus?'selected':''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>
        <div>
          <div class="card-title mb8">Live GPS</div>
          ${gpsPanel(bus)}
          <div class="mt12">
            <div class="card-title mb4">Speed</div>
            <div class="speed-display">${bus.speed}<span style="font-size:14px;color:var(--muted)"> km/h</span></div>
          </div>
        </div>
      </div>
    </div>
    <div class="card text-c flex flex-col items-c justify-c gap12">
      <div class="card-title">Passengers</div>
      <div class="pax-ctrl flex-col items-c">
        <div class="pax-num">${ds.passengerCount}</div>
        <div class="xs text-m">of ${bus.cap} capacity</div>
        <div class="flex gap8 mt8">
          <button class="pax-btn" onclick="window._drvPax(-1)">−</button>
          <button class="pax-btn" onclick="window._drvPax(1)">+</button>
        </div>
      </div>
      <div class="progress w100"><div class="progress-fill" style="width:${pct}%;background:${pct>90?'var(--red)':pct>70?'var(--orange)':'var(--blue)'}"></div></div>
      <div class="xs text-m">${pct}% capacity</div>
    </div>
  </div>

  <div class="g2 mb16">
    <div class="card">
      <div class="card-title mb12">Quick Actions</div>
      <button class="qr-btn mb12" onclick="window._drvScan()"><span style="font-size:28px">📱</span>Scan Student QR Code</button>
      <button class="btn btn-orange w100 mb8" onclick="window._drvBreak()">🔧 ${bus.breakdown?'Clear Breakdown':'Report Breakdown'}</button>
    </div>
    <div class="card">
      <div class="card-title mb8">Emergency</div>
      <button class="btn btn-sos btn-lg mb12" onclick="window._drvSOS()">🚨 SOS EMERGENCY</button>
      <div class="xs text-m text-c">Triggers immediate alert to Admin & Security</div>
      <hr class="gl">
      <div class="info-row"><span class="info-label">Bus</span><span class="orb text-blue bold">${bus.id}</span></div>
      <div class="info-row"><span class="info-label">Stand</span><span class="badge b-blue">${bus.stand}</span></div>
      <div class="info-row"><span class="info-label">Route</span><span>${bus.routeName}</span></div>
    </div>
  </div>

  <div class="card">
    <div class="section-title">👥 My Passengers</div>
    <div class="tw">
      <table>
        <thead><tr><th>Name</th><th>ID</th><th>Stop</th><th>Stand</th><th>Status</th><th>Time</th><th>Action</th></tr></thead>
        <tbody>${STATE.students.filter(s=>s.busId===ds.busId).map(s=>`
          <tr><td>${s.name}</td><td class="text-m xxs">${s.id}</td><td class="small">${s.stop}</td>
          <td><span class="badge b-blue">${s.stand}</span></td>
          <td>${statusBadge(s.status)}</td>
          <td class="text-g small">${s.boardTime||'—'}</td>
          <td><button class="btn btn-xs btn-green" onclick="(()=>{const st=STATE.students.find(x=>x.id==='${s.id}');if(st&&st.status!=='Boarded'){st.status='Boarded';st.boardTime=fmtTime();STATE.scanLog.push({time:fmtTime(),type:'board',text:'${s.name} manually boarded ${bus.id}'});render();}})()">✓ Board</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`;
}

// ── Admin Dashboard ──
function renderAdmin(){
  const total=STATE.buses.length;
  const active=STATE.buses.filter(b=>['En Route','Boarding','Departing'].includes(b.status)).length;
  const occupied=Object.values(STATE.standBuses).filter(v=>v.length>0).length;
  const delayed=STATE.buses.filter(b=>b.delay>0||b.breakdown).length;
  const attPct=calcAttPct();
  window._standClick=(s,ev)=>showStandPopup(s,ev);
  return `
  <div class="flex justify-b items-c mb16"><div class="section-title mb4">🛡️ Admin Command Center</div></div>
  <div class="g5 mb16">
    <div class="card"><div class="card-title">Total Fleet</div><div class="card-value">${total}</div></div>
    <div class="card purple"><div class="card-title">Active Trips</div><div class="card-value text-p">${active}</div></div>
    <div class="card green"><div class="card-title">Stands Occupied</div><div class="card-value text-g">${occupied}</div></div>
    <div class="card ${delayed?'red':''}"><div class="card-title">Delayed/Broken</div><div class="card-value ${delayed?'text-r2':'text-m'}">${delayed}</div></div>
    <div class="card orange"><div class="card-title">Attendance</div><div class="card-value text-o">${attPct}%</div></div>
  </div>
  <div class="g2 mb16">
    <div class="card"><div class="section-title">📍 Live Campus Map</div><div class="campus-map">${renderMap(null,true,false)}</div></div>
    <div class="card"><div class="section-title">🅿️ Stand Occupancy</div>${renderStandGrid(true)}</div>
  </div>
  <div class="card mb16">
    <div class="section-title">🚌 Fleet Management</div>
    <div class="tw"><table>
      <thead><tr><th>Bus</th><th>Route</th><th>Driver</th><th>Stand</th><th>Speed</th><th>Status</th><th>Departure</th><th>Reassign</th></tr></thead>
      <tbody>${STATE.buses.map(b=>busRow(b)).join('')}</tbody>
    </table></div>
  </div>
  <div class="g2 mb16">
    <div class="card"><div class="section-title">📊 Fleet Efficiency</div>${barChart(STATE.analytics.efficiency,STATE.analytics.labels,'var(--blue)')}</div>
    <div class="card"><div class="section-title">🎯 Route Attendance</div>${(()=>{const ra=STATE.analytics.routeAtt;const k=Object.keys(ra).slice(0,6);return barChart(k.map(x=>ra[x]),k,'var(--purple)');})()}</div>
  </div>
  <div class="g3 mb16">
    <div class="card flex flex-col items-c gap8">${donutChart(STATE.analytics.cards.etaAccuracy,'var(--blue)','ETA Accuracy')}<div class="small">ETA Accuracy</div></div>
    <div class="card flex flex-col items-c gap8">${donutChart(STATE.analytics.cards.utilization,'var(--purple)','Utilization')}<div class="small">Bus Utilization</div></div>
    <div class="card flex flex-col items-c gap8">${donutChart(STATE.analytics.cards.onTime,'var(--green)','On-Time')}<div class="small">On-Time Rate</div></div>
  </div>
  <div class="g2">
    <div class="card"><div class="section-title">🚨 System Alerts</div>
      <div class="alerts-log">${STATE.adminAlerts.length?STATE.adminAlerts.map(a=>`<div class="alert-item"><div class="alert-time">${a.time}</div><span style="color:${a.type==='red'?'var(--red)':a.type==='orange'?'var(--orange)':'var(--blue)'}">●</span><div class="alert-msg">${a.msg}</div></div>`).join(''):'<div class="text-m small text-c" style="padding:20px">✅ All systems normal</div>'}</div>
    </div>
    <div class="card"><div class="section-title">📝 Live Scan Log</div>
      <div class="alerts-log">${STATE.scanLog.length?STATE.scanLog.slice().reverse().map(e=>`<div class="alert-item"><div class="alert-time">${e.time}</div><span>🟢</span><div class="alert-msg">${e.text}</div></div>`).join(''):'<div class="text-m small text-c" style="padding:20px">No scans yet</div>'}</div>
    </div>
  </div>`;
}

// ── Parent Dashboard ──
function renderParent(){
  const q=STATE.parentSearch||'';
  let found=q?STATE.students.find(s=>s.name.toLowerCase().includes(q.toLowerCase())||s.id.toUpperCase()===q.toUpperCase()):null;
  window._parSearch=v=>{STATE.parentSearch=v;render();};
  return `
  <div class="section-title">👨‍👩‍👦 Parent Dashboard</div>
  <div class="card mb16" style="max-width:500px">
    <div class="search-wrap"><span class="search-icon">🔍</span>
      <input id="parSearch" type="text" placeholder="Enter child name or ID..." value="${q}" oninput="window._parSearch(this.value)"/>
    </div>
    <div class="xxs text-m mt8">Try: Arjun, Priya, Rohit, Kavita</div>
  </div>
  ${found?(()=>{const bus=getBus(found.busId);const ok=found.status==='Boarded'||found.status==='On Board';return `
  <div class="g2 mb16">
    <div class="card green">
      <div class="flex items-c gap12 mb16">
        <div style="width:52px;height:52px;border-radius:50%;background:rgba(0,255,136,0.1);border:2px solid var(--green);display:flex;align-items:center;justify-content:center;font-size:24px">👤</div>
        <div><div class="bold" style="font-size:15px">${found.name}</div><div class="xxs text-m">${found.id}</div><div class="mt4">${statusBadge(found.status)}</div></div>
      </div>
      ${ok?`<div class="badge b-green w100 mb12" style="justify-content:center;padding:10px">✅ Boarded at ${found.boardTime||'—'}</div>`:''}
      <div class="info-row"><span class="info-label">Bus</span><span class="orb text-blue bold">${found.busId}</span></div>
      <div class="info-row"><span class="info-label">Stand</span><span class="badge b-green">${found.stand}</span></div>
      <div class="info-row"><span class="info-label">Stop</span><span>${found.stop}</span></div>
      <div class="info-row"><span class="info-label">Guardian</span><span>${found.parent}</span></div>
    </div>
    <div class="card">${bus?`
      <div class="card-title mb12">🚌 Live Bus</div>
      <div class="info-row"><span class="info-label">Status</span>${statusBadge(bus.status)}</div>
      <div class="info-row"><span class="info-label">Speed</span><span class="orb text-g">${bus.speed} km/h</span></div>
      <div class="info-row"><span class="info-label">Departure</span>${countdownHTML(bus)}</div>
      <div class="info-row"><span class="info-label">GPS</span><span class="xs text-g orb">${bus.lat.toFixed(5)}°N, ${bus.lng.toFixed(5)}°E</span></div>
      <hr class="gl"><div class="card-title mb4">🏠 ETA Home</div>
      <div class="countdown">${bus.status==='En Route'?'~35 min':bus.status==='Departing'?'~48 min':'Awaiting Departure'}</div>
      <div class="flex flex-wrap gap8 mt12">
        ${ok?'<span class="badge b-green">✅ Boarded</span>':'<span class="badge b-orange">⏳ Pending</span>'}
        ${bus.delay?'<span class="badge b-red">⚠️ Delayed</span>':''}
      </div>`:'No bus data'}</div>
  </div>
  <div class="card mb16"><div class="section-title">🗺 Campus Map</div><div class="campus-map">${renderMap(found.stand,true,false)}</div></div>
  <div class="card"><div class="section-title">📅 Timeline</div>
    <div class="timeline">
      <div class="tl-item"><div class="tl-dot" style="background:var(--blue);border-color:var(--blue)"></div><div class="tl-time">07:00 AM</div><div class="tl-text">Bus ${found.busId} at Stand <strong>${found.stand}</strong></div></div>
      ${ok?`<div class="tl-item"><div class="tl-dot" style="background:var(--green);border-color:var(--green)"></div><div class="tl-time">${found.boardTime||'—'}</div><div class="tl-text text-g">✅ ${found.name} boarded at ${found.stop}</div></div>`:''}
      ${bus?.status==='En Route'?`<div class="tl-item"><div class="tl-dot" style="background:var(--purple);border-color:var(--purple)"></div><div class="tl-time">Now</div><div class="tl-text">🚌 Bus En Route to campus</div></div>`:''}
      <div class="tl-item"><div class="tl-dot" style="background:var(--muted);border-color:var(--muted)"></div><div class="tl-time">~4:45 PM</div><div class="tl-text text-m">Home drop expected</div></div>
    </div>
  </div>`;})():q?`<div class="card text-c" style="padding:40px"><div style="font-size:48px">🔍</div><div class="text-m mt12">No student found for "${q}"</div></div>`:
  `<div class="card"><div class="section-title">📊 All Routes</div><div class="tw"><table>
    <thead><tr><th>Bus</th><th>Route</th><th>Stand</th><th>Status</th><th>Speed</th></tr></thead>
    <tbody>${STATE.buses.map(b=>`<tr><td class="orb text-blue bold">${b.id}</td><td>${b.routeName}</td><td><span class="badge b-blue">${b.stand}</span></td><td>${statusBadge(b.status)}</td><td class="orb small text-g">${b.speed} km/h</td></tr>`).join('')}</tbody>
  </table></div></div>`}`;
}

// ── Router & Shell ──
const ROLES=[{id:'student',icon:'🎓',label:'Student'},{id:'driver',icon:'🚌',label:'Driver'},{id:'admin',icon:'🛡️',label:'Admin'},{id:'parent',icon:'👨‍👩‍👦',label:'Parent'}];

function render(){
  const role=STATE.role;
  const fns={student:renderStudent,driver:renderDriver,admin:renderAdmin,parent:renderParent};
  let content;
  try{content=fns[role]();}catch(e){content=`<div class="card text-c" style="padding:40px;color:var(--red)">⚠️ ${e.message}<pre style="font-size:10px;text-align:left;margin-top:10px;color:var(--muted)">${e.stack?.slice(0,400)}</pre></div>`;}
  
  const sos=STATE.sosActive?`<div class="sos-card"><div style="font-size:56px;margin-bottom:10px">🚨</div><div class="orb bold text-r2" style="font-size:18px;margin-bottom:8px">SOS EMERGENCY</div><div class="text-m mb16">Bus ${STATE.driverState.busId} — Admin Alerted</div><button class="btn btn-muted" onclick="STATE.sosActive=false;render()">Dismiss</button></div>`:'';
  
  let appEl=document.getElementById('app');
  if(!appEl.hasAttribute('data-init')){
    appEl.setAttribute('data-init','true');
    appEl.innerHTML=`
      <div id="sos-overlay" class="sos-overlay" style="display:none"></div>
      <div id="toast-container"></div>
      <header class="topbar" id="topbar-container"></header>
      <div id="main-content" class="main"></div>`;
  }
  
  const sosEl = document.getElementById('sos-overlay');
  if(STATE.sosActive){ sosEl.style.display='flex'; sosEl.innerHTML=sos; } else { sosEl.style.display='none'; }
  
  document.getElementById('topbar-container').innerHTML=`
      <div class="topbar-brand">🚌<span class="orb"> JIET SMART BUS</span></div>
      <div class="topbar-center">${ROLES.map(r=>`<div class="role-tab ${role===r.id?'active':''}" onclick="STATE.role='${r.id}';render()">${r.icon} ${r.label}</div>`).join('')}</div>
      <div class="topbar-right">
        <div class="trip-toggle">
          <div class="trip-opt ${STATE.tripDir==='morning'?'active':''}" onclick="STATE.tripDir='morning';render()">☀️ Morning</div>
          <div class="trip-opt ${STATE.tripDir==='afternoon'?'active':''}" onclick="STATE.tripDir='afternoon';render()">🌆 Afternoon</div>
        </div>
        <div id="live-clock" class="orb xs text-m">${new Date().toLocaleTimeString()}</div>
      </div>
  `;
  
  // Preserve focus
  let activeId = document.activeElement ? document.activeElement.id : null;
  let cStart = null, cEnd = null;
  if(activeId && (document.activeElement.tagName==='INPUT' || document.activeElement.tagName==='TEXTAREA')){
    cStart = document.activeElement.selectionStart;
    cEnd = document.activeElement.selectionEnd;
  }
  
  document.getElementById('main-content').innerHTML=content;
  
  if(activeId){
    let el = document.getElementById(activeId);
    if(el){
      el.focus();
      try{ if(cStart!==null) el.setSelectionRange(cStart,cEnd); }catch(e){}
    }
  }
}

subscribe(render);
setInterval(()=>{const c=document.getElementById('live-clock');if(c)c.textContent=new Date().toLocaleTimeString();},1000);
window.addEventListener('DOMContentLoaded',()=>{
  render(); startSimulation();
  setTimeout(()=>toast('🚀 System Online','JIET Smart Bus v3.0 — GPS Active','green'),800);
  setTimeout(()=>toast('📍 Stand Update','Bus RJ14-07 at Stand B2 — Boarding open','blue'),2200);
  setTimeout(()=>addAlert('✅ Morning fleet initialized — All diagnostics green','blue'),3000);
});

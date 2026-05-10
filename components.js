// ── Toast ──
function toast(title,msg,type='blue'){
  const c=document.getElementById('toast-container');if(!c)return;
  const el=document.createElement('div');
  el.className=`toast t-${type}`;
  const icons={blue:'🔵',green:'✅',red:'🚨',orange:'⚠️'};
  el.innerHTML=`<span style="font-size:18px;flex-shrink:0">${icons[type]||'ℹ️'}</span>
    <div><div class="toast-title">${title}</div><div class="toast-msg">${msg}</div></div>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:15px;margin-left:auto;padding-left:8px;flex-shrink:0">✕</button>`;
  c.appendChild(el);
  setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),400);},5000);
}

// ── Status badge ──
function statusBadge(s){
  const map={Boarding:'blue','En Route':'green',Departing:'orange',Parked:'muted',Breakdown:'red',Boarded:'green','On Board':'blue',Pending:'muted',Dropped:'purple'};
  const col=map[s]||'muted';const pulse=(s==='Boarding'||s==='En Route')?'d-pulse':'';
  return `<span class="badge b-${col}"><span class="dot d-${col} ${pulse}"></span>${s}</span>`;
}

// ── Countdown ──
function countdownHTML(bus){
  if(bus.status==='En Route') return `<span class="badge b-green"><span class="dot d-green d-pulse"></span>En Route</span>`;
  if(bus.status==='Parked') return `<span class="badge b-muted">Parked</span>`;
  if(bus.status==='Breakdown') return `<span class="badge b-red"><span class="dot d-red d-pulse"></span>Breakdown</span>`;
  if(bus.departure<=0) return `<span class="badge b-orange d-pulse">Departing Now</span>`;
  const cls=bus.departure<=5?'urgent':'';
  return `<span class="countdown ${cls}">${String(bus.departure).padStart(2,'0')}:00</span>`;
}

// ── Stand status colour ──
function standColor(s){return {free:'green',occ:'yellow',crowd:'red'}[getStandStatus(s)]||'green';}

// ── Campus SVG Map ──
function renderMap(highlightStand=null,showAllBuses=true,compact=false){
  const W=compact?480:600,H=compact?220:280;
  const S=STATE.standPos;const STATUS={free:'#00ff88',occ:'#ffd60a',crowd:'#ff3366'};
  const stands=Object.entries(S).map(([name,pos])=>{
    const st=getStandStatus(name),color=STATUS[st],isHL=name===highlightStand;
    const buses=(STATE.standBuses[name]||[]);
    return `<g class="stand-dot" onclick="window._standClick&&window._standClick('${name}',event)" style="cursor:pointer">
      ${isHL?`<circle cx="${pos.x}" cy="${pos.y}" r="20" fill="${color}22" stroke="${color}" stroke-width="1.5" opacity="0.5"><animate attributeName="r" from="12" to="26" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite"/></circle>`:''}
      <circle cx="${pos.x}" cy="${pos.y}" r="${isHL?11:8}" fill="${isHL?color+'22':'rgba(0,0,0,0.4)'}" stroke="${color}" stroke-width="${isHL?2:1.5}"/>
      <circle cx="${pos.x}" cy="${pos.y}" r="4" fill="${color}" opacity="0.9"/>
      <text x="${pos.x}" y="${pos.y+22}" text-anchor="middle" font-family="Orbitron,monospace" font-size="9" fill="${isHL?color:color}" opacity="0.9">${name}</text>
      ${buses.length?`<text x="${pos.x}" y="${pos.y+33}" text-anchor="middle" font-family="monospace" font-size="7" fill="rgba(255,255,255,0.4)">${buses.slice(0,2).join(',')}</text>`:''}
    </g>`;
  }).join('');

  const buses=showAllBuses?STATE.buses.map(bus=>{
    const pos=STATE.busPos[bus.id];if(!pos)return'';
    const c=bus.emergency?'#ff3366':bus.breakdown?'#ff9500':bus.status==='En Route'?'#00ff88':bus.status==='Boarding'?'#00d4ff':'#64748b';
    return `<g>
      <rect x="${pos.x-13}" y="${pos.y-8}" width="26" height="16" rx="4" fill="${c}" opacity="0.9"/>
      <rect x="${pos.x-10}" y="${pos.y-6}" width="7" height="5" rx="1" fill="rgba(0,0,0,0.55)"/>
      <rect x="${pos.x+2}" y="${pos.y-6}" width="7" height="5" rx="1" fill="rgba(0,0,0,0.55)"/>
      <circle cx="${pos.x-6}" cy="${pos.y+8}" r="2.5" fill="#111" stroke="${c}" stroke-width="1.5"/>
      <circle cx="${pos.x+6}" cy="${pos.y+8}" r="2.5" fill="#111" stroke="${c}" stroke-width="1.5"/>
      <text x="${pos.x}" y="${pos.y+2.5}" text-anchor="middle" font-family="monospace" font-size="5" fill="rgba(0,0,0,0.9)">${bus.id.slice(-5)}</text>
      ${bus.status==='Boarding'?`<circle cx="${pos.x+15}" cy="${pos.y-9}" r="3.5" fill="${c}"><animate attributeName="opacity" values="1;0;1" dur="0.9s" repeatCount="indefinite"/></circle>`:''}
      ${bus.emergency?`<text x="${pos.x}" y="${pos.y-14}" text-anchor="middle" font-size="10" fill="#ff3366">🚨</text>`:''}
    </g>`;
  }).join(''):'';

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;min-height:${compact?180:240}px">
    <defs>
      <pattern id="mg" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke="rgba(0,212,255,0.05)" stroke-width="1"/></pattern>
      <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#mg)"/>
    <rect x="22" y="18" width="${W-44}" height="${H-36}" rx="10" fill="none" stroke="rgba(0,212,255,0.12)" stroke-width="1.5" stroke-dasharray="8,5"/>
    <line x1="22" y1="${H/2}" x2="${W-22}" y2="${H/2}" stroke="rgba(255,255,255,0.04)" stroke-width="8"/>
    <line x1="${W/2}" y1="18" x2="${W/2}" y2="${H-18}" stroke="rgba(255,255,255,0.04)" stroke-width="8"/>
    <rect x="${W/2-48}" y="${H/2-28}" width="96" height="56" rx="8" fill="rgba(168,85,247,0.12)" stroke="rgba(168,85,247,0.4)" stroke-width="1.5"/>
    <text x="${W/2}" y="${H/2-6}" text-anchor="middle" font-family="Orbitron,monospace" font-size="9" fill="#a855f7" font-weight="700">JIET</text>
    <text x="${W/2}" y="${H/2+8}" text-anchor="middle" font-family="monospace" font-size="7" fill="#a855f7">CAMPUS HQ</text>
    <circle cx="${W/2}" cy="${H/2}" r="60" fill="none" stroke="rgba(168,85,247,0.08)" stroke-width="1"><animate attributeName="r" from="50" to="80" dur="5s" repeatCount="indefinite"/><animate attributeName="opacity" from="0.3" to="0" dur="5s" repeatCount="indefinite"/></circle>
    <circle cx="22" cy="${H-18}" r="4" fill="#00ff88"/><text x="30" y="${H-15}" font-family="monospace" font-size="7" fill="#64748b">Free</text>
    <circle cx="60" cy="${H-18}" r="4" fill="#ffd60a"/><text x="68" y="${H-15}" font-family="monospace" font-size="7" fill="#64748b">Occupied</text>
    <circle cx="112" cy="${H-18}" r="4" fill="#ff3366"/><text x="120" y="${H-15}" font-family="monospace" font-size="7" fill="#64748b">Full</text>
    ${stands}${buses}
  </svg>`;
}

// ── Stand occupancy grid ──
function renderStandGrid(clickable){
  return `<div class="stand-grid">${STANDS.map(s=>{
    const st=getStandStatus(s);
    const cls=st==='free'?'s-free':st==='crowd'?'s-crowd':'s-occ';
    const label=st==='free'?'Free':st==='crowd'?'Full':'Occupied';
    const buses=(STATE.standBuses[s]||[]);
    return `<div class="stand-cell ${cls}" onclick="${clickable?`window._standClick&&window._standClick('${s}',event)`:''}" style="cursor:${clickable?'pointer':'default'}">
      <div class="stand-name">${s}</div>
      <div class="stand-sub">${label}</div>
      <div class="stand-bus">${buses.length?buses.join(', '):'—'}</div>
    </div>`;
  }).join('')}</div>`;
}

// ── Bar chart ──
function barChart(values,labels,color='var(--blue)',maxVal){
  const mx=maxVal||Math.max(...values)||1;
  return `<div class="bar-chart">${values.map((v,i)=>`
    <div class="bar-wrap">
      <div class="bar-val" style="color:${color}">${v}%</div>
      <div class="bar" style="height:${(v/mx*100)}%;background:linear-gradient(180deg,${color},${color}44)"></div>
      <div class="bar-label">${labels[i]}</div>
    </div>`).join('')}</div>`;
}

// ── Donut chart (SVG) ──
function donutChart(pct,color,label){
  const r=44,c=2*Math.PI*r,d=c*(1-pct/100);
  return `<div class="donut-wrap">
    <svg viewBox="0 0 100 100" width="110" height="110">
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10"/>
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="10"
        stroke-dasharray="${c}" stroke-dashoffset="${d}" stroke-linecap="round"/>
    </svg>
    <div class="donut-center">
      <div style="font-size:18px;font-weight:700;color:${color}">${pct}%</div>
      <div style="font-size:8px;color:var(--muted)">${label}</div>
    </div>
  </div>`;
}

// ── GPS coordinate panel ──
function gpsPanel(bus){
  return `<div class="gps-panel">
    <div class="gps-label">Live GPS Coordinates</div>
    <div class="gps-coord">📍 ${bus.lat.toFixed(6)}°N</div>
    <div class="gps-coord">📍 ${bus.lng.toFixed(6)}°E</div>
    <div class="gps-label mt8">Jodhpur, Rajasthan — India</div>
    <div class="flex items-c gap8 mt8">
      <span class="dot d-green d-pulse"></span>
      <span class="xs text-g">GPS Lock Active</span>
    </div>
  </div>`;
}

// ── Bus row for admin table ──
function busRow(bus){
  const em=bus.emergency?'🚨':'';const bk=bus.breakdown?'<span class="badge b-red xs">Breakdown</span>':'';
  const dv=bus.deviation?'<span class="badge b-yellow xs ml4">Off-Route</span>':'';
  return `<tr ${bus.emergency?'style="background:rgba(255,51,102,0.05)"':''}>
    <td><span class="orb text-blue bold">${bus.id}</span> ${em}</td>
    <td>${bus.routeName}<br><span class="xxs text-m">${bus.route}</span></td>
    <td>${bus.driver}</td>
    <td><span class="badge b-blue">${bus.stand}</span></td>
    <td><span class="orb" style="color:${bus.speed>50?'var(--red)':bus.speed>30?'var(--orange)':'var(--green)'}">${bus.speed}</span><span class="xxs text-m"> km/h</span></td>
    <td>${statusBadge(bus.status)}${bk}${dv}</td>
    <td>${countdownHTML(bus)}</td>
    <td><select style="font-size:11px;padding:4px 8px;width:130px" onchange="moveBusToStand('${bus.id}',this.value)">
      ${STANDS.map(s=>`<option value="${s}" ${s===bus.stand?'selected':''}>${s}</option>`).join('')}
    </select></td>
  </tr>`;
}

// ── Stand popup ──
function showStandPopup(stand,ev){
  const old=document.getElementById('stand-popup');if(old)old.remove();
  const buses=(STATE.standBuses[stand]||[]).map(getBus).filter(Boolean);
  const pop=document.createElement('div');
  pop.id='stand-popup';pop.className='stand-popup';
  pop.style.cssText=`left:${Math.min(ev.clientX+10,window.innerWidth-240)}px;top:${Math.min(ev.clientY+10,window.innerHeight-200)}px`;
  pop.innerHTML=`
    <div class="flex justify-b items-c mb12">
      <div class="orb bold text-blue">Stand ${stand}</div>
      <button onclick="document.getElementById('stand-popup')?.remove()" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px">✕</button>
    </div>
    <div class="xs text-m mb8">Status: <strong class="text-${standColor(stand)}">${getStandStatus(stand).toUpperCase()}</strong> · ${buses.length} bus${buses.length!==1?'es':''}</div>
    ${buses.length?buses.map(b=>`
      <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:10px;margin-bottom:8px;border:1px solid rgba(0,212,255,0.15)">
        <div class="flex justify-b items-c mb4"><span class="orb small text-blue">${b.id}</span>${statusBadge(b.status)}</div>
        <div class="xs text-m">Driver: ${b.driver}</div>
        <div class="xs text-m">Route: ${b.routeName}</div>
        <div class="xs text-m">Passengers: ${b.pax}/${b.cap}</div>
        <div class="xs" style="color:var(--orange);margin-top:4px">${b.departure>0?`Departs in ${b.departure} min`:'Departing Now'}</div>
      </div>`).join(''):'<div class="xs text-m text-c" style="padding:12px">Stand is free</div>'}`;
  document.body.appendChild(pop);
  setTimeout(()=>document.addEventListener('click',function h(e){if(!pop.contains(e.target)){pop.remove();document.removeEventListener('click',h);}},{once:true}),100);
}

// ── Attendance log item ──
function logItem(e){
  const icons={board:'🟢',pending:'⏳',alert:'🚨',drop:'🏠'};
  return `<div class="alert-item"><div class="alert-time">${e.time}</div><span style="font-size:14px">${icons[e.type]||'ℹ️'}</span><div class="alert-msg">${e.text}</div></div>`;
}

// ── Attendance % calc ──
function calcAttPct(){
  const total=STATE.students.length;
  const boarded=STATE.students.filter(s=>s.status==='Boarded'||s.status==='On Board').length;
  return total?Math.round(boarded/total*100):0;
}

// ============================================================
// JIET SMART BUS — GLOBAL STATE v3.0 (Production Grade)
// Jodhpur GPS coordinates: JIET Campus ~26.2920°N, 73.0212°E
// ============================================================

const STANDS = ['A1','A2','B1','B2','C1','C2','Hostel Zone','Main Gate'];

const JIET = { lat:26.2920, lng:73.0212 }; // Campus HQ

// Bus GPS start positions (Jodhpur localities)
const ROUTE_ORIGINS = {
  'Route 3': { lat:26.2842, lng:73.0156, name:'Shastri Nagar' },
  'Route 1': { lat:26.2944, lng:73.0312, name:'Paota' },
  'Route 5': { lat:26.2765, lng:73.0089, name:'Chopasni Road' },
  'Route 2': { lat:26.2698, lng:73.0234, name:'Ratanada' },
  'Route 4': { lat:26.2879, lng:72.9998, name:'Sardarpura' },
  'Route 6': { lat:26.2601, lng:73.0167, name:'Pal Village' },
  'Route 7': { lat:26.2734, lng:73.0401, name:'Bhagat Ki Kothi' },
  'Route 8': { lat:26.3156, lng:73.0089, name:'Mandore' },
  'Route 9': { lat:26.2812, lng:73.0289, name:'Mahamandir' },
  'Route 10':{ lat:26.2678, lng:73.0056, name:'Basni' },
};

const STATE = {
  role: 'admin',
  tripDir: 'morning',
  activeAlert: null,
  sosActive: false,
  parentSearch: '',
  adminAlerts: [],
  scanLog: [],

  buses: (function(){
    const B=[
      ['RJ14-07','Route 3','Shastri Nagar','Ramesh Kumar','B2','Boarding',28,0,12,'Route 3'],
      ['RJ14-12','Route 1','Paota','Suresh Singh','A1','En Route',36,2,0,'Route 1'],
      ['RJ14-19','Route 5','Chopasni Road','Mahesh Joshi','C1','Parked',12,0,25,'Route 5'],
      ['RJ14-23','Route 2','Ratanada','Dinesh Purohit','Hostel Zone','Departing',40,5,3,'Route 2'],
      ['RJ14-31','Route 4','Sardarpura','Prakash Rao','A2','Boarding',22,0,18,'Route 4'],
      ['RJ14-32','Route 6','Pal Village','Hemraj Jat','B1','Boarding',19,0,22,'Route 6'],
      ['RJ14-33','Route 7','Bhagat Ki Kothi','Kamlesh Verma','C2','Parked',8,0,30,'Route 7'],
      ['RJ14-34','Route 8','Mandore','Nathulal','Main Gate','Boarding',31,0,15,'Route 8'],
      ['RJ14-35','Route 9','Mahamandir','Ganesh Bishnoi','A1','En Route',38,0,0,'Route 9'],
      ['RJ14-36','Route 10','Basni','Sunil Choudhary','A2','Parked',5,0,35,'Route 10'],
    ];
    return B.map(([id,route,routeName,driver,stand,status,pax,delay,departure,rk])=>{
      const orig = ROUTE_ORIGINS[rk]||JIET;
      const spd = status==='En Route'?Math.floor(35+Math.random()*25):status==='Boarding'?0:status==='Departing'?15:0;
      return {
        id,route,routeName,driver,stand,status,pax,cap:45,delay,departure,
        lat: orig.lat + (Math.random()-0.5)*0.002,
        lng: orig.lng + (Math.random()-0.5)*0.002,
        speed: spd,
        emergency: false,
        breakdown: false,
        deviation: false,
        tripActive: status!=='Parked',
        routeKey: rk,
      };
    });
  })(),

  students: (function(){
    const D=[
      ['Arjun Sharma','Route 3','RJ14-07','B2','Rajesh Sharma','Shastri Circle'],
      ['Priya Meena','Route 1','RJ14-12','A1','Mohan Meena','Paota Crossing'],
      ['Rohit Singh','Route 5','RJ14-19','C1','Harish Singh','Chopasni Chowk'],
      ['Kavita Rathore','Route 2','RJ14-23','Hostel Zone','Nilesh Rathore','Ratanada Turn'],
      ['Aman Joshi','Route 3','RJ14-07','B2','Sunil Joshi','Shastri Nagar'],
      ['Sneha Rathore','Route 1','RJ14-12','A1','Dinesh Rathore','Paota'],
      ['Vikram Bishnoi','Route 4','RJ14-31','A2','Ramu Bishnoi','Sardarpura'],
      ['Anjali Purohit','Route 6','RJ14-32','B1','Kishan Purohit','Pal Village'],
      ['Rahul Gupta','Route 7','RJ14-33','C2','Anil Gupta','BK Kothi'],
      ['Pooja Bhati','Route 8','RJ14-34','Main Gate','Sunder Bhati','Mandore'],
      ['Lakshya Solanki','Route 9','RJ14-35','A1','Vijay Solanki','Mahamandir'],
      ['Nidhi Choudhary','Route 10','RJ14-36','A2','Ram Choudhary','Basni'],
    ];
    const ST=['Boarded','Pending','On Board','Boarded','Pending','Boarded'];
    return D.map(([name,route,busId,stand,parent,stop],i)=>({
      id:'STU'+String(i+1).padStart(3,'0'),
      name,route,busId,stand,parent,stop,
      status: ST[i%ST.length],
      boardTime: (i%2===0)?`0${7+Math.floor(i/4)}:${15+i*3} AM`:'',
      dropTime:'',
      parentPhone:'+91 9876'+String(500000+i*1111),
    }));
  })(),

  attendance: [],

  driverState: {
    busId:'RJ14-07',
    tripActive:false,
    selectedStand:'B2',
    busStatus:'Boarding',
    passengerCount:28,
  },

  standBuses: {
    'A1':['RJ14-12','RJ14-35'],'A2':['RJ14-31','RJ14-36'],
    'B1':['RJ14-32'],'B2':['RJ14-07'],
    'C1':['RJ14-19'],'C2':['RJ14-33'],
    'Hostel Zone':['RJ14-23'],'Main Gate':['RJ14-34'],
  },

  standPos: {
    'A1':{x:110,y:70},'A2':{x:220,y:70},
    'B1':{x:110,y:160},'B2':{x:220,y:160},
    'C1':{x:330,y:115},'C2':{x:430,y:115},
    'Hostel Zone':{x:500,y:210},'Main Gate':{x:55,y:230},
  },

  busPos:{
    'RJ14-07':{x:220,y:160},'RJ14-12':{x:110,y:70},
    'RJ14-19':{x:330,y:115},'RJ14-23':{x:500,y:210},
    'RJ14-31':{x:220,y:70},'RJ14-32':{x:110,y:160},
    'RJ14-33':{x:430,y:115},'RJ14-34':{x:55,y:230},
    'RJ14-35':{x:112,y:72},'RJ14-36':{x:222,y:72},
  },

  analytics:{
    efficiency:[72,85,78,91,88,65,70],
    labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    routeAtt:{'Shastri Ngr':85,'Paota':92,'Chopasni':78,'Ratanada':70,'Sardarpura':88,'Pal Vill':74},
    cards:{ etaAccuracy:94, utilization:87, onTime:76 },
    delayed:[
      {bus:'RJ14-23',reason:'Traffic',mins:5},
      {bus:'RJ14-36',reason:'Late Driver',mins:12},
    ],
  },
};

// ---- Helpers ----
const getBus=id=>STATE.buses.find(b=>b.id===id);
const getStudent=id=>STATE.students.find(s=>s.id===id);
const getStandStatus=s=>{ const n=(STATE.standBuses[s]||[]).length; return n===0?'free':n===1?'occ':'crowd'; };
const fmtTime=()=>new Date().toTimeString().slice(0,8);
const statusColor=s=>({Boarding:'blue','En Route':'green',Departing:'orange',Parked:'muted',Breakdown:'red'}[s]||'muted');

const listeners=[];
function subscribe(fn){listeners.push(fn)}
function notify(){listeners.forEach(fn=>fn())}

function moveBusToStand(busId,newStand){
  const bus=getBus(busId); if(!bus||bus.stand===newStand)return;
  const old=bus.stand;
  if(STATE.standBuses[old]) STATE.standBuses[old]=STATE.standBuses[old].filter(b=>b!==busId);
  if(!STATE.standBuses[newStand])STATE.standBuses[newStand]=[];
  STATE.standBuses[newStand].push(busId);
  bus.stand=newStand;
  const pos=STATE.standPos[newStand];
  if(pos) STATE.busPos[busId]={x:pos.x,y:pos.y};
  STATE.students.filter(s=>s.busId===busId).forEach(s=>{s.stand=newStand});
  toast(`🚌 Bus ${busId} moved → Stand ${newStand}`,`Departure in ${bus.departure} min`,'blue');
  notify();
}

// ---- GPS Simulation Engine ----
function startSimulation(){
  // GPS drift every 5s
  setInterval(()=>{
    STATE.buses.forEach(bus=>{
      if(bus.tripActive && !bus.breakdown){
        bus.lat += (Math.random()-0.5)*0.0006;
        bus.lng += (Math.random()-0.5)*0.0006;
        // Clamp near Jodhpur
        bus.lat = Math.max(26.25,Math.min(26.33,bus.lat));
        bus.lng = Math.max(72.98,Math.min(73.06,bus.lng));
        // Route deviation check (if drifts too far from route origin)
        const orig = ROUTE_ORIGINS[bus.routeKey];
        if(orig){
          const d = Math.abs(bus.lat-orig.lat)+Math.abs(bus.lng-orig.lng);
          bus.deviation = (bus.status==='En Route' && d > 0.04);
          if(bus.deviation && Math.random()<0.3){
            addAlert(`⚠️ Route deviation: Bus ${bus.id} off-course`,'orange');
          }
        }
        // SVG position drift
        const p=STATE.busPos[bus.id];
        if(p){p.x+=(Math.random()-0.5)*3;p.y+=(Math.random()-0.5)*3;}
      }
    });
    notify();
  },5000);

  // Speed simulation every 5s
  setInterval(()=>{
    STATE.buses.forEach(bus=>{
      if(bus.status==='En Route') bus.speed=Math.floor(25+Math.random()*35);
      else if(bus.status==='Departing') bus.speed=Math.floor(5+Math.random()*20);
      else bus.speed=0;
      if(bus.speed>55) addAlert(`🚨 Overspeed: Bus ${bus.id} at ${bus.speed} km/h`,'red');
    });
    notify();
  },5000);

  // Countdown every 30s
  setInterval(()=>{
    STATE.buses.forEach(bus=>{
      if(bus.status==='Boarding'&&bus.departure>0){
        bus.departure--;
        if(bus.departure===5) toast(`⚠️ Bus ${bus.id} departing in 5 min!`,bus.routeName+' — Stand '+bus.stand,'orange');
        if(bus.departure===0){bus.status='Departing';toast(`🚀 ${bus.id} departing now`,'Stand '+bus.stand,'green');}
      }
    });
    notify();
  },30000);

  // Random alerts every 20s
  setInterval(()=>{
    const msgs=[
      '🕐 Bus RJ14-36 idle for 18 min at Stand A2',
      '⛽ Low fuel warning: Bus RJ14-33',
      '🚦 Heavy traffic on Chopasni Road — ETA +8 min',
      '✅ Route 1 departures on schedule',
    ];
    addAlert(msgs[Math.floor(Math.random()*msgs.length)],'blue');
  },20000);

  // Auto pax scan every 15s
  setInterval(()=>{
    const boarding=STATE.buses.filter(b=>b.status==='Boarding');
    if(!boarding.length)return;
    const bus=boarding[Math.floor(Math.random()*boarding.length)];
    if(bus.pax<bus.cap){bus.pax++;notify();}
  },15000);
}

function addAlert(msg,type='blue'){
  STATE.adminAlerts.unshift({msg,type,time:fmtTime()});
  if(STATE.adminAlerts.length>8)STATE.adminAlerts.pop();
  if(STATE.role==='admin')notify();
}

function triggerSOS(busId){
  const bus=getBus(busId);
  STATE.sosActive=true;
  if(bus) bus.emergency=true;
  addAlert(`🚨 SOS EMERGENCY: Bus ${busId} at Stand ${bus?.stand||'—'}`,'red');
  toast('🚨 SOS TRIGGERED',`Bus ${busId} emergency — Admin alerted!`,'red');
  setTimeout(()=>{STATE.sosActive=false;if(bus)bus.emergency=false;notify();},8000);
  notify();
}

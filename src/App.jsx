import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Rocket, Activity, Wind, Thermometer, Globe, Upload, Star, Crosshair, Map, Users, Shield, Cpu, PenTool, Calculator, Laptop, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Battery } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from './supabaseClient';
import RocketCanvas from './RocketModel';

// Datos de prueba iniciales
const mockFlightData = Array.from({ length: 30 }, (_, i) => {
  const ax = 0.1; const ay = 0.1; const az = i === 2 ? 4.5 : 1.0;
  const absG = Math.sqrt(ax*ax + ay*ay + az*az);
  return {
    time: i * 0.1, 
    altitude: i < 15 ? i * 26.6 : 400 - (i - 15) * 15, 
    pressure: 750 - i,
    tempAHT: 22 - (i * 0.1), tempBMP: 21.8 - (i * 0.1), humidity: 45,
    ax, ay, az, 
    gForceAbs: absG, 
    gForceNet: Math.max(0, absG - 1),
    gx: i*2, gy: i, gz: 0, roll: i*5, pitch: i < 15 ? 80 : -80, 
    eco2: 400, tvoc: 0, vib: 0, lat: 0, lon: 0,
    vbat: 3.76, rssi: -45, snr: 13, perdidos: 0, mx: 0, my: 0, mz: 0, sats: 0
  };
});

export default function App() {
  const [activeTab, setActiveTab] = useState('telemetry');
  const [rawData, setRawData] = useState([]); 
  const [flightData, setFlightData] = useState(mockFlightData); 
  const [fileName, setFileName] = useState('Datos de Prueba');
  const [showTable, setShowTable] = useState(false);
  const [isLive, setIsLive] = useState(false);

  // 1. CONEXIÓN EN TIEMPO REAL A SUPABASE
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('telemetry')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (data && data.length > 0) {
        setRawData(data.reverse()); 
        setIsLive(true);
      }
    };
    fetchInitialData();

    const channel = supabase
      .channel('telemetry_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'telemetry' }, (payload) => {
        setRawData(prev => {
          const newData = [...prev, payload.new];
          if (newData.length > 500) {
            return newData.slice(newData.length - 500);
          }
          return newData;
        });
        setIsLive(true);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // 2. CEREBRO MATEMÁTICO
  useEffect(() => {
    if (rawData.length === 0) return;
    procesarDatos(rawData);
  }, [rawData]);

 // 3. FUNCIÓN DE PROCESAMIENTO CENTRAL
  const procesarDatos = (data) => {
    if (!data || data.length === 0) return;

    const primerDatoValido = data.find(d => d.t_ms != null);
    const t0 = primerDatoValido ? primerDatoValido.t_ms : 0;
    
    let p0_sum = 0; let p0_count = 0;
    for (let i = 0; i < Math.min(50, data.length); i++) {
      // Busca la presión bajo distintos nombres posibles
      const presBase = data[i].pres_hpa ?? data[i].pres_hPa ?? data[i].presion ?? data[i].pres ?? 0;
      if (presBase > 0) { p0_sum += presBase; p0_count++; }
    }
    const P0 = p0_count > 0 ? p0_sum / p0_count : 1013.25;

    const processed = data.map((row, index) => {
      // 🚨 HERRAMIENTA DE DIAGNÓSTICO: Imprime el primer dato en la consola
      if (index === 0) {
        console.log("🔍 DATO CRUDO RECIBIDO DE SUPABASE:", row);
      }

      const ax = row.ax_g ?? row.ax ?? 0; 
      const ay = row.ay_g ?? row.ay ?? 0; 
      const az = row.az_g ?? row.az ?? 0;
      const pres = row.pres_hpa ?? row.pres_hPa ?? row.presion ?? row.pres ?? P0;
      
      const current_t_ms = row.t_ms ?? row.tiempo ?? row.t ?? 0;
      let time_sec = (current_t_ms - t0) / 1000;
      if (time_sec < 0) time_sec = 0;

      // Cálculo de Altitud: Intenta tomar el dato del sensor, si no existe, lo calcula
      let alt_real = row.alt_rel_m ?? row.altitud ?? row.alt ?? row.altitude ?? undefined;
      if (alt_real === undefined) {
        alt_real = 44330 * (1 - Math.pow(pres / P0, 1 / 5.255));
      }

      const absG = Math.sqrt(ax*ax + ay*ay + az*az);

      return {
        time: Number(time_sec.toFixed(2)),
        altitude: Number(alt_real) || 0,
        pressure: Number(pres) || 0,
        // Busca la temperatura bajo cualquier nombre posible
        tempAHT: Number(row.temp_aht_c ?? row.temp_aht_C ?? row.temperatura ?? row.temp ?? row.temperature ?? 0),
        tempBMP: Number(row.temp_bmp_c ?? row.temp_bmp_C ?? 0),
        humidity: Number(row.hum_pct ?? row.humedad ?? row.hum ?? 0),
        ax, ay, az,
        gForceAbs: absG,
        gForceNet: Math.max(0, absG - 1),
        gx: row.gx_dps ?? row.gx ?? 0, 
        gy: row.gy_dps ?? row.gy ?? 0, 
        gz: row.gz_dps ?? row.gz ?? 0,
        mx: row.mx_ut ?? row.mx ?? 0, 
        my: row.my_ut ?? row.my ?? 0, 
        mz: row.mz_ut ?? row.mz ?? 0,
        eco2: row.eco2_ppm ?? row.eco2 ?? 0, 
        tvoc: row.tvoc_ppb ?? row.tvoc ?? 0, 
        vib: row.vib ?? row.vibracion ?? 0,
        lat: row.lat ?? row.latitud ?? 0, 
        lon: row.lon ?? row.longitud ?? 0, 
        sats: row.sats ?? row.satelites ?? 0,
        roll: row.roll_deg ?? row.roll ?? 0, 
        pitch: row.pitch_deg ?? row.pitch ?? 0,
        vbat: row.vbat_v ?? row.vbat ?? row.bateria ?? 0, 
        rssi: row.rssi_dbm ?? row.rssi ?? 0, 
        snr: row.snr_db ?? row.snr ?? 0,
        perdidos: row.perdidos ?? 0
      };
    });
    
    setFlightData(processed);
  };

  // 4. CARGA MANUAL DE CSV
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsLive(false);
      setFileName(file.name);
      Papa.parse(file, {
        header: true, dynamicTyping: true, skipEmptyLines: true,
        complete: (results) => {
          const validData = results.data.filter(row => row.t_ms !== undefined && row.t_ms !== null);
          setRawData(validData);
        }
      });
    }
  };

  const maxAltitude = flightData.length > 0 ? Math.max(...flightData.map(d => d.altitude)) : 0;
  const minAltitude = flightData.length > 0 ? Math.min(...flightData.map(d => d.altitude)) : 0;
  const maxGForceNet = flightData.length > 0 ? Math.max(...flightData.map(d => d.gForceNet)) : 0;
  const currentTemp = flightData.length > 0 ? flightData[flightData.length - 1].tempAHT : 0;
  const startPressure = flightData.length > 0 ? flightData[0].pressure : 0;
  const endPressure = flightData.length > 0 ? flightData[flightData.length - 1].pressure : 0;
  
  const validTimes = flightData.map(d => Number(d.time)).filter(t => !isNaN(t) && t >= 0);
  const totalTime = validTimes.length > 0 ? Math.max(...validTimes).toFixed(1) : 0;

  const lastRow = flightData[flightData.length - 1] || {};
  const magWorks = (lastRow.mx !== 0 || lastRow.my !== 0 || lastRow.mz !== 0);
  const gpsWorks = lastRow.sats > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30">
      
      {/* NAVEGACIÓN */}
      <nav className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <img src="/parche.png" alt="Logo AstraMaia" className="w-14 h-14 object-contain rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              <span className="font-extrabold text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                ASTRAMAIA
              </span>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setActiveTab('about')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'about' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'hover:bg-slate-800 text-slate-300'}`}>
                Nuestra Misión
              </button>
              <button onClick={() => setActiveTab('telemetry')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'telemetry' ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30' : 'hover:bg-slate-800 text-slate-300'}`}>
                <Activity size={16} /> Estación Terrena
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* PESTAÑA MISION */}
        {activeTab === 'about' ? (
          <div className="space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            <div className="relative py-20 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl">
              <div className="absolute inset-0 bg-[url('/pleiades.jpg')] bg-cover bg-center opacity-40 mix-blend-screen"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
              <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
                <h1 className="text-5xl font-extrabold mb-4 text-white drop-shadow-lg">Proyecto CanSat AstraMaia</h1>
                <h2 className="text-2xl font-bold mb-8 text-cyan-400">Equipo 318 - ACMA (Universidad Distrital)</h2>
                <p className="text-slate-200 text-lg mb-10 leading-relaxed font-medium bg-slate-950/50 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                  El nombre Astra Maia rinde homenaje a la figura femenina muisca vinculada a la Luna (Huitaca), integrando la ciencia que hacemos con nuestras raíces ancestrales. Somos un equipo interdisciplinario de siete mujeres apasionadas por la tecnología espacial, representadas como las siete estrellas de las Pléyades.
                </p>
                <img src="/equipo.jpg" alt="Equipo AstraMaia" className="w-full max-w-3xl mx-auto rounded-2xl border-2 border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)] object-cover" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h3 className="text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">El Parche de Misión</h3>
                <div className="space-y-6 text-slate-300 text-lg">
                  <div className="flex gap-4 items-start">
                    <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400"><Crosshair size={24} /></div>
                    <p><strong>Emblema Oficial:</strong> Nuestro diseño reúne la identidad de Astra Maia y la misión de telemetría del cohete Huitaca.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400"><Star size={24} /></div>
                    <p><strong>Las Siete Estrellas:</strong> Brillan alrededor del parche representando a cada integrante de nuestro equipo femenino y hacen referencia a Maia, la estrella de las Pléyades.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400"></div>
                    <p><strong>Colores y Raíces:</strong> El morado destaca la unión y fuerza del equipo; los tonos azules evocan la tecnología y el espacio. Las montañas andinas y el mapa de Colombia plasman nuestro origen.</p>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2 flex justify-center">
                <img src="/parche.png" alt="Parche AstraMaia" className="w-full max-w-md drop-shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:scale-105 transition-transform duration-500" />
              </div>
            </div>

            <div>
              <div className="text-center mb-12">
                <h3 className="text-4xl font-extrabold text-white mb-4">Nuestro Equipo de Misión</h3>
                <p className="text-slate-400 text-lg">Las siete mentes detrás de la ingeniería y desarrollo de Huitaca.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: "Mariana Velandia", role: "Líder Técnica y Aerodinámica", icon: <Users /> },
                  { name: "Laura Ortiz", role: "Diseño y Estructuras", icon: <PenTool /> },
                  { name: "Camila Pérez", role: "Carga Útil (CanSat)", icon: <Cpu /> },
                  { name: "Laura Riaño", role: "Aviónica y Recuperación", icon: <Shield /> },
                  { name: "Yessica Pulido", role: "Comunicaciones y Gestión", icon: <Globe /> },
                  { name: "Paula Vargas", role: "Cálculos y Análisis", icon: <Calculator /> },
                  { name: "Issabela Ortiz", role: "Simulaciones e Integración", icon: <Laptop /> }
                ].map((member, idx) => (
                  <div key={idx} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-colors text-center group">
                    <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors mb-4">
                      {member.icon}
                    </div>
                    <h4 className="text-xl font-bold text-white mb-1">{member.name}</h4>
                    <p className="text-cyan-400 text-sm font-medium">{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          
          /* PESTAÑA ESTACION TERRENA */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
              <div>
                <h2 className="text-2xl font-extrabold text-white">Análisis de Telemetría (Procesado)</h2>
                <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                  {isLive ? (
                    <>
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="text-emerald-400 font-bold">🔴 TRANSMISIÓN EN VIVO (LoRa)</span>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-500">📄 Archivo local:</span>
                      <span className="text-cyan-400 font-mono">{fileName}</span>
                    </>
                  )}
                </p>
              </div>
              <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-md">
                <Upload size={18} className="text-cyan-400"/>
                <span>Cargar Vuelo (CSV)</span>
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="text-slate-400 text-xs font-bold tracking-wider mb-1">ALTITUD MÁXIMA (CALIBRADA)</div>
                <div className="text-3xl font-black text-white">{maxAltitude.toFixed(2)} <span className="text-sm text-slate-500 font-normal">m</span></div>
                <div className="text-xs text-slate-500 mt-2">Calculada vía ecuación barométrica (P0).</div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="text-slate-400 text-xs font-bold tracking-wider mb-1">ACELERACIÓN MÁXIMA (NETA)</div>
                <div className="text-3xl font-black text-white">{maxGForceNet.toFixed(2)} <span className="text-sm text-slate-500 font-normal">g</span></div>
                <div className="text-xs text-slate-500 mt-2">Empuje real (Excluyendo gravedad 1g).</div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="text-slate-400 text-xs font-bold tracking-wider mb-1">TEMPERATURA AHT</div>
                <div className="text-3xl font-black text-white">{currentTemp.toFixed(1)} <span className="text-sm text-slate-500 font-normal">°C</span></div>
                <div className="text-xs text-slate-500 mt-2">Último valor ambiental válido.</div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="text-slate-400 text-xs font-bold tracking-wider mb-1">DURACIÓN DEL VUELO</div>
                <div className="text-3xl font-black text-white">{totalTime} <span className="text-sm text-slate-500 font-normal">s</span></div>
                <div className="text-xs text-slate-500 mt-2">Tiempo normalizado (T0 = 0s).</div>
              </div>
            </div>

            <h3 className="text-xl font-bold mt-10 border-b border-slate-800 pb-2 text-white">Evolución del vuelo</h3>
            <div className="grid lg:grid-cols-2 gap-6">
              
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col shadow-lg">
                <h4 className="font-bold text-slate-300 mb-4 text-center">Altitud calculada vs. tiempo</h4>
                <div className="h-64 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flightData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 12}} tickFormatter={(t) => Math.round(t)} />
                      <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                      <Line type="step" dataKey="altitude" name="Altitud (m)" stroke="#06b6d4" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-4 px-4 bg-slate-950 py-2 rounded-lg border border-cyan-900/30">
                  <span>Max: {maxAltitude.toFixed(1)} m</span>
                  <span>Min: {minAltitude.toFixed(1)} m</span>
                  <span>Variación: {(maxAltitude - minAltitude).toFixed(1)} m</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
                <h4 className="font-bold text-slate-300 mb-4 text-center">Aceleración del sistema (Cruda)</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flightData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 12}} tickFormatter={(t) => Math.round(t)} />
                      <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Legend verticalAlign="top" height={36}/>
                      <Line type="step" dataKey="ax" name="Eje X" stroke="#06b6d4" strokeWidth={2} dot={false} />
                      <Line type="step" dataKey="ay" name="Eje Y" stroke="#a855f7" strokeWidth={2} dot={false} />
                      <Line type="step" dataKey="az" name="Eje Z" stroke="#fb7185" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
                <h4 className="font-bold text-slate-300 mb-4 text-center">Rotación del cohete (°/s)</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flightData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 12}} tickFormatter={(t) => Math.round(t)} />
                      <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Legend verticalAlign="top" height={36}/>
                      <Line type="linear" dataKey="gx" name="gx_dps" stroke="#06b6d4" strokeWidth={2} dot={false} />
                      <Line type="linear" dataKey="gy" name="gy_dps" stroke="#a855f7" strokeWidth={2} dot={false} />
                      <Line type="linear" dataKey="gz" name="gz_dps" stroke="#fb7185" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col shadow-lg">
                <h4 className="font-bold text-slate-300 mb-4 text-center">Presión atmosférica cruda (hPa)</h4>
                <div className="h-64 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flightData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 12}} tickFormatter={(t) => Math.round(t)} />
                      <YAxis domain={['auto', 'auto']} stroke="#94a3b8" tick={{fontSize: 12}} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Line type="linear" dataKey="pressure" name="Presión (hPa)" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center text-xs text-slate-400 mt-4 px-4 bg-slate-950 py-2 rounded-lg border border-emerald-900/30">
                  <span>Delta (Variación original): {(startPressure - endPressure).toFixed(2)} hPa</span>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold mt-10 border-b border-slate-800 pb-2 text-white">Orientación y movimiento</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
                <h4 className="font-bold text-slate-300 mb-4 text-center">Roll y Pitch</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flightData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 12}} tickFormatter={(t) => Math.round(t)} />
                      <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Legend verticalAlign="top" height={36}/>
                      <Line type="linear" dataKey="roll" name="Roll (Grados)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="linear" dataKey="pitch" name="Pitch (Grados)" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* MODELO 3D DEL COHETE */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-lg relative overflow-hidden min-h-[350px] w-full">
                
                <div className="absolute top-4 left-4 z-10 text-left pointer-events-none">
                  <h4 className="font-bold text-slate-300 drop-shadow-md">Estimación de Actitud 3D</h4>
                  <p className="text-xs text-emerald-400 mt-1 font-mono drop-shadow-md bg-slate-950/50 px-2 py-1 rounded inline-block">
                    Roll: {(lastRow.roll || 0).toFixed(1)}° | Pitch: {(lastRow.pitch || 0).toFixed(1)}°
                  </p>
                </div>
                
                <RocketCanvas roll={lastRow.roll || 0} pitch={lastRow.pitch || 0} />
                
                <div className="absolute bottom-4 w-full text-center z-10 pointer-events-none">
                  <p className="text-xs text-slate-400 bg-slate-950/60 px-4 py-1.5 rounded-full inline-block backdrop-blur-sm border border-slate-700">
                    Arrastra para rotar. Scroll para zoom.
                  </p>
                </div>
              </div>
            </div> {/* <-- AQUÍ ESTÁ EL DIV QUE FALTABA PARA CERRAR EL GRID */}

            {/* NUEVA SECCIÓN: RASTREO Y RECUPERACIÓN GPS */}
            <h3 className="text-xl font-bold mt-10 border-b border-slate-800 pb-2 text-emerald-400">Rastreo y Recuperación (GPS)</h3>
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg">
              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Panel de Datos GPS */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2">
                       Coordenadas de Aterrizaje
                    </h4>
                    <div className="space-y-3 text-sm mb-4">
                      <div className="flex justify-between bg-slate-950 p-3 rounded border border-slate-800">
                        <span className="text-slate-400">Latitud</span>
                        <span className="font-mono text-cyan-400 font-bold">
                          {lastRow.lat !== 0 ? (lastRow.lat).toFixed(6) : 'Buscando...'}
                        </span>
                      </div>
                      <div className="flex justify-between bg-slate-950 p-3 rounded border border-slate-800">
                        <span className="text-slate-400">Longitud</span>
                        <span className="font-mono text-cyan-400 font-bold">
                          {lastRow.lon !== 0 ? (lastRow.lon).toFixed(6) : 'Buscando...'}
                        </span>
                      </div>
                      <div className="flex justify-between bg-slate-950 p-3 rounded border border-slate-800">
                        <span className="text-slate-400">Satélites en Fix (SATS)</span>
                        <span className={`font-mono font-bold ${lastRow.sats > 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                          {lastRow.sats || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón de Emergencia para abrir en el celular */}
                  {lastRow.lat !== 0 && lastRow.lon !== 0 ? (
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${lastRow.lat},${lastRow.lon}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="block w-full bg-emerald-600 hover:bg-emerald-500 text-white text-center py-3 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-900/20"
                    >
                      📍 Abrir en Google Maps (Celular)
                    </a>
                  ) : (
                    <button disabled className="block w-full bg-slate-800 text-slate-500 text-center py-3 rounded-xl font-bold cursor-not-allowed border border-slate-700">
                      Esperando conexión satelital...
                    </button>
                  )}
                </div>
                
                {/* Visualizador del Mapa Satelital */}
                <div className="flex-[2] h-[350px] bg-slate-950 rounded-xl overflow-hidden border border-slate-700 relative shadow-inner">
                  {lastRow.lat !== 0 && lastRow.lon !== 0 ? (
                    <iframe 
                      title="Mapa de Recuperación"
                      width="100%" height="100%" style={{ border: 0 }}
                      loading="lazy" allowFullScreen 
                      src={`https://maps.google.com/maps?q=${lastRow.lat},${lastRow.lon}&t=k&z=18&output=embed`}
                    ></iframe>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                      <p className="font-medium">El radar está inactivo.</p>
                      <p className="text-xs mt-1">El mapa aparecerá cuando el módulo GPS obtenga coordenadas válidas.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold mt-10 border-b border-slate-800 pb-2 text-purple-400">Diagnóstico del sistema</h3>
            <div className="grid md:grid-cols-4 gap-6">
              
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
                <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><Thermometer size={16}/> Temperatura y Humedad</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between bg-slate-950 p-2.5 rounded">
                    <span className="text-slate-400">Temperatura AHT</span> <span className="font-mono">{currentTemp.toFixed(2)} °C</span>
                  </div>
                  <div className="flex justify-between bg-slate-950 p-2.5 rounded">
                    <span className="text-slate-400">Temperatura BMP</span> <span className="font-mono">{(lastRow.tempBMP || 0).toFixed(2)} °C</span>
                  </div>
                  <div className="flex justify-between bg-slate-950 p-2.5 rounded border border-orange-500/20">
                    <span className="text-slate-400">Diferencia (Error)</span> <span className="text-orange-400 font-mono">{Math.abs(currentTemp - (lastRow.tempBMP || 0)).toFixed(2)} °C</span>
                  </div>
                  <div className="flex justify-between bg-slate-950 p-2.5 rounded">
                    <span className="text-slate-400">Humedad Relativa</span> <span className="text-cyan-400 font-mono">{(lastRow.humidity || 0).toFixed(1)} %</span>
                  </div>
                </div>
              </div>

              {/* TARJETA DE CALIDAD DEL AIRE */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
                <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><Wind size={16}/> Calidad del Aire</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between bg-slate-950 p-2.5 rounded">
                    <span className="text-slate-400">eCO2 (Dióxido)</span> 
                    <span className="text-emerald-400 font-mono">{lastRow.eco2 || 0} ppm</span>
                  </div>
                  <div className="flex justify-between bg-slate-950 p-2.5 rounded">
                    <span className="text-slate-400">TVOC (Orgánicos)</span> 
                    <span className="text-emerald-400 font-mono">{lastRow.tvoc || 0} ppb</span>
                  </div>
                  <div className="flex justify-between bg-slate-950 p-2.5 rounded border-t border-slate-800 mt-2 pt-3">
                    <span className="text-slate-400">Vibración</span> 
                    {(lastRow.vib || 0) > 0 ? (
                      <span className="text-orange-400 font-bold">¡ALERTA DE SHOCK!</span>
                    ) : (
                      <span className="text-emerald-400">Normal</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col shadow-lg">
                <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><Battery size={16}/> Energía y Enlace</h4>
                <div className="h-24 mb-4 bg-slate-950 rounded-lg p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flightData}>
                      <XAxis dataKey="time" hide />
                      <YAxis domain={['auto', 'auto']} hide />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Line type="linear" dataKey="vbat" name="Batería (V)" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="text-center text-xs text-slate-500 font-mono border-t border-slate-800 pt-1">Vbat: {(lastRow.vbat || 0).toFixed(3)} V</div>
                </div>
                <div className="h-24 bg-slate-950 rounded-lg p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flightData}>
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Line type="linear" dataKey="rssi" name="RSSI (dBm)" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
                      <Line type="linear" dataKey="snr" name="SNR (dB)" stroke="#a855f7" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="text-center text-xs text-slate-500 font-mono border-t border-slate-800 pt-1">Perdidos: <span className="text-orange-400 font-bold">{lastRow.perdidos || 0}</span></div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
                <h4 className="font-bold text-slate-300 mb-4">Estado de los sensores</h4>
                <ul className="space-y-3 text-sm font-medium">
                  <li className="flex items-center justify-between"><span className="text-slate-400">Temp / Humedad</span> <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={16}/> Lecturas disponibles</span></li>
                  <li className="flex items-center justify-between"><span className="text-slate-400">Barómetro</span> <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={16}/> Lecturas disponibles</span></li>
                  <li className="flex items-center justify-between"><span className="text-slate-400">Acelerómetro</span> <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={16}/> Lecturas disponibles</span></li>
                  <li className="flex items-center justify-between"><span className="text-slate-400">Giroscopio</span> <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={16}/> Lecturas disponibles</span></li>
                  <li className="flex items-center justify-between"><span className="text-slate-400">Magnetómetro</span> 
                    {magWorks ? <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={16}/> Lecturas disponibles</span> : <span className="flex items-center gap-1 text-orange-400"><AlertCircle size={16}/> Requiere revisión</span>}
                  </li>
                  <li className="flex items-center justify-between"><span className="text-slate-400">GPS</span> 
                    {gpsWorks ? <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={16}/> Fix válido</span> : <span className="flex items-center gap-1 text-red-400"><AlertCircle size={16}/> Sin posicionamiento</span>}
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <button onClick={() => setShowTable(!showTable)} className="w-full flex items-center justify-between p-4 bg-slate-800 rounded-xl font-bold text-slate-300 hover:bg-slate-700 transition-colors shadow-lg">
                <span>Explorar registros de datos</span>
                {showTable ? <ChevronUp /> : <ChevronDown />}
              </button>
              
              {showTable && (
                <div className="mt-2 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto max-h-96 shadow-inner">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs uppercase bg-slate-950 text-slate-400 sticky top-0">
                      <tr>
                        <th className="p-3 font-bold">Tiempo (s)</th>
                        <th className="p-3 font-bold">Altitud Rec. (m)</th>
                        <th className="p-3 font-bold">Acel Z (g)</th>
                        <th className="p-3 font-bold">eCO2 (ppm)</th>
                        <th className="p-3 font-bold">TVOC (ppb)</th>
                        <th className="p-3 font-bold">Temp AHT (°C)</th>
                        <th className="p-3 font-bold">Presión (hPa)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {flightData.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-800/50 transition-colors font-mono text-xs">
                          <td className="p-3 text-cyan-400">{row.time}</td>
                          <td className="p-3">{row.altitude.toFixed(2)}</td>
                          <td className="p-3">{row.az.toFixed(3)}</td>
                          <td className="p-3">{row.eco2}</td>
                          <td className="p-3">{row.tvoc}</td>
                          <td className="p-3">{row.tempAHT.toFixed(2)}</td>
                          <td className="p-3">{row.pressure.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
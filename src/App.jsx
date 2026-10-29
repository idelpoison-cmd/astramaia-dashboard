import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Rocket, Activity, Wind, Thermometer, Globe, Upload, Star, Crosshair, Map, Users, Shield, Cpu, PenTool, Calculator, Laptop, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Battery, Wifi } from 'lucide-react';
import Papa from 'papaparse';

// Datos simulados iniciales (mientras no se suba un archivo)
const mockFlightData = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  altitude: i < 15 ? 30 * i * (1 - i/30) : 450 - (i - 15) * 15,
  pressure: 750 - (i * 1.2),
  temperatureAHT: 22 - (i * 0.1),
  temperatureBMP: 21.8 - (i * 0.1),
  humidity: 45 + (i * 0.2),
  ax: i === 1 ? 2.5 : i === 16 ? 1.5 : 0.1,
  ay: i === 1 ? 1.5 : i === 16 ? 0.8 : 0.1,
  az: i === 1 ? 4.5 : i === 16 ? -2.5 : 1.0,
  gForce: i === 1 ? 5.3 : i === 16 ? 3.0 : 1.0,
  gx: i * 2,
  gy: i * 1.5,
  gz: i * 0.5,
  roll: i * 5,
  pitch: i < 15 ? 80 : -80,
  vbat: 3.76 - (i * 0.001),
  rssi: -40 - (i * 0.5),
  snr: 13.5 - (i * 0.1),
}));

export default function App() {
  const [activeTab, setActiveTab] = useState('about');
  const [flightData, setFlightData] = useState(mockFlightData);
  const [fileName, setFileName] = useState('Datos Simulados (Sube tu CSV)');
  const [showTable, setShowTable] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedData = results.data.map(row => {
            const ax = row.ax_g || 0;
            const ay = row.ay_g || 0;
            const az = row.az_g || 0;
            return {
              time: row.t_ms ? (row.t_ms / 1000).toFixed(1) : 0,
              altitude: row.alt_rel_m || 0,
              pressure: row.pres_hPa || 0,
              temperatureAHT: row.temp_aht_C || 0,
              temperatureBMP: row.temp_bmp_C || 0,
              humidity: row.hum_pct || 0,
              ax: ax,
              ay: ay,
              az: az,
              gForce: Math.sqrt(ax*ax + ay*ay + az*az) || 0,
              gx: row.gx_dps || 0,
              gy: row.gy_dps || 0,
              gz: row.gz_dps || 0,
              roll: row.roll_deg || 0,
              pitch: row.pitch_deg || 0,
              vbat: row.vbat_V || 0,
              rssi: row.rssi_dBm || 0,
              snr: row.snr_dB || 0,
            };
          });
          setFlightData(parsedData);
        }
      });
    }
  };

  // Cálculos de Resumen
  const maxAltitude = Math.max(...flightData.map(d => d.altitude));
  const minAltitude = Math.min(...flightData.map(d => d.altitude));
  const maxGForce = Math.max(...flightData.map(d => d.gForce)).toFixed(1);
  const currentTemp = flightData.length > 0 ? flightData[flightData.length - 1].temperatureAHT.toFixed(1) : 0;
  const totalTime = flightData.length > 0 ? flightData[flightData.length - 1].time : 0;
  const deltaPresion = flightData.length > 0 ? (flightData[0].pressure - flightData[flightData.length - 1].pressure).toFixed(2) : 0;

  // Renderizador de Tabla
  const renderTableRows = () => {
    return flightData.map((row, index) => (
      <tr key={index} className="border-b border-slate-800 hover:bg-slate-800/50">
        <td className="p-3">{row.time}</td>
        <td className="p-3">{row.altitude.toFixed(2)}</td>
        <td className="p-3">{row.ax.toFixed(3)}</td>
        <td className="p-3">{row.ay.toFixed(3)}</td>
        <td className="p-3">{row.az.toFixed(3)}</td>
        <td className="p-3">{row.temperatureAHT.toFixed(2)}</td>
        <td className="p-3">{row.pressure.toFixed(2)}</td>
      </tr>
    ));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30">
      {/* NAVEGACIÓN */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <img src="/parche.jpg" alt="Logo AstraMaia" className="w-14 h-14 object-contain rounded-full drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
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
        {activeTab === 'about' ? (
          /* PESTAÑA: QUIÉNES SOMOS */
          <div className="space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            
            {/* Introducción y Pléyades */}
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

            {/* El Parche de Misión */}
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
                    <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400"><Map size={24} /></div>
                    <p><strong>Colores y Raíces:</strong> El morado destaca la unión y fuerza del equipo; los tonos azules evocan la tecnología y el espacio. Las montañas andinas y el mapa de Colombia plasman nuestro origen.</p>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2 flex justify-center">
                <img src="/parche.jpg" alt="Parche AstraMaia" className="w-full max-w-md drop-shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:scale-105 transition-transform duration-500" />
              </div>
            </div>

            {/* El Equipo */}
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

            {/* El Cohete Huitaca */}
            <div className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800">
              <h3 className="text-4xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Vehículo de Lanzamiento: Huitaca
              </h3>
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner">
                    <img src="/cad.png" alt="Render 3D Cohete" className="w-full rounded-xl object-contain h-64" />
                  </div>
                  <p className="text-center text-slate-400 font-medium">Renderizado 3D del diseño final</p>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner">
                    <img src="/planos.png" alt="Planos del Cohete" className="w-full rounded-xl object-contain h-64 bg-slate-200/5 p-2" />
                  </div>
                  <p className="text-center text-slate-400 font-medium">
                    103 cm de largo total, cuerpo de Fibra de Carbono, aletas de MDF y ojiva de ABS.
                  </p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* PESTAÑA: ESTACIÓN TERRENA Y DIAGNÓSTICO */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            
            {/* Header de Carga */}
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-white">Estación Terrena en Vivo</h2>
                  <p className="text-slate-400 text-sm mt-2 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    Enlace LoRa (433 MHz) | Archivo: <span className="text-cyan-400 font-mono">{fileName}</span>
                  </p>
                </div>
                
                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-6 py-3 rounded-xl flex items-center gap-3 font-bold transition-all">
                  <Upload size={20} className="text-cyan-400"/>
                  <span>Cargar Datos (CSV)</span>
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            {/* 1. INDICADORES PRINCIPALES */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="text-slate-400 text-sm mb-1 font-bold">ALTITUD MÁXIMA</div>
                <div className="text-3xl font-black text-white">{maxAltitude.toFixed(2)} <span className="text-base text-slate-500 font-normal">m</span></div>
                <div className="text-xs text-slate-500 mt-2">Máximo registrado en el archivo.</div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="text-slate-400 text-sm mb-1 font-bold">ACELERACIÓN MÁXIMA</div>
                <div className="text-3xl font-black text-white">{maxGForce} <span className="text-base text-slate-500 font-normal">g</span></div>
                <div className="text-xs text-slate-500 mt-2">Magnitud de aceleración calculada.</div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="text-slate-400 text-sm mb-1 font-bold">TEMPERATURA</div>
                <div className="text-3xl font-black text-white">{currentTemp} <span className="text-base text-slate-500 font-normal">°C</span></div>
                <div className="text-xs text-slate-500 mt-2">Último valor válido registrado.</div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                <div className="text-slate-400 text-sm mb-1 font-bold">DURACIÓN REGISTRO</div>
                <div className="text-3xl font-black text-white">{totalTime} <span className="text-base text-slate-500 font-normal">s</span></div>
                <div className="text-xs text-slate-500 mt-2">Tiempo total de recolección de datos.</div>
              </div>
            </div>

            {/* 2. EVOLUCIÓN DEL VUELO (GRÁFICAS) */}
            <h3 className="text-2xl font-bold mt-10 mb-4 border-b border-slate-800 pb-2">Evolución del Vuelo</h3>
            <div className="grid lg:grid-cols-2 gap-6">
              
              {/* Gráfica 1: Altitud */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h4 className="font-bold text-slate-300 mb-4 text-center">Altitud relativa vs. tiempo</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flightData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 12}} />
                      <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Line type="step" dataKey="altitude" stroke="#22d3ee" strokeWidth={2} dot={false} />
                      {/* Referencia de Cero */}
                      <Line type="monotone" dataKey={() => 0} stroke="#475569" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-4 px-4">
                  <span>Max: {maxAltitude.toFixed(1)}m</span>
                  <span>Min: {minAltitude.toFixed(1)}m</span>
                  <span>Var: {(maxAltitude - minAltitude).toFixed(1)}m</span>
                </div>
              </div>

              {/* Gráfica 2: Aceleración */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h4 className="font-bold text-slate-300 mb-4 text-center">Aceleración del sistema (g)</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flightData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 12}} />
                      <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Line type="linear" dataKey="ax" name="Eje X" stroke="#22d3ee" strokeWidth={2} dot={false} />
                      <Line type="linear" dataKey="ay" name="Eje Y" stroke="#a855f7" strokeWidth={2} dot={false} />
                      <Line type="linear" dataKey="az" name="Eje Z" stroke="#fb7185" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfica 3: Giroscopio */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h4 className="font-bold text-slate-300 mb-4 text-center">Rotación del cohete (°/s)</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flightData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 12}} />
                      <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Line type="linear" dataKey="gx" name="Roll (gx)" stroke="#22d3ee" strokeWidth={1} dot={false} />
                      <Line type="linear" dataKey="gy" name="Pitch (gy)" stroke="#a855f7" strokeWidth={1} dot={false} />
                      <Line type="linear" dataKey="gz" name="Yaw (gz)" stroke="#fb7185" strokeWidth={1} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfica 4: Presión */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col">
                <h4 className="font-bold text-slate-300 mb-4 text-center">Evolución de la presión atmosférica (hPa)</h4>
                <div className="h-64 flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flightData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 12}} />
                      <YAxis domain={['auto', 'auto']} stroke="#94a3b8" tick={{fontSize: 12}} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Line type="linear" dataKey="pressure" name="Presión" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-2 text-xs text-slate-400 bg-slate-950 py-1 rounded">
                  Variación total: {deltaPresion} hPa
                </div>
              </div>

            </div>

            {/* 3. ORIENTACIÓN Y MOVIMIENTO */}
            <h3 className="text-2xl font-bold mt-10 mb-4 border-b border-slate-800 pb-2">Orientación y movimiento</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h4 className="font-bold text-slate-300 mb-4 text-center">Roll y Pitch (Grados)</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flightData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" tick={{fontSize: 12}} />
                      <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Line type="linear" dataKey="roll" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="linear" dataKey="pitch" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center">
                <Rocket size={80} className="text-slate-600 mb-4 rotate-45" />
                <h4 className="font-bold text-slate-300">Modelo Tridimensional</h4>
                <p className="text-sm text-slate-500 mt-2 max-w-xs">
                  (Representación visual del cohete). Animación estimativa basada en Roll y Pitch. No representa la orientación tridimensional completa debido a la falta de datos del Magnetómetro (Yaw).
                </p>
              </div>
            </div>

            {/* 4. DIAGNÓSTICO DEL SISTEMA */}
            <h3 className="text-2xl font-bold mt-10 mb-4 border-b border-slate-800 pb-2 text-purple-400">Diagnóstico del Sistema</h3>
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Salud de Sensores / Temperatura */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><Thermometer size={16}/> Temperatura y Humedad</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between bg-slate-950 p-2 rounded">
                    <span className="text-slate-400">Temp AHT:</span> <span>{currentTemp} °C</span>
                  </div>
                  <div className="flex justify-between bg-slate-950 p-2 rounded">
                    <span className="text-slate-400">Temp BMP:</span> <span>{(flightData.length > 0 ? flightData[flightData.length-1].temperatureBMP : 0).toFixed(1)} °C</span>
                  </div>
                  <div className="flex justify-between bg-slate-950 p-2 rounded">
                    <span className="text-slate-400">Diferencia (Error):</span> <span className="text-orange-400">{Math.abs(currentTemp - (flightData.length > 0 ? flightData[flightData.length-1].temperatureBMP : 0)).toFixed(2)} °C</span>
                  </div>
                  <div className="flex justify-between bg-slate-950 p-2 rounded border border-cyan-900/30">
                    <span className="text-slate-400">Humedad Relativa:</span> <span className="text-cyan-400">{(flightData.length > 0 ? flightData[flightData.length-1].humidity : 0).toFixed(1)} %</span>
                  </div>
                </div>
              </div>

              {/* Batería y Comunicación */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h4 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><Battery size={16}/> Energía y Enlace <Wifi size={16}/></h4>
                <div className="h-24 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flightData}>
                      <YAxis domain={['auto', 'auto']} hide />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Line type="linear" dataKey="vbat" name="Voltaje (V)" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="text-center text-xs text-slate-500 mt-1">Voltaje Batería (V)</div>
                </div>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flightData}>
                      <YAxis hide />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                      <Line type="linear" dataKey="rssi" name="RSSI" stroke="#3b82f6" strokeWidth={1} dot={false} />
                      <Line type="linear" dataKey="snr" name="SNR" stroke="#a855f7" strokeWidth={1} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="text-center text-xs text-slate-500 mt-1">RSSI (Azul) / SNR (Morado)</div>
                </div>
              </div>

              {/* Matriz de Estado */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h4 className="font-bold text-slate-300 mb-4">Estado de los sensores</h4>
                <ul className="space-y-3 text-sm font-medium">
                  <li className="flex items-center justify-between"><span className="text-slate-400">Temp / Humedad</span> <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={16}/> Disponibles</span></li>
                  <li className="flex items-center justify-between"><span className="text-slate-400">Barómetro</span> <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={16}/> Disponibles</span></li>
                  <li className="flex items-center justify-between"><span className="text-slate-400">Acelerómetro</span> <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={16}/> Disponibles</span></li>
                  <li className="flex items-center justify-between"><span className="text-slate-400">Giroscopio</span> <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={16}/> Disponibles</span></li>
                  <li className="flex items-center justify-between"><span className="text-slate-400">Magnetómetro</span> <span className="flex items-center gap-1 text-orange-400"><AlertCircle size={16}/> Revisar (0)</span></li>
                  <li className="flex items-center justify-between"><span className="text-slate-400">GPS</span> <span className="flex items-center gap-1 text-red-400"><AlertCircle size={16}/> Sin Fix Válido</span></li>
                </ul>
              </div>

            </div>

            {/* 5. EXPLORAR REGISTROS (TABLA) */}
            <div className="mt-10">
              <button 
                onClick={() => setShowTable(!showTable)}
                className="w-full flex items-center justify-between p-4 bg-slate-800 rounded-xl font-bold text-slate-300 hover:bg-slate-700 transition-colors"
              >
                <span>Explorar Registros de Datos</span>
                {showTable ? <ChevronUp /> : <ChevronDown />}
              </button>
              
              {showTable && (
                <div className="mt-4 bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto max-h-96">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs uppercase bg-slate-950 text-slate-400 sticky top-0">
                      <tr>
                        <th className="p-3 font-bold">Tiempo (s)</th>
                        <th className="p-3 font-bold">Altitud (m)</th>
                        <th className="p-3 font-bold">Acel X (g)</th>
                        <th className="p-3 font-bold">Acel Y (g)</th>
                        <th className="p-3 font-bold">Acel Z (g)</th>
                        <th className="p-3 font-bold">Temp (°C)</th>
                        <th className="p-3 font-bold">Presión (hPa)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {renderTableRows()}
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
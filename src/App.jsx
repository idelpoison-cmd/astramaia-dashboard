import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Rocket, Activity, Wind, Thermometer, Globe, Upload, Star, Crosshair, Map, Users, Shield, Cpu, PenTool, Calculator, Laptop } from 'lucide-react';
import Papa from 'papaparse';

// Datos simulados iniciales (mientras no se suba un archivo)
const mockFlightData = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  altitude: i < 15 ? 30 * i * (1 - i/30) : 450 - (i - 15) * 15,
  temperature: 22 - (i * 0.1),
  gForce: i === 1 ? 4.5 : i === 16 ? 2.5 : 1 + (Math.random() * 0.2 - 0.1),
}));

export default function App() {
  const [activeTab, setActiveTab] = useState('about');
  const [flightData, setFlightData] = useState(mockFlightData);
  const [fileName, setFileName] = useState('Datos Simulados (Sube tu CSV)');

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
              temperature: row.temp_bmp_C || 0,
              gForce: Math.sqrt(ax*ax + ay*ay + az*az) || 0,
            };
          });
          setFlightData(parsedData);
        }
      });
    }
  };

  const maxAltitude = Math.max(...flightData.map(d => d.altitude)).toFixed(1);
  const maxGForce = Math.max(...flightData.map(d => d.gForce)).toFixed(1);
  const minTemp = Math.min(...flightData.map(d => d.temperature)).toFixed(1);
  const totalTime = flightData.length > 0 ? flightData[flightData.length - 1].time : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30">
      {/* Navegación */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              {/* Logo Oficial en la barra superior */}
              <img src="/parche.png" alt="Logo AstraMaia" className="w-14 h-14 object-contain rounded-full drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]" />
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
          <div className="space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            
            {/* SECCIÓN 1: INTRODUCCIÓN Y PLÉYADES */}
            <div className="relative py-20 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl">
              <div className="absolute inset-0 bg-[url('/pleiades.jpg')] bg-cover bg-center opacity-40 mix-blend-screen"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
              <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
                <h1 className="text-5xl font-extrabold mb-4 text-white drop-shadow-lg">Proyecto CanSat AstraMaia</h1>
                <h2 className="text-2xl font-bold mb-8 text-cyan-400">Equipo 318 - ACMA (Universidad Distrital)</h2>
                <p className="text-slate-200 text-lg mb-10 leading-relaxed font-medium bg-slate-950/50 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                  El nombre Astra Maia rinde homenaje a la figura femenina muisca vinculada a la Luna (Huitaca), integrando la ciencia que hacemos con nuestras raíces ancestrales. Somos un equipo interdisciplinario de siete mujeres apasionadas por la tecnología espacial, representadas como las siete estrellas de las Pléyades.
                </p>
                {/* Foto del Equipo */}
                <img src="/equipo.jpg" alt="Equipo AstraMaia" className="w-full max-w-3xl mx-auto rounded-2xl border-2 border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)] object-cover" />
              </div>
            </div>

            {/* SECCIÓN 2: EL PARCHE DE MISIÓN */}
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
                <img src="/parche.png" alt="Parche AstraMaia" className="w-full max-w-md drop-shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:scale-105 transition-transform duration-500" />
              </div>
            </div>

            {/* SECCIÓN 3: EL EQUIPO */}
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

            {/* SECCIÓN 4: EL COHETE HUITACA */}
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
          /* SECCIÓN TELEMETRÍA (ESTACIÓN TERRENA) */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-white">Estación Terrena en Vivo</h2>
                  <p className="text-slate-400 text-sm mt-2 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    Enlace LoRa (433 MHz) Activo | Archivo: <span className="text-cyan-400 font-mono">{fileName}</span>
                  </p>
                </div>
                
                <label className="cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl flex items-center gap-3 font-bold shadow-lg shadow-cyan-900/20 transition-all hover:scale-105">
                  <Upload size={20} />
                  <span>Cargar Datos (CSV)</span>
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            </div>

            {/* Tarjetas de Resumen */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
                <div className="text-slate-400 text-sm mb-2 flex items-center gap-2"><Rocket size={18} className="text-cyan-400"/> Apogeo Max</div>
                <div className="text-3xl font-black text-white">{maxAltitude} <span className="text-base text-slate-500 font-normal">m</span></div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
                <div className="text-slate-400 text-sm mb-2 flex items-center gap-2"><Wind size={18} className="text-purple-400"/> Fuerza G Max</div>
                <div className="text-3xl font-black text-white">{maxGForce} <span className="text-base text-slate-500 font-normal">G</span></div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
                <div className="text-slate-400 text-sm mb-2 flex items-center gap-2"><Thermometer size={18} className="text-orange-400"/> Temp. Mínima</div>
                <div className="text-3xl font-black text-white">{minTemp} <span className="text-base text-slate-500 font-normal">°C</span></div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
                <div className="text-slate-400 text-sm mb-2 flex items-center gap-2"><Activity size={18} className="text-emerald-400"/> Tiempo Vuelo</div>
                <div className="text-3xl font-black text-white">{totalTime} <span className="text-base text-slate-500 font-normal">s</span></div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
                <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2"><Rocket className="text-cyan-400"/> Perfil de Altitud</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={flightData}>
                      <defs>
                        <linearGradient id="colorAlt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickMargin={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }} />
                      <Area type="monotone" dataKey="altitude" name="Altitud (m)" stroke="#22d3ee" strokeWidth={4} fillOpacity={1} fill="url(#colorAlt)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg">
                <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2"><Wind className="text-purple-400"/> Fuerzas Inerciales (G)</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flightData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickMargin={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem' }} itemStyle={{ color: '#c084fc', fontWeight: 'bold' }} />
                      <Line type="monotone" dataKey="gForce" name="Fuerza G" stroke="#c084fc" strokeWidth={4} dot={false} activeDot={{ r: 6, fill: '#c084fc' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
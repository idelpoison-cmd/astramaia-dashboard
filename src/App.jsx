import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Rocket, Activity, Wind, Thermometer, Globe, Info, Upload } from 'lucide-react';
import Papa from 'papaparse';

// Datos simulados iniciales (mientras no se suba un archivo)
const mockFlightData = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  altitude: i < 15 ? 30 * i * (1 - i/30) : 450 - (i - 15) * 15,
  temperature: 22 - (i * 0.1),
  gForce: i === 1 ? 4.5 : i === 16 ? 2.5 : 1 + (Math.random() * 0.2 - 0.1),
}));

export default function App() {
  const [activeTab, setActiveTab] = useState('telemetry');
  const [flightData, setFlightData] = useState(mockFlightData);
  const [fileName, setFileName] = useState('Datos Simulados (Sube tu CSV)');

  // Función para procesar el archivo CSV
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      Papa.parse(file, {
        header: true, // Lee la primera fila como nombres de variables
        dynamicTyping: true, // Convierte los números de texto a formato numérico
        skipEmptyLines: true,
        complete: (results) => {
          // Mapeamos las columnas de tu CanSat a las variables del gráfico
          const parsedData = results.data.map(row => {
            // Calcular magnitud de Fuerza G: √(ax² + ay² + az²)
            const ax = row.ax_g || 0;
            const ay = row.ay_g || 0;
            const az = row.az_g || 0;
            const totalGForce = Math.sqrt(ax*ax + ay*ay + az*az);

            return {
              time: row.t_ms ? (row.t_ms / 1000).toFixed(1) : 0, // Convertir ms a segundos
              altitude: row.alt_rel_m || 0,
              temperature: row.temp_bmp_C || 0,
              gForce: totalGForce || 0,
            };
          });
          setFlightData(parsedData);
        }
      });
    }
  };

  // Cálculos automáticos para las tarjetas superiores
  const maxAltitude = Math.max(...flightData.map(d => d.altitude)).toFixed(1);
  const maxGForce = Math.max(...flightData.map(d => d.gForce)).toFixed(1);
  const minTemp = Math.min(...flightData.map(d => d.temperature)).toFixed(1);
  const totalTime = flightData.length > 0 ? flightData[flightData.length - 1].time : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Navegación */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Rocket className="w-8 h-8 text-cyan-400" />
              <span className="font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                ASTRAMAIA
              </span>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('about')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'about' ? 'bg-slate-800 text-cyan-400' : 'hover:bg-slate-800/50 text-slate-300'}`}
              >
                Misión
              </button>
              <button 
                onClick={() => setActiveTab('telemetry')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'telemetry' ? 'bg-slate-800 text-cyan-400' : 'hover:bg-slate-800/50 text-slate-300'}`}
              >
                Telemetría
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'about' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center max-w-3xl mx-auto py-12">
              <h1 className="text-4xl font-extrabold mb-4">Proyecto CanSat AstraMaia</h1>
              <p className="text-slate-400 text-lg">
                Explorando la atmósfera un lanzamiento a la vez. Nuestro objetivo es recolectar datos 
                ambientales precisos y demostrar las capacidades de la ingeniería aeroespacial a escala.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl shadow-cyan-900/10">
                <Globe className="w-10 h-10 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Visión</h3>
                <p className="text-slate-400">Inspirar a la próxima generación de científicos e ingenieros mediante el desarrollo de tecnología espacial accesible y de código abierto.</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl shadow-cyan-900/10">
                <Activity className="w-10 h-10 text-cyan-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Tecnología</h3>
                <p className="text-slate-400">Equipado con sensores de alta precisión para medir temperatura, presión, gases atmosféricos (eCO2, TVOC) y fuerzas inerciales (IMU).</p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl shadow-cyan-900/10">
                <Info className="w-10 h-10 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Datos Abiertos</h3>
                <p className="text-slate-400">Todos los datos recolectados durante nuestros vuelos son procesados y publicados para uso educativo y científico.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Panel de Control de Vuelo</h2>
                <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Archivo actual: <span className="text-cyan-400">{fileName}</span>
                </p>
              </div>
              
              {/* Botón para subir archivo */}
              <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Upload size={18} className="text-cyan-400" />
                <span>Cargar Vuelo (CSV)</span>
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            {/* Tarjetas de Resumen */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="text-slate-400 text-sm mb-1 flex items-center gap-2"><Rocket size={16}/> Altitud Max</div>
                <div className="text-2xl font-bold text-white">{maxAltitude} <span className="text-sm text-slate-500">m</span></div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="text-slate-400 text-sm mb-1 flex items-center gap-2"><Wind size={16}/> Fuerza G Max</div>
                <div className="text-2xl font-bold text-white">{maxGForce} <span className="text-sm text-slate-500">G</span></div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="text-slate-400 text-sm mb-1 flex items-center gap-2"><Thermometer size={16}/> Temp. Mínima</div>
                <div className="text-2xl font-bold text-white">{minTemp} <span className="text-sm text-slate-500">°C</span></div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="text-slate-400 text-sm mb-1 flex items-center gap-2"><Activity size={16}/> Tiempo (seg)</div>
                <div className="text-2xl font-bold text-white">{totalTime} <span className="text-sm text-slate-500">s</span></div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-lg font-semibold mb-4 text-slate-300">Perfil de Altitud Relativa</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={flightData}>
                      <defs>
                        <linearGradient id="colorAlt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} itemStyle={{ color: '#22d3ee' }} />
                      <Area type="monotone" dataKey="altitude" name="Altitud (m)" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorAlt)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-lg font-semibold mb-4 text-slate-300">Fuerzas Inerciales Totales (G)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flightData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} itemStyle={{ color: '#f43f5e' }} />
                      <Line type="monotone" dataKey="gForce" name="Fuerza G" stroke="#f43f5e" strokeWidth={3} dot={false} />
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
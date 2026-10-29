import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Rocket, Activity, Wind, Thermometer, Globe, Info } from 'lucide-react';

// Datos simulados del vuelo del CanSat AstraMaia
const mockFlightData = Array.from({ length: 30 }, (_, i) => ({
  time: i,
  altitude: i < 15 ? 30 * i * (1 - i/30) : 450 - (i - 15) * 15, // Parábola de subida y descenso en paracaídas
  temperature: 22 - (i * 0.1), // Baja la temperatura al subir
  gForce: i === 1 ? 4.5 : i === 16 ? 2.5 : 1 + (Math.random() * 0.2 - 0.1), // Picos en despegue y apertura de paracaídas
  pressure: 750 - (i * 1.2),
}));

export default function App() {
  const [activeTab, setActiveTab] = useState('telemetry');

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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Panel de Control de Vuelo</h2>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-medium animate-pulse">
                Estado: Analizando Datos
              </span>
            </div>

            {/* Tarjetas de Resumen */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="text-slate-400 text-sm mb-1 flex items-center gap-2"><Rocket size={16}/> Altitud Max</div>
                <div className="text-2xl font-bold text-white">450.0 <span className="text-sm text-slate-500">m</span></div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="text-slate-400 text-sm mb-1 flex items-center gap-2"><Wind size={16}/> Fuerza G Max</div>
                <div className="text-2xl font-bold text-white">4.5 <span className="text-sm text-slate-500">G</span></div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="text-slate-400 text-sm mb-1 flex items-center gap-2"><Thermometer size={16}/> Temp. Mínima</div>
                <div className="text-2xl font-bold text-white">19.1 <span className="text-sm text-slate-500">°C</span></div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <div className="text-slate-400 text-sm mb-1 flex items-center gap-2"><Activity size={16}/> Tiempo de Vuelo</div>
                <div className="text-2xl font-bold text-white">30.0 <span className="text-sm text-slate-500">s</span></div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-lg font-semibold mb-4 text-slate-300">Perfil de Altitud</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockFlightData}>
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
                <h3 className="text-lg font-semibold mb-4 text-slate-300">Fuerzas Inerciales (Aceleración)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockFlightData}>
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
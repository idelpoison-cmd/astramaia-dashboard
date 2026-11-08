import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

function Rocket({ roll, pitch }) {
  const meshRef = useRef();

  // 1. DIBUJAR LA FORMA EXACTA DE LAS ALETAS (Swept Fins)
  const finShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 1.5);    // Borde superior (pegado al tubo)
    shape.lineTo(1.8, 0);    // Punta superior exterior
    shape.lineTo(1.8, -1.0); // Punta inferior exterior
    shape.lineTo(0, -1.5);   // Borde inferior (pegado al tubo)
    return shape;
  }, []);

  const extrudeSettings = { 
    depth: 0.04, 
    bevelEnabled: true, 
    bevelSegments: 2, 
    steps: 1, 
    bevelSize: 0.02, 
    bevelThickness: 0.02 
  };

  // 2. ANIMACIÓN EN TIEMPO REAL
  useFrame(() => {
    if (meshRef.current) {
      // Pitch: inclina el cohete (nariz arriba/abajo)
      meshRef.current.rotation.x = (pitch || 0) * (Math.PI / 180);
      // Roll: lo hace girar sobre su propio eje vertical (giro cilíndrico)
      meshRef.current.rotation.y = -(roll || 0) * (Math.PI / 180);
    }
  });

  const rocketColor = "#2563eb"; // Azul rey clásico de AstraMaia

  return (
    <group ref={meshRef}>
      
      {/* --- OJIVA / NARIZ (Nose Cone) --- */}
      <mesh position={[0, 5, 0]}>
        <coneGeometry args={[0.35, 2, 32]} />
        <meshStandardMaterial color={rocketColor} roughness={0.3} metalness={0.2}/>
      </mesh>

      {/* --- FUSELAJE SUPERIOR (Sólido) --- */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 2, 32]} />
        <meshStandardMaterial color={rocketColor} roughness={0.3} metalness={0.2}/>
      </mesh>

      {/* --- BAHÍA DE CARGA ÚTIL (Material Transparente Tipo Rayos X) --- */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 3.5, 32]} />
        <meshStandardMaterial 
          color={rocketColor} 
          transparent={true} 
          opacity={0.3} 
          roughness={0.1} 
          metalness={0.5}
        />
      </mesh>

      {/* === COMPONENTES INTERNOS CANSAT === */}
      {/* Paracaídas / Carga Superior (Gris Oscuro) */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 1, 32]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {/* Módulo de Aviónica (Rosado/Fucsia) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 1.2, 32]} />
        <meshStandardMaterial color="#db2777" />
      </mesh>
      {/* Baterías / Módulo Inferior (Rojo) */}
      <mesh position={[0, -1.0, 0]}>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      {/* =================================== */}

      {/* --- FUSELAJE INFERIOR (Motor y Aletas) --- */}
      <mesh position={[0, -2.75, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 2.5, 32]} />
        <meshStandardMaterial color={rocketColor} roughness={0.3} metalness={0.2}/>
      </mesh>

      {/* --- ALETAS DIRECTRICES (3 Aletas a 120° de separación) --- */}
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, index) => (
        <group key={index} rotation={[0, angle, 0]} position={[0, -3.2, 0]}>
          <mesh position={[0.32, 0, -0.02]}> 
            <extrudeGeometry args={[finShape, extrudeSettings]} />
            <meshStandardMaterial color={rocketColor} roughness={0.3} metalness={0.2}/>
          </mesh>
        </group>
      ))}

      {/* --- TOBERA DEL MOTOR (Gris Oscuro) --- */}
      <mesh position={[0, -4.15, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 0.3, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

    </group>
  );
}

export default function RocketCanvas({ roll, pitch }) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '350px', position: 'relative' }}>
      {/* Alejamos un poco la cámara (Z: 14) porque el cohete Huitaca es muy alto */}
      <Canvas camera={{ position: [0, 0, 14], fov: 45 }}>
        <color attach="background" args={['#0f172a']} />
        
        {/* Iluminación tipo "estudio" para resaltar los materiales */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        <directionalLight position={[-10, 5, -10]} intensity={0.5} />
        
        <Rocket roll={roll} pitch={pitch} />
        
        {/* Cuadrícula base (El suelo de lanzamiento) */}
        <Grid args={[30, 30]} position={[0, -5, 0]} cellColor="#334155" sectionColor="#475569" />
        
        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>
    </div>
  );
}
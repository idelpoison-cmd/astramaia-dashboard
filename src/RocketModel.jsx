import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

function Rocket({ roll, pitch }) {
  const meshRef = useRef();

  // 1. FORMA MILIMÉTRICA DE LAS ALETAS (Basado en la regla de OpenRocket)
  const finShape = useMemo(() => {
    const shape = new THREE.Shape();
    // Las coordenadas "Y" se mapearon usando la regla del plano: Y = 5.21 - (cm / 10)
    shape.moveTo(0.34, -1.89);       // Raíz superior (Empieza en 71 cm)
    shape.lineTo(1.10, -3.09);       // Punta superior exterior (Empieza en 83 cm)
    shape.lineTo(1.10, -4.19);       // Punta inferior exterior (Termina en 94 cm)
    shape.lineTo(0.34, -3.29);       // Raíz inferior (Termina en 85 cm)
    return shape;
  }, []);

  const extrudeSettings = { 
    depth: 0.03, // Aletas delgadas (3mm a escala)
    bevelEnabled: false 
  };

  // 2. ANIMACIÓN PIVOTANDO EN EL CENTRO DE GRAVEDAD EXACTO (52.1 cm)
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = (pitch || 0) * (Math.PI / 180);
      meshRef.current.rotation.y = -(roll || 0) * (Math.PI / 180);
    }
  });

  // COLORES EXACTOS DE OPENROCKET
  const cBlue = "#2563eb";     // Azul ojiva/aletas
  const cBlack = "#1e293b";    // Paracaídas
  const cPink = "#d946ef";     // Aviónica y Anillos
  const cRed = "#ef4444";      // Cápsula
  const cMotor = "#475569";    // Tubo del motor

  return (
    <group ref={meshRef}>
      
      {/* --- OJIVA (Nose Cone) - 0 a 28 cm --- */}
      <mesh position={[0, 3.81, 0]}>
        <coneGeometry args={[0.35, 2.8, 32]} />
        <meshStandardMaterial color={cBlue} roughness={0.3} metalness={0.2}/>
      </mesh>

      {/* --- TUBO PRINCIPAL (Cuerpo Transparente) - 28 a 85 cm --- */}
      <mesh position={[0, -0.44, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 5.7, 32]} />
        <meshStandardMaterial 
          color={cBlue} 
          transparent={true} 
          opacity={0.15} 
          roughness={0.1} 
          metalness={0.5}
        />
      </mesh>

      {/* === COMPONENTES INTERNOS (Mapeados desde el plano) === */}
      
      {/* 1. Módulo Superior (Gris Oscuro/Negro) - 30 a 43 cm */}
      <mesh position={[0, 1.56, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1.3, 32]} />
        <meshStandardMaterial color={cBlack} roughness={0.7} />
      </mesh>

      {/* 2. Módulo de Aviónica (Fucsia/Rosado) - 44 a 58 cm */}
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.33, 0.33, 1.4, 32]} />
        <meshStandardMaterial color={cPink} roughness={0.5} />
      </mesh>

      {/* 3. Cápsula de Carga Útil (Rojo) - 60 a 68 cm */}
      <mesh position={[0, -1.19, 0]} scale={[1, 1.3, 1]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={cRed} roughness={0.5} />
      </mesh>

      {/* === COLA Y MOTOR === */}

      {/* Anillos centradores (Fucsia) en 76 cm y 84 cm */}
      <mesh position={[0, -2.39, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.05, 32]} />
        <meshStandardMaterial color={cPink} />
      </mesh>
      <mesh position={[0, -3.19, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.05, 32]} />
        <meshStandardMaterial color={cPink} />
      </mesh>

      {/* Tubo del Motor (Proyectado de 80 cm a 99.3 cm) */}
      <mesh position={[0, -3.76, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 1.93, 32]} />
        <meshStandardMaterial color={cMotor} roughness={0.8} />
      </mesh>

      {/* --- ALETAS (4 Fins en Cruz, Barrido Agresivo Hacia Atrás) --- */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, index) => (
        <group key={index} rotation={[0, angle, 0]} position={[0, 0, 0]}>
          <mesh position={[0, 0, -0.015]}> 
            <extrudeGeometry args={[finShape, extrudeSettings]} />
            <meshStandardMaterial color={cBlue} roughness={0.3} metalness={0.2}/>
          </mesh>
        </group>
      ))}

    </group>
  );
}

export default function RocketCanvas({ roll, pitch }) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '350px', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 11], fov: 45 }}>
        <color attach="background" args={['#0f172a']} />
        
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        <directionalLight position={[-10, 5, -10]} intensity={0.5} />
        
        <Rocket roll={roll} pitch={pitch} />
        
        <Grid args={[30, 30]} position={[0, -5.5, 0]} cellColor="#334155" sectionColor="#475569" />
        
        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>
    </div>
  );
}
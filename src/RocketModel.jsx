import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

function Rocket({ roll, pitch }) {
  const meshRef = useRef();

  // 1. FORMA DE LAS ALETAS (Swept Fins)
  const finShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 1.2);         // Borde superior de la raíz
    shape.lineTo(1.1, 0.3);       // Punta superior exterior (Barrido)
    shape.lineTo(1.1, -1.0);      // Punta inferior exterior
    shape.lineTo(0, -1.2);        // Borde inferior de la raíz
    return shape;
  }, []);

  const extrudeSettings = { 
    depth: 0.04, 
    bevelEnabled: false 
  };

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = (pitch || 0) * (Math.PI / 180);
      meshRef.current.rotation.y = -(roll || 0) * (Math.PI / 180);
    }
  });

  const cBlue = "#2563eb";     
  const cBlack = "#1e293b";    
  const cPink = "#d946ef";     
  const cRed = "#ef4444";      
  const cMotor = "#475569";    

  return (
    <group ref={meshRef}>
      
      {/* --- OJIVA (Nose Cone) --- */}
      <mesh position={[0, 3.81, 0]}>
        <coneGeometry args={[0.35, 2.8, 32]} />
        <meshStandardMaterial color={cBlue} roughness={0.3} metalness={0.2}/>
      </mesh>

      {/* --- TUBO PRINCIPAL (Cuerpo Transparente Completo) --- 
          Ahora cubre todo el cohete hasta la base de las aletas */}
      <mesh position={[0, -1.155, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 7.13, 32]} />
        <meshStandardMaterial 
          color={cBlue} 
          transparent={true} 
          opacity={0.18} 
          roughness={0.1} 
          metalness={0.3}
          side={THREE.DoubleSide} // Mejora visual del cristal
        />
      </mesh>

      {/* === COMPONENTES INTERNOS === */}
      
      {/* 1. Módulo Superior (Gris Oscuro/Negro) */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 1.4, 32]} />
        <meshStandardMaterial color={cBlack} roughness={0.7} />
      </mesh>

      {/* 2. Módulo de Aviónica (Fucsia/Rosado) */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.31, 0.31, 1.6, 32]} />
        <meshStandardMaterial color={cPink} roughness={0.5} />
      </mesh>

      {/* 3. Cápsula de Carga Útil (Rojo) */}
      <mesh position={[0, -1.8, 0]} scale={[1, 1.3, 1]}>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial color={cRed} roughness={0.5} />
      </mesh>

      {/* === COLA Y MOTOR === */}

      {/* Anillos centradores (Fucsia) */}
      <mesh position={[0, -3.2, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.05, 32]} />
        <meshStandardMaterial color={cPink} />
      </mesh>
      <mesh position={[0, -4.5, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.05, 32]} />
        <meshStandardMaterial color={cPink} />
      </mesh>

      {/* Tubo del Motor */}
      <mesh position={[0, -4.1, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 2.0, 32]} />
        <meshStandardMaterial color={cMotor} roughness={0.8} />
      </mesh>

      {/* --- 4 ALETAS EN CRUZ --- */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, index) => (
        <group key={index} rotation={[0, angle, 0]} position={[0, -3.52, 0]}>
          <mesh position={[0.34, 0, -0.02]}> 
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
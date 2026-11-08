import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

function Rocket({ roll, pitch }) {
  const meshRef = useRef();

  // 1. FORMA EXACTA DE LAS ALETAS (Swept Fins de OpenRocket)
  const finShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.85);       // Borde superior de la raíz (pegado al tubo)
    shape.lineTo(1.1, 0.1);      // Punta superior exterior (Barrido hacia atrás)
    shape.lineTo(1.1, -0.6);     // Punta inferior exterior
    shape.lineTo(0, -0.85);      // Borde inferior de la raíz
    return shape;
  }, []);

  const extrudeSettings = { 
    depth: 0.03, // Aletas delgadas y aerodinámicas
    bevelEnabled: false 
  };

  // 2. ANIMACIÓN DE ACTITUD EN TIEMPO REAL
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = (pitch || 0) * (Math.PI / 180);
      meshRef.current.rotation.y = -(roll || 0) * (Math.PI / 180);
    }
  });

  // COLORES EXACTOS DE OPENROCKET
  const cBlue = "#2563eb";     // Azul de la ojiva y aletas
  const cBlack = "#1e293b";    // Bloque superior oscuro
  const cPink = "#d946ef";     // Bloque central fucsia / Anillos
  const cRed = "#ef4444";      // Cápsula roja
  const cMotor = "#475569";    // Tubo del motor

  return (
    <group ref={meshRef}>
      
      {/* --- OJIVA (Nose Cone) - AZUL SÓLIDO --- */}
      <mesh position={[0, 3.71, 0]}>
        <coneGeometry args={[0.35, 3.0, 32]} />
        <meshStandardMaterial color={cBlue} roughness={0.3} metalness={0.2}/>
      </mesh>

      {/* --- TUBO PRINCIPAL (Cuerpo) - TRANSPARENTE --- */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 8.4, 32]} />
        <meshStandardMaterial 
          color={cBlue} 
          transparent={true} 
          opacity={0.15} 
          roughness={0.1} 
          metalness={0.5}
        />
      </mesh>

      {/* === COMPONENTES INTERNOS === */}
      
      {/* 1. Bloque de Paracaídas/Recuperación (Gris Oscuro/Negro) */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1.4, 32]} />
        <meshStandardMaterial color={cBlack} roughness={0.7} />
      </mesh>

      {/* 2. Módulo de Aviónica / Electrónica (Fucsia/Rosado) */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.33, 0.33, 1.8, 32]} />
        <meshStandardMaterial color={cPink} roughness={0.5} />
      </mesh>

      {/* 3. Cápsula/Masa (Rojo) */}
      <mesh position={[0, -1.6, 0]} scale={[1, 1.4, 1]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={cRed} roughness={0.5} />
      </mesh>

      {/* === COLA Y MOTOR === */}

      {/* Anillos centradores (Fucsia) */}
      <mesh position={[0, -2.9, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.05, 32]} />
        <meshStandardMaterial color={cPink} />
      </mesh>
      <mesh position={[0, -4.0, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.05, 32]} />
        <meshStandardMaterial color={cPink} />
      </mesh>

      {/* Tubo del Motor (Gris Oscuro) */}
      <mesh position={[0, -3.6, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 2.2, 32]} />
        <meshStandardMaterial color={cMotor} roughness={0.8} />
      </mesh>

      {/* --- ALETAS (Fins) - AHORA SON 4 ALETAS SEPARADAS A 90° --- */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, index) => (
        <group key={index} rotation={[0, angle, 0]} position={[0, -3.6, 0]}>
          <mesh position={[0.34, 0, -0.015]}> 
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
      <Canvas camera={{ position: [0, 0, 14], fov: 45 }}>
        <color attach="background" args={['#0f172a']} />
        
        {/* Iluminación calibrada para resaltar el fuselaje transparente y los sólidos */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        <directionalLight position={[-10, 5, -10]} intensity={0.5} />
        
        <Rocket roll={roll} pitch={pitch} />
        
        {/* Cuadrícula de lanzamiento */}
        <Grid args={[30, 30]} position={[0, -6, 0]} cellColor="#334155" sectionColor="#475569" />
        
        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>
    </div>
  );
}
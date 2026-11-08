import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

function Rocket({ roll, pitch }) {
  const meshRef = useRef();

  // 1. FORMA MILIMÉTRICA DE LAS ALETAS (Extraída del plano de OpenRocket)
  const finShape = useMemo(() => {
    const shape = new THREE.Shape();
    // El origen (0,0) de esta forma es la base del tubo del cohete (85 cm desde la punta).
    shape.moveTo(0, 1.4);         // Borde superior de la raíz (inicia en 71 cm -> 14 cm arriba de la base)
    shape.lineTo(0.75, 0.2);      // Punta superior exterior (inicia en 83 cm -> 2 cm arriba de la base)
    shape.lineTo(0.75, -1.43);    // Punta inferior exterior (termina en 99.3 cm -> 14.3 cm debajo de la base)
    shape.lineTo(0, 0);           // Borde inferior de la raíz (termina en 85 cm -> exactamente en la base)
    return shape;
  }, []);

  const extrudeSettings = { depth: 0.03, bevelEnabled: false };

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = (pitch || 0) * (Math.PI / 180);
      meshRef.current.rotation.y = -(roll || 0) * (Math.PI / 180);
    }
  });

  // COLORES EXACTOS DE OPENROCKET
  const cBlue = "#2563eb";
  const cBlack = "#1e293b";
  const cPink = "#d946ef";
  const cRed = "#ef4444";
  const cMotor = "#475569";

  /*
    MATEMÁTICA DEL COHETE HUITACA:
    - CG (Centro de Rotación): 52.1 cm. (Este será nuestro Y = 0)
    - Punta del cohete (0 cm): Y = +5.21
    - Base del tubo (85 cm): Y = 5.21 - 8.50 = -3.29
  */

  return (
    <group ref={meshRef}>
      
      {/* --- OJIVA (Nose Cone) | 0 a 28 cm --- */}
      <mesh position={[0, 3.81, 0]}>
        <coneGeometry args={[0.35, 2.8, 32]} />
        <meshStandardMaterial color={cBlue} roughness={0.3} metalness={0.2}/>
      </mesh>

      {/* --- TUBO PRINCIPAL (Cuerpo Transparente Completo) | 28 a 85 cm --- */}
      <mesh position={[0, -0.44, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 5.7, 32]} />
        <meshStandardMaterial 
          color={cBlue} transparent={true} opacity={0.18} 
          roughness={0.1} metalness={0.3} side={THREE.DoubleSide} 
        />
      </mesh>

      {/* === COMPONENTES INTERNOS === */}
      {/* 1. Módulo Superior (Gris Oscuro/Negro) | ~ 30 a 44 cm */}
      <mesh position={[0, 1.51, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 1.4, 32]} />
        <meshStandardMaterial color={cBlack} roughness={0.7} />
      </mesh>

      {/* 2. Módulo de Aviónica (Fucsia/Rosado) | ~ 45 a 59 cm */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.31, 0.31, 1.4, 32]} />
        <meshStandardMaterial color={cPink} roughness={0.5} />
      </mesh>

      {/* 3. Cápsula de Carga Útil (Rojo) | ~ 61 a 69 cm */}
      <mesh position={[0, -1.29, 0]} scale={[1, 1.3, 1]}>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial color={cRed} roughness={0.5} />
      </mesh>

      {/* === COLA Y MOTOR === */}
      {/* Anillos centradores (Fucsia) | 75 cm y 85 cm */}
      <mesh position={[0, -2.29, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.05, 32]} />
        <meshStandardMaterial color={cPink} />
      </mesh>
      <mesh position={[0, -3.29, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.05, 32]} />
        <meshStandardMaterial color={cPink} />
      </mesh>

      {/* Tubo del Motor | 75 a 88 cm */}
      <mesh position={[0, -2.94, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 1.3, 32]} />
        <meshStandardMaterial color={cMotor} roughness={0.8} />
      </mesh>

      {/* --- 4 ALETAS EN CRUZ (Swept Fins Hacia Atrás) --- */}
      {/* Posicionadas exactamente en la base del tubo (Y = -3.29) */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, index) => (
        <group key={index} rotation={[0, angle, 0]} position={[0, -3.29, 0]}>
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
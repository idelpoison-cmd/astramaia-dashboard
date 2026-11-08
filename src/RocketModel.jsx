import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

function Rocket({ roll, pitch }) {
  const meshRef = useRef();

  // 1. FORMA MILIMÉTRICA DE LAS ALETAS
  const finShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 1.4);         
    shape.lineTo(0.75, 0.2);      
    shape.lineTo(0.75, -1.43);    
    shape.lineTo(0, 0);           
    return shape;
  }, []);

  const extrudeSettings = { depth: 0.03, bevelEnabled: false };

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
      
      {/* --- OJIVA (Nose Cone) | 0 a 28 cm --- */}
      <mesh position={[0, 3.81, 0]}>
        <coneGeometry args={[0.35, 2.8, 32]} />
        <meshStandardMaterial color={cBlue} roughness={0.3} metalness={0.2}/>
      </mesh>

      {/* --- HOMBRO DE LA OJIVA (Nose Cone Shoulder) --- 
          Esta es la pieza que entra a presión en el tubo. 
          Llena el vacío óptico entre la ojiva y el bloque gris */}
      <mesh position={[0, 2.31, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.2, 32]} />
        <meshStandardMaterial color={cBlue} roughness={0.3} metalness={0.2}/>
      </mesh>

      {/* --- TUBO PRINCIPAL (Cuerpo Transparente Completo) | 28 a 85 cm --- */}
      <mesh position={[0, -0.44, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 5.7, 32]} />
        <meshStandardMaterial 
          color={cBlue} transparent={true} opacity={0.25} 
          roughness={0.1} metalness={0.3} side={THREE.DoubleSide} 
        />
      </mesh>

      {/* === COMPONENTES INTERNOS === */}
      {/* Módulo Superior (Gris Oscuro/Negro) */}
      <mesh position={[0, 1.51, 0]}>
        <cylinderGeometry args={[0.28, 0.28, 1.4, 32]} />
        <meshStandardMaterial color={cBlack} roughness={0.7} />
      </mesh>

      {/* Módulo de Aviónica (Fucsia/Rosado) */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.31, 0.31, 1.4, 32]} />
        <meshStandardMaterial color={cPink} roughness={0.5} />
      </mesh>

      {/* Cápsula de Carga Útil (Rojo) */}
      <mesh position={[0, -1.29, 0]} scale={[1, 1.3, 1]}>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial color={cRed} roughness={0.5} />
      </mesh>

      {/* === COLA Y MOTOR === */}
      {/* Anillos centradores (Fucsia) */}
      <mesh position={[0, -2.29, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.05, 32]} />
        <meshStandardMaterial color={cPink} />
      </mesh>
      {/* Anillo trasero asegurado para no salirse del fuselaje */}
      <mesh position={[0, -3.26, 0]}>
        <cylinderGeometry args={[0.34, 0.34, 0.05, 32]} />
        <meshStandardMaterial color={cPink} />
      </mesh>

      {/* Tubo del Motor */}
      <mesh position={[0, -2.94, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 1.3, 32]} />
        <meshStandardMaterial color={cMotor} roughness={0.8} />
      </mesh>

      {/* --- 4 ALETAS EN CRUZ (Swept Fins Hacia Atrás) --- */}
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
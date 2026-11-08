import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

function Rocket({ roll, pitch }) {
  const meshRef = useRef();

  // 1. FORMA EXACTA DE LAS ALETAS (Swept Fins de OpenRocket)
  // Basado en el plano 2D: Raíz de 20cm, envergadura de 7cm, flecha hacia atrás.
  const finShape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);              // Borde superior de la raíz (pegado al fuselaje)
    shape.lineTo(0.7, -1.5);         // Punta superior exterior (Barrido hacia atrás)
    shape.lineTo(0.7, -3.0);         // Punta inferior exterior
    shape.lineTo(0, -2.0);           // Borde inferior de la raíz
    return shape;
  }, []);

  const extrudeSettings = { 
    depth: 0.03, // Aletas de 3mm de grosor (a escala)
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.01,
    bevelThickness: 0.01
  };

  // 2. ANIMACIÓN EN TIEMPO REAL PIVOTANDO SOBRE EL CG (52.1 cm)
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = (pitch || 0) * (Math.PI / 180);
      meshRef.current.rotation.y = -(roll || 0) * (Math.PI / 180);
    }
  });

  const rocketColor = "#2563eb"; // Azul sólido característico de Huitaca

  return (
    <group ref={meshRef}>
      
      {/* --- OJIVA (Nose Cone) --- 
          Longitud de 28cm. Punta en Y = +5.21, Base en Y = +2.41 */}
      <mesh position={[0, 3.81, 0]}>
        <coneGeometry args={[0.35, 2.8, 32]} />
        <meshStandardMaterial color={rocketColor} roughness={0.3} metalness={0.4}/>
      </mesh>

      {/* --- TUBO PRINCIPAL (Fuselaje Sólido) --- 
          Longitud de 71.3cm. Base terminando en Y = -4.72 */}
      <mesh position={[0, -1.155, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 7.13, 32]} />
        <meshStandardMaterial color={rocketColor} roughness={0.3} metalness={0.4}/>
      </mesh>

      {/* --- ALETAS DIRECTRICES (Fins) --- 
          Ubicadas empezando a 68cm desde la punta (Y = -1.59) */}
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, index) => (
        <group key={index} rotation={[0, angle, 0]} position={[0, -1.59, 0]}>
          <mesh position={[0.34, 0, -0.015]}> 
            <extrudeGeometry args={[finShape, extrudeSettings]} />
            <meshStandardMaterial color={rocketColor} roughness={0.3} metalness={0.4}/>
          </mesh>
        </group>
      ))}

      {/* --- TOBERA DEL MOTOR --- 
          Sobresaliendo ligeramente de la base (-4.72) */}
      <mesh position={[0, -4.86, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.28, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.7} metalness={0.5} />
      </mesh>

    </group>
  );
}

export default function RocketCanvas({ roll, pitch }) {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '350px', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 14], fov: 45 }}>
        <color attach="background" args={['#0f172a']} />
        
        {/* Iluminación calibrada para dar volumen al fuselaje sólido */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        <directionalLight position={[-10, 5, -10]} intensity={0.8} />
        
        <Rocket roll={roll} pitch={pitch} />
        
        {/* Cuadrícula de lanzamiento */}
        <Grid args={[30, 30]} position={[0, -6, 0]} cellColor="#334155" sectionColor="#475569" />
        
        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>
    </div>
  );
}
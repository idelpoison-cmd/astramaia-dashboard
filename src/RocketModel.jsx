import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';

function Rocket({ roll, pitch }) {
  const meshRef = useRef();

  // Animación cuadro por cuadro basándose en los datos
  useFrame(() => {
    if (meshRef.current) {
      // Ajuste de ejes (de grados a radianes)
      meshRef.current.rotation.x = (pitch || 0) * (Math.PI / 180);
      meshRef.current.rotation.z = -(roll || 0) * (Math.PI / 180);
    }
  });

  return (
    <group ref={meshRef}>
      {/* Cuerpo principal (Gris) */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 3, 32]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Ojiva/Punta (Morada) */}
      <mesh position={[0, 1.8, 0]}>
        <coneGeometry args={[0.5, 1, 32]} />
        <meshStandardMaterial color="#a855f7" />
      </mesh>
      
      {/* Tobera/Motor (Oscuro) */}
      <mesh position={[0, -1.6, 0]}>
        <coneGeometry args={[0.4, 0.5, 32]} rotation={[Math.PI, 0, 0]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      
      {/* Aleta 1 (Cyan) */}
      <mesh position={[0.6, -1, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.05]} />
        <meshStandardMaterial color="#06b6d4" />
      </mesh>
      {/* Aleta 2 (Cyan) */}
      <mesh position={[-0.6, -1, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.05]} />
        <meshStandardMaterial color="#06b6d4" />
      </mesh>
    </group>
  );
}

export default function RocketCanvas({ roll, pitch }) {
  return (
    // Estilo en línea estricto para evitar que colapse
    <div style={{ width: '100%', height: '100%', minHeight: '350px', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        {/* Fondo oscuro para confirmar que el Canvas está vivo */}
        <color attach="background" args={['#0f172a']} />
        
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 10]} intensity={1.5} />
        
        <Rocket roll={roll} pitch={pitch} />
        
        {/* Piso de cuadrícula para dar perspectiva */}
        <Grid args={[20, 20]} position={[0, -3, 0]} cellColor="#334155" sectionColor="#475569" />
        
        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>
    </div>
  );
}
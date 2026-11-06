import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function Rocket({ roll, pitch }) {
  const meshRef = useRef();

  // Convertimos grados a radianes
  const rollRad = (roll || 0) * (Math.PI / 180);
  const pitchRad = (pitch || 0) * (Math.PI / 180);

  useFrame(() => {
    if (meshRef.current) {
      // Ajuste de ejes 
      meshRef.current.rotation.x = pitchRad;
      meshRef.current.rotation.z = -rollRad;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Cuerpo principal */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 3, 32]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Ojiva (Punta) */}
      <mesh position={[0, 1.8, 0]}>
        <coneGeometry args={[0.5, 1, 32]} />
        <meshStandardMaterial color="#a855f7" metalness={0.5} />
      </mesh>
      
      {/* Tobera (Motor) */}
      <mesh position={[0, -1.6, 0]}>
        <coneGeometry args={[0.4, 0.5, 32]} rotation={[Math.PI, 0, 0]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      
      {/* Aletas */}
      <mesh position={[0.6, -1, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.05]} />
        <meshStandardMaterial color="#06b6d4" />
      </mesh>
      <mesh position={[-0.6, -1, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.05]} />
        <meshStandardMaterial color="#06b6d4" />
      </mesh>
    </group>
  );
}

export default function RocketCanvas({ roll, pitch }) {
  return (
    // EL TRUCO CSS: position absolute para forzar al canvas a llenar la tarjeta
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
        {/* Luces más fuertes para que no se vea negro */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* El modelo del cohete */}
        <Rocket roll={roll} pitch={pitch} />
        
        {/* PISO 3D: Para saber que el canvas sí está renderizando */}
        <gridHelper args={[15, 15, '#475569', '#1e293b']} position={[0, -3.5, 0]} />
        
        {/* Controles de cámara */}
        <OrbitControls enableZoom={true} enablePan={false} />
      </Canvas>
    </div>
  );
}
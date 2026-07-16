import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';

function Bar({ position, targetHeight, color, label }) {
  const meshRef = useRef();
  const currentHeight = useRef(0.1);

  useFrame(() => {
    currentHeight.current += (targetHeight - currentHeight.current) * 0.1;
    if (meshRef.current) {
      meshRef.current.scale.y = currentHeight.current;
      meshRef.current.position.y = currentHeight.current / 2;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text position={[0, -0.6, 0.6]} fontSize={0.35} color="black" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  );
}

// in VoteBars3D.jsx, accept COLORS as a prop instead of generating hsl colors
export default function VoteBars3D({ candidates, colors }) {
  const count = candidates.length || 1;
  const camDistance = Math.max(5, count * 1.8);

  return (
    <div style={{ width: '100%', height: '250px' }}>
      <Canvas camera={{ position: [camDistance * 0.6, camDistance * 0.6, camDistance], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1} />
        {candidates.map((c, i) => (
          <Bar
            key={c.name}
            position={[i * 2 - (count - 1), 0, 0]}
            targetHeight={Math.max((c.value || 0) * 1.5 + 0.5, 0.5)}
            color={colors ? colors[i % colors.length] : `hsl(${i * 60}, 70%, 50%)`}
            label={`${c.name} (${c.value})`}
          />
        ))}
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}
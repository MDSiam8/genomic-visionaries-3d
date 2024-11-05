// src/components/Gene.jsx
import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

function Gene({ gene }) {
  const mesh = useRef();
  const [hovered, setHover] = useState(false);

  useFrame(() => {
    mesh.current.rotation.y += 0.005;
  });

  return (
    <mesh
      ref={mesh}
      position={[
        gene.position.x,
        gene.position.y + gene.dimensions.height / 2,
        gene.position.z,
      ]}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <boxGeometry
        args={[
          gene.dimensions.width,
          gene.dimensions.height,
          gene.dimensions.depth,
        ]}
      />
      <meshStandardMaterial color={hovered ? 'white' : gene.color} />
      {hovered && (
        <Html distanceFactor={10}>
          <div className="gene-tooltip">
            <strong>{gene.id}</strong>
            <p>{gene.description}</p>
          </div>
        </Html>
      )}
    </mesh>
  );
}

export default Gene;

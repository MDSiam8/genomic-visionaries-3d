// src/components/Box.js
import React, { useState } from 'react';

function Box(props) {
  const [color, setColor] = useState('orange');

  const handleClick = () => {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple'];
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    setColor(newColor);
  };

  return (
    <mesh {...props} onClick={handleClick}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default Box;

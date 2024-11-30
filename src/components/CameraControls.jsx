// src/components/CameraControls.jsx
import { useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useRef } from 'react';
import { Vector3 } from 'three';

const CameraControls = ({ resetCamera }) => {
  const { camera, gl } = useThree();
  const moveUp = useRef(false);
  const moveDown = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  const velocity = useRef(new Vector3());
  const direction = useRef(new Vector3());
  const prevTime = useRef(performance.now());

  useEffect(() => {
    if (resetCamera) {
      // Reset camera position and rotation
      camera.position.set(0, 10, 150);
      camera.rotation.set(0, 0, 0);
    }
  }, [resetCamera, camera]);

  // Keyboard input
  useEffect(() => {
    const onKeyDown = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveUp.current = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveLeft.current = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveDown.current = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveRight.current = true;
          break;
        default:
          break;
      }
    };

    const onKeyUp = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveUp.current = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveLeft.current = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveDown.current = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveRight.current = false;
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Mouse movement
  useEffect(() => {
    const onMouseMove = (event) => {
      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      camera.rotation.y -= movementX * 0.002;
      camera.rotation.x -= movementY * 0.002;
      camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    };

    const onPointerLockChange = () => {
      if (document.pointerLockElement === gl.domElement) {
        document.addEventListener('mousemove', onMouseMove, false);
      } else {
        document.removeEventListener('mousemove', onMouseMove, false);
      }
    };

    document.addEventListener('pointerlockchange', onPointerLockChange, false);
    gl.domElement.addEventListener('click', () => {
      gl.domElement.requestPointerLock();
    });

    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange, false);
      document.removeEventListener('mousemove', onMouseMove, false);
    };
  }, [camera, gl.domElement]);

  // Scroll input (retain if needed)
  useEffect(() => {
    const onWheel = (event) => {
      event.preventDefault();
      const delta = -event.deltaY * 0.05;
      const moveVector = new Vector3(0, 0, -1)
        .applyEuler(camera.rotation)
        .normalize()
        .multiplyScalar(delta);
      camera.position.add(moveVector);
    };

    gl.domElement.addEventListener('wheel', onWheel);

    return () => {
      gl.domElement.removeEventListener('wheel', onWheel);
    };
  }, [camera, gl.domElement]);

  // Update camera position
  useFrame(() => {
    const time = performance.now();
    const delta = (time - prevTime.current) / 1000;

    // Apply damping to velocity
    velocity.current.x -= velocity.current.x * 10.0 * delta;
    velocity.current.y -= velocity.current.y * 10.0 * delta;
    velocity.current.z -= velocity.current.z * 10.0 * delta;

    // Reset direction
    direction.current.set(0, 0, 0);

    // Update direction based on keys pressed
    if (moveUp.current) direction.current.y += 1;
    if (moveDown.current) direction.current.y -= 1;
    if (moveLeft.current) direction.current.x -= 1;
    if (moveRight.current) direction.current.x += 1;

    direction.current.normalize();

    const speed = 400.0;

    // Calculate movement vector
    if (moveUp.current || moveDown.current || moveLeft.current || moveRight.current) {
      // Move along world axes (X and Y), not relative to camera rotation
      const moveVector = new Vector3(direction.current.x, direction.current.y, 0)
        .normalize()
        .multiplyScalar(speed * delta);

      camera.position.add(moveVector);
    }

    prevTime.current = time;
  });

  return null;
};

export default CameraControls;

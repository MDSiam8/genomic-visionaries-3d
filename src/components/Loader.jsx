// src/components/Loader.jsx
import React from 'react';
import { Html, useProgress } from '@react-three/drei';
import './Loader.css';

const Loader = () => {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="loader">
                <div className="spinner"></div>
                <p>Loading {progress.toFixed(0)}%</p>
            </div>
        </Html>
    );
};

export default Loader;

// src/components/InfoPanel.jsx
import React from 'react';
import './InfoPanel.css';

const InfoPanel = () => {
    return (
        <div className="info-panel">
            <h2>Dr. Mike Catz</h2>
            <p>
                Dr. Mike Catz is a renowned Computational Genomicist specializing in the study of genetic variants 
                and their associations with various phenotypes. In this genome visualizer, Dr. Catz serves as 
                the model organism for exploring and filtering genomic data based on specific traits.
            </p>
            <p>
                <strong>Interactive Features:</strong>
                <ul>
                    <li>Click on different features of Dr. Catz to filter and explore genetic variants related to that trait.</li>
                    <li>Analyze the impact of specific genetic variants on various phenotypes.</li>
                </ul>
            </p>
        </div>
    );
};

export default InfoPanel;

// src/components/InfoPanelToggle.jsx
import React, { useState } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import InfoPanel from './InfoPanel';
import './InfoPanelToggle.css';

const InfoPanelToggle = () => {
    const [isOpen, setIsOpen] = useState(false);

    const togglePanel = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="info-panel-toggle-container">
            {/* Toggle Button */}
            <button className="toggle-button" onClick={togglePanel} aria-label="Toggle Information Panel">
                {isOpen ? <FaChevronDown size={20} /> : <FaChevronUp size={20} />}
            </button>

            {/* Information Panel */}
            <div className={`info-panel-wrapper ${isOpen ? 'open' : 'closed'}`}>
                <InfoPanel />
            </div>
        </div>
    );
};

export default InfoPanelToggle;

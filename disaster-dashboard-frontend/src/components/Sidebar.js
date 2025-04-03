// src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen, toggle }) => {
  return (
    <div
      style={{
        width: isOpen ? '200px' : '0',
        transition: '0.3s',
        overflowX: 'hidden',
        background: '#f8f8f8',
        padding: isOpen ? '20px' : '0',
        borderRight: '1px solid #ddd'
      }}
    >
      <button onClick={toggle} style={{ marginBottom: '20px' }}>
        {isOpen ? 'Close' : 'Open'}
      </button>
      {isOpen && (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li><Link to="/">Home Page</Link></li>
          <li><Link to="/analytics">Analytics Page</Link></li>
        </ul>
      )}
    </div>
  );
};

export default Sidebar;

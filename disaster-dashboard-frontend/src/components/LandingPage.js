// src/components/LandingPage.js
import React, { useState } from 'react';
import { GoogleMap, LoadScript, Circle } from '@react-google-maps/api';
import Sidebar from './Sidebar';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const center = {
  lat: 39.8283, // Center of US
  lng: -98.5795,
};

const states = [
  { name: 'California', risk: 'high', position: { lat: 36.7783, lng: -119.4179 } },
  { name: 'Texas', risk: 'high', position: { lat: 31.9686, lng: -99.9018 } },
  { name: 'Florida', risk: 'high', position: { lat: 27.9944, lng: -81.7603 } },
  { name: 'South Carolina', risk: 'high', position: { lat: 33.8361, lng: -81.1637 } },
  { name: 'Georgia', risk: 'high', position: { lat: 32.1656, lng: -82.9001 } },
  { name: 'North Carolina', risk: 'medium', position: { lat: 35.7596, lng: -79.0193 } },
  { name: 'Idaho', risk: 'low', position: { lat: 44.0682, lng: -114.7420 } },
  { name: 'Utah', risk: 'low', position: { lat: 39.3200, lng: -111.0937 } },
  { name: 'Colorado', risk: 'low', position: { lat: 39.5501, lng: -105.7821 } },
  { name: 'Kansas', risk: 'low', position: { lat: 39.0119, lng: -98.4842 } },
  { name: 'Virginia', risk: 'low', position: { lat: 37.4316, lng: -78.6569 } },
  { name: 'Missouri', risk: 'low', position: { lat: 37.9643, lng: -91.8318 } },
  { name: 'Indiana', risk: 'low', position: { lat: 40.2672, lng: -86.1349 } },
];

const riskColors = {
  high: '#B74129',
  medium: '#FF8C34',
  low: '#497DBD',
};

const LandingPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleStateClick = (state) => {
    window.location.href = `/state/${state.name}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ background: '#fff', padding: '10px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #ddd' }}>
        <img src="/HCAlogo.png" alt="HCA Logo" style={{ height: '50px', marginRight: '15px' }} />
        <h1 style={{ fontSize: '20px', color: '#2E2E2E' }}>HCA Healthcare Disaster Preparedness Dashboard</h1>
      </div>
      <div style={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />
        <div style={{ flexGrow: 1 }}>
          <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={4}>
              {states.map((state, index) => (
                <Circle
                  key={index}
                  center={state.position}
                  radius={200000}
                  options={{
                    fillColor: riskColors[state.risk],
                    fillOpacity: 0.6,
                    strokeColor: '#000',
                    strokeWeight: 1,
                  }}
                  onClick={() => handleStateClick(state)}
                />
              ))}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
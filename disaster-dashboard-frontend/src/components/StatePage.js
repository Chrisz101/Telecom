// src/components/StatePage.js
import React, { useState } from 'react';
import { GoogleMap, LoadScript, Circle } from '@react-google-maps/api';
import { useParams, useNavigate } from 'react-router-dom';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const texasCenter = {
  lat: 31.9686,
  lng: -99.9018,
};

const counties = [
  { name: 'Harris', position: { lat: 29.7752, lng: -95.3103 }, population: 4800000, employees: 10000, disasters: { total: 12, storm: 5, flood: 4, wildfire: 3 }, hospitals: ['Harris General'] },
  { name: 'Travis', position: { lat: 30.2672, lng: -97.7431 }, population: 1300000, employees: 7000, disasters: { total: 9, storm: 3, flood: 4, wildfire: 2 }, hospitals: ['Travis Medical Center'] },
  { name: 'Dallas', position: { lat: 32.7767, lng: -96.7970 }, population: 2600000, employees: 8000, disasters: { total: 10, storm: 6, flood: 3, wildfire: 1 }, hospitals: ['Dallas County Hospital'] },
];

const riskColors = {
  high: '#B74129',
  medium: '#FF8C34',
  low: '#497DBD',
};

const StatePage = () => {
  const { stateName } = useParams();
  const navigate = useNavigate();
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);

  return (
    <div style={{ padding: '20px' }}>
      <h2>{stateName} State Map</h2>
      <button onClick={() => navigate('/')}>Back to Home Page</button>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap mapContainerStyle={containerStyle} center={texasCenter} zoom={6}>
          {counties.map((county, index) => (
            <Circle
              key={index}
              center={county.position}
              radius={40000}
              options={{
                fillColor: riskColors.high,
                fillOpacity: 0.6,
                strokeColor: '#000',
                strokeWeight: 1,
              }}
              onClick={() => setSelectedCounty(county)}
            />
          ))}
        </GoogleMap>
      </LoadScript>
      {selectedCounty && (
        <div style={{ marginTop: '20px' }}>
          <h3>{selectedCounty.name} County</h3>
          <p>Population: {selectedCounty.population.toLocaleString()}</p>
          <p>Employees: {selectedCounty.employees.toLocaleString()}</p>
          <p>Disasters (Total: {selectedCounty.disasters.total}):</p>
          <ul>
            {Object.entries(selectedCounty.disasters).map(([type, count]) => type !== 'total' && (
              <li key={type}>{type}: {count}</li>
            ))}
          </ul>
          <label>Hospitals:</label>
          <select onChange={(e) => setSelectedHospital(e.target.value)}>
            <option value="">Select Hospital</option>
            {selectedCounty.hospitals.map((hosp, idx) => (
              <option key={idx} value={hosp}>{hosp}</option>
            ))}
          </select>
          <div style={{ marginTop: '10px' }}>
            {selectedHospital && <button onClick={() => navigate(`/hospital/${selectedCounty.name.toLowerCase()}/${selectedHospital.toLowerCase().replace(/\s+/g, '-')}`)}>Go to {selectedHospital} Page</button>}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatePage;

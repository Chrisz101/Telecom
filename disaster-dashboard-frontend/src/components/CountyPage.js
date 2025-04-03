// src/components/CountyPage.js
import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useParams, useNavigate } from 'react-router-dom';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const countyCenters = {
  harris: { lat: 29.7752, lng: -95.3103 },
  travis: { lat: 30.2672, lng: -97.7431 },
  dallas: { lat: 32.7767, lng: -96.7970 },
};

const hospitals = {
  harris: [
    { name: 'Harris General', lat: 29.78, lng: -95.32 },
    { name: 'Baytown Clinic', lat: 29.75, lng: -95.28 },
  ],
  travis: [
    { name: 'Travis Medical Center', lat: 30.28, lng: -97.75 },
    { name: 'Austin Health', lat: 30.26, lng: -97.73 },
  ],
  dallas: [
    { name: 'Dallas County Hospital', lat: 32.78, lng: -96.80 },
    { name: 'North Texas Health', lat: 32.77, lng: -96.79 },
  ],
};

const CountyPage = () => {
  const { countyName } = useParams();
  const navigate = useNavigate();

  const center = countyCenters[countyName] || { lat: 31, lng: -99 };

  return (
    <div style={{ padding: '20px' }}>
      <h2>{countyName.charAt(0).toUpperCase() + countyName.slice(1)} County Map</h2>
      <button onClick={() => navigate(-1)}>Back to State Page</button>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={9}>
          {hospitals[countyName] && hospitals[countyName].map((hospital, idx) => (
            <Marker
              key={idx}
              position={{ lat: hospital.lat, lng: hospital.lng }}
              title={hospital.name}
              onClick={() => navigate(`/hospital/${countyName}/${hospital.name.toLowerCase().replace(/\s+/g, '-')}`)}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default CountyPage;

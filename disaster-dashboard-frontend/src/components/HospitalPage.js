// src/components/HospitalPage.js
import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker, Circle, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import { useParams, useNavigate } from 'react-router-dom';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const hospitalData = {
  harris: {
    'harris-general': {
      name: 'Harris General Hospital',
      lat: 29.78,
      lng: -95.32,
      resources: {
        beds: '120 available / 150 needed',
        staff: '50 available / 70 needed',
        medicines: '80 available / 100 needed',
        surgeons: '10 available / 15 needed',
        nurses: '40 available / 60 needed',
        physicians: '15 available / 20 needed',
        equipment: 'Adequate',
        food: '500 meals / day capacity',
        water: '3000 liters / day capacity',
      },
      nearbyFacilities: [
        { name: 'Baytown Clinic', lat: 29.75, lng: -95.28, type: 'Hospital' },
        { name: 'South Houston Care', lat: 29.66, lng: -95.23, type: 'Hospital' },
        { name: 'Houston Medical Supplies', lat: 29.77, lng: -95.35, type: 'Warehouse' },
      ],
    },
  },
};

const HospitalPage = () => {
  const { countyName, hospitalName } = useParams();
  const navigate = useNavigate();
  const [directions, setDirections] = useState([]);
  const [distanceInfo, setDistanceInfo] = useState([]);

  const hospitalKey = hospitalName.toLowerCase();
  const data = hospitalData[countyName]?.[hospitalKey];

  if (!data) {
    return <div>Hospital data not found.</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>{data.name}</h2>
      <button onClick={() => navigate(-1)}>Back to County Page</button>
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={['places']}> 
        <GoogleMap mapContainerStyle={containerStyle} center={{ lat: data.lat, lng: data.lng }} zoom={11}>
          <Marker position={{ lat: data.lat, lng: data.lng }} title={data.name} />
          <Circle
            center={{ lat: data.lat, lng: data.lng }}
            radius={30000}
            options={{
              fillColor: '#add8e6',
              fillOpacity: 0.15,
              strokeColor: '#0000ff',
              strokeOpacity: 0.5,
              strokeWeight: 1,
            }}
          />
          {data.nearbyFacilities.map((facility, idx) => (
            <Marker
              key={idx}
              position={{ lat: facility.lat, lng: facility.lng }}
              label={facility.type === 'Hospital' ? 'H' : 'W'}
              title={`${facility.name} (${facility.type})`}
            />
          ))}

          {data.nearbyFacilities.map((facility, idx) => (
            <DirectionsService
              key={idx}
              options={{
                destination: { lat: facility.lat, lng: facility.lng },
                origin: { lat: data.lat, lng: data.lng },
                travelMode: 'DRIVING',
              }}
              callback={(result) => {
                if (result?.status === 'OK') {
                  setDirections((prev) => [...prev, result]);
                  setDistanceInfo((prev) => [...prev, result.routes[0].legs[0]]);
                }
              }}
            />
          ))}

          {directions.map((dir, idx) => (
            <DirectionsRenderer key={idx} directions={dir} />
          ))}
        </GoogleMap>
      </LoadScript>

      <h3>Resources</h3>
      <ul>
        {Object.entries(data.resources).map(([key, value]) => (
          <li key={key}><strong>{key}:</strong> {value}</li>
        ))}
      </ul>

      <h3>Nearby Facilities</h3>
      <ul>
        {data.nearbyFacilities.map((facility, idx) => (
          <li key={idx}>
            {facility.name} ({facility.type}) - {distanceInfo[idx] ? `${distanceInfo[idx].distance.text} (${distanceInfo[idx].duration.text})` : '...loading...'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HospitalPage;

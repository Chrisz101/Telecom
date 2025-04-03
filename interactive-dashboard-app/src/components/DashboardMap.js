import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function DashboardMap() {
  const [zoom, setZoom] = useState(4);
  const [center, setCenter] = useState([37.8, -96]);
  const [stateSelected, setStateSelected] = useState(null);
  const [countySelected, setCountySelected] = useState(null);
  const [disasterFilter, setDisasterFilter] = useState('All');
  const [resourceFilter, setResourceFilter] = useState('All');

  const [usData, setUsData] = useState(null);
  const [texasData, setTexasData] = useState(null);
  const [hospitalData, setHospitalData] = useState(null);

  useEffect(() => {
    fetch('/us-states.geojson').then(res => res.json()).then(setUsData);
    fetch('/texas-counties.geojson').then(res => res.json()).then(setTexasData);
    fetch('/hospitals_with_neighbors.geojson').then(res => res.json()).then(data => {
      // Validate and filter
      const validFeatures = (data.features || []).filter(f => {
        return f.geometry && f.geometry.type === 'Point' && Array.isArray(f.geometry.coordinates);
      });
      console.log('Validated Hospital Features:', validFeatures);
      setHospitalData({ type: 'FeatureCollection', features: validFeatures });
    });
  }, []);

  const handleStateClick = (e, feature) => {
    const stateName = feature.properties.NAME || feature.properties.name;
    if (stateName === 'Texas') {
      setStateSelected('Texas');
      setCenter([31.0, -99.0]);
      setZoom(6);
    }
  };

  const handleCountyClick = (e, feature) => {
    setCountySelected(feature.properties.NAME);
    setCenter([e.latlng.lat, e.latlng.lng]);
    setZoom(9);
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '250px', background: '#f1f5f9', padding: '10px' }}>
        <h3>Company Logo</h3>
        <p>Company Name</p>
        <p>Contact: info@company.com</p>

        <hr />
        <h4>Navigation</h4>
        <ul>
          <li><a href="#">Statewise Overview</a></li>
          <li><a href="#">Countywise Overview</a></li>
          <li><a href="#">Analytics</a></li>
        </ul>

        <h4>Dynamic Filters</h4>
        <label>Disaster Type</label>
        <select value={disasterFilter} onChange={(e) => setDisasterFilter(e.target.value)}>
          <option>All</option>
          <option>Flood</option>
          <option>Hurricane</option>
          <option>Wildfire</option>
        </select>

        <label>Resource Type</label>
        <select value={resourceFilter} onChange={(e) => setResourceFilter(e.target.value)}>
          <option>All</option>
          <option>Medical Supplies</option>
          <option>Ambulances</option>
          <option>Shelters</option>
          <option>Specialists</option>
        </select>
      </div>

      <div style={{ flex: 1 }}>
        <MapContainer center={center} zoom={zoom} style={{ height: '100vh', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {zoom <= 5 && usData?.features && (
            <GeoJSON data={usData}
              onEachFeature={(feature, layer) => {
                layer.on({ click: (e) => handleStateClick(e, feature) });
              }}
              style={{ color: '#3B82F6', weight: 1, fillOpacity: 0.4 }}
            />
          )}

          {stateSelected === 'Texas' && zoom >= 6 && zoom < 9 && texasData?.features && (
            <GeoJSON data={texasData}
              onEachFeature={(feature, layer) => {
                layer.on({ click: (e) => handleCountyClick(e, feature) });
              }}
              style={{ color: '#EF4444', weight: 1, fillOpacity: 0.4 }}
            />
          )}

          {countySelected && zoom >= 9 && hospitalData?.features && hospitalData.features.length > 0 && (
            <GeoJSON
              data={hospitalData}
              pointToLayer={(feature, latlng) =>
                L.marker(latlng, { icon: L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png' }) })
              }
              onEachFeature={(feature, layer) => {
                const nearby = feature.properties.nearby || [];
                let popupContent = `<b>${feature.properties.Facility}</b><br/><b>Nearby Hospitals:</b><ul>`;
                nearby.forEach(h => {
                  popupContent += `<li>${h['Nearby Hospital']} - ${h['Distance (miles)']} mi</li>`;
                });
                popupContent += '</ul>';
                layer.bindPopup(popupContent);
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

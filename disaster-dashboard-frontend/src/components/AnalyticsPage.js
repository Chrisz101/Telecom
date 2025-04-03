// src/components/AnalyticsPage.js
import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import Sidebar from './Sidebar';
import scatterImage from '../assets/disaster-scatter.png';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const dummyData = {
  counties: ['Harris', 'Montgomery', 'Travis'],
  hospitals: {
    Harris: ['Harris General', 'Harris Clinic'],
    Montgomery: ['Montgomery Health Center'],
    Travis: ['Travis Hospital A', 'Travis Hospital B'],
  },
  hospitalData: {
    'Harris General': { beds: 100, surgeons: 10, nurses: 25, physicians: 15 },
    'Harris Clinic': { beds: 50, surgeons: 5, nurses: 10, physicians: 8 },
    'Montgomery Health Center': { beds: 70, surgeons: 6, nurses: 15, physicians: 10 },
    'Travis Hospital A': { beds: 80, surgeons: 8, nurses: 20, physicians: 12 },
    'Travis Hospital B': { beds: 60, surgeons: 7, nurses: 12, physicians: 9 },
  },
  populationData: {
    Harris: { population: 4800000, employees: 10000, disasters: 12 },
    Montgomery: { population: 600000, employees: 1500, disasters: 4 },
    Travis: { population: 1300000, employees: 3000, disasters: 7 },
  },
};

const AnalyticsPage = () => {
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');

  const handleCountyChange = (e) => {
    setSelectedCounty(e.target.value);
    setSelectedHospital('');
  };

  const handleHospitalChange = (e) => {
    setSelectedHospital(e.target.value);
  };

  const hospitalInfo = dummyData.hospitalData[selectedHospital];

  const chartData = {
    labels: ['Beds', 'Surgeons', 'Nurses', 'Physicians'],
    datasets: [
      {
        label: 'Resources',
        data: hospitalInfo ? [hospitalInfo.beds, hospitalInfo.surgeons, hospitalInfo.nurses, hospitalInfo.physicians] : [],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  const populationLabels = Object.keys(dummyData.populationData);
  const populationChartData = {
    labels: populationLabels,
    datasets: [
      {
        label: 'Population',
        data: populationLabels.map((c) => dummyData.populationData[c].population),
        backgroundColor: '#36A2EB',
      },
      {
        label: 'Disaster Count',
        data: populationLabels.map((c) => dummyData.populationData[c].disasters),
        backgroundColor: '#FF6384',
      },
    ],
  };

  const ratioChartData = {
    labels: populationLabels,
    datasets: [
      {
        label: 'Disasters per 100k Employees',
        data: populationLabels.map((c) => {
          const d = dummyData.populationData[c];
          return (d.disasters / d.employees) * 100000;
        }),
        backgroundColor: '#FF9F40',
      },
    ],
  };

  const chartStyle = {
    maxWidth: '600px',
    maxHeight: '400px',
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', padding: '2rem', width: '100%' }}>
        <h2>Analytics Dashboard</h2>

        <div style={{ marginBottom: '1rem' }}>
          <label>Choose County: </label>
          <select value={selectedCounty} onChange={handleCountyChange}>
            <option value="">Select County</option>
            {dummyData.counties.map((county) => (
              <option key={county} value={county}>{county}</option>
            ))}
          </select>
        </div>

        {selectedCounty && (
          <div style={{ marginBottom: '1rem' }}>
            <label>Choose Hospital: </label>
            <select value={selectedHospital} onChange={handleHospitalChange}>
              <option value="">Select Hospital</option>
              {dummyData.hospitals[selectedCounty].map((hospital) => (
                <option key={hospital} value={hospital}>{hospital}</option>
              ))}
            </select>
          </div>
        )}

        {hospitalInfo && (
          <div>
            <h4>{selectedHospital} Resource Info</h4>
            <ul>
              <li>Beds: {hospitalInfo.beds}</li>
              <li>Surgeons: {hospitalInfo.surgeons}</li>
              <li>Nurses: {hospitalInfo.nurses}</li>
              <li>General Physicians: {hospitalInfo.physicians}</li>
            </ul>
            <div style={chartStyle}><Bar data={chartData} /></div>
          </div>
        )}

        <h3 style={{ marginTop: '2rem' }}>Population vs Disaster Count</h3>
        <div style={chartStyle}><Bar data={populationChartData} /></div>

        <h3 style={{ marginTop: '2rem' }}>Disaster per 100k Employees</h3>
        <div style={chartStyle}><Bar data={ratioChartData} /></div>

        <h3 style={{ marginTop: '2rem' }}>Disaster Pattern Scatter Chart</h3>
        <img src={scatterImage} alt="Disaster Pattern Scatter" style={{ width: '60%', maxWidth: '600px', marginTop: '1rem' }} />
      </div>
    </div>
  );
};

export default AnalyticsPage;

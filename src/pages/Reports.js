import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

export default function Reports() {
  const [activeTab, setActiveTab] = useState('patients');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);

  // API Base URL
  const API_BASE_URL = 'https://patient-management-system-in-python.onrender.com/api';

  const fetchReportData = async (reportType) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/reports/${reportType}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch report data');

      const data = await response.json();
      setReportData(data);
      setError('');
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let endpoint = '';
    switch (activeTab) {
      case 'patients':
        endpoint = 'patient-statistics';
        break;
      case 'appointments':
        endpoint = 'appointment-statistics';
        break;
      case 'medications':
        endpoint = 'medication-statistics';
        break;
      case 'list':
        endpoint = 'patient-list';
        break;
      default:
        endpoint = 'patient-statistics';
    }
    fetchReportData(endpoint);
  }, [activeTab]);

  // --- Chart Data Helpers ---
  const getPieChartData = (data, label) => ({
    labels: Object.keys(data || {}),
    datasets: [
      {
        label: label,
        data: Object.values(data || {}),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  });

  const getBarChartData = (data, label) => ({
    labels: Object.keys(data || {}),
    datasets: [
      {
        label: label,
        data: Object.values(data || {}),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  });

  const getLineChartData = (data) => ({
    labels: data?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Appointments per Month',
        data: data?.map(item => item.count) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3,
      },
    ],
  });


  // --- Render Tab Content ---
  const renderContent = () => {
    if (loading) return React.createElement('div', { className: 'loading' }, 'Loading report data...');
    if (error) return React.createElement('div', { className: 'alert alert-error' }, error);
    if (!reportData) return null;

    switch (activeTab) {
      case 'patients':
        return React.createElement('div', { className: 'reports-grid' },
          // Summary Cards
          React.createElement('div', { className: 'card stat-card' },
            React.createElement('div', { className: 'stat-value' }, reportData.total_patients),
            React.createElement('div', { className: 'stat-label' }, 'Total Patients')
          ),
          React.createElement('div', { className: 'card stat-card' },
            React.createElement('div', { className: 'stat-value' }, reportData.new_patients_this_month),
            React.createElement('div', { className: 'stat-label' }, 'New This Month')
          ),
          // Gender Chart
          React.createElement('div', { className: 'card chart-card', style: { gridColumn: 'span 2' } },
            React.createElement('h3', null, 'Gender Distribution'),
            React.createElement('div', { style: { height: '300px', display: 'flex', justifyContent: 'center' } },
               React.createElement(Pie, { data: getPieChartData(reportData.gender_distribution, '# of Patients') })
            )
          )
        );

      case 'appointments':
        return React.createElement('div', { className: 'reports-grid' },
           // Status Chart
           React.createElement('div', { className: 'card chart-card' },
             React.createElement('h3', null, 'Appointment Status'),
             React.createElement('div', { style: { height: '300px' } },
                React.createElement(Bar, { 
                  data: getBarChartData(reportData.status_distribution, 'Appointments'),
                  options: { maintainAspectRatio: false }
                })
             )
           ),
           // Type Chart
           React.createElement('div', { className: 'card chart-card' },
             React.createElement('h3', null, 'Appointment Types'),
             React.createElement('div', { style: { height: '300px', display: 'flex', justifyContent: 'center' } },
                React.createElement(Pie, { data: getPieChartData(reportData.type_distribution, 'Types') })
             )
           ),
           // Trend Chart
           React.createElement('div', { className: 'card chart-card', style: { gridColumn: '1 / -1' } },
             React.createElement('h3', null, '6-Month Appointment Trend'),
             React.createElement('div', { style: { height: '300px' } },
                React.createElement(Line, { 
                  data: getLineChartData(reportData.monthly_trend),
                  options: { maintainAspectRatio: false }
                })
             )
           )
        );

      case 'medications':
        return React.createElement('div', { className: 'reports-grid' },
          React.createElement('div', { className: 'card stat-card' },
            React.createElement('div', { className: 'stat-value' }, reportData.total_medications),
            React.createElement('div', { className: 'stat-label' }, 'Total Prescriptions')
          ),
          React.createElement('div', { className: 'card chart-card' },
             React.createElement('h3', null, 'Medication Status'),
             React.createElement('div', { style: { height: '300px' } },
                React.createElement(Bar, { 
                  data: getBarChartData(reportData.status_distribution, 'Medications'),
                  options: { maintainAspectRatio: false }
                })
             )
           ),
           // Top Medications Table
           React.createElement('div', { className: 'card', style: { gridColumn: '1 / -1', padding: '20px' } },
             React.createElement('h3', { style: { marginBottom: '15px' } }, 'Top 10 Prescribed Medications'),
             React.createElement('table', { className: 'table' },
               React.createElement('thead', null,
                 React.createElement('tr', null,
                   React.createElement('th', null, 'Medication Name'),
                   React.createElement('th', null, 'Prescription Count')
                 )
               ),
               React.createElement('tbody', null,
                 reportData.top_medications?.map((med, index) => (
                   React.createElement('tr', { key: index },
                     React.createElement('td', null, med.name),
                     React.createElement('td', null, med.count)
                   )
                 ))
               )
             )
           )
        );

      case 'list':
        return React.createElement('div', { className: 'card', style: { padding: '20px' } },
          React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' } },
             React.createElement('h3', null, `Full Patient List (${reportData.total_count})`),
             React.createElement('button', { 
               className: 'btn btn-primary',
               onClick: () => window.print() 
             }, '🖨️ Print Report')
          ),
          React.createElement('div', { style: { overflowX: 'auto' } },
            React.createElement('table', { className: 'table' },
              React.createElement('thead', null,
                React.createElement('tr', null,
                  React.createElement('th', null, 'Name'),
                  React.createElement('th', null, 'MRN'),
                  React.createElement('th', null, 'Contact'),
                  React.createElement('th', null, 'Appointments'),
                  React.createElement('th', null, 'Medications')
                )
              ),
              React.createElement('tbody', null,
                reportData.patients?.map(patient => (
                  React.createElement('tr', { key: patient.id },
                    React.createElement('td', { style: { fontWeight: '500' } }, patient.name),
                    React.createElement('td', null, patient.mrn),
                    React.createElement('td', null, 
                      React.createElement('div', null, patient.phone),
                      React.createElement('div', { style: { fontSize: '12px', color: 'var(--text-light)' } }, patient.email)
                    ),
                    React.createElement('td', null, patient.appointment_count),
                    React.createElement('td', null, patient.medication_count)
                  )
                ))
              )
            )
          )
        );

      default:
        return null;
    }
  };

  return React.createElement('div', { className: 'page-container' },
    React.createElement('div', { className: 'page-header' },
      React.createElement('h1', { className: 'page-title' }, '📊 Reports & Analytics'),
      React.createElement('p', { className: 'page-subtitle' }, 'View key metrics and generate reports')
    ),

    // Tabs
    React.createElement('div', { className: 'tabs', style: { marginBottom: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '20px' } },
      ['patients', 'appointments', 'medications', 'list'].map(tab => (
        React.createElement('button', {
          key: tab,
          className: `tab-btn ${activeTab === tab ? 'active' : ''}`,
          onClick: () => setActiveTab(tab),
          style: {
            padding: '12px 0',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === tab ? 'var(--primary)' : 'var(--text-light)',
            fontWeight: activeTab === tab ? '600' : '500',
            cursor: 'pointer',
            textTransform: 'capitalize',
            fontSize: '16px'
          }
        }, tab === 'list' ? 'Patient List' : `${tab} Report`)
      ))
    ),

    // Main Content
    renderContent()
  );
}
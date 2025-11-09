import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Medications() {
  const [medications, setMedications] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const { user } = useAuth();

  const API_BASE_URL = 'https://patient-management-system-in-python.onrender.com/api';

  // New medication form
  const [newMedication, setNewMedication] = useState({
    patient_id: '',
    name: '',
    dosage: '',
    frequency: '',
    route: 'oral',
    start_date: '',
    end_date: '',
    instructions: '',
    status: 'active'
  });

  const fetchMedications = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/medications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch medications');
      
      const data = await response.json();
      setMedications(data.medications || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/patients`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPatients(data.patients || []);
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    }
  };

  const refreshData = () => {
    fetchMedications();
    fetchPatients();
  };

  useEffect(() => {
    fetchMedications();
    fetchPatients();
  }, []);

  const handleAddMedication = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/medications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newMedication,
          prescribed_by: user?.name || 'Unknown Doctor'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add medication');
      }

      // Reset form and close modal
      setNewMedication({
        patient_id: '',
        name: '',
        dosage: '',
        frequency: '',
        route: 'oral',
        start_date: '',
        end_date: '',
        instructions: '',
        status: 'active'
      });
      setShowAddModal(false);
      fetchMedications();
      alert('Medication added successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewMedication(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-scheduled';
      case 'completed': return 'status-completed';
      case 'discontinued': return 'status-cancelled';
      default: return 'status-scheduled';
    }
  };

  const updateMedicationStatus = async (medicationId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/medications/${medicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchMedications();
        alert(`Medication marked as ${newStatus}`);
      }
    } catch (err) {
      setError('Failed to update medication status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  // Add Medication Modal
  const AddMedicationModal = () => {
    if (!showAddModal) return null;

    return React.createElement('div', {
      style: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
      }
    },
      React.createElement('div', {
        className: 'card',
        style: { width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }
      },
        React.createElement('div', {
          style: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)'
          }
        },
          React.createElement('h2', { style: { fontSize: '20px', fontWeight: '600' } }, 'Add New Medication'),
          React.createElement('button', {
            onClick: () => setShowAddModal(false),
            style: { background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: 'var(--text-light)' }
          }, '×')
        ),
        React.createElement('form', { onSubmit: handleAddMedication },
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Patient *'),
              React.createElement('select', {
                className: 'form-input',
                value: newMedication.patient_id,
                onChange: (e) => handleInputChange('patient_id', e.target.value),
                required: true, disabled: loading
              },
                React.createElement('option', { value: '' }, 'Select a patient'),
                patients.map(patient => 
                  React.createElement('option', { key: patient.id, value: patient.id }, `${patient.name} (MRN: ${patient.mrn})`)
                )
              )
            ),
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Medication Name *'),
              React.createElement('input', {
                type: 'text', className: 'form-input', placeholder: 'e.g., Amoxicillin 500mg',
                value: newMedication.name, onChange: (e) => handleInputChange('name', e.target.value),
                required: true, disabled: loading
              })
            )
          ),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Dosage'),
              React.createElement('input', {
                type: 'text', className: 'form-input', placeholder: 'e.g., 10mg',
                value: newMedication.dosage, onChange: (e) => handleInputChange('dosage', e.target.value),
                disabled: loading
              })
            ),
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Frequency'),
              React.createElement('input', {
                type: 'text', className: 'form-input', placeholder: 'e.g., Twice daily',
                value: newMedication.frequency, onChange: (e) => handleInputChange('frequency', e.target.value),
                disabled: loading
              })
            )
          ),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Route'),
              React.createElement('select', {
                className: 'form-input',
                value: newMedication.route, onChange: (e) => handleInputChange('route', e.target.value),
                disabled: loading
              },
                ['oral', 'iv', 'inhalation', 'topical', 'injection'].map(r => 
                  React.createElement('option', { key: r, value: r }, r.charAt(0).toUpperCase() + r.slice(1))
                )
              )
            ),
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Status'),
              React.createElement('select', {
                className: 'form-input',
                value: newMedication.status, onChange: (e) => handleInputChange('status', e.target.value),
                disabled: loading
              },
                ['active', 'completed', 'discontinued'].map(s => 
                  React.createElement('option', { key: s, value: s }, s.charAt(0).toUpperCase() + s.slice(1))
                )
              )
            )
          ),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Start Date'),
              React.createElement('input', {
                type: 'date', className: 'form-input',
                value: newMedication.start_date, onChange: (e) => handleInputChange('start_date', e.target.value),
                disabled: loading
              })
            ),
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'End Date'),
              React.createElement('input', {
                type: 'date', className: 'form-input',
                value: newMedication.end_date, onChange: (e) => handleInputChange('end_date', e.target.value),
                disabled: loading
              })
            )
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', { className: 'form-label' }, 'Instructions'),
            React.createElement('textarea', {
              className: 'form-input', rows: 3, placeholder: 'Special instructions...',
              value: newMedication.instructions, onChange: (e) => handleInputChange('instructions', e.target.value),
              disabled: loading
            })
          ),
          React.createElement('div', { style: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' } },
            React.createElement('button', { type: 'button', className: 'btn btn-outline', onClick: () => setShowAddModal(false), disabled: loading }, 'Cancel'),
            React.createElement('button', { type: 'submit', className: 'btn btn-primary', disabled: loading }, loading ? 'Adding...' : 'Add Medication')
          )
        )
      )
    );
  };

  return React.createElement('div', { className: 'page-container' },
    React.createElement('div', { className: 'page-header' },
      React.createElement('div', null,
        React.createElement('h1', { className: 'page-title' }, 'Medications'),
        React.createElement('p', { className: 'page-subtitle' }, 'Manage patient prescriptions')
      ),
      React.createElement('div', { style: { display: 'flex', gap: '12px' } },
        React.createElement('button', { onClick: refreshData, className: 'btn btn-outline', disabled: loading }, loading ? '...' : '⟳ Refresh'),
        React.createElement('button', { onClick: () => setShowAddModal(true), className: 'btn btn-primary' }, '+ Add Medication')
      )
    ),

    error && React.createElement('div', { className: 'alert alert-error' }, error),
    React.createElement(AddMedicationModal),

    loading && !medications.length ? React.createElement('div', { className: 'loading' }, 'Loading medications...') :
    medications.length === 0 ? 
      React.createElement('div', { className: 'card empty-state' },
        React.createElement('div', { style: { fontSize: '48px', marginBottom: '16px' } }, '💊'),
        React.createElement('h3', { style: { marginBottom: '8px' } }, 'No medications found'),
        React.createElement('p', { style: { marginBottom: '24px' } }, 'Add your first medication to get started'),
        React.createElement('button', { onClick: () => setShowAddModal(true), className: 'btn btn-primary' }, 'Add First Medication')
      ) :
      React.createElement('div', { className: 'grid-container' },
        medications.map(med => {
          const patient = patients.find(p => p.id === med.patient_id);
          return React.createElement('div', { key: med.id, className: 'card appointment-card' },
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' } },
               React.createElement('div', null,
                 React.createElement('div', { style: { fontWeight: '600', fontSize: '16px', color: 'var(--primary)' } }, med.name),
                 React.createElement('div', { style: { color: 'var(--text-light)', fontSize: '14px', marginTop: '4px' } }, patient ? `Patient: ${patient.name}` : 'Unknown Patient')
               ),
               React.createElement('div', { className: `status-badge ${getStatusColor(med.status)}` }, med.status)
            ),
            React.createElement('div', { style: { fontSize: '14px' } },
               React.createElement('div', { className: 'flex-between', style: { marginBottom: '8px' } },
                 React.createElement('span', { style: { color: 'var(--text-light)' } }, 'Dosage:'),
                 React.createElement('span', { style: { fontWeight: '500' } }, med.dosage || 'N/A')
               ),
               React.createElement('div', { className: 'flex-between', style: { marginBottom: '8px' } },
                 React.createElement('span', { style: { color: 'var(--text-light)' } }, 'Frequency:'),
                 React.createElement('span', { style: { fontWeight: '500' } }, med.frequency || 'N/A')
               ),
               React.createElement('div', { className: 'flex-between' },
                 React.createElement('span', { style: { color: 'var(--text-light)' } }, 'Prescribed By:'),
                 React.createElement('span', { style: { fontWeight: '500' } }, med.prescribed_by)
               )
            ),
            med.status === 'active' && React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '20px' } },
               React.createElement('button', {
                 className: 'btn btn-outline',
                 onClick: () => updateMedicationStatus(med.id, 'completed'),
                 style: { flex: 1, fontSize: '13px', color: 'var(--success)', borderColor: 'var(--success)' }
               }, '✓ Complete'),
               React.createElement('button', {
                 className: 'btn btn-outline',
                 onClick: () => updateMedicationStatus(med.id, 'discontinued'),
                 style: { flex: 1, fontSize: '13px', color: 'var(--error)', borderColor: 'var(--error)' }
               }, '✕ Stop')
            )
          );
        })
      )
  );
}
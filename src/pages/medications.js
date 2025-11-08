import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Medications() {
  const [medications, setMedications] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const { user } = useAuth();

  // API Base URL for production
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
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/medications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch medications');
      }
      
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      if (!token) {
        throw new Error('No authentication token found');
      }

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
      
      // Refresh medications list
      fetchMedications();
      
      alert('Medication added successfully!');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewMedication(prev => ({
      ...prev,
      [field]: value
    }));
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
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }
    },
      React.createElement('div', {
        className: 'card',
        style: {
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto'
        }
      },
        React.createElement('div', {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border)'
          }
        },
          React.createElement('h2', {
            style: {
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text)'
            }
          }, 'Add New Medication'),
          React.createElement('button', {
            onClick: () => setShowAddModal(false),
            style: {
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: 'var(--text-light)'
            }
          }, '×')
        ),

        React.createElement('form', { onSubmit: handleAddMedication },
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Patient *'),
              React.createElement('select',
                {
                  className: 'form-input',
                  value: newMedication.patient_id,
                  onChange: (e) => handleInputChange('patient_id', e.target.value),
                  required: true,
                  disabled: loading
                },
                React.createElement('option', { value: '' }, 'Select a patient'),
                patients.map(patient => 
                  React.createElement('option', { 
                    key: patient.id, 
                    value: patient.id 
                  }, `${patient.name} (MRN: ${patient.mrn})`)
                )
              )
            ),

            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Medication Name *'),
              React.createElement('input', {
                type: 'text',
                className: 'form-input',
                placeholder: 'e.g., Amoxicillin 500mg',
                value: newMedication.name,
                onChange: (e) => handleInputChange('name', e.target.value),
                required: true,
                disabled: loading
              })
            )
          ),

          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Dosage'),
              React.createElement('input', {
                type: 'text',
                className: 'form-input',
                placeholder: 'e.g., 10mg twice daily',
                value: newMedication.dosage,
                onChange: (e) => handleInputChange('dosage', e.target.value),
                disabled: loading
              })
            ),

            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Frequency'),
              React.createElement('input', {
                type: 'text',
                className: 'form-input',
                placeholder: 'e.g., Once daily',
                value: newMedication.frequency,
                onChange: (e) => handleInputChange('frequency', e.target.value),
                disabled: loading
              })
            )
          ),

          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Route'),
              React.createElement('select',
                {
                  className: 'form-input',
                  value: newMedication.route,
                  onChange: (e) => handleInputChange('route', e.target.value),
                  disabled: loading
                },
                React.createElement('option', { value: 'oral' }, 'Oral'),
                React.createElement('option', { value: 'iv' }, 'IV'),
                React.createElement('option', { value: 'inhalation' }, 'Inhalation'),
                React.createElement('option', { value: 'topical' }, 'Topical'),
                React.createElement('option', { value: 'injection' }, 'Injection')
              )
            ),

            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Status'),
              React.createElement('select',
                {
                  className: 'form-input',
                  value: newMedication.status,
                  onChange: (e) => handleInputChange('status', e.target.value),
                  disabled: loading
                },
                React.createElement('option', { value: 'active' }, 'Active'),
                React.createElement('option', { value: 'completed' }, 'Completed'),
                React.createElement('option', { value: 'discontinued' }, 'Discontinued')
              )
            )
          ),

          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Start Date'),
              React.createElement('input', {
                type: 'date',
                className: 'form-input',
                value: newMedication.start_date,
                onChange: (e) => handleInputChange('start_date', e.target.value),
                disabled: loading
              })
            ),

            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'End Date'),
              React.createElement('input', {
                type: 'date',
                className: 'form-input',
                value: newMedication.end_date,
                onChange: (e) => handleInputChange('end_date', e.target.value),
                disabled: loading
              })
            )
          ),

          React.createElement('div', { className: 'form-group' },
            React.createElement('label', { className: 'form-label' }, 'Instructions'),
            React.createElement('textarea', {
              className: 'form-input',
              rows: 3,
              placeholder: 'Special instructions for the patient...',
              value: newMedication.instructions,
              onChange: (e) => handleInputChange('instructions', e.target.value),
              disabled: loading
            })
          ),

          React.createElement('div', {
            style: {
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '24px'
            }
          },
            React.createElement('button', {
              type: 'button',
              className: 'btn btn-outline',
              onClick: () => setShowAddModal(false),
              disabled: loading
            }, 'Cancel'),
            React.createElement('button', {
              type: 'submit',
              className: 'btn btn-primary',
              disabled: loading
            }, loading ? 'Adding...' : 'Add Medication')
          )
        )
      )
    );
  };

  return React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '24px' } },
    // Header
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' } },
      React.createElement('div', null,
        React.createElement('h1', { 
          style: { 
            fontSize: '28px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '4px'
          } 
        }, 'Medications'),
        React.createElement('p', { 
          style: { 
            color: 'var(--text-light)',
            fontSize: '16px'
          } 
        }, 'Manage patient medications and prescriptions')
      ),
      
      React.createElement('div', { style: { display: 'flex', gap: '12px' } },
        React.createElement('button', { 
          onClick: refreshData,
          className: 'btn btn-outline',
          disabled: loading
        }, loading ? 'Refreshing...' : '⟳ Refresh'),
        React.createElement('button', { 
          onClick: () => setShowAddModal(true),
          className: 'btn btn-primary'
        }, '+ Add Medication')
      )
    ),

    error && React.createElement('div', { className: 'alert alert-error' }, error),

    // Add Medication Modal
    React.createElement(AddMedicationModal),

    loading ? React.createElement('div', { className: 'loading' }, 'Loading medications...') :
    medications.length === 0 ? 
      React.createElement('div', { className: 'card', style: { textAlign: 'center', padding: '60px' } },
        React.createElement('div', { style: { fontSize: '48px', marginBottom: '16px' } }, '💊'),
        React.createElement('h3', { style: { marginBottom: '8px', color: 'var(--text)' } }, 'No medications found'),
        React.createElement('p', { style: { color: 'var(--text-light)', marginBottom: '20px' } }, 
          'Add your first medication to get started'
        ),
        React.createElement('button', {
          onClick: () => setShowAddModal(true),
          className: 'btn btn-primary'
        }, 'Add First Medication')
      ) :
      React.createElement('div', { className: 'grid-container' },
        medications.map(medication => {
          const patient = patients.find(p => p.id === medication.patient_id);
          
          return React.createElement('div', { 
            key: medication.id,
            className: 'card patient-card'
          },
            React.createElement('div', { className: 'card-header' },
              React.createElement('div', null,
                React.createElement('div', { className: 'card-title' }, medication.name || 'Unnamed Medication'),
                React.createElement('div', { className: 'card-subtitle' }, 
                  patient ? `Patient: ${patient.name}` : 'Patient not found'
                )
              ),
              React.createElement('div', { 
                className: `status-badge ${getStatusColor(medication.status)}` 
              }, medication.status || 'active')
            ),
            
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' } },
              React.createElement('div', null,
                React.createElement('div', { style: { fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' } }, 'Dosage'),
                React.createElement('div', { style: { fontSize: '14px', fontWeight: '500' } }, medication.dosage || 'Not specified')
              ),
              React.createElement('div', null,
                React.createElement('div', { style: { fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' } }, 'Frequency'),
                React.createElement('div', { style: { fontSize: '14px', fontWeight: '500' } }, medication.frequency || 'Not specified')
              )
            ),
            
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' } },
              React.createElement('div', null,
                React.createElement('div', { style: { fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' } }, 'Route'),
                React.createElement('div', { style: { 
                  padding: '2px 8px', 
                  backgroundColor: '#f1f5f9', 
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  display: 'inline-block',
                  textTransform: 'capitalize'
                } }, medication.route || 'oral')
              ),
              React.createElement('div', null,
                React.createElement('div', { style: { fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' } }, 'Prescribed By'),
                React.createElement('div', { style: { fontSize: '14px', fontWeight: '500' } }, medication.prescribed_by || 'Unknown Doctor')
              )
            ),

            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' } },
              React.createElement('div', null,
                React.createElement('div', { style: { fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' } }, 'Start Date'),
                React.createElement('div', { style: { fontSize: '14px', fontWeight: '500' } }, formatDate(medication.start_date))
              ),
              React.createElement('div', null,
                React.createElement('div', { style: { fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' } }, 'End Date'),
                React.createElement('div', { style: { fontSize: '14px', fontWeight: '500' } }, formatDate(medication.end_date))
              )
            ),
            
            medication.instructions && React.createElement('div', { style: { marginBottom: '12px' } },
              React.createElement('div', { style: { fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' } }, 'Instructions'),
              React.createElement('div', { style: { fontSize: '14px', fontStyle: 'italic' } }, medication.instructions)
            ),
            
            React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' } },
              medication.status === 'active' && React.createElement('button', {
                onClick: () => updateMedicationStatus(medication.id, 'completed'),
                className: 'btn btn-outline',
                style: { fontSize: '12px', padding: '6px 12px', color: 'var(--success)', borderColor: 'var(--success)' }
              }, 'Mark Complete'),
              
              medication.status === 'active' && React.createElement('button', {
                onClick: () => updateMedicationStatus(medication.id, 'discontinued'),
                className: 'btn btn-outline',
                style: { fontSize: '12px', padding: '6px 12px', color: 'var(--error)', borderColor: 'var(--error)' }
              }, 'Discontinue'),
              
              React.createElement('button', {
                onClick: () => alert(`Edit ${medication.name}`),
                className: 'btn btn-outline',
                style: { fontSize: '12px', padding: '6px 12px' }
              }, 'Edit')
            )
          );
        })
      )
  );
}
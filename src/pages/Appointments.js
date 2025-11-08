import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const { user } = useAuth();

  // API Base URL
  const API_BASE_URL = 'https://patient-management-system-in-python.onrender.com/api';

  // New appointment form state
  const [newAppointment, setNewAppointment] = useState({
    patient_id: '',
    doctor_name: user?.name || '',
    appointment_date: '',
    duration: 30,
    type: 'consultation',
    notes: ''
  });

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to fetch appointments');
      
      const data = await response.json();
      setAppointments(data.appointments || []);
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

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
  }, []);

  const handleScheduleAppointment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAppointment)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule appointment');
      }

      // Reset form and close modal
      setNewAppointment({
        patient_id: '',
        doctor_name: user?.name || '',
        appointment_date: '',
        duration: 30,
        type: 'consultation',
        notes: ''
      });
      setShowScheduleModal(false);
      fetchAppointments();
      alert('Appointment scheduled successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewAppointment(prev => ({ ...prev, [field]: value }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'status-scheduled';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-scheduled';
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchAppointments();
        alert(`Appointment marked as ${newStatus}`);
      }
    } catch (err) {
      setError('Failed to update appointment status');
    }
  };

  // --- Schedule Modal Component ---
  const ScheduleModal = () => {
    if (!showScheduleModal) return null;

    return React.createElement('div', {
      style: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '20px'
      }
    },
      React.createElement('div', {
        className: 'card',
        style: { width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }
      },
        React.createElement('div', {
          style: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border)'
          }
        },
          React.createElement('h2', { style: { fontSize: '20px', fontWeight: '600' } }, 'Schedule Appointment'),
          React.createElement('button', {
            onClick: () => setShowScheduleModal(false),
            style: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-light)' }
          }, '×')
        ),
        React.createElement('form', { onSubmit: handleScheduleAppointment },
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', { className: 'form-label' }, 'Patient *'),
            React.createElement('select', {
              className: 'form-input',
              value: newAppointment.patient_id,
              onChange: (e) => handleInputChange('patient_id', e.target.value),
              required: true,
              disabled: loading
            },
              React.createElement('option', { value: '' }, 'Select a patient'),
              patients.map(patient => 
                React.createElement('option', { key: patient.id, value: patient.id }, 
                  `${patient.name} (MRN: ${patient.mrn})`
                )
              )
            )
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', { className: 'form-label' }, 'Date & Time *'),
            React.createElement('input', {
              type: 'datetime-local',
              className: 'form-input',
              value: newAppointment.appointment_date,
              onChange: (e) => handleInputChange('appointment_date', e.target.value),
              required: true,
              disabled: loading
            })
          ),
          React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Type'),
              React.createElement('select', {
                className: 'form-input',
                value: newAppointment.type,
                onChange: (e) => handleInputChange('type', e.target.value),
                disabled: loading
              },
                React.createElement('option', { value: 'consultation' }, 'Consultation'),
                React.createElement('option', { value: 'follow-up' }, 'Follow-up'),
                React.createElement('option', { value: 'checkup' }, 'Checkup'),
                React.createElement('option', { value: 'emergency' }, 'Emergency')
              )
            ),
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Duration (min)'),
              React.createElement('select', {
                className: 'form-input',
                value: newAppointment.duration,
                onChange: (e) => handleInputChange('duration', parseInt(e.target.value)),
                disabled: loading
              },
                React.createElement('option', { value: 15 }, '15 mins'),
                React.createElement('option', { value: 30 }, '30 mins'),
                React.createElement('option', { value: 45 }, '45 mins'),
                React.createElement('option', { value: 60 }, '60 mins')
              )
            )
          ),
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', { className: 'form-label' }, 'Notes'),
            React.createElement('textarea', {
              className: 'form-input',
              rows: 3,
              value: newAppointment.notes,
              onChange: (e) => handleInputChange('notes', e.target.value),
              disabled: loading,
              placeholder: 'Reason for visit...'
            })
          ),
          React.createElement('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' } },
            React.createElement('button', {
              type: 'button',
              className: 'btn btn-outline',
              onClick: () => setShowScheduleModal(false),
              disabled: loading
            }, 'Cancel'),
            React.createElement('button', {
              type: 'submit',
              className: 'btn btn-primary',
              disabled: loading
            }, loading ? 'Scheduling...' : 'Schedule Appointment')
          )
        )
      )
    );
  };

  // --- Main Render ---
  return React.createElement('div', { className: 'page-container' },
    React.createElement('div', { className: 'page-header' },
      React.createElement('div', null,
        React.createElement('h1', { className: 'page-title' }, 'Appointments'),
        React.createElement('p', { className: 'page-subtitle' }, 'Manage patient appointments and schedules')
      ),
      React.createElement('button', {
        className: 'btn btn-primary',
        onClick: () => setShowScheduleModal(true)
      }, '+ New Appointment')
    ),

    error && React.createElement('div', { className: 'alert alert-error' }, error),
    React.createElement(ScheduleModal),

    loading && !appointments.length ? 
      React.createElement('div', { className: 'loading' }, 'Loading appointments...') :
      appointments.length === 0 ?
        React.createElement('div', { className: 'empty-state' },
          React.createElement('div', { style: { fontSize: '48px', marginBottom: '16px' } }, '📅'),
          React.createElement('h3', null, 'No appointments scheduled'),
          React.createElement('p', null, 'Get started by scheduling your first appointment'),
          React.createElement('button', {
            className: 'btn btn-primary',
            onClick: () => setShowScheduleModal(true),
            style: { marginTop: '16px' }
          }, 'Schedule Now')
        ) :
        React.createElement('div', { className: 'grid-container' },
          appointments.map(apt => {
            const aptDate = new Date(apt.appointment_date);
            return React.createElement('div', { key: apt.id, className: 'card appointment-card' },
              React.createElement('div', { className: 'card-header' },
                React.createElement('div', null,
                  React.createElement('div', { className: 'card-title' }, apt.patient_name),
                  React.createElement('div', { className: 'card-subtitle' },
                    `${aptDate.toLocaleDateString()} at ${aptDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                  )
                ),
                React.createElement('div', { className: `status-badge ${getStatusColor(apt.status)}` },
                  apt.status
                )
              ),
              React.createElement('div', { style: { marginTop: '12px', fontSize: '14px' } },
                React.createElement('div', { style: { display: 'flex', gap: '12px', marginBottom: '8px' } },
                  React.createElement('span', { style: { color: 'var(--text-light)' } }, 'Type:'),
                  React.createElement('span', { style: { fontWeight: '500', textTransform: 'capitalize' } }, apt.type)
                ),
                React.createElement('div', { style: { display: 'flex', gap: '12px', marginBottom: '8px' } },
                  React.createElement('span', { style: { color: 'var(--text-light)' } }, 'Doctor:'),
                  React.createElement('span', { style: { fontWeight: '500' } }, apt.doctor_name)
                ),
                React.createElement('div', { style: { display: 'flex', gap: '12px' } },
                  React.createElement('span', { style: { color: 'var(--text-light)' } }, 'Duration:'),
                  React.createElement('span', { style: { fontWeight: '500' } }, `${apt.duration} mins`)
                )
              ),
              apt.status === 'scheduled' && React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '16px' } },
                React.createElement('button', {
                  className: 'btn btn-outline',
                  onClick: () => updateAppointmentStatus(apt.id, 'completed'),
                  style: { flex: 1, fontSize: '12px', color: 'var(--success)', borderColor: 'var(--success)' }
                }, 'Complete'),
                React.createElement('button', {
                  className: 'btn btn-outline',
                  onClick: () => updateAppointmentStatus(apt.id, 'cancelled'),
                  style: { flex: 1, fontSize: '12px', color: 'var(--error)', borderColor: 'var(--error)' }
                }, 'Cancel')
              )
            );
          })
        )
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  // API Base URL for production
  const API_BASE_URL = 'https://patient-management-system-in-python.onrender.com/api';

  const [newPatient, setNewPatient] = useState({
    name: '',
    mrn: '',
    date_of_birth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    emergency_contact: '',
    medical_history: '',
    allergies: '',
    current_medications: ''
  });

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = searchTerm ? `/patients?search=${encodeURIComponent(searchTerm)}` : '/patients';
      
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      
      const data = await response.json();
      setPatients(data.patients || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPatient)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create patient');
      }
      
      const data = await response.json();
      setShowAddModal(false);
      setNewPatient({
        name: '', mrn: '', date_of_birth: '', gender: '', phone: '', email: '',
        address: '', emergency_contact: '', medical_history: '', allergies: '', current_medications: ''
      });
      fetchPatients(); // Refresh the list
      
      // Show success message
      alert(`Patient ${data.patient.name} created successfully!`);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setNewPatient(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearSearch = () => {
    setSearchTerm('');
    fetchPatients();
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients();
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const viewPatientDetails = (patientId) => {
    navigate(`/patients/${patientId}`);
  };

  const editPatient = (patientId) => {
    alert(`Edit patient with ID: ${patientId}`);
    // You can implement edit functionality here
  };

  return React.createElement('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '24px' } },
    // Header with Search
    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' } },
      React.createElement('div', null,
        React.createElement('h1', { 
          style: { 
            fontSize: '28px',
            fontWeight: '700',
            color: 'var(--text)',
            marginBottom: '4px'
          } 
        }, 'Patients'),
        React.createElement('p', { 
          style: { 
            color: 'var(--text-light)',
            fontSize: '16px'
          } 
        }, 'Manage patient records and information')
      ),
      
      React.createElement('div', { style: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' } },
        React.createElement('form', { onSubmit: handleSearch, style: { display: 'flex', gap: '8px' } },
          React.createElement('input', {
            type: 'text',
            className: 'form-input',
            placeholder: 'Search by name, MRN, or phone...',
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            style: { width: '250px', minWidth: '200px' }
          }),
          React.createElement('button', {
            type: 'submit',
            className: 'btn btn-outline',
            disabled: loading
          }, '🔍 Search')
        ),
        searchTerm && React.createElement('button', {
          onClick: clearSearch,
          className: 'btn btn-outline',
          style: { color: 'var(--error)' }
        }, '✕ Clear'),
        React.createElement('button', { 
          onClick: fetchPatients,
          className: 'btn btn-outline',
          disabled: loading
        }, loading ? '⟳ Refreshing...' : '⟳ Refresh'),
        React.createElement('button', { 
          onClick: () => setShowAddModal(true),
          className: 'btn btn-primary'
        }, '+ Add Patient')
      )
    ),

    error && React.createElement('div', { className: 'alert alert-error' }, error),

    // Stats Summary
    !loading && patients.length > 0 && React.createElement('div', { 
      style: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px' 
      } 
    },
      React.createElement('div', { className: 'card stat-card' },
        React.createElement('div', { className: 'stat-value' }, patients.length),
        React.createElement('div', { className: 'stat-label' }, 'Total Patients')
      ),
      React.createElement('div', { className: 'card stat-card' },
        React.createElement('div', { className: 'stat-value' }, 
          patients.filter(p => p.gender === 'male').length
        ),
        React.createElement('div', { className: 'stat-label' }, 'Male')
      ),
      React.createElement('div', { className: 'card stat-card' },
        React.createElement('div', { className: 'stat-value' }, 
          patients.filter(p => p.gender === 'female').length
        ),
        React.createElement('div', { className: 'stat-label' }, 'Female')
      )
    ),

    // Add Patient Modal
    showAddModal && React.createElement('div', {
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
              fontWeight: '600'
            }
          }, 'Add New Patient'),
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

        React.createElement('form', { onSubmit: handleAddPatient },
          React.createElement('div', {
            style: {
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '20px'
            }
          },
            // Left Column
            React.createElement('div', null,
              React.createElement('div', { className: 'form-group' },
                React.createElement('label', { className: 'form-label' }, 'Full Name *'),
                React.createElement('input', {
                  type: 'text',
                  className: 'form-input',
                  placeholder: 'John Doe',
                  value: newPatient.name,
                  onChange: (e) => handleInputChange('name', e.target.value),
                  required: true,
                  disabled: loading
                })
              ),
              React.createElement('div', { className: 'form-group' },
                React.createElement('label', { className: 'form-label' }, 'MRN'),
                React.createElement('input', {
                  type: 'text',
                  className: 'form-input',
                  placeholder: 'Auto-generated if empty',
                  value: newPatient.mrn,
                  onChange: (e) => handleInputChange('mrn', e.target.value),
                  disabled: loading
                })
              ),
              React.createElement('div', { className: 'form-group' },
                React.createElement('label', { className: 'form-label' }, 'Date of Birth *'),
                React.createElement('input', {
                  type: 'date',
                  className: 'form-input',
                  value: newPatient.date_of_birth,
                  onChange: (e) => handleInputChange('date_of_birth', e.target.value),
                  required: true,
                  disabled: loading
                })
              ),
              React.createElement('div', { className: 'form-group' },
                React.createElement('label', { className: 'form-label' }, 'Gender'),
                React.createElement('select', {
                  className: 'form-input',
                  value: newPatient.gender,
                  onChange: (e) => handleInputChange('gender', e.target.value),
                  disabled: loading
                },
                  React.createElement('option', { value: '' }, 'Select Gender'),
                  React.createElement('option', { value: 'male' }, 'Male'),
                  React.createElement('option', { value: 'female' }, 'Female'),
                  React.createElement('option', { value: 'other' }, 'Other')
                )
              )
            ),

            // Right Column
            React.createElement('div', null,
              React.createElement('div', { className: 'form-group' },
                React.createElement('label', { className: 'form-label' }, 'Phone'),
                React.createElement('input', {
                  type: 'tel',
                  className: 'form-input',
                  placeholder: '+1 (555) 123-4567',
                  value: newPatient.phone,
                  onChange: (e) => handleInputChange('phone', e.target.value),
                  disabled: loading
                })
              ),
              React.createElement('div', { className: 'form-group' },
                React.createElement('label', { className: 'form-label' }, 'Email'),
                React.createElement('input', {
                  type: 'email',
                  className: 'form-input',
                  placeholder: 'patient@example.com',
                  value: newPatient.email,
                  onChange: (e) => handleInputChange('email', e.target.value),
                  disabled: loading
                })
              ),
              React.createElement('div', { className: 'form-group' },
                React.createElement('label', { className: 'form-label' }, 'Emergency Contact'),
                React.createElement('input', {
                  type: 'text',
                  className: 'form-input',
                  placeholder: 'Emergency contact details',
                  value: newPatient.emergency_contact,
                  onChange: (e) => handleInputChange('emergency_contact', e.target.value),
                  disabled: loading
                })
              )
            )
          ),

          // Full width fields
          React.createElement('div', { className: 'form-group' },
            React.createElement('label', { className: 'form-label' }, 'Address'),
            React.createElement('textarea', {
              className: 'form-input',
              placeholder: 'Full address',
              rows: 2,
              value: newPatient.address,
              onChange: (e) => handleInputChange('address', e.target.value),
              disabled: loading
            })
          ),

          React.createElement('div', {
            style: {
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }
          },
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Medical History'),
              React.createElement('textarea', {
                className: 'form-input',
                placeholder: 'Past medical conditions, surgeries, etc.',
                rows: 3,
                value: newPatient.medical_history,
                onChange: (e) => handleInputChange('medical_history', e.target.value),
                disabled: loading
              })
            ),
            React.createElement('div', { className: 'form-group' },
              React.createElement('label', { className: 'form-label' }, 'Allergies'),
              React.createElement('textarea', {
                className: 'form-input',
                placeholder: 'Known allergies',
                rows: 3,
                value: newPatient.allergies,
                onChange: (e) => handleInputChange('allergies', e.target.value),
                disabled: loading
              })
            )
          ),

          React.createElement('div', { className: 'form-group' },
            React.createElement('label', { className: 'form-label' }, 'Current Medications'),
            React.createElement('textarea', {
              className: 'form-input',
              placeholder: 'Current medications and dosages',
              rows: 2,
              value: newPatient.current_medications,
              onChange: (e) => handleInputChange('current_medications', e.target.value),
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
            }, loading ? 'Creating...' : 'Create Patient')
          )
        )
      )
    ),

    // Patients List
    loading ? React.createElement('div', { className: 'loading' }, 'Loading patients...') :
    patients.length === 0 ? 
      React.createElement('div', { className: 'card', style: { textAlign: 'center', padding: '60px' } },
        React.createElement('div', { style: { fontSize: '48px', marginBottom: '16px' } }, '👥'),
        React.createElement('h3', { style: { marginBottom: '8px', color: 'var(--text)' } }, 'No patients found'),
        React.createElement('p', { style: { color: 'var(--text-light)', marginBottom: '20px' } }, 
          searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first patient'
        ),
        React.createElement('button', {
          onClick: () => setShowAddModal(true),
          className: 'btn btn-primary'
        }, 'Add First Patient')
      ) :
      React.createElement('div', { className: 'grid-container' },
        patients.map(patient => {
          const age = calculateAge(patient.date_of_birth);
          
          return React.createElement('div', { 
            key: patient.id,
            className: 'card patient-card'
          },
            React.createElement('div', { className: 'card-header' },
              React.createElement('div', null,
                React.createElement('div', { className: 'card-title' }, patient.name || 'Unknown Patient'),
                React.createElement('div', { className: 'card-subtitle' }, 
                  `MRN: ${patient.mrn || 'N/A'} • Age: ${age}`
                )
              ),
              React.createElement('div', { 
                style: { 
                  padding: '4px 12px', 
                  backgroundColor: '#f0fdf4', 
                  color: '#166534',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500'
                } 
              }, 'Active')
            ),
            
            React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' } },
              React.createElement('div', null,
                React.createElement('div', { style: { fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' } }, 'Gender'),
                React.createElement('div', { style: { fontSize: '14px', fontWeight: '500', textTransform: 'capitalize' } }, 
                  patient.gender || 'Not specified'
                )
              ),
              React.createElement('div', null,
                React.createElement('div', { style: { fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' } }, 'Phone'),
                React.createElement('div', { style: { fontSize: '14px', fontWeight: '500' } }, patient.phone || 'N/A')
              )
            ),
            
            React.createElement('div', { style: { marginBottom: '12px' } },
              React.createElement('div', { style: { fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' } }, 'Email'),
              React.createElement('div', { style: { fontSize: '14px', fontWeight: '500' } }, patient.email || 'N/A')
            ),
            
            patient.allergies && React.createElement('div', { style: { marginBottom: '12px' } },
              React.createElement('div', { style: { fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' } }, 'Allergies'),
              React.createElement('div', { style: { fontSize: '14px', color: '#dc2626', fontStyle: 'italic' } }, patient.allergies)
            ),
            
            React.createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' } },
              React.createElement('button', {
                onClick: () => viewPatientDetails(patient.id),
                className: 'btn btn-outline',
                style: { fontSize: '12px', padding: '8px 12px' }
              }, 'View Details'),
              React.createElement('button', {
                onClick: () => editPatient(patient.id),
                className: 'btn btn-outline',
                style: { fontSize: '12px', padding: '8px 12px' }
              }, 'Edit'),
              React.createElement('button', {
                onClick: () => navigate(`/appointments?patient=${patient.id}`),
                className: 'btn btn-outline',
                style: { fontSize: '12px', padding: '8px 12px', color: 'var(--primary)', borderColor: 'var(--primary)' }
              }, 'Schedule Visit')
            )
          );
        })
      )
  );
}
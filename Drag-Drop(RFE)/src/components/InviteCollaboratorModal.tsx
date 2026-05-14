import React, { useState } from 'react';
import { useUsers, User } from '../hooks/useUsers';
import UserDropdown from './UserDropdown';

interface InviteCollaboratorModalProps {
  appId: string;
  appName: string;
  onClose: () => void;
  onInvite: (appId: string, userId: string, role: string) => Promise<void>;
}

const getInitials = (firstName?: string, lastName?: string) => {
  return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase() || '?';
};

const InviteCollaboratorModal: React.FC<InviteCollaboratorModalProps> = ({ appId, appName, onClose, onInvite }) => {
  const { users, loading, error } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Modal flow state
  // 1: User Selection, 2: Role Confirmation, 3: Final Review
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleInvite = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await onInvite(appId, selectedUser.id, 'EDITOR');
      onClose(); // Automatically close on success
    } catch (err: any) {
      console.error('Failed to invite:', err);
      setErrorMessage(err.message || 'Failed to send invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = ['Select User', 'Role', 'Confirm'];

  return (
    <div className="import-modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="import-modal" style={{ maxWidth: '500px', width: '100%', background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontWeight: 600, color: '#212529', fontSize: '1.25rem' }}>Invite to {appName}</h3>
          <i className="fa fa-times close-btn" onClick={onClose} style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#6c757d', padding: '4px' }} />
        </div>

        {/* Improved Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', position: 'relative', padding: '0 10px' }}>
          <div style={{ position: 'absolute', top: '15px', left: '30px', right: '30px', height: '2px', background: '#e9ecef', zIndex: 1 }}></div>
          {steps.map((label, idx) => {
            const stepNum = idx + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;
            const primaryColor = '#0d6efd';
            
            return (
              <div key={label} style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', padding: '0 10px' }}>
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  background: isActive || isCompleted ? primaryColor : '#fff',
                  color: isActive || isCompleted ? '#fff' : '#adb5bd',
                  fontWeight: '600', fontSize: '0.9rem', marginBottom: '8px',
                  border: `2px solid ${isActive || isCompleted ? primaryColor : '#dee2e6'}`,
                  transition: 'all 0.3s ease'
                }}>
                  {isCompleted ? <i className="fa fa-check" /> : stepNum}
                </div>
                <span style={{ fontSize: '0.8rem', color: isActive ? '#212529' : '#6c757d', fontWeight: isActive ? 600 : 400, transition: 'color 0.3s' }}>{label}</span>
              </div>
            );
          })}
        </div>

        {errorMessage && (
          <div style={{ 
            background: '#fff5f5', 
            color: '#c53030', 
            padding: '12px 16px', 
            borderRadius: '8px', 
            border: '1px solid #feb2b2',
            marginBottom: '20px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <i className="fa fa-exclamation-circle"></i>
            <span>{errorMessage}</span>
          </div>
        )}

        <div style={{ minHeight: '180px', animation: 'fadeIn 0.3s ease-in-out' }}>
          {step === 1 && (
            <div>
              <UserDropdown
                users={users}
                loading={loading}
                error={error}
                selectedUser={selectedUser}
                onSelectUser={setSelectedUser}
              />
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '12px', color: '#495057' }}>Assigned Role</label>
                <div style={{ display: 'inline-block', background: '#e0cffc', color: '#5a32a3', padding: '6px 12px', borderRadius: '20px', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                  EDITOR
                </div>
                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#6c757d', fontSize: '0.9rem' }}>
                  <i className="fa fa-info-circle"></i>
                  <span>This role cannot be changed. Collaborators will have full edit access to the application.</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && selectedUser && (
            <div>
              <p style={{ color: '#495057', marginBottom: '16px' }}>You are about to invite this user as an <strong>EDITOR</strong>:</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #dee2e6' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0d6efd', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 2px 4px rgba(13, 110, 253, 0.2)' }}>
                  {getInitials(selectedUser.firstName, selectedUser.lastName)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <span style={{ fontWeight: 600, color: '#212529', fontSize: '1.1rem' }}>{selectedUser.firstName} {selectedUser.lastName}</span>
                  <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>{selectedUser.email}</span>
                </div>
                <div style={{ background: '#e0cffc', color: '#5a32a3', padding: '4px 10px', borderRadius: '12px', fontWeight: 600, fontSize: '0.75rem' }}>
                  EDITOR
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e9ecef', paddingTop: '20px', marginTop: '24px' }}>
          {step > 1 && (
            <button 
              className="secondary-btn" 
              onClick={handleBack} 
              disabled={isSubmitting}
              style={{ padding: '8px 20px', transition: 'all 0.2s', borderRadius: '6px' }}
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button 
              className="primary-btn" 
              onClick={handleNext} 
              disabled={!selectedUser}
              style={{ padding: '8px 24px', transition: 'all 0.2s', borderRadius: '6px', opacity: !selectedUser ? 0.6 : 1 }}
            >
              Next
            </button>
          ) : (
            <button 
              className="primary-btn" 
              onClick={handleInvite}
              disabled={isSubmitting}
              style={{ padding: '8px 24px', transition: 'all 0.2s', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isSubmitting && <i className="fa fa-spinner fa-spin"></i>}
              {isSubmitting ? 'Inviting...' : 'Send Invite'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default InviteCollaboratorModal;

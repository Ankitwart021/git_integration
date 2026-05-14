import React, { useState } from 'react';

interface ShareAppModalProps {
  appName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const ShareAppModal: React.FC<ShareAppModalProps> = ({ appName, onConfirm, onCancel }) => {
  const [isSharing, setIsSharing] = useState(false);

  const handleConfirm = async () => {
    setIsSharing(true);
    try {
      await onConfirm();
    } finally {
      setIsSharing(false);
      onCancel(); // Close modal after sharing
    }
  };

  return (
    <div className="import-modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="import-modal" style={{ maxWidth: '400px', width: '100%', background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontWeight: 600, color: '#212529', fontSize: '1.25rem' }}>Share Application</h3>
          <i className="fa fa-times close-btn" onClick={onCancel} style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#6c757d', padding: '4px' }} />
        </div>

        <div style={{ marginBottom: '24px', color: '#495057', fontSize: '1rem', lineHeight: '1.5' }}>
          Are you sure you want to share <strong>{appName}</strong>? 
          <br /><br />
          Once shared, this application will be synced to the central server and you will be able to invite collaborators.
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e9ecef', paddingTop: '20px' }}>
          <button 
            className="secondary-btn" 
            onClick={onCancel} 
            disabled={isSharing}
            style={{ padding: '8px 20px', transition: 'all 0.2s', borderRadius: '6px' }}
          >
            Cancel
          </button>
          
          <button 
            className="primary-btn" 
            onClick={handleConfirm}
            disabled={isSharing}
            style={{ padding: '8px 24px', transition: 'all 0.2s', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isSharing && <i className="fa fa-spinner fa-spin"></i>}
            {isSharing ? 'Sharing...' : 'Share Now'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ShareAppModal;

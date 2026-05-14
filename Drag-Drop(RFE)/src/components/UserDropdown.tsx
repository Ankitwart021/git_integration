import React, { useState, useRef, useEffect } from 'react';
import { User } from '../hooks/useUsers';

interface UserDropdownProps {
  users: User[];
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
}

const getInitials = (firstName?: string, lastName?: string) => {
  return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase() || '?';
};

const UserDropdown: React.FC<UserDropdownProps> = ({ users, loading, error, selectedUser, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = (user: User) => {
    onSelectUser(user);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', marginBottom: '1rem' }}>
      
      {/* Search Input Box */}
      <div 
        onClick={() => setIsOpen(true)}
        style={{ 
          display: 'flex', alignItems: 'center', 
          border: `1px solid ${isOpen ? '#0d6efd' : '#ced4da'}`, 
          borderRadius: '8px', 
          padding: '8px 12px', 
          background: '#fff',
          boxShadow: isOpen ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : 'none',
          transition: 'all 0.2s ease-in-out',
          cursor: 'text'
        }}
      >
        <i className="fa fa-search" style={{ color: '#adb5bd', marginRight: '10px' }}></i>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          style={{ 
            border: 'none', outline: 'none', width: '100%', 
            fontSize: '0.95rem', color: '#212529', background: 'transparent'
          }}
        />
      </div>

      {/* Selected User Display */}
      {selectedUser && !isOpen && !searchTerm && (
        <div style={{ marginTop: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0d6efd', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
            {getInitials(selectedUser.firstName, selectedUser.lastName)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, color: '#212529', fontSize: '0.95rem' }}>{selectedUser.firstName} {selectedUser.lastName}</span>
            <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>{selectedUser.email}</span>
          </div>
          <i className="fa fa-check-circle" style={{ marginLeft: 'auto', color: '#198754', fontSize: '1.2rem' }}></i>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, 
          background: '#fff', border: '1px solid #dee2e6', borderRadius: '8px', 
          marginTop: '4px', maxHeight: '250px', overflowY: 'auto', 
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }}>
          {loading && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
               <i className="fa fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> Loading users...
            </div>
          )}

          {error && (
            <div style={{ padding: '16px', color: '#dc3545', textAlign: 'center', background: '#f8d7da', borderRadius: '8px', margin: '8px' }}>
               <i className="fa fa-exclamation-triangle" style={{ marginRight: '6px' }}></i> {error}
            </div>
          )}
          
          {!loading && !error && filteredUsers.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#adb5bd' }}>
              <i className="fa fa-user-times" style={{ fontSize: '2rem', marginBottom: '8px', display: 'block' }}></i>
              No users found matching your search.
            </div>
          )}

          {!loading && !error && filteredUsers.map(user => {
            const isSelected = selectedUser?.id === user.id;
            return (
              <div
                key={user.id}
                onClick={() => handleSelect(user)}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f8f9fa',
                  background: isSelected ? '#e9ecef' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'background 0.1s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = isSelected ? '#e9ecef' : '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.background = isSelected ? '#e9ecef' : '#fff'}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isSelected ? '#secondary' : '#e9ecef', color: '#495057', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  {getInitials(user.firstName, user.lastName)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, color: '#212529', fontSize: '0.95rem' }}>{user.firstName} {user.lastName}</span>
                  <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>{user.email}</span>
                </div>
                {isSelected && <i className="fa fa-check" style={{ marginLeft: 'auto', color: '#0d6efd' }}></i>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserDropdown;

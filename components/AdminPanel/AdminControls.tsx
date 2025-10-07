'use client';

import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

import { EndCallButton } from './EndCallButton';
import { MuteButton } from './MuteButton';
import { BroadcastControl } from './BroadcastControl';

const AdminControls = () => {
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const panelStyle = {
    backgroundColor: '#292F36', // Primary Background
    border: '1px solid #8F7A6E', // Secondary Border
    borderRadius: '12px',
    padding: '20px', // Increased padding for better spacing
    width: '320px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)', // Enhanced shadow
  };

  const headerStyle = {
    color: '#FAF5F1', // Primary Text
    fontWeight: '700', // Bolder header
    fontSize: '1.5rem', // Larger header
  };

  const closeButtonStyle = {
    color: '#E0DBD8', // Secondary Text
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'color 0.2s',
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Admin Button */}
      <button
        onClick={() => setShowAdminPanel(!showAdminPanel)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px', // Larger touch target
          backgroundColor: '#A41F13', // Primary Action/Danger Color
          borderRadius: '9999px',
          transition: 'all 0.3s ease',
          boxShadow: showAdminPanel ? '0 0 0 2px #E0DBD8' : '0 4px 10px rgba(0, 0, 0, 0.3)', // Visual feedback when active
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <ShieldAlert style={{ color: '#FAF5F1', width: '24px', height: '24px' }} />
      </button>

      {/* Admin Panel */}
      {showAdminPanel && (
        <div style={{ ...panelStyle, position: 'absolute', bottom: '100%', marginBottom: '12px', right: '0', zIndex: 50 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={headerStyle}>Admin Panel</h3>
            <button
              onClick={() => setShowAdminPanel(false)}
              style={closeButtonStyle}
            >
              &times;
            </button>
          </div>

          {/* Controls List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <EndCallButton />
            <MuteButton />
            <BroadcastControl /> {/* Now using the updated component */}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminControls;
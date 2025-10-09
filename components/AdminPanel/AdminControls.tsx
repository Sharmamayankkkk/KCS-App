'use client';

import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { EndCallButton } from './EndCallButton';
import { MuteButton } from './MuteButton';
import { BroadcastControl } from './BroadcastControl';

const AdminControls = () => {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const isMobile = useIsMobile();

  const basePanelStyle: React.CSSProperties = {
    backgroundColor: '#292F36',
    border: '1px solid #8F7A6E',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
    zIndex: 50,
  };

  const desktopPanelStyle: React.CSSProperties = {
    ...basePanelStyle,
    position: 'absolute',
    width: '320px',
    bottom: '100%',
    marginBottom: '12px',
    right: '0',
  };

  const mobilePanelStyle: React.CSSProperties = {
    ...basePanelStyle,
    position: 'fixed',
    top: '-70%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90vw',
    maxWidth: '350px',
  };

  const panelStyle = isMobile ? mobilePanelStyle : desktopPanelStyle;

  const headerStyle: React.CSSProperties = {
    color: '#FAF5F1',
    fontWeight: '700',
    fontSize: '1.5rem',
  };

  const closeButtonStyle: React.CSSProperties = {
    color: '#E0DBD8',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'color 0.2s',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 49,
    backdropFilter: 'blur(2px)',
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowAdminPanel(!showAdminPanel)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          backgroundColor: '#A41F13',
          borderRadius: '9999px',
          transition: 'all 0.3s ease',
          boxShadow: showAdminPanel
            ? '0 0 0 2px #E0DBD8'
            : '0 4px 10px rgba(0, 0, 0, 0.3)',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <ShieldAlert style={{ color: '#FAF5F1', width: '24px', height: '24px' }} />
      </button>

      {showAdminPanel && (
        <>
          {isMobile && <div style={overlayStyle} onClick={() => setShowAdminPanel(false)} />}
          <div style={panelStyle}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h3 style={headerStyle}>Admin Panel</h3>
              <button
                onClick={() => setShowAdminPanel(false)}
                style={closeButtonStyle}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <EndCallButton />
              <MuteButton />
              <BroadcastControl />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminControls;
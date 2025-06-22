import React, { useState } from 'react';

const DebugInfo = ({ debugInfo }) => {
  const [expanded, setExpanded] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  if (!debugInfo || debugInfo.length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <div
        style={{
          cursor: 'pointer',
          color: '#888',
          fontSize: 14,
          borderTop: '1px solid #eee',
          paddingTop: 8,
          marginTop: 16,
          userSelect: 'none',
        }}
        onClick={() => setExpanded((e) => !e)}
      >
        <span style={{ marginRight: 8 }}>{expanded ? '▼' : '▶'}</span>
        Debug Info
      </div>
      {expanded && (
        <div style={{ marginTop: 8 }}>
          <button
            style={{
              background: '#eee',
              border: '1px solid #ccc',
              borderRadius: 6,
              padding: '6px 16px',
              cursor: 'pointer',
              fontSize: 14,
              marginBottom: 8,
            }}
            onClick={() => setShowDialog(true)}
          >
            Show API Call Details
          </button>
          {showDialog && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.3)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setShowDialog(false)}
            >
              <div
                style={{
                  background: 'white',
                  borderRadius: 10,
                  padding: 24,
                  minWidth: 350,
                  maxWidth: 600,
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                }}
                onClick={e => e.stopPropagation()}
              >
                <h3 style={{ marginTop: 0 }}>API Call Details</h3>
                <ol style={{ paddingLeft: 20 }}>
                  {debugInfo.map((chunk, idx) => (
                    <li key={idx} style={{ marginBottom: 12 }}>
                      <div><b>Chunk {idx + 1}</b></div>
                      {chunk.target && <div>Target: <code>{chunk.target}</code></div>}
                      {chunk.targets && <div>Targets: <code>{Array.isArray(chunk.targets) ? chunk.targets.join(', ') : chunk.targets}</code></div>}
                      <div>Start: <code>{chunk.start?.toLocaleString?.('en-IN', { timeZone: 'Asia/Kolkata' }) || String(chunk.start)}</code></div>
                      <div>End: <code>{chunk.end?.toLocaleString?.('en-IN', { timeZone: 'Asia/Kolkata' }) || String(chunk.end)}</code></div>
                      <div>Message: <code>{chunk.message}</code></div>
                    </li>
                  ))}
                </ol>
                <button
                  style={{
                    background: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 20px',
                    cursor: 'pointer',
                    fontSize: 15,
                    marginTop: 8,
                  }}
                  onClick={() => setShowDialog(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebugInfo; 
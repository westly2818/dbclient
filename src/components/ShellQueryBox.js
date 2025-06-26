import React, { useState } from 'react';

const ShellQueryBox = ({ onRunShell }) => {
    const [shellInput, setShellInput] = useState('');

    const handleSubmit = () => {
        if (shellInput.trim()) {
            onRunShell(shellInput);
            setShellInput('');
        }
    };

    return (
        <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ marginBottom: 8 }}>Shell Query (Raw)</h4>
            <textarea
                rows="5"
                placeholder="e.g. db.test.updateMany({ age: { $gt: 30 } }, { $set: { active: true } })"
                value={shellInput}
                onChange={(e) => setShellInput(e.target.value)}
                style={{
                    width: '100%',
                    maxWidth: '800px',
                    padding: '10px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    outline: 'none',
                    resize: 'vertical',
                    boxShadow: 'none',
                    transition: 'border-color 0.2s ease-in-out',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#888')}
                onBlur={(e) => (e.target.style.borderColor = '#ccc')}
            />
            <button
                onClick={handleSubmit}
                style={{
                    marginTop: 10,
                    padding: '8px 16px',
                    width: '150px',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'background 0.3s',
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = '#1565c0')}
                onMouseOut={(e) => (e.target.style.backgroundColor = '#1976d2')}
            >
                Run Raw Query
            </button>
        </div>
    );
};

export default ShellQueryBox;

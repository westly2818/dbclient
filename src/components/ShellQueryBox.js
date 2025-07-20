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
        <div style={{
            background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)',
            borderRadius: 12,
            boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)',
            padding: '32px 28px 24px 28px',
            marginBottom: 32,
            width: '96%',
            fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
        }}>
            <h3 style={{
                marginBottom: 18,
                fontWeight: 700,
                fontSize: 22,
                color: '#22223b',
                letterSpacing: '-0.5px',
                textAlign: 'left',
            }}>Shell Query (Raw)</h3>
            <textarea
                rows={6}
                placeholder={"e.g. db.collection('test').find({}).toArray()"}
                value={shellInput}
                onChange={(e) => setShellInput(e.target.value)}
                style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '16px',
                    fontFamily: 'Fira Mono, monospace',
                    borderRadius: '8px',
                    border: '1.5px solid #d1d5db',
                    outline: 'none',
                    resize: 'vertical',
                    background: '#f9fafb',
                    color: '#22223b',
                    marginBottom: 18,
                    boxShadow: '0 1px 4px rgba(99,102,241,0.04)',
                    transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#6366f1')}
                onBlur={e => (e.target.style.borderColor = '#d1d5db')}
            />
            <button
                onClick={handleSubmit}
                style={{
                    padding: '14px 0',
                    width: '180px',
                    fontWeight: 700,
                    fontSize: 13,
                    border: 'none',
                    borderRadius: 8,
                    background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.10)',
                    transition: 'background 0.2s',
                }}
                onMouseOver={e => (e.target.style.background = '#6366f1')}
                onMouseOut={e => (e.target.style.background = 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)')}
            >
                Run Raw Query
            </button>
        </div>
    );
};

export default ShellQueryBox;

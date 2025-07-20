import React, { useEffect, useState } from 'react';
import { connectMongo, connectSQL, connectMSSQL } from '../services/api';

const ConnectionForm = ({ onConnect }) => {
    const [dbType, setDbType] = useState('mongo');
    const [form, setForm] = useState({});

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('db_connection');
        if (saved) {
            const parsed = JSON.parse(saved);
            setDbType(parsed.dbType || 'mongo');
            setForm(parsed.form || {});
        }
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            if (dbType === 'mongo') {
                await connectMongo(form);
            } else if (dbType === 'mssql') {
                await connectMSSQL({ type: dbType, ...form });
            } else {
                await connectSQL({ type: dbType, ...form });
            }

            // Save to localStorage
            localStorage.setItem('db_connection', JSON.stringify({ dbType, form }));
            onConnect(dbType);
        } catch (err) {
            alert('Connection Failed: ' + (err?.response?.data?.error || err.message));
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)',
            fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
        }}>
            <div style={{
                width: 420,
                background: 'rgba(255,255,255,0.95)',
                borderRadius: 18,
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                padding: '40px 36px 32px 36px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
            }}>
                {/* Logo/Icon */}
                <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6366f1 40%, #60a5fa 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 18,
                    boxShadow: '0 2px 8px rgba(99,102,241,0.12)'
                }}>
                    <span style={{ fontSize: 36, color: 'white', fontWeight: 700 }}>DB</span>
                </div>
                <h2 style={{
                    marginBottom: 8,
                    fontWeight: 700,
                    fontSize: 28,
                    color: '#22223b',
                    letterSpacing: '-1px',
                    textAlign: 'center',
                }}>Connect to Database</h2>
                <p style={{
                    color: '#6366f1',
                    fontWeight: 500,
                    marginBottom: 28,
                    fontSize: 16,
                    textAlign: 'center',
                }}>
                    Securely connect to your data source
                </p>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <select
                        onChange={(e) => setDbType(e.target.value)}
                        value={dbType}
                        style={{
                            padding: '14px 12px',
                            borderRadius: 8,
                            border: '1.5px solid #d1d5db',
                            fontSize: 16,
                            background: '#f3f4f6',
                            fontWeight: 500,
                            color: '#374151',
                            outline: 'none',
                            marginBottom: 2,
                            transition: 'border 0.2s',
                        }}
                    >
                        <option value="mongo">MongoDB</option>
                        <option value="mysql">MySQL</option>
                        <option value="postgres">PostgreSQL</option>
                        <option value="mssql">MSSQL</option>
                    </select>

                    {dbType === 'mongo' ? (
                        <>
                            <input
                                name="uri"
                                placeholder="Mongo URI"
                                value={form.uri || ''}
                                onChange={handleChange}
                                style={{
                                    padding: '14px 12px',
                                    borderRadius: 8,
                                    border: '1.5px solid #d1d5db',
                                    fontSize: 16,
                                    background: '#f9fafb',
                                    marginBottom: 2,
                                    outline: 'none',
                                    transition: 'border 0.2s',
                                }}
                            />
                            <input
                                name="dbName"
                                placeholder="Database Name"
                                value={form.dbName || ''}
                                onChange={handleChange}
                                style={{
                                    padding: '14px 12px',
                                    borderRadius: 8,
                                    border: '1.5px solid #d1d5db',
                                    fontSize: 16,
                                    background: '#f9fafb',
                                    marginBottom: 2,
                                    outline: 'none',
                                    transition: 'border 0.2s',
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <input
                                name="host"
                                placeholder="Host"
                                value={form.host || ''}
                                onChange={handleChange}
                                style={{
                                    padding: '14px 12px',
                                    borderRadius: 8,
                                    border: '1.5px solid #d1d5db',
                                    fontSize: 16,
                                    background: '#f9fafb',
                                    marginBottom: 2,
                                    outline: 'none',
                                    transition: 'border 0.2s',
                                }}
                            />
                            <input
                                name="port"
                                placeholder="Port"
                                value={form.port || ''}
                                onChange={handleChange}
                                style={{
                                    padding: '14px 12px',
                                    borderRadius: 8,
                                    border: '1.5px solid #d1d5db',
                                    fontSize: 16,
                                    background: '#f9fafb',
                                    marginBottom: 2,
                                    outline: 'none',
                                    transition: 'border 0.2s',
                                }}
                            />
                            <input
                                name="user"
                                placeholder="User"
                                value={form.user || ''}
                                onChange={handleChange}
                                style={{
                                    padding: '14px 12px',
                                    borderRadius: 8,
                                    border: '1.5px solid #d1d5db',
                                    fontSize: 16,
                                    background: '#f9fafb',
                                    marginBottom: 2,
                                    outline: 'none',
                                    transition: 'border 0.2s',
                                }}
                            />
                            <input
                                name="password"
                                type="password"
                                placeholder="Password"
                                value={form.password || ''}
                                onChange={handleChange}
                                style={{
                                    padding: '14px 12px',
                                    borderRadius: 8,
                                    border: '1.5px solid #d1d5db',
                                    fontSize: 16,
                                    background: '#f9fafb',
                                    marginBottom: 2,
                                    outline: 'none',
                                    transition: 'border 0.2s',
                                }}
                            />
                            <input
                                name="database"
                                placeholder="Database"
                                value={form.database || ''}
                                onChange={handleChange}
                                style={{
                                    padding: '14px 12px',
                                    borderRadius: 8,
                                    border: '1.5px solid #d1d5db',
                                    fontSize: 16,
                                    background: '#f9fafb',
                                    marginBottom: 2,
                                    outline: 'none',
                                    transition: 'border 0.2s',
                                }}
                            />
                            {dbType === 'mssql' && (
                                <input
                                    name="instance"
                                    placeholder="Instance (optional)"
                                    value={form.instance || ''}
                                    onChange={handleChange}
                                    style={{
                                        padding: '14px 12px',
                                        borderRadius: 8,
                                        border: '1.5px solid #d1d5db',
                                        fontSize: 16,
                                        background: '#f9fafb',
                                        marginBottom: 2,
                                        outline: 'none',
                                        transition: 'border 0.2s',
                                    }}
                                />
                            )}
                        </>
                    )}
                    <button
                        onClick={handleSubmit}
                        style={{
                            padding: '14px 0',
                            background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 700,
                            fontSize: 18,
                            letterSpacing: '0.5px',
                            marginTop: 8,
                            boxShadow: '0 2px 8px rgba(99,102,241,0.10)',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                        }}
                    >
                        Connect
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConnectionForm;

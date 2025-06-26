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
            maxWidth: 400,
            margin: '40px auto',
            padding: 20,
            border: '1px solid #ccc',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
            <h3 style={{ marginBottom: 20, textAlign: 'center' }}>Connect to Database</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <select
                    onChange={(e) => setDbType(e.target.value)}
                    value={dbType}
                    style={{ padding: 8, borderRadius: 4 }}
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
                        />
                        <input
                            name="dbName"
                            placeholder="Database Name"
                            value={form.dbName || ''}
                            onChange={handleChange}
                        />
                    </>
                ) : (
                    <>
                        <input
                            name="host"
                            placeholder="Host"
                            value={form.host || ''}
                            onChange={handleChange}
                        />
                        <input
                            name="port"
                            placeholder="Port"
                            value={form.port || ''}
                            onChange={handleChange}
                        />
                        <input
                            name="user"
                            placeholder="User"
                            value={form.user || ''}
                            onChange={handleChange}
                        />
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={form.password || ''}
                            onChange={handleChange}
                        />
                        <input
                            name="database"
                            placeholder="Database"
                            value={form.database || ''}
                            onChange={handleChange}
                        />
                        {dbType === 'mssql' && (
                            <input
                                name="instance"
                                placeholder="Instance (optional)"
                                value={form.instance || ''}
                                onChange={handleChange}
                            />
                        )}
                    </>
                )}
                <button
                    onClick={handleSubmit}
                    style={{
                        padding: '10px 0',
                        background: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer'
                    }}
                >
                    Connect
                </button>
            </div>
        </div>
    );
};

export default ConnectionForm;

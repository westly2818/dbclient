import React, { useState } from 'react';
import './QueryBuilder.css';

const QueryBuilder = ({ onRunQuery, columns = [] }) => {
    const [column, setColumn] = useState('');
    const [operator, setOperator] = useState('=');
    const [value, setValue] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [sortDir, setSortDir] = useState('asc');
    const [limit, setLimit] = useState(50);

    const getQueryObject = () => ({
        where: column && value ? { [column]: { operator, value } } : {},
        sort: sortBy ? { [sortBy]: sortDir } : {},
        limit: Number(limit),
    });

    const handleSubmit = () => {
        onRunQuery(getQueryObject());
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
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
            }}>Query Builder</h3>
            <div style={{ display: 'flex', gap: 16, marginBottom: 18, flexWrap: 'wrap' }}>
                {columns.length > 0 ? (
                    <select
                        className="query-select"
                        value={column}
                        onChange={(e) => setColumn(e.target.value)}
                        style={{
                            padding: '12px',
                            borderRadius: 8,
                            border: '1.5px solid #d1d5db',
                            fontSize: 16,
                            background: '#f3f4f6',
                            fontWeight: 500,
                            color: '#374151',
                            outline: 'none',
                            minWidth: 140,
                        }}
                    >
                        <option value="">Select Column</option>
                        {columns.map((col) => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        className="query-input"
                        placeholder="Column"
                        value={column}
                        onChange={(e) => setColumn(e.target.value)}
                        style={{
                            padding: '12px',
                            borderRadius: 8,
                            border: '1.5px solid #d1d5db',
                            fontSize: 16,
                            background: '#f3f4f6',
                            fontWeight: 500,
                            color: '#374151',
                            outline: 'none',
                            minWidth: 140,
                        }}
                    />
                )}
                <select
                    className="query-select"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    style={{
                        padding: '12px',
                        borderRadius: 8,
                        border: '1.5px solid #d1d5db',
                        fontSize: 16,
                        background: '#f3f4f6',
                        fontWeight: 500,
                        color: '#374151',
                        outline: 'none',
                        minWidth: 90,
                    }}
                >
                    <option value="=">=</option>
                    <option value="!=">!=</option>
                    <option value=">">&gt;</option>
                    <option value="<">&lt;</option>
                </select>
                <input
                    className="query-input"
                    placeholder="Value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    style={{
                        padding: '12px',
                        borderRadius: 8,
                        border: '1.5px solid #d1d5db',
                        fontSize: 16,
                        background: '#f3f4f6',
                        fontWeight: 500,
                        color: '#374151',
                        outline: 'none',
                        minWidth: 140,
                    }}
                />
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {columns.length > 0 ? (
                    <select
                        className="query-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            padding: '12px',
                            borderRadius: 8,
                            border: '1.5px solid #d1d5db',
                            fontSize: 16,
                            background: '#f3f4f6',
                            fontWeight: 500,
                            color: '#374151',
                            outline: 'none',
                            minWidth: 140,
                        }}
                    >
                        <option value="">Sort By</option>
                        {columns.map((col) => (
                            <option key={col} value={col}>{col}</option>
                        ))}
                    </select>
                ) : (
                    <input
                        className="query-input"
                        placeholder="Sort By"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            padding: '12px',
                            borderRadius: 8,
                            border: '1.5px solid #d1d5db',
                            fontSize: 16,
                            background: '#f3f4f6',
                            fontWeight: 500,
                            color: '#374151',
                            outline: 'none',
                            minWidth: 140,
                        }}
                    />
                )}
                <select
                    className="query-select"
                    value={sortDir}
                    onChange={(e) => setSortDir(e.target.value)}
                    style={{
                        padding: '12px',
                        borderRadius: 8,
                        border: '1.5px solid #d1d5db',
                        fontSize: 16,
                        background: '#f3f4f6',
                        fontWeight: 500,
                        color: '#374151',
                        outline: 'none',
                        minWidth: 90,
                    }}
                >
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                </select>
                <input
                    className="query-input"
                    type="number"
                    placeholder="Limit"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    style={{
                        padding: '12px',
                        borderRadius: 8,
                        border: '1.5px solid #d1d5db',
                        fontSize: 16,
                        background: '#f3f4f6',
                        fontWeight: 500,
                        color: '#374151',
                        outline: 'none',
                        minWidth: 100,
                    }}
                />
                <button
                    className="query-button"
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
                    Run Query
                </button>
            </div>
        </div>
    );
};

export default QueryBuilder;

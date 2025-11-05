import React, { useState } from 'react';
import './QueryBuilder.css';

const QueryBuilder = ({ onRunQuery, columns = [], theme = 'light' }) => {
    const [conditions, setConditions] = useState([
        { id: 1, column: '', type: 'text', operator: '=', value: '', from: '', to: '' }
    ]);
    const [sortBy, setSortBy] = useState('');
    const [sortDir, setSortDir] = useState('asc');
    const [limit, setLimit] = useState(50);

    const getQueryObject = () => {
        const where = {};
        conditions.forEach((c) => {
            if (!c.column) return;
            if (c.type === 'date') {
                if (c.from && c.to) {
                    where[c.column] = { operator: 'BETWEEN', value: { from: c.from, to: c.to }, type: 'date' };
                }
            } else {
                if (c.value !== '') {
                    where[c.column] = { operator: c.operator || '=', value: c.value };
                }
            }
        });
        return {
            where,
            sort: sortBy ? { [sortBy]: sortDir } : {},
            limit: Number(limit),
        };
    };

    const handleSubmit = () => {
        onRunQuery(getQueryObject());
    };

    return (
        <div style={{
            background: theme === 'light' ? 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)' : '#0b1220',
            borderRadius: 12,
            boxShadow: theme === 'light' ? '0 4px 24px 0 rgba(31, 38, 135, 0.10)' : '0 4px 24px 0 rgba(2,6,23,0.6)',
            padding: '32px 28px 24px 28px',
            marginBottom: 32,
            width: '96%',
            fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
            color: theme === 'light' ? '#111827' : '#e5e7eb'
        }}>
            <h3 style={{
                marginBottom: 18,
                fontWeight: 700,
                fontSize: 22,
                color: '#22223b',
                letterSpacing: '-0.5px',
                textAlign: 'left',
            }}>Query Builder</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
                {conditions.map((c, idx) => (
                    <div key={c.id} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', background: '#eef2ff', padding: '10px', borderRadius: 8 }}>
                        {columns.length > 0 ? (
                            <select
                                className="query-select"
                                value={c.column}
                                onChange={(e) => {
                                    const next = [...conditions];
                                    next[idx].column = e.target.value;
                                    setConditions(next);
                                }}
                                style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #d1d5db', background: '#f3f4f6', minWidth: 160 }}
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
                                value={c.column}
                                onChange={(e) => {
                                    const next = [...conditions];
                                    next[idx].column = e.target.value;
                                    setConditions(next);
                                }}
                                style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #d1d5db', background: '#f3f4f6', minWidth: 160 }}
                            />
                        )}
                        <select
                            className="query-select"
                            value={c.type}
                            onChange={(e) => {
                                const next = [...conditions];
                                next[idx].type = e.target.value;
                                // reset values when type changes
                                if (e.target.value === 'date') {
                                    next[idx].operator = '=';
                                    next[idx].value = '';
                                } else {
                                    next[idx].from = '';
                                    next[idx].to = '';
                                }
                                setConditions(next);
                            }}
                            style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #d1d5db', background: '#f3f4f6', minWidth: 120 }}
                        >
                            <option value="text">Text/Number</option>
                            <option value="date">Date</option>
                        </select>
                        {c.type === 'date' ? (
                            <>
                                <input
                                    className="query-input"
                                    type="date"
                                    placeholder="From"
                                    value={c.from}
                                    onChange={(e) => {
                                        const next = [...conditions];
                                        next[idx].from = e.target.value;
                                        setConditions(next);
                                    }}
                                    style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #d1d5db', background: '#f3f4f6', minWidth: 160 }}
                                />
                                <input
                                    className="query-input"
                                    type="date"
                                    placeholder="To"
                                    value={c.to}
                                    onChange={(e) => {
                                        const next = [...conditions];
                                        next[idx].to = e.target.value;
                                        setConditions(next);
                                    }}
                                    style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #d1d5db', background: '#f3f4f6', minWidth: 160 }}
                                />
                            </>
                        ) : (
                            <>
                                <select
                                    className="query-select"
                                    value={c.operator}
                                    onChange={(e) => {
                                        const next = [...conditions];
                                        next[idx].operator = e.target.value;
                                        setConditions(next);
                                    }}
                                    style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #d1d5db', background: '#f3f4f6', minWidth: 90 }}
                                >
                                    <option value="=">=</option>
                                    <option value=">">&gt;</option>
                                    <option value=">=">&gt;=</option>
                                    <option value="<">&lt;</option>
                                    <option value="<=">&lt;=</option>
                                    <option value="!=">!=</option>
                                    <option value="LIKE">LIKE</option>
                                </select>
                                <input
                                    className="query-input"
                                    placeholder="Value"
                                    value={c.value}
                                    onChange={(e) => {
                                        const next = [...conditions];
                                        next[idx].value = e.target.value;
                                        setConditions(next);
                                    }}
                                    style={{ padding: '10px', borderRadius: 8, border: '1.5px solid #d1d5db', background: '#f3f4f6', minWidth: 160 }}
                                />
                            </>
                        )}
                        <button
                            onClick={() => setConditions((prev) => prev.filter((x) => x.id !== c.id))}
                            title="Remove"
                            aria-label="Remove condition"
                            style={{
                                padding: '6px 10px',
                                borderRadius: 999,
                                border: '1px solid #fecaca',
                                background: '#fee2e2',
                                color: '#b91c1c',
                                fontWeight: 800,
                                cursor: 'pointer',
                                lineHeight: 1,
                                width: 28,
                                height: 28,
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
                <button
                    onClick={() => setConditions((prev) => [...prev, { id: (prev[prev.length - 1]?.id || 0) + 1, column: '', type: 'text', operator: '=', value: '', from: '', to: '' }])}
                    style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid #6366f1', background: '#eef2ff', color: '#374151', fontWeight: 700, width: 160, cursor: 'pointer' }}
                >
                    Add Query
                </button>
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

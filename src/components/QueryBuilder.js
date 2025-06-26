import React, { useState } from 'react';
import './QueryBuilder.css';

const QueryBuilder = ({ onRunQuery }) => {
    const [column, setColumn] = useState('');
    const [operator, setOperator] = useState('=');
    const [value, setValue] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [limit, setLimit] = useState(50);

    const getQueryObject = () => ({
        where: column && value ? { [column]: { operator, value } } : {},
        sort: sortBy ? { [sortBy]: 'asc' } : {},
        limit: Number(limit),
    });

    const handleSubmit = () => {
        onRunQuery(getQueryObject());
    };

    return (
        <div className="query-builder">
            <h4 className="query-title">Query Builder</h4>
            <div className="query-row">
                <input
                    className="query-input"
                    placeholder="Column"
                    value={column}
                    onChange={(e) => setColumn(e.target.value)}
                />
                <select
                    className="query-select"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
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
                />
            </div>

            <div className="query-row">
                <input
                    className="query-input"
                    placeholder="Sort By"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                />
                <input
                    className="query-input"
                    type="number"
                    placeholder="Limit"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                />
                <button className="query-button" onClick={handleSubmit}>
                    Run Query
                </button>
            </div>
        </div>
    );
};

export default QueryBuilder;

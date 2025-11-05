import React from 'react';
import './Sidebar.css';

const Sidebar = ({ items, onSelect, selected, theme = 'light' }) => (
    <div
        className="sidebar"
        style={{
            background: theme === 'light' ? '#f3f4f6' : '#0b1220',
            color: theme === 'light' ? '#111827' : '#e5e7eb',
            borderRight: '1px solid ' + (theme === 'light' ? '#e5e7eb' : '#334155')
        }}
    >
        <h3 className="sidebar-title" style={{ color: theme === 'light' ? '#1f2937' : '#e5e7eb' }}>Collections / Tables</h3>
        <ul className="sidebar-list">
            {items.map((name) => (
                <li
                    key={name}
                    onClick={() => onSelect(name)}
                    className={`sidebar-item ${selected === name ? 'selected' : ''}`}
                    style={{
                        color: theme === 'light' ? '#111827' : '#e5e7eb',
                        borderColor: theme === 'light' ? '#e5e7eb' : '#334155',
                        background: selected === name ? (theme === 'light' ? '#e0e7ff' : '#1f2937') : 'transparent'
                    }}
                >
                    {name}
                </li>
            ))}
        </ul>
    </div>
);

export default Sidebar;

import React from 'react';
import './Sidebar.css';

const Sidebar = ({ items, onSelect, selected }) => (
    <div className="sidebar">
        <h3 className="sidebar-title">Collections / Tables</h3>
        <ul className="sidebar-list">
            {items.map((name) => (
                <li
                    key={name}
                    onClick={() => onSelect(name)}
                    className={`sidebar-item ${selected === name ? 'selected' : ''}`}
                >
                    {name}
                </li>
            ))}
        </ul>
    </div>
);

export default Sidebar;

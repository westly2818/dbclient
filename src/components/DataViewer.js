import React, { useState, useEffect } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Box, Select, MenuItem, Button, Typography, Switch, FormControlLabel, IconButton, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const DataViewer = ({
    data = [],
    page = 1,
    limit = 25,
    totalRowCount = 0,
    onPageChange,
    onLimitChange,
    onRowUpdate,
    onRowsDelete,
    theme = 'light',
    storageKey = null,
}) => {
    const [selectionModel, setSelectionModel] = useState([]);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'json'
    const selectedCount = selectionModel?.ids ? Array.from(selectionModel.ids).length : 0;
    const [editIndex, setEditIndex] = useState(null);
    const [editJson, setEditJson] = useState('');
    const [editError, setEditError] = useState('');

    const [columnVisibilityModel, setColumnVisibilityModel] = useState({});

    // Load visibility from local storage when storageKey changes
    useEffect(() => {
        if (storageKey) {
            try {
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                    setColumnVisibilityModel(JSON.parse(saved));
                } else {
                    setColumnVisibilityModel({});
                }
            } catch (e) {
                console.error("Failed to load column visibility", e);
            }
        }
    }, [storageKey]);

    // Reset edit state when data, page, or limit changes
    useEffect(() => {
        setEditIndex(null);
        setEditJson('');
        setEditError('');
    }, [data, page, limit]);

    const renderCellValue = (value) => {
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'object') {
            return (
                <span
                    style={{
                        display: 'block',
                        fontFamily: 'Fira Mono, monospace',
                        background: '#f3f4f6',
                        color: '#374151',
                        borderRadius: 4,
                        padding: '4px 8px',
                        maxHeight: 80,
                        overflow: 'auto',
                        whiteSpace: 'pre',
                        fontSize: 13,
                        lineHeight: '1.3',
                        textOverflow: 'ellipsis',
                    }}
                    title={JSON.stringify(value, null, 2)}
                >
                    {JSON.stringify(value, null, 2)}
                </span>
            );
        }
        return value;
    };

    const columns = data.length > 0
        ? [
            {
                field: 'srno',
                headerName: 'Sr No',
                width: 70,
                sortable: false,
                filterable: false,
                align: 'center',
                headerAlign: 'center',
                renderCell: (params) => {
                    const idx = rows.findIndex(r => r.id === params.row.id);
                    return idx !== -1 ? (page - 1) * limit + idx + 1 : '';
                },
            },
            ...Object.keys(data[0] ?? {}).map((field) => ({
                field,
                headerName: field,
                minWidth: 150,
                flex: 1,
                sortable: true,
                editable: false,
                renderCell: (params) => (
                    <span style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                        {renderCellValue(params.value)}
                    </span>
                ),
            }))
        ]
        : [];

    const rows = data.map((row, index) => ({
        id: row._id ?? index,
        ...row,
    }));

    const processRowUpdate = async (newRow, oldRow) => {
        try {
            if (onRowUpdate) {
                const updatedRow = await onRowUpdate(newRow, oldRow);
                return updatedRow;
            }
            return oldRow;
        } catch (error) {
            alert('Update failed: ' + error.message);
            throw error;
        }
    };

    const handleProcessRowUpdateError = (error) => {
        alert('Failed to update row due to an internal error. Check console for details.');
    };

    const handleDeleteClick = () => {
        let ids = Array.from(selectionModel.ids);
        if (ids.length > 0 && onRowsDelete) {
            if (window.confirm(`Are you sure you want to delete ${ids.length} selected row(s)?`)) {
                onRowsDelete(ids);
                setSelectionModel([]);
            }
        } else if (selectionModel.length === 0) {
            alert('Please select rows to delete.');
        } else {
            alert('Delete function is not available.');
        }
    };

    return (
        <Box sx={{
            width: '96%',
            background: theme === 'light' ? '#f8fafc' : '#0b1220',
            borderRadius: 10,
            boxShadow: theme === 'light' ? '0 8px 24px rgba(31,38,135,0.10)' : '0 8px 24px rgba(2,6,23,0.6)',
            p: { xs: 2, sm: 4 },
            mb: 4,
            fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
            border: '1.5px solid ' + (theme === 'light' ? '#e0e7ef' : '#334155'),
            minHeight: 400,
            overflow: 'hidden'
        }}>
            {/* Top Controls: View Toggle, Pagination, Limit */}
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                gap: 2,
                background: theme === 'light' ? 'rgba(255,255,255,0.7)' : '#0f172a',
                color: theme === 'light' ? '#111827' : '#e5e7eb',
                border: '1px solid ' + (theme === 'light' ? '#e0e7ef' : '#334155'),
                borderRadius: 8,
                boxShadow: theme === 'light' ? '0 2px 8px rgba(99,102,241,0.06)' : '0 2px 8px rgba(2,6,23,0.6)',
                p: 2,
                '& button': { fontSize: 13 },
                fontSize: 12,
            }}>
                {/* Table/JSON View Toggle as pill */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, background: theme === 'light' ? '#e0e7ff' : '#1f2937', borderRadius: 999, p: '2px 8px' }}>
                    <Button
                        variant={viewMode === 'table' ? 'contained' : 'text'}
                        size="small"
                        sx={{
                            borderRadius: 999,
                            minWidth: 60,
                            fontWeight: 600,
                            fontSize: 12,
                            background: viewMode === 'table' ? 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)' : 'transparent',
                            color: viewMode === 'table' ? 'white' : '#374151',
                            boxShadow: viewMode === 'table' ? '0 2px 8px rgba(99,102,241,0.10)' : 'none',
                        }}
                        onClick={() => setViewMode('table')}
                    >
                        Table
                    </Button>
                    <Button
                        variant={viewMode === 'json' ? 'contained' : 'text'}
                        size="small"
                        sx={{
                            borderRadius: 999,
                            minWidth: 60,
                            fontWeight: 600,
                            fontSize: 12,
                            background: viewMode === 'json' ? 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)' : 'transparent',
                            color: viewMode === 'json' ? 'white' : '#374151',
                            boxShadow: viewMode === 'json' ? '0 2px 8px rgba(99,102,241,0.10)' : 'none',
                        }}
                        onClick={() => setViewMode('json')}
                    >
                        JSON
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography component="span" sx={{ fontWeight: 500, color: '#6366f1', fontSize: 12 }}>Rows per page:</Typography>
                    <Select
                        size="small"
                        value={limit}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        sx={{
                            ml: 1,
                            minWidth: 70,
                            background: '#fff',
                            borderRadius: 2,
                            border: '1.5px solid #6366f1',
                            fontWeight: 600,
                            fontSize: 12,
                            color: '#374151',
                        }}
                    >
                        {[10, 25, 50, 100].map((n) => (
                            <MenuItem key={n} value={n}>{n}</MenuItem>
                        ))}
                    </Select>
                    <Button
                        variant="outlined"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                        sx={{
                            ml: 2,
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: 13,
                            color: '#2563eb',
                            borderColor: '#60a5fa',
                            background: '#e0e7ff',
                            minWidth: 60,
                        }}
                    >
                        Prev
                    </Button>
                    <Typography component="span" sx={{ mx: 1, fontWeight: 600, color: '#22223b', fontSize: 12 }}>
                        Page {page} / {Math.max(1, Math.ceil(totalRowCount / limit))}
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => onPageChange(page + 1)}
                        disabled={page * limit >= totalRowCount}
                        sx={{
                            mr: 2,
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: 13,
                            color: '#2563eb',
                            borderColor: '#60a5fa',
                            background: '#e0e7ff',
                            minWidth: 60,
                        }}
                    >
                        Next
                    </Button>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={selectedCount === 0}
                    onClick={handleDeleteClick}
                    sx={{
                        ml: 2,
                        borderRadius: 2,
                        fontWeight: 700,
                        boxShadow: '0 2px 8px rgba(99,102,241,0.10)',
                        fontSize: 13,
                        background: 'linear-gradient(90deg, #6366f1 0%, #2563eb 100%)',
                        color: 'white',
                        minWidth: 120,
                        '&:hover': {
                            background: 'linear-gradient(90deg, #2563eb 0%, #6366f1 100%)',
                        },
                    }}
                >
                    Delete Selected ({selectedCount})
                </Button>
            </Box>

            {/* Total Count Display */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, pl: 1, fontSize: 12 }}>
                <Typography variant="h6" sx={{ color: '#6366f1', fontWeight: 700, fontSize: 14 }}>
                    Total Records:
                </Typography>
                <Typography variant="h6" sx={{ color: '#22223b', fontWeight: 700, fontSize: 14 }}>
                    {totalRowCount}
                </Typography>
            </Box>

            {/* Data Display */}
            {viewMode === 'table' ? (
                <DataGrid
                    rows={rows}
                    columns={columns}
                    paginationModel={{ page: page - 1, pageSize: limit }}
                    // client-side pagination; backend limit controlled elsewhere
                    disableRowSelectionOnClick
                    // disableColumnMenu // enable column menu
                    rowHeight={40}
                    checkboxSelection
                    selectionModel={selectionModel}
                    onRowSelectionModelChange={(newSelection) => {
                        setSelectionModel(newSelection);
                    }}
                    columnVisibilityModel={columnVisibilityModel}
                    onColumnVisibilityModelChange={(newModel) => {
                        setColumnVisibilityModel(newModel);
                        if (storageKey) {
                            localStorage.setItem(storageKey, JSON.stringify(newModel));
                        }
                    }}
                    // editing disabled
                    pageSizeOptions={[10, 25, 50, 100, 200]}
                    sx={{
                        height: '55vh',
                        border: 'none',
                        borderRadius: 0,
                        background: theme === 'light' ? '#ffffff' : '#0b1220',
                        color: theme === 'light' ? '#111827' : '#e5e7eb',
                        '& .MuiDataGrid-cell': {
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            lineHeight: '1.5rem',
                            color: theme === 'light' ? '#111827' : '#e5e7eb'
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            background: theme === 'light' ? '#e8eefc' : '#0f172a',
                            color: theme === 'light' ? '#111827' : '#e5e7eb',
                            borderBottom: '1px solid ' + (theme === 'light' ? '#e0e7ef' : '#334155'),
                            minHeight: 48,
                            maxHeight: 56
                        },
                        '& .MuiDataGrid-columnHeader': {
                            background: theme === 'light' ? '#e8eefc' : '#0f172a',
                            color: theme === 'light' ? '#111827' : '#e5e7eb'
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                            fontWeight: 700,
                            color: theme === 'light' ? '#1f2937' : '#e5e7eb'
                        },
                        '& .MuiDataGrid-columnHeaderTitleContainer': {
                            color: theme === 'light' ? '#1f2937' : '#e5e7eb'
                        },
                        '& .MuiDataGrid-columnHeaderCheckbox .MuiSvgIcon-root': {
                            color: theme === 'light' ? '#4b5563' : '#e5e7eb'
                        },
                        '& .MuiDataGrid-columnSeparator': {
                            display: 'none'
                        },
                        '& .MuiDataGrid-virtualScroller': {
                            background: theme === 'light' ? '#ffffff' : '#0b1220'
                        },
                        '& .MuiDataGrid-row:hover': {
                            background: theme === 'light' ? '#f3f6ff' : '#111827'
                        },
                        '& .MuiDataGrid-row.Mui-selected': {
                            background: theme === 'light' ? '#e0e7ff !important' : '#1f2937 !important'
                        },
                        '& .MuiDataGrid-row.Mui-selected:hover': {
                            background: theme === 'light' ? '#dbeafe !important' : '#1e293b !important'
                        },
                        '& .MuiDataGrid-withBorderColor': {
                            borderColor: theme === 'light' ? '#e0e7ef' : '#334155'
                        },
                        '& .MuiDataGrid-footerContainer': {
                            background: theme === 'light' ? '#f8fafc' : '#0f172a',
                            color: theme === 'light' ? '#111827' : '#e5e7eb',
                            borderTop: '1px solid ' + (theme === 'light' ? '#e0e7ef' : '#334155')
                        },
                        '& .MuiSvgIcon-root': {
                            color: theme === 'light' ? undefined : '#e5e7eb'
                        },
                        '& .MuiCheckbox-root': {
                            color: theme === 'light' ? undefined : '#94a3b8'
                        },
                        '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                            outline: 'none'
                        },
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 15,
                        boxShadow: theme === 'light' ? '0 2px 8px rgba(99,102,241,0.04)' : '0 2px 8px rgba(2,6,23,0.6)',
                    }}
                    slots={{
                        toolbar: GridToolbar,
                        noRowsOverlay: () => (
                            <Typography sx={{ p: 2, color: 'gray' }}>
                                No data to display.
                            </Typography>
                        ),
                    }}
                />
            ) : (
                <>
                    {/* Copy All Button above JSON view */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                        <IconButton
                            onClick={() => {
                                navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                            }}
                            sx={{
                                color: '#90caf9',
                                background: '#23272e',
                                borderRadius: 2,
                                boxShadow: '0 1px 4px rgba(99,102,241,0.08)',
                                zIndex: 2,
                            }}
                            title="Copy all JSON to clipboard"
                        >
                            <ContentCopyIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    <Box sx={{
                        mt: 2,
                        p: 2,
                        background: 'linear-gradient(135deg, #23272e 60%, #6366f1 100%)',
                        borderRadius: 4,
                        color: '#f3f4f6',
                        fontFamily: 'Fira Mono, monospace',
                        fontSize: 15,
                        minHeight: 200,
                        maxHeight: 500,
                        overflow: 'auto',
                        boxShadow: '0 2px 12px rgba(31,38,135,0.10)',
                        position: 'relative',
                    }}>
                        {data.length === 0 && (
                            <Typography sx={{ color: '#aaa', p: 2 }}>No data to display.</Typography>
                        )}
                        {data.map((doc, idx) => (
                            <Box key={doc._id || idx} sx={{ mb: 3, position: 'relative', background: 'rgba(30,41,59,0.95)', borderRadius: 3, p: 2, boxShadow: '0 1px 4px rgba(99,102,241,0.08)' }}>
                                {editIndex === idx ? (
                                    <>
                                        <TextField
                                            multiline
                                            minRows={6}
                                            maxRows={16}
                                            fullWidth
                                            value={editJson}
                                            onChange={e => {
                                                setEditJson(e.target.value);
                                                setEditError('');
                                            }}
                                            sx={{
                                                fontFamily: 'Fira Mono, monospace',
                                                background: '#18181b',
                                                color: '#f3f4f6',
                                                borderRadius: 2,
                                                mb: 1,
                                                boxShadow: '0 1px 4px rgba(99,102,241,0.04)',
                                            }}
                                            InputProps={{
                                                style: { color: '#f3f4f6', fontFamily: 'Fira Mono, monospace' },
                                            }}
                                            error={!!editError}
                                            helperText={editError}
                                        />
                                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                            <IconButton
                                                color="success"
                                                onClick={async () => {
                                                    try {
                                                        const parsed = JSON.parse(editJson);
                                                        setEditError('');
                                                        await onRowUpdate(parsed, data[editIndex]);
                                                        setEditIndex(null);
                                                    } catch (err) {
                                                        setEditError('Invalid JSON: ' + err.message);
                                                    }
                                                }}
                                                sx={{ background: '#e0e7ff', borderRadius: 2 }}
                                            >
                                                <SaveIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => {
                                                    setEditIndex(null);
                                                    setEditError('');
                                                }}
                                                sx={{ background: '#fee2e2', borderRadius: 2 }}
                                            >
                                                <CancelIcon />
                                            </IconButton>
                                        </Box>
                                    </>
                                ) : (
                                    <>
                                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 15 }}>
                                            {JSON.stringify(doc, null, 2)}
                                        </pre>
                                        <IconButton
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                color: '#90caf9',
                                                background: '#e0e7ff',
                                                borderRadius: 2,
                                                padding: '2px',
                                                width: 20,
                                                height: 20,
                                                minWidth: 20,
                                                minHeight: 20,
                                            }}
                                            onClick={() => {
                                                setEditIndex(idx);
                                                setEditJson(JSON.stringify(doc, null, 2));
                                                setEditError('');
                                            }}
                                        >
                                            <EditIcon sx={{ fontSize: '16px' }} />
                                        </IconButton>
                                    </>
                                )}
                            </Box>
                        ))}
                    </Box>
                </>
            )}
        </Box>
    );
};

export default DataViewer;
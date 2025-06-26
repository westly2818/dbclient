import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Select, MenuItem, Button, Typography } from '@mui/material';

const DataViewer = ({
    data = [],
    page = 1,
    limit = 25,
    totalRowCount = 0, // <--- Crucial: Ensure this prop is passed with the total count
    onPageChange,
    onLimitChange,
    onRowUpdate,
    onRowsDelete,
}) => {
    const [rowSelectionModel, setRowSelectionModel] = useState([]);
    const [selectionModel, setSelectionModel] = useState([]);
    const selectedCount = selectionModel?.ids ? Array.from(selectionModel.ids).length : 0;

    // if (!Array.isArray(data) || data.length === 0) {
    //     return <Typography sx={{ p: 2, color: 'gray' }}>No data to display.</Typography>;
    // }

    const renderCellValue = (value) => {
        if (value === null || value === undefined) return 'N/A';
        if (typeof value === 'object') return JSON.stringify(value);
        return value;
    };

    const columns = data.length > 0
        ? Object.keys(data[0] ?? {}).map((field) => ({
            field,
            headerName: field,
            minWidth: 150,
            flex: 1,
            sortable: true,
            editable: true,
            renderCell: (params) => (
                <span style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    {renderCellValue(params.value)}
                </span>
            ),
        }))
        : [];


    const rows = data.map((row, index) => ({
        id: row._id ?? index, // Ensure each row has a unique 'id'
        ...row,
    }));

    const processRowUpdate = async (newRow, oldRow) => {
        console.log('Row update initiated:', { newRow, oldRow });
        try {
            if (onRowUpdate) {
                // onRowUpdate should return the new row or throw an error
                const updatedRow = await onRowUpdate(newRow);
                return updatedRow;
            }
            return oldRow;
        } catch (error) {
            console.error('Failed to update row:', error);
            // Alert user about the failure
            alert('Update failed: ' + error.message);
            // Re-throw the error so DataGrid can revert the change visually
            throw error;
        }
    };

    const handleProcessRowUpdateError = (error) => {
        console.error('Error processing row update:', error);
        // This handler catches errors specifically from DataGrid's internal update process
        alert('Failed to update row due to an internal error. Check console for details.');
    };

    const handleDeleteClick = () => {
        let data = Array.from(selectionModel.ids);

        if (data.length > 0 && onRowsDelete) {
            if (window.confirm(`Are you sure you want to delete ${data.length} selected row(s)?`)) {
                onRowsDelete(data);
                setRowSelectionModel([]); // Clear selection after deletion attempt
            }
        } else if (selectionModel.length === 0) {
            alert('Please select rows to delete.');
        } else {
            alert('Delete function is not available.');
        }
    };

    return (
        <Box sx={{ height: 'calc(100vh - 200px)', width: '100%' }}>
            {/* Pagination Controls + Delete Button */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                    p: 1,
                    backgroundColor: '#f9f9f9',
                    borderRadius: 1,
                }}
            >
                <Box>
                    <Typography component="span">Rows per page:</Typography>
                    <Select
                        size="small"
                        value={limit}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
                        sx={{ ml: 1 }}
                    >
                        {[10, 25, 50, 100].map((n) => (
                            <MenuItem key={n} value={n}>
                                {n}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                        variant="outlined"
                        onClick={() => onPageChange(page - 1)}
                        disabled={page === 1}
                        sx={{ mr: 1 }}
                    >
                        Prev
                    </Button>
                    <Typography component="span" sx={{ mx: 1 }}>
                        Page {page}
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => onPageChange(page + 1)}
                        // disabled={(page * limit) >= totalRowCount}
                        disabled={rows.length == 0}

                        sx={{ mr: 2 }}
                    >
                        Next
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        disabled={selectedCount == 0}
                        onClick={handleDeleteClick}
                    >
                        Delete Selected ({selectedCount})
                    </Button>
                </Box>
            </Box>

            {/* Data Grid */}
            <DataGrid
                rows={rows}
                columns={columns}
                paginationModel={{ page: page - 1, pageSize: limit }}
                paginationMode="server"
                rowCount={totalRowCount}
                disableRowSelectionOnClick
                rowHeight={40}
                checkboxSelection
                selectionModel={selectionModel}
                onRowSelectionModelChange={(newSelection) => {
                    setSelectionModel(newSelection);
                }}
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={handleProcessRowUpdateError}
                sx={{
                    border: '1px solid #ccc',
                    borderRadius: 2,
                    '& .MuiDataGrid-cell': {
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                        lineHeight: '1.5rem',
                    },
                    fontFamily: 'Inter, sans-serif',
                }}
                slots={{
                    noRowsOverlay: () => (
                        <Typography sx={{ p: 2, color: 'gray' }}>
                            No data to display.
                        </Typography>
                    ),
                }}
            />
        </Box>
    );

};

export default DataViewer;
import React, { useState, useRef } from 'react';
import ConnectionForm from './components/ConnectionForm';
import Sidebar from './components/Sidebar';
import DataViewer from './components/DataViewer';
import QueryBuilder from './components/QueryBuilder';
import ShellQueryBox from './components/ShellQueryBox';
import {
  getMongoCollections,
  getMongoData,
  getSQLTables,
  getSQLData,
  runMongoQuery,
  runSQLQuery,
  runMongoShell,
  updateMongoData,
  deleteMongoData,
  uploadMongoData

} from './services/api';
import './App.css';
import CircularProgress from '@mui/material/CircularProgress';

function App() {
  const [dbType, setDbType] = useState(null);
  const [collections, setCollections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25); // UI rows per page (client-side)
  const [dbLimit, setDbLimit] = useState(25); // Backend fetch size (database-wise)
  const [queryOptions, setQueryOptions] = useState(null);
  const [totalRowCount, setTotalRowCount] = useState(0); // State for total row count
  const [loading, setLoading] = useState(false); // New loading state
  const [error, setError] = useState(null); // New error state
  // Helper to clear errors
  const clearError = () => setError(null);
  const [showQueryBuilder, setShowQueryBuilder] = useState(false);
  const [showShell, setShowShell] = useState(false);
  const [dateColumns, setDateColumns] = useState([]);
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const fetchData = async (collectionOrTable, pg = page, lim = dbLimit, query = queryOptions) => {
    clearError(); // Clear previous errors
    setLoading(true); // Set loading true
    // Client-side pagination: always fetch first page of size 'lim'
    const offset = 0;

    try {
      let result;

      if (query) {
        result = dbType === 'mongo'
          ? await runMongoQuery(collectionOrTable, { ...query, limit: lim, offset })
          : await runSQLQuery(collectionOrTable, { ...query, limit: lim, offset });
      } else {
        result = dbType === 'mongo'
          ? await getMongoData(collectionOrTable, lim, offset)
          : await getSQLData(collectionOrTable, lim, offset);
      }

      if (dbType === 'mongo') {
        setData(result.data);
        setTotalRowCount(result.total || result.data?.length || 0);
        // derive date columns from sample data
        const sample = (result.data && result.data[0]) ? result.data[0] : null;
        if (sample) {
          const cols = Object.keys(sample).filter((k) => {
            const v = sample[k];
            if (v == null) return false;
            if (typeof v === 'string') {
              const t = Date.parse(v);
              return !isNaN(t);
            }
            return false;
          });
          setDateColumns(cols);
        } else {
          setDateColumns([]);
        }
      } else {
        setData(result.data);
        setTotalRowCount(result.data.length || 0);
        setDateColumns([]);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setData([]);
      setTotalRowCount(0);
      setError(`Failed to load data: ${err.message}`); // Set specific error message
    } finally {
      setLoading(false); // Set loading false
    }
  };

  const handleConnect = async (type) => {
    clearError();
    setLoading(true);
    try {
      setDbType(type);
      const items = type === 'mongo'
        ? await getMongoCollections()
        : await getSQLTables();
      setCollections(items.data);
      // Optionally fetch initial data for the first collection/table after connection
      if (items.data && items.data.length > 0) {
        setSelected(items.data[0]);
        fetchData(items.data[0], 1, dbLimit, null);
      }
    } catch (error) {
      console.error('Failed to connect or fetch collections/tables:', error);
      setError(`Connection failed: ${error.message}`);
      setCollections([]);
      setDbType(null); // Reset DB type on connection failure
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (name) => {
    clearError();
    setSelected(name);
    setQueryOptions(null);
    setPage(1); // Reset page to 1 when a new collection/table is selected
    await fetchData(name, 1, dbLimit, null); // Fetch using database-wise limit
  };

  const handlePageChange = (newPage) => {
    clearError();
    setPage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    clearError();
    setPageSize(newLimit);
    setPage(1); // Reset to page 1 for UI pagination
  };

  const handleRunQuery = (query) => {
    clearError();
    setQueryOptions(query);
    setPage(1); // Reset page to 1 for new query
    if (query && typeof query.limit === 'number') {
      setDbLimit(Number(query.limit));
      fetchData(selected, 1, Number(query.limit), query);
    } else {
      fetchData(selected, 1, dbLimit, query);
    }
  };



  const handleRunShellQuery = async (shellString) => {
    clearError();
    setLoading(true);
    try {
      const response = await runMongoShell(shellString);
      alert('Query executed successfully: ' + JSON.stringify(response.data));
      // After running shell query, re-fetch data to reflect changes
      fetchData(selected, page, dbLimit, queryOptions);
    } catch (err) {
      console.error('Shell query failed:', err);
      setError(`Shell query failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportData = (data, format = 'json') => {
    // Your existing export data logic for client-side export
    const filename = `export_${Date.now()}.${format}`;
    let fileContent;

    if (format === 'csv') {
      const keys = Object.keys(data[0] || {});
      const header = keys.join(',');
      const rows = data.map(row =>
        keys.map(k => {
          const value = row[k] ?? '';
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      );
      fileContent = [header, ...rows].join('\n');
    } else {
      fileContent = JSON.stringify(data, null, 2);
    }

    const blob = new Blob([fileContent], {
      type: format === 'csv' ? 'text/csv' : 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRowUpdate = async (updatedRow) => {
    clearError();
    setLoading(true);
    try {
      const collection = selected;
      const query = { _id: updatedRow._id };
      const { _id, ...updateFields } = updatedRow;

      if (dbType === 'mongo') {
        // Assuming updateMongoData returns a response object with a success indicator
        const response = await updateMongoData(collection, query, updateFields);
        if (!response || response.success === false) { // Check for a specific success flag from your API
          throw new Error(response?.message || 'MongoDB update failed unexpectedly.');
        }
      } else {
        // SQL update logic goes here. If not implemented, throw an error.
        throw new Error("SQL update is not implemented yet.");
      }

      // Optimistically update local data state only if API call succeeded
      setData((prev) =>
        prev.map((row) => (row.id === updatedRow.id ? updatedRow : row))
      );
      // alert('Row updated successfully!'); // You can remove this if you prefer silent success
      return updatedRow; // Return the newRow as required by DataGrid's processRowUpdate
    } catch (error) {
      console.error('Error updating row:', error);
      setError(`Update failed: ${error.message}`);
      // Re-throw the error so DataGrid can revert the change if needed
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRowsDelete = async (ids) => {
    clearError();
    setLoading(true);
    try {
      const collection = selected;
      if (dbType === 'mongo') {
        const response = await deleteMongoData(collection, ids);
        await fetchData(selected, page, dbLimit, queryOptions);
      } else {
        // SQL delete logic goes here.
        throw new Error("SQL delete is not implemented yet.");
      }

      alert('Selected rows deleted successfully!');
    } catch (error) {
      console.error('Error deleting rows:', error);
      setError(`Deletion failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleImportData = async (file) => {
    clearError();

    if (!file || !selected || dbType !== 'mongo') {
      alert('Please select a valid file and collection.');
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      // Make sure it's an array
      const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];

      // Call your API to insert data
      const response = await uploadMongoData(selected, dataArray);

      if (!response || response.success === false) {
        throw new Error(response?.message || 'Failed to import data.');
      }

      alert('Data imported successfully!');
      fetchData(selected, page, dbLimit, queryOptions); // Refresh data
    } catch (err) {
      console.error('Import failed:', err);
      setError(`Import failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: theme === 'light' ? '#ffffff' : '#0f172a', color: theme === 'light' ? '#111827' : '#e5e7eb' }}>
      {/* Header */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid ' + (theme === 'light' ? '#e5e7eb' : '#334155'), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: 0.5 }}>dbclient</div>
      </div>

      {/* Main */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {!dbType ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ConnectionForm onConnect={handleConnect} />
          </div>
        ) : (
          <>
            <Sidebar items={collections} onSelect={handleSelect} selected={selected} theme={theme} />

            <div style={{ flex: 1, padding: 20, overflowX: 'hidden', boxSizing: 'border-box', maxWidth: '100%', position: 'relative' }}>
            {/* Loader overlay for smooth tab switching */}
            {loading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(255,255,255,0.6)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 0.2s',
              }}>
                <CircularProgress size={48} thickness={4} style={{ color: '#6366f1' }} />
              </div>
            )}
            <h3>{dbType === 'mongo' ? 'Collection' : 'Table'}: {selected}</h3>

            {/* Display Loading and Error Messages */}
            {loading && <div style={{ color: 'blue', marginBottom: '10px' }}>Loading...</div>}
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>}

            {selected && (
              <>
                {/* Toggle Buttons */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                  <button
                    style={{
                      padding: '12px 32px',
                      borderRadius: 8,
                      border: 'none',
                      background: showQueryBuilder ? 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)' : '#e0e7ff',
                      color: showQueryBuilder ? 'white' : '#374151',
                      fontWeight: 700,
                      fontSize: 17,
                      cursor: 'pointer',
                      boxShadow: showQueryBuilder ? '0 2px 8px rgba(99,102,241,0.10)' : 'none',
                      transition: 'background 0.2s',
                    }}
                    onClick={() => {
                      setShowQueryBuilder((prev) => !prev);
                      setShowShell(false);
                    }}
                  >
                    Query Builder
                  </button>
                  {dbType === 'mongo' && (
                    <button
                      style={{
                        padding: '12px 32px',
                        borderRadius: 8,
                        border: 'none',
                        background: showShell ? 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)' : '#e0e7ff',
                        color: showShell ? 'white' : '#374151',
                        fontWeight: 700,
                        fontSize: 17,
                        cursor: 'pointer',
                        boxShadow: showShell ? '0 2px 8px rgba(99,102,241,0.10)' : 'none',
                        transition: 'background 0.2s',
                      }}
                      onClick={() => {
                        setShowShell((prev) => !prev);
                        setShowQueryBuilder(false);
                      }}
                    >
                      Shell
                    </button>
                  )}
                  </div>
                  <button
                    onClick={toggleTheme}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 8,
                      border: '1.5px solid #6366f1',
                      background: theme === 'light' ? '#eef2ff' : '#1f2937',
                      color: theme === 'light' ? '#1f2937' : '#e5e7eb',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </button>
                </div>
                {/* Show QueryBuilder or ShellQueryBox full width if toggled */}
                {showQueryBuilder && (
                  <QueryBuilder onRunQuery={handleRunQuery} columns={data && data.length > 0 ? Object.keys(data[0]) : []} theme={theme} />
                )}
                {showShell && dbType === 'mongo' && (
                  <ShellQueryBox onRunShell={handleRunShellQuery} theme={theme} />
                )}
                <div style={{ marginBottom: 10, display: 'flex', gap: 12 }}>
                  <button
                    style={{
                      padding: '10px 24px',
                      borderRadius: 8,
                      border: '1.5px solid #60a5fa',
                      background: 'linear-gradient(90deg, #e0e7ff 0%, #bae6fd 100%)',
                      color: '#2563eb',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(96,165,250,0.10)',
                      transition: 'background 0.2s',
                    }}
                    onClick={() => exportData(data, 'csv')}
                  >
                    Export CSV
                  </button>
                  <button
                    style={{
                      padding: '10px 24px',
                      borderRadius: 8,
                      border: '1.5px solid #60a5fa',
                      background: 'linear-gradient(90deg, #e0e7ff 0%, #bae6fd 100%)',
                      color: '#2563eb',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(96,165,250,0.10)',
                      transition: 'background 0.2s',
                    }}
                    onClick={() => exportData(data, 'json')}
                  >
                    Export JSON
                  </button>
                </div>
                <DataViewer
                  data={data}
                  page={page}
                  limit={pageSize}
                  totalRowCount={totalRowCount}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                  onRowUpdate={handleRowUpdate}
                  onRowsDelete={handleRowsDelete}
                  theme={theme}
                />
              </>
            )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid ' + (theme === 'light' ? '#e5e7eb' : '#334155'), fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>© {new Date().getFullYear()} dbclient</span>
        <span style={{ opacity: 0.7 }}>Theme: {theme}</span>
      </div>
    </div>
  );
}

export default App;
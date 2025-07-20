import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
// const API_BASE = 'https://80de-106-51-227-227.ngrok-free.app/api';

export const connectMongo = (payload) =>
    axios.post(`${API_BASE}/mongo/connect`, payload);

export const getMongoCollections = () =>
    axios.get(`${API_BASE}/mongo/collections`);

export const getMongoData = (collection, limit = 25, offset = 0) =>
    axios.get(`${API_BASE}/mongo/data`, { params: { collection, limit, offset } }).then(res => res.data);

export const updateMongoData = (collection, query, update) =>
    axios.post(`${API_BASE}/mongo/update`, { collection, query, update });

export const deleteMongoData = (collection, ids) =>
    axios.post(`${API_BASE}/mongo/delete`, { collection, ids });

export const uploadMongoData = (collection, documents) =>
    axios.post(`${API_BASE}/mongo/upload`, { collection, documents });


export const runMongoQuery = (collection, query) =>
    axios.post(`${API_BASE}/mongo/query`, { collection, query }).then(res => res.data);

export const connectSQL = (payload) =>
    axios.post(`${API_BASE}/mssql/connect`, payload);

export const getSQLTables = () =>
    axios.get(`${API_BASE}/mssql/tables`);

export const getSQLData = (table, limit = 25, offset = 0) =>
    axios.get(`${API_BASE}/mssql/data`, { params: { table, limit, offset } });

export const runSQLQuery = (table, query) =>
    axios.post(`${API_BASE}/mssql/query`, { table, query });

export const connectMSSQL = (config) =>
    axios.post(`${API_BASE}/mssql/connect`, config);

export const runMongoShell = (shellCommand) =>
    axios.post(`${API_BASE}/mongo/shell`, { command: shellCommand });
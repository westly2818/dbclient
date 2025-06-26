const express = require('express');
const router = express.Router();
const mssqlService = require('../services/mssqlService');

router.post('/connect', async (req, res) => {
    try {
        await mssqlService.connect(req.body);
        res.json({ message: 'MSSQL connected' });
    } catch (err) {
        console.log(err);

        res.status(500).json({ error: err.message });
    }
});

router.get('/tables', async (req, res) => {
    try {
        const tables = await mssqlService.getTables();
        res.json(tables);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/data', async (req, res) => {
    const { table, limit = 50, offset = 0 } = req.query;
    try {
        const data = await mssqlService.getTableData(table, Number(limit), Number(offset));
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/query', async (req, res) => {
    try {
        const { table, limit = 50, offset = 0, query = {}, sort = {} } = req.body;

        // Call your MSSQL service query logic
        const data = await mssqlService.getTableDataAdvanced(table, { limit, offset, query, sort });

        res.json(data);
    } catch (err) {
        console.error('❌ Error in /api/mssql/query:', err);
        res.status(500).json({ error: err.message || 'Query failed' });
    }
});
router.get('/export', async (req, res) => {
    const { table, format = 'json' } = req.query;
    const data = await sqlService.getTableData(table);

    if (format === 'csv') {
        const csv = convertToCSV(data);
        res.header('Content-Type', 'text/csv');
        res.attachment(`${table}.csv`);
        return res.send(csv);
    } else {
        res.json(data);
    }
});
router.put('/update', async (req, res) => {
    const { table, where, data } = req.body;
    try {
        await sqlService.updateRow(table, where, data);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

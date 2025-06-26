const express = require('express');
const router = express.Router();
const { connectSQL, getTables, getTableData } = require('../services/sqlService');

router.post('/connect', async (req, res) => {
    try {
        await connectSQL(req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/tables', async (req, res) => {
    try {
        const tables = await getTables();
        res.json(tables);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/data', async (req, res) => {
    const table = req.query.table;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const data = await getTableData(table, limit, offset);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
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

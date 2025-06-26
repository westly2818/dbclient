const express = require('express');
const router = express.Router();
const { connectMongo, getCollections, getData, runQuery,
    runMongoShell, updateData, deleteData, insertDocuments } = require('../services/mongoService');

router.post('/connect', async (req, res) => {
    try {
        await connectMongo(req.body);
        setTimeout(() => {
            res.json({ success: true });
        }, 1000)

    } catch (err) {
        console.log(err);

        res.status(500).json({ error: err.message });
    }
});

router.get('/collections', async (req, res) => {
    try {
        const collections = await getCollections();
        res.json(collections);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/data', async (req, res) => {
    const collection = req.query.collection;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    try {
        const data = await getData(collection, limit, offset);
        res.json(data);
    } catch (err) {
        console.log(err);

        res.status(500).json({ error: err.message });
    }
});

router.post('/query', async (req, res) => {
    try {
        const { collection, query } = req.body;
        const data = await runQuery(collection, query);
        res.json(data);
    } catch (err) {
        console.error('Mongo Query Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Update a document by ID or condition
router.post('/update', async (req, res) => {
    const { collection, query, update } = req.body;
    try {
        const result = await updateData(collection, query, update);
        res.json({ success: true, result });
    } catch (err) {
        console.error('Mongo update error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

function convertToCSV(data) {
    if (!data.length) return '';
    const keys = Object.keys(data[0]);
    const header = keys.join(',');
    const rows = data.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(','));
    return [header, ...rows].join('\n');
}


router.post('/shell', async (req, res) => {
    const { command } = req.body;
    try {
        const result = await runMongoShell(command);
        res.json({ data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/delete', async (req, res) => {
    const { collection, ids } = req.body;

    if (!collection || !Array.isArray(ids)) {
        return res.status(400).json({ error: 'Collection and array of IDs are required.' });
    }

    try {
        const result = await deleteData(collection, ids);
        res.json({
            success: true,
            deletedCount: result.deletedCount
        });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/upload', async (req, res) => {
    const { collection, documents } = req.body;
    if (!collection || !Array.isArray(documents)) {
        return res.status(400).json({ success: false, message: 'Collection and documents array required.' });
    }

    try {
        const result = await insertDocuments(collection, documents);
        res.json({ success: true, insertedCount: result.insertedCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

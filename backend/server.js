const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const mongoRoutes = require('./routes/mongodb');
const sqlRoutes = require('./routes/sql');
const mssqlRoutes = require('./routes/mssql');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// =======================================================
// CORRECT ORDER: Define your specific API routes FIRST
// =======================================================
app.use('/api/mongo', mongoRoutes);
app.use('/api/sql', sqlRoutes);
app.use('/api/mssql', mssqlRoutes);

// =======================================================
// THEN, serve static files and handle SPA routing for everything else
// =======================================================
// Serve React static files
app.use(express.static(path.join(__dirname, "client")));

// Catch-all route to handle SPA routing (should be last)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, "client", "index.html"));
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
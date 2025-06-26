const knex = require('knex');

let db;

/**
 * Connects to MSSQL using Knex.
 * @param {Object} config - { host, port, user, password, database, instance }
 * If 'instance' is provided, 'port' will be ignored,
 * as Knex/Tedious will use SQL Server Browser to find the port.
 */
exports.connect = async ({ host, port, user, password, database, instance }) => {
    try {
        let instanceName = instance

        const connectionConfig = {
            server: host,
            user,
            password,
            instanceName,
            database,
            options: {
                encrypt: false, // Set to true if using Azure
                enableArithAbort: true // Required for certain SQL Server versions
            },
            pool: {
                max: 7,
                min: 3,
                acquireTimeout: 90000
            }
        };


        let config = {
            client: 'mssql',
            connection: connectionConfig,

        }
        let dbinstance = await getInstance(config)
        db = dbinstance.instance
        console.log('✅ Connected to MSSQL via Knex');
        return true
    } catch (err) {
        console.error('❌ Failed to connect via Knex:', err);
        throw err;
    }
};
async function getInstance(pgConfig) {
    return new Promise((resolve, reject) => {
        let timeout = 90000;
        var knex = require("knex")(pgConfig);
        resolve({ status: "success", instance: knex });
    });
}
/**
 * Get list of MSSQL tables using Knex.
 */
exports.getTables = async () => {
    if (!db) throw new Error('Not connected to database. Call connect() first.');

    try {
        const result = await db('INFORMATION_SCHEMA.TABLES')
            .select('TABLE_NAME')
            .where('TABLE_TYPE', 'BASE TABLE')
            .andWhere('TABLE_SCHEMA', 'dbo'); // Often good practice to filter by schema

        return result.map(row => row.TABLE_NAME);
    } catch (err) {
        console.error('Error fetching tables:', err);
        throw err;
    }
};

/**
 * Fetch paginated data from given table.
 */
exports.getTableData = async (table, limit = 50, offset = 0) => {
    if (!db) throw new Error('Not connected to database. Call connect() first.');

    try {
        // Using db.raw for table name to handle special characters or reserved keywords
        // This is good practice for dynamically passed table names
        const data = await db.select('*')
            .from(db.raw(`[${table}]`))
            .orderByRaw('(SELECT NULL)')  // Avoids needing a real column name
            .offset(offset)
            .limit(limit);

        return data;
    } catch (err) {
        console.error(`Error fetching data from table ${table}:`, err);
        throw err;
    }
};

/**
// mssqlService.js (or db.js)

// ... (your existing connect, getTables, getTableData functions) ...

/**
 * Fetch paginated, filtered, and sorted data from given table.
 * @param {string} table - The name of the table to fetch data from.
 * @param {object} options - Options for pagination, filtering, and sorting.
 * @param {number} [options.limit=50] - The maximum number of rows to return.
 * @param {number} [options.offset=0] - The number of rows to skip.
 * @param {object} [options.query={}] - A structured query object.
 * Expected format:
 * {
 * "where": {
 * "columnName1": "exactValue",
 * "columnName2": { "operator": "=", "value": "someValue" },
 * "columnName3": { "operator": ">=", "value": 100 },
 * "columnName4": { "operator": "IN", "value": ["val1", "val2"] },
 * "columnName5": { "operator": "LIKE", "value": "%pattern%" } // Added LIKE support
 * },
 * "sort": {
 * "columnName": "asc" | "desc"
 * },
 * "limit": 25,
 * "offset": 0
 * }
 * @param {object} [options.sort={}] - (Deprecated in favor of options.query.sort, but kept for compatibility)
 */
exports.getTableDataAdvanced = async (table, { limit = 50, offset = 0, query = {}, sort = {} }) => {
    if (!db) throw new Error('Not connected to database. Call connect() first.');

    try {
        let builder = db.select('*').from(db.raw(`[${table}]`));

        // 1. Extract parameters from the 'query' object if they exist there
        //    Prioritize parameters directly passed if they conflict (e.g., limit)
        const whereClause = query.where || {};
        const querySort = query.sort || {};
        const queryLimit = query.limit !== undefined ? query.limit : limit;
        const queryOffset = query.offset !== undefined ? query.offset : offset;

        // Use the extracted limit/offset for Knex's pagination methods
        limit = queryLimit;
        offset = queryOffset;

        // 2. Apply Filtering based on the 'whereClause'
        for (const column in whereClause) {
            const filter = whereClause[column];

            if (typeof filter === 'object' && filter !== null) {
                // Structured filter: { "operator": "=", "value": "Haircap" }
                const { operator, value } = filter;

                switch (operator.toUpperCase()) { // Convert to uppercase for case-insensitivity
                    case '=':
                        builder.where(column, value);
                        break;
                    case '!=':
                    case '<>': // Both work for not equal
                        builder.where(column, '!=', value);
                        break;
                    case '>':
                        builder.where(column, '>', value);
                        break;
                    case '>=':
                        builder.where(column, '>=', value);
                        break;
                    case '<':
                        builder.where(column, '<', value);
                        break;
                    case '<=':
                        builder.where(column, '<=', value);
                        break;
                    case 'IN':
                        // Ensure value is an array for IN operator
                        if (Array.isArray(value)) {
                            builder.whereIn(column, value);
                        } else {
                            console.warn(`Warning: 'IN' operator for column '${column}' requires an array value. Received:`, value);
                        }
                        break;
                    case 'NOT IN':
                        if (Array.isArray(value)) {
                            builder.whereNotIn(column, value);
                        } else {
                            console.warn(`Warning: 'NOT IN' operator for column '${column}' requires an array value. Received:`, value);
                        }
                        break;
                    case 'LIKE':
                        builder.where(column, 'LIKE', value);
                        break;
                    case 'NOT LIKE':
                        builder.where(column, 'NOT LIKE', value);
                        break;
                    case 'IS NULL':
                        builder.whereNull(column);
                        break;
                    case 'IS NOT NULL':
                        builder.whereNotNull(column);
                        break;
                    // Add more operators as needed
                    default:
                        console.warn(`Warning: Unrecognized operator '${operator}' for column '${column}'. Ignoring filter.`);
                        break;
                }
            } else {
                // Simple exact match filter: { "columnName": "exactValue" }
                builder.where(column, filter);
            }
        }

        // 3. Apply Sorting
        // Prioritize sort from 'query.sort', then fallback to top-level 'sort'
        const effectiveSort = Object.keys(querySort).length > 0 ? querySort : sort;

        if (Object.keys(effectiveSort).length > 0) {
            Object.entries(effectiveSort).forEach(([key, direction]) => {
                builder.orderBy(key, (direction === -1 || String(direction).toLowerCase() === 'desc') ? 'desc' : 'asc');
            });
        } else {
            builder.orderByRaw('(SELECT NULL)');
        }

        // 4. Apply Pagination (using the potentially updated limit/offset values)
        builder.offset(offset).limit(limit);

        return await builder;
    } catch (err) {
        console.error(`❌ Error fetching data from ${table}:`, err);
        throw err;
    }
};


// Optional: Add a disconnect function for graceful shutdown
exports.disconnect = async () => {
    if (db) {
        try {
            await db.destroy();
            console.log('Disconnected from MSSQL');
            db = null;
        } catch (err) {
            console.error('Error disconnecting from MSSQL:', err);
            throw err;
        }
    }
};

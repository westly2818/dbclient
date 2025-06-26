const mysql = require('mysql2/promise');
const { Client: PgClient } = require('pg');
const sql = require('mssql');

let sqlClient;
let dbType;

exports.connectSQL = async ({ type, host, port, user, password, database, instance }) => {
    dbType = type;

    if (type === 'mysql') {
        sqlClient = await mysql.createConnection({ host, port, user, password, database });
    } else if (type === 'postgres') {
        sqlClient = new PgClient({ host, port, user, password, database });
        await sqlClient.connect();
    } else if (type === 'mssql') {
        sqlClient = await sql.connect({
            server: host,
            port: port || 1433,
            user,
            password,
            database,
            options: {
                encrypt: false,
                trustServerCertificate: true,
                ...(instance ? { instanceName: instance } : {})
            },
            pool: {
                max: 7,
                min: 3,
                idleTimeoutMillis: 30000
            }
        });
    } else {
        throw new Error('Unsupported SQL type');
    }
};

exports.getTables = async () => {
    if (!sqlClient) throw new Error('Not connected to SQL');

    if (dbType === 'mysql') {
        const [rows] = await sqlClient.execute('SHOW TABLES');
        return rows.map(r => Object.values(r)[0]);
    } else if (dbType === 'postgres') {
        const res = await sqlClient.query(`
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
        `);
        return res.rows.map(r => r.table_name);
    } else if (dbType === 'mssql') {
        const result = await sqlClient.request().query(`
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
        `);
        return result.recordset.map(r => r.TABLE_NAME);
    } else {
        throw new Error('Unsupported DB type');
    }
};

exports.getTableData = async (table, limit = 50, offset = 0) => {
    if (!sqlClient) throw new Error('Not connected to SQL');

    if (dbType === 'mysql') {
        const [rows] = await sqlClient.execute(
            `SELECT * FROM \`${table}\` LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        return rows;
    } else if (dbType === 'postgres') {
        const res = await sqlClient.query(
            `SELECT * FROM "${table}" LIMIT $1 OFFSET $2`,
            [limit, offset]
        );
        return res.rows;
    } else if (dbType === 'mssql') {
        const result = await sqlClient.request()
            .input('limit', sql.Int, limit)
            .input('offset', sql.Int, offset)
            .query(`
                SELECT * FROM ${table}
                ORDER BY (SELECT NULL)
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY;
            `);
        return result.recordset;
    } else {
        throw new Error('Unsupported DB type');
    }
};
exports.updateRow = async (table, where, data) => {
    const keys = Object.keys(data);
    const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const values = Object.values(data);

    const whereClause = Object.entries(where)
        .map(([k, v], i) => `"${k}" = '${v}'`)
        .join(' AND ');

    const query = `UPDATE "${table}" SET ${setClause} WHERE ${whereClause}`;
    await sqlClient.query(query, values);
};

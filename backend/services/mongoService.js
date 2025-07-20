const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

let db;

exports.connectMongo = async ({ uri, dbName }) => {
    const client = new MongoClient(uri || process.env.MONGO_URI);
    await client.connect();
    db = client.db(dbName || process.env.MONGO_DB);
};

exports.getCollections = async () => {
    if (!db) throw new Error('Not connected to MongoDB');
    const collections = await db.listCollections().toArray();
    return collections.map(c => c.name);
};

exports.getData = async (collectionName, limit = 50, offset = 0) => {
    if (!db) throw new Error('Not connected to MongoDB');
    const collection = db.collection(collectionName);
    const total = await collection.countDocuments({});
    const data = await collection.find({})
        .skip(offset)
        .limit(limit)
        .toArray();
    return { data, total };
};

exports.runQuery = async (collectionName, query = {}) => {
    if (!db) throw new Error('Not connected to MongoDB');

    const { where = {}, sort = {}, limit = 50, offset = 0 } = query;

    // Convert custom query format into MongoDB's filter format
    const mongoFilter = {};
    for (const [field, cond] of Object.entries(where)) {
        const { operator, value } = cond;

        switch (operator) {
            case '=':
                mongoFilter[field] = value;
                break;
            case '!=':
                mongoFilter[field] = { $ne: value };
                break;
            case '>':
                mongoFilter[field] = { $gt: value };
                break;
            case '<':
                mongoFilter[field] = { $lt: value };
                break;
            case 'LIKE':
                mongoFilter[field] = { $regex: value, $options: 'i' };
                break;
            default:
                mongoFilter[field] = value;
        }
    }

    const mongoSort = Object.entries(sort).reduce((acc, [key, dir]) => {
        acc[key] = dir === 'desc' ? -1 : 1;
        return acc;
    }, {});

    const collection = db.collection(collectionName);
    const total = await collection.countDocuments(mongoFilter);
    const data = await collection.find(mongoFilter)
        .sort(mongoSort)
        .skip(offset)
        .limit(limit)
        .toArray();
    return { data, total };
};

exports.runMongoShell = async (command) => {
    if (!db) throw new Error('Not connected to MongoDB');

    // Quick check for common shell syntax
    if (/db\.[a-zA-Z0-9_]+\.find\(/.test(command)) {
        throw new Error(
            "Please use Node.js driver syntax: db.collection('COLLECTION_NAME').find({}).toArray()"
        );
    }

    // If the command looks like a db.collection().find() or similar, auto-wrap with await if not present
    let wrappedCommand = command.trim();
    const needsAwait = /db\.collection\([^)]+\)\.(find|aggregate|countDocuments|distinct|findOne)\(/.test(wrappedCommand) && !/^await /.test(wrappedCommand) && !/^return /.test(wrappedCommand);
    if (needsAwait) {
        wrappedCommand = 'await ' + wrappedCommand;
    }

    try {
        const func = new Function('db', `"use strict"; return (async () => { ${wrappedCommand} })();`);
        const result = await func(db);
        return result;
    } catch (err) {
        throw new Error('Invalid MongoDB shell command: ' + err.message);
    }
};


exports.updateData = async (collectionName, filter, update) => {
    if (!db) throw new Error('Not connected to MongoDB');

    // Convert _id string to ObjectId if present
    if (filter._id) {
        try {
            filter._id = new ObjectId(filter._id);
        } catch (e) {
            throw new Error('Invalid _id format');
        }
    }

    const result = await db
        .collection(collectionName)
        .updateOne(filter, { $set: update });

    return result;
};
exports.deleteData = async (collectionName, ids) => {
    if (!db) throw new Error('Not connected to MongoDB');
    if (!Array.isArray(ids)) throw new Error('IDs must be an array');

    const objectIds = ids.map(id => new ObjectId(id));
    const result = await db.collection(collectionName).deleteMany({
        _id: { $in: objectIds }
    });

    return result;
};
exports.insertDocuments = async (collectionName, documents) => {
    if (!db) throw new Error('Not connected to MongoDB');
    if (!Array.isArray(documents)) throw new Error('Documents must be an array');

    const result = await db.collection(collectionName).insertMany(documents, {
        ordered: false // continue inserting even if some fail (e.g., duplicate _id)
    });

    return result;
};
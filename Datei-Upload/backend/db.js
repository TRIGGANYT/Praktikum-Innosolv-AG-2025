// backend/db.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectToDb() {
  try {
    await client.connect();
    console.log('MongoDB verbunden');
    return client.db('file-sharing-innosolv');
  } 
  catch (error) {
    console.error('MongoDB-Verbindung fehlgeschlagen:', error);
    throw error;
  }
}

module.exports = connectToDb;

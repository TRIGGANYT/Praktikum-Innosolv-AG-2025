// backend/db.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://floringerig_db_user:2uJUFfU4bleaOsta@file-sharing-innosolv.eeu8atz.mongodb.net/';
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

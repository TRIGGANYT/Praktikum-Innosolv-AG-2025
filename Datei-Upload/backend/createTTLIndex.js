// createTTLIndex.js
const connectToDb = require('./db');

async function createTTLIndex() {
  const db = await connectToDb();
  const collection = db.collection('uploads');

  // Index auf expiresAt mit TTL (0 Sekunden nach Ablaufzeit löschen)
  await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  console.log('✅ TTL-Index wurde erstellt.');
  process.exit();
}

createTTLIndex().catch(err => {
  console.error('Fehler beim Erstellen des Index:', err);
  process.exit(1);
});

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'db', 'hairdresser.db');

const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
const seedPath = path.join(__dirname, '..', 'db', 'seed.sql');

export async function initDb() {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await db.exec(schemaSql);

  const serviceCount = await db.get('SELECT COUNT(*) as count FROM services');
  if (serviceCount.count === 0) {
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await db.exec(seedSql);
  }

  return db;
}

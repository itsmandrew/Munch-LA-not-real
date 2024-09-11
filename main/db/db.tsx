import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

// Function to open SQLite database
export async function openDb(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  // Construct the path to your SQLite database
  const dbPath: string = path.join(process.cwd(), '', 'mydatabase.sqlite3');
  console.log('db_path:', dbPath);

  // Open and return the database connection
  return open({
    filename: dbPath,
    driver: sqlite3.Database
  });
}

// Function to close SQLite database
export async function closeDb(db: Database): Promise<void> {
  await db.close();
}

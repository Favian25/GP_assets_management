const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sistem_pencatatan_asset'
    });

    try {
        console.log('Migrating assets table...');
        
        // Add user_id column if it doesn't exist
        const [columns] = await connection.query('SHOW COLUMNS FROM assets LIKE "user_id"');
        if (columns.length === 0) {
            await connection.query('ALTER TABLE assets ADD COLUMN user_id INT NULL');
            await connection.query('ALTER TABLE assets ADD CONSTRAINT fk_asset_user FOREIGN KEY (user_id) REFERENCES users(id)');
            console.log('Added user_id column and foreign key to assets table.');
        } else {
            console.log('user_id column already exists in assets table.');
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();

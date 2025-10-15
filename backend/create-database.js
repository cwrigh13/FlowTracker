const { Pool } = require('pg');

// Create FlowTracker database and schema
async function createDatabase() {
    const adminPool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres', // Connect to default database first
        password: 'flowtracker2024',
        port: 5432,
    });

    try {
        console.log('🔄 Creating FlowTracker database...');
        
        // Create database
        await adminPool.query('CREATE DATABASE flowtracker');
        console.log('✅ Database "flowtracker" created successfully!');
        
        // Close admin connection
        await adminPool.end();
        
        // Connect to the new database
        const pool = new Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'flowtracker',
            password: 'flowtracker2024',
            port: 5432,
        });

        console.log('🔄 Creating database schema...');
        
        // Read and execute schema
        const fs = require('fs');
        const path = require('path');
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        await pool.query(schema);
        console.log('✅ Database schema created successfully!');
        
        // Test the schema
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        console.log('📊 Created tables:');
        result.rows.forEach(row => {
            console.log(`   - ${row.table_name}`);
        });
        
        await pool.end();
        console.log('🎉 FlowTracker database setup complete!');
        
    } catch (error) {
        if (error.code === '42P04') {
            console.log('ℹ️  Database "flowtracker" already exists');
            console.log('✅ FlowTracker database is ready!');
        } else {
            console.error('❌ Database creation failed:');
            console.error('Error:', error.message);
        }
    }
}

createDatabase();

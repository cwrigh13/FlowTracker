const { Pool } = require('pg');

// Setup FlowTracker database schema
async function setupSchema() {
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'flowtracker',
        password: 'flowtracker2024',
        port: 5432,
    });

    try {
        console.log('🔄 Setting up FlowTracker database schema...');
        
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
        
        // Test sample data
        const libraryCount = await pool.query('SELECT COUNT(*) FROM libraries');
        const userCount = await pool.query('SELECT COUNT(*) FROM users');
        const issueCount = await pool.query('SELECT COUNT(*) FROM issues');
        
        console.log('📊 Sample data:');
        console.log(`   - Libraries: ${libraryCount.rows[0].count}`);
        console.log(`   - Users: ${userCount.rows[0].count}`);
        console.log(`   - Issues: ${issueCount.rows[0].count}`);
        
        await pool.end();
        console.log('🎉 FlowTracker database setup complete!');
        
    } catch (error) {
        console.error('❌ Schema setup failed:');
        console.error('Error:', error.message);
    }
}

setupSchema();

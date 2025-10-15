const { Pool } = require('pg');

// Test PostgreSQL connection
async function testPostgreSQL() {
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres', // Connect to default database first
        password: 'flowtracker2024', // Your password
        port: 5432,
    });

    try {
        console.log('🔄 Testing PostgreSQL connection...');
        
        // Test basic connection
        const client = await pool.connect();
        console.log('✅ Connected to PostgreSQL successfully!');
        
        // Get version info
        const result = await client.query('SELECT version()');
        console.log('📊 PostgreSQL Version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
        
        // Check if flowtracker database exists
        const dbCheck = await client.query("SELECT 1 FROM pg_database WHERE datname = 'flowtracker'");
        if (dbCheck.rows.length > 0) {
            console.log('✅ Database "flowtracker" already exists');
        } else {
            console.log('ℹ️  Database "flowtracker" does not exist yet');
        }
        
        client.release();
        console.log('🎉 PostgreSQL is ready for FlowTracker!');
        
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:');
        console.error('Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Troubleshooting:');
            console.log('1. Make sure PostgreSQL service is running');
            console.log('2. Check if PostgreSQL is listening on port 5432');
            console.log('3. Verify the password is correct');
        }
        
        if (error.code === '28P01') {
            console.log('\n💡 Authentication failed:');
            console.log('1. Check the password for user "postgres"');
            console.log('2. You may need to reset the postgres password');
        }
    } finally {
        await pool.end();
    }
}

testPostgreSQL();

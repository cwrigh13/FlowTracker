// Test database connection
const { Pool } = require('pg');
require('dotenv').config();

console.log('🐘 Testing FlowTracker Database Connection...\n');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function testDatabase() {
  try {
    console.log('🔍 Connecting to database...');
    const client = await pool.connect();
    
    console.log('✅ Connected successfully!');
    
    // Test basic query
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL Version:', result.rows[0].version);
    
    // Test database name
    const dbResult = await client.query('SELECT current_database()');
    console.log('📊 Current Database:', dbResult.rows[0].current_database);
    
    // Test if our tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('libraries', 'users', 'issues', 'collections')
      ORDER BY table_name
    `);
    
    console.log('📊 Available Tables:', tablesResult.rows.map(row => row.table_name));
    
    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No tables found - migrations may not have run yet');
    } else {
      console.log('✅ Database schema is ready!');
    }
    
    client.release();
    console.log('\n🎉 Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure PostgreSQL is running');
    console.log('2. Check your password in .env file');
    console.log('3. Verify database exists: psql -U postgres -c "\\l"');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testDatabase();

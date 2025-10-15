const { Pool } = require('pg');

async function createTestDatabase() {
  console.log('🔧 Creating test database...');
  
  // Connect to default postgres database first
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'flowtracker2024',
    port: 5432,
  });

  try {
    // Create test database if it doesn't exist
    try {
      await pool.query('CREATE DATABASE flowtracker_test');
      console.log('✅ Test database created');
    } catch (error) {
      if (error.code === '42P04') {
        console.log('✅ Test database already exists');
      } else {
        throw error;
      }
    }
    
    console.log('✅ Test database created or already exists');
    
    // Connect to test database and create schema
    await pool.end();
    
    const testPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'flowtracker_test',
      password: 'flowtracker2024',
      port: 5432,
    });

    // Read and execute schema
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await testPool.query(schema);
    console.log('✅ Test database schema created');
    
    await testPool.end();
    console.log('🎉 Test database setup complete!');
    
  } catch (error) {
    console.error('❌ Test database setup failed:', error.message);
    process.exit(1);
  }
}

createTestDatabase();

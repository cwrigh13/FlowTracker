const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Simple backend test
async function testBackend() {
    console.log('🔄 Testing FlowTracker Backend...');
    
    // Test database connection first
    const pool = new Pool({
        user: 'postgres',
        host: 'localhost',
        database: 'flowtracker',
        password: 'flowtracker2024',
        port: 5432,
    });

    try {
        console.log('📊 Testing database connection...');
        const dbResult = await pool.query('SELECT COUNT(*) as count FROM libraries');
        console.log(`✅ Database connected! Found ${dbResult.rows[0].count} libraries`);
        
        // Test a simple query
        const issuesResult = await pool.query('SELECT COUNT(*) as count FROM issues');
        console.log(`✅ Found ${issuesResult.rows[0].count} issues in database`);
        
        await pool.end();
        
        // Now test the Express server
        console.log('🚀 Starting Express server test...');
        const app = express();
        
        app.use(cors());
        app.use(express.json());
        
        // Health check endpoint
        app.get('/api/health', (req, res) => {
            res.json({ 
                status: 'OK', 
                message: 'FlowTracker Backend is running!',
                timestamp: new Date().toISOString()
            });
        });
        
        // Test database endpoint
        app.get('/api/test-db', async (req, res) => {
            try {
                const testPool = new Pool({
                    user: 'postgres',
                    host: 'localhost',
                    database: 'flowtracker',
                    password: 'flowtracker2024',
                    port: 5432,
                });
                
                const result = await testPool.query('SELECT name, code FROM libraries LIMIT 3');
                await testPool.end();
                
                res.json({
                    status: 'OK',
                    libraries: result.rows,
                    message: 'Database query successful!'
                });
            } catch (error) {
                res.status(500).json({
                    status: 'ERROR',
                    message: 'Database query failed',
                    error: error.message
                });
            }
        });
        
        // Start server on port 3007 (avoiding conflicts)
        const PORT = 3007;
        const server = app.listen(PORT, () => {
            console.log(`✅ Backend server started on http://localhost:${PORT}`);
            console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
            console.log(`✅ Database test: http://localhost:${PORT}/api/test-db`);
            console.log('');
            console.log('🎉 Backend test successful! Press Ctrl+C to stop.');
        });
        
        // Test the endpoints
        setTimeout(async () => {
            try {
                console.log('🧪 Testing health endpoint...');
                const healthResponse = await fetch(`http://localhost:${PORT}/api/health`);
                const healthData = await healthResponse.json();
                console.log('✅ Health check:', healthData.message);
                
                console.log('🧪 Testing database endpoint...');
                const dbResponse = await fetch(`http://localhost:${PORT}/api/test-db`);
                const dbData = await dbResponse.json();
                console.log('✅ Database test:', dbData.message);
                console.log('📊 Sample libraries:', dbData.libraries.map(l => `${l.name} (${l.code})`).join(', '));
                
                console.log('');
                console.log('🎉 All tests passed! Backend is working perfectly!');
                console.log('💡 You can now connect your frontend to http://localhost:3007');
                
            } catch (error) {
                console.error('❌ Test failed:', error.message);
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Backend test failed:');
        console.error('Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Make sure PostgreSQL is running');
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down backend test...');
    process.exit(0);
});

testBackend();

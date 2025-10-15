const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'FlowTracker API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: {
        login: '/api/auth/login',
        verify: '/api/auth/verify'
      },
      issues: '/api/issues',
      collections: '/api/collections'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'FlowTracker API is running',
  });
});

// Mock auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password, library_slug } = req.body;
  
  if (email === 'admin@demo.com' && password === 'password123' && library_slug === 'demo-library') {
    res.json({
      success: true,
      data: {
        token: 'demo_jwt_token_12345',
        user: {
          id: '1',
          email: 'admin@demo.com',
          first_name: 'Demo',
          last_name: 'Admin',
          role: 'admin',
          library: {
            id: '1',
            name: 'Demo Library',
            slug: 'demo-library'
          }
        }
      },
      message: 'Login successful'
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

app.get('/api/auth/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (token === 'demo_jwt_token_12345') {
    res.json({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'admin@demo.com',
          first_name: 'Demo',
          last_name: 'Admin',
          role: 'admin',
          library: {
            id: '1',
            name: 'Demo Library',
            slug: 'demo-library'
          }
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

// Mock issues endpoints
app.get('/api/issues', (req, res) => {
  const mockIssues = [
    {
      id: '1',
      title: 'Sewing machine needle jammed',
      description: 'Patron returned item reporting the needle mechanism is stuck and won\'t move.',
      item_id: '154465561',
      status: 'Newly Reported',
      priority: 'medium',
      type: 'problem',
      created_by: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      collections: [
        { id: '1', name: 'Equipment & Tools', color: '#3B82F6' }
      ]
    },
    {
      id: '2',
      title: 'Request for 1/4 inch drill bit',
      description: 'Multiple patrons have requested a 1/4 inch bit for the power drill set.',
      item_id: '154465562',
      status: 'Under Assessment',
      priority: 'low',
      type: 'problem',
      created_by: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      collections: [
        { id: '2', name: 'Digital & Tech', color: '#10B981' }
      ]
    },
    {
      id: '3',
      title: '3D Printer - Routine Maintenance',
      description: 'Perform nozzle cleaning and bed levelling check (50-hour interval).',
      item_id: '154465563',
      status: 'In Repair',
      priority: 'medium',
      type: 'problem',
      created_by: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      collections: [
        { id: '2', name: 'Digital & Tech', color: '#10B981' }
      ]
    }
  ];
  
  res.json({
    success: true,
    data: mockIssues,
    pagination: {
      page: 1,
      limit: 100,
      total: mockIssues.length,
      total_pages: 1
    }
  });
});

app.post('/api/issues', (req, res) => {
  const newIssue = {
    id: Date.now().toString(),
    ...req.body,
    created_by: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    collections: []
  };
  
  res.status(201).json({
    success: true,
    data: newIssue,
    message: 'Issue created successfully'
  });
});

app.put('/api/issues/:id', (req, res) => {
  const updatedIssue = {
    id: req.params.id,
    ...req.body,
    updated_at: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: updatedIssue,
    message: 'Issue updated successfully'
  });
});

// Mock collections endpoint
app.get('/api/collections', (req, res) => {
  const mockCollections = [
    { id: '1', name: 'Equipment & Tools', color: '#3B82F6' },
    { id: '2', name: 'Digital & Tech', color: '#10B981' },
    { id: '3', name: 'Musical Instruments', color: '#F59E0B' },
    { id: '4', name: 'In-House Items', color: '#EF4444' },
    { id: '5', name: 'Support Services', color: '#8B5CF6' },
    { id: '6', name: 'Other', color: '#6B7280' }
  ];
  
  res.json({
    success: true,
    data: mockCollections
  });
});

app.listen(PORT, () => {
  console.log(`🚀 FlowTracker Test API server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
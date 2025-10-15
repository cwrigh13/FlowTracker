# ILS Integration Guide

This guide explains how to integrate FlowTracker with various Integrated Library Systems (ILS) and third-party services.

## Overview

FlowTracker supports integration with multiple ILS systems and third-party services to enhance library operations:

- **ILS Integration**: Connect with Koha, Evergreen, Sierra, and custom systems
- **File Storage**: AWS S3, Google Cloud Storage, Azure Blob Storage, and local storage
- **Image Processing**: Sharp, ImageMagick, and Cloudinary
- **PDF Generation**: Puppeteer, wkhtmltopdf, and jsPDF

## ILS Integration

### Supported Systems

1. **Koha** - Open-source ILS with REST API
2. **Evergreen** - Open-source ILS with OpenSRF API
3. **Sierra** - Commercial ILS (adapter framework ready)
4. **Custom** - Extensible framework for custom ILS systems

### Configuration

#### 1. Set up ILS Configuration

```typescript
// POST /api/ils/config
{
  "system_type": "koha",
  "name": "Main Library Koha",
  "base_url": "https://koha.library.com/api",
  "api_key": "your-api-key",
  "settings": {
    "timeout": 30000,
    "retry_attempts": 3
  }
}
```

#### 2. Test Connection

```typescript
// POST /api/ils/test-connection
// Returns: { success: boolean, error?: string }
```

### Features

#### Barcode Validation

```typescript
// POST /api/ils/validate-barcode
{
  "barcode": "1234567890"
}

// Response
{
  "success": true,
  "data": {
    "valid": true,
    "item": {
      "id": "item-123",
      "barcode": "1234567890",
      "title": "The Great Book",
      "author": "Author Name",
      "isbn": "978-1234567890",
      "call_number": "FIC GRE",
      "location": "Main Stacks",
      "status": "Available"
    }
  }
}
```

#### Item Lookup

```typescript
// POST /api/ils/lookup-item
{
  "barcode": "1234567890",
  "isbn": "978-1234567890",
  "title": "The Great Book",
  "author": "Author Name",
  "call_number": "FIC GRE"
}

// Response
{
  "success": true,
  "data": {
    "found": true,
    "item": { /* item details */ },
    "suggestions": [ /* similar items */ ]
  }
}
```

#### Patron Lookup

```typescript
// POST /api/ils/lookup-patron
{
  "barcode": "patron-123",
  "email": "patron@email.com",
  "phone": "555-1234",
  "name": "John Doe"
}

// Response
{
  "success": true,
  "data": {
    "id": "patron-123",
    "barcode": "patron-123",
    "first_name": "John",
    "last_name": "Doe",
    "email": "patron@email.com",
    "status": "active"
  }
}
```

#### Data Synchronization

```typescript
// POST /api/ils/sync
{
  "sync_items": true,
  "sync_patrons": true,
  "force_full_sync": false
}

// Response
{
  "success": true,
  "data": {
    "items_synced": 150,
    "patrons_synced": 25,
    "errors": [],
    "last_sync": "2024-01-15T10:30:00Z"
  }
}
```

## Third-Party Services

### File Storage

#### Configuration

```typescript
// POST /api/third-party/file-storage/config
{
  "provider": "aws_s3",
  "bucket_name": "library-files",
  "region": "us-east-1",
  "access_key": "your-access-key",
  "secret_key": "your-secret-key",
  "settings": {
    "encryption": "AES256",
    "versioning": true
  }
}
```

#### Upload File

```typescript
// POST /api/third-party/file-storage/upload
// Form data with file

// Response
{
  "success": true,
  "data": {
    "fileId": "file-123",
    "url": "https://bucket.s3.amazonaws.com/file-123"
  }
}
```

### Image Processing

#### Configuration

```typescript
// POST /api/third-party/image-processing/config
{
  "provider": "sharp",
  "max_width": 1920,
  "max_height": 1080,
  "quality": 90,
  "formats": ["jpeg", "png", "webp"],
  "settings": {
    "progressive": true,
    "optimize": true
  }
}
```

#### Resize Image

```typescript
// POST /api/third-party/image-processing/resize
{
  "width": 800,
  "height": 600
}

// Response
{
  "success": true,
  "data": {
    "width": 800,
    "height": 600,
    "url": "https://storage.com/resized-image.jpg"
  }
}
```

### PDF Generation

#### Configuration

```typescript
// POST /api/third-party/pdf-generation/config
{
  "provider": "puppeteer",
  "template_path": "./templates",
  "output_format": "pdf",
  "settings": {
    "headless": true,
    "timeout": 30000
  }
}
```

#### Generate PDF

```typescript
// POST /api/third-party/pdf-generation/generate
{
  "html": "<html><body><h1>Report</h1></body></html>",
  "template": "issue-report",
  "data": { "issue": { "id": "123", "title": "Test Issue" } },
  "options": {
    "format": "A4",
    "orientation": "portrait",
    "margin": { "top": "1in", "right": "1in", "bottom": "1in", "left": "1in" }
  }
}

// Response
{
  "success": true,
  "data": {
    "pdfUrl": "https://storage.com/report-123.pdf"
  }
}
```

## Database Schema

### ILS Tables

- `ils_configs` - ILS system configurations
- `ils_items` - Cached item data from ILS
- `ils_patrons` - Cached patron data from ILS
- `ils_integrations` - Integration status and sync history
- `service_configs` - Third-party service configurations

### Key Features

1. **Multi-tenant Support**: Each library can have its own ILS configuration
2. **Caching**: Items and patrons are cached for performance
3. **Error Handling**: Comprehensive error handling and logging
4. **Extensibility**: Easy to add new ILS systems or services
5. **Security**: Encrypted credentials and secure API communication

## Implementation Notes

### Adding New ILS Systems

1. Create a new adapter class extending `BaseILSAdapter`
2. Implement all required methods
3. Register the adapter in `ILSService`
4. Add system type to validation schemas

### Adding New Third-Party Services

1. Create service interface and base class
2. Implement specific service classes
3. Add factory method
4. Register in `ThirdPartyServiceManager`
5. Add API routes

### Error Handling

All services include comprehensive error handling:
- Connection timeouts
- Authentication failures
- Data validation errors
- Service unavailability

### Performance Considerations

- Caching reduces API calls to ILS systems
- Asynchronous operations prevent blocking
- Rate limiting prevents service overload
- Connection pooling for database operations

## Testing

### Unit Tests

```bash
npm test -- --grep "ILS"
npm test -- --grep "ThirdParty"
```

### Integration Tests

```bash
npm run test:integration -- --grep "ILS Integration"
```

### Manual Testing

1. Configure ILS system
2. Test connection
3. Validate barcode
4. Look up items/patrons
5. Sync data
6. Test third-party services

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check URL, credentials, and network
2. **Authentication Error**: Verify API key or username/password
3. **Data Not Found**: Check barcode format and ILS data
4. **Sync Errors**: Review error messages and retry

### Logs

Check application logs for detailed error information:
- ILS API calls
- Third-party service requests
- Database operations
- Error details

## Security

### Best Practices

1. Encrypt sensitive credentials
2. Use HTTPS for all API calls
3. Implement rate limiting
4. Validate all input data
5. Log security events
6. Regular security audits

### Credential Management

- Store credentials encrypted in database
- Use environment variables for sensitive data
- Rotate credentials regularly
- Implement access controls

## Monitoring

### Metrics

- API response times
- Success/failure rates
- Data sync status
- Service availability
- Error rates

### Alerts

- Connection failures
- Sync errors
- High error rates
- Service downtime

## Future Enhancements

1. **Real-time Sync**: WebSocket-based real-time updates
2. **Advanced Analytics**: Usage patterns and performance metrics
3. **Machine Learning**: Predictive analytics for library operations
4. **Mobile Support**: Mobile-optimized interfaces
5. **API Versioning**: Support for multiple API versions
6. **Custom Fields**: Configurable data fields per library
7. **Bulk Operations**: Batch processing for large datasets
8. **Audit Trails**: Comprehensive logging and tracking

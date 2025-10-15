# FlowTracker - Library Items Issues Tracker

A modern Kanban board application to track issues and suggestions for a Library of Things. Built with React, TypeScript, and Tailwind CSS.

## Features

- **Drag & Drop Kanban Board**: Move issues between different status columns
- **Issue Management**: Create, edit, and track issues with detailed information
- **Collection Filtering**: Filter issues by different library collections
- **Responsive Design**: Works on desktop and mobile devices
- **Type Safety**: Built with TypeScript for better code reliability
- **Modern UI**: Clean design with Tailwind CSS
- **Cloud Deployment Ready**: Easy deployment to AWS Lightsail or Elastic Beanstalk

## Getting Started

### Quick Demo

Want to try FlowTracker without setting up a database? We have a demo environment ready to go!

```powershell
# Quick setup and start
.\setup-demo.ps1
.\start-demo.ps1
```

Or run directly from the demo directory:
```powershell
cd demo
.\setup-demo-simple.ps1
.\start-demo-simple.ps1
```

See the [demo directory](./demo/) for more information and full documentation.

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- PostgreSQL (version 12 or higher) - for full installation

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
├── demo/                  # Demo environment (setup, start, docs)
├── backend/               # Backend API server
│   ├── src/              # Backend source code
│   └── database/         # Database schemas
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   ├── config/           # Configuration files
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── services/         # API services
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
├── package.json         # Frontend dependencies
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── setup-demo.ps1       # Demo setup launcher
└── start-demo.ps1       # Demo start launcher
```

## Issue Status Workflow

1. **Newly Reported** - Issues just submitted
2. **Under Assessment** - Issues being evaluated
3. **Awaiting Parts** - Issues waiting for parts/materials
4. **In Repair** - Issues currently being fixed
5. **Resolved/Ready for Circulation** - Issues completed and ready

## Deployment

### AWS Lightsail (Recommended)

Deploy FlowTracker to AWS Lightsail for a simple, cost-effective production deployment.

**Quick Start:**
```powershell
# Configure AWS CLI
aws configure

# Deploy (creates database + containers)
.\deploy-lightsail.ps1
```

**Features:**
- 💰 Starting at $25/month (predictable pricing)
- 🚀 Deploy in 15-20 minutes
- 📊 Managed PostgreSQL database
- 🔒 Free SSL certificates
- ⚖️ Built-in load balancing

**Documentation:**
- [Quick Start Guide](AWS_LIGHTSAIL_QUICK_START.md) - Get started in 15 minutes
- [Complete Guide](AWS_LIGHTSAIL_GUIDE.md) - Detailed documentation
- [README](AWS_LIGHTSAIL_README.md) - Commands and management
- [Comparison](AWS_LIGHTSAIL_VS_BEANSTALK.md) - Lightsail vs Elastic Beanstalk

### AWS Elastic Beanstalk

For enterprise deployments with auto-scaling and advanced AWS integrations.

**Documentation:**
- [Elastic Beanstalk Guide](AWS_ELASTIC_BEANSTALK_GUIDE.md)
- [Quick Start](AWS_QUICK_START.md)

### Docker

Run FlowTracker locally or on any Docker-compatible platform.

```bash
# Start all services
docker-compose up

# Or for production
docker-compose -f docker-compose.prod.yml up
```

See [Docker Quick Start](QUICK_START_DOCKER.md) for more details.

## Management

### Lightsail Management

```powershell
# Check service status
.\manage-lightsail.ps1 -Action status

# View logs
.\manage-lightsail.ps1 -Action logs -Container backend

# View metrics
.\manage-lightsail.ps1 -Action metrics -Hours 24

# Scale service
.\manage-lightsail.ps1 -Action scale -Scale 2

# Create backup
.\manage-lightsail.ps1 -Action backup
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

# Prometheus Blackbox Exporter Frontend

A comprehensive React frontend for monitoring targets using Prometheus Blackbox Exporter in an EKS environment.

## Features

### 🎯 **Targets Page**
- View all monitoring targets in a comprehensive table
- Real-time status indicators (UP/DOWN)
- Uptime percentages and response time metrics
- Click any target to view detailed analytics
- Detailed downtime history with planned/unplanned flags
- Time range filtering for all metrics

### 📁 **Groups Page** (Main Dashboard)
- **Combined Overview**: View domain groups with uptime percentages and response times directly in the list
- **Smart Domain Grouping**: Automatically groups similar domains (ignoring paths and queries)
- **Group Details**: Click any group to see:
  - Combined list and details view with percentages
  - Comprehensive downtime table for all domains in the group
  - Planned/unplanned downtime flags with annotation capabilities
  - Detailed duration calculations (seconds/minutes/hours/days)
  - Time range filtering for downtime analysis
  - Export functionality for group data

### 📊 **Reports Page**
- Generate comprehensive reports for all targets
- Export data in CSV format
- Custom group filtering and analysis

### ⚙️ **Settings Page**
- Configuration management
- Connection testing and diagnostics

## Key Improvements

### Enhanced Group Management
- **Unified View**: Combined list and details view eliminates redundancy
- **Downtime Analytics**: Comprehensive downtime tracking with:
  - Start/end times and durations
  - Planned vs unplanned classification
  - Detailed duration formatting (ss/mm/hh/dd)
  - Time range filtering capabilities
  - Annotation system for downtime events

### Improved Navigation
- **Browser Routing**: Proper URL-based navigation with shareable links
- **React Router Integration**: Clean, bookmarkable URLs for all pages
- **Removed Redundancy**: Eliminated dashboard page as Groups page serves the same purpose

### Enhanced Target Details
- **Reusable Components**: Same downtime table component used across groups and targets
- **Consistent UI**: Unified styling and user experience
- **Detailed Analytics**: Comprehensive metrics and charts for each target

## Technical Features

### Time Range Filtering
- Custom date/time range selection
- Real-time data updates based on selected ranges
- Persistent time range across page navigation

### Export Capabilities
- CSV export for groups and individual targets
- Comprehensive data including uptime, response times, and status

### Responsive Design
- Modern, clean UI with consistent styling
- Mobile-friendly responsive layout
- Intuitive navigation and user experience

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Prometheus URL**:
   Update the `proxy` field in `package.json` to point to your Prometheus instance:
   ```json
   {
     "proxy": "https://your-prometheus-url.com"
   }
   ```

3. **Start Development Server**:
   ```bash
   npm start
   ```

4. **Access the Application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser

## URL Structure

- `/` - Redirects to Groups page
- `/groups` - Main groups overview and management
- `/targets` - All targets table
- `/targets/:targetId` - Individual target details
- `/reports` - Report generation
- `/settings` - Configuration and settings

## Dependencies

- React 18.2.0
- React Router DOM 6.8.1
- Recharts 2.5.0 (for charts)
- Axios 1.3.4 (for API calls)
- Date-fns 2.29.3 (for date handling)
- React Select 5.7.0 (for enhanced selects)

## Architecture

The application uses a component-based architecture with:
- **Pages**: Main route components (Groups, Targets, Reports, Settings)
- **Components**: Reusable UI components (Tables, Charts, Navigation)
- **Services**: API integration with Prometheus
- **Utils**: Helper functions for domain grouping and data formatting

## Monitoring Integration

The frontend integrates with Prometheus Blackbox Exporter to provide:
- Real-time target status monitoring
- Uptime percentage calculations
- Response time analytics
- Downtime period detection and analysis
- Historical data visualization

## Future Enhancements

- Real-time WebSocket updates for live status changes
- Advanced filtering and search capabilities
- Custom alerting and notification system
- Integration with additional monitoring tools
- Enhanced reporting with PDF generation
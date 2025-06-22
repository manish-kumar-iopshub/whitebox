# Prometheus Blackbox Exporter Frontend

A modern, responsive React frontend for monitoring targets using Prometheus Blackbox Exporter. Features a clean, minimal design with comprehensive monitoring capabilities and real-time analytics.

## ✨ Recent Updates

### 🎨 **UI/UX Overhaul**
- **Light Theme**: Migrated from dark Discord theme to clean, minimal light theme
- **Modern Design**: Updated with contemporary design patterns and improved accessibility
- **Responsive Navigation**: Fixed sticky navigation bar with smooth scrolling
- **Enhanced Cards**: Improved shadows, borders, and hover effects
- **Consistent Typography**: Unified color scheme and spacing system

### 🔧 **Technical Improvements**
- **Tailwind CSS v3**: Migrated from unstable v4 to stable v3 for better compatibility
- **PostCSS Configuration**: Fixed build issues and improved CSS processing
- **Component Optimization**: Streamlined component architecture and performance
- **Error Handling**: Enhanced error states and user feedback

## Features

### 🎯 **Targets Page**
- View all monitoring targets in a comprehensive table
- Real-time status indicators (UP/DOWN) with color-coded badges
- Uptime percentages and response time metrics
- Click any target to view detailed analytics
- Detailed downtime history with planned/unplanned flags
- Time range filtering for all metrics
- Clean, card-based layout with hover effects

### 📁 **Groups Page** (Main Dashboard)
- **Combined Overview**: View domain groups with uptime percentages and response times
- **Smart Domain Grouping**: Automatically groups similar domains (ignoring paths and queries)
- **Custom Groups**: Create and manage custom domain groupings
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
- Multiple report templates (Summary, Detailed, CSV Export)

### ⚙️ **Settings Page**
- Configuration management
- Connection testing and diagnostics
- Application information and troubleshooting guides

## Key Improvements

### Enhanced Group Management
- **Unified View**: Combined list and details view eliminates redundancy
- **Custom Group Creation**: Interactive interface for creating custom domain groups
- **Downtime Analytics**: Comprehensive downtime tracking with:
  - Start/end times and durations
  - Planned vs unplanned classification
  - Detailed duration formatting (ss/mm/hh/dd)
  - Time range filtering capabilities
  - Annotation system for downtime events

### Improved Navigation
- **Sticky Navigation**: Fixed navigation bar that stays in place during scrolling
- **Browser Routing**: Proper URL-based navigation with shareable links
- **React Router Integration**: Clean, bookmarkable URLs for all pages
- **Visual Feedback**: Active state indicators and hover effects

### Enhanced Target Details
- **Streamlined Interface**: Removed redundant uptime overview for cleaner design
- **Reusable Components**: Same downtime table component used across groups and targets
- **Consistent UI**: Unified styling and user experience
- **Detailed Analytics**: Comprehensive metrics and charts for each target

## Technical Features

### Time Range Filtering
- Custom date/time range selection with presets (1h, 6h, 24h, 7d, 30d)
- Real-time data updates based on selected ranges
- Persistent time range across page navigation
- Timezone display and management

### Export Capabilities
- CSV export for groups and individual targets
- Comprehensive data including uptime, response times, and status
- PDF report generation (planned)

### Responsive Design
- Modern, clean UI with consistent styling
- Mobile-friendly responsive layout
- Intuitive navigation and user experience
- Accessibility-compliant design

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
- `/groups/:groupName` - Individual group details
- `/targets` - All targets table
- `/targets/:targetId` - Individual target details
- `/reports` - Report generation
- `/settings` - Configuration and settings

## Dependencies

### Core Framework
- **React 18.2.0** - Component-based UI library
- **React Router DOM 6.8.1** - Client-side routing
- **React Scripts 5.0.1** - Development and build tools

### Styling & UI
- **Tailwind CSS 3.4.0** - Utility-first CSS framework
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer 10.4.21** - CSS vendor prefixing
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Data Visualization & Charts
- **Recharts 2.5.0** - Data visualization library
- **React Table 7.8.0** - Data table management

### Utilities
- **Axios 1.3.4** - HTTP client for API calls
- **Date-fns 2.29.3** - Date manipulation utilities
- **React Select 5.7.0** - Enhanced select components
- **Lodash 4.17.21** - Utility functions

## Architecture

The application uses a modern component-based architecture with:

### **Pages** (Route Components)
- `GroupsPage` - Main dashboard with domain grouping
- `TargetsPage` - All targets overview
- `ReportsPage` - Report generation interface
- `SettingsPage` - Configuration management

### **Components** (Reusable UI)
- `Navigation` - Sticky navigation bar
- `DomainGrouping` - Domain grouping and management
- `TimeRangePicker` - Time range selection with presets
- `UptimeChart` - Uptime trend visualization
- `ResponseTimeChart` - Response time analytics
- `DowntimeTable` - Downtime history display
- `TargetDetail` - Individual target analytics

### **Services** (API Integration)
- `prometheusApi.js` - Prometheus API integration
- Connection testing and error handling

### **Utils** (Helper Functions)
- `domainUtils.js` - Domain grouping and data formatting
- Date formatting and time range utilities

## Design System

### Color Palette
- **Primary**: Blue (#3b82f6) for actions and links
- **Text**: Gray scale for hierarchy (#374151, #6b7280, #9ca3af)
- **Background**: White (#ffffff) with light gray accents (#f9fafb)
- **Borders**: Subtle gray borders (#e5e7eb)
- **Status**: Green for success, red for errors, yellow for warnings

### Typography
- **Headings**: Bold, dark gray (#111827)
- **Body Text**: Medium gray (#374151)
- **Muted Text**: Light gray (#6b7280)
- **Font Stack**: System fonts with fallbacks

### Spacing & Layout
- **Consistent Spacing**: 4px base unit system
- **Card Design**: Subtle shadows and rounded corners
- **Responsive Grid**: Flexible layouts for all screen sizes

## Monitoring Integration

The frontend integrates with Prometheus Blackbox Exporter to provide:
- Real-time target status monitoring
- Uptime percentage calculations
- Response time analytics
- Downtime period detection and analysis
- Historical data visualization
- Custom domain grouping

## Performance Optimizations

- **Tailwind Purge**: Automatic unused CSS removal
- **React Optimization**: Proper useEffect dependencies and memoization
- **Lazy Loading**: Code splitting for better initial load times
- **Efficient Rendering**: Optimized component re-renders

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration for live status changes
- **Advanced Filtering**: Multi-criteria target filtering
- **Custom Dashboards**: User-configurable layouts
- **Alert Management**: Notification system integration
- **Mobile App**: React Native companion app

### Technical Improvements
- **TypeScript Migration**: Add type safety
- **State Management**: Consider Redux or Zustand
- **Testing Coverage**: Increase test coverage
- **Performance Monitoring**: Add analytics and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Note**: This application requires a running Prometheus instance with Blackbox Exporter configured. Please ensure your Prometheus setup is properly configured before using this frontend.
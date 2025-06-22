import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import TargetsPage from './pages/TargetsPage';
import GroupsPage from './pages/GroupsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import TargetDetail from './components/TargetDetail';
import GroupDetail from './components/GroupDetail';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { 
  getTargets, 
  getUptimePercentage, 
  getResponseTimeStats,
  getTargetStatus
} from './services/prometheusApi';

// Wrapper component for TargetDetail to handle routing
const TargetDetailWrapper = ({ targetStatuses, timeRange }) => {
  const { targetId } = useParams();
  const navigate = useNavigate();
  const target = decodeURIComponent(targetId);

  const handleBack = () => {
    navigate('/targets');
  };

  return (
    <TargetDetail 
      target={target}
      timeRange={timeRange}
      onBack={handleBack}
    />
  );
};

// Wrapper component for GroupDetail to handle routing
const GroupDetailWrapper = ({ targets, targetStatuses }) => {
  const { groupName } = useParams();
  const navigate = useNavigate();
  const group = decodeURIComponent(groupName);

  const handleBack = () => {
    navigate('/groups');
  };

  // Get targets for this group
  const groupTargets = targets.filter(target => {
    const domain = target.split('://')[1]?.split('/')[0] || target;
    const rootDomain = domain.split('.').slice(-2).join('.');
    return rootDomain === group;
  });

  // Get target statuses for this group
  const groupTargetStatuses = targetStatuses.filter(status => 
    groupTargets.includes(status.target)
  );

  return (
    <GroupDetail 
      groupName={group}
      targets={groupTargets}
      targetStatuses={groupTargetStatuses}
      onBack={handleBack}
    />
  );
};

function App() {
  const [targets, setTargets] = useState([]);
  const [targetStatuses, setTargetStatuses] = useState([]);
  const targetStatusesRef = useRef([]);
  const [timeRange, setTimeRange] = useState(() => {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 2 days instead of 24 hours
    
    // Normalize timestamps to have 00 seconds to eliminate variability
    now.setSeconds(0, 0);
    twoDaysAgo.setSeconds(0, 0);
    
    return {
      start: twoDaysAgo,
      end: now
    };
  });
  const [domainGroups, setDomainGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Update ref when targetStatuses changes
  useEffect(() => {
    targetStatusesRef.current = targetStatuses;
  }, [targetStatuses]);

  // Fetch targets and current status
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const targetsData = await getTargets();
        setTargets(targetsData);
        
        // Fetch status for all targets
        const statusPromises = targetsData.map(async (target) => {
          const status = await getTargetStatus(target);
          return { 
            target, 
            status: status.status,
            lastCheck: status.lastCheck,
            responseTime: status.responseTime,
            success: status.status === 'up'
          };
        });
        
        const statusResults = await Promise.all(statusPromises);
        setTargetStatuses(statusResults);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please check your Prometheus connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch detailed data for targets
  useEffect(() => {
    const fetchTargetDetails = async () => {
      if (targets.length === 0) return;
      
      try {
        const detailedTargets = await Promise.all(
          targets.map(async (target) => {
            try {
              const [uptime, responseTimeStats] = await Promise.all([
                getUptimePercentage(target, timeRange.start, timeRange.end),
                getResponseTimeStats(target, timeRange.start, timeRange.end)
              ]);
              
              const existingStatus = targetStatusesRef.current.find(s => s.target === target);
              
              return {
                target,
                success: existingStatus?.success || false,
                status: existingStatus?.status || 'unknown',
                lastCheck: existingStatus?.lastCheck || Date.now(),
                responseTime: existingStatus?.responseTime || 0,
                uptime,
                avgResponseTime: responseTimeStats?.average || 0
              };
            } catch (err) {
              console.error(`Error fetching data for target ${target}:`, err);
              return {
                target,
                success: false,
                status: 'error',
                uptime: 0,
                avgResponseTime: 0,
                lastCheck: Date.now(),
                responseTime: 0
              };
            }
          })
        );
        
        setTargetStatuses(detailedTargets);
      } catch (err) {
        console.error('Error fetching target details:', err);
      }
    };

    fetchTargetDetails();
  }, [targets, timeRange]);

  const handleTimeRangeChange = (start, end) => {
    setTimeRange({ start, end });
  };

  const handleGroupChange = (groups) => {
    setDomainGroups(groups);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-auto shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-gray-900">
              <span role="img" aria-label="search">🔍</span> Loading...
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-gray-600">
            Connecting to Prometheus
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="p-6 max-w-2xl mx-auto">
          <Card className="mb-6 shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <span role="img" aria-label="error">❗</span> Connection Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-gray-600">{error}</p>
              <p className="mb-2 text-gray-600">Please ensure:</p>
              <ul className="list-disc pl-6 mb-4 text-gray-600">
                <li>Prometheus is running and accessible</li>
                <li>Blackbox Exporter is configured and scraping targets</li>
                <li>The proxy configuration in package.json points to the correct Prometheus URL</li>
              </ul>
              <Button onClick={() => window.location.reload()} variant="default">
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Navigate to="/groups" replace />} />
          <Route path="/targets" element={
            <TargetsPage
              targetStatuses={targetStatuses}
              timeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
              domainGroups={domainGroups}
            />
          } />
          <Route path="/targets/:targetId" element={
            <TargetDetailWrapper
              targetStatuses={targetStatuses}
              timeRange={timeRange}
            />
          } />
          <Route path="/groups" element={
            <GroupsPage
              targets={targets}
              targetStatuses={targetStatuses}
              domainGroups={domainGroups}
              timeRange={timeRange}
              onGroupChange={handleGroupChange}
            />
          } />
          <Route path="/groups/:groupName" element={<GroupDetailWrapper targets={targets} targetStatuses={targetStatuses} />} />
          <Route path="/reports" element={
            <ReportsPage
              targetStatuses={targetStatuses}
              timeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
              customGroups={domainGroups}
            />
          } />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 
import React from 'react';
import TimeRangePicker from '../components/TimeRangePicker';
import ReportGenerator from '../components/ReportGenerator';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';

const ReportsPage = ({ 
  targetStatuses, 
  timeRange, 
  onTimeRangeChange, 
  customGroups 
}) => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <FontAwesomeIcon icon={faFileAlt} className="text-2xl text-purple-600" />
        <h1 className="m-0 text-2xl font-bold text-gray-900">Reports</h1>
      </div>
      <TimeRangePicker 
        onTimeRangeChange={onTimeRangeChange}
        initialStart={timeRange.start}
        initialEnd={timeRange.end}
      />
      <Card className="mb-6 shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Report Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportGenerator 
            targets={targetStatuses}
            timeRange={timeRange}
            customGroups={Object.entries(customGroups).map(([name, domains]) => ({ name, domains }))}
          />
        </CardContent>
      </Card>
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
              <h4 className="mb-2 text-blue-600 text-base font-semibold flex items-center gap-2">📊 Summary Report</h4>
              <p className="mb-2 text-gray-600 text-sm">Overview of all targets with status and uptime percentages</p>
              <ul className="list-disc pl-5 text-gray-600 text-sm mb-0">
                <li>Overall uptime statistics</li>
                <li>Target status summary</li>
                <li>Group overview</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
              <h4 className="mb-2 text-blue-600 text-base font-semibold flex items-center gap-2">📋 Detailed Report</h4>
              <p className="mb-2 text-gray-600 text-sm">Comprehensive information including response times and metrics</p>
              <ul className="list-disc pl-5 text-gray-600 text-sm mb-0">
                <li>Individual target details</li>
                <li>Response time analysis</li>
                <li>Downtime history</li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm">
              <h4 className="mb-2 text-blue-600 text-base font-semibold flex items-center gap-2">📈 CSV Export</h4>
              <p className="mb-2 text-gray-600 text-sm">Raw data in spreadsheet format for further analysis</p>
              <ul className="list-disc pl-5 text-gray-600 text-sm mb-0">
                <li>Machine-readable format</li>
                <li>Excel/Google Sheets compatible</li>
                <li>Custom analysis ready</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage; 
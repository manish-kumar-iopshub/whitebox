import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const ReportGenerator = ({ targets, timeRange, customGroups }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState('summary');

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      // Title
      doc.setFontSize(20);
      doc.text('Blackbox Exporter Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Date range
      doc.setFontSize(12);
      doc.text(`Report Period: ${timeRange.start.toLocaleDateString()} - ${timeRange.end.toLocaleDateString()}`, 20, yPosition);
      yPosition += 15;

      // Generated date
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
      yPosition += 20;

      if (reportType === 'summary') {
        // Summary section
        doc.setFontSize(16);
        doc.text('Summary', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(12);
        doc.text(`Total Targets: ${targets.length}`, 20, yPosition);
        yPosition += 10;

        const upTargets = targets.filter(t => t.success).length;
        const downTargets = targets.length - upTargets;
        
        doc.text(`Targets Up: ${upTargets}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Targets Down: ${downTargets}`, 20, yPosition);
        yPosition += 15;

        // Target list
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.text('Target Status', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        targets.forEach(target => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          
          const status = target.success ? 'UP' : 'DOWN';
          const uptime = target.uptime ? `${target.uptime.toFixed(2)}%` : 'N/A';
          
          doc.text(`${target.target} - ${status} (${uptime})`, 20, yPosition);
          yPosition += 8;
        });

      } else if (reportType === 'detailed') {
        // Detailed section
        doc.setFontSize(16);
        doc.text('Detailed Target Information', 20, yPosition);
        yPosition += 15;

        targets.forEach((target, index) => {
          if (yPosition > pageHeight - 80) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(12);
          doc.text(`Target ${index + 1}: ${target.target}`, 20, yPosition);
          yPosition += 10;

          doc.setFontSize(10);
          doc.text(`Status: ${target.success ? 'UP' : 'DOWN'}`, 30, yPosition);
          yPosition += 8;
          
          if (target.uptime) {
            doc.text(`Uptime: ${target.uptime.toFixed(2)}%`, 30, yPosition);
            yPosition += 8;
          }
          
          if (target.avgResponseTime) {
            doc.text(`Avg Response Time: ${(target.avgResponseTime * 1000).toFixed(2)} ms`, 30, yPosition);
            yPosition += 8;
          }
          
          yPosition += 5;
        });
      }

      // Custom groups section
      if (customGroups && customGroups.length > 0) {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.text('Custom Groups', 20, yPosition);
        yPosition += 15;

        doc.setFontSize(10);
        customGroups.forEach(group => {
          if (yPosition > pageHeight - 30) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.text(`Group: ${group.name}`, 20, yPosition);
          yPosition += 8;
          doc.text(`Domains: ${group.domains.join(', ')}`, 30, yPosition);
          yPosition += 10;
        });
      }

      // Save the PDF
      doc.save(`blackbox-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCSV = () => {
    const headers = ['Target', 'Status', 'Uptime %', 'Avg Response Time (ms)', 'Last Check'];
    const csvData = targets.map(target => [
      target.target,
      target.success ? 'UP' : 'DOWN',
      target.uptime ? target.uptime.toFixed(2) : 'N/A',
      target.avgResponseTime ? (target.avgResponseTime * 1000).toFixed(2) : 'N/A',
      target.lastCheck ? new Date(target.lastCheck).toLocaleString() : 'N/A'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blackbox-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6 flex-wrap">
          <div>
            <label className="block mb-1 text-sm font-medium">Report Type</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary Report</SelectItem>
                <SelectItem value="detailed">Detailed Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={generatePDF}
            disabled={isGenerating}
            variant="default"
          >
            {isGenerating ? 'Generating PDF...' : 'Generate PDF Report'}
          </Button>
          
          <Button
            onClick={generateCSV}
            variant="outline"
          >
            Export CSV
          </Button>
        </div>

        <div className="mt-4 text-sm text-muted-foreground space-y-1">
          <p><strong>Summary Report:</strong> Overview of all targets with status and uptime percentages</p>
          <p><strong>Detailed Report:</strong> Comprehensive information including response times and metrics</p>
          <p><strong>CSV Export:</strong> Raw data in spreadsheet format for further analysis</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportGenerator; 
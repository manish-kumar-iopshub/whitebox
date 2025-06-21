import React, { useState } from 'react';
import jsPDF from 'jspdf';

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
    <div className="card">
      <h3>Report Generator</h3>
      
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="form-group">
          <label className="form-label">Report Type</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            className="form-control"
            style={{ width: 'auto' }}
          >
            <option value="summary">Summary Report</option>
            <option value="detailed">Detailed Report</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary"
          onClick={generatePDF}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating PDF...' : 'Generate PDF Report'}
        </button>
        
        <button
          className="btn btn-secondary"
          onClick={generateCSV}
        >
          Export CSV
        </button>
      </div>

      <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
        <p><strong>Summary Report:</strong> Overview of all targets with status and uptime percentages</p>
        <p><strong>Detailed Report:</strong> Comprehensive information including response times and metrics</p>
        <p><strong>CSV Export:</strong> Raw data in spreadsheet format for further analysis</p>
      </div>
    </div>
  );
};

export default ReportGenerator; 
// Utility functions for exporting reports

interface ExportData {
  userMetrics: any;
  securityMetrics: any;
  roleMetrics: any;
  permissionMetrics: any;
  complianceMetrics: any;
  timeSeriesData: any[];
}

// Export data to CSV format
export const exportToCSV = (data: ExportData, filename: string = 'iam-report') => {
  try {
    // Create CSV content for different sections
    const csvSections: string[] = [];

    // User Metrics Section
    csvSections.push('USER METRICS');
    csvSections.push('Metric,Value');
    csvSections.push(`Total Users,${data.userMetrics.totalUsers}`);
    csvSections.push(`Active Users,${data.userMetrics.activeUsers}`);
    csvSections.push(`Inactive Users,${data.userMetrics.inactiveUsers}`);
    csvSections.push(`New Users This Month,${data.userMetrics.newUsersThisMonth}`);
    csvSections.push(`User Growth Rate,${data.userMetrics.userGrowthRate}%`);
    csvSections.push('');

    // Users by Role
    csvSections.push('USERS BY ROLE');
    csvSections.push('Role,Count');
    data.userMetrics.usersByRole.forEach((role: any) => {
      csvSections.push(`${role.role},${role.count}`);
    });
    csvSections.push('');

    // Security Metrics
    csvSections.push('SECURITY METRICS');
    csvSections.push('Metric,Value');
    csvSections.push(`Total Logins,${data.securityMetrics.totalLogins}`);
    csvSections.push(`Failed Logins,${data.securityMetrics.failedLogins}`);
    csvSections.push(`Success Rate,${data.securityMetrics.successRate}%`);
    csvSections.push(`MFA Adoption,${data.securityMetrics.mfaAdoption}%`);
    csvSections.push(`Password Compliance,${data.securityMetrics.passwordCompliance}%`);
    csvSections.push(`Risk Score,${data.securityMetrics.riskScore}`);
    csvSections.push('');

    // Security Vulnerabilities
    csvSections.push('SECURITY VULNERABILITIES');
    csvSections.push('Type,Severity,Count');
    data.securityMetrics.vulnerabilities.forEach((vuln: any) => {
      csvSections.push(`${vuln.type},${vuln.severity},${vuln.count}`);
    });
    csvSections.push('');

    // Role Metrics
    csvSections.push('ROLE METRICS');
    csvSections.push('Metric,Value');
    csvSections.push(`Total Roles,${data.roleMetrics.totalRoles}`);
    csvSections.push(`System Roles,${data.roleMetrics.systemRoles}`);
    csvSections.push(`Custom Roles,${data.roleMetrics.customRoles}`);
    csvSections.push(`Role Conflicts,${data.roleMetrics.roleConflicts}`);
    csvSections.push('');

    // Role Utilization
    csvSections.push('ROLE UTILIZATION');
    csvSections.push('Role,User Count,Utilization %');
    data.roleMetrics.roleUtilization.forEach((role: any) => {
      csvSections.push(`${role.role},${role.userCount},${role.utilization}`);
    });
    csvSections.push('');

    // Permission Metrics
    csvSections.push('PERMISSION METRICS');
    csvSections.push('Metric,Value');
    csvSections.push(`Total Permissions,${data.permissionMetrics.totalPermissions}`);
    csvSections.push(`Active Permissions,${data.permissionMetrics.activePermissions}`);
    csvSections.push(`Unused Permissions,${data.permissionMetrics.unusedPermissions}`);
    csvSections.push('');

    // Permissions by Category
    csvSections.push('PERMISSIONS BY CATEGORY');
    csvSections.push('Category,Count,Risk Level');
    data.permissionMetrics.permissionsByCategory.forEach((cat: any) => {
      csvSections.push(`${cat.category},${cat.count},${cat.risk}`);
    });
    csvSections.push('');

    // Compliance Metrics
    csvSections.push('COMPLIANCE METRICS');
    csvSections.push('Metric,Score %');
    csvSections.push(`Overall Score,${data.complianceMetrics.overallScore}`);
    csvSections.push(`GDPR Compliance,${data.complianceMetrics.gdprCompliance}`);
    csvSections.push(`Access Reviews,${data.complianceMetrics.accessReviews}`);
    csvSections.push(`Audit Trail,${data.complianceMetrics.auditTrail}`);
    csvSections.push(`Data Retention,${data.complianceMetrics.dataRetention}`);
    csvSections.push('');

    // Time Series Data (last 7 days)
    csvSections.push('TIME SERIES DATA (Last 7 Days)');
    csvSections.push('Date,Users,Logins,Roles,Permissions,Security Events');
    data.timeSeriesData.slice(-7).forEach((day: any) => {
      csvSections.push(`${day.date},${day.users},${day.logins},${day.roles},${day.permissions},${day.securityEvents}`);
    });

    // Join all sections
    const csvContent = csvSections.join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return false;
  }
};

// Export data to PDF format (simplified version using browser print)
export const exportToPDF = (data: ExportData, filename: string = 'iam-report') => {
  try {
    // Create a new window with formatted content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export PDF');
      return false;
    }

    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>IAM Comprehensive Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #3b82f6;
              margin: 0;
            }
            .header p {
              margin: 5px 0;
              color: #666;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .section h2 {
              color: #3b82f6;
              border-bottom: 1px solid #e5e5e5;
              padding-bottom: 10px;
            }
            .metrics-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin: 15px 0;
            }
            .metric-card {
              border: 1px solid #e5e5e5;
              padding: 15px;
              border-radius: 8px;
              background: #f9f9f9;
            }
            .metric-card h3 {
              margin: 0 0 10px 0;
              color: #3b82f6;
              font-size: 14px;
            }
            .metric-card .value {
              font-size: 24px;
              font-weight: bold;
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            th, td {
              border: 1px solid #e5e5e5;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f3f4f6;
              font-weight: bold;
              color: #374151;
            }
            .risk-critical { background-color: #fee2e2; }
            .risk-high { background-color: #fef3c7; }
            .risk-medium { background-color: #fef3c7; }
            .risk-low { background-color: #dcfce7; }
            .footer {
              margin-top: 50px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #e5e5e5;
              padding-top: 20px;
            }
            @media print {
              body { margin: 0; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>IAM Comprehensive Report</h1>
            <p>Identity and Access Management System Analysis</p>
            <p>Generated on: ${currentDate} at ${currentTime}</p>
          </div>

          <div class="section">
            <h2>Executive Summary</h2>
            <div class="metrics-grid">
              <div class="metric-card">
                <h3>Total Users</h3>
                <div class="value">${data.userMetrics.totalUsers}</div>
              </div>
              <div class="metric-card">
                <h3>Active Users</h3>
                <div class="value">${data.userMetrics.activeUsers}</div>
              </div>
              <div class="metric-card">
                <h3>Security Score</h3>
                <div class="value">${100 - data.securityMetrics.riskScore}</div>
              </div>
              <div class="metric-card">
                <h3>Compliance Score</h3>
                <div class="value">${data.complianceMetrics.overallScore}%</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>User Analytics</h2>
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>User Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${data.userMetrics.usersByRole.map((role: any) => `
                  <tr>
                    <td>${role.role}</td>
                    <td>${role.count}</td>
                    <td>${((role.count / data.userMetrics.totalUsers) * 100).toFixed(1)}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Security Analysis</h2>
            <div class="metrics-grid">
              <div class="metric-card">
                <h3>Login Success Rate</h3>
                <div class="value">${data.securityMetrics.successRate}%</div>
              </div>
              <div class="metric-card">
                <h3>MFA Adoption</h3>
                <div class="value">${data.securityMetrics.mfaAdoption}%</div>
              </div>
              <div class="metric-card">
                <h3>Password Compliance</h3>
                <div class="value">${data.securityMetrics.passwordCompliance}%</div>
              </div>
              <div class="metric-card">
                <h3>Risk Score</h3>
                <div class="value">${data.securityMetrics.riskScore}</div>
              </div>
            </div>
            
            <h3>Security Vulnerabilities</h3>
            <table>
              <thead>
                <tr>
                  <th>Vulnerability Type</th>
                  <th>Severity</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                ${data.securityMetrics.vulnerabilities.map((vuln: any) => `
                  <tr class="risk-${vuln.severity}">
                    <td>${vuln.type}</td>
                    <td>${vuln.severity.toUpperCase()}</td>
                    <td>${vuln.count}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Role Management</h2>
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>User Count</th>
                  <th>Utilization</th>
                  <th>Permissions</th>
                  <th>Complexity</th>
                </tr>
              </thead>
              <tbody>
                ${data.roleMetrics.roleUtilization.map((role: any, index: number) => {
                  const complexity = data.roleMetrics.roleComplexity.find((r: any) => r.role === role.role);
                  return `
                    <tr>
                      <td>${role.role}</td>
                      <td>${role.userCount}</td>
                      <td>${role.utilization}%</td>
                      <td>${complexity?.permissions || 'N/A'}</td>
                      <td class="risk-${complexity?.complexity === 'high' ? 'high' : complexity?.complexity === 'medium' ? 'medium' : 'low'}">${complexity?.complexity?.toUpperCase() || 'N/A'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Permission Analysis</h2>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Permission Count</th>
                  <th>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                ${data.permissionMetrics.permissionsByCategory.map((cat: any) => `
                  <tr class="risk-${cat.risk}">
                    <td>${cat.category}</td>
                    <td>${cat.count}</td>
                    <td>${cat.risk.toUpperCase()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Compliance Status</h2>
            <div class="metrics-grid">
              <div class="metric-card">
                <h3>Overall Compliance</h3>
                <div class="value">${data.complianceMetrics.overallScore}%</div>
              </div>
              <div class="metric-card">
                <h3>GDPR Compliance</h3>
                <div class="value">${data.complianceMetrics.gdprCompliance}%</div>
              </div>
              <div class="metric-card">
                <h3>Access Reviews</h3>
                <div class="value">${data.complianceMetrics.accessReviews}%</div>
              </div>
              <div class="metric-card">
                <h3>Audit Trail</h3>
                <div class="value">${data.complianceMetrics.auditTrail}%</div>
              </div>
            </div>

            <h3>Compliance Issues</h3>
            <table>
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Severity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.complianceMetrics.complianceIssues.map((issue: any) => `
                  <tr class="risk-${issue.severity}">
                    <td>${issue.issue}</td>
                    <td>${issue.severity.toUpperCase()}</td>
                    <td>${issue.status.replace('_', ' ').toUpperCase()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>This report was generated automatically by the IAM Management System.</p>
            <p>For questions or concerns, please contact your system administrator.</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };

    return true;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return false;
  }
};

// Utility function to format large numbers
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Utility function to get risk color
export const getRiskColor = (risk: string): string => {
  switch (risk.toLowerCase()) {
    case 'critical':
      return '#ef4444';
    case 'high':
      return '#f97316';
    case 'medium':
      return '#eab308';
    case 'low':
      return '#22c55e';
    default:
      return '#6b7280';
  }
};

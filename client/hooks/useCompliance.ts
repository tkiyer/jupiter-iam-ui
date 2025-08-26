import { useState, useEffect } from "react";

export interface ComplianceReport {
  id: string;
  name: string;
  type: 'SOX' | 'PCI-DSS' | 'GDPR' | 'HIPAA' | 'SOC2';
  status: 'compliant' | 'non_compliant' | 'warning';
  score: number;
  lastRun: string;
  findings: number;
  criticalFindings: number;
}

export interface UseComplianceReturn {
  complianceReports: ComplianceReport[];
  isLoading: boolean;
  error: string | null;
  runComplianceCheck: (reportId: string) => Promise<void>;
  refreshReports: () => Promise<void>;
}

export const useCompliance = (): UseComplianceReturn => {
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplianceReports = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock compliance reports
      const mockCompliance: ComplianceReport[] = [
        {
          id: 'comp1',
          name: 'SOX Compliance Check',
          type: 'SOX',
          status: 'compliant',
          score: 95,
          lastRun: new Date(Date.now() - 86400000).toISOString(),
          findings: 2,
          criticalFindings: 0
        },
        {
          id: 'comp2',
          name: 'GDPR Privacy Assessment',
          type: 'GDPR',
          status: 'warning',
          score: 78,
          lastRun: new Date(Date.now() - 172800000).toISOString(),
          findings: 8,
          criticalFindings: 2
        },
        {
          id: 'comp3',
          name: 'PCI-DSS Security Validation',
          type: 'PCI-DSS',
          status: 'non_compliant',
          score: 65,
          lastRun: new Date(Date.now() - 259200000).toISOString(),
          findings: 15,
          criticalFindings: 5
        }
      ];

      setComplianceReports(mockCompliance);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching compliance reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const runComplianceCheck = async (reportId: string) => {
    try {
      // Mock API call to run compliance check
      console.log(`Running compliance check for report: ${reportId}`);
      // Update the last run time
      setComplianceReports(prev => 
        prev.map(report => 
          report.id === reportId 
            ? { ...report, lastRun: new Date().toISOString() }
            : report
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run compliance check");
      throw err;
    }
  };

  const refreshReports = () => fetchComplianceReports();

  useEffect(() => {
    fetchComplianceReports();
  }, []);

  return {
    complianceReports,
    isLoading,
    error,
    runComplianceCheck,
    refreshReports,
  };
};

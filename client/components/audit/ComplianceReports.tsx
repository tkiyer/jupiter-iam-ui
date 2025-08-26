import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ComplianceReport } from "@/hooks/useCompliance";
import { getComplianceColor } from "@/lib/statusUtils";

interface ComplianceReportsProps {
  complianceReports: ComplianceReport[];
}

export const ComplianceReports: React.FC<ComplianceReportsProps> = ({ complianceReports }) => {
  return (
    <div className="grid gap-4">
      {complianceReports.map((report) => (
        <Card key={report.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{report.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{report.type}</Badge>
                  <Badge className={getComplianceColor(report.status)}>
                    {report.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{report.score}%</div>
                <div className="text-sm text-muted-foreground">
                  Last run: {format(new Date(report.lastRun), 'MMM dd, yyyy')}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Compliance Score</span>
                <span>{report.score}%</span>
              </div>
              <Progress value={report.score} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-blue-600">{report.findings}</div>
                <div className="text-sm text-muted-foreground">Total Findings</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-red-600">{report.criticalFindings}</div>
                <div className="text-sm text-muted-foreground">Critical Issues</div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline">
                View Report
              </Button>
              <Button size="sm" variant="outline">
                Run Check
              </Button>
              <Button size="sm" variant="outline">
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

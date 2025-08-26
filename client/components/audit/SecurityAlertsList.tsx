import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertTriangle, MoreHorizontal, User, Clock, Shield } from "lucide-react";
import { format } from "date-fns";
import { SecurityAlert } from "@/hooks/useSecurityAlerts";
import { getSeverityColor } from "@/lib/statusUtils";

interface SecurityAlertsListProps {
  securityAlerts: SecurityAlert[];
}

export const SecurityAlertsList: React.FC<SecurityAlertsListProps> = ({ securityAlerts }) => {
  return (
    <div className="grid gap-4">
      {securityAlerts.map((alert) => (
        <Card key={alert.id} className="border-l-4" style={{ borderLeftColor: getSeverityColor(alert.severity).replace('bg-', '#') }}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">{alert.type.replace('_', ' ').toUpperCase()}</Badge>
                  <Badge variant={alert.status === 'open' ? 'destructive' : alert.status === 'resolved' ? 'default' : 'secondary'}>
                    {alert.status.toUpperCase()}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg">{alert.title}</h3>
                <p className="text-muted-foreground">{alert.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {alert.userName || 'System'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm')}
                  </span>
                  {alert.assignedTo && (
                    <span className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Assigned to {alert.assignedTo}
                    </span>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Investigate</DropdownMenuItem>
                  <DropdownMenuItem>Mark as False Positive</DropdownMenuItem>
                  <DropdownMenuItem>Assign to Team</DropdownMenuItem>
                  <DropdownMenuItem>Create Incident</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Shield, 
  Clock, 
  Database, 
  Network,
  HardDrive,
  Cpu,
  Memory,
  AlertTriangle
} from "lucide-react";

const SystemParameters: React.FC = () => {
  const [sessionTimeout, setSessionTimeout] = React.useState([30]);
  const [maxLoginAttempts, setMaxLoginAttempts] = React.useState([5]);
  const [passwordComplexity, setPasswordComplexity] = React.useState([3]);
  const [auditRetention, setAuditRetention] = React.useState([90]);

  return (
    <div className="space-y-6">
      {/* Security Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Parameters</span>
          </CardTitle>
          <CardDescription>
            Configure security-related system parameters and policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Session Timeout: {sessionTimeout[0]} minutes</Label>
            <Slider
              value={sessionTimeout}
              onValueChange={setSessionTimeout}
              min={5}
              max={480}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5 min</span>
              <span>2 hours</span>
              <span>8 hours</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Maximum Login Attempts: {maxLoginAttempts[0]} attempts</Label>
            <Slider
              value={maxLoginAttempts}
              onValueChange={setMaxLoginAttempts}
              min={3}
              max={20}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>3 attempts</span>
              <span>10 attempts</span>
              <span>20 attempts</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Password Complexity Level: {passwordComplexity[0]}</Label>
            <Slider
              value={passwordComplexity}
              onValueChange={setPasswordComplexity}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Basic</span>
              <span>Medium</span>
              <span>Strong</span>
              <span>Very Strong</span>
              <span>Maximum</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lockoutDuration">Account Lockout Duration</Label>
              <Select defaultValue="15">
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="1440">24 hours</SelectItem>
                  <SelectItem value="manual">Manual unlock only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordExpiry">Password Expiry</Label>
              <Select defaultValue="90">
                <SelectTrigger>
                  <SelectValue placeholder="Select expiry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="never">Never expires</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication Required</Label>
              <p className="text-sm text-gray-500">Require 2FA for all user accounts</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>IP Whitelisting</Label>
              <p className="text-sm text-gray-500">Restrict access to specific IP addresses</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Session Management</span>
          </CardTitle>
          <CardDescription>
            Configure session behavior and management parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Concurrent Session Limit</Label>
              <p className="text-sm text-gray-500">Maximum concurrent sessions per user</p>
            </div>
            <div className="w-24">
              <Input type="number" defaultValue="3" min="1" max="10" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Session Refresh on Activity</Label>
              <p className="text-sm text-gray-500">Automatically refresh sessions on user activity</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Remember Me Option</Label>
              <p className="text-sm text-gray-500">Allow users to stay logged in longer</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rememberDuration">Remember Me Duration</Label>
            <Select defaultValue="7">
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Database Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Database Parameters</span>
          </CardTitle>
          <CardDescription>
            Configure database connection and performance parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="connectionPool">Connection Pool Size</Label>
              <Input
                id="connectionPool"
                type="number"
                defaultValue="20"
                min="5"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="queryTimeout">Query Timeout (seconds)</Label>
              <Input
                id="queryTimeout"
                type="number"
                defaultValue="30"
                min="5"
                max="300"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Audit Log Retention: {auditRetention[0]} days</Label>
            <Slider
              value={auditRetention}
              onValueChange={setAuditRetention}
              min={30}
              max={365}
              step={30}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>30 days</span>
              <span>6 months</span>
              <span>1 year</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Database Encryption at Rest</Label>
              <p className="text-sm text-gray-500">Encrypt stored data in the database</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Backup</Label>
              <p className="text-sm text-gray-500">Automatically backup database daily</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="backupRetention">Backup Retention Period</Label>
            <Select defaultValue="30">
              <SelectTrigger>
                <SelectValue placeholder="Select retention" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Performance Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cpu className="h-5 w-5" />
            <span>Performance Parameters</span>
          </CardTitle>
          <CardDescription>
            Configure system performance and resource limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxMemory">Max Memory Usage (GB)</Label>
              <Input
                id="maxMemory"
                type="number"
                defaultValue="8"
                min="1"
                max="64"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxCpu">Max CPU Usage (%)</Label>
              <Input
                id="maxCpu"
                type="number"
                defaultValue="80"
                min="10"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxDisk">Max Disk Usage (%)</Label>
              <Input
                id="maxDisk"
                type="number"
                defaultValue="85"
                min="50"
                max="95"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cacheSize">Cache Size (MB)</Label>
            <Input
              id="cacheSize"
              type="number"
              defaultValue="512"
              min="128"
              max="4096"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Performance Monitoring</Label>
              <p className="text-sm text-gray-500">Monitor system performance metrics</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Scaling</Label>
              <p className="text-sm text-gray-500">Automatically scale resources based on load</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Network Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Network className="h-5 w-5" />
            <span>Network Parameters</span>
          </CardTitle>
          <CardDescription>
            Configure network and connectivity parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requestTimeout">Request Timeout (seconds)</Label>
              <Input
                id="requestTimeout"
                type="number"
                defaultValue="30"
                min="5"
                max="300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxRequestSize">Max Request Size (MB)</Label>
              <Input
                id="maxRequestSize"
                type="number"
                defaultValue="10"
                min="1"
                max="100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowedOrigins">Allowed Origins (CORS)</Label>
            <Textarea
              id="allowedOrigins"
              placeholder="https://app1.company.com&#10;https://app2.company.com"
              className="min-h-[80px]"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Rate Limiting</Label>
              <p className="text-sm text-gray-500">Enable API rate limiting</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rateLimit">Requests per Minute</Label>
            <Input
              id="rateLimit"
              type="number"
              defaultValue="1000"
              min="100"
              max="10000"
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Advanced Parameters</span>
          </CardTitle>
          <CardDescription>
            Advanced system configuration - modify with caution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Warning</h4>
                <p className="text-sm text-yellow-700">
                  Modifying these parameters can affect system stability. Please ensure you understand the impact before making changes.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logLevel">System Log Level</Label>
            <Select defaultValue="info">
              <SelectTrigger>
                <SelectValue placeholder="Select log level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="error">Error only</SelectItem>
                <SelectItem value="warn">Warning and above</SelectItem>
                <SelectItem value="info">Info and above</SelectItem>
                <SelectItem value="debug">Debug (verbose)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customConfig">Custom Configuration (JSON)</Label>
            <Textarea
              id="customConfig"
              placeholder="Enter custom configuration as JSON..."
              className="min-h-[100px] font-mono text-sm"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">Validate Configuration</Button>
            <Button variant="outline" size="sm">Load Defaults</Button>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Apply Configuration</Button>
      </div>
    </div>
  );
};

export default SystemParameters;

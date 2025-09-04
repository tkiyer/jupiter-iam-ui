import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, Smartphone, Shield, AlertTriangle, Users, Activity } from "lucide-react";

const Notifications: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* General Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>General Notifications</span>
          </CardTitle>
          <CardDescription>
            Configure general notification preferences and delivery methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Notifications</Label>
              <p className="text-sm text-gray-500">Receive notifications for important events</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-3">
            <Label>Default Notification Method</Label>
            <Select defaultValue="email">
              <SelectTrigger>
                <SelectValue placeholder="Select notification method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="push">Push Notification</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="notificationEmail">Notification Email</Label>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <Input
                id="notificationEmail"
                type="email"
                placeholder="Enter notification email"
                defaultValue="admin@example.com"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="phoneNumber">Phone Number (SMS)</Label>
            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4 text-gray-400" />
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter phone number"
                defaultValue="+1 (555) 123-4567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Notifications</span>
          </CardTitle>
          <CardDescription>
            Configure notifications for security-related events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Failed Login Attempts</Label>
              <p className="text-sm text-gray-500">Notify when multiple login failures occur</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Permission Changes</Label>
              <p className="text-sm text-gray-500">Notify when user permissions are modified</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Policy Violations</Label>
              <p className="text-sm text-gray-500">Notify when access policies are violated</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Suspicious Activity</Label>
              <p className="text-sm text-gray-500">Notify about unusual access patterns</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>System Vulnerabilities</Label>
              <p className="text-sm text-gray-500">Notify about security vulnerabilities</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* System Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>System Notifications</span>
          </CardTitle>
          <CardDescription>
            Configure notifications for system events and maintenance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>System Maintenance</Label>
              <p className="text-sm text-gray-500">Notify about scheduled maintenance windows</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>System Updates</Label>
              <p className="text-sm text-gray-500">Notify about system updates and patches</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Performance Alerts</Label>
              <p className="text-sm text-gray-500">Notify about performance issues</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Backup Status</Label>
              <p className="text-sm text-gray-500">Notify about backup success/failure</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* User Management Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>User Management Notifications</span>
          </CardTitle>
          <CardDescription>
            Configure notifications for user-related events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New User Registration</Label>
              <p className="text-sm text-gray-500">Notify when new users register</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Role Assignments</Label>
              <p className="text-sm text-gray-500">Notify when user roles are assigned/removed</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Account Deactivation</Label>
              <p className="text-sm text-gray-500">Notify when user accounts are deactivated</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Access Requests</Label>
              <p className="text-sm text-gray-500">Notify about pending access requests</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Advanced Settings</span>
          </CardTitle>
          <CardDescription>
            Advanced notification configuration and custom rules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Quiet Hours</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quietStart">Start Time</Label>
                <Input id="quietStart" type="time" defaultValue="22:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quietEnd">End Time</Label>
                <Input id="quietEnd" type="time" defaultValue="08:00" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Webhook URL (Optional)</Label>
            <Input placeholder="https://your-webhook-endpoint.com/notifications" />
          </div>

          <div className="space-y-3">
            <Label htmlFor="customRules">Custom Notification Rules</Label>
            <Textarea
              id="customRules"
              placeholder="Define custom notification rules using JSON format..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Active Notification Channels</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Email</Badge>
              <Badge variant="secondary">SMS</Badge>
              <Badge variant="outline">Slack</Badge>
              <Badge variant="outline">Teams</Badge>
              <Badge variant="outline">Webhook</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline">Test Notifications</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
};

export default Notifications;

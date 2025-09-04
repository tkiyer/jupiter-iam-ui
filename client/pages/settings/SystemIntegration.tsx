import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plug, 
  Database, 
  Cloud, 
  Shield, 
  Key, 
  Webhook,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

const SystemIntegration: React.FC = () => {
  const integrations = [
    {
      name: "Active Directory",
      type: "LDAP",
      status: "connected",
      lastSync: "2 minutes ago",
      description: "Corporate directory integration"
    },
    {
      name: "Slack",
      type: "Webhook",
      status: "connected",
      lastSync: "5 minutes ago",
      description: "Notification delivery"
    },
    {
      name: "AWS IAM",
      type: "Cloud Provider",
      status: "pending",
      lastSync: "Never",
      description: "Cloud resource management"
    },
    {
      name: "Okta",
      type: "SSO",
      status: "disconnected",
      lastSync: "2 hours ago",
      description: "Single sign-on provider"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "disconnected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "disconnected":
        return <Badge variant="destructive">Disconnected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plug className="h-5 w-5" />
            <span>Active Integrations</span>
          </CardTitle>
          <CardDescription>
            Manage your current system integrations and connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(integration.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{integration.name}</h4>
                      {getStatusBadge(integration.status)}
                    </div>
                    <p className="text-sm text-gray-500">{integration.description}</p>
                    <p className="text-xs text-gray-400">
                      Type: {integration.type} • Last sync: {integration.lastSync}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* LDAP/Active Directory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>LDAP/Active Directory</span>
          </CardTitle>
          <CardDescription>
            Configure LDAP or Active Directory integration for user authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable LDAP Integration</Label>
              <p className="text-sm text-gray-500">Connect to your LDAP server for user management</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ldapServer">LDAP Server URL</Label>
              <Input
                id="ldapServer"
                placeholder="ldap://your-server.com:389"
                defaultValue="ldap://ad.company.com:389"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ldapPort">Port</Label>
              <Input
                id="ldapPort"
                placeholder="389"
                defaultValue="389"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bindDN">Bind DN</Label>
            <Input
              id="bindDN"
              placeholder="CN=admin,DC=company,DC=com"
              defaultValue="CN=service-account,OU=Service Accounts,DC=company,DC=com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseDN">Base DN</Label>
            <Input
              id="baseDN"
              placeholder="DC=company,DC=com"
              defaultValue="DC=company,DC=com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userFilter">User Filter</Label>
            <Input
              id="userFilter"
              placeholder="(objectClass=person)"
              defaultValue="(&(objectClass=person)(!(objectClass=computer)))"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cloud Provider Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="h-5 w-5" />
            <span>Cloud Provider Integration</span>
          </CardTitle>
          <CardDescription>
            Connect to cloud providers for resource and identity management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Cloud Provider</Label>
            <Select defaultValue="aws">
              <SelectTrigger>
                <SelectValue placeholder="Select cloud provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aws">Amazon Web Services (AWS)</SelectItem>
                <SelectItem value="azure">Microsoft Azure</SelectItem>
                <SelectItem value="gcp">Google Cloud Platform</SelectItem>
                <SelectItem value="oci">Oracle Cloud Infrastructure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accessKey">Access Key ID</Label>
            <Input
              id="accessKey"
              placeholder="Enter access key"
              type="password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secretKey">Secret Access Key</Label>
            <Input
              id="secretKey"
              placeholder="Enter secret key"
              type="password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Default Region</Label>
            <Select defaultValue="us-east-1">
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">Test Connection</Button>
            <Button variant="outline" size="sm">Import Resources</Button>
          </div>
        </CardContent>
      </Card>

      {/* SSO Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Single Sign-On (SSO)</span>
          </CardTitle>
          <CardDescription>
            Configure SSO integration with identity providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>SSO Provider</Label>
            <Select defaultValue="saml">
              <SelectTrigger>
                <SelectValue placeholder="Select SSO provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="saml">SAML 2.0</SelectItem>
                <SelectItem value="oidc">OpenID Connect</SelectItem>
                <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                <SelectItem value="okta">Okta</SelectItem>
                <SelectItem value="azure-ad">Azure AD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ssoUrl">SSO URL</Label>
            <Input
              id="ssoUrl"
              placeholder="https://your-sso-provider.com/sso"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="entityId">Entity ID</Label>
            <Input
              id="entityId"
              placeholder="urn:your-entity-id"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificate">X.509 Certificate</Label>
            <Textarea
              id="certificate"
              placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
              className="min-h-[100px] font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* API & Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Webhook className="h-5 w-5" />
            <span>API & Webhooks</span>
          </CardTitle>
          <CardDescription>
            Configure API access and webhook integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>API Keys</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Production API Key</p>
                  <p className="text-sm text-gray-500">Created on Jan 15, 2024</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Active</Badge>
                  <Button variant="outline" size="sm">Regenerate</Button>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">Create New API Key</Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook Endpoint</Label>
            <Input
              id="webhookUrl"
              placeholder="https://your-app.com/webhooks/iam"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhookSecret">Webhook Secret</Label>
            <Input
              id="webhookSecret"
              placeholder="Enter webhook secret"
              type="password"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Webhook Verification</Label>
              <p className="text-sm text-gray-500">Verify webhook signatures for security</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline">Test All Connections</Button>
        <Button>Save Configuration</Button>
      </div>
    </div>
  );
};

export default SystemIntegration;

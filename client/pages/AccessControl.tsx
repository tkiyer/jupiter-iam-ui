/**
 * Access Control Test Page
 * Demonstrates and tests access control enforcement
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  PermissionGuard,
  RoleGuard,
  MultiPermissionGuard,
  FieldGuard,
  ConditionalRender,
  AccessIndicator,
  AccessDebug
} from '../components/access-control/AccessGuard';
import { usePermission, useRole, usePermissions, useAccessControlContext } from '../hooks/useAccessControl';
import { Shield, CheckCircle, XCircle, Info, User, Key, Database, Settings, FileText, Users } from 'lucide-react';

export default function AccessControl() {
  const [testResource, setTestResource] = useState('users');
  const [testAction, setTestAction] = useState('read');
  const [testContext, setTestContext] = useState('{}');
  const [testResults, setTestResults] = useState<any[]>([]);

  const { context, loading: contextLoading } = useAccessControlContext();

  // Test permission hook
  const { hasPermission: canRead, loading: readLoading, reason: readReason } = usePermission('users', 'read');
  const { hasPermission: canWrite, loading: writeLoading, reason: writeReason } = usePermission('users', 'write');
  const { hasPermission: canDelete, loading: deleteLoading, reason: deleteReason } = usePermission('users', 'delete');

  // Test role hook
  const { hasRole: isAdmin, loading: adminLoading } = useRole('Administrator');
  const { hasRole: isManager, loading: managerLoading } = useRole('Manager');

  // Test multiple permissions
  const { results: multiResults, loading: multiLoading } = usePermissions([
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'write' },
    { resource: 'roles', action: 'read' },
    { resource: 'permissions', action: 'read' }
  ]);

  const runPermissionTest = async () => {
    try {
      const contextObj = JSON.parse(testContext || '{}');
      const response = await fetch('/api/access-control/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: context?.user.id,
          resource: testResource,
          action: testAction,
          context: contextObj
        })
      });

      const result = await response.json();
      
      setTestResults(prev => [{
        id: Date.now(),
        resource: testResource,
        action: testAction,
        context: contextObj,
        result,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]); // Keep last 10 results
    } catch (error) {
      console.error('Test failed:', error);
    }
  };

  // Mock sensitive data for field access testing
  const mockUserData = {
    id: '123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    ssn: '123-45-6789',
    salary: 75000,
    phone: '+1-555-0123'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
          <p className="text-muted-foreground">
            Test and demonstrate RBAC and ABAC access control enforcement
          </p>
        </div>
      </div>

      <Tabs defaultValue="live-test" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="live-test">Live Testing</TabsTrigger>
          <TabsTrigger value="permission-guards">Permission Guards</TabsTrigger>
          <TabsTrigger value="role-guards">Role Guards</TabsTrigger>
          <TabsTrigger value="field-access">Field Access</TabsTrigger>
          <TabsTrigger value="context">Access Context</TabsTrigger>
        </TabsList>

        {/* Live Testing Tab */}
        <TabsContent value="live-test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Permission Tester
              </CardTitle>
              <CardDescription>
                Test access control in real-time by specifying resource, action, and context
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="resource">Resource</Label>
                  <Input
                    id="resource"
                    value={testResource}
                    onChange={(e) => setTestResource(e.target.value)}
                    placeholder="e.g., users, roles, policies"
                  />
                </div>
                <div>
                  <Label htmlFor="action">Action</Label>
                  <Input
                    id="action"
                    value={testAction}
                    onChange={(e) => setTestAction(e.target.value)}
                    placeholder="e.g., read, write, delete"
                  />
                </div>
                <div>
                  <Label htmlFor="context">Context (JSON)</Label>
                  <Input
                    id="context"
                    value={testContext}
                    onChange={(e) => setTestContext(e.target.value)}
                    placeholder='{"department": "IT"}'
                  />
                </div>
              </div>
              
              <Button onClick={runPermissionTest} className="w-full">
                Test Permission
              </Button>

              {testResults.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Test Results</h4>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {testResults.map((test) => (
                        <div key={test.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-mono text-sm">
                              {test.resource}:{test.action}
                            </div>
                            <Badge variant={test.result.allowed ? 'default' : 'destructive'}>
                              {test.result.allowed ? 'ALLOWED' : 'DENIED'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {test.result.reason}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(test.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Permission Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  User Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Read Users</span>
                  {readLoading ? (
                    <Badge variant="outline">Loading...</Badge>
                  ) : (
                    <Badge variant={canRead ? 'default' : 'destructive'}>
                      {canRead ? 'Allowed' : 'Denied'}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Write Users</span>
                  {writeLoading ? (
                    <Badge variant="outline">Loading...</Badge>
                  ) : (
                    <Badge variant={canWrite ? 'default' : 'destructive'}>
                      {canWrite ? 'Allowed' : 'Denied'}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Delete Users</span>
                  {deleteLoading ? (
                    <Badge variant="outline">Loading...</Badge>
                  ) : (
                    <Badge variant={canDelete ? 'default' : 'destructive'}>
                      {canDelete ? 'Allowed' : 'Denied'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Role Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Administrator</span>
                  {adminLoading ? (
                    <Badge variant="outline">Loading...</Badge>
                  ) : (
                    <Badge variant={isAdmin ? 'default' : 'secondary'}>
                      {isAdmin ? 'Active' : 'Not Active'}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Manager</span>
                  {managerLoading ? (
                    <Badge variant="outline">Loading...</Badge>
                  ) : (
                    <Badge variant={isManager ? 'default' : 'secondary'}>
                      {isManager ? 'Active' : 'Not Active'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Multi-Permission Check
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {multiLoading ? (
                  <Badge variant="outline">Loading...</Badge>
                ) : (
                  Object.entries(multiResults).map(([key, result]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm">{key}</span>
                      <Badge variant={result.allowed ? 'default' : 'destructive'}>
                        {result.allowed ? 'Allowed' : 'Denied'}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Permission Guards Tab */}
        <TabsContent value="permission-guards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Guard Examples</CardTitle>
              <CardDescription>
                See how UI elements are protected based on permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Basic Permission Guards</h4>
                <div className="space-y-4">
                  <PermissionGuard resource="users" action="read">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        ✅ This content is visible because you have 'read users' permission
                      </AlertDescription>
                    </Alert>
                  </PermissionGuard>

                  <PermissionGuard resource="admin" action="write" showReason>
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        ✅ This content requires 'write admin' permission
                      </AlertDescription>
                    </Alert>
                  </PermissionGuard>

                  <PermissionGuard 
                    resource="sensitive_data" 
                    action="read" 
                    fallback={
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>
                          ❌ Custom fallback: You don't have access to sensitive data
                        </AlertDescription>
                      </Alert>
                    }
                  >
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        ✅ Sensitive data content (should not be visible)
                      </AlertDescription>
                    </Alert>
                  </PermissionGuard>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Multi-Permission Guards</h4>
                <div className="space-y-4">
                  <MultiPermissionGuard
                    permissions={[
                      { resource: 'users', action: 'read' },
                      { resource: 'roles', action: 'read' }
                    ]}
                    operator="AND"
                    showReason
                  >
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        ✅ This requires BOTH 'read users' AND 'read roles' permissions
                      </AlertDescription>
                    </Alert>
                  </MultiPermissionGuard>

                  <MultiPermissionGuard
                    permissions={[
                      { resource: 'admin', action: 'write' },
                      { resource: 'users', action: 'read' }
                    ]}
                    operator="OR"
                    showReason
                  >
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        ✅ This requires EITHER 'write admin' OR 'read users' permission
                      </AlertDescription>
                    </Alert>
                  </MultiPermissionGuard>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3">Conditional Rendering</h4>
                <div className="space-y-4">
                  <ConditionalRender
                    when={{ resource: 'users', action: 'write' }}
                    otherwise={<span className="text-muted-foreground">No write access</span>}
                  >
                    <Button>
                      <Settings className="h-4 w-4 mr-2" />
                      Edit User Settings
                    </Button>
                  </ConditionalRender>

                  <ConditionalRender
                    when={{ role: 'Administrator' }}
                    otherwise={<span className="text-muted-foreground">Admin only</span>}
                  >
                    <Button variant="destructive">
                      <Database className="h-4 w-4 mr-2" />
                      System Settings
                    </Button>
                  </ConditionalRender>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role Guards Tab */}
        <TabsContent value="role-guards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Guard Examples</CardTitle>
              <CardDescription>
                See how UI elements are protected based on user roles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <RoleGuard role="Administrator">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      ✅ Administrator only content - you are an admin!
                    </AlertDescription>
                  </Alert>
                </RoleGuard>

                <RoleGuard role="Manager" showReason>
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      ✅ Manager only content
                    </AlertDescription>
                  </Alert>
                </RoleGuard>

                <RoleGuard 
                  role="SuperAdmin" 
                  fallback={
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        ❌ SuperAdmin role required for this content
                      </AlertDescription>
                    </Alert>
                  }
                >
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      ✅ SuperAdmin content (should not be visible)
                    </AlertDescription>
                  </Alert>
                </RoleGuard>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Field Access Tab */}
        <TabsContent value="field-access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Field-Level Access Control</CardTitle>
              <CardDescription>
                Demonstrates field masking and access restrictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-semibold">User Profile Data</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <FieldGuard fieldName="name" value={mockUserData.name}>
                      <div className="p-2 border rounded">{mockUserData.name}</div>
                    </FieldGuard>
                  </div>
                  
                  <div>
                    <Label>Email Address</Label>
                    <FieldGuard fieldName="email" value={mockUserData.email}>
                      {(value, applyMasking) => (
                        <div className="p-2 border rounded">{applyMasking(value)}</div>
                      )}
                    </FieldGuard>
                  </div>

                  <div>
                    <Label>Social Security Number</Label>
                    <FieldGuard fieldName="ssn" value={mockUserData.ssn}>
                      {(value, applyMasking) => (
                        <div className="p-2 border rounded">{applyMasking(value)}</div>
                      )}
                    </FieldGuard>
                  </div>

                  <div>
                    <Label>Salary</Label>
                    <FieldGuard fieldName="salary" value={mockUserData.salary}>
                      {(value, applyMasking) => (
                        <div className="p-2 border rounded">${applyMasking(value)}</div>
                      )}
                    </FieldGuard>
                  </div>

                  <div>
                    <Label>Phone Number</Label>
                    <FieldGuard fieldName="phone" value={mockUserData.phone}>
                      {(value, applyMasking) => (
                        <div className="p-2 border rounded">{applyMasking(value)}</div>
                      )}
                    </FieldGuard>
                  </div>

                  <div>
                    <Label>Employee ID</Label>
                    <FieldGuard fieldName="employee_id" value={mockUserData.id}>
                      <div className="p-2 border rounded">{mockUserData.id}</div>
                    </FieldGuard>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Context Tab */}
        <TabsContent value="context" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Control Context</CardTitle>
              <CardDescription>
                Current user's access control context including roles, permissions, and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contextLoading ? (
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : context ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">User Information</h4>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span>ID:</span> <span className="font-mono">{context.user.id}</span>
                        <span>Username:</span> <span>{context.user.username}</span>
                        <span>Email:</span> <span>{context.user.email}</span>
                        <span>Status:</span> <Badge>{context.user.status}</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Roles ({context.roles.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {context.roles.map(role => (
                        <Badge key={role.id} variant="outline">
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Permissions ({context.permissions.length})</h4>
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {context.permissions.map(permission => (
                          <div key={permission.id} className="flex items-center justify-between p-2 border rounded">
                            <span className="text-sm">{permission.name}</span>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">
                                {permission.resource}:{permission.action}
                              </Badge>
                              <Badge variant={permission.risk === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                                {permission.risk}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Active Policies ({context.policies.length})</h4>
                    <div className="space-y-2">
                      {context.policies.map(policy => (
                        <div key={policy.id} className="p-3 border rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{policy.name}</span>
                            <div className="flex gap-2">
                              <Badge variant={policy.effect === 'allow' ? 'default' : 'destructive'}>
                                {policy.effect.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                Priority: {policy.priority}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{policy.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Environment Context</h4>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <pre className="text-xs">
                        {JSON.stringify(context.environment, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load access control context
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Access Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Access Indicators</CardTitle>
              <CardDescription>
                Visual indicators for access permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Read Users</Label>
                  <AccessIndicator resource="users" action="read" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Write Users</Label>
                  <AccessIndicator resource="users" action="write" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Delete Users</Label>
                  <AccessIndicator resource="users" action="delete" />
                </div>
                <div>
                  <Label className="text-sm font-medium">Admin Access</Label>
                  <AccessIndicator resource="admin" action="write" />
                </div>
              </div>

              {/* Debug Info (Development Only) */}
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Debug Information</h4>
                <AccessDebug resource="users" action="read" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

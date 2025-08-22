import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ABACPolicy, 
  PolicyRule, 
  AttributeCondition, 
  User, 
  Resource 
} from '@shared/iam';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Filter,
  MoreHorizontal,
  Shield,
  Clock,
  Users,
  AlertTriangle,
  TrendingUp,
  Eye,
  Copy,
  Settings,
  Play,
  Pause,
  RotateCcw,
  GitBranch,
  TestTube,
  Activity,
  BarChart3,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  FileText,
  Cpu,
  RefreshCw,
  Database,
  Globe,
  Code,
  Layers,
  ArrowRight,
  ArrowDown,
  ChevronRight,
  ChevronDown,
  Monitor,
  Wrench,
  FlaskConical
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Policies: React.FC = () => {
  const [policies, setPolicies] = useState<ABACPolicy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<ABACPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [effectFilter, setEffectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<ABACPolicy | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('policies');

  // Policy simulation state
  const [simulationRequest, setSimulationRequest] = useState({
    subject: '',
    resource: '',
    action: '',
    environment: {}
  });
  const [simulationResult, setSimulationResult] = useState<any>(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  useEffect(() => {
    filterPolicies();
  }, [policies, searchTerm, statusFilter, effectFilter, priorityFilter]);

  const fetchPolicies = async () => {
    try {
      const response = await fetch('/api/policies');
      const data = await response.json();
      setPolicies(data.policies || data || []);
    } catch (error) {
      console.error('Error fetching policies:', error);
      // Mock data for demo
      setPolicies([
        {
          id: 'pol-1',
          name: 'Executive Financial Access',
          description: 'Allow executives to access financial data during business hours',
          rules: [
            {
              subject: [
                { attribute: 'role', operator: 'equals', value: 'executive' },
                { attribute: 'department', operator: 'in', value: ['finance', 'executive'] }
              ],
              resource: [
                { attribute: 'type', operator: 'equals', value: 'financial_data' },
                { attribute: 'classification', operator: 'not_equals', value: 'top_secret' }
              ],
              action: ['read', 'analyze'],
              environment: [
                { attribute: 'time', operator: 'greater_than', value: '09:00' },
                { attribute: 'time', operator: 'less_than', value: '17:00' },
                { attribute: 'location', operator: 'equals', value: 'office' }
              ]
            }
          ],
          effect: 'allow',
          priority: 100,
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'pol-2',
          name: 'Emergency System Access',
          description: 'Allow system administrators emergency access to all systems',
          rules: [
            {
              subject: [
                { attribute: 'role', operator: 'equals', value: 'sysadmin' },
                { attribute: 'emergency_clearance', operator: 'equals', value: true }
              ],
              resource: [
                { attribute: 'type', operator: 'equals', value: 'system' }
              ],
              action: ['read', 'write', 'execute', 'admin'],
              environment: [
                { attribute: 'emergency_mode', operator: 'equals', value: true }
              ]
            }
          ],
          effect: 'allow',
          priority: 200,
          status: 'active',
          createdAt: '2024-01-02T00:00:00Z'
        },
        {
          id: 'pol-3',
          name: 'Contractor Data Restriction',
          description: 'Prevent contractors from accessing sensitive customer data',
          rules: [
            {
              subject: [
                { attribute: 'employment_type', operator: 'equals', value: 'contractor' }
              ],
              resource: [
                { attribute: 'data_classification', operator: 'in', value: ['sensitive', 'confidential'] },
                { attribute: 'contains_pii', operator: 'equals', value: true }
              ],
              action: ['read', 'write', 'download']
            }
          ],
          effect: 'deny',
          priority: 150,
          status: 'active',
          createdAt: '2024-01-03T00:00:00Z'
        },
        {
          id: 'pol-4',
          name: 'Development Environment Access',
          description: 'Allow developers access to development resources',
          rules: [
            {
              subject: [
                { attribute: 'department', operator: 'equals', value: 'engineering' },
                { attribute: 'project_member', operator: 'equals', value: true }
              ],
              resource: [
                { attribute: 'environment', operator: 'equals', value: 'development' },
                { attribute: 'project_id', operator: 'equals', value: '${subject.current_project}' }
              ],
              action: ['read', 'write', 'deploy'],
              environment: [
                { attribute: 'network', operator: 'equals', value: 'internal' }
              ]
            }
          ],
          effect: 'allow',
          priority: 50,
          status: 'inactive',
          createdAt: '2024-01-04T00:00:00Z'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPolicies = () => {
    let filtered = policies;

    if (searchTerm) {
      filtered = filtered.filter(policy => 
        policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(policy => policy.status === statusFilter);
    }

    if (effectFilter !== 'all') {
      filtered = filtered.filter(policy => policy.effect === effectFilter);
    }

    if (priorityFilter !== 'all') {
      const priority = parseInt(priorityFilter);
      filtered = filtered.filter(policy => 
        priorityFilter === 'high' ? policy.priority >= 150 :
        priorityFilter === 'medium' ? policy.priority >= 100 && policy.priority < 150 :
        priorityFilter === 'low' ? policy.priority < 100 : true
      );
    }

    setFilteredPolicies(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEffectColor = (effect: string) => {
    switch (effect) {
      case 'allow': return 'bg-green-100 text-green-800';
      case 'deny': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadge = (priority: number) => {
    if (priority >= 150) return { label: 'High', color: 'bg-red-100 text-red-800' };
    if (priority >= 100) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Low', color: 'bg-blue-100 text-blue-800' };
  };

  const handleCreatePolicy = async (policyData: any) => {
    try {
      const response = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policyData),
      });
      
      if (response.ok) {
        const newPolicy = await response.json();
        setPolicies(prev => [...prev, newPolicy]);
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating policy:', error);
    }
  };

  const handleTestPolicy = async () => {
    try {
      const response = await fetch('/api/policies/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simulationRequest),
      });
      
      const result = await response.json();
      setSimulationResult(result);
    } catch (error) {
      console.error('Error testing policy:', error);
      // Mock result
      setSimulationResult({
        decision: 'allow',
        appliedPolicies: ['pol-1'],
        evaluationTime: '2.3ms',
        explanation: 'Access granted based on executive role and business hours condition',
        details: {
          subjectAttributes: { role: 'executive', department: 'finance' },
          resourceAttributes: { type: 'financial_data', classification: 'confidential' },
          environmentAttributes: { time: '14:30', location: 'office' }
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ABAC Policy Management</h1>
          <p className="text-gray-600 mt-1">Attribute-based access control with dynamic policy evaluation</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsTestDialogOpen(true)}
          >
            <TestTube className="mr-2 h-4 w-4" />
            Test Policies
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Policy
              </Button>
            </DialogTrigger>
            <CreatePolicyDialog onCreatePolicy={handleCreatePolicy} />
          </Dialog>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="builder">Policy Builder</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search policies by name or description..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={effectFilter} onValueChange={setEffectFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Effect" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Effects</SelectItem>
                      <SelectItem value="allow">Allow</SelectItem>
                      <SelectItem value="deny">Deny</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policies Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Policies ({filteredPolicies.length})</span>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Policy</TableHead>
                    <TableHead>Effect</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rules</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">{policy.name}</p>
                            <p className="text-sm text-gray-500">{policy.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("flex items-center gap-1 w-fit", getEffectColor(policy.effect))}>
                          {policy.effect === 'allow' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {policy.effect}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityBadge(policy.priority).color}>
                            {getPriorityBadge(policy.priority).label}
                          </Badge>
                          <span className="text-sm text-gray-500">({policy.priority})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("flex items-center gap-1 w-fit", getStatusColor(policy.status))}>
                          {policy.status === 'active' && <CheckCircle className="h-3 w-3" />}
                          {policy.status === 'inactive' && <XCircle className="h-3 w-3" />}
                          {policy.status === 'draft' && <Clock className="h-3 w-3" />}
                          {policy.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{policy.rules.length} rule{policy.rules.length !== 1 ? 's' : ''}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500">
                          {new Date(policy.createdAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPolicy(policy);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policy Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          <PolicyBuilderView />
        </TabsContent>

        {/* Simulation Tab */}
        <TabsContent value="simulation" className="space-y-6">
          <PolicySimulationView 
            simulationRequest={simulationRequest}
            setSimulationRequest={setSimulationRequest}
            simulationResult={simulationResult}
            onRunSimulation={handleTestPolicy}
          />
        </TabsContent>

        {/* Conflicts Tab */}
        <TabsContent value="conflicts" className="space-y-6">
          <PolicyConflictsView policies={filteredPolicies} />
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <PolicyMonitoringView policies={filteredPolicies} />
        </TabsContent>
      </Tabs>

      {/* Edit Policy Dialog */}
      {selectedPolicy && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <EditPolicyDialog 
            policy={selectedPolicy}
            onSave={(updatedPolicy) => {
              setPolicies(prev => prev.map(p => p.id === updatedPolicy.id ? updatedPolicy : p));
              setIsEditDialogOpen(false);
            }}
          />
        </Dialog>
      )}

      {/* Test Policy Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <PolicyTestDialog 
          simulationRequest={simulationRequest}
          setSimulationRequest={setSimulationRequest}
          simulationResult={simulationResult}
          onRunTest={handleTestPolicy}
        />
      </Dialog>
    </div>
  );
};

// Create Policy Dialog Component
const CreatePolicyDialog: React.FC<{
  onCreatePolicy: (policy: any) => void;
}> = ({ onCreatePolicy }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    effect: 'allow',
    priority: 100,
    rules: [] as PolicyRule[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreatePolicy({
      ...formData,
      status: 'draft',
      createdAt: new Date().toISOString()
    });
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New ABAC Policy</DialogTitle>
        <DialogDescription>
          Define attribute-based access control rules with conditions
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Policy Name</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <Label>Effect</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, effect: value as 'allow' | 'deny' }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select effect" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allow">Allow</SelectItem>
                <SelectItem value="deny">Deny</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            required
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="priority">Priority (higher number = higher priority)</Label>
          <Input
            id="priority"
            type="number"
            min="1"
            max="1000"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
          />
        </div>

        <div>
          <Label>Rules</Label>
          <p className="text-sm text-gray-500 mb-4">
            Use the Policy Builder to create complex rules, or start with basic settings here.
          </p>
          <Button type="button" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Create Policy</Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Edit Policy Dialog Component
const EditPolicyDialog: React.FC<{
  policy: ABACPolicy;
  onSave: (policy: ABACPolicy) => void;
}> = ({ policy, onSave }) => {
  const [formData, setFormData] = useState<ABACPolicy>(policy);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Policy: {policy.name}</DialogTitle>
        <DialogDescription>
          Update policy rules, conditions, and settings
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editName">Name</Label>
                <Input
                  id="editName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive' | 'draft') => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Effect</Label>
                <Select 
                  value={formData.effect}
                  onValueChange={(value: 'allow' | 'deny') => 
                    setFormData(prev => ({ ...prev, effect: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allow">Allow</SelectItem>
                    <SelectItem value="deny">Deny</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editPriority">Priority</Label>
                <Input
                  id="editPriority"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="rules" className="space-y-4">
            <PolicyRulesEditor 
              rules={formData.rules} 
              onChange={(rules) => setFormData(prev => ({ ...prev, rules }))}
            />
          </TabsContent>
          
          <TabsContent value="conditions" className="space-y-4">
            <div className="text-center text-gray-500 py-8">
              <Settings className="mx-auto h-12 w-12 mb-4" />
              <p>Advanced condition builder coming soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="testing" className="space-y-4">
            <div className="text-center text-gray-500 py-8">
              <TestTube className="mx-auto h-12 w-12 mb-4" />
              <p>Policy testing tools integration</p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
        </div>
      </form>
    </DialogContent>
  );
};

// Policy Builder View Component
const PolicyBuilderView: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="mr-2 h-5 w-5" />
            Visual Policy Builder
          </CardTitle>
          <CardDescription>
            Drag and drop interface for building complex ABAC policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Components Palette */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Subjects</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" size="sm" className="justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      User Role
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Department
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Attribute
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Resources</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" size="sm" className="justify-start">
                      <Database className="mr-2 h-4 w-4" />
                      Data Type
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Database className="mr-2 h-4 w-4" />
                      Classification
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Database className="mr-2 h-4 w-4" />
                      Location
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Environment</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" size="sm" className="justify-start">
                      <Clock className="mr-2 h-4 w-4" />
                      Time Range
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Globe className="mr-2 h-4 w-4" />
                      Location
                    </Button>
                    <Button variant="outline" size="sm" className="justify-start">
                      <Monitor className="mr-2 h-4 w-4" />
                      Device Type
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Builder Canvas */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Policy Canvas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center min-h-96">
                  <div className="space-y-4">
                    <Layers className="mx-auto h-12 w-12 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Start Building Your Policy</h3>
                      <p className="text-gray-500">Drag components from the palette to build your ABAC policy rules</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Rule
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Policy Simulation View Component
const PolicySimulationView: React.FC<{
  simulationRequest: any;
  setSimulationRequest: (req: any) => void;
  simulationResult: any;
  onRunSimulation: () => void;
}> = ({ simulationRequest, setSimulationRequest, simulationResult, onRunSimulation }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulation Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FlaskConical className="mr-2 h-5 w-5" />
              Policy Simulation
            </CardTitle>
            <CardDescription>
              Test your policies with specific scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject (User ID or Role)</Label>
              <Input
                id="subject"
                placeholder="e.g., user123 or executive"
                value={simulationRequest.subject}
                onChange={(e) => setSimulationRequest(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="resource">Resource</Label>
              <Input
                id="resource"
                placeholder="e.g., financial_data"
                value={simulationRequest.resource}
                onChange={(e) => setSimulationRequest(prev => ({ ...prev, resource: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="action">Action</Label>
              <Select onValueChange={(value) => setSimulationRequest(prev => ({ ...prev, action: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="write">Write</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="execute">Execute</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Environment Context</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Input placeholder="time: 14:30" />
                <Input placeholder="location: office" />
                <Input placeholder="network: internal" />
                <Input placeholder="device: laptop" />
              </div>
            </div>

            <Button onClick={onRunSimulation} className="w-full bg-blue-600 hover:bg-blue-700">
              <Play className="mr-2 h-4 w-4" />
              Run Simulation
            </Button>
          </CardContent>
        </Card>

        {/* Simulation Result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Simulation Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {simulationResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {simulationResult.decision === 'allow' ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-lg capitalize">{simulationResult.decision}</p>
                      <p className="text-sm text-gray-500">Evaluation time: {simulationResult.evaluationTime}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {simulationResult.appliedPolicies.length} policies
                  </Badge>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Explanation</h4>
                  <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                    {simulationResult.explanation}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Applied Policies</h4>
                  <div className="space-y-2">
                    {simulationResult.appliedPolicies.map((policyId: string, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm font-medium">{policyId}</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Attribute Details</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="p-2 bg-blue-50 rounded">
                      <span className="font-medium">Subject:</span> {JSON.stringify(simulationResult.details.subjectAttributes)}
                    </div>
                    <div className="p-2 bg-green-50 rounded">
                      <span className="font-medium">Resource:</span> {JSON.stringify(simulationResult.details.resourceAttributes)}
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                      <span className="font-medium">Environment:</span> {JSON.stringify(simulationResult.details.environmentAttributes)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <TestTube className="mx-auto h-12 w-12 mb-4" />
                <p>Run a simulation to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Policy Conflicts View Component
const PolicyConflictsView: React.FC<{ policies: ABACPolicy[] }> = ({ policies }) => {
  const conflicts = [
    {
      id: 'conflict-1',
      type: 'Effect Conflict',
      severity: 'high',
      policies: ['pol-1', 'pol-3'],
      description: 'Executive Financial Access allows access while Contractor Data Restriction denies it for contractor executives',
      resolution: 'Add more specific subject conditions or adjust priority order'
    },
    {
      id: 'conflict-2',
      type: 'Priority Overlap',
      severity: 'medium',
      policies: ['pol-2', 'pol-3'],
      description: 'Emergency System Access and Contractor Data Restriction have overlapping priority ranges',
      resolution: 'Adjust priority values to create clear hierarchy'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Policy Conflicts
          </CardTitle>
          <CardDescription>
            Detected conflicts and resolution recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conflicts.map((conflict) => (
              <Card key={conflict.id} className="border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={
                          conflict.severity === 'high' ? 'bg-red-100 text-red-800' :
                          conflict.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {conflict.severity}
                        </Badge>
                        <span className="font-medium">{conflict.type}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{conflict.description}</p>
                      <p className="text-sm font-medium">Affected policies: {conflict.policies.join(', ')}</p>
                      <p className="text-xs text-gray-500 mt-1">Resolution: {conflict.resolution}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Resolve</Button>
                      <Button variant="ghost" size="sm">Ignore</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Policy Monitoring View Component
const PolicyMonitoringView: React.FC<{ policies: ABACPolicy[] }> = ({ policies }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Policies</p>
                <p className="text-3xl font-bold text-gray-900">{policies.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Policies</p>
                <p className="text-3xl font-bold text-gray-900">
                  {policies.filter(p => p.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Allow Policies</p>
                <p className="text-3xl font-bold text-gray-900">
                  {policies.filter(p => p.effect === 'allow').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deny Policies</p>
                <p className="text-3xl font-bold text-gray-900">
                  {policies.filter(p => p.effect === 'deny').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Policy Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {policies.slice(0, 5).map((policy, index) => (
              <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{policy.name}</p>
                  <p className="text-sm text-gray-500">
                    Priority: {policy.priority} • Status: {policy.status}
                  </p>
                </div>
                <div className="flex-1 mx-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Usage</span>
                    <span>{Math.floor(Math.random() * 100)}%</span>
                  </div>
                  <Progress value={Math.floor(Math.random() * 100)} className="h-2" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{Math.floor(Math.random() * 1000)} evaluations</p>
                  <p className="text-xs text-gray-500">{(Math.random() * 10).toFixed(1)}ms avg</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Policy Rules Editor Component
const PolicyRulesEditor: React.FC<{
  rules: PolicyRule[];
  onChange: (rules: PolicyRule[]) => void;
}> = ({ rules, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Policy Rules</h3>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </div>
      
      {rules.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <FileText className="mx-auto h-12 w-12 mb-4" />
          <p>No rules defined yet</p>
          <p className="text-sm">Add rules to define policy conditions</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule, index) => (
            <Card key={index} className="border">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Rule {index + 1}</h4>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700 mb-2">Subject Conditions</p>
                      <div className="space-y-1">
                        {rule.subject.map((condition, i) => (
                          <div key={i} className="p-2 bg-blue-50 rounded text-xs">
                            {condition.attribute} {condition.operator} {JSON.stringify(condition.value)}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-700 mb-2">Resource Conditions</p>
                      <div className="space-y-1">
                        {rule.resource.map((condition, i) => (
                          <div key={i} className="p-2 bg-green-50 rounded text-xs">
                            {condition.attribute} {condition.operator} {JSON.stringify(condition.value)}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium text-gray-700 mb-2">Actions & Environment</p>
                      <div className="space-y-1">
                        <div className="p-2 bg-purple-50 rounded text-xs">
                          Actions: {rule.action.join(', ')}
                        </div>
                        {rule.environment?.map((condition, i) => (
                          <div key={i} className="p-2 bg-orange-50 rounded text-xs">
                            {condition.attribute} {condition.operator} {JSON.stringify(condition.value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Policy Test Dialog Component
const PolicyTestDialog: React.FC<{
  simulationRequest: any;
  setSimulationRequest: (req: any) => void;
  simulationResult: any;
  onRunTest: () => void;
}> = ({ simulationRequest, setSimulationRequest, simulationResult, onRunTest }) => {
  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Policy Testing</DialogTitle>
        <DialogDescription>
          Test policies against specific scenarios to validate behavior
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        <PolicySimulationView 
          simulationRequest={simulationRequest}
          setSimulationRequest={setSimulationRequest}
          simulationResult={simulationResult}
          onRunSimulation={onRunTest}
        />
      </div>
    </DialogContent>
  );
};

export default Policies;

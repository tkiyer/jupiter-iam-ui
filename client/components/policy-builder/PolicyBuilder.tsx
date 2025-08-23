/**
 * Visual Policy Builder Component
 * Interactive drag-and-drop interface for building ABAC policies
 */

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import PolicyTester from './PolicyTester';
import {
  Users,
  Database,
  Clock,
  Globe,
  Monitor,
  Plus,
  Trash2,
  Settings,
  Play,
  Save,
  Eye,
  Link,
  AlertTriangle,
  CheckCircle,
  X,
  GripVertical,
  ArrowRight,
  Copy,
  TestTube
} from 'lucide-react';

// Component types for the policy builder
interface PolicyComponent {
  id: string;
  type: 'subject' | 'resource' | 'environment' | 'action';
  subtype: string;
  label: string;
  icon: any;
  config: Record<string, any>;
  position: { x: number; y: number };
}

interface PolicyRule {
  id: string;
  name: string;
  components: PolicyComponent[];
  connections: Array<{ from: string; to: string; type: 'and' | 'or' }>;
  effect: 'allow' | 'deny';
  conditions: Array<{
    attribute: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in' | 'greater_than' | 'less_than';
    value: any;
  }>;
}

interface PolicyBuilderState {
  rules: PolicyRule[];
  selectedRule: string | null;
  selectedComponent: string | null;
  draggedComponent: any;
  canvas: {
    zoom: number;
    pan: { x: number; y: number };
  };
}

// Component palette configuration
const COMPONENT_TYPES = {
  subject: [
    { id: 'user_role', label: 'User Role', icon: Users, config: { attribute: 'role', operator: 'equals', value: '' } },
    { id: 'department', label: 'Department', icon: Users, config: { attribute: 'department', operator: 'equals', value: '' } },
    { id: 'user_attribute', label: 'User Attribute', icon: Users, config: { attribute: '', operator: 'equals', value: '' } },
    { id: 'clearance_level', label: 'Clearance Level', icon: Users, config: { attribute: 'clearanceLevel', operator: 'equals', value: '' } }
  ],
  resource: [
    { id: 'data_type', label: 'Data Type', icon: Database, config: { attribute: 'type', operator: 'equals', value: '' } },
    { id: 'classification', label: 'Classification', icon: Database, config: { attribute: 'classification', operator: 'equals', value: '' } },
    { id: 'resource_location', label: 'Location', icon: Database, config: { attribute: 'location', operator: 'equals', value: '' } },
    { id: 'sensitivity', label: 'Sensitivity', icon: Database, config: { attribute: 'sensitivity', operator: 'equals', value: '' } }
  ],
  environment: [
    { id: 'time_range', label: 'Time Range', icon: Clock, config: { attribute: 'time', operator: 'greater_than', value: '' } },
    { id: 'ip_location', label: 'IP Location', icon: Globe, config: { attribute: 'clientIp', operator: 'contains', value: '' } },
    { id: 'device_type', label: 'Device Type', icon: Monitor, config: { attribute: 'userAgent', operator: 'contains', value: '' } },
    { id: 'network', label: 'Network', icon: Globe, config: { attribute: 'network', operator: 'equals', value: '' } }
  ],
  action: [
    { id: 'crud_action', label: 'CRUD Action', icon: Settings, config: { actions: [] } },
    { id: 'custom_action', label: 'Custom Action', icon: Settings, config: { actions: [] } }
  ]
};

// Draggable component from palette
const DraggableComponent: React.FC<{ 
  type: string; 
  subtype: string; 
  component: any; 
  onDragStart: (component: any) => void;
}> = ({ type, subtype, component, onDragStart }) => {
  const handleDragStart = (e: React.DragEvent) => {
    onDragStart({ type, subtype, ...component });
    e.dataTransfer.effectAllowed = 'copy';
  };

  const Icon = component.icon;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="flex items-center p-2 border rounded cursor-move hover:bg-gray-50 transition-colors"
    >
      <GripVertical className="h-4 w-4 text-gray-400 mr-2" />
      <Icon className="h-4 w-4 mr-2" />
      <span className="text-sm">{component.label}</span>
    </div>
  );
};

// Policy component on canvas
const CanvasComponent: React.FC<{
  component: PolicyComponent;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMove: (position: { x: number; y: number }) => void;
  onConfigChange: (config: any) => void;
}> = ({ component, selected, onSelect, onDelete, onMove, onConfigChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [configOpen, setConfigOpen] = useState(false);

  const Icon = component.icon;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - component.position.x, y: e.clientY - component.position.y });
    onSelect();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      onMove({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart, onMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const getTypeColor = () => {
    switch (component.type) {
      case 'subject': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'resource': return 'bg-green-100 border-green-300 text-green-800';
      case 'environment': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'action': return 'bg-orange-100 border-orange-300 text-orange-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <>
      <div
        className={`absolute p-3 border-2 rounded-lg cursor-move min-w-32 ${getTypeColor()} ${
          selected ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{ left: component.position.x, top: component.position.y }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Icon className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{component.label}</span>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setConfigOpen(true);
              }}
              className="h-6 w-6 p-0"
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Component preview */}
        <div className="text-xs space-y-1">
          {component.config.attribute && (
            <div>
              <Badge variant="outline" className="text-xs">
                {component.config.attribute} {component.config.operator} {component.config.value || '(empty)'}
              </Badge>
            </div>
          )}
          {component.config.actions && component.config.actions.length > 0 && (
            <div>
              <Badge variant="outline" className="text-xs">
                Actions: {component.config.actions.join(', ')}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Configuration Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {component.label}</DialogTitle>
            <DialogDescription>
              Set the parameters for this policy component
            </DialogDescription>
          </DialogHeader>
          <ComponentConfigForm
            component={component}
            onSave={(newConfig) => {
              onConfigChange(newConfig);
              setConfigOpen(false);
            }}
            onCancel={() => setConfigOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

// Component configuration form
const ComponentConfigForm: React.FC<{
  component: PolicyComponent;
  onSave: (config: any) => void;
  onCancel: () => void;
}> = ({ component, onSave, onCancel }) => {
  const [config, setConfig] = useState(component.config);

  const handleSave = () => {
    onSave(config);
  };

  if (component.type === 'action') {
    return (
      <div className="space-y-4">
        <div>
          <Label>Actions</Label>
          <div className="space-y-2 mt-2">
            {['read', 'write', 'delete', 'execute', 'create', 'update'].map(action => (
              <label key={action} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.actions?.includes(action) || false}
                  onChange={(e) => {
                    const actions = config.actions || [];
                    if (e.target.checked) {
                      setConfig({ ...config, actions: [...actions, action] });
                    } else {
                      setConfig({ ...config, actions: actions.filter((a: string) => a !== action) });
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm capitalize">{action}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave}>Save</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Attribute</Label>
        <Input
          value={config.attribute || ''}
          onChange={(e) => setConfig({ ...config, attribute: e.target.value })}
          placeholder="e.g., role, department, clearanceLevel"
        />
      </div>

      <div>
        <Label>Operator</Label>
        <Select
          value={config.operator || 'equals'}
          onValueChange={(value) => setConfig({ ...config, operator: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equals">Equals</SelectItem>
            <SelectItem value="not_equals">Not Equals</SelectItem>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="in">In</SelectItem>
            <SelectItem value="not_in">Not In</SelectItem>
            <SelectItem value="greater_than">Greater Than</SelectItem>
            <SelectItem value="less_than">Less Than</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Value</Label>
        <Input
          value={config.value || ''}
          onChange={(e) => setConfig({ ...config, value: e.target.value })}
          placeholder="Enter value or comma-separated values for 'in' operator"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave}>Save</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
};

// Main Policy Builder Component
export const PolicyBuilder: React.FC = () => {
  const [state, setState] = useState<PolicyBuilderState>({
    rules: [
      {
        id: 'rule-1',
        name: 'Default Rule',
        components: [],
        connections: [],
        effect: 'allow',
        conditions: []
      }
    ],
    selectedRule: 'rule-1',
    selectedComponent: null,
    draggedComponent: null,
    canvas: { zoom: 1, pan: { x: 0, y: 0 } }
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  const currentRule = state.rules.find(r => r.id === state.selectedRule);

  // Handle component drag from palette
  const handleComponentDragStart = (component: any) => {
    setState(prev => ({ ...prev, draggedComponent: component }));
  };

  // Handle drop on canvas
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!state.draggedComponent || !currentRule) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newComponent: PolicyComponent = {
      id: `component-${Date.now()}`,
      type: state.draggedComponent.type,
      subtype: state.draggedComponent.subtype,
      label: state.draggedComponent.label,
      icon: state.draggedComponent.icon,
      config: { ...state.draggedComponent.config },
      position: { x, y }
    };

    setState(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === prev.selectedRule
          ? { ...rule, components: [...rule.components, newComponent] }
          : rule
      ),
      draggedComponent: null,
      selectedComponent: newComponent.id
    }));
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Component management functions
  const handleComponentSelect = (componentId: string) => {
    setState(prev => ({ ...prev, selectedComponent: componentId }));
  };

  const handleComponentDelete = (componentId: string) => {
    setState(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === prev.selectedRule
          ? { ...rule, components: rule.components.filter(c => c.id !== componentId) }
          : rule
      ),
      selectedComponent: prev.selectedComponent === componentId ? null : prev.selectedComponent
    }));
  };

  const handleComponentMove = (componentId: string, position: { x: number; y: number }) => {
    setState(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === prev.selectedRule
          ? {
              ...rule,
              components: rule.components.map(c =>
                c.id === componentId ? { ...c, position } : c
              )
            }
          : rule
      )
    }));
  };

  const handleComponentConfigChange = (componentId: string, config: any) => {
    setState(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === prev.selectedRule
          ? {
              ...rule,
              components: rule.components.map(c =>
                c.id === componentId ? { ...c, config } : c
              )
            }
          : rule
      )
    }));
  };

  // Rule management
  const addNewRule = () => {
    const newRule: PolicyRule = {
      id: `rule-${Date.now()}`,
      name: `Rule ${state.rules.length + 1}`,
      components: [],
      connections: [],
      effect: 'allow',
      conditions: []
    };

    setState(prev => ({
      ...prev,
      rules: [...prev.rules, newRule],
      selectedRule: newRule.id
    }));
  };

  const deleteRule = (ruleId: string) => {
    setState(prev => {
      const newRules = prev.rules.filter(r => r.id !== ruleId);
      return {
        ...prev,
        rules: newRules,
        selectedRule: newRules.length > 0 ? newRules[0].id : null
      };
    });
  };

  const updateRuleEffect = (effect: 'allow' | 'deny') => {
    setState(prev => ({
      ...prev,
      rules: prev.rules.map(rule =>
        rule.id === prev.selectedRule ? { ...rule, effect } : rule
      )
    }));
  };

  // Policy validation
  const validatePolicy = () => {
    if (!currentRule) return { valid: false, errors: ['No rule selected'] };

    const errors: string[] = [];
    
    if (currentRule.components.length === 0) {
      errors.push('Rule must have at least one component');
    }

    currentRule.components.forEach((component, index) => {
      if (component.type !== 'action' && !component.config.attribute) {
        errors.push(`Component ${index + 1} missing attribute`);
      }
      if (component.type !== 'action' && !component.config.value) {
        errors.push(`Component ${index + 1} missing value`);
      }
    });

    return { valid: errors.length === 0, errors };
  };

  const validation = validatePolicy();

  // Generate policy preview
  const generatePolicyPreview = () => {
    if (!currentRule) return null;

    const subjects = currentRule.components.filter(c => c.type === 'subject');
    const resources = currentRule.components.filter(c => c.type === 'resource');
    const environment = currentRule.components.filter(c => c.type === 'environment');
    const actions = currentRule.components.filter(c => c.type === 'action');

    return {
      id: currentRule.id,
      name: currentRule.name,
      description: `Generated policy rule with ${currentRule.components.length} components`,
      rules: [{
        subject: subjects.map(s => ({
          attribute: s.config.attribute,
          operator: s.config.operator,
          value: s.config.value
        })),
        resource: resources.map(r => ({
          attribute: r.config.attribute,
          operator: r.config.operator,
          value: r.config.value
        })),
        action: actions.flatMap(a => a.config.actions || []),
        environment: environment.map(e => ({
          attribute: e.config.attribute,
          operator: e.config.operator,
          value: e.config.value
        }))
      }],
      effect: currentRule.effect,
      priority: 50,
      status: 'draft' as const,
      createdAt: new Date().toISOString()
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Visual Policy Builder</h2>
          <p className="text-muted-foreground">
            Build ABAC policies using drag-and-drop components
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addNewRule}>
            <Plus className="h-4 w-4 mr-2" />
            New Rule
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Policy
          </Button>
        </div>
      </div>

      {/* Rule tabs */}
      <div className="border-b">
        <div className="flex gap-2">
          {state.rules.map(rule => (
            <div key={rule.id} className="flex items-center">
              <button
                onClick={() => setState(prev => ({ ...prev, selectedRule: rule.id }))}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  state.selectedRule === rule.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {rule.name}
              </button>
              {state.rules.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteRule(rule.id)}
                  className="h-6 w-6 p-0 ml-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Component Palette */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Component Palette</CardTitle>
              <CardDescription>
                Drag components to the canvas to build your policy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-6">
                  {Object.entries(COMPONENT_TYPES).map(([type, components]) => (
                    <div key={type} className="space-y-2">
                      <h4 className="font-medium text-sm capitalize flex items-center">
                        {type === 'subject' && <Users className="h-4 w-4 mr-2" />}
                        {type === 'resource' && <Database className="h-4 w-4 mr-2" />}
                        {type === 'environment' && <Globe className="h-4 w-4 mr-2" />}
                        {type === 'action' && <Settings className="h-4 w-4 mr-2" />}
                        {type}s
                      </h4>
                      <div className="space-y-2">
                        {components.map(component => (
                          <DraggableComponent
                            key={component.id}
                            type={type}
                            subtype={component.id}
                            component={component}
                            onDragStart={handleComponentDragStart}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Canvas */}
        <div className="col-span-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Policy Canvas</span>
                <div className="flex items-center gap-2">
                  <Badge variant={currentRule?.effect === 'allow' ? 'default' : 'destructive'}>
                    {currentRule?.effect?.toUpperCase()}
                  </Badge>
                  <Select
                    value={currentRule?.effect}
                    onValueChange={(value: 'allow' | 'deny') => updateRuleEffect(value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allow">Allow</SelectItem>
                      <SelectItem value="deny">Deny</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={canvasRef}
                className="relative border-2 border-dashed border-gray-300 rounded-lg h-96 overflow-hidden"
                onDrop={handleCanvasDrop}
                onDragOver={handleCanvasDragOver}
              >
                {currentRule?.components.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Drop components here to build your policy</p>
                    </div>
                  </div>
                ) : (
                  currentRule.components.map(component => (
                    <CanvasComponent
                      key={component.id}
                      component={component}
                      selected={state.selectedComponent === component.id}
                      onSelect={() => handleComponentSelect(component.id)}
                      onDelete={() => handleComponentDelete(component.id)}
                      onMove={(position) => handleComponentMove(component.id, position)}
                      onConfigChange={(config) => handleComponentConfigChange(component.id, config)}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Policy Info & Validation */}
        <div className="col-span-3 space-y-4">
          {/* Validation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                {validation.valid ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                )}
                Validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              {validation.valid ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Policy is valid and ready to save
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      {validation.errors.map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Policy Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Policy Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Components:</strong> {currentRule?.components.length || 0}
                </div>
                <div>
                  <strong>Effect:</strong> {currentRule?.effect || 'allow'}
                </div>
                <div>
                  <strong>Subjects:</strong> {currentRule?.components.filter(c => c.type === 'subject').length || 0}
                </div>
                <div>
                  <strong>Resources:</strong> {currentRule?.components.filter(c => c.type === 'resource').length || 0}
                </div>
                <div>
                  <strong>Environment:</strong> {currentRule?.components.filter(c => c.type === 'environment').length || 0}
                </div>
                <div>
                  <strong>Actions:</strong> {currentRule?.components.filter(c => c.type === 'action').length || 0}
                </div>
              </div>

              {validation.valid && (
                <div className="mt-4 pt-4 border-t">
                  <Button size="sm" variant="outline" className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Test Policy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated JSON */}
          {validation.valid && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generated Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(generatePolicyPreview(), null, 2)}
                </pre>
                <Button size="sm" variant="outline" className="w-full mt-2">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy JSON
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PolicyBuilder;

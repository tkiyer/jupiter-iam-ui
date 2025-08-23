/**
 * Policy Flow Visualization Component
 * Shows visual representation of policy rule flow and connections
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  Users,
  Database,
  Clock,
  Globe,
  Monitor,
  Settings,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface PolicyComponent {
  id: string;
  type: 'subject' | 'resource' | 'environment' | 'action';
  subtype: string;
  label: string;
  icon: any;
  config: Record<string, any>;
}

interface PolicyRule {
  id: string;
  name: string;
  components: PolicyComponent[];
  effect: 'allow' | 'deny';
  priority: number;
}

interface PolicyFlowVisualizationProps {
  rules: PolicyRule[];
  selectedRule?: string;
  onRuleSelect?: (ruleId: string) => void;
  simulationMode?: boolean;
  simulationData?: {
    subject: Record<string, any>;
    resource: Record<string, any>;
    environment: Record<string, any>;
    action: string[];
  };
}

// Component icon mapping
const getComponentIcon = (type: string, subtype: string) => {
  switch (type) {
    case 'subject':
      return Users;
    case 'resource':
      return Database;
    case 'environment':
      return subtype === 'time_range' ? Clock : subtype === 'ip_location' ? Globe : Monitor;
    case 'action':
      return Settings;
    default:
      return Settings;
  }
};

// Component color mapping
const getComponentColor = (type: string) => {
  switch (type) {
    case 'subject':
      return 'bg-blue-100 border-blue-300 text-blue-800';
    case 'resource':
      return 'bg-green-100 border-green-300 text-green-800';
    case 'environment':
      return 'bg-purple-100 border-purple-300 text-purple-800';
    case 'action':
      return 'bg-orange-100 border-orange-300 text-orange-800';
    default:
      return 'bg-gray-100 border-gray-300 text-gray-800';
  }
};

// Individual component visualization
const ComponentVisualization: React.FC<{
  component: PolicyComponent;
  isMatched?: boolean;
  simulationData?: any;
}> = ({ component, isMatched, simulationData }) => {
  const Icon = getComponentIcon(component.type, component.subtype);
  const colorClass = getComponentColor(component.type);
  
  // Check if component matches simulation data
  const evaluateMatch = () => {
    if (!simulationData) return null;
    
    const { attribute, operator, value } = component.config;
    let actualValue;
    
    switch (component.type) {
      case 'subject':
        actualValue = simulationData.subject[attribute];
        break;
      case 'resource':
        actualValue = simulationData.resource[attribute];
        break;
      case 'environment':
        actualValue = simulationData.environment[attribute];
        break;
      case 'action':
        return component.config.actions?.some((action: string) => 
          simulationData.action.includes(action)
        );
      default:
        return null;
    }
    
    switch (operator) {
      case 'equals':
        return actualValue === value;
      case 'not_equals':
        return actualValue !== value;
      case 'contains':
        return String(actualValue).toLowerCase().includes(String(value).toLowerCase());
      case 'in':
        return Array.isArray(value) && value.includes(actualValue);
      case 'not_in':
        return Array.isArray(value) && !value.includes(actualValue);
      case 'greater_than':
        return Number(actualValue) > Number(value);
      case 'less_than':
        return Number(actualValue) < Number(value);
      default:
        return null;
    }
  };
  
  const match = evaluateMatch();
  const showMatch = simulationData && match !== null;
  
  return (
    <div className={`p-3 border-2 rounded-lg min-w-32 relative ${colorClass} ${
      showMatch ? (match ? 'ring-2 ring-green-500' : 'ring-2 ring-red-500') : ''
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Icon className="h-4 w-4 mr-2" />
          <span className="text-sm font-medium">{component.label}</span>
        </div>
        {showMatch && (
          <div className="absolute -top-2 -right-2">
            {match ? (
              <CheckCircle className="h-5 w-5 text-green-600 bg-white rounded-full" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 bg-white rounded-full" />
            )}
          </div>
        )}
      </div>
      
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
        {showMatch && simulationData && (
          <div className="mt-2 pt-2 border-t">
            <div className="text-xs text-gray-600">
              <strong>Actual:</strong>{' '}
              {component.type === 'action' 
                ? simulationData.action.join(', ')
                : simulationData[component.type]?.[component.config.attribute] || 'N/A'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Rule visualization
const RuleVisualization: React.FC<{
  rule: PolicyRule;
  isSelected?: boolean;
  onClick?: () => void;
  simulationData?: any;
}> = ({ rule, isSelected, onClick, simulationData }) => {
  const subjects = rule.components.filter(c => c.type === 'subject');
  const resources = rule.components.filter(c => c.type === 'resource');
  const environment = rule.components.filter(c => c.type === 'environment');
  const actions = rule.components.filter(c => c.type === 'action');
  
  // Evaluate rule match
  const evaluateRule = () => {
    if (!simulationData) return null;
    
    const subjectMatch = subjects.length === 0 || subjects.some(component => {
      const { attribute, operator, value } = component.config;
      const actualValue = simulationData.subject[attribute];
      return evaluateCondition(actualValue, operator, value);
    });
    
    const resourceMatch = resources.length === 0 || resources.some(component => {
      const { attribute, operator, value } = component.config;
      const actualValue = simulationData.resource[attribute];
      return evaluateCondition(actualValue, operator, value);
    });
    
    const environmentMatch = environment.length === 0 || environment.some(component => {
      const { attribute, operator, value } = component.config;
      const actualValue = simulationData.environment[attribute];
      return evaluateCondition(actualValue, operator, value);
    });
    
    const actionMatch = actions.length === 0 || actions.some(component => {
      return component.config.actions?.some((action: string) => 
        simulationData.action.includes(action)
      );
    });
    
    return subjectMatch && resourceMatch && environmentMatch && actionMatch;
  };
  
  const evaluateCondition = (actualValue: any, operator: string, expectedValue: any) => {
    switch (operator) {
      case 'equals': return actualValue === expectedValue;
      case 'not_equals': return actualValue !== expectedValue;
      case 'contains': return String(actualValue).toLowerCase().includes(String(expectedValue).toLowerCase());
      case 'in': return Array.isArray(expectedValue) && expectedValue.includes(actualValue);
      case 'not_in': return Array.isArray(expectedValue) && !expectedValue.includes(actualValue);
      case 'greater_than': return Number(actualValue) > Number(expectedValue);
      case 'less_than': return Number(actualValue) < Number(expectedValue);
      default: return false;
    }
  };
  
  const ruleMatch = evaluateRule();
  const showMatch = simulationData && ruleMatch !== null;
  
  return (
    <Card 
      className={`cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${showMatch ? (ruleMatch ? 'bg-green-50' : 'bg-red-50') : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {rule.name}
            {showMatch && (
              ruleMatch ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant={rule.effect === 'allow' ? 'default' : 'destructive'}>
              {rule.effect.toUpperCase()}
            </Badge>
            <Badge variant="outline">
              Priority: {rule.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Subjects */}
          {subjects.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Subjects ({subjects.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {subjects.map(component => (
                  <ComponentVisualization
                    key={component.id}
                    component={component}
                    simulationData={simulationData}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Resources */}
          {resources.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Database className="h-4 w-4 mr-2" />
                Resources ({resources.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {resources.map(component => (
                  <ComponentVisualization
                    key={component.id}
                    component={component}
                    simulationData={simulationData}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Environment */}
          {environment.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Environment ({environment.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {environment.map(component => (
                  <ComponentVisualization
                    key={component.id}
                    component={component}
                    simulationData={simulationData}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Actions */}
          {actions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Actions ({actions.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {actions.map(component => (
                  <ComponentVisualization
                    key={component.id}
                    component={component}
                    simulationData={simulationData}
                  />
                ))}
              </div>
            </div>
          )}
          
          {rule.components.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No components in this rule</p>
            </div>
          )}
          
          {/* Rule Logic Flow */}
          {rule.components.length > 1 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Logic Flow</h4>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>All components must match</span>
                <Badge variant="outline" className="text-xs">AND</Badge>
                <span>for rule to {rule.effect}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Main component
export const PolicyFlowVisualization: React.FC<PolicyFlowVisualizationProps> = ({
  rules,
  selectedRule,
  onRuleSelect,
  simulationMode = false,
  simulationData
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Policy Flow Visualization</h3>
          <p className="text-muted-foreground">
            Visual representation of policy rules and their components
          </p>
        </div>
        {simulationMode && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-2">
              <Play className="h-3 w-3" />
              Simulation Mode
            </Badge>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Component Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span>Subject</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>Resource</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
              <span>Environment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
              <span>Action</span>
            </div>
            {simulationMode && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Matched</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Not Matched</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Rules */}
      <div className="space-y-4">
        {rules.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No policy rules to display</p>
                <p className="text-sm">Create a rule in the Policy Builder to see the visualization</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          rules
            .sort((a, b) => b.priority - a.priority)
            .map(rule => (
              <RuleVisualization
                key={rule.id}
                rule={rule}
                isSelected={selectedRule === rule.id}
                onClick={() => onRuleSelect?.(rule.id)}
                simulationData={simulationData}
              />
            ))
        )}
      </div>
      
      {/* Simulation Data */}
      {simulationMode && simulationData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Simulation Input</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Subject</h4>
                <div className="space-y-1">
                  {Object.entries(simulationData.subject).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-mono">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Resource</h4>
                <div className="space-y-1">
                  {Object.entries(simulationData.resource).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-mono">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Environment</h4>
                <div className="space-y-1">
                  {Object.entries(simulationData.environment).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span className="font-mono">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {simulationData.action.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium mb-2">Requested Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {simulationData.action.map(action => (
                    <Badge key={action} variant="outline">
                      {action}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PolicyFlowVisualization;

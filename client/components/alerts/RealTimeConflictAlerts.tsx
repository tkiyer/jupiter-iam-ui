import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Bell,
  BellRing,
  X,
  Volume2,
  VolumeX,
  Mail,
  MessageSquare,
  Phone,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Users,
  Key,
  FileText,
  Zap,
  Eye,
  MoreHorizontal,
  Filter,
  Pause,
  Play,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RealTimeConflictAlertsProps {
  isEnabled?: boolean;
  onSettingsChange?: (settings: AlertSettings) => void;
}

interface ConflictAlert {
  id: string;
  type: 'role_conflict' | 'permission_conflict' | 'policy_conflict' | 'validation_violation' | 'security_breach';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  source: string;
  timestamp: Date;
  status: 'new' | 'acknowledged' | 'resolved' | 'dismissed';
  entityIds: {
    users?: string[];
    roles?: string[];
    permissions?: string[];
    policies?: string[];
  };
  actions: QuickAction[];
  metadata: Record<string, any>;
  autoResolveTimer?: number;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
}

interface QuickAction {
  id: string;
  label: string;
  type: 'resolve' | 'acknowledge' | 'dismiss' | 'escalate' | 'investigate';
  icon: React.ReactNode;
  action: () => Promise<void>;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

interface AlertSettings {
  isEnabled: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  visualNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  slackNotifications: boolean;
  minimumSeverity: 'low' | 'medium' | 'high' | 'critical';
  autoAcknowledgeTimeout: number; // minutes
  maxDisplayedAlerts: number;
  notificationChannels: NotificationChannel[];
  alertFilters: AlertFilter[];
}

interface NotificationChannel {
  id: string;
  type: 'email' | 'sms' | 'slack' | 'webhook';
  name: string;
  config: Record<string, any>;
  isEnabled: boolean;
  severityThreshold: string;
}

interface AlertFilter {
  id: string;
  name: string;
  conditions: FilterCondition[];
  action: 'show' | 'hide' | 'escalate';
  isActive: boolean;
}

interface FilterCondition {
  field: 'type' | 'severity' | 'source' | 'entityType';
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in';
  value: any;
}

interface AlertsState {
  alerts: ConflictAlert[];
  settings: AlertSettings;
  isMonitoring: boolean;
  lastUpdate: Date;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  metrics: AlertMetrics;
}

interface AlertMetrics {
  totalAlerts: number;
  criticalAlerts: number;
  acknowledgedAlerts: number;
  resolvedAlerts: number;
  averageResolutionTime: number; // minutes
  alertsPerHour: number;
}

export const RealTimeConflictAlerts: React.FC<RealTimeConflictAlertsProps> = ({
  isEnabled = true,
  onSettingsChange,
}) => {
  const [alertsState, setAlertsState] = useState<AlertsState>({
    alerts: [],
    settings: {
      isEnabled: true,
      soundEnabled: true,
      soundVolume: 50,
      visualNotifications: true,
      emailNotifications: false,
      smsNotifications: false,
      slackNotifications: false,
      minimumSeverity: 'medium',
      autoAcknowledgeTimeout: 30,
      maxDisplayedAlerts: 50,
      notificationChannels: [],
      alertFilters: []
    },
    isMonitoring: false,
    lastUpdate: new Date(),
    connectionStatus: 'disconnected',
    metrics: {
      totalAlerts: 0,
      criticalAlerts: 0,
      acknowledgedAlerts: 0,
      resolvedAlerts: 0,
      averageResolutionTime: 0,
      alertsPerHour: 0
    }
  });

  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<ConflictAlert | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [showFloatingAlert, setShowFloatingAlert] = useState(false);
  const [latestCriticalAlert, setLatestCriticalAlert] = useState<ConflictAlert | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const alertSoundRef = useRef<HTMLAudioElement | null>(null);
  const alertTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    if (isEnabled && alertsState.settings.isEnabled) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [isEnabled, alertsState.settings.isEnabled]);

  useEffect(() => {
    // 初始化音频上下文
    if (typeof window !== 'undefined' && alertsState.settings.soundEnabled) {
      initializeAudio();
    }
  }, [alertsState.settings.soundEnabled]);

  useEffect(() => {
    // 检查是否有新的严重警报
    const latestAlert = alertsState.alerts
      .filter(alert => alert.severity === 'critical' && alert.status === 'new')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (latestAlert && latestAlert.id !== latestCriticalAlert?.id) {
      setLatestCriticalAlert(latestAlert);
      setShowFloatingAlert(true);
      playAlertSound('critical');
    }
  }, [alertsState.alerts, latestCriticalAlert]);

  const initializeAudio = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // 创建警报音效
      if (!alertSoundRef.current) {
        alertSoundRef.current = new Audio();
        alertSoundRef.current.volume = alertsState.settings.soundVolume / 100;
      }
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  };

  const playAlertSound = (severity: string) => {
    if (!alertsState.settings.soundEnabled || !alertSoundRef.current) return;

    try {
      // 根据严重程度播放不同的音效
      const frequencies = {
        critical: [800, 1200, 800, 1200],
        high: [600, 900, 600],
        medium: [500, 700],
        low: [400]
      };

      const freq = frequencies[severity as keyof typeof frequencies] || frequencies.medium;
      
      if (audioContextRef.current) {
        playBeepSequence(freq);
      }
    } catch (error) {
      console.error('Failed to play alert sound:', error);
    }
  };

  const playBeepSequence = (frequencies: number[]) => {
    if (!audioContextRef.current) return;

    const context = audioContextRef.current;
    let currentTime = context.currentTime;

    frequencies.forEach((freq, index) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(alertsState.settings.soundVolume / 100 * 0.3, currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.4);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.4);

      currentTime += 0.5;
    });
  };

  const startMonitoring = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      // 在实际应用中，这里应该连接到真实的WebSocket服务器
      // 这里使用模拟数据进行演示
      simulateRealTimeMonitoring();
      
      setAlertsState(prev => ({
        ...prev,
        isMonitoring: true,
        connectionStatus: 'connected'
      }));
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      setAlertsState(prev => ({
        ...prev,
        connectionStatus: 'disconnected'
      }));
    }
  };

  const stopMonitoring = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // 清除所有定时器
    alertTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    alertTimeoutsRef.current.clear();

    setAlertsState(prev => ({
      ...prev,
      isMonitoring: false,
      connectionStatus: 'disconnected'
    }));
  };

  const simulateRealTimeMonitoring = () => {
    // 模拟接收实时警报
    const simulationInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% 概率生成新警报
        const newAlert = generateMockAlert();
        addAlert(newAlert);
      }
    }, 10000); // 每10秒检查一次

    // 清理函数
    return () => clearInterval(simulationInterval);
  };

  const generateMockAlert = (): ConflictAlert => {
    const types = ['role_conflict', 'permission_conflict', 'policy_conflict', 'validation_violation', 'security_breach'];
    const severities = ['critical', 'high', 'medium', 'low'];
    const sources = ['Role Manager', 'Permission Engine', 'Policy Evaluator', 'Validation Rules', 'Security Monitor'];

    const type = types[Math.floor(Math.random() * types.length)] as ConflictAlert['type'];
    const severity = severities[Math.floor(Math.random() * severities.length)] as ConflictAlert['severity'];
    const source = sources[Math.floor(Math.random() * sources.length)];

    const alertTemplates = {
      role_conflict: {
        title: '角色冲突检测',
        message: '检测到用户同时拥有冲突的管理员和审计员角色',
      },
      permission_conflict: {
        title: '权限冲突警告',
        message: '发现权限配置中存在读写冲突',
      },
      policy_conflict: {
        title: '策略冲突',
        message: 'ABAC策略间存在allow/deny效果冲突',
      },
      validation_violation: {
        title: '验证规则违规',
        message: '检测到违反职责分离原则的角色分配',
      },
      security_breach: {
        title: '安全漏洞警报',
        message: '检测到潜在的权限提升攻击',
      }
    };

    const template = alertTemplates[type];

    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      title: template.title,
      message: template.message,
      source,
      timestamp: new Date(),
      status: 'new',
      entityIds: {
        users: type === 'security_breach' ? ['user_123'] : undefined,
        roles: type === 'role_conflict' ? ['admin', 'auditor'] : undefined,
        permissions: type === 'permission_conflict' ? ['read_sensitive', 'write_sensitive'] : undefined,
        policies: type === 'policy_conflict' ? ['policy_1', 'policy_2'] : undefined,
      },
      actions: generateQuickActions(type, severity),
      metadata: {
        detectionMethod: 'automated_scan',
        confidence: Math.random() * 0.3 + 0.7, // 70-100%
        riskScore: Math.floor(Math.random() * 50) + 50 // 50-100
      }
    };
  };

  const generateQuickActions = (type: ConflictAlert['type'], severity: ConflictAlert['severity']): QuickAction[] => {
    const baseActions: QuickAction[] = [
      {
        id: 'acknowledge',
        label: '确认',
        type: 'acknowledge',
        icon: <CheckCircle className="h-4 w-4" />,
        action: async () => {
          if (selectedAlert) {
            acknowledgeAlert(selectedAlert.id);
          }
        }
      },
      {
        id: 'investigate',
        label: '调查',
        type: 'investigate',
        icon: <Eye className="h-4 w-4" />,
        action: async () => {
          // 打开详细调查界面
          console.log('Opening investigation panel');
        }
      }
    ];

    if (severity === 'critical' || severity === 'high') {
      baseActions.push({
        id: 'escalate',
        label: '升级',
        type: 'escalate',
        icon: <AlertTriangle className="h-4 w-4" />,
        action: async () => {
          // 升级警报
          console.log('Escalating alert');
        },
        requiresConfirmation: true,
        confirmationMessage: '确定要升级此警报吗？这将通知安全团队。'
      });
    }

    if (type === 'role_conflict' || type === 'permission_conflict') {
      baseActions.push({
        id: 'auto_resolve',
        label: '自动解决',
        type: 'resolve',
        icon: <Zap className="h-4 w-4" />,
        action: async () => {
          // 尝试自动解决
          if (selectedAlert) {
            autoResolveAlert(selectedAlert.id);
          }
        },
        requiresConfirmation: true,
        confirmationMessage: '确定要自动解决此冲突吗？系统将调整权限配置。'
      });
    }

    return baseActions;
  };

  const addAlert = (alert: ConflictAlert) => {
    setAlertsState(prev => {
      const newAlerts = [alert, ...prev.alerts]
        .slice(0, prev.settings.maxDisplayedAlerts)
        .sort((a, b) => {
          // 严重程度排序
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
          if (severityDiff !== 0) return severityDiff;
          
          // 时间排序
          return b.timestamp.getTime() - a.timestamp.getTime();
        });

      // 设置自动确认定时器
      if (prev.settings.autoAcknowledgeTimeout > 0) {
        const timeout = setTimeout(() => {
          acknowledgeAlert(alert.id);
        }, prev.settings.autoAcknowledgeTimeout * 60 * 1000);
        
        alertTimeoutsRef.current.set(alert.id, timeout);
      }

      // 发送通知
      sendNotification(alert);

      // 更新指标
      const newMetrics = calculateMetrics(newAlerts);

      return {
        ...prev,
        alerts: newAlerts,
        lastUpdate: new Date(),
        metrics: newMetrics
      };
    });
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlertsState(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert =>
        alert.id === alertId
          ? {
              ...alert,
              status: 'acknowledged',
              acknowledgedBy: 'current_user',
              acknowledgedAt: new Date()
            }
          : alert
      )
    }));

    // 清除自动确认定时器
    const timeout = alertTimeoutsRef.current.get(alertId);
    if (timeout) {
      clearTimeout(timeout);
      alertTimeoutsRef.current.delete(alertId);
    }
  };

  const resolveAlert = (alertId: string, resolution?: string) => {
    setAlertsState(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert =>
        alert.id === alertId
          ? {
              ...alert,
              status: 'resolved',
              resolvedBy: 'current_user',
              resolvedAt: new Date(),
              metadata: {
                ...alert.metadata,
                resolution
              }
            }
          : alert
      )
    }));

    // 清除定时器
    const timeout = alertTimeoutsRef.current.get(alertId);
    if (timeout) {
      clearTimeout(timeout);
      alertTimeoutsRef.current.delete(alertId);
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlertsState(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert =>
        alert.id === alertId
          ? { ...alert, status: 'dismissed' }
          : alert
      )
    }));

    // 清除定时器
    const timeout = alertTimeoutsRef.current.get(alertId);
    if (timeout) {
      clearTimeout(timeout);
      alertTimeoutsRef.current.delete(alertId);
    }
  };

  const autoResolveAlert = async (alertId: string) => {
    try {
      // 模拟自动解决过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      resolveAlert(alertId, 'Automatically resolved by system');
    } catch (error) {
      console.error('Auto-resolve failed:', error);
    }
  };

  const sendNotification = async (alert: ConflictAlert) => {
    const { settings } = alertsState;

    // 检查严重程度阈值
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    if (severityLevels[alert.severity] < severityLevels[settings.minimumSeverity]) {
      return;
    }

    // 发送不同类型的通知
    if (settings.emailNotifications) {
      await sendEmailNotification(alert);
    }

    if (settings.smsNotifications && (alert.severity === 'critical' || alert.severity === 'high')) {
      await sendSMSNotification(alert);
    }

    if (settings.slackNotifications) {
      await sendSlackNotification(alert);
    }

    // 播放声音警报
    if (settings.soundEnabled) {
      playAlertSound(alert.severity);
    }
  };

  const sendEmailNotification = async (alert: ConflictAlert) => {
    // 模拟邮件发送
    console.log('Sending email notification for alert:', alert.title);
  };

  const sendSMSNotification = async (alert: ConflictAlert) => {
    // 模拟短信发送
    console.log('Sending SMS notification for alert:', alert.title);
  };

  const sendSlackNotification = async (alert: ConflictAlert) => {
    // 模拟Slack通知
    console.log('Sending Slack notification for alert:', alert.title);
  };

  const calculateMetrics = (alerts: ConflictAlert[]): AlertMetrics => {
    const total = alerts.length;
    const critical = alerts.filter(a => a.severity === 'critical').length;
    const acknowledged = alerts.filter(a => a.status === 'acknowledged').length;
    const resolved = alerts.filter(a => a.status === 'resolved').length;

    // 计算平均解决时间
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved' && a.resolvedAt);
    const avgResolutionTime = resolvedAlerts.length > 0
      ? resolvedAlerts.reduce((sum, alert) => {
          const duration = alert.resolvedAt!.getTime() - alert.timestamp.getTime();
          return sum + duration;
        }, 0) / resolvedAlerts.length / (1000 * 60) // 转换为分钟
      : 0;

    // 计算每小时警报数
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const recentAlerts = alerts.filter(a => a.timestamp > oneHourAgo);

    return {
      totalAlerts: total,
      criticalAlerts: critical,
      acknowledgedAlerts: acknowledged,
      resolvedAlerts: resolved,
      averageResolutionTime: Math.round(avgResolutionTime),
      alertsPerHour: recentAlerts.length
    };
  };

  const updateSettings = (newSettings: Partial<AlertSettings>) => {
    setAlertsState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));

    if (onSettingsChange) {
      onSettingsChange({ ...alertsState.settings, ...newSettings });
    }
  };

  const filteredAlerts = alertsState.alerts.filter(alert => {
    const severityMatch = filterSeverity === 'all' || alert.severity === filterSeverity;
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'active' && (alert.status === 'new' || alert.status === 'acknowledged')) ||
      (filterStatus === 'resolved' && alert.status === 'resolved') ||
      (filterStatus === 'dismissed' && alert.status === 'dismissed');
    
    return severityMatch && statusMatch;
  });

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'role_conflict':
        return <Users className="h-4 w-4" />;
      case 'permission_conflict':
        return <Key className="h-4 w-4" />;
      case 'policy_conflict':
        return <FileText className="h-4 w-4" />;
      case 'validation_violation':
        return <Shield className="h-4 w-4" />;
      case 'security_breach':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'disconnected':
        return 'text-red-600';
      case 'reconnecting':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-5 w-5" />
                实时冲突警告系统
                <Badge 
                  className={cn(
                    "ml-2",
                    alertsState.connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
                    alertsState.connectionStatus === 'disconnected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  )}
                >
                  {alertsState.connectionStatus === 'connected' ? '已连接' :
                   alertsState.connectionStatus === 'disconnected' ? '已断开' : '重连中'}
                </Badge>
              </CardTitle>
              <CardDescription>
                实时监控和响应系统安全冲突
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => alertsState.isMonitoring ? stopMonitoring() : startMonitoring()}
              >
                {alertsState.isMonitoring ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    暂停监控
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    开始监控
                  </>
                )}
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">快速设置</h4>
                    
                    <div className="flex items-center justify-between">
                      <Label>声音警报</Label>
                      <Switch
                        checked={alertsState.settings.soundEnabled}
                        onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>邮件通知</Label>
                      <Switch
                        checked={alertsState.settings.emailNotifications}
                        onCheckedChange={(checked) => updateSettings({ emailNotifications: checked })}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>最低严重程度</Label>
                      <Select
                        value={alertsState.settings.minimumSeverity}
                        onValueChange={(value) => updateSettings({ minimumSeverity: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">低</SelectItem>
                          <SelectItem value="medium">中</SelectItem>
                          <SelectItem value="high">高</SelectItem>
                          <SelectItem value="critical">严重</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={() => setIsSettingsDialogOpen(true)}
                    >
                      详细设置
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="alerts" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="alerts">
                实时警报
                {alertsState.alerts.filter(a => a.status === 'new').length > 0 && (
                  <Badge className="ml-1 bg-red-100 text-red-800">
                    {alertsState.alerts.filter(a => a.status === 'new').length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="metrics">监控指标</TabsTrigger>
              <TabsTrigger value="history">历史记录</TabsTrigger>
            </TabsList>

            <TabsContent value="alerts">
              <div className="space-y-4">
                {/* 状态栏 */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        alertsState.connectionStatus === 'connected' ? 'bg-green-500' :
                        alertsState.connectionStatus === 'disconnected' ? 'bg-red-500' :
                        'bg-yellow-500 animate-pulse'
                      )} />
                      <span className="text-sm">
                        监控状态: {alertsState.isMonitoring ? '运行中' : '已停止'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      最后更新: {alertsState.lastUpdate.toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有严重程度</SelectItem>
                        <SelectItem value="critical">严重</SelectItem>
                        <SelectItem value="high">高</SelectItem>
                        <SelectItem value="medium">中</SelectItem>
                        <SelectItem value="low">低</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有状态</SelectItem>
                        <SelectItem value="active">活跃</SelectItem>
                        <SelectItem value="resolved">已解决</SelectItem>
                        <SelectItem value="dismissed">已忽略</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 警报列表 */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredAlerts.map((alert) => (
                    <Card
                      key={alert.id}
                      className={cn(
                        "border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer",
                        alert.severity === 'critical' ? 'border-l-red-500 bg-red-50' :
                        alert.severity === 'high' ? 'border-l-orange-500 bg-orange-50' :
                        alert.severity === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
                        'border-l-blue-500 bg-blue-50',
                        alert.status === 'new' ? 'ring-2 ring-blue-200' : ''
                      )}
                      onClick={() => {
                        setSelectedAlert(alert);
                        setIsDetailDialogOpen(true);
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex items-center gap-2">
                              {getAlertTypeIcon(alert.type)}
                              <Badge className={getAlertSeverityColor(alert.severity)}>
                                {alert.severity}
                              </Badge>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{alert.title}</span>
                                {alert.status === 'new' && (
                                  <Badge variant="secondary" className="text-xs">新</Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2">
                                {alert.message}
                              </p>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>来源: {alert.source}</span>
                                <span>时间: {alert.timestamp.toLocaleTimeString()}</span>
                                {alert.metadata.confidence && (
                                  <span>置信度: {(alert.metadata.confidence * 100).toFixed(0)}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {alert.actions.slice(0, 2).map((action) => (
                              <Button
                                key={action.id}
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAlert(alert);
                                  if (action.requiresConfirmation) {
                                    if (confirm(action.confirmationMessage || '确定要执行此操作吗？')) {
                                      action.action();
                                    }
                                  } else {
                                    action.action();
                                  }
                                }}
                              >
                                {action.icon}
                              </Button>
                            ))}
                            
                            {alert.actions.length > 2 && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48">
                                  <div className="space-y-1">
                                    {alert.actions.slice(2).map((action) => (
                                      <Button
                                        key={action.id}
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start"
                                        onClick={() => {
                                          setSelectedAlert(alert);
                                          if (action.requiresConfirmation) {
                                            if (confirm(action.confirmationMessage || '确定要执行此操作吗？')) {
                                              action.action();
                                            }
                                          } else {
                                            action.action();
                                          }
                                        }}
                                      >
                                        {action.icon}
                                        <span className="ml-2">{action.label}</span>
                                      </Button>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredAlerts.length === 0 && (
                    <div className="text-center py-12">
                      <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        没有检测到冲突
                      </h3>
                      <p className="text-gray-500">
                        系统运行正常，所有安全规则都得到遵守
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metrics">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">总警报数</p>
                        <p className="text-2xl font-bold">{alertsState.metrics.totalAlerts}</p>
                      </div>
                      <Bell className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">严重警报</p>
                        <p className="text-2xl font-bold text-red-600">{alertsState.metrics.criticalAlerts}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">已解决</p>
                        <p className="text-2xl font-bold text-green-600">{alertsState.metrics.resolvedAlerts}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">平均解决时间</p>
                        <p className="text-2xl font-bold">{alertsState.metrics.averageResolutionTime}m</p>
                      </div>
                      <Clock className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">每小时警报</p>
                        <p className="text-2xl font-bold">{alertsState.metrics.alertsPerHour}</p>
                      </div>
                      <RotateCcw className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">系统状态</p>
                        <p className={cn(
                          "text-2xl font-bold",
                          getConnectionStatusColor(alertsState.connectionStatus)
                        )}>
                          {alertsState.connectionStatus === 'connected' ? '正常' :
                           alertsState.connectionStatus === 'disconnected' ? '离线' : '重连中'}
                        </p>
                      </div>
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        alertsState.connectionStatus === 'connected' ? 'bg-green-100' :
                        alertsState.connectionStatus === 'disconnected' ? 'bg-red-100' :
                        'bg-yellow-100'
                      )}>
                        <div className={cn(
                          "h-4 w-4 rounded-full",
                          alertsState.connectionStatus === 'connected' ? 'bg-green-500' :
                          alertsState.connectionStatus === 'disconnected' ? 'bg-red-500' :
                          'bg-yellow-500 animate-pulse'
                        )} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-3" />
                  <p>历史记录功能正在开发中</p>
                  <p className="text-sm">将显示过去30天的警报历史和趋势分析</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 警报详情对话框 */}
      {selectedAlert && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getAlertTypeIcon(selectedAlert.type)}
                {selectedAlert.title}
                <Badge className={getAlertSeverityColor(selectedAlert.severity)}>
                  {selectedAlert.severity}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                详细信息和解决操作
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">警报描述</h4>
                <p className="text-sm text-gray-600">{selectedAlert.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">基本信息</h4>
                  <div className="space-y-2 text-sm">
                    <div>来源: {selectedAlert.source}</div>
                    <div>时间: {selectedAlert.timestamp.toLocaleString()}</div>
                    <div>状态: {selectedAlert.status}</div>
                    {selectedAlert.metadata.confidence && (
                      <div>置信度: {(selectedAlert.metadata.confidence * 100).toFixed(0)}%</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">涉及实体</h4>
                  <div className="space-y-2 text-sm">
                    {selectedAlert.entityIds.users && (
                      <div>用户: {selectedAlert.entityIds.users.join(', ')}</div>
                    )}
                    {selectedAlert.entityIds.roles && (
                      <div>角色: {selectedAlert.entityIds.roles.join(', ')}</div>
                    )}
                    {selectedAlert.entityIds.permissions && (
                      <div>权限: {selectedAlert.entityIds.permissions.join(', ')}</div>
                    )}
                    {selectedAlert.entityIds.policies && (
                      <div>策略: {selectedAlert.entityIds.policies.join(', ')}</div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">可用操作</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAlert.actions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (action.requiresConfirmation) {
                          if (confirm(action.confirmationMessage || '确定要执行此操作吗？')) {
                            action.action();
                            setIsDetailDialogOpen(false);
                          }
                        } else {
                          action.action();
                          setIsDetailDialogOpen(false);
                        }
                      }}
                    >
                      {action.icon}
                      <span className="ml-1">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {selectedAlert.metadata.riskScore && (
                <div>
                  <h4 className="font-medium mb-2">风险评分</h4>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedAlert.metadata.riskScore} className="flex-1" />
                    <span className="text-sm font-medium">{selectedAlert.metadata.riskScore}/100</span>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 浮动严重警报 */}
      {showFloatingAlert && latestCriticalAlert && createPortal(
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <Card className="border-red-500 bg-red-50 shadow-lg animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">{latestCriticalAlert.title}</h4>
                    <p className="text-sm text-red-700 mt-1">{latestCriticalAlert.message}</p>
                    <p className="text-xs text-red-600 mt-2">
                      {latestCriticalAlert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFloatingAlert(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    acknowledgeAlert(latestCriticalAlert.id);
                    setShowFloatingAlert(false);
                  }}
                >
                  立即处理
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedAlert(latestCriticalAlert);
                    setIsDetailDialogOpen(true);
                    setShowFloatingAlert(false);
                  }}
                >
                  查看详情
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>,
        document.body
      )}

      {/* 设置对话框 */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>警报系统设置</DialogTitle>
            <DialogDescription>
              配置警报通知和监控参数
            </DialogDescription>
          </DialogHeader>
          
          <AlertSettingsForm
            settings={alertsState.settings}
            onSave={(newSettings) => {
              updateSettings(newSettings);
              setIsSettingsDialogOpen(false);
            }}
            onCancel={() => setIsSettingsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

// 警报设置表单组件
const AlertSettingsForm: React.FC<{
  settings: AlertSettings;
  onSave: (settings: AlertSettings) => void;
  onCancel: () => void;
}> = ({ settings, onSave, onCancel }) => {
  const [formData, setFormData] = useState<AlertSettings>(settings);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">常规设置</TabsTrigger>
          <TabsTrigger value="notifications">通知设置</TabsTrigger>
          <TabsTrigger value="filters">过滤规则</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>启用警报系统</Label>
              <p className="text-sm text-gray-500">启用或禁用��个警报系统</p>
            </div>
            <Switch
              checked={formData.isEnabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isEnabled: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label>最低严重程度</Label>
            <Select
              value={formData.minimumSeverity}
              onValueChange={(value) => setFormData(prev => ({ ...prev, minimumSeverity: value as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">低</SelectItem>
                <SelectItem value="medium">中</SelectItem>
                <SelectItem value="high">高</SelectItem>
                <SelectItem value="critical">严重</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>自动确认超时（分钟）</Label>
            <Input
              type="number"
              value={formData.autoAcknowledgeTimeout}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                autoAcknowledgeTimeout: parseInt(e.target.value) || 0 
              }))}
              min="0"
              max="1440"
            />
          </div>

          <div className="space-y-2">
            <Label>最大显示警报数</Label>
            <Input
              type="number"
              value={formData.maxDisplayedAlerts}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                maxDisplayedAlerts: parseInt(e.target.value) || 50 
              }))}
              min="10"
              max="500"
            />
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                声音警报
              </Label>
              <p className="text-sm text-gray-500">播放警报音效</p>
            </div>
            <Switch
              checked={formData.soundEnabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, soundEnabled: checked }))}
            />
          </div>

          {formData.soundEnabled && (
            <div className="space-y-2">
              <Label>音量</Label>
              <div className="flex items-center gap-2">
                <VolumeX className="h-4 w-4" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.soundVolume}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    soundVolume: parseInt(e.target.value) 
                  }))}
                  className="flex-1"
                />
                <Volume2 className="h-4 w-4" />
                <span className="text-sm w-8">{formData.soundVolume}%</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                邮件通知
              </Label>
              <p className="text-sm text-gray-500">发送邮件警报</p>
            </div>
            <Switch
              checked={formData.emailNotifications}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailNotifications: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                短信通知
              </Label>
              <p className="text-sm text-gray-500">发送短信警报（仅严重警报）</p>
            </div>
            <Switch
              checked={formData.smsNotifications}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, smsNotifications: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Slack通知
              </Label>
              <p className="text-sm text-gray-500">发送Slack消息</p>
            </div>
            <Switch
              checked={formData.slackNotifications}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, slackNotifications: checked }))}
            />
          </div>
        </TabsContent>

        <TabsContent value="filters" className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <Filter className="h-12 w-12 mx-auto mb-3" />
            <p>警报过滤规则</p>
            <p className="text-sm">配置��定义过滤条件和自动化规则</p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={() => onSave(formData)}>
          保存设置
        </Button>
      </div>
    </div>
  );
};

export default RealTimeConflictAlerts;

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Mail, Smartphone, Shield, AlertTriangle, Users, Activity, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

// Inline brand logos (minimal SVGs) for FeiShu (Lark), WeCom, DingTalk
const FeishuLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden>
    <defs>
      <linearGradient id="f1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2A5BFF" />
        <stop offset="100%" stopColor="#00C4FF" />
      </linearGradient>
    </defs>
    <path fill="url(#f1)" d="M24 4c11 0 20 9 20 20S35 44 24 44 4 35 4 24 13 4 24 4Z" />
    <path fill="#fff" d="M15 23h10l8-8v10l-8 8V23H15z" />
  </svg>
);
const WeComLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden>
    <circle cx="24" cy="24" r="20" fill="#2A5BFF" />
    <circle cx="17" cy="22" r="4" fill="#fff" />
    <circle cx="31" cy="22" r="4" fill="#fff" />
    <circle cx="24" cy="30" r="3" fill="#fff" />
  </svg>
);
const DingTalkLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 48 48" className={className} aria-hidden>
    <circle cx="24" cy="24" r="20" fill="#2CA7F8" />
    <path fill="#fff" d="M19 14l10 6-6 4 6 4-10 6 3-7-5-3 5-3-3-7z" />
  </svg>
);

type MessageTypeId = "inapp" | "email" | "sms" | "feishu" | "wecom" | "dingtalk" | "webhook";

type ChannelMeta = {
  id: MessageTypeId;
  name: string;
  color: string; // text color for accent
  bg: string; // subtle bg
  Logo: React.ComponentType<{ className?: string }>;
};

const CHANNELS: ChannelMeta[] = [
  { id: "inapp", name: "In‑app", color: "text-purple-600", bg: "bg-purple-50", Logo: Bell },
  { id: "email", name: "Email", color: "text-blue-600", bg: "bg-blue-50", Logo: Mail },
  { id: "sms", name: "SMS", color: "text-green-600", bg: "bg-green-50", Logo: Smartphone },
  { id: "feishu", name: "FeiShu", color: "text-sky-600", bg: "bg-sky-50", Logo: FeishuLogo },
  { id: "wecom", name: "Enterprise WeChat", color: "text-indigo-600", bg: "bg-indigo-50", Logo: WeComLogo },
  { id: "dingtalk", name: "DingTalk", color: "text-cyan-600", bg: "bg-cyan-50", Logo: DingTalkLogo },
  { id: "webhook", name: "WebHook", color: "text-gray-700", bg: "bg-gray-100", Logo: Globe },
];

// Config types per channel (simplified demo)
interface EmailConfig {
  fromAddress: string;
  senderName: string;
  smtpHost: string;
  smtpPort: string;
  encryption: "none" | "ssl_tls" | "starttls";
  username: string;
  password: string;
  authRequired: boolean;
}
interface SmsConfig { phone: string; provider: string; }
interface InappConfig { sound: boolean; desktop: boolean; }
interface FeishuConfig { webhook: string; secret?: string; }
interface WecomConfig { webhook: string; }
interface DingConfig { webhook: string; secret?: string; }
interface WebhookConfig { url: string; method: "POST" | "GET"; headers: string; }

type ChannelConfig = {
  inapp: InappConfig;
  email: EmailConfig;
  sms: SmsConfig;
  feishu: FeishuConfig;
  wecom: WecomConfig;
  dingtalk: DingConfig;
  webhook: WebhookConfig;
};

const Notifications: React.FC = () => {
  const [enabled, setEnabled] = useState<Record<MessageTypeId, boolean>>({
    inapp: true,
    email: true,
    sms: false,
    feishu: false,
    wecom: false,
    dingtalk: false,
    webhook: false,
  });

  const [config, setConfig] = useState<ChannelConfig>({
    inapp: { sound: true, desktop: true },
    email: {
      fromAddress: "no-reply@example.com",
      senderName: "IAM Console",
      smtpHost: "smtp.example.com",
      smtpPort: "587",
      encryption: "starttls",
      username: "",
      password: "",
      authRequired: true,
    },
    sms: { phone: "+1 (555) 123-4567", provider: "twilio" },
    feishu: { webhook: "" },
    wecom: { webhook: "" },
    dingtalk: { webhook: "" },
    webhook: { url: "", method: "POST", headers: "" },
  });

  const toggle = (id: MessageTypeId, value: boolean) => setEnabled((p) => ({ ...p, [id]: value }));

  return (
    <div className="space-y-6">
      {/* General Notifications with multi-channel selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <span>General Notifications</span>
          </CardTitle>
          <CardDescription>Configure delivery channels and defaults</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {CHANNELS.map(({ id, name, Logo, color, bg }) => (
              <div key={id} className={cn("rounded-lg border p-4", enabled[id] ? "ring-2 ring-blue-500" : "")}> 
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-9 w-9 rounded-md flex items-center justify-center", bg)}>
                      <Logo className={cn("h-5 w-5", color)} />
                    </div>
                    <div className="font-medium">{name}</div>
                  </div>
                  <Switch checked={enabled[id]} onCheckedChange={(v) => toggle(id, v)} />
                </div>

                {enabled[id] && (
                  <div className="mt-4 space-y-3">
                    <ChannelConfigForm id={id} config={config} onChange={setConfig} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>Security Notifications</span>
          </CardTitle>
          <CardDescription>Configure notifications for security-related events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Failed Login Attempts", desc: "Notify when multiple login failures occur" },
            { label: "Permission Changes", desc: "Notify when user permissions are modified" },
            { label: "Policy Violations", desc: "Notify when access policies are violated" },
            { label: "Suspicious Activity", desc: "Notify about unusual access patterns" },
            { label: "System Vulnerabilities", desc: "Notify about security vulnerabilities" },
          ].map((item, i) => (
            <div className="flex items-center justify-between" key={i}>
              <div className="space-y-0.5">
                <Label>{item.label}</Label>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <Switch defaultChecked={i < 4} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* System Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span>System Notifications</span>
          </CardTitle>
          <CardDescription>Configure notifications for system events and maintenance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "System Maintenance", desc: "Notify about scheduled maintenance windows", on: true },
            { label: "System Updates", desc: "Notify about system updates and patches", on: false },
            { label: "Performance Alerts", desc: "Notify about performance issues", on: false },
            { label: "Backup Status", desc: "Notify about backup success/failure", on: true },
          ].map((item, i) => (
            <div className="flex items-center justify-between" key={i}>
              <div className="space-y-0.5">
                <Label>{item.label}</Label>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.on} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* User Management Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>User Management Notifications</span>
          </CardTitle>
          <CardDescription>Configure notifications for user-related events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "New User Registration", desc: "Notify when new users register" },
            { label: "Role Assignments", desc: "Notify when user roles are assigned/removed" },
            { label: "Account Deactivation", desc: "Notify when user accounts are deactivated" },
            { label: "Access Requests", desc: "Notify about pending access requests" },
          ].map((item, i) => (
            <div className="flex items-center justify-between" key={i}>
              <div className="space-y-0.5">
                <Label>{item.label}</Label>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Advanced */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            <span>Advanced Settings</span>
          </CardTitle>
          <CardDescription>Advanced notification configuration and custom rules</CardDescription>
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
            <Label>Global Webhook (Optional)</Label>
            <Input placeholder="https://your-webhook-endpoint.com/notifications" />
          </div>

          <div className="space-y-3">
            <Label htmlFor="customRules">Custom Notification Rules</Label>
            <Textarea id="customRules" placeholder="Define custom notification rules using JSON format..." className="min-h-[100px]" />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline">Test Notifications</Button>
        <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
      </div>
    </div>
  );
};

function ChannelConfigForm({
  id,
  config,
  onChange,
}: {
  id: MessageTypeId;
  config: ChannelConfig;
  onChange: React.Dispatch<React.SetStateAction<ChannelConfig>>;
}) {
  if (id === "inapp") {
    const cfg = config.inapp;
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-between col-span-2">
          <div className="space-y-0.5">
            <Label>Desktop Notifications</Label>
            <p className="text-sm text-gray-500">Show native desktop alerts</p>
          </div>
          <Switch checked={cfg.desktop} onCheckedChange={(v) => onChange((p) => ({ ...p, inapp: { ...p.inapp, desktop: v } }))} />
        </div>
        <div className="flex items-center justify-between col-span-2">
          <div className="space-y-0.5">
            <Label>Sound</Label>
            <p className="text-sm text-gray-500">Play a sound for new messages</p>
          </div>
          <Switch checked={cfg.sound} onCheckedChange={(v) => onChange((p) => ({ ...p, inapp: { ...p.inapp, sound: v } }))} />
        </div>
      </div>
    );
  }

  if (id === "email") {
    const cfg = config.email;
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>From Address</Label>
          <Input value={cfg.fromAddress} onChange={(e) => onChange((p) => ({ ...p, email: { ...p.email, fromAddress: e.target.value } }))} placeholder="no-reply@example.com" />
        </div>
        <div className="space-y-2">
          <Label>Sender Name</Label>
          <Input value={cfg.senderName} onChange={(e) => onChange((p) => ({ ...p, email: { ...p.email, senderName: e.target.value } }))} placeholder="IAM Console" />
        </div>
        <div className="space-y-2">
          <Label>SMTP Host</Label>
          <Input value={cfg.smtpHost} onChange={(e) => onChange((p) => ({ ...p, email: { ...p.email, smtpHost: e.target.value } }))} placeholder="smtp.example.com" />
        </div>
        <div className="space-y-2">
          <Label>SMTP Port</Label>
          <Input value={cfg.smtpPort} onChange={(e) => onChange((p) => ({ ...p, email: { ...p.email, smtpPort: e.target.value } }))} placeholder="587" />
        </div>
        <div className="space-y-2">
          <Label>Encryption</Label>
          <Select value={cfg.encryption} onValueChange={(v: "none" | "ssl_tls" | "starttls") => onChange((p) => ({ ...p, email: { ...p.email, encryption: v } }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="ssl_tls">SSL/TLS</SelectItem>
              <SelectItem value="starttls">STARTTLS</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between col-span-2">
          <div className="space-y-0.5">
            <Label>Authentication required</Label>
            <p className="text-sm text-gray-500">Use username/password for SMTP</p>
          </div>
          <Switch checked={cfg.authRequired} onCheckedChange={(v) => onChange((p) => ({ ...p, email: { ...p.email, authRequired: v } }))} />
        </div>
        <div className="space-y-2">
          <Label>Username</Label>
          <Input disabled={!cfg.authRequired} value={cfg.username} onChange={(e) => onChange((p) => ({ ...p, email: { ...p.email, username: e.target.value } }))} placeholder="your-email@example.com" />
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" disabled={!cfg.authRequired} value={cfg.password} onChange={(e) => onChange((p) => ({ ...p, email: { ...p.email, password: e.target.value } }))} placeholder="••••••••" />
        </div>
      </div>
    );
  }

  if (id === "sms") {
    const cfg = config.sms;
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input value={cfg.phone} onChange={(e) => onChange((p) => ({ ...p, sms: { ...p.sms, phone: e.target.value } }))} placeholder="+1 (555) 123-4567" />
        </div>
        <div className="space-y-2">
          <Label>Provider</Label>
          <Select value={cfg.provider} onValueChange={(v) => onChange((p) => ({ ...p, sms: { ...p.sms, provider: v } }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="twilio">Twilio</SelectItem>
              <SelectItem value="aliyun">Aliyun</SelectItem>
              <SelectItem value="tencent">Tencent Cloud</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  if (id === "feishu") {
    const cfg = config.feishu;
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label>Webhook URL</Label>
          <Input value={cfg.webhook} onChange={(e) => onChange((p) => ({ ...p, feishu: { ...p.feishu, webhook: e.target.value } }))} placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..." />
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Signature Secret (optional)</Label>
          <Input value={cfg.secret || ""} onChange={(e) => onChange((p) => ({ ...p, feishu: { ...p.feishu, secret: e.target.value } }))} placeholder="Your signing secret" />
        </div>
      </div>
    );
  }

  if (id === "wecom") {
    const cfg = config.wecom;
    return (
      <div className="space-y-2">
        <Label>Webhook URL</Label>
        <Input value={cfg.webhook} onChange={(e) => onChange((p) => ({ ...p, wecom: { ...p.wecom, webhook: e.target.value } }))} placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=..." />
      </div>
    );
  }

  if (id === "dingtalk") {
    const cfg = config.dingtalk;
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label>Webhook URL</Label>
          <Input value={cfg.webhook} onChange={(e) => onChange((p) => ({ ...p, dingtalk: { ...p.dingtalk, webhook: e.target.value } }))} placeholder="https://oapi.dingtalk.com/robot/send?access_token=..." />
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Signature Secret (optional)</Label>
          <Input value={cfg.secret || ""} onChange={(e) => onChange((p) => ({ ...p, dingtalk: { ...p.dingtalk, secret: e.target.value } }))} placeholder="Your signing secret" />
        </div>
      </div>
    );
  }

  // webhook
  const cfg = config.webhook;
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2 col-span-2">
        <Label>Endpoint URL</Label>
        <Input value={cfg.url} onChange={(e) => onChange((p) => ({ ...p, webhook: { ...p.webhook, url: e.target.value } }))} placeholder="https://api.your-service.com/notify" />
      </div>
      <div className="space-y-2">
        <Label>Method</Label>
        <Select value={cfg.method} onValueChange={(v: "POST" | "GET") => onChange((p) => ({ ...p, webhook: { ...p.webhook, method: v } }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="GET">GET</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Headers (JSON)</Label>
        <Input value={cfg.headers} onChange={(e) => onChange((p) => ({ ...p, webhook: { ...p.webhook, headers: e.target.value } }))} placeholder='{"Authorization":"Bearer ..."}' />
      </div>
    </div>
  );
}

export default Notifications;

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Globe, Clock, Calendar, Languages } from "lucide-react";

const LanguageTimezone: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Languages className="h-5 w-5" />
            <span>Language Preferences</span>
          </CardTitle>
          <CardDescription>
            Configure your preferred language and regional settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Interface Language</Label>
            <Select defaultValue="en-US">
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English (United States)</SelectItem>
                <SelectItem value="en-GB">English (United Kingdom)</SelectItem>
                <SelectItem value="es-ES">Español (España)</SelectItem>
                <SelectItem value="es-MX">Español (México)</SelectItem>
                <SelectItem value="fr-FR">Français (France)</SelectItem>
                <SelectItem value="de-DE">Deutsch (Deutschland)</SelectItem>
                <SelectItem value="it-IT">Italiano (Italia)</SelectItem>
                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                <SelectItem value="ja-JP">日本語 (日本)</SelectItem>
                <SelectItem value="ko-KR">한국어 (대한민국)</SelectItem>
                <SelectItem value="zh-CN">中文 (简体)</SelectItem>
                <SelectItem value="zh-TW">中文 (繁體)</SelectItem>
                <SelectItem value="ru-RU">Русский (Россия)</SelectItem>
                <SelectItem value="ar-SA">العربية (السعودية)</SelectItem>
                <SelectItem value="hi-IN">हिन्दी (भारत)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Choose the language for the user interface and system messages
            </p>
          </div>

          <div className="space-y-3">
            <Label>Regional Format</Label>
            <Select defaultValue="US">
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="GB">United Kingdom</SelectItem>
                <SelectItem value="CA">Canada</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
                <SelectItem value="DE">Germany</SelectItem>
                <SelectItem value="FR">France</SelectItem>
                <SelectItem value="ES">Spain</SelectItem>
                <SelectItem value="IT">Italy</SelectItem>
                <SelectItem value="JP">Japan</SelectItem>
                <SelectItem value="CN">China</SelectItem>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="BR">Brazil</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Affects number formatting, currency display, and address formats
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-detect Language</Label>
              <p className="text-sm text-gray-500">Automatically detect language from browser settings</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Right-to-Left Text Support</Label>
              <p className="text-sm text-gray-500">Enable RTL layout for Arabic and Hebrew</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Timezone Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Timezone Settings</span>
          </CardTitle>
          <CardDescription>
            Configure timezone preferences for dates and times
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Primary Timezone</Label>
            <Select defaultValue="America/New_York">
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time (UTC-5)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (UTC-6)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (UTC-7)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (UTC-8)</SelectItem>
                <SelectItem value="UTC">Coordinated Universal Time (UTC)</SelectItem>
                <SelectItem value="Europe/London">Greenwich Mean Time (UTC+0)</SelectItem>
                <SelectItem value="Europe/Paris">Central European Time (UTC+1)</SelectItem>
                <SelectItem value="Europe/Istanbul">Turkey Time (UTC+3)</SelectItem>
                <SelectItem value="Asia/Dubai">Gulf Standard Time (UTC+4)</SelectItem>
                <SelectItem value="Asia/Kolkata">India Standard Time (UTC+5:30)</SelectItem>
                <SelectItem value="Asia/Shanghai">China Standard Time (UTC+8)</SelectItem>
                <SelectItem value="Asia/Tokyo">Japan Standard Time (UTC+9)</SelectItem>
                <SelectItem value="Australia/Sydney">Australian Eastern Time (UTC+10)</SelectItem>
                <SelectItem value="Pacific/Auckland">New Zealand Time (UTC+12)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Current time: <span className="font-medium">2024-01-15 14:30:22 EST</span>
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-detect Timezone</Label>
              <p className="text-sm text-gray-500">Automatically detect timezone from browser</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Daylight Saving Time</Label>
              <p className="text-sm text-gray-500">Automatically adjust for daylight saving time</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-3">
            <Label>Secondary Timezone (Optional)</Label>
            <Select defaultValue="none">
              <SelectTrigger>
                <SelectValue placeholder="Select secondary timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="UTC">Coordinated Universal Time (UTC)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (UTC-8)</SelectItem>
                <SelectItem value="Europe/London">Greenwich Mean Time (UTC+0)</SelectItem>
                <SelectItem value="Asia/Tokyo">Japan Standard Time (UTC+9)</SelectItem>
                <SelectItem value="Australia/Sydney">Australian Eastern Time (UTC+10)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Show an additional timezone in date/time displays
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time Format */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Date & Time Format</span>
          </CardTitle>
          <CardDescription>
            Customize how dates and times are displayed throughout the system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Date Format</Label>
            <RadioGroup defaultValue="MM/dd/yyyy" className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MM/dd/yyyy" id="date1" />
                <Label htmlFor="date1">MM/dd/yyyy (01/15/2024)</Label>
                <Badge variant="secondary">US Format</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dd/MM/yyyy" id="date2" />
                <Label htmlFor="date2">dd/MM/yyyy (15/01/2024)</Label>
                <Badge variant="secondary">EU Format</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yyyy-MM-dd" id="date3" />
                <Label htmlFor="date3">yyyy-MM-dd (2024-01-15)</Label>
                <Badge variant="secondary">ISO Format</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dd MMM yyyy" id="date4" />
                <Label htmlFor="date4">dd MMM yyyy (15 Jan 2024)</Label>
                <Badge variant="secondary">Readable</Badge>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Time Format</Label>
            <RadioGroup defaultValue="12h" className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="12h" id="time1" />
                <Label htmlFor="time1">12-hour format (2:30 PM)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="24h" id="time2" />
                <Label htmlFor="time2">24-hour format (14:30)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Week Start Day</Label>
            <Select defaultValue="sunday">
              <SelectTrigger>
                <SelectValue placeholder="Select first day of week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sunday">Sunday</SelectItem>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="saturday">Saturday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Relative Time</Label>
              <p className="text-sm text-gray-500">Display "2 hours ago" instead of exact timestamps</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Seconds</Label>
              <p className="text-sm text-gray-500">Include seconds in time displays</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Number & Currency Format */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Number & Currency Format</span>
          </CardTitle>
          <CardDescription>
            Configure number formatting and currency display preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Number Format</Label>
            <RadioGroup defaultValue="1,234.56" className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1,234.56" id="num1" />
                <Label htmlFor="num1">1,234.56 (US/UK)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1.234,56" id="num2" />
                <Label htmlFor="num2">1.234,56 (European)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1 234,56" id="num3" />
                <Label htmlFor="num3">1 234,56 (French)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1'234.56" id="num4" />
                <Label htmlFor="num4">1'234.56 (Swiss)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Currency</Label>
            <Select defaultValue="USD">
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">US Dollar ($)</SelectItem>
                <SelectItem value="EUR">Euro (€)</SelectItem>
                <SelectItem value="GBP">British Pound (£)</SelectItem>
                <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                <SelectItem value="CAD">Canadian Dollar (C$)</SelectItem>
                <SelectItem value="AUD">Australian Dollar (A$)</SelectItem>
                <SelectItem value="CHF">Swiss Franc (Fr)</SelectItem>
                <SelectItem value="CNY">Chinese Yuan (¥)</SelectItem>
                <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                <SelectItem value="BRL">Brazilian Real (R$)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Currency Display</Label>
            <RadioGroup defaultValue="symbol" className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="symbol" id="curr1" />
                <Label htmlFor="curr1">Symbol ($1,234.56)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="code" id="curr2" />
                <Label htmlFor="curr2">Code (USD 1,234.56)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="name" id="curr3" />
                <Label htmlFor="curr3">Name (1,234.56 US Dollars)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Decimal Places</Label>
            <Select defaultValue="2">
              <SelectTrigger>
                <SelectValue placeholder="Select decimal places" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0 (1,234)</SelectItem>
                <SelectItem value="2">2 (1,234.56)</SelectItem>
                <SelectItem value="3">3 (1,234.567)</SelectItem>
                <SelectItem value="4">4 (1,234.5678)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline">Reset to System Default</Button>
        <Button>Save Preferences</Button>
      </div>
    </div>
  );
};

export default LanguageTimezone;

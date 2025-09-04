import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Palette, Monitor, Sun, Moon, Eye, Layout } from "lucide-react";

const Appearance: React.FC = () => {
  const [fontSize, setFontSize] = React.useState([14]);
  const [sidebarWidth, setSidebarWidth] = React.useState([256]);

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Theme & Color</span>
          </CardTitle>
          <CardDescription>
            Choose your preferred theme and color scheme
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Theme Mode</Label>
            <RadioGroup defaultValue="system" className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                <RadioGroupItem value="light" id="light" />
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4" />
                  <Label htmlFor="light">Light</Label>
                </div>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                <RadioGroupItem value="dark" id="dark" />
                <div className="flex items-center space-x-2">
                  <Moon className="h-4 w-4" />
                  <Label htmlFor="dark">Dark</Label>
                </div>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50">
                <RadioGroupItem value="system" id="system" />
                <div className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4" />
                  <Label htmlFor="system">System</Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="colorScheme">Color Scheme</Label>
            <Select defaultValue="blue">
              <SelectTrigger>
                <SelectValue placeholder="Select color scheme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blue">Blue (Default)</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="orange">Orange</SelectItem>
                <SelectItem value="red">Red</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>High Contrast Mode</Label>
              <p className="text-sm text-gray-500">Increase contrast for better accessibility</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Layout Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Layout className="h-5 w-5" />
            <span>Layout & Display</span>
          </CardTitle>
          <CardDescription>
            Customize the layout and display preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Font Size: {fontSize[0]}px</Label>
            <Slider
              value={fontSize}
              onValueChange={setFontSize}
              min={12}
              max={20}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Small</span>
              <span>Medium</span>
              <span>Large</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Sidebar Width: {sidebarWidth[0]}px</Label>
            <Slider
              value={sidebarWidth}
              onValueChange={setSidebarWidth}
              min={200}
              max={320}
              step={8}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Narrow</span>
              <span>Default</span>
              <span>Wide</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <p className="text-sm text-gray-500">Reduce spacing and padding for more content</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Sidebar by Default</Label>
              <p className="text-sm text-gray-500">Keep sidebar open when navigating</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Accessibility</span>
          </CardTitle>
          <CardDescription>
            Settings to improve accessibility and usability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Reduce Motion</Label>
              <p className="text-sm text-gray-500">Minimize animations and transitions</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Focus Indicators</Label>
              <p className="text-sm text-gray-500">Enhanced focus outlines for keyboard navigation</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Screen Reader Support</Label>
              <p className="text-sm text-gray-500">Optimize for screen reader compatibility</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline">Reset to Default</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
};

export default Appearance;

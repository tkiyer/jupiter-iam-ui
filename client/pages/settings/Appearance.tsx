import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Palette,
  Monitor,
  Sun,
  Moon,
  Eye,
  Layout,
  Component,
  PanelsTopLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark" | "system";
type ColorScheme = "blue" | "green" | "purple" | "orange" | "red";

const COLOR_PRESETS: Record<
  ColorScheme,
  { primary: string; primaryText: string; subtle: string; ring: string }
> = {
  blue: {
    primary: "bg-blue-600",
    primaryText: "text-blue-600",
    subtle: "bg-blue-50",
    ring: "ring-blue-500",
  },
  green: {
    primary: "bg-green-600",
    primaryText: "text-green-600",
    subtle: "bg-green-50",
    ring: "ring-green-500",
  },
  purple: {
    primary: "bg-purple-600",
    primaryText: "text-purple-600",
    subtle: "bg-purple-50",
    ring: "ring-purple-500",
  },
  orange: {
    primary: "bg-orange-600",
    primaryText: "text-orange-600",
    subtle: "bg-orange-50",
    ring: "ring-orange-500",
  },
  red: {
    primary: "bg-red-600",
    primaryText: "text-red-600",
    subtle: "bg-red-50",
    ring: "ring-red-500",
  },
};

const Appearance: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState("theme");
  const [themeMode, setThemeMode] = React.useState<ThemeMode>("system");
  const [colorScheme, setColorScheme] = React.useState<ColorScheme>("blue");
  const [highContrast, setHighContrast] = React.useState(false);
  const [fontSize, setFontSize] = React.useState([14]);
  const [sidebarWidth, setSidebarWidth] = React.useState([256]);
  const [compactMode, setCompactMode] = React.useState(false);
  const [showSidebar, setShowSidebar] = React.useState(true);
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const [focusIndicators, setFocusIndicators] = React.useState(true);
  const [screenReader, setScreenReader] = React.useState(true);

  const scheme = COLOR_PRESETS[colorScheme];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="theme">Theme & Color</TabsTrigger>
          <TabsTrigger value="layout">Layout & Display</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
        </TabsList>

        {/* Theme & Color */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-blue-600" />
                <span>Theme & Color</span>
              </CardTitle>
              <CardDescription>
                Choose your preferred theme and color scheme
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Mode */}
              <div className="space-y-3">
                <Label>Theme Mode</Label>
                <RadioGroup
                  value={themeMode}
                  onValueChange={(v) => setThemeMode(v as ThemeMode)}
                  className="grid grid-cols-3 gap-4"
                >
                  <label
                    htmlFor="light"
                    className={cn(
                      "flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer",
                      themeMode === "light" && "ring-2 ring-blue-500",
                    )}
                  >
                    <RadioGroupItem value="light" id="light" />
                    <div className="flex items-center space-x-2">
                      <Sun className="h-4 w-4" />
                      <span>Light</span>
                    </div>
                  </label>
                  <label
                    htmlFor="dark"
                    className={cn(
                      "flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer",
                      themeMode === "dark" && "ring-2 ring-blue-500",
                    )}
                  >
                    <RadioGroupItem value="dark" id="dark" />
                    <div className="flex items-center space-x-2">
                      <Moon className="h-4 w-4" />
                      <span>Dark</span>
                    </div>
                  </label>
                  <label
                    htmlFor="system"
                    className={cn(
                      "flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer",
                      themeMode === "system" && "ring-2 ring-blue-500",
                    )}
                  >
                    <RadioGroupItem value="system" id="system" />
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4" />
                      <span>System</span>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {/* Color Scheme - visual swatches */}
              <div className="space-y-3">
                <Label>Color Scheme</Label>
                <div className="grid grid-cols-5 gap-3">
                  {(Object.keys(COLOR_PRESETS) as ColorScheme[]).map((key) => {
                    const preset = COLOR_PRESETS[key];
                    const selected = colorScheme === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setColorScheme(key)}
                        className={cn(
                          "group relative rounded-lg border p-2 text-left transition-colors",
                          selected
                            ? `ring-2 ${preset.ring} border-transparent`
                            : "hover:bg-gray-50",
                        )}
                        aria-pressed={selected}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={cn("h-6 w-6 rounded", preset.primary)}
                          />
                          <div className="flex items-center gap-1">
                            <span
                              className={cn("h-4 w-6 rounded", preset.subtle)}
                            />
                            <span className="h-4 w-6 rounded bg-gray-200" />
                          </div>
                        </div>
                        <div className="mt-2 text-xs font-medium capitalize">
                          {key}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>High Contrast Mode</Label>
                  <p className="text-sm text-gray-500">
                    Increase contrast for better accessibility
                  </p>
                </div>
                <Switch
                  checked={highContrast}
                  onCheckedChange={setHighContrast}
                />
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Component className="h-5 w-5 text-blue-600" />
                <span>Live Preview</span>
              </CardTitle>
              <CardDescription>
                Preview how the selected theme will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemePreview
                themeMode={themeMode}
                colorScheme={colorScheme}
                highContrast={highContrast}
                compact={compactMode}
                sidebarWidth={sidebarWidth[0]}
                focusIndicators={focusIndicators}
                reduceMotion={reduceMotion}
                showSidebar={showSidebar}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout & Display */}
        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Layout className="h-5 w-5 text-blue-600" />
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
                  <p className="text-sm text-gray-500">
                    Reduce spacing and padding for more content
                  </p>
                </div>
                <Switch
                  checked={compactMode}
                  onCheckedChange={setCompactMode}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Sidebar by Default</Label>
                  <p className="text-sm text-gray-500">
                    Keep sidebar open when navigating
                  </p>
                </div>
                <Switch
                  checked={showSidebar}
                  onCheckedChange={setShowSidebar}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accessibility */}
        <TabsContent value="accessibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-600" />
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
                  <p className="text-sm text-gray-500">
                    Minimize animations and transitions
                  </p>
                </div>
                <Switch
                  checked={reduceMotion}
                  onCheckedChange={setReduceMotion}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Focus Indicators</Label>
                  <p className="text-sm text-gray-500">
                    Enhanced focus outlines for keyboard navigation
                  </p>
                </div>
                <Switch
                  checked={focusIndicators}
                  onCheckedChange={setFocusIndicators}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Screen Reader Support</Label>
                  <p className="text-sm text-gray-500">
                    Optimize for screen reader compatibility
                  </p>
                </div>
                <Switch
                  checked={screenReader}
                  onCheckedChange={setScreenReader}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline">Reset to Default</Button>
        <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
      </div>
    </div>
  );
};

function ThemePreview(props: {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  highContrast: boolean;
  compact: boolean;
  sidebarWidth: number;
  focusIndicators: boolean;
  reduceMotion: boolean;
  showSidebar: boolean;
}) {
  const {
    themeMode,
    colorScheme,
    highContrast,
    compact,
    sidebarWidth,
    focusIndicators,
    reduceMotion,
    showSidebar,
  } = props;
  const preset = COLOR_PRESETS[colorScheme];
  const darkClass =
    themeMode === "dark" ? "dark" : themeMode === "system" ? "" : "";
  const spacing = compact ? "space-y-3 p-3" : "space-y-4 p-4";

  return (
    <div className={cn("rounded-lg border", darkClass)}>
      <div
        className={cn(
          "rounded-lg overflow-hidden border",
          highContrast ? "border-black" : "border-gray-200",
        )}
      >
        {/* Top bar */}
        <div
          className={cn(
            "h-10 flex items-center justify-between px-4",
            preset.primary,
          )}
        >
          <div className="flex items-center gap-2 text-white">
            <PanelsTopLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Console</span>
          </div>
          <div className="flex gap-2">
            <span className="h-5 w-5 rounded-full bg-white/80" />
            <span className="h-5 w-12 rounded bg-white/60" />
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          {showSidebar && (
            <div
              style={{ width: sidebarWidth }}
              className={cn(
                "shrink-0 border-r bg-gray-50 p-3",
                highContrast ? "border-black" : "border-gray-200",
                compact ? "space-y-2" : "space-y-3",
              )}
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 rounded bg-white border" />
              ))}
            </div>
          )}

          {/* Content */}
          <div className={cn("flex-1", spacing)}>
            <div
              className={cn(
                "rounded border bg-white",
                highContrast ? "border-black" : "border-gray-200",
              )}
            >
              <div
                className={cn(
                  "border-b px-4 py-2 flex items-center justify-between",
                  highContrast ? "border-black" : "border-gray-200",
                )}
              >
                <span className="text-sm font-medium">Overview</span>
                <span className={cn("text-xs", preset.primaryText)}>
                  Active
                </span>
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                <div className={cn("h-10 rounded", preset.subtle)} />
                <div className={cn("h-10 rounded", preset.subtle)} />
                <div className={cn("h-10 rounded", preset.subtle)} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-block h-3 w-3 rounded-full",
                    preset.primary,
                  )}
                />
                <span className="text-sm">Primary</span>
              </div>
              <Button className={cn("h-8 px-3 text-white", preset.primary)}>
                Action
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div
                className={cn(
                  "h-16 rounded border bg-white",
                  highContrast ? "border-black" : "border-gray-200",
                )}
              />
              <div
                className={cn(
                  "h-16 rounded border bg-white",
                  highContrast ? "border-black" : "border-gray-200",
                )}
              />
              <div
                className={cn(
                  "h-16 rounded border bg-white",
                  highContrast ? "border-black" : "border-gray-200",
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Focus indicator & Motion badges */}
      <div className="flex items-center gap-3 px-2 py-2 text-xs text-gray-500">
        <span>Focus: {focusIndicators ? "enhanced" : "default"}</span>
        <span>Motion: {reduceMotion ? "reduced" : "normal"}</span>
      </div>
    </div>
  );
}

export default Appearance;

# Reusable Sidebar Component

A flexible and reusable sidebar component that displays different menu content according to varying menu data and supports routing to corresponding functional module pages.

## Features

- **Flexible Menu Configuration**: Accepts custom menu items with icons, labels, badges, and disabled states
- **Role-Based Navigation**: Supports different menu configurations based on user roles
- **Responsive Design**: Mobile-friendly with overlay and slide-in behavior
- **Customizable**: Supports custom headers, footers, and styling
- **TypeScript Support**: Fully typed with proper interfaces
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## Components

### Main Components

- `Sidebar` - The main reusable sidebar component
- `DashboardLayout` - Updated to use the Sidebar component
- `ConsoleLayout` - Updated with optional sidebar support
- `FlexibleLayout` - Example layout showing various configurations

### Utilities

- `useSidebar` - Hook for managing sidebar state
- `menuConfig` - Predefined menu configurations and utilities

## Usage

### Basic Usage

```tsx
import Sidebar, { type SidebarMenuItem } from "@/components/layout/Sidebar";
import { useSidebar } from "@/hooks/useSidebar";

const menuItems: SidebarMenuItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/users", label: "Users", icon: Users },
  { path: "/settings", label: "Settings", icon: Settings },
];

const MyLayout = () => {
  const { isOpen, close } = useSidebar();

  return (
    <Sidebar
      menuItems={menuItems}
      user={user}
      isOpen={isOpen}
      onClose={close}
    />
  );
};
```

### Advanced Configuration

```tsx
<Sidebar
  menuItems={menuItems}
  user={user}
  isOpen={isOpen}
  onClose={close}
  showUserInfo={true}
  header={<CustomHeader />}
  footer={<CustomFooter />}
  className="custom-styles"
/>
```

### Menu Items with Badges and Disabled States

```tsx
const advancedMenuItems: SidebarMenuItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { path: "/notifications", label: "Notifications", icon: Bell, badge: "3" },
  { path: "/premium", label: "Premium Features", icon: Zap, disabled: true },
];
```

### Role-Based Menu Configuration

```tsx
import { getUserMenuItems } from "@/lib/menuConfig";

const menuItems = getUserMenuItems(user.roles);
```

## Interfaces

### SidebarMenuItem

```tsx
interface SidebarMenuItem {
  path: string; // Route path
  label: string; // Display text
  icon: LucideIcon; // Lucide React icon
  badge?: string; // Optional badge text
  disabled?: boolean; // Whether item is disabled
}
```

### SidebarUser

```tsx
interface SidebarUser {
  firstName: string;
  lastName: string;
  roles: string[];
  email?: string;
}
```

### SidebarProps

```tsx
interface SidebarProps {
  menuItems: SidebarMenuItem[]; // Menu items to display
  user?: SidebarUser | null; // User information
  isOpen: boolean; // Whether sidebar is open (mobile)
  onClose: () => void; // Close callback (mobile)
  className?: string; // Additional CSS classes
  showUserInfo?: boolean; // Show user info section
  header?: React.ReactNode; // Custom header content
  footer?: React.ReactNode; // Custom footer content
}
```

## Layout Integration

### DashboardLayout (Updated)

```tsx
<DashboardLayout
  menuItems={customMenuItems} // Optional custom menu
  showUserInfo={true} // Show user info
  sidebarHeader={<Header />} // Custom header
  sidebarFooter={<Footer />} // Custom footer
>
  <YourPageContent />
</DashboardLayout>
```

### ConsoleLayout (Updated)

```tsx
<ConsoleLayout
  showSidebar={true} // Enable sidebar
  menuItems={consoleMenuItems} // Custom menu for console
  showUserInfo={false} // Hide user info
>
  <YourConsoleContent />
</ConsoleLayout>
```

### FlexibleLayout (New)

```tsx
<FlexibleLayout
  menuItems={menuItems}
  showSidebar={true}
  showUserInfo={true}
  sidebarHeader={<CustomHeader />}
  sidebarFooter={<CustomFooter />}
  navbarContent={<CustomNavContent />}
>
  <YourContent />
</FlexibleLayout>
```

## Predefined Menu Configurations

The `menuConfig.ts` file provides several predefined configurations:

- `defaultDashboardMenuItems` - Standard dashboard navigation
- `consoleMenuItems` - Console-specific navigation
- `adminMenuItems` - Admin-only navigation items
- `getUserMenuItems(roles)` - Role-based menu filtering

## Utilities

### useSidebar Hook

```tsx
const { isOpen, open, close, toggle } = useSidebar(initialOpen);
```

### Menu Configuration Utilities

```tsx
// Create custom menu item
const customItem = createMenuItem("/path", "Label", Icon, { badge: "New" });

// Add badge to existing menu
const menuWithBadge = addBadgeToMenuItem(menuItems, "/notifications", "5");
```

## Styling and Theming

The sidebar uses Tailwind CSS classes and follows the project's design system:

- Uses CSS custom properties for colors (defined in `global.css`)
- Supports light/dark themes through CSS variables
- Responsive breakpoints: `lg:` prefix for desktop behavior
- Mobile-first design with transform animations

## Accessibility

- Proper ARIA labels for navigation
- Keyboard navigation support
- Screen reader friendly
- Focus management for mobile overlay
- Semantic HTML structure

## Examples

See `SidebarExample.tsx` for comprehensive usage examples including:

- Basic sidebar configuration
- Advanced features (badges, disabled items)
- Custom headers and footers
- Different styling approaches

## Migration Guide

### From Old DashboardLayout

Before:

```tsx
// Hard-coded navigation in DashboardLayout
const navigationItems = [...];
```

After:

```tsx
// Flexible menu configuration
import { getUserMenuItems } from '@/lib/menuConfig';
const menuItems = getUserMenuItems(user.roles);

<DashboardLayout menuItems={menuItems}>
```

### Adding New Menu Items

1. Define your menu items:

```tsx
const myMenuItems: SidebarMenuItem[] = [
  { path: "/my-page", label: "My Page", icon: MyIcon },
];
```

2. Use in any layout:

```tsx
<Sidebar menuItems={myMenuItems} ... />
```

## Best Practices

1. **Role-Based Menus**: Use `getUserMenuItems()` for role-based navigation
2. **Badge Usage**: Keep badge text short (1-2 characters or short words)
3. **Icon Consistency**: Use Lucide React icons for consistency
4. **Performance**: Memoize menu items if they're computed dynamically
5. **Accessibility**: Always provide meaningful labels for menu items

## Future Enhancements

- Nested menu support (submenus)
- Drag-and-drop menu reordering
- Menu item tooltips
- Search functionality within sidebar
- Collapsible sidebar (mini mode)

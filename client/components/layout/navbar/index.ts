// Navbar Components Barrel Export
export { default as ReusableNavbar } from "./ReusableNavbar";
export { default as NavbarUserMenu } from "./NavbarUserMenu";
export { default as NavbarSearch } from "./NavbarSearch";
export { default as NavbarLogo } from "./NavbarLogo";

// Re-export types for convenience
export type { NavbarUser } from "./NavbarUserMenu";

// Re-export navbar configuration
export {
  type NavbarConfig,
  type NavbarMenuItem,
  defaultNavbarConfig,
  consoleNavbarConfig,
  adminNavbarConfig,
  getNavbarConfig,
  filterMenuItemsByPermissions,
  createNavbarMenuItem,
} from "@/lib/navbarConfig";

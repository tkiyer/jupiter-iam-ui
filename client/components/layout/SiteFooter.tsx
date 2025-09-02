import React from "react";

const SiteFooter: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-8 border-t pt-6 text-sm text-muted-foreground">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="leading-none">
          © {year} Fusion Starter. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="whitespace-nowrap">
            Built with React · Vite · Tailwind
          </span>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;

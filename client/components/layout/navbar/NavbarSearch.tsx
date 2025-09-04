import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface NavbarSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

const NavbarSearch: React.FC<NavbarSearchProps> = ({
  placeholder = "Search...",
  onSearch,
  className = "w-80",
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      console.log("Search query:", searchQuery);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className={`${className} pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
      />
    </form>
  );
};

export default NavbarSearch;

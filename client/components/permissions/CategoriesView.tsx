import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Layers, Edit, Trash2, Shield } from "lucide-react";
import { PermissionCategory } from "@shared/iam";

interface CategoriesViewProps {
  categories: PermissionCategory[];
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      {/* Categories Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search categories by name or description..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create Category
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Layers className="mr-2 h-5 w-5" />
              Permission Categories ({filteredCategories.length})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <Layers className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No categories found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? "Try adjusting your search terms."
                  : "Create your first permission category to get started"}
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Category
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <Card
                  key={category.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className={`p-2 rounded-lg mr-3`}
                          style={{ backgroundColor: category.color + "20" }}
                        >
                          <Shield
                            className="h-5 w-5"
                            style={{ color: category.color }}
                          />
                        </div>
                        {category.name}
                      </div>
                      {!category.isSystemCategory && (
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Edit Category"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            title="Delete Category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {category.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Permissions</span>
                      <Badge variant="secondary">
                        {category.permissions.length}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.isSystemCategory && (
                        <Badge variant="outline" className="text-xs">
                          System Category
                        </Badge>
                      )}
                      {category.parentCategory && (
                        <Badge variant="outline" className="text-xs">
                          Subcategory
                        </Badge>
                      )}
                    </div>
                    {category.createdAt && (
                      <p className="text-xs text-gray-500">
                        Created:{" "}
                        {new Date(category.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

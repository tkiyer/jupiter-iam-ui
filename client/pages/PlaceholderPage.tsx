import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description: string;
  features?: string[];
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description, features = [] }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Construction className="h-10 w-10 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-lg">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-gray-600">
            This module is currently under development. Below are the planned features:
          </div>
          
          {features.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">Planned Features:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4">
            <p className="text-sm text-gray-500 mb-4">
              To continue developing this module, please provide more specific requirements in the chat.
            </p>
            <Link to="/dashboard">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceholderPage;

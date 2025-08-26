import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TestTube } from "lucide-react";

interface PolicyTestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  simulationRequest: any;
  setSimulationRequest: (request: any) => void;
  simulationResult: any;
  onRunTest: () => void;
}

export const PolicyTestDialog: React.FC<PolicyTestDialogProps> = ({
  isOpen,
  onOpenChange,
  simulationRequest,
  setSimulationRequest,
  simulationResult,
  onRunTest,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <TestTube className="mr-2 h-5 w-5" />
            Test Policy Evaluation
          </DialogTitle>
          <DialogDescription>
            Test how policies evaluate against specific scenarios
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
            <div className="text-center text-gray-500">
              <TestTube className="h-12 w-12 mx-auto mb-2" />
              <p>Policy testing interface would be displayed here</p>
              <p className="text-sm">
                Input forms for subject, resource, action, environment
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              onClick={onRunTest}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Run Test
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

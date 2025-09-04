import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Default redirect for console settings - redirects to basic information page
 */
const ConsoleSettingsIndex: React.FC = () => {
  return <Navigate to="/console/settings/basic-info" replace />;
};

export default ConsoleSettingsIndex;

import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Default redirect for settings - redirects to basic information page
 */
const SettingsIndex: React.FC = () => {
  return <Navigate to="/settings/appearance" replace />;
};

export default SettingsIndex;

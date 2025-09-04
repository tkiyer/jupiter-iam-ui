/**
 * Debug utilities for authentication troubleshooting
 */

export const debugAuthStatus = () => {
  const token = localStorage.getItem("authToken");
  console.log("🔍 Auth Debug Info:");
  console.log("- Token exists:", !!token);
  console.log(
    "- Token preview:",
    token ? `${token.substring(0, 20)}...` : "null",
  );
  console.log("- Current URL:", window.location.href);
  console.log("- User Agent:", navigator.userAgent);

  if (token) {
    console.log("- Token full length:", token.length);
    console.log(
      "- Token starts with mock:",
      token.startsWith("mock-jwt-token"),
    );
  }
};

export const testAuthEndpoint = async () => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    console.log("❌ No token found in localStorage");
    return;
  }

  console.log("🧪 Testing auth endpoint...");

  try {
    const response = await fetch("/api/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📡 Response status:", response.status);
    console.log("📡 Response ok:", response.ok);

    const data = await response.json();
    console.log("📦 Response data:", data);

    return data;
  } catch (error) {
    console.error("❌ Auth endpoint test failed:", error);
    return null;
  }
};

// Add to window for easy debugging in browser console
if (typeof window !== "undefined") {
  (window as any).debugAuth = {
    status: debugAuthStatus,
    test: testAuthEndpoint,
  };
}

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CircularProgress, Box } from "@mui/material";

function ProtectedRoute({ element }) {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to signin if not authenticated
  if (!isAuthenticated || user.role !== "admin")
    return <Navigate to="/" replace />;

  // Render the component if authenticated
  return element;
}

export default ProtectedRoute;

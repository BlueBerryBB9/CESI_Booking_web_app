import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { Login, Menu as MenuIcon, Logout } from "@mui/icons-material";
import SignIn from "./SignIn";
import Booking from "./Booking";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./Profile";

function App() {
  return (
    <BrowserRouter>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
        {/* Navbar Material-UI */}
        <Navbar />

        {/* Routes */}
        <Routes>
          {/*<Route path="/" element={<ProtectedRoute element={<Booking />} />} />*/}
          <Route path="/" element={<Booking />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}

// Navbar Material-UI avec menu mobile responsive
function Navbar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, loading } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate("/signin");
  };

  // Menu mobile (Drawer)
  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        {user ? (
          <>
            <ListItem disablePadding>
              <ListItemButton disabled>
                <ListItemIcon sx={{ color: "#667eea" }}>
                  <Login />
                </ListItemIcon>
                <ListItemText primary={`${user.nom || user.email}`} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon sx={{ color: "#667eea" }}>
                  <Logout />
                </ListItemIcon>
                <ListItemText primary="Déconnexion" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                navigate("/signin");
                handleDrawerToggle();
              }}
            >
              <ListItemIcon sx={{ color: "#667eea" }}>
                <Login />
              </ListItemIcon>
              <ListItemText primary="Connexion" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={2}
        sx={{
          bgcolor: "white",
          color: "text.primary",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            {/* Logo */}
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                fontWeight: 700,
                color: "#667eea",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                fontSize: { xs: "1.2rem", md: "1.5rem" },
                transition: "transform 0.3s",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              🏖️ VacancesApp
            </Typography>

            {/* Menu Desktop */}
            {!isMobile ? (
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                {loading ? (
                  <CircularProgress size={24} />
                ) : user ? (
                  <>
                    <Typography
                      variant="body2"
                      sx={{ color: "#667eea", fontWeight: 600 }}
                    >
                      {user.nom || user.email}
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Logout />}
                      onClick={handleLogout}
                      sx={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        textTransform: "none",
                        px: 3,
                        fontWeight: 600,
                        transition: "all 0.3s",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                          transform: "translateY(-2px)",
                          boxShadow: "0 5px 15px rgba(102, 126, 234, 0.4)",
                        },
                      }}
                    >
                      Déconnexion
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<Login />}
                    onClick={() => navigate("/signin")}
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      textTransform: "none",
                      px: 3,
                      fontWeight: 600,
                      transition: "all 0.3s",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 5px 15px rgba(102, 126, 234, 0.4)",
                      },
                    }}
                  >
                    Connexion
                  </Button>
                )}
              </Box>
            ) : (
              // Menu Mobile - Hamburger Icon
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
                sx={{ color: "#667eea" }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Drawer Mobile */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

// Page 404
function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 3,
        textAlign: "center",
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: "4rem", md: "6rem" },
          color: "#667eea",
          mb: 2,
          fontWeight: 700,
        }}
      >
        404
      </Typography>
      <Typography
        variant="h5"
        color="text.secondary"
        sx={{ mb: 3, fontSize: { xs: "1.2rem", md: "1.5rem" } }}
      >
        Page non trouvée
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate("/")}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          px: 4,
          py: 1.5,
          fontSize: "1rem",
          fontWeight: 600,
          "&:hover": {
            background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
            transform: "translateY(-2px)",
            boxShadow: "0 5px 15px rgba(102, 126, 234, 0.4)",
          },
        }}
      >
        Retour à l'accueil
      </Button>
    </Box>
  );
}

export default App;

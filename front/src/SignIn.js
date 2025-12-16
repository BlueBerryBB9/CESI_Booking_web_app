import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Link as MuiLink,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Login, PersonAdd } from "@mui/icons-material";

function SignIn() {
  const navigate = useNavigate();
  const [isSignIn, setIsSignIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear errors when user types
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (isSignIn) {
      // ========== CONNEXION ==========
      try {
        const response = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erreur de connexion");
        }

        // Stocker le token et les infos utilisateur
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setSuccess("Connexion réussie ! Redirection...");

        // Redirection après 1 seconde
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      // ========== INSCRIPTION ==========

      // Validation : vérifier que les mots de passe correspondent
      if (formData.password !== formData.confirmPassword) {
        setError("Les mots de passe ne correspondent pas");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nom: formData.username,
              email: formData.email,
              password: formData.password,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erreur d'inscription");
        }

        setSuccess(
          "Inscription réussie ! Vous pouvez maintenant vous connecter."
        );

        // Basculer automatiquement vers le mode connexion après 2 secondes
        setTimeout(() => {
          setIsSignIn(true);
          setFormData({
            email: formData.email, // Garder l'email
            password: "",
            confirmPassword: "",
            username: "",
          });
          setSuccess("");
        }, 2000);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleMode = () => {
    setIsSignIn(!isSignIn);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      username: "",
    });
    setError("");
    setSuccess("");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        <Card
          elevation={10}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              py: 3,
              textAlign: "center",
            }}
          >
            {isSignIn ? (
              <Login sx={{ fontSize: 50, mb: 1 }} />
            ) : (
              <PersonAdd sx={{ fontSize: 50, mb: 1 }} />
            )}
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {isSignIn ? "Connexion" : "Inscription"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
              {isSignIn
                ? "Bienvenue ! Connectez-vous à votre compte"
                : "Créez votre compte pour commencer"}
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            {/* Messages d'erreur et de succès */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                {!isSignIn && (
                  <TextField
                    fullWidth
                    label="Nom d'utilisateur"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    autoComplete="username"
                    disabled={loading}
                  />
                )}

                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  autoComplete="email"
                  disabled={loading}
                />

                <TextField
                  fullWidth
                  label="Mot de passe"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  disabled={loading}
                />

                {!isSignIn && (
                  <TextField
                    fullWidth
                    label="Confirmer le mot de passe"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 600,
                    mt: 1,
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 5px 20px rgba(102, 126, 234, 0.4)",
                    },
                    "&:disabled": {
                      background: "#ccc",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "white" }} />
                  ) : isSignIn ? (
                    "Se connecter"
                  ) : (
                    "S'inscrire"
                  )}
                </Button>
              </Box>
            </form>

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {isSignIn ? "Pas encore de compte ?" : "Déjà un compte ?"}
                <MuiLink
                  component="button"
                  type="button"
                  onClick={toggleMode}
                  disabled={loading}
                  sx={{
                    ml: 1,
                    color: "#667eea",
                    fontWeight: 600,
                    textDecoration: "underline",
                    cursor: "pointer",
                    border: "none",
                    background: "none",
                    fontSize: "inherit",
                    "&:hover": {
                      color: "#764ba2",
                    },
                    "&:disabled": {
                      color: "#ccc",
                      cursor: "not-allowed",
                    },
                  }}
                >
                  {isSignIn ? "S'inscrire" : "Se connecter"}
                </MuiLink>
              </Typography>
            </Box>

            {isSignIn && (
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <MuiLink
                  component="button"
                  type="button"
                  disabled={loading}
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.875rem",
                    textDecoration: "underline",
                    cursor: "pointer",
                    border: "none",
                    background: "none",
                    "&:hover": {
                      color: "#667eea",
                    },
                    "&:disabled": {
                      color: "#ccc",
                      cursor: "not-allowed",
                    },
                  }}
                >
                  Mot de passe oublié ?
                </MuiLink>
              </Box>
            )}
          </CardContent>
        </Card>

        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button
            variant="text"
            onClick={() => navigate("/")}
            disabled={loading}
            sx={{
              color: "white",
              textTransform: "none",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.1)",
              },
              "&:disabled": {
                color: "rgba(255, 255, 255, 0.5)",
              },
            }}
          >
            ← Retour à l'accueil
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default SignIn;

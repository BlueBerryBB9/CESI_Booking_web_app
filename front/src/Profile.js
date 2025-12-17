import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import { Edit, Delete, Save, Close } from "@mui/icons-material";
import { useAuth } from "./context/AuthContext";
import api from "./services/api";

function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const [formData, setFormData] = useState({
    nom: user?.nom || "",
    email: user?.email || "",
  });

  // Sync form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || "",
        email: user.email || "",
      });
    }
  }, [user?.id, user?.nom, user?.email]);

  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        setLoading(true);
        const response = await api.bookings.getByUserId(user.id);
        setBookings(response.data || []);
        setError(null);
      } catch (err) {
        setError(err.message || "Erreur lors du chargement des réservations");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserBookings();
    }
  }, [user?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await api.users.update(user.id, formData);
      setSuccess("Profil mis à jour avec succès");
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    try {
      setLoading(true);
      await api.bookings.delete(selectedBookingId);
      setBookings(bookings.filter((b) => b.id !== selectedBookingId));
      setSuccess("Réservation annulée avec succès");
      setOpenDeleteDialog(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Erreur lors de l'annulation");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: "success",
      pending: "warning",
      cancelled: "error",
    };
    return colors[status] || "default";
  };

  const getStatusLabel = (status) => {
    const labels = {
      confirmed: "Confirmée",
      pending: "En attente",
      cancelled: "Annulée",
    };
    return labels[status] || status;
  };

  if (!user) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Section Profil */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              mb: 3,
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                👤 Profil
              </Typography>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  {user.nom || user.email}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {user.email}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Box sx={{ display: "flex", gap: 1 }}>
                {!isEditing ? (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => setIsEditing(true)}
                    sx={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    Modifier profil
                  </Button>
                ) : (
                  <>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSaveProfile}
                      disabled={loading}
                      sx={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      }}
                    >
                      Enregistrer
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Close />}
                      onClick={() => setIsEditing(false)}
                    >
                      Annuler
                    </Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Formulaire édition profil */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Informations personnelles
              </Typography>

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

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing || loading}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Section Réservations */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
          📅 Mes réservations
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 4 }}>
              <Typography color="text.secondary">
                Vous n'avez pas encore de réservations
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/")}
                sx={{
                  mt: 2,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
              >
                Découvrir les offres
              </Button>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Offre</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date arrivée</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date départ</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Prix</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    hover
                    sx={{ "&:last-child td": { border: 0 } }}
                  >
                    <TableCell>{booking.offer?.titre || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(booking.date_arrivee).toLocaleDateString(
                        "fr-FR"
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(booking.date_depart).toLocaleDateString(
                        "fr-FR"
                      )}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {booking.prix_total}€
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(booking.statut)}
                        color={getStatusColor(booking.statut)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {booking.statut !== "cancelled" && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => {
                            setSelectedBookingId(booking.id);
                            setOpenDeleteDialog(true);
                          }}
                        >
                          Annuler
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Dialog confirmation annulation */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmer l'annulation</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir annuler cette réservation ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Retour</Button>
          <Button
            onClick={handleDeleteBooking}
            color="error"
            variant="contained"
            disabled={loading}
          >
            Annuler la réservation
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Profile;

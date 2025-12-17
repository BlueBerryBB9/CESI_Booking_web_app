import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  MenuItem,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { bookingsAPI, offersAPI } from "./services/api";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    price: "",
    type: "",
    "location.city": "",
    "location.country": "",
  });
  const [user, setUser] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bookingsData, offersData] = await Promise.all([
          bookingsAPI.getAll(),
          offersAPI.getAll(),
        ]);
        setBookings(bookingsData.data || []);
        setOffers(offersData.data || []);
        setError(null);
        // Get current user from localStorage or your auth service
        const userData = JSON.parse(localStorage.getItem("user")) || {};
        setUser(userData);
      } catch (err) {
        setError(err.message || "Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle dialog open for new offer
  const handleOpenDialog = (offer = null) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        titre: offer.titre,
        description: offer.description,
        price: offer.price,
        type: offer.type,
        "location.city": offer.location?.city || "",
        "location.country": offer.location?.country || "",
      });
    } else {
      setEditingOffer(null);
      setFormData({
        titre: "",
        description: "",
        price: "",
        type: "",
        "location.city": "",
        "location.country": "",
      });
    }
    setOpenDialog(true);
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingOffer(null);
  };

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle save offer
  const handleSaveOffer = async () => {
    try {
      const payload = {
        titre: formData.titre,
        description: formData.description,
        price: parseFloat(formData.price),
        type: formData.type,
        location: {
          city: formData["location.city"],
          country: formData["location.country"],
        },
        userId: user?.id
      };

      if (editingOffer) {
        await offersAPI.update(editingOffer._id, payload);
      } else {
        console.log("Editing Offer ?");
        await offersAPI.create(payload);
      }

      // Refresh offers
      const updatedOffers = await offersAPI.getAll();
      setOffers(updatedOffers.data || []);
      handleCloseDialog();
    } catch (err) {
      console.log(err);
      console.log(err.message);
      setError(err.message || "Erreur lors de la sauvegarde");
    }
  };

  // Handle delete offer
  const handleDeleteOffer = async (offerId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      try {
        await offersAPI.delete(offerId);
        setOffers(offers.filter((o) => o._id !== offerId));
      } catch (err) {
        setError(err.message || "Erreur lors de la suppression");
      }
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const stats = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
      topDestinations: {},
      bookingsByMonth: {},
      offerCount: offers.length,
    };

    // Calculate top destinations
    bookings.forEach((booking) => {
      if (booking.offerId?.location?.city) {
        const city = booking.offerId.location.city;
        stats.topDestinations[city] = (stats.topDestinations[city] || 0) + 1;
      }
    });

    // Calculate bookings by month
    bookings.forEach((booking) => {
      const date = new Date(booking.createdAt);
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
      stats.bookingsByMonth[monthKey] =
        (stats.bookingsByMonth[monthKey] || 0) + 1;
    });

    return stats;
  };

  const stats = calculateStats();
  const topDestinationsArray = Object.entries(stats.topDestinations)
    .map(([city, count]) => ({ city, bookings: count }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5);

  const bookingsByMonthArray = Object.entries(stats.bookingsByMonth).map(
    ([month, count]) => ({ month, reservations: count })
  );

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Tableau de Bord Administrateur
      </Typography>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="admin tabs"
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab
          label="Statistiques"
          id="admin-tab-0"
          aria-controls="admin-tabpanel-0"
        />
        <Tab
          label="Réservations"
          id="admin-tab-1"
          aria-controls="admin-tabpanel-1"
        />
        <Tab label="Offres" id="admin-tab-2" aria-controls="admin-tabpanel-2" />
      </Tabs>

      {/* Statistics Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Réservations
                </Typography>
                <Typography variant="h5">{stats.totalBookings}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Revenu Total
                </Typography>
                <Typography variant="h5">
                  ${stats.totalRevenue.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Offres
                </Typography>
                <Typography variant="h5">{stats.offerCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Moyenne Réservation
                </Typography>
                <Typography variant="h5">
                  $
                  {stats.totalBookings > 0
                    ? (stats.totalRevenue / stats.totalBookings).toFixed(2)
                    : 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Top Destinations Chart */}
          {topDestinationsArray.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Destinations
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topDestinationsArray}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="city" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="bookings" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Bookings by Month Chart */}
          {bookingsByMonthArray.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Réservations par Mois
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookingsByMonthArray}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="reservations" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      {/* Bookings Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Liste des Réservations
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell>
                      <strong>ID Réservation</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Utilisateur</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Offre</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Prix Total</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Statut</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Date</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell>{booking._id.substring(0, 8)}...</TableCell>
                      <TableCell>{booking.userId?.nom || "N/A"}</TableCell>
                      <TableCell>{booking.offerId?.titre || "N/A"}</TableCell>
                      <TableCell>
                        ${booking.totalPrice?.toFixed(2) || 0}
                      </TableCell>
                      <TableCell>
                        <Typography
                          component="span"
                          sx={{
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            backgroundColor:
                              booking.status === "confirmed"
                                ? "#c8e6c9"
                                : "#fff9c4",
                            color:
                              booking.status === "confirmed"
                                ? "#2e7d32"
                                : "#f57f17",
                          }}
                        >
                          {booking.status || "Pending"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {bookings.length === 0 && (
              <Typography sx={{ py: 2 }} color="textSecondary">
                Aucune réservation
              </Typography>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Offers Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Nouvelle Offre
          </Button>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Gestion des Offres
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell>
                      <strong>Titre</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Type</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Localisation</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Prix</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Actions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {offers.map((offer) => (
                    <TableRow key={offer._id}>
                      <TableCell>{offer.title}</TableCell>
                      <TableCell>{offer.type}</TableCell>
                      <TableCell>
                        {offer.location?.city}, {offer.location?.country}
                      </TableCell>
                      <TableCell>${offer.price?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleOpenDialog(offer)}
                          sx={{ mr: 1 }}
                        >
                          Éditer
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteOffer(offer._id)}
                        >
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {offers.length === 0 && (
              <Typography sx={{ py: 2 }} color="textSecondary">
                Aucune offre
              </Typography>
            )}
          </CardContent>
        </Card>
      </TabPanel>

      {/* Add/Edit Offer Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingOffer ? "Modifier l'offre" : "Créer une nouvelle offre"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Titre"
            name="titre"
            value={formData.titre}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            select
            label="Type"
            name="type"
            value={formData.type}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Sélectionner un type</MenuItem>
            <MenuItem value="activity">Activity</MenuItem>
            <MenuItem value="place">Place</MenuItem>
            <MenuItem value="transportation">Transportation</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Prix"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Ville"
            name="location.city"
            value={formData["location.city"]}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Pays"
            name="location.country"
            value={formData["location.country"]}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSaveOffer} variant="contained" color="primary">
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminDashboard;

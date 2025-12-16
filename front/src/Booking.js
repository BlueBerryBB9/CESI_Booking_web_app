import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Chip,
  Paper,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Hotel,
  LocalActivity,
  Flight,
  Search,
  Close,
  CreditCard,
  LocationOn,
  Star,
} from "@mui/icons-material";

function Booking() {
  const [searchType, setSearchType] = useState(0); // 0: hebergement, 1: activite, 2: transport
  const [searchParams, setSearchParams] = useState({
    destination: "",
    dateDebut: "",
    dateFin: "",
    personnes: 1,
    budget: "",
  });
  const [results, setResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [reservationData, setReservationData] = useState({
    nom: "",
    email: "",
    telephone: "",
    commentaires: "",
  });

  const searchTypes = ["hebergement", "activite", "transport"];

  // TODO: Appel API pour rechercher selon le type (hébergement, activité, transport)
  const handleSearch = async (e) => {
    e.preventDefault();

    console.log("Recherche:", {
      type: searchTypes[searchType],
      ...searchParams,
    });

    // Simulation temporaire pour l'UI
    setResults([
      {
        id: 1,
        nom: "Villa Paradisiaque",
        prix: 150,
        disponible: true,
        rating: 4.8,
      },
      {
        id: 2,
        nom: "Appartement Vue Mer",
        prix: 95,
        disponible: true,
        rating: 4.5,
      },
      {
        id: 3,
        nom: "Hôtel de Luxe",
        prix: 220,
        disponible: true,
        rating: 4.9,
      },
    ]);
  };

  // TODO: Appel API pour récupérer les détails complets d'un item GET
  const handleItemClick = async (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  // TODO: Appel API pour créer une réservation POST
  const handleReservation = async (e) => {
    e.preventDefault();
    setShowModal(false);
    setShowPaymentModal(true);
  };

  // TODO: Appel API pour traiter le paiement (simulation)
  const handlePayment = async (e) => {
    e.preventDefault();

    alert("Paiement simulé réussi ! Votre réservation est confirmée.");
    setShowPaymentModal(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedItem(null);
    setReservationData({
      nom: "",
      email: "",
      telephone: "",
      commentaires: "",
    });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 8,
          textAlign: "center",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            🏖️ Réservez vos Vacances
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.9 }}>
            Hébergements, activités et transports au meilleur prix
          </Typography>
        </Container>
      </Box>

      {/* Formulaire de recherche */}
      <Container maxWidth="lg" sx={{ mt: -6, position: "relative", zIndex: 10 }}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Tabs
            value={searchType}
            onChange={(e, newValue) => setSearchType(newValue)}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab icon={<Hotel />} label="Hébergements" />
            <Tab icon={<LocalActivity />} label="Activités" />
            <Tab icon={<Flight />} label="Transports" />
          </Tabs>

          <form onSubmit={handleSearch}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6} lg={2.4}>
                <TextField
                  fullWidth
                  label="Destination"
                  value={searchParams.destination}
                  onChange={(e) =>
                    setSearchParams({
                      ...searchParams,
                      destination: e.target.value,
                    })
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3} lg={2.4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date début"
                  value={searchParams.dateDebut}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, dateDebut: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3} lg={2.4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date fin"
                  value={searchParams.dateFin}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, dateFin: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3} lg={2.4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Personnes"
                  value={searchParams.personnes}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, personnes: e.target.value })
                  }
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3} lg={2.4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Budget max (€)"
                  value={searchParams.budget}
                  onChange={(e) =>
                    setSearchParams({ ...searchParams, budget: e.target.value })
                  }
                />
              </Grid>

              <Grid item xs={12} lg={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<Search />}
                  sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    py: 1.5,
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 5px 20px rgba(102, 126, 234, 0.4)",
                    },
                  }}
                >
                  Rechercher
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>

      {/* Résultats de recherche */}
      {results.length > 0 && (
        <Container maxWidth="lg" sx={{ my: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Résultats disponibles
          </Typography>

          <Grid container spacing={3}>
            {results.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-10px)",
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => handleItemClick(item)}
                >
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image="https://via.placeholder.com/300x200"
                      alt={item.nom}
                    />
                    {item.disponible && (
                      <Chip
                        label="Disponible"
                        color="success"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Box>

                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {item.nom || "Nom à charger depuis DB"}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Star sx={{ color: "#ffc107", fontSize: 18, mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {item.rating || "4.5"} / 5
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      Description à charger depuis MongoDB...
                    </Typography>
                  </CardContent>

                  <Divider />

                  <CardActions sx={{ justifyContent: "space-between", px: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{ color: "#667eea", fontWeight: 700 }}
                    >
                      {item.prix || "€€€"} €/nuit
                    </Typography>
                    <Button size="small" sx={{ color: "#667eea" }}>
                      Voir détails →
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      )}

      {/* Modal détails */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <IconButton
            onClick={() => setShowModal(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box
            component="img"
            src="https://via.placeholder.com/600x400"
            alt={selectedItem?.nom}
            sx={{
              width: "100%",
              height: 400,
              objectFit: "cover",
              borderRadius: 2,
              mb: 3,
            }}
          />

          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            {selectedItem?.nom || "Nom à charger"}
          </Typography>

          <Typography
            variant="h5"
            sx={{ color: "#667eea", fontWeight: 700, mb: 3 }}
          >
            {selectedItem?.prix || "€€€"} € par nuit
          </Typography>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              📋 Description
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Description complète à charger depuis MongoDB...
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              ✨ Équipements
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body1" color="text.secondary">
                À charger depuis MongoDB
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              <LocationOn sx={{ verticalAlign: "middle", mr: 0.5 }} />
              Localisation
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Adresse à charger depuis MongoDB
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ bgcolor: "#f5f7fa", p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Réserver maintenant
            </Typography>

            <form onSubmit={handleReservation}>
              <TextField
                fullWidth
                label="Nom complet"
                value={reservationData.nom}
                onChange={(e) =>
                  setReservationData({
                    ...reservationData,
                    nom: e.target.value,
                  })
                }
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                type="email"
                label="Email"
                value={reservationData.email}
                onChange={(e) =>
                  setReservationData({
                    ...reservationData,
                    email: e.target.value,
                  })
                }
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                type="tel"
                label="Téléphone"
                value={reservationData.telephone}
                onChange={(e) =>
                  setReservationData({
                    ...reservationData,
                    telephone: e.target.value,
                  })
                }
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Commentaires (optionnel)"
                value={reservationData.commentaires}
                onChange={(e) =>
                  setReservationData({
                    ...reservationData,
                    commentaires: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  "&:hover": {
                    background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                  },
                }}
              >
                Procéder au paiement →
              </Button>
            </form>
          </Paper>
        </DialogContent>
      </Dialog>

      {/* Modal paiement */}
      <Dialog
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
          <IconButton
            onClick={() => setShowPaymentModal(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
          <CreditCard sx={{ fontSize: 40, color: "#667eea", mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Paiement sécurisé
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Paper elevation={0} sx={{ bgcolor: "#f5f7fa", p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Récapitulatif
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>{selectedItem?.nom || "Item"}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Du {searchParams.dateDebut} au {searchParams.dateFin}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h5" sx={{ color: "#667eea", fontWeight: 700 }}>
              Total: {selectedItem?.prix || "€€€"} €
            </Typography>
          </Paper>

          <form onSubmit={handlePayment}>
            <TextField
              fullWidth
              label="Numéro de carte"
              placeholder="1234 5678 9012 3456"
              inputProps={{ maxLength: 16, pattern: "[0-9]{16}" }}
              required
              sx={{ mb: 2 }}
            />

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="Date d'expiration"
                  placeholder="MM/AA"
                  inputProps={{ maxLength: 5, pattern: "[0-9]{2}/[0-9]{2}" }}
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="CVV"
                  placeholder="123"
                  inputProps={{ maxLength: 3, pattern: "[0-9]{3}" }}
                  required
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Nom sur la carte"
              required
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              sx={{
                bgcolor: "#4caf50",
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "#45a049",
                  transform: "translateY(-2px)",
                  boxShadow: "0 5px 20px rgba(76, 175, 80, 0.4)",
                },
              }}
            >
              Confirmer le paiement
            </Button>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", textAlign: "center", mt: 2 }}
            >
              🔒 Paiement sécurisé - Simulation uniquement
            </Typography>
          </form>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default Booking;
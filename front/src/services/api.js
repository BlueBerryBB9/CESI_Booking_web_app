// API Service - Centralized API calls for the booking app
// Base URL for the backend API
const API_BASE_URL = "http://localhost:8080";

// Helper function to handle API errors
const handleResponse = async (response) => {
  const data = await response.json();
  console.log(data);

  if (!response.ok) {
    throw new Error(data.error || data.message || "Une erreur est survenue");
  }

  return data;
};

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Helper function to build headers with auth token
const getHeaders = (includeAuth = false) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

// ========================
// AUTH API
// ========================
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    console.log("Registering user:", userData);
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    const result = await handleResponse(response);
    console.log("Registration response:", result);
    return result;
  },

  // Login user
  login: async (credentials) => {
    console.log("Logging in user:", credentials);
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    const result = await handleResponse(response);
    console.log("Login response:", result);
    return result;
  },

  // Get current user profile
  getProfile: async () => {
    console.log("Fetching user profile");
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: getHeaders(true),
    });
    const result = await handleResponse(response);
    console.log("Profile response:", result);
    return result;
  },

  profile: async (credentials) => {
    console.log("Logging in user:", credentials);
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    const result = await handleResponse(response);
    console.log("Login response:", result);
    return result;
  },
};

// ========================
// USERS API
// ========================
export const usersAPI = {
  // Get all users
  getAll: async () => {
    console.log("Fetching all users");
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "GET",
      headers: getHeaders(true),
    });
    const result = await handleResponse(response);
    console.log("Users response:", result);
    return result;
  },

  // Get a single user by ID
  getById: async (userId) => {
    console.log("Fetching user by ID:", userId);
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "GET",
      headers: getHeaders(true),
    });
    const result = await handleResponse(response);
    console.log("User response:", result);
    return result;
  },

  // Update a user
  update: async (userId, userData) => {
    console.log("Updating user:", userId, userData);
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(userData),
    });
    const result = await handleResponse(response);
    console.log("User update response:", result);
    return result;
  },

  // Delete a user
  delete: async (userId) => {
    console.log("Deleting user:", userId);
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: getHeaders(true),
    });
    const result = await handleResponse(response);
    console.log("User deletion response:", result);
    return result;
  },
};

// ========================
// OFFERS API
// ========================
export const offersAPI = {
  // Get all offers with optional filters
  getAll: async (filters = {}) => {
    console.log("Fetching all offers with filters:", filters);
    const queryParams = new URLSearchParams();

    if (filters.city) queryParams.append("city", filters.city);
    if (filters.type) queryParams.append("type", filters.type);

    const url = `${API_BASE_URL}/offers${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    console.log("Offers response:", result);
    return result;
  },

  // Get a single offer by ID
  getById: async (offerId) => {
    console.log("Fetching offer by ID:", offerId);
    const response = await fetch(`${API_BASE_URL}/offers/${offerId}`, {
      method: "GET",
      headers: getHeaders(),
    });
    const result = await handleResponse(response);
    console.log("Offer response:", result);
    return result;
  },

  // Create a new offer
  create: async (offerData) => {
    console.log("Creating offer:", offerData);
    const response = await fetch(`${API_BASE_URL}/offers`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(offerData),
    });
    const result = await handleResponse(response);
    console.log("Offer creation response:", result);
    return result;
  },

  // Update an existing offer
  update: async (offerId, offerData) => {
    console.log("Updating offer:", offerId, offerData);
    const response = await fetch(`${API_BASE_URL}/offers/${offerId}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(offerData),
    });
    const result = await handleResponse(response);
    console.log("Offer update response:", result);
    return result;
  },

  // Delete an offer
  delete: async (offerId) => {
    console.log("Deleting offer:", offerId);
    const response = await fetch(`${API_BASE_URL}/offers/${offerId}`, {
      method: "DELETE",
      headers: getHeaders(true),
    });
    const result = await handleResponse(response);
    console.log("Offer deletion response:", result);
    return result;
  },
};

// ========================
// BOOKINGS API
// ========================
export const bookingsAPI = {
  // Get all bookings
  getAll: async () => {
    console.log("Fetching all bookings");
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: "GET",
      headers: getHeaders(true),
    });
    const result = await handleResponse(response);
    console.log("Bookings response:", result);
    return result;
  },

  // Get a single booking by ID
  getById: async (bookingId) => {
    console.log("Fetching booking by ID:", bookingId);
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: "GET",
      headers: getHeaders(true),
    });
    const result = await handleResponse(response);
    console.log("Booking response:", result);
    return result;
  },

  // Get bookings for a specific user
  getByUserId: async (userId) => {
    console.log("Fetching bookings for user ID:", userId);
    const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}`, {
      method: "GET",
      headers: getHeaders(true),
    });
    const result = await handleResponse(response);
    console.log("User bookings response:", result);
    return result;
  },

  // Create a new booking
  create: async (bookingData) => {
    console.log("Creating booking:", bookingData);
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(bookingData),
    });
    const result = await handleResponse(response);
    console.log("Booking creation response:", result);
    return result;
  },

  // Update an existing booking
  update: async (bookingId, bookingData) => {
    console.log("Updating booking:", bookingId, bookingData);
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(bookingData),
    });
    const result = await handleResponse(response);
    console.log("Booking update response:", result);
    return result;
  },

  // Delete a booking
  delete: async (bookingId) => {
    console.log("Deleting booking:", bookingId);
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: "DELETE",
      headers: getHeaders(true),
    });
    const result = await handleResponse(response);
    console.log("Booking deletion response:", result);
    return result;
  },
};

// Export a default object with all APIs
const api = {
  auth: authAPI,
  users: usersAPI,
  offers: offersAPI,
  bookings: bookingsAPI,
};

export default api;

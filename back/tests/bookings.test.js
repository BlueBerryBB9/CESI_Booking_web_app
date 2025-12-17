const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const { Booking } = require('../models/booking');
const { Offer } = require('../models/offer');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

describe('Bookings Routes', () => {
  let userToken;
  let adminToken;
  let userId;
  let adminId;
  let offerId;
  let bookingId;

  beforeAll(async () => {
    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      nom: 'Test User',
      email: 'bookingsuser@example.com',
      password: hashedPassword,
      role: 'client'
    });
    userId = user._id;

    const admin = await User.create({
      nom: 'Admin User',
      email: 'bookingsadmin@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    adminId = admin._id;

    // Create test offer
    const offer = await Offer.create({
      type: 'place',
      title: 'Test Place',
      description: 'A test place',
      price: 100,
      ownerId: userId,
      location: { city: 'Paris', country: 'France' },
      place: { address: '123 Test St', capacity: 4 }
    });
    offerId = offer._id;

    // Login to get tokens
    const userLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'bookingsuser@example.com', password: 'password123' });
    userToken = userLogin.body.token;

    const adminLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'bookingsadmin@example.com', password: 'password123' });
    adminToken = adminLogin.body.token;
  });

  afterAll(async () => {
    await Booking.deleteMany({});
    await Offer.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Booking.deleteMany({});
  });

  describe('GET /bookings', () => {
    beforeEach(async () => {
      await Booking.create({
        userId,
        offerId,
        quantity: 1,
        totalPrice: 100,
        status: 'confirmed'
      });
    });

    it('should get all bookings', async () => {
      const res = await request(app).get('/bookings');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /bookings/:id', () => {
    beforeEach(async () => {
      const booking = await Booking.create({
        userId,
        offerId,
        quantity: 1,
        totalPrice: 100,
        status: 'confirmed'
      });
      bookingId = booking._id;
    });

    it('should get a booking by id', async () => {
      const res = await request(app).get(`/bookings/${bookingId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('status', 'confirmed');
    });

    it('should return 404 for non-existent booking', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/bookings/${fakeId}`);

      expect(res.statusCode).toEqual(404);
    });
  });

  describe('GET /bookings/user/:uid', () => {
    beforeEach(async () => {
      await Booking.create({
        userId,
        offerId,
        quantity: 1,
        totalPrice: 100,
        status: 'confirmed'
      });
    });

    it('should get bookings for a user', async () => {
      const res = await request(app)
        .get(`/bookings/user/${userId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should not get bookings without auth', async () => {
      const res = await request(app).get(`/bookings/user/${userId}`);

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('POST /bookings', () => {
    it('should create a booking', async () => {
      const res = await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId: userId.toString(),
          offerId: offerId.toString(),
          quantity: 2
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('status', 'confirmed');
      expect(res.body.data).toHaveProperty('totalPrice', 200); // 100 * 2
      bookingId = res.body.data._id;
    });

    it('should create booking with dates', async () => {
      const startDate = '2025-01-01';
      const endDate = '2025-01-03';
      const res = await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId: userId.toString(),
          offerId: offerId.toString(),
          quantity: 1,
          startDate,
          endDate
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.data).toHaveProperty('totalPrice', 200); // 100 * 2 days
    });

    it('should not create booking without auth', async () => {
      const res = await request(app)
        .post('/bookings')
        .send({
          userId: userId.toString(),
          offerId: offerId.toString(),
          quantity: 1
        });

      expect(res.statusCode).toEqual(401);
    });

    it('should not create booking for non-existent offer', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId: userId.toString(),
          offerId: fakeId.toString(),
          quantity: 1
        });

      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /bookings/:id', () => {
    beforeEach(async () => {
      const booking = await Booking.create({
        userId,
        offerId,
        quantity: 1,
        totalPrice: 100,
        status: 'pending'
      });
      bookingId = booking._id;
    });

    it('should update a booking as admin', async () => {
      const res = await request(app)
        .put(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('status', 'confirmed');
    });

    it('should update quantity and recalculate price', async () => {
      const res = await request(app)
        .put(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 3 });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('totalPrice', 300); // 100 * 3
    });

    it('should not update without admin auth', async () => {
      const res = await request(app)
        .put(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'confirmed' });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('DELETE /bookings/:id', () => {
    beforeEach(async () => {
      const booking = await Booking.create({
        userId,
        offerId,
        quantity: 1,
        totalPrice: 100,
        status: 'confirmed'
      });
      bookingId = booking._id;
    });

    it('should delete a booking', async () => {
      const res = await request(app)
        .delete(`/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Réservation supprimée');
    });

    it('should not delete without auth', async () => {
      const res = await request(app)
        .delete(`/bookings/${bookingId}`);

      expect(res.statusCode).toEqual(401);
    });
  });
});
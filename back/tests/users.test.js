const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

describe('Users Routes', () => {
  let userToken;
  let adminToken;
  let userId;
  let adminId;

  beforeAll(async () => {
    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      nom: 'Test User',
      email: 'usersuser@example.com',
      password: hashedPassword,
      role: 'client'
    });
    userId = user._id;

    const admin = await User.create({
      nom: 'Admin User',
      email: 'usersadmin@example.com',
      password: hashedPassword,
      role: 'admin'
    });
    adminId = admin._id;

    // Login to get tokens
    const userLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'usersuser@example.com', password: 'password123' });
    userToken = userLogin.body.token;

    const adminLogin = await request(app)
      .post('/auth/login')
      .send({ email: 'usersadmin@example.com', password: 'password123' });
    adminToken = adminLogin.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /users', () => {
    it('should get all users as admin', async () => {
      const res = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should not get all users without admin auth', async () => {
      const res = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(403); // Assuming adminAuth returns 403
    });
  });

  describe('GET /users/:id', () => {
    it('should get a user by id', async () => {
      const res = await request(app)
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('nom', 'Test User');
      expect(res.body.data).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/users/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PUT /users/:id', () => {
    it('should update a user', async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ nom: 'Updated Name' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('nom', 'Updated Name');
    });

    it('should not update email or password', async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ nom: 'New Name', email: 'newemail@example.com', password: 'newpass' });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty('nom', 'New Name');
      // Email should remain the same
      expect(res.body.data).toHaveProperty('email', 'usersuser@example.com');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user as admin', async () => {
      const res = await request(app)
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Utilisateur supprimé');
    });

    it('should not delete user without admin auth', async () => {
      const newUser = await User.create({
        nom: 'Another User',
        email: 'another@example.com',
        password: await bcrypt.hash('pass', 10)
      });

      const res = await request(app)
        .delete(`/users/${newUser._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(403);
    });
  });
});
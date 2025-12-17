const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

describe('Auth Routes', () => {
  beforeAll(async () => {
    // Connect to test DB if needed, or assume it's connected
    // For simplicity, assuming the app connects
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean users
    await User.deleteMany({});
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          nom: 'Test User',
          email: 'authuser@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('msg', 'Inscription réussie !');
    });

    it('should not register with missing fields', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          nom: 'Test User',
          email: 'test@example.com'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Tous les champs sont requis');
    });

    it('should not register with existing email', async () => {
      await User.create({
        nom: 'Existing User',
        email: 'authuser@example.com',
        password: await bcrypt.hash('password', 10)
      });

      const res = await request(app)
        .post('/auth/register')
        .send({
          nom: 'Test User',
          email: 'authuser@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Email déjà pris');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        nom: 'Test User',
        email: 'authuser@example.com',
        password: hashedPassword
      });
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'authuser@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('msg', 'Connexion OK');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
    });

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'authuser@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Mot de passe incorrect');
    });

    it('should not login with unknown email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'unknown@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Utilisateur inconnu');
    });
  });

  describe('GET /auth/me', () => {
    let token;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        nom: 'Test User',
        email: 'authuser@example.com',
        password: hashedPassword
      });

      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'authuser@example.com',
          password: 'password123'
        });

      token = loginRes.body.token;
    });

    it('should get current user', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('nom', 'Test User');
      expect(res.body).toHaveProperty('email', 'authuser@example.com');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should not get user without token', async () => {
      const res = await request(app)
        .get('/auth/me');

      expect(res.statusCode).toEqual(401); // Assuming auth middleware returns 401
    });
  });
});
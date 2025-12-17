const request = require('supertest');
const app = require('../index'); 

jest.setTimeout(10000); 

describe('Test de l\'API Vacances', () => {

    it('GET / devrait renvoyer le message de bienvenue', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
    });

    it('GET /offers devrait renvoyer une liste', async () => {
        const res = await request(app).get('/offers');
        
        expect(res.statusCode).toEqual(200);

        // 1. On vérifie que la réponse contient bien la clé "data"
        expect(res.body).toHaveProperty('data');
        
        // 2. On vérifie que "data" est bien le tableau, pas "body"
        expect(Array.isArray(res.body.data)).toBe(true);
        
        // Note: Offers may or may not be present depending on seed
    });

    it('GET /route-imaginaire devrait renvoyer 404', async () => {
        const res = await request(app).get('/route-imaginaire');
        expect(res.statusCode).toEqual(404);
    });

});
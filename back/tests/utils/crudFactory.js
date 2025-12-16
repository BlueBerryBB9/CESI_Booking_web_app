// tests/utils/crudFactory.js
const request = require('supertest');

/**
 * Génère une suite de tests CRUD complète pour une entité donnée.
 * @param {Object} app - L'instance de l'application (Express/Nest...)
 * @param {String} endpointUrl - L'URL de base (ex: '/offers')
 * @param {String} resourceName - Nom pour les logs (ex: 'Offer')
 * @param {Object} validPayload - Un objet JSON valide pour la création
 * @param {Object} updatePayload - Un objet JSON valide pour la mise à jour
 */
const generateCrudTests = (app, endpointUrl, resourceName, validPayload, updatePayload) => {
    
    describe(`CRUD Automatisé pour: ${resourceName}`, () => {
        let createdId;

        // 1. CREATE (POST)
        it(`doit créer un ${resourceName}`, async () => {
            const res = await request(app)
                .post(endpointUrl)
                .send(validPayload);
            
            expect(res.status).toBe(201); // Ou 200
            expect(res.body).toHaveProperty('id'); // Assurez-vous que votre API renvoie 'id' ou '_id'
            createdId = res.body.id; 
        });

        // 2. READ (GET One)
        it(`doit récupérer le ${resourceName} créé`, async () => {
            const res = await request(app).get(`${endpointUrl}/${createdId}`);
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(createdId);
        });

        // 3. UPDATE SÉCURISÉ (PUT/PATCH) - Votre correctif critique
        it(`UPDATE: ne doit PAS écraser l'ID avec un body vide ou partiel`, async () => {
            const res = await request(app)
                .put(`${endpointUrl}/${createdId}`)
                .send(updatePayload); // Envoi d'une mise à jour partielle

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(createdId); // Vérif cruciale
            
            // Vérifier que la modif a eu lieu
            const keys = Object.keys(updatePayload);
            if (keys.length > 0) {
                expect(res.body[keys[0]]).toBe(updatePayload[keys[0]]);
            }
        });

        // 4. SECURITY CHECK (Le test "Anti-Hack")
        it(`SÉCURITÉ: doit ignorer une tentative de modification d'ID`, async () => {
            const hackPayload = { ...updatePayload, id: '99999-HACK' };
            
            const res = await request(app)
                .put(`${endpointUrl}/${createdId}`)
                .send(hackPayload);

            expect(res.status).toBe(200);
            expect(res.body.id).toBe(createdId); // L'ID doit rester l'original
        });

        // 5. DELETE
        it(`doit supprimer le ${resourceName}`, async () => {
            const res = await request(app).delete(`${endpointUrl}/${createdId}`);
            expect(res.status).toBe(200); // Ou 204 No Content
        });
        
        // 6. VERIF DELETE
        it(`ne doit plus trouver le ${resourceName} après suppression`, async () => {
            const res = await request(app).get(`${endpointUrl}/${createdId}`);
            expect(res.status).toBe(404);
        });
    });
};

module.exports = generateCrudTests;
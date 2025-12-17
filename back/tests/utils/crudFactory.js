const request = require('supertest');

const generateCrudTests = (app, endpointUrl, resourceName, validPayload, updatePayload, authToken = null) => {
    
    // Fonction utilitaire pour récupérer le token, qu'il soit une String ou une Fonction
    const getToken = () => {
        if (typeof authToken === 'function') {
            return authToken(); // Exécute la fonction pour récupérer la valeur à jour
        }
        return authToken; // Renvoie la valeur directe
    };

    describe(`CRUD Automatisé pour: ${resourceName}`, () => {
        let createdId;

        // 1. CREATE
        it(`doit créer un ${resourceName}`, async () => {
            let req = request(app).post(endpointUrl).send(validPayload);
            
            const token = getToken(); // On récupère le token ici
            if (token) req.set('Authorization', `Bearer ${token}`);
            
            const res = await req;
            
            if (res.status !== 201) {
                console.error(`⚠️ ERREUR CREATE ${resourceName} :`, JSON.stringify(res.body, null, 2));
            }

            expect(res.status).toBe(201);
            expect(res.body.data).toHaveProperty('_id'); 
            createdId = res.body.data._id; 
        });

        // 2. READ
        it(`doit récupérer le ${resourceName} créé`, async () => {
            let req = request(app).get(`${endpointUrl}/${createdId}`);
            
            const token = getToken();
            if (token) req.set('Authorization', `Bearer ${token}`);

            const res = await req;
            expect(res.status).toBe(200);
            expect(res.body.data._id).toBe(createdId);
        });

        // 3. UPDATE
        it(`UPDATE: ne doit PAS écraser l'ID avec un body vide ou partiel`, async () => {
            let req = request(app).put(`${endpointUrl}/${createdId}`).send(updatePayload);
            
            const token = getToken();
            if (token) req.set('Authorization', `Bearer ${token}`);

            const res = await req;
            expect(res.status).toBe(200);
            expect(res.body.data._id).toBe(createdId); 
            
            const keys = Object.keys(updatePayload);
            if (keys.length > 0) {
                expect(res.body.data[keys[0]]).toBe(updatePayload[keys[0]]);
            }
        });

        // 4. SECURITY CHECK
        it(`SÉCURITÉ: doit ignorer une tentative de modification d'ID`, async () => {
            const hackPayload = { ...updatePayload, _id: '507f1f77bcf86cd799439011' };
            let req = request(app).put(`${endpointUrl}/${createdId}`).send(hackPayload);
            
            const token = getToken();
            if (token) req.set('Authorization', `Bearer ${token}`);

            const res = await req;
            expect(res.status).toBe(200);
            expect(res.body.data._id).toBe(createdId); 
        });

        // 5. DELETE
        it(`doit supprimer le ${resourceName}`, async () => {
            let req = request(app).delete(`${endpointUrl}/${createdId}`);
            
            const token = getToken();
            if (token) req.set('Authorization', `Bearer ${token}`);
            
            const res = await req;
            expect(res.status).toBe(200); 
        });
        
        // 6. VERIF DELETE
        it(`ne doit plus trouver le ${resourceName} après suppression`, async () => {
            let req = request(app).get(`${endpointUrl}/${createdId}`);
            
            const token = getToken();
            if (token) req.set('Authorization', `Bearer ${token}`);

            const res = await req;
            expect(res.status).toBe(404);
        });
    });
};

module.exports = generateCrudTests;
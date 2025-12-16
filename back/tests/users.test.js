const app = require('../app');
const generateCrudTests = require('./utils/crudFactory');

const userData = { name: "Jean", email: "jean@test.com" };
const userUpdate = { name: "Jean Paul" };

generateCrudTests(app, '/users', 'User', userData, userUpdate);
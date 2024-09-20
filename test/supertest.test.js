import { expect } from "chai";
import supertest from 'supertest';

// const expect = chai.expect;

const requester = supertest('http://localhost:8030');
const testUser = { name: 'Matias', lastName: 'Sancassani', email: 'matiassancassani2@gmail.com', password: 'abc445' };

let cookie = {};
describe('Test Integración Users', function () {

    // Test para registrar un nuevo usuario
    it('POST /register debe registrar un nuevo usuario', async function () {
        const response = await requester.post('/api/auth/register').send(testUser);

        expect(response.body.status).to.equal('success');


        const user = response.body.user;
        expect(user).to.have.property('_id');
        expect(user.name).to.equal(testUser.name);
        expect(user.lastName).to.equal(testUser.lastName);
        expect(user.email).to.equal(testUser.email);
        expect(user).to.have.property('rol').that.equals('user');
    });

    it('POST /register NO debe volver a registrar el mismo mail', async function () {
        const { statusCode, response } = await requester.post('/api/auth/register').send(testUser);

        expect(statusCode).to.be.equals(400);
    });

    it('POST /login debe ingresar correctamente al usuario', async function () {
        const result = await requester.post('/api/auth/login').send(testUser);

        const cookieData = result.headers['set-cookie'][0];
        cookie = { name: cookieData.split('=')[0], value: cookieData.split('=')[1] };


        expect(cookieData).to.be.ok;
        expect(cookie.name).to.be.equals('token');
        expect(cookie.value).to.be.ok;
    });

});
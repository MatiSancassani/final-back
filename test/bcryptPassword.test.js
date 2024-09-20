import { expect } from "chai";
import { createHash, isValidPassword } from "../src/utils/bcryptPassword.js";

// const expect = chai.expect;
const testPassword = 'abc123';
// Esta expresión regular (regex) nos permite verificar si la cadena
// tiene un formato válido de hash Bcrypt.
const validBcryptFormat = /^\$2[aby]\$10\$.{53}$/;

describe('Tests Utils', function () {

    it('createHash() debe hashear correctamente la clave', function () {
        const result = createHash(testPassword);

        expect(result).to.not.equal(testPassword); // Verifica que el hash sea diferente a la contraseña original
        expect(result).to.match(validBcryptFormat); // Verifica que el formato del hash sea correcto
    });

    it('isValidPassword() debe retornar true si coincide hash', function () {
        const hashed = createHash(testPassword);
        const result = isValidPassword(testPassword, hashed);

        expect(result).to.be.true;
    });

    it('isValidPassword() debe retornar false si no coincide hash', function () {
        const correctHashed = createHash(testPassword);
        const wrongHashed = 'cualquier_otra_cosa';

        const result = isValidPassword(testPassword, wrongHashed);

        expect(result).to.be.false;
    });
});
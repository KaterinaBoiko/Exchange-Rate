const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../auth');
const model = rewire('../auth.model');

const expect = chai.expect;
chai.use(chaiHttp);

describe('/POST auth', () => {
    it('it should return message success', (done) => {
        const newUser = {
            password: 111,
            email: 'a@a.com'
        };
        const message = 'success';
        chai.request(server)
            .get('/signup', newUser)
            .end((err, res) => {
                expect(res.status).to.be.equal(200);
                expect(res.body).to.be.an.instanceof(Object);
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.be.equal(message);
                done();
            });
    });

});
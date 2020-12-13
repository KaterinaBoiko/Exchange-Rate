const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../auth');

const expect = chai.expect;
chai.use(chaiHttp);

describe('/POST sign in', () => {

    it('it should check password', (done) => {
        const user = {
            email: 'kate@mail.com',
            password: 'incorrect'
        };
        const message = 'Incorrect password';
        chai.request(server)
            .post('/signin')
            .send(user)
            .end((err, res) => {
                expect(res.status).to.be.equal(500);
                expect(res.body).to.be.an.instanceof(Object);
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.be.equal(message);
                done();
            });
    });

    it('it should return user if credentials are correct', (done) => {
        const user = {
            email: 'kate@mail.com',
            password: 'password'
        };
        chai.request(server)
            .post('/signin')
            .send(user)
            .end((err, res) => {
                expect(res.status).to.be.equal(200);
                expect(res.body).to.be.an.instanceof(Object);
                expect(res.body).to.have.property('token').that.is.a('string');
                expect(res.body).to.have.property('id').that.is.a('number');
                done();
            });
    });

    it('it should require password', (done) => {
        const user = {
            email: 'test@test.com'
        };
        const message = 'Required data is not provided';
        chai.request(server)
            .post('/signin')
            .send(user)
            .end((err, res) => {
                expect(res.status).to.be.equal(500);
                expect(res.body).to.be.an.instanceof(Object);
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.be.equal(message);
                done();
            });
    });

    it('it should require email', (done) => {
        const user = {
            password: 'password'
        };
        const message = 'Required data is not provided';
        chai.request(server)
            .post('/signin')
            .send(user)
            .end((err, res) => {
                expect(res.status).to.be.equal(500);
                expect(res.body).to.be.an.instanceof(Object);
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.be.equal(message);
                done();
            });
    });

    it('it should return 404 if no such email in db', (done) => {
        const user = {
            email: 'test@test.com',
            password: 'password'
        };
        const message = 'Email does not exist';
        chai.request(server)
            .post('/signin')
            .send(user)
            .end((err, res) => {
                expect(res.status).to.be.equal(404);
                expect(res.body).to.be.an.instanceof(Object);
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.be.equal(message);
                done();
            });
    });
});

describe('/POST sign up', () => {
    it('it should return 409 if such email in already registered', (done) => {
        const user = {
            email: 'kate@mail.com',
            password: 'test'
        };
        const message = 'Email is already exist';
        chai.request(server)
            .post('/signup')
            .send(user)
            .end((err, res) => {
                expect(res.status).to.be.equal(409);
                expect(res.body).to.be.an.instanceof(Object);
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.be.equal(message);
                done();
            });
    });

    it('it should require password', (done) => {
        const user = {
            email: 'test@test.com'
        };
        const message = 'Required data is not provided';
        chai.request(server)
            .post('/signup')
            .send(user)
            .end((err, res) => {
                expect(res.status).to.be.equal(500);
                expect(res.body).to.be.an.instanceof(Object);
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.be.equal(message);
                done();
            });
    });

    it('it should require email', (done) => {
        const user = {
            password: 'password'
        };
        const message = 'Required data is not provided';
        chai.request(server)
            .post('/signup')
            .send(user)
            .end((err, res) => {
                expect(res.status).to.be.equal(500);
                expect(res.body).to.be.an.instanceof(Object);
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.be.equal(message);
                done();
            });
    });

    it('it should return 200 and create new user', (done) => {
        const user = {
            password: 'test',
            email: 'test'
        };
        const message = 'success';
        chai.request(server)
            .post('/signup')
            .send(user)
            .end((err, res) => {
                expect(res.status).to.be.equal(200);
                expect(res.body).to.be.an.instanceof(Object);
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.be.equal(message);
                done();
            });
    });
});

describe('/DELETE delete user', () => {
    it('it should return 200 and delete user by email', (done) => {
        const message = 'success';
        chai.request(server)
            .delete('/delete-by-email/test')
            .end((err, res) => {
                expect(res.status).to.be.equal(200);
                expect(res.body).to.be.an.instanceof(Object);
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.be.equal(message);
                done();
            });
    });
});
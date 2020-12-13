const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../database');

const expect = chai.expect;
chai.use(chaiHttp);

describe('AUTH routes', () => {
    describe('/POST sign in', () => {

        it('it should return user if find such email', (done) => {
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
                    expect(res.body).to.have.property('email').that.is.a('string');
                    expect(res.body).to.have.property('password').that.is.a('string');
                    expect(res.body).to.have.property('id').that.is.a('number');
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
                    expect(res.body).to.be.a('string');
                    expect(res.body).to.be.equal(message);
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
                    expect(res.body).to.be.a('string');
                    expect(res.body).to.be.equal(message);
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
                    expect(res.body).to.be.a('string');
                    expect(res.body).to.be.equal(message);
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
                    expect(res.body).to.be.a('string');
                    expect(res.body).to.be.equal(message);
                    done();
                });
        });
    });
});

describe('RATES routes', () => {
    describe('/GET rates by date', () => {
        it('it should return 200 by correct date`', (done) => {
            chai.request(server)
                .get('/rate/6.12.2020')
                .end((err, res) => {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an.instanceof(Array);
                    done();
                });
        });

        it('it should return 400 and error message if invalid date', (done) => {
            const errorMessage = 'DateTimeParseError';
            chai.request(server)
                .get('/rate/blabla')
                .end((err, res) => {
                    expect(res.status).to.be.equal(400);
                    expect(res.body).to.be.a('string');
                    expect(res.body).to.be.equal(errorMessage);
                    done();
                });
        });

        it('it should return 404 if no date', (done) => {
            chai.request(server)
                .get('/rate')
                .end((err, res) => {
                    expect(res.status).to.be.equal(404);
                    done();
                });
        });
    });

    describe('/GET currency pairs', () => {
        it('it should return 200', (done) => {
            chai.request(server)
                .get('/currency-pairs')
                .end((err, res) => {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an.instanceof(Array);
                    done();
                });
        });
    });

    describe('/GET currency details', () => {
        it('it should return 200 and details about avaliable currency', (done) => {
            chai.request(server)
                .get('/details/USD')
                .end((err, res) => {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an.instanceof(Object);
                    done();
                });
        });

        it('it should return 200 when no data avaliable', (done) => {
            chai.request(server)
                .get('/details/somecurrency')
                .end((err, res) => {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.a('string');
                    expect(res.body).to.be.equal('');
                    done();
                });
        });
    });

    describe('/GET current rate NBU', () => {
        it('it should return 200 and nbu rate by date', (done) => {
            chai.request(server)
                .get('/get-nbu-rate?date=11.12.2020&currency=UAH&base_currency=USD')
                .end((err, res) => {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an.instanceof(Object);
                    expect(res.body).to.have.property('base_currency').that.is.a('string');
                    expect(res.body).to.have.property('rate_nb').that.is.a('number');
                    done();
                });
        });

        it('it should return 204 and if no nbu rate by date', (done) => {
            chai.request(server)
                .get('/get-nbu-rate?date=12.3.2020')
                .end((err, res) => {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });

        it('it should return 204 and if no date and no pair', (done) => {
            chai.request(server)
                .get('/get-nbu-rate')
                .end((err, res) => {
                    expect(res.status).to.be.equal(204);
                    done();
                });
        });
    });
});
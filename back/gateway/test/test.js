const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../gateway');

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
                    expect(res.body).to.have.property('token').that.is.a('string');
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
            const message = 'Invalid date format';
            chai.request(server)
                .get('/rate/blabla')
                .end((err, res) => {
                    expect(res.status).to.be.equal(400);
                    expect(res.body).to.be.an.instanceof(Object);
                    expect(res.body).to.have.property('message');
                    expect(res.body.message).to.be.equal(message);
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
        it('it should return 200 and all currency pairs', (done) => {
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
        it('it should return 200 and details about USD', (done) => {
            chai.request(server)
                .get('/details/USD')
                .end((err, res) => {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an.instanceof(Object);
                    done();
                });
        });

        it('it should return 200 and message if no data avaliable', (done) => {
            const message = 'No data avaliable';
            chai.request(server)
                .get('/details/somecurrency')
                .end((err, res) => {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an.instanceof(Object);
                    expect(res.body).to.have.property('message');
                    expect(res.body.message).to.be.equal(message);
                    done();
                });
        });
    });

    describe('/GET current rate NBU', () => {
        it('it should return 200 and current nbu rate', (done) => {
            chai.request(server)
                .get('/current-nbu-rate')
                .end((err, res) => {
                    expect(res.status).to.be.equal(200);
                    expect(res.body).to.be.an.instanceof(Array);
                    expect(res.body[ 0 ]).to.have.property('base_currency').that.is.a('string');
                    expect(res.body[ 0 ]).to.have.property('currency').that.is.a('string');
                    expect(res.body[ 0 ]).to.have.property('rate_nb').that.is.a('number');
                    done();
                });
        });
    });
});
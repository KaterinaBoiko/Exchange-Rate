const sinon = require('sinon');
const chai = require('chai');
const rewire = require('rewire');
const chaiHttp = require('chai-http');
const formatDate = require('dateformat');

const server = require('../rates');
const model = rewire('../rates.model');

const expect = chai.expect;
chai.use(chaiHttp);

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
        const errorMessage = 'Invalid date format';
        chai.request(server)
            .get('/rate/blabla')
            .end((err, res) => {
                expect(res.status).to.be.equal(400);
                expect(res.body).to.be.an.instanceof(Object);
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.be.equal(errorMessage);
                done();
            });
    });

    it('it should return 404 if no date', (done) => {
        const errorMessage = 'Invalid date format';
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
    it('it should return 200 and current rate', (done) => {
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

describe('/GET convert currencies', () => {
    it('it should return 200 and correct response', (done) => {
        chai.request(server)
            .get('/convert?amount=100&currency=USD&base_currency=UAH')
            .end((err, res) => {
                expect(res.status).to.be.equal(200);
                expect(res.body).to.be.an.instanceof(Object);
                expect(res.body).to.have.property('result').that.is.a('number');
                expect(res.body).to.have.property('reverted_rate').that.is.a('number');
                expect(res.body).to.have.property('rate').that.is.a('number');
                done();
            });
    });

    it('it should return 200 and correct response if base currency not UAH', (done) => {
        chai.request(server)
            .get('/convert?amount=100&currency=UAH&base_currency=USD')
            .end((err, res) => {
                expect(res.status).to.be.equal(200);
                expect(res.body).to.be.an.instanceof(Object);
                expect(res.body).to.have.property('result').that.is.a('number');
                expect(res.body).to.have.property('reverted_rate').that.is.a('number');
                expect(res.body).to.have.property('rate').that.is.a('number');
                done();
            });
    });

    it('it should accept 0 amount', (done) => {
        chai.request(server)
            .get('/convert?amount=0&currency=UAH&base_currency=USD')
            .end((err, res) => {
                expect(res.status).to.be.equal(200);
                expect(res.body).to.be.an.instanceof(Object);
                expect(res.body).to.have.property('result').that.is.a('number');
                expect(res.body.result).to.be.equal(0);
                expect(res.body).to.have.property('reverted_rate').that.is.a('number');
                expect(res.body).to.have.property('rate').that.is.a('number');
                done();
            });
    });

    it('it should accept negative amount', (done) => {
        chai.request(server)
            .get('/convert?amount=-10&currency=UAH&base_currency=USD')
            .end((err, res) => {
                expect(res.status).to.be.equal(200);
                expect(res.body).to.be.an.instanceof(Object);
                expect(res.body).to.have.property('result').that.is.a('number');
                expect(res.body.result).to.be.lessThan(0);
                expect(res.body).to.have.property('reverted_rate').that.is.a('number');
                expect(res.body).to.have.property('rate').that.is.a('number');
                done();
            });
    });

    it('it should return error if invalid amount', (done) => {
        const message = 'Invalid amount';
        chai.request(server)
            .get('/convert?amount=INVALID&currency=UAH&base_currency=USD')
            .end((err, res) => {
                expect(res.status).to.be.equal(400);
                expect(res.body).to.be.an.instanceof(Object);
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.be.equal(message);
                done();
            });
    });

    it('it should return appropriate message if no such pair', (done) => {
        const message = 'No pair SOME and UAH found';
        chai.request(server)
            .get('/convert?amount=100&currency=SOME&base_currency=UAH')
            .end((err, res) => {
                expect(res.status).to.be.equal(200);
                expect(res.body).to.be.an.instanceof(Object);
                expect(res.body).to.have.property('message');
                expect(res.body.message).to.be.equal(message);
                done();
            });
    });
});

describe('Units', () => {
    let req = {};
    beforeEach(function () {
        req.query = {};
    });
    it('it should return params object with provided dates', (done) => {
        req.query = {
            from: '12.3.2020',
            to: '12.8.2020'
        };
        const getFormatedtFromToDates = model.__get__('getFormatedtFromToDates');
        const expectedFrom = '3.12.2020';
        const expectedTo = '8.12.2020';

        const params = getFormatedtFromToDates(req);
        expect(params).to.be.an.instanceof(Object);
        expect(params).to.have.property('from');
        expect(params.from).to.be.equal(expectedFrom);
        expect(params).to.have.property('to');
        expect(params.to).to.be.equal(expectedTo);
        done();
    });

    it('it should return params with setted from date less than to on 7 days', (done) => {
        req.query = {
            to: '12.10.2020'
        };
        const getFormatedtFromToDates = model.__get__('getFormatedtFromToDates');
        const expectedFrom = '3.12.2020';

        const params = getFormatedtFromToDates(req);
        expect(params).to.be.an.instanceof(Object);
        expect(params).to.have.property('from');
        expect(params.from).to.be.equal(expectedFrom);
        expect(params).to.have.property('to');
        done();
    });

    it('it should return params with setted current date to to', (done) => {
        req.query = {
            from: '12.10.2020'
        };
        const getFormatedtFromToDates = model.__get__('getFormatedtFromToDates');
        const expectedTo = formatDate(new Date(), "d.m.yyyy");

        const params = getFormatedtFromToDates(req);
        expect(params).to.be.an.instanceof(Object);
        expect(params).to.have.property('from');
        expect(params).to.have.property('to');
        expect(params.to).to.be.equal(expectedTo);
        done();
    });

    it('it should return params with setted dates without provided dates', (done) => {
        const getFormatedtFromToDates = model.__get__('getFormatedtFromToDates');
        const to = new Date();
        const from = new Date(to);
        from.setDate(from.getDate() - 7);
        const expectedTo = formatDate(to, "d.m.yyyy");
        const expectedFrom = formatDate(from, "d.m.yyyy");
        const params = getFormatedtFromToDates(req);

        expect(params).to.be.an.instanceof(Object);
        expect(params).to.have.property('from');
        expect(params.from).to.be.equal(expectedFrom);
        expect(params).to.have.property('to');
        expect(params.to).to.be.equal(expectedTo);
        done();
    });

    it('it should throw an error if incorrect dates sequence', function (done) {
        const message = 'Incorrect dates sequence';
        req.query = {
            from: '12.30.2020',
            to: '12.8.2020'
        };
        const getFormatedtFromToDates = model.__get__('getFormatedtFromToDates');
        expect(getFormatedtFromToDates.bind(model, req)).to.throw(message);
        done();
    });
});
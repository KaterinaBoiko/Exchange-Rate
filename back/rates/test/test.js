const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../rates');
const controller = require('../rates.controller');
const model = require('../rates.model');

const expect = chai.expect;

const convertUAHUSDMock = require('./mocks/convert-UAH-USD.json');

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

// describe('Converter', () => {
//     beforeEach(function () {
//         res = {
//             json: sinon.spy(),
//             status: sinon.stub().returns({ end: sinon.spy() }) // to spy res.status(500).end()
//         };
//     });
//     it('it should return converted amount object', async (done) => {
//         expectedResult = req.body;
//         this.stub(model, 'convert').yields(null, expectedResult);
//         contriller.convert(req, res);
//         sinon.assert.calledWith(model.create, req.body);
//         sinon.assert.calledWith(res.json, sinon.match({ model: req.body.model }));
//         sinon.assert.calledWith(res.json, sinon.match({ manufacturer: req.body.manufacturer }));
//     });
// });
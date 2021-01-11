const sinon = require('sinon');
const chai = require('chai');
const rewire = require('rewire');
const chaiHttp = require('chai-http');
const formatDate = require('dateformat');

const server = require('../rates');
const model = rewire('../rates.model');

const expect = chai.expect;
chai.use(chaiHttp);

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

    it('it should take less than 10ms', function (done) {
        this.timeout(10);
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
        //setTimeout(done, 100);
    });
});
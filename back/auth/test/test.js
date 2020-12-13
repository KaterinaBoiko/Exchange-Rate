const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../auth');

const expect = chai.expect;
chai.use(chaiHttp);

// describe('/POST sign up, sign in, delete', () => {
//     it('it should create new user and  message success', (done) => {
//         const newUser = {
//             password: '111',
//             email: 'a@a.com'
//         };
//         const message = 'success';
//         chai.request(server)
//             .post('/signup')
//             .send(newUser)
//             .end((err, res) => {
//                 expect(res.status).to.be.equal(200);
//                 expect(res.body).to.be.an.instanceof(Object);
//                 expect(res.body).to.have.property('message');
//                 expect(res.body.message).to.be.equal(message);
//                 done();
//             });
//     });

//     it('it should return user', (done) => {
//         const user = {
//             password: '111',
//             email: 'a@a.com'
//         };
//         chai.request(server)
//             .post('/signin')
//             .send(user)
//             .end((err, res) => {
//                 console.log('err', res);
//                 expect(res.status).to.be.equal(200);
//                 expect(res.body).to.be.an.instanceof(Object);
//                 expect(res.body).to.have.property('token');
//                 done();
//             });
//     });

//     it('it should delete user', (done) => {
//         const message = 'success';
//         chai.request(server)
//             .delete('/delete/20')
//             .end((err, res) => {
//                 console.log(res);
//                 expect(res.status).to.be.equal(200);
//                 expect(res.body).to.be.an.instanceof(Object);
//                 expect(res.body).to.have.property('message');
//                 expect(res.body.message).to.be.equal(message);
//                 done();
//             });
//     });
// });

describe('/POST sign in', () => {
    it('it should return a user', (done) => {
        const user = {
            password: '111',
            email: 'a@a.com'
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
            email: 'a@a.com'
        };
        const message = "Required data is not provided";
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
});
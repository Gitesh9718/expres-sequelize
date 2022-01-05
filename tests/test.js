'use strict';

var server = 'http://192.168.56.101:3000';
//var server = 'http://meoh-integration.nurogate.com:3000';
var expect = chai.expect;
var assert = chai.assert;

function testAsync(done, fn)
{
  try
  {
    fn();
    done();
  } catch (err)
  {
    done(err);
  }
}

let tokenMax = "";
let tokenJohn = "";
let tokenBob = "";
let tokenRobert = "";

describe('Test meoh api', function ()
{
  it('clearDB', (done) =>
  {
    chai.request(server)
      .post('/v1/hiddenapideletedatabsefortesting')
      .set('Content-type', 'application/json')
      .end((err, res) =>
      {
        testAsync(done, function ()
        {
          expect(res).to.have.status(200);
          assert.equal(true, res.body.success);
        }.bind(res));
      });
  });

  describe('Create Users', function ()
  {
    it('create user Max Mustermann fails because no name given!', (done) =>
    {
      chai.request(server)
        .post('/v1/users')
        .set('Content-type', 'application/json')
        .send({ email: "max.mustermann@email.com", password: "secure-password" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(422);
            assert.equal(false, res.body.success);
          }.bind(res));
        });
    });

    it('create user Max Mustermann again', (done) =>
    {
      chai.request(server)
        .post('/v1/users')
        .set('Content-type', 'application/json')
        .send({ email: "max.mustermann@email.com", password: "secure-password", name: "Max Mustermann" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(201);
            assert.equal(true, res.body.success);
          }.bind(res));
        });
    });

    it('create user John Doe', (done) =>
    {
      chai.request(server)
        .post('/v1/users')
        .set('Content-type', 'application/json')
        .send({ email: "john.doe@email.com", password: "password", name: "John Doe" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(201);
            assert.equal(true, res.body.success);
          }.bind(res));
        });
    });

    it('create user Bob Mueller', (done) =>
    {
      chai.request(server)
        .post('/v1/users')
        .set('Content-type', 'application/json')
        .send({ email: "bob.mueller@email.com", password: "pwBOB", name: "Bob Mueller" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(201);
            assert.equal(true, res.body.success);
          }.bind(res));
        });
    });

  });
  return;
  describe('Update User and create some posts', function ()
  {

    it('user login Max Mustermann', (done) =>
    {

      chai.request(server)
        .post('/v1/users/login')
        .set('Content-type', 'application/json')
        .send({ email: "max.mustermann@email.com", password: "secure-password" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            if (err)
            {
              throw new Error(err);
            }
            expect(res).to.have.status(200);
            assert.equal(true, res.body.success);
            assert.isNotNull(res.body.token);
            tokenMax = res.body.token;
          }.bind(res));
        });
    });

    it('update user', (done) =>
    {

      /*  chai.request(server)
                .patch('/v1/users', '{"name":"Robert"}', (err, res) => {
                    testAsync(done, function(){
                          expect(res).to.have.status(200);
                          assert.isTrue(res.body.success);
                    }.bind(res))})
                .set('Accept', 'application/json')
                .set('Content-type','application/json; charset=utf-8')
                .set('Authorization',token)
                .send({"name":"Robert"})
                .end((err, res) => {
                    testAsync(done, function(){
                          expect(res).to.have.status(200);
                          assert.isTrue(res.body.success);
                    }.bind(res));
                });*/

      var x = new XMLHttpRequest();
      x.onreadystatechange = function ()
      {
        if (x.readyState === 4)
        {
          testAsync(done, function ()
          {
            assert.isTrue(JSON.parse(x.response).success);
          }.bind(x.response));
        }
      }
      x.open("PATCH", server+"/v1/users");
      x.setRequestHeader('Accept', 'application/json');
      x.setRequestHeader('Content-type', 'application/json; charset=utf-8');
      x.setRequestHeader('Authorization', tokenMax);
      x.send('{"name":"Max Mustermann","image":"data:image/gif;base64,R0lGODlhEAAQANUAAP8A/8mDIKWlpf/tyP/rwf/fov/jrf/ms//y1f/enf/02//wz//ouv/hp//24P/45f78+f/56P38+fj4+Nvb2/39/fHu6fj38+OvXfXz7/b29s2JKfv7++nHkOO8geTk5Pv69/b18f////T09AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAAAALAAAAAAQABAAAAZwQIBQGCgOj8hAJOIJIJ+Bh9T5PAYc2KKWalV4v94OVSAoIs5otFPwgSze8K1RIIIM7vj8YF2REP6AgQRrHCAMh4hyaxMXB46PkAdrGiEGlpeYBmsjGQ2en4oAAhQWBaanqAVjZRsJrq+uGFxDilpCQQA7"}');


    });

    it('get own user', (done) =>
    {

      chai.request(server)
        .get('/v1/users')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenMax)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            assert.isTrue(res.body.success);
          }.bind(res));
        });
    });

    it('get user with id 2', (done) =>
    {

      chai.request(server)
        .get('/v1/users/profile/2')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenMax)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            assert.isTrue(res.body.success);
          }.bind(res));
        });
    });

    it('get user image', (done) =>
    {

      chai.request(server)
        .get('/v1/users/image/1')
        .set('Content-type', 'application/json')
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            expect(res).to.have.header('content-type', /image.*/);
          }.bind(res));
        });
    });

    it('create post #1', (done) =>
    {

      chai.request(server)
        .post('/v1/posts')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenMax)
        .send({ text: "Lorem ipsum dolor sit amet, qui ornatus qualisque ad. Te habemus honestatis mea. Eos at pertinax", type: "1" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(201);
            assert.equal(true, res.body.success);
          }.bind(res));
        });
    });

    it('create post #2', (done) =>
    {

      chai.request(server)
        .post('/v1/posts')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenMax)
        .send({
          text: "Lorem ipsum dolor sit amet, qui ornatus qualisque ad. Te habemus honestatis mea. Eos at pertinax",
          link: "http://www.google.de", type: "2"
        })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(201);
            assert.equal(true, res.body.success);
          }.bind(res));
        });
    });

    it('create post #3', (done) =>
    {

      chai.request(server)
        .post('/v1/posts')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenMax)
        .send({
          text: "Lorem ipsum dolor sit amet, qui ornatus qualisque ad. Te habemus honestatis mea. Eos at pertinax",
          link: "http://heise.de", type: "0"
        })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(201);
            assert.equal(true, res.body.success);
          }.bind(res));
        });
    });

    it('get all posts of the current user', (done) =>
    {

      chai.request(server)
        .get('/v1/posts')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenMax)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            expect(res.body.newposts).to.have.lengthOf(3);
          }.bind(res));
        });
    });

    // Post deletion deactivated for now
    /*       it('delete post #2', (done) => {
   
               chai.request(server)
                       .delete('/v1/posts/2')
                       .set('Content-type','application/json')
                       .set('Authorization',token)
                       .end((err, res) => {
                           testAsync(done, function(){
                                    expect(res).to.have.status(204);
                           }.bind(res));
                       });
           });*/
  });

  describe('Testing Friendships', function ()
  {

    it('create invitation with email to user john doe', (done) =>
    {

      chai.request(server)
        .post('/v1/invitations')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenMax)
        .send({ email: "john.doe@email.com", private_text: "Hi There!" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(201);
            assert.equal(true, res.body.success);
          }.bind(res));
        });
    });

    it('create invitation with email to user Bob Mueller', (done) =>
    {

      chai.request(server)
        .post('/v1/invitations')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenMax)
        .send({ email: "bob.mueller@email.com" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(201);
            assert.equal(true, res.body.success);
          }.bind(res));
        });
    });

    it('get user status', (done) =>
    {

      chai.request(server)
        .get('/v1/users/status')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenMax)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            assert.isTrue(res.body.success);
          }.bind(res));
        });
    });

    it('user login John Doe', (done) =>
    {

      chai.request(server)
        .post('/v1/users/login')
        .set('Content-type', 'application/json')
        .send({ email: "john.doe@email.com", password: "password" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            if (err)
            {
              throw new Error(err);
            }
            expect(res).to.have.status(200);
            assert.equal(true, res.body.success);
            assert.isNotNull(res.body.token);
            tokenJohn = res.body.token;
          }.bind(res));
        });
    });

    it('get all invitations of the current user', (done) =>
    {

      chai.request(server)
        .get('/v1/invitations')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenJohn)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            expect(res.body.invitations).to.have.lengthOf(1);
          }.bind(res));
        });
    });

    it('accept invitation from Max Mustermann', (done) =>
    {

      chai.request(server)
        .post('/v1/invitations/accept/1')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenJohn)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            assert.isTrue(res.body.success);
          }.bind(res));
        });
    });

    it('create invitation with email to user Bob Mueller', (done) =>
    {

      chai.request(server)
        .post('/v1/invitations')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenJohn)
        .send({ email: "bob.mueller@email.com" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(201);
            assert.isTrue(res.body.success);
          }.bind(res));
        });
    });

    it('user login Bob Mueller', (done) =>
    {

      chai.request(server)
        .post('/v1/users/login')
        .set('Content-type', 'application/json')
        .send({ email: "bob.mueller@email.com", password: "pwBOB" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            if (err)
            {
              throw new Error(err);
            }
            expect(res).to.have.status(200);
            assert.equal(true, res.body.success);
            assert.isNotNull(res.body.token);
            tokenBob = res.body.token;
          }.bind(res));
        });
    });

    it('accept invitation from John Doe', (done) =>
    {

      chai.request(server)
        .post('/v1/invitations/accept/3')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenBob)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            assert.isTrue(res.body.success);
          }.bind(res));
        });
    });

    it('reject invitation from Max Mustermann', (done) =>
    {

      chai.request(server)
        .post('/v1/invitations/reject/2')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenBob)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(204);
          }.bind(res));
        });
    });
  });

  describe('Testing Forwards', function ()
  {

    it('foward post #3', (done) =>
    {

      chai.request(server)
        .post('/v1/forwards')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenJohn)
        .send({ post_id: "3" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(201);
            assert.isTrue(res.body.success);
          }.bind(res));
        });
    });

    it('check forward count for post #3', (done) =>
    {

      chai.request(server)
        .get('/v1/posts')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenJohn)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            //console.log(res.body.newposts);
            let obj = res.body.newposts.find(x => x.id === 3 && !x.hasOwnProperty('forwarded'));
            assert.equal(obj.number_of_forwards, 1);
          }.bind(res));
        });
    });

    it('check for forwarded post', (done) =>
    {

      chai.request(server)
        .get('/v1/users/status')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenBob)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            assert.isTrue(res.body.success);
            expect(res.body.posts).to.have.lengthOf(1);
          }.bind(res));
        });
    });

    it('forward the post again', (done) =>
    {

      chai.request(server)
        .post('/v1/forwards')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenBob)
        .send({ post_id: "3", post_user_id: "2" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(201);
            assert.isTrue(res.body.success);
          }.bind(res));
        });
    });

    it('check forward count for post #3', (done) =>
    {

      chai.request(server)
        .get('/v1/posts')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenJohn)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            let obj = res.body.newposts.find(x => x.id === 3 && !x.hasOwnProperty('forwarded'));
            assert.equal(obj.number_of_forwards, 2);
          }.bind(res));
        });
    });

    it('check forward count for forwarded post #3', (done) =>
    {

      chai.request(server)
        .get('/v1/posts')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenBob)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            let obj = res.body.newposts.find(x => x.id === 3);
            assert.equal(obj.number_of_forwards, 1);
          }.bind(res));
        });
    });
  });

  describe('Testing Favorites', function ()
  {

    it('Max Mustermann is now no favorite friend of John Doe', (done) =>
    {

      var x = new XMLHttpRequest();
      x.onreadystatechange = function ()
      {
        if (x.readyState === 4)
        {
          testAsync(done, function ()
          {
            assert.isTrue(JSON.parse(x.response).success);
          }.bind(x.response));
        }
      }
      x.open("PATCH", server+"/v1/friends/1");
      x.setRequestHeader('Accept', 'application/json');
      x.setRequestHeader('Content-type', 'application/json; charset=utf-8');
      x.setRequestHeader('Authorization', tokenJohn);
      x.send('{"favorite":null}');

    });

    it('Bob Checks Favorite Friends of John Doe', (done) =>
    {

      chai.request(server)
        .get('/v1/friends/getfavoritefriends/2')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenBob)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            assert.isTrue(res.body.success);
            expect(res.body.friends).to.have.lengthOf(1);
          }.bind(res));
        });
    });
  });

  describe('Double Invitation => duplicate friendship entries (Mantis #390)', function ()
  {

    let Bob2MaxInvitationID = 0;

    it('Bob invites Max', (done) =>
    {

      chai.request(server)
        .post('/v1/invitations')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenBob)
        .send({ email: "max.mustermann@email.com" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(201);
            assert.equal(true, res.body.success);
            Bob2MaxInvitationID = res.body.invitation.id;
          }.bind(res));
        });
    });

    it('Max invites Bob', (done) =>
    {

      chai.request(server)
        .post('/v1/invitations')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenMax)
        .send({ email: "bob.mueller@email.com" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(201);
            assert.equal(true, res.body.success);
          }.bind(res));
        });
    });

    it('Max accepts invitation from Bob', (done) =>
    {

      chai.request(server)
        .post('/v1/invitations/accept/' + Bob2MaxInvitationID)
        .set('Content-type', 'application/json')
        .set('Authorization', tokenMax)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            assert.isTrue(res.body.success);
          }.bind(res));
        });
    });

    it('Bobs invitation should be gone', (done) =>
    {

      chai.request(server)
        .get('/v1/invitations')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenBob)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            assert.isTrue(res.body.success);
            expect(res.body.invitations).to.have.lengthOf(0);
          }.bind(res));
        });
    });

    it('Bob invites Max again', (done) =>
    {

      chai.request(server)
        .post('/v1/invitations')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenBob)
        .send({ email: "max.mustermann@email.com" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(409);
            assert.equal(false, res.body.success);
          }.bind(res));
        });
    });

  });

  describe('Testing locked friends and automatic favorisation', function ()
  {

    for (let i = 0; i < 14; ++i)
    {
      let CurrentInvitationID = 0;
      let CurrentUserID = 0;

      it('create user #' + i, (done) =>
      {

        chai.request(server)
          .post('/v1/users')
          .set('Content-type', 'application/json')
          .send({ email: "max" + i + ".mustermann@email.com", password: "secure-password" + i, name: "Max" + i })
          .end((err, res) =>
          {
            testAsync(done, function ()
            {
              expect(res).to.have.status(201);
              assert.equal(true, res.body.success);
              CurrentUserID = res.body.user.id;
            }.bind(res));
          });
      });

      it('Max send invitation to user #' + i, (done) =>
      {

        chai.request(server)
          .post('/v1/invitations')
          .set('Content-type', 'application/json')
          .set('Authorization', tokenMax)
          .send({ email: "max" + i + ".mustermann@email.com" })
          .end((err, res) =>
          {
            testAsync(done, function ()
            {
              expect(res).to.have.status(201);
              assert.isTrue(res.body.success);
              CurrentInvitationID = res.body.invitation.id;
            }.bind(res));
          });
      });

      it('User #' + i + ' accepts invitation from Max', (done) =>
      {

        chai.request(server)
          .post('/v1/invitations/accept/' + CurrentInvitationID)
          .set('Content-type', 'application/json')
          .set('Authorization', tokenMax)
          .end((err, res) =>
          {
            testAsync(done, function ()
            {
              expect(res).to.have.status(200);
              assert.isTrue(res.body.success);
            }.bind(res));
          });
      });

      /*        it('User #'+i+' is now locked', (done) => {
      
                var x=new XMLHttpRequest();
                x.onreadystatechange = function() {
                  if (x.readyState === 4) {
                    testAsync(done, function(){
                        assert.isTrue(JSON.parse(x.response).success);
                  }.bind(x.response));
                  }
                }
                x.open("PATCH", "http://192.168.56.101:3000/v1/friends/"+CurrentUserID);
                x.setRequestHeader('Accept', 'application/json');
                x.setRequestHeader('Content-type', 'application/json; charset=utf-8');
                x.setRequestHeader('Authorization', tokenJohn);
                x.send('{"favorite":"'+Date().toString()+'", "locked":"true"}');
                
            });*/

      let infoText = (i > 11) ? 'User #' + i + ' can\'t be locked' : 'User #' + i + ' is now locked';
      it(infoText, (done) =>
      {

        var x = new XMLHttpRequest();

        x.open("PATCH", server+"/v1/friends/" + CurrentUserID, false);
        x.setRequestHeader('Accept', 'application/json');
        x.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        x.setRequestHeader('Authorization', tokenMax);
        x.send('{"favorite":"' + Date().toString() + '", "locked":"true"}');

        if (x.readyState === 4)
        {
          testAsync(done, function ()
          {
            if (i > 11)
            {
              expect(x).to.have.status(409);
              assert.isFalse(JSON.parse(x.response).success);
            }
            else
            {
              expect(x).to.have.status(200);
              assert.isTrue(JSON.parse(x.response).success);
            }
          }.bind(x.response));
        };
      });

    }

  });
  describe('Give proper error on friend not found', function ()
  {

    let Bob2MaxInvitationID = 0;

    it('Trying to patch not existing friend', (done) =>
    {

      var x = new XMLHttpRequest();

      x.open("PATCH", server+"/v1/friends/568", false);
      x.setRequestHeader('Accept', 'application/json');
      x.setRequestHeader('Content-type', 'application/json; charset=utf-8');
      x.setRequestHeader('Authorization', tokenMax);
      x.send('{"favorite":"' + Date().toString() + '", "locked":"true"}');

      if (x.readyState === 4)
      {
        testAsync(done, function ()
        {
          expect(x).to.have.status(404);
          assert.isFalse(JSON.parse(x.response).success);
        }.bind(x.response));
      };

    });

  });
  /*
    describe('Send Message', function() {
  
      it('send to Admin', (done) => {
  
        chai.request(server)
        .post('/v1/xmpp/')
        .set('Content-type','application/json')
        .set('Authorization',tokenMax)
        .send({to: "admin@nurogames.com", message: `Hello, how are you?`})
        .end((err, res) => {
            testAsync(done, function(){
                     expect(res).to.have.status(200);
                     assert.isTrue(res.body.success);
            }.bind(res));
        });
      });
    });*/

  describe('Send Mail Invitation', function ()
  {
    it('Invite User which isn\'t registered -> error not found', (done) =>
    {
      chai.request(server)
        .post('/v1/invitations')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenMax)
        .send({ email: "robert.mueller@nurogames.com" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(404);
            assert.equal(false, res.body.success);
          }.bind(res));
        });
    });

    it('Invite User which isn\'t registered -> external email', (done) =>
    {
      chai.request(server)
        .post('/v1/invitations/bymail')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenMax)
        .send({ email: "robert.mueller@nurogames.com", public_text: "I'm Happy to Welcome Robert!" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(201);
            assert.equal(true, res.body.success);
          }.bind(res));
        });
    });

    it('Register new User with external email', (done) =>
    {
      chai.request(server)
        .post('/v1/users')
        .set('Content-type', 'application/json')
        .send({ email: "robert.mueller@nurogames.com", password: "secure-password", name: "Robert" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(201);
            assert.equal(true, res.body.success);
          }.bind(res));
        });
    });

    it('user login Robert', (done) =>
    {

      chai.request(server)
        .post('/v1/users/login')
        .set('Content-type', 'application/json')
        .send({ email: "robert.mueller@nurogames.com", password: "secure-password" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            if (err)
            {
              throw new Error(err);
            }
            expect(res).to.have.status(200);
            assert.equal(true, res.body.success);
            assert.isNotNull(res.body.token);
            tokenRobert = res.body.token;
          }.bind(res));
        });
    });
    let RobertsInvitationID = 0;
    it('user Robert get status', (done) =>
    {

      chai.request(server)
        .get('/v1/users/status')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenRobert)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            if (err)
            {
              throw new Error(err);
            }
            expect(res).to.have.status(200);
            assert.equal(true, res.body.success);
            expect(res.body.invitations).to.have.lengthOf(1);
            RobertsInvitationID = res.body.invitations[0].id;
          }.bind(res));
        });
    });

    it('accept invitation from Max Mustermann', (done) =>
    {

      chai.request(server)
        .post('/v1/invitations/accept/' + RobertsInvitationID)
        .set('Content-type', 'application/json')
        .set('Authorization', tokenRobert)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            assert.isTrue(res.body.success);
          }.bind(res));
        });
    });

    it('get all posts of the current user', (done) =>
    {

      chai.request(server)
        .get('/v1/posts')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenRobert)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            expect(res.body.newposts).to.have.lengthOf(4);
          }.bind(res));
        });
    });

  });

  describe('Ask for Invitation Permission', function ()
  {
    it('Invite User which you need permission for', (done) =>
    {
      chai.request(server)
        .post('/v1/invitations/byuserid')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenRobert)
        .send({ friend_id: 2, permission_user_id: 1, public_text: "Ha it Works!" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(201);
            assert.equal(true, res.body.success);
          }.bind(res));
        });
    });

    let RobertsInvitationID = 0;
    it('user John get status', (done) =>
    {

      chai.request(server)
        .get('/v1/users/status')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenJohn)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            if (err)
            {
              throw new Error(err);
            }
            expect(res).to.have.status(200);
            assert.equal(true, res.body.success);
            expect(res.body.invitations).to.have.lengthOf(0);
          }.bind(res));
        });
    });

    it('user max get status', (done) =>
    {

      chai.request(server)
        .get('/v1/users/status')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenMax)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            if (err)
            {
              throw new Error(err);
            }
            expect(res).to.have.status(200);
            assert.equal(true, res.body.success);
            expect(res.body.invitations).to.have.lengthOf(2);
            let obj = res.body.invitations.find(x => x.approve == true);
            assert.isNotNull(obj);
            RobertsInvitationID = obj.id;
          }.bind(res));
        });
    });

    it('Permit invitation from Robert', (done) =>
    {

      chai.request(server)
        .post('/v1/invitations/accept/' + RobertsInvitationID)
        .set('Content-type', 'application/json')
        .set('Authorization', tokenMax)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            assert.isTrue(res.body.success);
          }.bind(res));
        });
    });

    it('user John get status again', (done) =>
    {

      chai.request(server)
        .get('/v1/users/status')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenJohn)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            if (err)
            {
              throw new Error(err);
            }
            expect(res).to.have.status(200);
            assert.equal(true, res.body.success);
            expect(res.body.invitations).to.have.lengthOf(1);
            RobertsInvitationID = res.body.invitations[0].id;
          }.bind(res));
        });
    });

    it('accept invitation from Robert', (done) =>
    {

      chai.request(server)
        .post('/v1/invitations/accept/' + RobertsInvitationID)
        .set('Content-type', 'application/json')
        .set('Authorization', tokenJohn)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            assert.isTrue(res.body.success);
          }.bind(res));
        });
    });

  });

  describe('Testing Messages', function ()
  {
    it('Send Message from Max to John', (done) =>
    {
      chai.request(server)
        .post('/v1/messages')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenMax)
        .send({ to: 2, message: "New Message!" })
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            assert.equal(true, res.body.success);
          }.bind(res));
        });
    });

    it('John checks for Messages', (done) =>
    {
      this.timeout(15000);
      chai.request(server)
        .get('/v1/messages')
        .set('Content-type', 'application/json')
        .set('Authorization', tokenJohn)
        .end((err, res) =>
        {
          testAsync(done, function ()
          {
            expect(res).to.have.status(200);
            assert.equal(true, res.body.success);
          }.bind(res));
        });
    });
  });
});
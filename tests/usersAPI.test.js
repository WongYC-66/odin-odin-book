process.env.NODE_ENV = 'test'

const request = require('supertest');
const app = require('../app'); // Import the Express app

describe('Users API', () => {
  let token;

  // ----- before all -----
  beforeAll(async () => {
    // Setup code here if needed, e.g., connecting to a test database
    await request(app)
      .post('/users/sign-up')
      .send({ username: 'testuser', password: 'testpassword' });

    const response = await request(app)
      .post('/users/login')
      .send({ username: 'testuser', password: 'testpassword' });

    token = response.body.token;

    await request(app)
      .post('/users/sign-up')
      .send({ username: 'dummyuser1', password: 'dummypassword' });

    await request(app)
      .post('/users/sign-up')
      .send({ username: 'dummyuser2', password: 'dummypassword' });
  });
  // ----- before all -----

  // ----- after all -----
  afterAll(async () => {
    // Cleanup code here if needed, e.g., closing database connections
    // Note: Implement cleanup logic if you have a test database
    // await prisma.$disconnect();
  });
  // ----- after all -----


  it('should sign up a new user', async () => {
    const response = await request(app)
      .post('/users/sign-up')
      .send({ username: 'newuser', password: 'newpassword' });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('should login an existing user', async () => {
    const response = await request(app)
      .post('/users/login')
      .send({ username: 'testuser', password: 'testpassword' });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  it('should follow an existing user', async () => {
    const response = await request(app)
      .post('/users/follow')
      .set('Authorization', `Bearer ${token}`)
      .send({ followId: '2'});

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('User followed successfully');
  });

  it('should not follow an existing user without authentication', async () => {
    const response = await request(app)
      .post('/users/follow')
      .send({ followId: '2'});

    expect(response.statusCode).toBe(401);
  });

  it('should return 404 for non-existent user to follow', async () => {
    const response = await request(app)
      .post('/users/follow')
      .set('Authorization', `Bearer ${token}`)
      .send({ followId: '152232'});

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('should unfollow an existing user', async () => {
    const response = await request(app)
      .post('/users/unfollow')
      .set('Authorization', `Bearer ${token}`)
      .send({ unfollowId: '2' });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('User unfollowed successfully');
  });

  it('should not unfollow a user without authentication', async () => {
    const response = await request(app)
      .post('/users/unfollow')
      .send({ unfollowId: '2' });

    expect(response.statusCode).toBe(401);
  });

  it('should not unfollow yourself', async () => {
    const response = await request(app)
      .post('/users/unfollow')
      .set('Authorization', `Bearer ${token}`)
      .send({ unfollowId: '1' }); // Assuming the ID is 1 for the same user

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Cannot unfollow yourself');
  });

  it('should return 404 for non-existent user to unfollow', async () => {
    const response = await request(app)
      .post('/users/unfollow')
      .set('Authorization', `Bearer ${token}`)
      .send({ unfollowId: '99349' }); // Non-existent user ID

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

});
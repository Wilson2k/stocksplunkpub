const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../server");

require("dotenv").config();

// Note: Need a local mongo db server running locally at 27017, and Redis at 6379

beforeEach(async () => {
  await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
});

/* Closing database connection after each test. */
afterEach(async () => {
  await mongoose.connection.close();
});

afterAll(async () => {
  await mongoose.connect(process.env.MONGO_CONNECTION_STRING);
  await mongoose.connection.collection("users").deleteMany({});
  await mongoose.connection.close();
});

// ********** User auth tests **********
describe("User Auth Routes", () => {
  it('Home Page', async () => {
    const response = await request(app)
      .get('/')
    expect(response.status).toBe(200)
    expect(response.text).toBe('Welcome to my stock app.')
  })

  it('User Page No Auth', async () => {
    const response = await request(app)
      .get('/user')
    expect(response.status).toBe(403)
    expect(JSON.parse(response.text).message).toBe('Please login.')
  })

  it('User Profile Page No Auth', async () => {
    const response = await request(app)
      .get('/user/profile')
    expect(response.status).toBe(403)
    expect(JSON.parse(response.text).message).toBe('Please login.')
  })

  it('User Page Wrong Auth', async () => {
    const response = await request(app)
      .get('/user')
      .set({'x-access-token': 'foobartoken'})
    expect(response.status).toBe(401)
    expect(JSON.parse(response.text).message).toBe('Unauthorized')
  })

  it('User Profile Page Wrong Auth', async () => {
    const response = await request(app)
      .get('/user/profile')
      .set({'x-access-token': 'foobartoken'})
    expect(response.status).toBe(401)
    expect(JSON.parse(response.text).message).toBe('Unauthorized')
  })

  it('Register Fail Too Long Test', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        fname: 'FoobarFoobarFoobarFoobarFoobarFoobarFoobarFoobar',
        lname: 'User',
        email: 'test@test.com',
        password: 'testpassword',
        roles: ["user"],
      })
    expect(response.status).toBe(400)
    expect(JSON.parse(response.text).message).toBe('Invalid form input: Too long')
  })

  it('Register Fail Too Short Test', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        fname: '',
        lname: '',
        email: '',
        password: '',
        roles: ["user"],
      })
    expect(response.status).toBe(400)
    expect(JSON.parse(response.text).message).toBe('Invalid form input: Too short')
  })

  it('Register Success and Duplicate Test', async () => {
    const response = await request(app)
      .post('/register')
      .send({
        fname: 'Test',
        lname: 'User',
        email: 'test@test.com',
        password: 'testpassword',
        roles: ["user"],
      })
    expect(response.status).toBe(200)
    expect(JSON.parse(response.text).message).toBe('Successfully registered!')

    const dupe = await request(app)
      .post('/register')
      .send({
        fname: 'Test',
        lname: 'User',
        email: 'test@test.com',
        password: 'testpassword',
        roles: ["user"],
      })
    expect(dupe.status).toBe(400)
    expect(JSON.parse(dupe.text).message).toBe('Registration failed, email is already in use.')
  })

  it('Login Wrong Email Test', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'foobar',
        password: 'testpassword',
      })
    expect(response.status).toBe(404)
    expect(JSON.parse(response.text).message).toBe('Account not found')
  })

  it('Login Wrong Password Test', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'foobar',
      })
    expect(response.status).toBe(401)
    expect(JSON.parse(response.text).message).toBe('Incorrect Password')
  })

  it('Login Success Test', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'testpassword',
      })
    expect(response.status).toBe(200)
  })

  it('User Page Success Test', async () => {
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'testpassword',
      })
    expect(loginResponse.status).toBe(200)

    // loginResponse contains signed JWT token if successful
    const user = JSON.parse(loginResponse.text)

    const userPage = await request(app)
      .get('/user')
      .send(user)
      .set('x-access-token', user.accessToken)
    expect(userPage.status).toBe(200)
    expect(userPage.text).toBe('User Content.')
  })

  it('User Profile Bad Auth Test', async () => {
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'testpassword',
      })
    expect(loginResponse.status).toBe(200)

    // Modify access token to get bad auth
    let user = JSON.parse(loginResponse.text)
    user.accessToken = 'foo'

    const userProfile = await request(app)
      .get('/user/profile')
      .send(user)
      .set('x-access-token', user.accessToken)
    expect(userProfile.status).toBe(401)
  })

  it('User Profile Bad Auth Test', async () => {
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'testpassword',
      })
    expect(loginResponse.status).toBe(200)

    // Modify access token to get bad auth
    let user = JSON.parse(loginResponse.text)
    user.accessToken = 'foo'

    const userProfile = await request(app)
      .get('/user/profile')
      .send(user)
      .set('x-access-token', user.accessToken)
    expect(userProfile.status).toBe(401)
  })

  it('User Profile Success Test', async () => {
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'testpassword',
      })
    expect(loginResponse.status).toBe(200)

    // loginResponse contains signed JWT token if successful
    const user = JSON.parse(loginResponse.text)

    const userProfile = await request(app)
      .get('/user/profile')
      .send(user)
      .set('x-access-token', user.accessToken)
    expect(userProfile.status).toBe(200)
    expect(JSON.parse(userProfile.text).email).toBe('test@test.com')
    expect(JSON.parse(userProfile.text).balance).toBe(0)
    expect(JSON.parse(userProfile.text).cash).toBe(0)
    expect(JSON.parse(userProfile.text).portfolioValue).toBe(0)
  })
});

// ********** Add funds tests **********
describe("User Add Funds", () => {
  it('User Add Funds Bad Input Test', async () => {
    // For middleware
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'testpassword',
      })
    expect(loginResponse.status).toBe(200)
    const user = JSON.parse(loginResponse.text)
    // Malform amount input
    const testAmount = '*123/321.02s'
    const userAddFunds = await request(app)
      .put('/user/add')
      .send(user)
      .query({amount: testAmount})
      .set('x-access-token', user.accessToken)
    expect(userAddFunds.status).toBe(400)
    expect(JSON.parse(userAddFunds.text).message).toBe('Error adding funds')

    const data = await mongoose.connection.collection("users").findOne(user.userId)
    expect(data.cash).toBe(0)
  })

  it('User Add Negative Funds Test', async () => {
    // For middleware
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'testpassword',
      })
    expect(loginResponse.status).toBe(200)
    const user = JSON.parse(loginResponse.text)
    // Malform amount input
    const testAmount = '-500'
    const userAddFunds = await request(app)
      .put('/user/add')
      .send(user)
      .query({amount: testAmount})
      .set('x-access-token', user.accessToken)
    expect(userAddFunds.status).toBe(400)
    expect(JSON.parse(userAddFunds.text).message).toBe('Cannot add negative amount')


    const data = await mongoose.connection.collection("users").findOne(user.userId)
    expect(data.cash).toBe(0)
  })

  it('User Add Funds Success Test', async () => {
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'testpassword',
      })
    expect(loginResponse.status).toBe(200)

    // loginResponse contains signed JWT token if successful
    const user = JSON.parse(loginResponse.text)
    const testAmount = '500'

    const userAddFunds = await request(app)
      .put('/user/add')
      .send(user)
      .query({amount: testAmount})
      .set('x-access-token', user.accessToken)
    expect(userAddFunds.status).toBe(200)
    expect(JSON.parse(userAddFunds.text).credited).toBe(testAmount)

    const addedFunds = await mongoose.connection.collection("users").findOne(user.userId)
    expect(addedFunds.cash).toBe(500)
  })
})

// ********** Buy stock tests **********
// Uses previously added funds
describe("User Buy Stock Tests", () => {
  it('User Buy Fake Stock Test', async () => {
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'testpassword',
      })
    expect(loginResponse.status).toBe(200)

    // loginResponse contains signed JWT token if successful
    const user = JSON.parse(loginResponse.text)
    const testNumShares = '1'
    const testTicker = 'asdasdasdkasjd'

    const userBuyStock = await request(app)
      .put(`/user/buy/${testTicker}`)
      .send(user)
      .query({volume: testNumShares})
      .set('x-access-token', user.accessToken)
    expect(userBuyStock.status).toBe(400)
  })

  it('User Buy Stock Success Test', async () => {
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'testpassword',
      })
    expect(loginResponse.status).toBe(200)

    // loginResponse contains signed JWT token if successful
    const user = JSON.parse(loginResponse.text)
    const testNumShares = '1'
    const testTicker = 'AMD'

    const userBuyStock = await request(app)
      .put(`/user/buy/${testTicker}`)
      .send(user)
      .query({volume: testNumShares})
      .set('x-access-token', user.accessToken)
    expect(userBuyStock.status).toBe(200)
  })
})

// ********** Sell stock tests **********
// Uses previously bought stocks
describe("User Sell Stock Tests", () => {
  it('User Sell Fake Stock Test', async () => {
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'testpassword',
      })
    expect(loginResponse.status).toBe(200)

    // loginResponse contains signed JWT token if successful
    const user = JSON.parse(loginResponse.text)
    const testNumShares = '1'
    const testTicker = 'Adsadasdasdas'

    const userSellStock = await request(app)
      .put(`/user/sell/${testTicker}`)
      .send(user)
      .query({volume: testNumShares})
      .set('x-access-token', user.accessToken)
    expect(userSellStock.status).toBe(400)
  })

  it('User Sell Stock Success Test', async () => {
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'testpassword',
      })
    expect(loginResponse.status).toBe(200)

    // loginResponse contains signed JWT token if successful
    const user = JSON.parse(loginResponse.text)
    const testNumShares = '1'
    const testTicker = 'AMD'

    const userSellStock = await request(app)
      .put(`/user/sell/${testTicker}`)
      .send(user)
      .query({volume: testNumShares})
      .set('x-access-token', user.accessToken)
    expect(userSellStock.status).toBe(200)
  })
})

// ********** Remove funds tests **********
// Uses previously added funds
describe("User Remove Funds", () => {
  it('User Remove Funds Bad Input Test', async () => {
    // For middleware
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'testpassword',
      })
    expect(loginResponse.status).toBe(200)
    const user = JSON.parse(loginResponse.text)
    // Malform amount input
    const testAmount = '*123/321.02s'
    const userRemoveFunds = await request(app)
      .put('/user/remove')
      .send(user)
      .query({amount: testAmount})
      .set('x-access-token', user.accessToken)
    expect(userRemoveFunds.status).toBe(400)
    expect(JSON.parse(userRemoveFunds.text).message).toBe('Error removing funds')

    const data = await mongoose.connection.collection("users").findOne(user.userId)
    expect(data.cash).toBe(500)
  })

  it('User Remove Negative Funds Test', async () => {
    // For middleware
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'testpassword',
      })
    expect(loginResponse.status).toBe(200)
    const user = JSON.parse(loginResponse.text)
    // Malform amount input
    const testAmount = '-500'
    const userRemoveFunds = await request(app)
      .put('/user/remove')
      .send(user)
      .query({amount: testAmount})
      .set('x-access-token', user.accessToken)
    expect(userRemoveFunds.status).toBe(400)
    expect(JSON.parse(userRemoveFunds.text).message).toBe('Cannot remove negative amount')

    const data = await mongoose.connection.collection("users").findOne(user.userId)
    expect(data.cash).toBe(500)
  })

  it('User Remove Insufficient Funds Test', async () => {
    // For middleware
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'testpassword',
      })
    expect(loginResponse.status).toBe(200)
    const user = JSON.parse(loginResponse.text)
    // Malform amount input
    const testAmount = '1000'
    const userRemoveFunds = await request(app)
      .put('/user/remove')
      .send(user)
      .query({amount: testAmount})
      .set('x-access-token', user.accessToken)
    expect(userRemoveFunds.status).toBe(400)
    expect(JSON.parse(userRemoveFunds.text).message).toBe('Insufficient funds!')

    const data = await mongoose.connection.collection("users").findOne(user.userId)
    expect(data.cash).toBe(500)
  })

  it('Remove Funds Success Test', async () => {
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'testpassword',
      })
    expect(loginResponse.status).toBe(200)

    // loginResponse contains signed JWT token if successful
    const user = JSON.parse(loginResponse.text)
    const testAmount = '500'

    const userRemoveFunds = await request(app)
      .put('/user/remove')
      .send(user)
      .query({amount: testAmount})
      .set('x-access-token', user.accessToken)
      expect(userRemoveFunds.status).toBe(200)
      expect(JSON.parse(userRemoveFunds.text).removed).toBe(testAmount)
    
    const removedFunds = await mongoose.connection.collection("users").findOne(user.userId)
    expect(removedFunds.cash).toBe(0)
  })
})

// ********** Database delete tests **********
describe("User deleted test", () => {
  it('User Profile Not Found Test', async () => {
    const loginResponse = await request(app)
      .post('/login')
      .send({
        email: 'test@test.com',
        password: 'testpassword',
      })
    expect(loginResponse.status).toBe(200)

    // Delete user from database
    let user = JSON.parse(loginResponse.text)
    await mongoose.connection.collection("users").deleteMany({});

    const getUserProfile = await request(app)
      .get('/user/profile')
      .send(user)
      .set('x-access-token', user.accessToken)
    expect(getUserProfile.status).toBe(400)

    const updateUserProfile = await request(app)
      .get('/user/profile')
      .send(user)
      .set('x-access-token', user.accessToken)
    expect(updateUserProfile.status).toBe(400)
  })
})
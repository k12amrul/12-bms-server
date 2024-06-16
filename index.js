
const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_SERVER_KEY)
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000
// const cookieParser = require('cookie-parser')
// const jwt = require('jsonwebtoken');

// console.log(process.env.STRIPE_SERVER_KEY)

app.use(cors())
// app.use(cors({ 
//   origin: ["http://localhost:5173"],
// //   credentials: true

// }))
app.use(express.json())
// app.use(cookieParser())


// app.use(cors({ origin: ["http://localhost:5173", "https://eloquent-dango-c20301.netlify.app"] }))
// console.log(process.env.DB_USER)
// console.log(process.env.DB_PAS)

// 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PAS}@cluster0.uftqkre.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri = "mongodb+srv://test-server:test-server123@cluster0.uftqkre.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {


    const database = client.db("bmsDB");
    const apartmentsCollection = database.collection("apartments");
    const usersCollection = database.collection("users");
    const agreementsCollection = database.collection("agreements");
    const announceCollection = database.collection("announce");
    const paymentsCollection = database.collection("payments");
    // const usersCollection = database.collection("users");



    // app.post("/create-payment-intent", async (req, res) => {
    //   const { price  , name, email ,address } = req.body;


    //   console.log(price )

    //   const amount = parseInt(price * 100)

    //   const customer = await stripe.customers.create({
    //     name,
    //     email,
    //     address,
    //   });

    //   // Create a payment intent
    //   const paymentIntent = await stripe.paymentIntents.create({
    //     amount,
    //     currency : 'usd' ,
    //     customer: customer.id,
    //     description: `Payment for ${name}`,
    //   });

    //   // const paymentIntent = await stripe.paymentIntents.create({
    //   //   amount: amount,
    //   //   currency: 'usd',
    //   //   payment_method_types: ['card']
    //   // });

    //   res.send({
    //     clientSecret: paymentIntent.client_secret
    //   })

    // })

    app.post('/create-payment-intent', async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      console.log(amount, 'amount inside the intent')

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });

      // console.log( {paymentIntent })
      res.send({
        clientSecret: paymentIntent.client_secret
      })
    });


    app.post('/payments', async (req, res) => {
      const payment = req.body;
      const paymentResult = await paymentsCollection.insertOne(payment);

      res.send(paymentResult)

    })

    app.get('/payments', async (req, res) => {
      // const email =req.body.email 
      // const query = { email   }

      const result = await paymentsCollection.find().toArray()
      res.send(result)

    })


    // apartmentcount

    app.get('/apartmentcount', async (req, res) => {

      const count = await apartmentsCollection.estimatedDocumentCount()
      res.send({ count })
    })

    app.get('/apartments', async (req, res) => {
      const page = parseInt(req?.query.page)
      const size = parseInt(req?.query.size)

      console.log('pagination query ', page, size)
      const result = await apartmentsCollection.find()
        .skip(page * size)
        .limit(size)
        .toArray()
      res.send(result)

    })


    app.get('/agreements', async (req, res) => {

      // const query = {
      //   status : 'pending'
      // }
      const result = await agreementsCollection.find().toArray()
      res.send(result)

    })
    app.get('/agreements/:email', async (req, res) => {
      const email = req?.params.email


      const query = {
        email
      }
      const result = await agreementsCollection.find(query).toArray()
      res.send(result)

    })


    app.post('/agreements', async (req, res) => {
      const agreement = req.body
      // console.log( agreement )

      const query = { email: agreement.email }
      const exitingAgreement = await agreementsCollection.findOne(query)

      if (exitingAgreement) {
        return res.send({ message: 'you already agreement ' })
      }
      const result = await agreementsCollection.insertOne(agreement)
      res.send(result)


    })


    app.put('/agreement/update/:id', async (req, res) => {
      const id = req.params.id
      const agreement = req.body
      // console.log( req.body)
      // console.log( req)
      const query = { _id: new ObjectId(id) }
      const updatedDoc = {
        $set: {
          // ...agreement 
          status: agreement.status,
          agreementAcceptDate: new Date(),


        }
      }
      const result = await agreementsCollection.updateOne(query, updatedDoc)
      res.send(result)
    })

    // Make announcement:

    app.post('/announcement', async (req, res) => {

      const announcement = req.body

      const result = await announceCollection.insertOne(announcement)
      res.send(result)

    })

    app.get('/announcement', async (req, res) => {
      const result = await announceCollection.find().toArray()
      res.send(result)
    })


    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)

    })

    app.get('/user/:email', async (req, res) => {
      const email = req.params.email
      // console.log( email )
      const query = { email: email }
      const result = await usersCollection.findOne(query)
      res.send(result)

    })



    app.post('/users', async (req, res) => {
      const user = req.body
      const query = { email: user.email }
      const exitingUser = await usersCollection.findOne(query)
      if (exitingUser) {
        return res.send({ message: 'already exiting User' })
      }

      const result = await usersCollection.insertOne(user)

      res.send(result)


    })

    app.put('/user/update', async (req, res) => {
      // const id = req.params.id
      const user = req.body
      console.log(user)
      const email = user?.email
      const query = { email: email }
      const updatedDoc = {
        $set: {
          role: user.role, time: new Date()


        }
      }
      const result = await usersCollection.updateOne(query, updatedDoc)
      res.send(result)
    })



    app.get('/', (req, res) => {
      res.send('a-12 server testing successfully ')
    })






  } finally {

  }
}
run().catch(console.dir);




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000
// const cookieParser = require('cookie-parser')
// const jwt = require('jsonwebtoken');


app.use(cors())
app.use(cors({
  origin: ["http://localhost:5173"],
//   credentials: true

}))
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
    // const artsCollection = database.collection("arts");
    // const usersCollection = database.collection("users");


app.get( '/apartments' ,async ( req , res ) => {

  const result = await apartmentsCollection.find( ).toArray( )

  res.send( result )

})

    app.get('/arts',  async (req, res) => {
        // console.log(req.cookies.token)
  
        const query = artsCollection.find()//.limit(6)
        const result = await query.toArray()
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
  
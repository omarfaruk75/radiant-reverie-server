const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT||5000;
const app = express();
//middleware

const corsOptions = {
    origin:["http://localhost:5173","http://localhost:5174"],
    credentials:true,
    OptionSuccessStatus:200,
}
app.use(cors(corsOptions))

app.use(express.json())



const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2lcaz14.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        const serviceCollection = client.db('radiantSalon').collection('addService')
        const serviceProviderCollection = client.db('radiantSalon').collection('providerService')
    
        //get all service data 
    app.get("/service", async(req,res)=>{
        const result = await serviceCollection.find().toArray()
        res.send(result);
    })

    //provider service data
    app.post("/pservice", async(req,res)=>{
      const serviceData = req.body
        const result = await serviceProviderCollection.insertOne(serviceData)
        res.send(result);
    })
    // post Service data
    app.post("/postService", async(req,res)=>{
      const postServiceData = req.body
      const result = await serviceCollection.insertOne(postServiceData)
      res.send(result);
    })


 //get a single service data  from db using service id
app.get("/service/:id",async(req,res)=>{
  const id = req.params.id
  const query = {_id: new ObjectId(id)}
  const result = await serviceCollection.findOne(query)
  console.log(result)
  res.send(result)
})




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);


app.get('/',async(req,res)=>{
    res.send('Hello from radiant reverie server')
})

app.listen(port,()=>console.log(`server runnig on port: ${port}`))
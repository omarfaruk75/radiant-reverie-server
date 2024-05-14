const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT||5000;
const app = express();
//middleware

const corsOptions = {
    origin:["http://localhost:5173","http://localhost:5174","https://radiant-reverie.web.app"],
    credentials:true,
    OptionSuccessStatus:200,
}
app.use(cors(corsOptions))

app.use(express.json())



const uri =`mongodb+srv://${process.env.DB_USER_KEY}:${process.env.DB_PASS_VALUE}@cluster0.2lcaz14.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        const serviceBookedCollection = client.db('radiantSalon').collection('providerService')
    
//json web token
app.post('/jwt',async(req,res)=>{
  const user=req.body
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
    expiresIn:'7d'
  })
  res.cookie('token',token,{
    httpOnly:true,
    secure:process.env.NODE_ENV==='production',
    sameSite:process.env.NODE_ENV==='production'?'none':'strict',
  })
  .send({success:true})
})
//clear token 

app.get('/logout',(req,res)=>{
  res.clearCookie('token',{
    httpOnly:true,
    secure:process.env.NODE_ENV==='production',
    sameSite:process.env.NODE_ENV==='production'?'none':'strict',
    maxAge:0,
  })
  .send({success:true})
})

        //get all service data 

app.get("/service", async (req, res) => {
    const search = req.query.search;
    let query = {};

    if (search) {
        query = {
            serviceName: {
                $regex: search,
                $options: 'i'
            }
        };
    }

    try {
        const result = await serviceCollection.find(query).toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({ error: "Error fetching services" });
    }
});

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
//delete service data

app.delete("/service/:id",async(req,res)=>{
  const id = req.params.id
  const query = {_id: new ObjectId(id)}
  const result = await serviceCollection.deleteOne(query)
  console.log(result)
  res.send(result)
})
// update service data
app.put('/service/:id',async (req,res)=>{
  const id = req.params.id
  const serviceData= req.body
  console.log(id)
  const query = {_id: new ObjectId(id)}
  const options= {upsert:true}
  const updateDoc ={
    $set:{
      ...serviceData,
    }
  }
  const result = await serviceCollection.updateOne(query,updateDoc,options)
  console.log(result)
  res.send(result) 
})


 app.get("/services/:email",async(req,res)=>{
      const email = req.params.email
      const query = {'provider.email':email}
      console.log(query)
      const result = await serviceCollection.find(query).toArray()
      res.send(result)
    })

    
    //provider service data
    app.post("/bookedService", async(req,res)=>{
      const serviceData = req.body
      console.log(serviceData);
        const result = await serviceBookedCollection.insertOne(serviceData)
        res.send(result);
    })
    app.get("/bookedServices/:email",async(req,res)=>{
      const email = req.params.email
      const query = {provider_email:email}
      console.log(query)
      const result = await serviceBookedCollection.find(query).toArray()
      res.send(result)
    })




    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);


app.get('/',async(req,res)=>{
    res.send('Hello from radiant reverie server')
})

app.listen(port,()=>console.log(`server runnig on port: ${port}`))
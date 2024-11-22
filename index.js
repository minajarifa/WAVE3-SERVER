const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.port || 4000;
// middleware
app.use(cors({ origin: "http://localhost:5173", optionSuccessStatus: 200 }));
app.use(express.json());

// token verification
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.send({ message: "No Token" });
  }
  const token = authorization.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_KEY_TOKEN, (err, decode) => {
    if (err) {
      return res.send({ message: "Invalid Token" });
    }
    req.decode = decode;
    next();
  });
};

// seller varification
const verifySellarToken = async (req, res, next) => {
  const email = req.decode.email;
  const query = { email: email };
  const user = await userCollection.findOne(query);
  if (user?.role !== "seller") {
    return res.send({ message: "Forbiden Access" });
  }
  next();
};

// mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.63qrdth.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// collections
const productCollection = client.db("WAVE3").collection("products");
const userCollection = client.db("WAVE3").collection("users");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    //post users in register
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existEmail = await userCollection.findOne(query);
      if (existEmail) {
        return res.send({ message: "user already exist" });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // get useUserData
    app.get("/user/:email", async (req, res) => {
      const query = { email: req.params.email };
      const user = await userCollection.findOne(query);
      if (!user) {
        return res.send({ message: "No user found" });
      }
      res.send(user);
    });
    // add products by seller
    app.post(
      "/add-products",
      verifyJWT,
      verifySellarToken,
      async (req, res) => {
        const product = req.body;
        const result = await productsCollection.insertOne(product);
        res.send(result);
      }
    );


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// api
app.get("/", (req, res) => {
  res.send("server is running by gadget shop");
});
// jwt in onAuthStateChange
app.post("/authentication", (req, res) => {
  const useEmail = req.body;
  const token = jwt.sign(useEmail, process.env.ACCESS_KEY_TOKEN, {
    expiresIn: "10d",
  });
  res.send({ token });
});
app.listen(port, () => {
  console.log(`server is running by gadget shop on port, ${port}`);
});

// arifa@gmail.com
// asma@gmail.com
// Password123!
// git add .
// git commit -m "    "
// git push
// npm run dev
// nodemon

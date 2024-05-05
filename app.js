import express from "express";
import { errorHandler, notFound } from "./errorMiddlewares.js";
import { connectToServer, getDb } from "./mongodb.js";
import { Expo } from "expo-server-sdk";
import { ObjectId } from "mongodb";

const app = express();
app.use(express.json());
app.disable("etag");
await connectToServer();

app.get("/hello", (req, res) => res.json({ message: "hello" }));

// CREATE USER
app.post("/users/create-user", async (req, res) => {
  const db = getDb();
  const { firstname, lastname, email, password,role } = req.body;
  // check user if already exist
  const user = await db.collection("users").findOne({ email });
  if (user) {
    res.status(409).json({ message: "user already exist with provided email" });
  } else {
    // create user
    await db.collection("users").insertOne({
      firstname,
      lastname,
      email,
      password,
      role,
      actif:false,
      image:'',
      createdAt: new Date()
    });
    const u = await db.collection("users").findOne({ email });
    res.status(201).json(u);
  }
});

// USER SIGN IN
app.post("/users/signin", async (req, res) => {
  const db = getDb();
  const { email, password } = req.body;
  // check user if already exist
  const user = await db.collection("users").findOne({ email });
  if (user) {
    if (password == user.password) {
      res.json(user);
    } else {
      res.status(403).json({ message: "wrong password" });
    }
  } else {
    res.status(404).json({ message: "user not found" });
  }
});

// GET ALL USERS WITH ROLE USER
app.get("/users", async (req, res) => {
  const db = getDb();
  const users = await db.collection("users").find({role:'user'}).toArray();
  res.json(users);
});

// UPDATE USER BY ID
app.put("/users/update-user", async (req, res) => {
  const { user } = req.query;

  const db = getDb();
  await db
    .collection("users")
    .updateOne({ _id: new ObjectId(user) }, { $set:{...req.body} });
  res.json({ message: "user has been updated" });
});

// SEND NOTIFICATION
app.post("/users/send-notification", async (req, res) => {
  let expo = new Expo({});
  const messages = [
    {
      to: "ExponentPushToken[fyfWH3FkPW_77mONYf2e0y]",
      title: "TITLE",
      body: "TEXT OF NOTIF HERE",
    },
  ];
  expo
    .sendPushNotificationsAsync(messages)
    .then((receipts) => {
      res.json({ messages, receipts });
    })
    .catch((error) => {
      res.json({
        message: "Error sending push notifications",
        error,
      });
    });
});

// HANDLE UNDEFINED ROUTES AND ERRORS
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));

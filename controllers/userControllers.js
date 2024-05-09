import { getDb } from "../mongodb.js";
import { Expo } from "expo-server-sdk";
import expressAsyncHandler from "express-async-handler";
import { ObjectId } from "mongodb";
import CryptoJS from "crypto-js";
import fs from 'fs'

export const createUser = expressAsyncHandler(async (req, res) => {
  const db = getDb();
  const { firstname, lastname, email, password, role,phone } = req.body;
  // check user if already exist
  const user = await db.collection("users").findOne({ email });
  if (user) {
    res.status(409).json({ message: "user already exist with provided email" });
  } else {
    const hashedPass = CryptoJS.SHA512(password).toString(CryptoJS.enc.Hex);
    // create user
    await db.collection("users").insertOne({
      firstname,
      lastname,
      email,
      password: hashedPass,
      role,
      actif: false,
      image: "",
      createdAt: new Date(),
      phone
    });
    const u = await db.collection("users").findOne({ email });
    res.status(201).json(u);
  }
});

export const signinUser = expressAsyncHandler(async (req, res) => {
  const db = getDb();
  const { email, password } = req.body;
  // check user if already exist
  const user = await db.collection("users").findOne({ email });
  if (user) {
    const hashedPass = CryptoJS.SHA512(password).toString(CryptoJS.enc.Hex);
    if (hashedPass == user.password) {
      res.json(user);
    } else {
      res.status(403).json({ message: "wrong password" });
    }
  } else {
    res.status(404).json({ message: "user not found" });
  }
});

export const getAllUsers = expressAsyncHandler(async (req, res) => {
  const db = getDb();
  const users = await db.collection("users").find({ role: "user" }).toArray();
  res.json(users);
});

export const updateUser = expressAsyncHandler(async (req, res) => {
  const { user } = req.query;

  const db = getDb(); 
  await db
    .collection("users")
    .updateOne({ _id:  new ObjectId(user) }, { $set: { ...req.body } });
    const newUserData = await db
    .collection("users")
    .findOne({ _id: new ObjectId(user) });
    res.status(201).json(newUserData);
});

export const sendNotification = expressAsyncHandler(async (req, res) => {
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


export const uploadImage = expressAsyncHandler(async (req, res) => {
    const db = getDb();
    const image = req.body.image;
    const user = req.body.user;
    if (!image) {
      res.status(400).json({ message: "No image found" });
      return;
    }
    const d = new Date();
  const time =
    d.getDate() +
    "-" +
    (d.getMonth() + 1) +
    "-" +
    d.getFullYear() +
    "__" +
    d.getHours() +
    ":" +
    d.getMinutes() +
    ":" +
    d.getMilliseconds();

    // delete existed image
    const userData = await db
      .collection("users")
      .findOne({ _id: new ObjectId(user) });
    // if (userData.image) {
    //   // delete file
    //   fs.unlinkSync(user.image);
    // }
    const fileName = user + time ;
    fs.writeFileSync(
      `images/${fileName}.png`,
      image.toString(),
      "base64",
      (err) => {
        if (err) {
          res.status(403).json({ message: "image size not allowed" });
        }
      }
    );
    // SET IMAGE VLAUE ON THE USER DOC
    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(user) },
        { $set: { image: `images/${fileName}.png` } }
      );

    const newUserData = await db
    .collection("users")
    .findOne({ _id: new ObjectId(user) });
    res.status(201).json(newUserData);
  });
  

  export const changePassword = expressAsyncHandler(async(req,res) => {
    const db =getDb()
    const user = req.query.user
    const {currentPassword,password} = req.body
    const userData = await db
    .collection("users")
    .findOne({ _id: new ObjectId(user) });
    const hashedPass = CryptoJS.SHA512(currentPassword).toString(CryptoJS.enc.Hex);
    if(hashedPass != userData.password){
        res.status(403).json({message:'wrong current password'})
    }else {
        const newHashedPassword = CryptoJS.SHA512(password).toString(CryptoJS.enc.Hex);
        await db.collection('users').updateOne({_id: new ObjectId(user)},{$set:{password:newHashedPassword}})
        const newUserData = await db
    .collection("users")
    .findOne({ _id: new ObjectId(user) });
    res.status(201).json(newUserData);
    }
  })


  export const findOneUserByID = expressAsyncHandler(async(req,res) => {
    const db = getDb()
    const user = req.query.user
    const userData = await db.collection('users').findOne({_id:new ObjectId(user)})
    res.json(userData)
  })


  export const deleteUser = expressAsyncHandler(async(req,res) => {
    const db = getDb()
    const user = req.query.user
   await db.collection('users').deleteOne({_id:new ObjectId(user)})
    res.json({message:'userDeleted'})
  })
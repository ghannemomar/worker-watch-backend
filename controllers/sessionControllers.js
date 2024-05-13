import { Expo } from "expo-server-sdk";
import { getDb } from "../mongodb.js";
import expressAsyncHandler from "express-async-handler";
import { ObjectId } from "mongodb";

export const createSession = expressAsyncHandler(async (req, res) => {
  const db = getDb();
  const { user, location } = req.body;
  const newSession = await db.collection("sessions").insertOne({
    start_time: new Date(),
    user: new ObjectId(user),
    location,
    actif: true,
  });
  const newSessionData = await db
    .collection("sessions")
    .findOne({ _id: new ObjectId(newSession.insertedId) });
  res.json(newSessionData);
});

export const getActiveSession = expressAsyncHandler(async (req, res) => {
  const db = getDb();
  const { user } = req.query;
  const session = await db.collection("sessions").findOne({
    user: new ObjectId(user),
    actif: true,
  });
  res.json(session);
});

export const getUserSessions = expressAsyncHandler(async (req, res) => {
  const db = getDb();
  const { user } = req.query;
  const session = await db
    .collection("sessions")
    .find({
      user: new ObjectId(user),
    })
    .sort({ start_time: -1 })
    .toArray();
  res.json(session);
});

export const updateSession = expressAsyncHandler(async (req, res) => {
  const { session } = req.query;
  const db = getDb();

  await db
    .collection("sessions")
    .updateOne({ _id: new ObjectId(session) }, { $set: { ...req.body ,end_time:new Date(req.body.end_time)} });
  const newSessionData = await db
    .collection("sessions")
    .findOne({ _id: new ObjectId(session) });
  res.json(newSessionData);
});

export const saveFallAndSendAlert = expressAsyncHandler(async(req,res) => {
  const {user} = req.body
  const db = getDb()
  // USER DATA
  const userData = await db.collection('users').findOne({_id:new ObjectId(user)})
// SAVE FALL DATA TO ACTIF SESSION
  await db.collection('users').updateOne({user:new ObjectId(user),actif:true},{$set:{fall:true,fallAt: new Date()}})

const admin = await db.collection('users').findOne({role:"admin",},{$set:{fall:true,fallAt: new Date()}})

let expo = new Expo({});
const messages = [
  {
    to: admin.token,
    title: "Alert worker !",
    body: `Ejri raw ${userData.firstname} ${userData.lastname} tnééék !`,
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

})
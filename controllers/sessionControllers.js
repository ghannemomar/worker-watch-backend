import { Expo } from "expo-server-sdk";
import { getDb } from "../mongodb.js";
import expressAsyncHandler from "express-async-handler";
import { ObjectId } from "mongodb";
import { tempCelcus } from "../temp.js";

export const createSession = expressAsyncHandler(async (req, res) => {
  const db = getDb();
  const { user, location } = req.body;
  await db
    .collection("users")
    .updateOne({ _id: new ObjectId(user) }, { $set: { actif: true } });
  const newSession = await db.collection("sessions").insertOne({
    start_time: new Date(),
    user: new ObjectId(user),
    location,
    actif: true,
    heart_records: [],
    distance_records: [],
    calories_records: [],
    temperature_records: [],
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
    .updateOne(
      { _id: new ObjectId(session) },
      { $set: { ...req.body, end_time: new Date(req.body.end_time) } }
    );
  const newSessionData = await db
    .collection("sessions")
    .findOne({ _id: new ObjectId(session) });
  await db
    .collection("users")
    .updateOne(
      { _id: new ObjectId(newSessionData.user) },
      { $set: { actif: false } }
    );
  res.json(newSessionData);
});

export const saveFallAndSendAlert = expressAsyncHandler(async (req, res) => {
  const { user } = req.body;
  const db = getDb();
  // USER DATA
  const userData = await db
    .collection("users")
    .findOne({ _id: new ObjectId(user) });
  // SAVE FALL DATA TO ACTIF SESSION
  await db
    .collection("sessions")
    .updateOne(
      { user: new ObjectId(user), actif: true },
      { $set: { fall: true, fallAt: new Date() } }
    );

  const sesisonData = await db
    .collection("sessions")
    .findOne({ user: new ObjectId(user), actif: true });

  const admin = await db.collection("users").findOne({ role: "admin" });

  let expo = new Expo({});

  const title = "Fall Incident Alert";
  const body = `${userData.firstname} ${userData.lastname} may have had a fall incident. Please check immediately.`;

  await db.collection("notifications").insertOne({
    createdAt: new Date(),
    title,
    body,
    session: new ObjectId(sesisonData._id),
    user: new ObjectId(user),
  });

  const messages = [
    {
      to: admin.token,
      title,
      body,
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

export const saveData = expressAsyncHandler(async (req, res) => {
  const { user } = req.query;
  const db = getDb();
  const { heartRate, distance, calories } = req.body;
  await db.collection("sessions").updateOne(
    { user: new ObjectId(user), actif: true },
    {
      $push: {
        heart_records: { value: heartRate, date: new Date() },
        calories_records: { value: calories, date: new Date() },
        distance_records: { value: distance, date: new Date() },
        temperature_records: { value: tempCelcus(), date: new Date() },
      },
    }
  );

  res.json({ message: "ok" });
});

import { getDb } from "../mongodb.js";
import expressAsyncHandler from "express-async-handler";
import { ObjectId } from "mongodb";

export const createSession = expressAsyncHandler(async (req, res) => {
  const db = getDb();
  const { user,location } = req.body;
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
    .toArray();
  res.json(session);
});

export const updateSession = expressAsyncHandler(async (req, res) => {
  const { session } = req.query;
  const db = getDb();
  await db
    .collection("sessions")
    .updateOne({ _id: new ObjectId(session) }, { $set: { ...req.body } });
  const newSessionData = await db
    .collection("sessions")
    .findOne({ _id: new ObjectId(session) });
  res.json(newSessionData);
});

import expressAsyncHandler from "express-async-handler";
import { getDb } from "../mongodb.js";

export const getNotifications = expressAsyncHandler(async (req, res) => {
  const db = getDb();
  const notifications = await db
    .collection("notifications")
    .aggregate([
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: "sessions",
          localField: "session",
          foreignField: "_id",
          as: "sessionData",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: { path: "$sessionData", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$userData", preserveNullAndEmptyArrays: true },
      },
    ])
    .toArray();
  res.json(notifications);
});

import { MongoClient } from "mongodb";

var _db;

// CONNECT TO DB
export const connectToServer = async () => {
  try {
    const client = await new MongoClient(
      "mongodb+srv://omar:21459708Az@cluster0.3dy8wme.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );
    await client.connect();
    console.log("connected to DB");
    _db = client.db("workerwatch");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

// GET DB TO INTERACT
export const getDb = () => {
  return _db;
};

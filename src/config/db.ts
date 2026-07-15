import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI as string;

export const client = new MongoClient(uri);

export async function connectDB() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const db = client.db("event-hive");

// Collection
export const eventsCollection = db.collection("events");

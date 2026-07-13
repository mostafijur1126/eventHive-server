import express from "express";
import cors from "cors";
import { ObjectId } from "mongodb";
import { eventsCollection } from "./config/db";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send({
    success: true,
    message: "Server is running...",
  });
});

app.post("/events", async (req, res) => {
  const result = await eventsCollection.insertOne(req.body);

  res.send(result);
});
app.get("/events", async (_req, res) => {
  const result = await eventsCollection.find().toArray();

  res.send(result);
});

app.get("/events/:id", async (req, res) => {
  try {
    const event = await eventsCollection.findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!event) {
      return res
        .status(404)
        .send({ success: false, message: "Event not found" });
    }

    res.send({ success: true, data: event });
  } catch (error) {
    res.status(400).send({ success: false, message: "Invalid event id" });
  }
});

export default app;

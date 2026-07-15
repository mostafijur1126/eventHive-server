import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import cors from "cors";
import { ObjectId } from "mongodb";
import { eventsCollection } from "./config/db";
import { createRemoteJWKSet, jwtVerify } from "jose-cjs";

const app = express();

app.use(cors());
app.use(express.json());

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URI}/api/auth/jwks`),
);

const verifyToken: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeaer = req.headers.authorization;

  if (!authHeaer || !authHeaer.startsWith("Bearer")) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  const token = authHeaer.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "Unauthorized" });
  }
  try {
    const { payload } = await jwtVerify(token, JWKS);

    // console.log(payload);
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ msg: "Unauthorized" });
  }
};

app.get("/", (_req, res) => {
  res.send({
    success: true,
    message: "Server is running...",
  });
});

app.post("/events", verifyToken, async (req, res) => {
  const payload = {
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await eventsCollection.insertOne(payload);

  res.send({
    success: true,
    data: {
      ...payload,
      _id: result.insertedId,
    },
  });
});

app.get("/events", async (_req, res) => {
  const result = await eventsCollection
    .find()
    .sort({ createdAt: -1 })
    .toArray();

  res.send({ success: true, data: result });
});

app.get("/events/my-events/:userId", async (req, res) => {
  const result = await eventsCollection
    .find({ createdBy: req.params.userId })
    .sort({ createdAt: -1 })
    .toArray();

  res.send({ success: true, data: result });
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

app.delete("/events/:id", async (req, res) => {
  try {
    const result = await eventsCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .send({ success: false, message: "Event not found" });
    }

    res.send({ success: true, message: "Event deleted" });
  } catch (error) {
    res.status(400).send({ success: false, message: "Invalid event id" });
  }
});

export default app;

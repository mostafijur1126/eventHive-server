"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongodb_1 = require("mongodb");
const db_1 = require("./config/db");
const jose_cjs_1 = require("jose-cjs");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const JWKS = (0, jose_cjs_1.createRemoteJWKSet)(new URL(`${process.env.CLIENT_URI}/api/auth/jwks`));
const verifyToken = async (req, res, next) => {
    const authHeaer = req.headers.authorization;
    if (!authHeaer || !authHeaer.startsWith("Bearer")) {
        return res.status(401).json({ msg: "Unauthorized" });
    }
    const token = authHeaer.split(" ")[1];
    if (!token) {
        return res.status(401).json({ msg: "Unauthorized" });
    }
    try {
        const { payload } = await (0, jose_cjs_1.jwtVerify)(token, JWKS);
        // console.log(payload);
        next();
    }
    catch (error) {
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
    const result = await db_1.eventsCollection.insertOne(payload);
    res.send({
        success: true,
        data: {
            ...payload,
            _id: result.insertedId,
        },
    });
});
app.get("/events", async (_req, res) => {
    const result = await db_1.eventsCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();
    res.send({ success: true, data: result });
});
app.get("/events/my-events/:userId", async (req, res) => {
    const result = await db_1.eventsCollection
        .find({ createdBy: req.params.userId })
        .sort({ createdAt: -1 })
        .toArray();
    res.send({ success: true, data: result });
});
app.get("/events/:id", async (req, res) => {
    try {
        const event = await db_1.eventsCollection.findOne({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (!event) {
            return res
                .status(404)
                .send({ success: false, message: "Event not found" });
        }
        res.send({ success: true, data: event });
    }
    catch (error) {
        res.status(400).send({ success: false, message: "Invalid event id" });
    }
});
app.delete("/events/:id", async (req, res) => {
    try {
        const result = await db_1.eventsCollection.deleteOne({
            _id: new mongodb_1.ObjectId(req.params.id),
        });
        if (result.deletedCount === 0) {
            return res
                .status(404)
                .send({ success: false, message: "Event not found" });
        }
        res.send({ success: true, message: "Event deleted" });
    }
    catch (error) {
        res.status(400).send({ success: false, message: "Invalid event id" });
    }
});
exports.default = app;

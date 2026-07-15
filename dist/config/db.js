"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsCollection = exports.db = exports.client = void 0;
exports.connectDB = connectDB;
const mongodb_1 = require("mongodb");
const uri = process.env.MONGODB_URI;
exports.client = new mongodb_1.MongoClient(uri);
async function connectDB() {
    try {
        await exports.client.connect();
        console.log("✅ MongoDB Connected");
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
}
exports.db = exports.client.db("event-hive");
// Collection
exports.eventsCollection = exports.db.collection("events");

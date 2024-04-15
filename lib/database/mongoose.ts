import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL
const MONGODB_DATABASE = process.env.MONGODB_DATABASE

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null, promise: null
  }
}

export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URL) throw new Error('Missing MONGODB_URL');
  if (!MONGODB_DATABASE) throw new Error('Missing MONGODB_DATABASE');

  cached.promise = 
    cached.promise || 
    mongoose.connect(MONGODB_URL, { 
      dbName: MONGODB_DATABASE, 
      bufferCommands: false
    })

  cached.conn = await cached.promise;

  return cached.conn;
}
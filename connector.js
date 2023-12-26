const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();
const saltRounds = 10; // Adjust the number of salt rounds based on your security requirements

// Replace the connection string with your MongoDB connection string
const mongoURI = process.env.DB;

async function connectToDB() {
  try {
    const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    return client.db();
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    throw error;
  }
}

async function hashIP(ip) {
  try {
    const hashedIP = await bcrypt.hash(ip, saltRounds);
    return hashedIP;
  } catch (error) {
    console.error('Error hashing IP:', error.message);
    throw error;
  }
}

async function addUserIP(db, hashedIP, likedStock) {
  try {
    const collection = db.collection('userIPs');

    // Check if the user's IP and liked stock combination already exists
    const existingEntry = await collection.findOne({ hashedIP, likedStock });

    if (!existingEntry) {
      // Insert the new entry if it doesn't exist
      await collection.insertOne({ hashedIP, likedStock, likes: 1 });
      return true;
    } else {
      // If the user already liked the stock, increment the likes count
      await collection.updateOne({ hashedIP, likedStock }, { $inc: { likes: 1 } });
      return true;
    }
  } catch (error) {
    console.error('Error adding user IP to the database:', error.message);
    return false;
  }
}

async function getStockLikes(db, likedStock) {
  try {
    const collection = db.collection('userIPs');

    // Aggregate to get the total likes for the given stock
    const result = await collection.aggregate([
      { $match: { likedStock } },
      { $group: { _id: null, totalLikes: { $sum: '$likes' } } },
    ]).toArray();

    // Return the total likes or zero if no likes are found
    return result.length > 0 ? result[0].totalLikes : 0;
  } catch (error) {
    console.error('Error fetching stock likes from the database:', error.message);
    throw error;
  }
}

module.exports = { connectToDB, hashIP, addUserIP, getStockLikes };


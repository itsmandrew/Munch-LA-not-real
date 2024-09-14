import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGO_DB_URI;

if (!uri) {
    throw new Error('Please add your MongoDB URI to .env.local');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
    // This is to allow TypeScript to recognize the global variable for MongoDB client caching.
    var _mongoClientPromise: Promise<MongoClient>;
}

const mongoClientOptions = {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
};

if (process.env.NODE_ENV === 'development') {
    // In development, use a global variable to avoid creating multiple MongoClient instances.
    if (!global._mongoClientPromise) {
        console.log('client');
        client = new MongoClient(uri, mongoClientOptions);
        
        global._mongoClientPromise = client.connect().catch(error => {
            console.error('Failed to connect to MongoDB in development:', error);
            throw error;
        });
    }
    clientPromise = global._mongoClientPromise;
} else {
    // In production, always create a new MongoClient instance.
    client = new MongoClient(uri, mongoClientOptions);
    clientPromise = client.connect().catch(error => {
        console.error('Failed to connect to MongoDB in production:', error);
        throw error;
    });
}

// Export the client promise to use in other parts of your app.
export default clientPromise;

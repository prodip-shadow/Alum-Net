const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI;
const dbname = process.env.DB_NAME;

let client;

if (uri) {
  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
} else {
  console.warn("WARNING: MONGODB_URI is not defined in environment variables. Database connection is disabled.");
}

export const dbConnect = (cname) => {
    if (!client) {
        return new Proxy({}, {
            get(target, prop) {
                return async (...args) => {
                    console.error(`Database operation '${prop}' on collection '${cname}' failed: MONGODB_URI is not defined.`);
                    throw new Error(`Database operation '${prop}' failed because MONGODB_URI is not defined in the environment variables.`);
                };
            }
        });
    }
    return client.db(dbname).collection(cname);
}

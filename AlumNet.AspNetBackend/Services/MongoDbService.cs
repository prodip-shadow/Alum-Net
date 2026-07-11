using MongoDB.Driver;

namespace AlumNet.AspNetBackend.Services
{
    public class MongoDbService
    {
        private readonly IMongoDatabase _database;

        public MongoDbService()
        {
            var connectionString = Environment.GetEnvironmentVariable("MONGODB_CONNECTION_STRING");
            var databaseName = Environment.GetEnvironmentVariable("MONGODB_DATABASE_NAME");

            var client = new MongoClient(connectionString);
            _database = client.GetDatabase(databaseName);
        }

        public IMongoCollection<T> GetCollection<T>(string collectionName)
        {
            return _database.GetCollection<T>(collectionName);
        }
       
    }
}
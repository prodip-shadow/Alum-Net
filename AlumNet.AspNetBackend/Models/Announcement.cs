
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AlumNet.AspNetBackend.Models
{
    public class Announcement
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? CreatedByUserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive {get;set;}
    }
}
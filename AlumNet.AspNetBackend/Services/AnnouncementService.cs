using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AlumNet.AspNetBackend.Models;
using MongoDB.Driver;

namespace AlumNet.AspNetBackend.Services
{
    public class AnnouncementService
    {
        private readonly IMongoCollection<Announcement> _announcements;
        public AnnouncementService(MongoDbService mongoDbService)
        {
            _announcements = mongoDbService.GetCollection<Announcement>("Announcements");
        }
    }
}
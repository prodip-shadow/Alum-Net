using AlumNet.AspNetBackend.Middlewares;
using AlumNet.AspNetBackend.Services;
using DotNetEnv;




var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

Env.Load();
builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddSingleton<MongoDbService>();



var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL");

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
    {
        policy
            .WithOrigins(frontendUrl!)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/", () => "AlumNet ASP.NET Core API is running");


app.UseCors("AllowNextJs");
app.UseMiddleware<JwtVerificationMiddleware>();


app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

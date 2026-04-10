using System.Text;
using System.Text.Json.Serialization;
using HRManagement.Controllers;
using HRManagement.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.PropertyNamingPolicy = null; // Keep original casing
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

// Add HttpClient for HRController
builder.Services.AddHttpClient<HRController>();

// DI Configuration
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<INhiemVuService, NhiemVuService>();
// builder.Services.AddScoped<ILuongService, LuongService>();

// JWT Authentication Configuration
var key = Encoding.ASCII.GetBytes("Super_Secret_Key_For_Demo_Purpose_123!");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    app.UseHttpsRedirection();
}

// Use Static Files for frontend
app.UseDefaultFiles();
app.UseStaticFiles();

// Security middlewares
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

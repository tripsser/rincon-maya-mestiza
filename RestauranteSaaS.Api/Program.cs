using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RestauranteSaaS.Api.Application.Abstractions;
using RestauranteSaaS.Api.Application.Auth;
using RestauranteSaaS.Api.Domain.Entities;
using RestauranteSaaS.Api.Features.Auth;
using RestauranteSaaS.Api.Features.Me;
using RestauranteSaaS.Api.Features.Tenant;
using RestauranteSaaS.Api.Infrastructure.Auth;
using RestauranteSaaS.Api.Infrastructure.Persistence;
using RestauranteSaaS.Api.Middleware;
using StackExchange.Redis;

JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

builder.Services.AddOpenApi();

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.Configure<DistributedSessionOptions>(builder.Configuration.GetSection(DistributedSessionOptions.SectionName));

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey));

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres"));
});

builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        options.User.RequireUniqueEmail = true;
    })
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            NameClaimType = JwtRegisteredClaimNames.Sub
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                context.Token = context.Request.Cookies[jwtOptions.CookieName];
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddSingleton<IConnectionMultiplexer>(_ =>
{
    var connectionString = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
    return ConnectionMultiplexer.Connect(connectionString);
});

builder.Services.AddScoped<CurrentUser>();
builder.Services.AddScoped<ICurrentUser>(provider => provider.GetRequiredService<CurrentUser>());
builder.Services.AddScoped<ICurrentUserSetter>(provider => provider.GetRequiredService<CurrentUser>());

builder.Services.AddScoped<CurrentContext>();
builder.Services.AddScoped<ICurrentContext>(provider => provider.GetRequiredService<CurrentContext>());
builder.Services.AddScoped<ICurrentContextSetter>(provider => provider.GetRequiredService<CurrentContext>());

builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

var app = builder.Build();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthentication();
app.UseMiddleware<SessionAuthenticationMiddleware>();
app.UseMiddleware<OperationalContextMiddleware>();
app.UseAuthorization();

app.MapAuthEndpoints();
app.MapMeEndpoints();
app.MapTenantRestaurantEndpoints();

app.Run();

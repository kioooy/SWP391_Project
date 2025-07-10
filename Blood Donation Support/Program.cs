using Blood_Donation_Support.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using Swashbuckle.AspNetCore.SwaggerUI;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Đăng ký DbContext với container DI
builder.Services.AddDbContext<BloodDonationSupportContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), x => x.UseNetTopologySuite()));

// Cấu hình xác thực JWT

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
        RoleClaimType = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    };
});

builder.Services.AddControllers();
builder.Services.AddScoped<Blood_Donation_Support.Controllers.BloodCompatibilityController>();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Blood Donation Support API", Version = "v1" });

    // Cấu hình để sắp xếp các API trong Swagger UI
    c.OrderActionsBy(apiDesc =>
    {
        // Đặt API login lên đầu
        if (apiDesc.RelativePath != null && apiDesc.RelativePath.Contains("api/User/login", StringComparison.OrdinalIgnoreCase))
        {
            return "0 - Authentication";
        }
        // Đặt các API khác theo thứ tự mặc định của chúng
        return apiDesc.RelativePath;
    });

    // Cấu hình JWT Bearer
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.\n\nExample: 'Bearer 12345abcdef'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });

    //// Add support for file uploads
    //c.OperationFilter<SwaggerFileOperationFilter>();

});

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder =>
        {
            builder.WithOrigins("http://localhost:3000") // Allow your frontend origin
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .AllowCredentials(); // Allow credentials (e.g., cookies, authorization headers)
        });
});

// Đăng ký IHttpClientFactory
builder.Services.AddHttpClient();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Blood Donation Support API v1");
        c.DocExpansion(DocExpansion.None); // Đặt tất cả các thẻ API ở trạng thái rút gọn
    });
}


app.UseHttpsRedirection();

// Use CORS policy
app.UseCors("AllowSpecificOrigin");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// For Swagger file upload support
//public class SwaggerFileOperationFilter : IOperationFilter
//{
//    public void Apply(OpenApiOperation operation, OperationFilterContext context)
//    {
//        var fileParameters = context.MethodInfo.GetParameters()
//            .Where(p => p.ParameterType.GetProperties()
//                .Any(prop => prop.PropertyType == typeof(IFormFile)))
//            .ToList();

//        if (fileParameters.Count > 0)
//        {
//            // Set content type for request body
//            if (operation.RequestBody == null)
//            {
//                operation.RequestBody = new OpenApiRequestBody();
//            }

//            // Ensure we have a dictionary for content types
//            if (operation.RequestBody.Content == null)
//            {
//                operation.RequestBody.Content = new Dictionary<string, OpenApiMediaType>();
//            }

//            // Clear existing content types and add multipart/form-data
//            operation.RequestBody.Content.Clear();
//            operation.RequestBody.Content.Add("multipart/form-data", new OpenApiMediaType
//            {
//                Schema = context.SchemaGenerator.GenerateSchema(context.MethodInfo.GetParameters()
//                    .First(p => p.ParameterType.GetProperties()
//                        .Any(prop => prop.PropertyType == typeof(IFormFile))).ParameterType, context.SchemaRepository)
//            });
//        }
//    }
//}

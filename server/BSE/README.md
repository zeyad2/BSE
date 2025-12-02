# User Authentication Implementation Guide

## 📚 What You'll Build

This guide will walk you through implementing a complete user authentication system in your .NET 9.0 Web API project with:

- **User Registration (Sign Up)** - Create new user accounts with secure password hashing
- **User Login (Sign In)** - Authenticate users and issue JWT tokens
- **JWT Token Authentication** - Secure your API endpoints
- **PostgreSQL Database** - Store user data persistently
- **Industry-Standard Architecture** - DTOs, Services, Controllers pattern

---

## ✅ Prerequisites

Before starting, ensure you have:

- **.NET 9.0 SDK** installed
- **PostgreSQL** installed and running
- **Visual Studio 2022** or **VS Code** with C# extensions
- Basic understanding of HTTP requests (GET, POST)

**Good News:** All required NuGet packages are already installed in your project!
- ✅ `Aspire.Npgsql.EntityFrameworkCore.PostgreSQL` - PostgreSQL database
- ✅ `BCrypt.Net-Next` - Password hashing
- ✅ `System.IdentityModel.Tokens.Jwt` - JWT token generation
- ✅ `AutoMapper.Extensions.Microsoft.DependencyInjection` - Object mapping
- ✅ `NSwag.AspNetCore` - API documentation/testing UI

---

## 🗂️ Project Architecture Overview

Your project follows a clean architecture pattern:

```
BSE/
├── Controllers/      → Handle HTTP requests/responses (API endpoints)
├── Services/         → Business logic (authentication, validation)
├── Repositories/     → Data access layer (optional, for complex queries)
├── DTOs/            → Data Transfer Objects (API contracts)
├── Entities/        → Database models (your User, Blog, BlogImage)
├── Data/            → Database context (EF Core configuration)
├── Mappings/        → AutoMapper profiles (Entity ↔ DTO conversion)
└── Program.cs       → Application entry point & configuration
```

**The Workflow:**
1. **Client** sends HTTP request →
2. **Controller** receives it →
3. **Service** processes business logic →
4. **Database Context** accesses data →
5. **Response** flows back to client

---

## 🚀 Step-by-Step Implementation

### **STEP 1: Configure Database Connection**

#### 1.1 Add Connection String to `appsettings.json`

Open `appsettings.json` and add the `ConnectionStrings` section:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=bse_db;Username=your_username;Password=your_password"
  },
  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyMinimum32CharactersLongForHS256Algorithm!",
    "Issuer": "BSE_API",
    "Audience": "BSE_Client",
    "ExpirationMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

**🔧 What to change:**
- Replace `your_username` with your PostgreSQL username (default: `postgres`)
- Replace `your_password` with your PostgreSQL password
- Replace `bse_db` with your desired database name (it will be created automatically)

**🔐 Important - Secret Key:**
The `SecretKey` is used to sign JWT tokens. In production, this should be:
- At least 32 characters long
- Stored in environment variables or Azure Key Vault (NOT in appsettings.json)
- For learning purposes, the example above is fine for local development

---

### **STEP 2: Complete the Database Context**

Your `AppDbContext.cs` is currently incomplete. Let's fix it!

#### 2.1 Open `Data/AppDbContext.cs` and replace with:

```csharp
using BSE.Entities;
using Microsoft.EntityFrameworkCore;

namespace BSE.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    { }

    // DbSets represent tables in your database
    public DbSet<User> Users { get; set; }
    public DbSet<Blog> Blogs { get; set; }
    public DbSet<BlogImage> BlogImages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique(); // Email must be unique
            entity.Property(u => u.Email).HasMaxLength(255);
            entity.Property(u => u.FullName).HasMaxLength(100);
            entity.Property(u => u.Role).HasMaxLength(50).HasDefaultValue("User");
        });

        // Configure Blog entity
        modelBuilder.Entity<Blog>(entity =>
        {
            entity.HasKey(b => b.Id);
            entity.Property(b => b.Title).HasMaxLength(200);

            // Configure relationship: Blog belongs to User (Author)
            entity.HasOne(b => b.Author)
                  .WithMany() // User can have many blogs
                  .HasForeignKey(b => b.AuthorId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure BlogImage entity
        modelBuilder.Entity<BlogImage>(entity =>
        {
            entity.HasKey(bi => bi.Id);
            entity.Property(bi => bi.ImageUrl).HasMaxLength(500);

            // Configure relationship: BlogImage belongs to Blog
            entity.HasOne(bi => bi.Blog)
                  .WithMany(b => b.Images)
                  .HasForeignKey(bi => bi.BlogId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
```

**📖 What this does:**
- **DbSets** define tables: `Users`, `Blogs`, `BlogImages`
- **OnModelCreating** configures:
  - Primary keys (`HasKey`)
  - Unique constraints (`HasIndex().IsUnique()`)
  - Column sizes (`HasMaxLength`)
  - Default values (`HasDefaultValue`)
  - Relationships between tables (`HasOne().WithMany()`)
  - Cascade delete behavior (when User deleted → their Blogs deleted)

---

#### 2.2 Fix `Program.cs`

Your `Program.cs` has a typo: `AppContext` should be `AppDbContext`

Find this line (around line 9):
```csharp
builder.Services.AddDbContext<AppContext>(options =>
```

**Change it to:**
```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
```

---

### **STEP 3: Understanding and Running Migrations**

#### 📚 What are Migrations?

Entity Framework Core uses **migrations** to:
1. Track changes to your C# entity classes
2. Generate SQL scripts to update the database schema
3. Keep your database structure in sync with your code

Think of migrations as "version control for your database schema."

#### 3.1 Create Your First Migration

Open a terminal in your project directory (`E:\projects\bse\server2\BSE`) and run:

```bash
dotnet ef migrations add InitialCreate
```

**What happens:**
- EF Core scans your `AppDbContext` and entity classes
- Creates a migration file in `Migrations/` folder with SQL to create tables
- Names it with timestamp + "InitialCreate"

#### 3.2 Apply Migration to Database

```bash
dotnet ef database update
```

**What happens:**
- Connects to PostgreSQL using your connection string
- Creates the `bse_db` database (if it doesn't exist)
- Runs migration SQL to create `Users`, `Blogs`, `BlogImages` tables
- Creates an `__EFMigrationsHistory` table to track applied migrations

#### 3.3 Verify Database Creation

Connect to PostgreSQL (using pgAdmin or command line) and check:
- Database `bse_db` exists
- Tables: `Users`, `Blogs`, `BlogImages`, `__EFMigrationsHistory`

#### 🔄 Future Changes

When you modify entities (add/remove properties), create a new migration:
```bash
dotnet ef migrations add DescriptiveNameOfChange
dotnet ef database update
```

**Common commands:**
```bash
# List all migrations
dotnet ef migrations list

# Remove last migration (if not applied)
dotnet ef migrations remove

# Generate SQL script without applying
dotnet ef migrations script
```

---

### **STEP 4: Create DTOs (Data Transfer Objects)**

#### 📚 Why DTOs?

DTOs are classes that define the "shape" of data for API requests/responses. They:
- **Protect your database schema** - Don't expose internal entity structure
- **Improve security** - Client can't send unexpected fields (like `Id`, `HashedPassword`)
- **Enable validation** - Add data annotations for input validation
- **Flexibility** - API contract independent of database schema

#### 4.1 Create `DTOs/SignUpRequest.cs`

```csharp
using System.ComponentModel.DataAnnotations;

namespace BSE.DTOs;

public class SignUpRequest
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public required string Email { get; set; }

    [Required(ErrorMessage = "Password is required")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    public required string Password { get; set; }

    [Required(ErrorMessage = "Full name is required")]
    [MinLength(2, ErrorMessage = "Full name must be at least 2 characters")]
    public required string FullName { get; set; }
}
```

#### 4.2 Create `DTOs/SignInRequest.cs`

```csharp
using System.ComponentModel.DataAnnotations;

namespace BSE.DTOs;

public class SignInRequest
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public required string Email { get; set; }

    [Required(ErrorMessage = "Password is required")]
    public required string Password { get; set; }
}
```

#### 4.3 Create `DTOs/AuthResponse.cs`

```csharp
namespace BSE.DTOs;

public class AuthResponse
{
    public int UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}
```

**📖 Notice:**
- Request DTOs have `[Required]` and validation attributes
- Response DTO contains the JWT `Token` to send back to client
- **We never send `HashedPassword` to client!**

---

### **STEP 5: Implement Authentication Service**

Services contain your business logic. Let's create an authentication service.

#### 5.1 Create `Services/IAuthService.cs` (Interface)

```csharp
using BSE.DTOs;

namespace BSE.Services;

public interface IAuthService
{
    Task<AuthResponse> SignUpAsync(SignUpRequest request);
    Task<AuthResponse> SignInAsync(SignInRequest request);
}
```

**📚 Why interfaces?**
- Enables dependency injection
- Makes testing easier (you can mock the interface)
- Follows SOLID principles (Dependency Inversion)

#### 5.2 Create `Services/AuthService.cs` (Implementation)

```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using BSE.Data;
using BSE.DTOs;
using BSE.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace BSE.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponse> SignUpAsync(SignUpRequest request)
    {
        // 1. Check if user already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

        if (existingUser != null)
        {
            throw new InvalidOperationException("User with this email already exists");
        }

        // 2. Hash the password using BCrypt
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // 3. Create new user entity
        var user = new User
        {
            Email = request.Email.ToLower(),
            HashedPassword = hashedPassword,
            FullName = request.FullName,
            Role = "User" // Default role
        };

        // 4. Save to database
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // 5. Generate JWT token and return response
        var token = GenerateJwtToken(user);

        return new AuthResponse
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(
                _configuration.GetValue<int>("JwtSettings:ExpirationMinutes"))
        };
    }

    public async Task<AuthResponse> SignInAsync(SignInRequest request)
    {
        // 1. Find user by email
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // 2. Verify password using BCrypt
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.HashedPassword);

        if (!isPasswordValid)
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        // 3. Generate JWT token and return response
        var token = GenerateJwtToken(user);

        return new AuthResponse
        {
            UserId = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(
                _configuration.GetValue<int>("JwtSettings:ExpirationMinutes"))
        };
    }

    private string GenerateJwtToken(User user)
    {
        // 1. Get JWT settings from configuration
        var secretKey = _configuration["JwtSettings:SecretKey"]
            ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var issuer = _configuration["JwtSettings:Issuer"];
        var audience = _configuration["JwtSettings:Audience"];
        var expirationMinutes = _configuration.GetValue<int>("JwtSettings:ExpirationMinutes");

        // 2. Create security key
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // 3. Create claims (user information stored in token)
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // Unique token ID
        };

        // 4. Create token
        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        // 5. Return token as string
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

**📖 Key Concepts:**

**BCrypt Password Hashing:**
- `BCrypt.HashPassword(password)` - Creates a one-way hash (can't be reversed)
- `BCrypt.Verify(password, hash)` - Checks if password matches the hash
- BCrypt automatically handles "salt" (random data added to password before hashing)

**JWT Token Structure:**
- **Claims** - Information stored in token (user ID, email, role)
- **Signature** - Encrypted with secret key, proves token wasn't tampered with
- **Expiration** - Token only valid for specified time (60 minutes in our config)

**Why async/await?**
- Database operations are I/O-bound (waiting for network/disk)
- `async/await` frees up threads while waiting, improving scalability
- Always use `async` for database calls in web APIs

---

### **STEP 6: Create Authentication Controller**

Controllers handle HTTP requests and return responses.

#### 6.1 Create `Controllers/AuthController.cs`

```csharp
using BSE.DTOs;
using BSE.Services;
using Microsoft.AspNetCore.Mvc;

namespace BSE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Register a new user account
    /// </summary>
    [HttpPost("signup")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SignUp([FromBody] SignUpRequest request)
    {
        try
        {
            var response = await _authService.SignUpAsync(request);
            return CreatedAtAction(nameof(SignUp), new { id = response.UserId }, response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Sign up failed: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during sign up");
            return StatusCode(500, new { error = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Authenticate user and return JWT token
    /// </summary>
    [HttpPost("signin")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> SignIn([FromBody] SignInRequest request)
    {
        try
        {
            var response = await _authService.SignInAsync(request);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning("Sign in failed for {Email}: {Message}", request.Email, ex.Message);
            return Unauthorized(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during sign in");
            return StatusCode(500, new { error = "An unexpected error occurred" });
        }
    }
}
```

**📖 Understanding Controller Attributes:**

- `[ApiController]` - Enables automatic model validation, parameter binding
- `[Route("api/[controller]")]` - Sets base URL to `/api/auth`
- `[HttpPost("signup")]` - Maps to `POST /api/auth/signup`
- `[FromBody]` - Binds JSON request body to parameter
- `[ProducesResponseType]` - Documents API responses (helps Swagger)

**Error Handling:**
- Returns appropriate HTTP status codes (201, 400, 401, 500)
- Logs errors for debugging
- Never exposes sensitive information in error messages

---

### **STEP 7: Configure Authentication in Program.cs**

Now we wire everything together in `Program.cs`.

#### 7.1 Add these namespaces at the top:

```csharp
using System.Text;
using BSE.Data;
using BSE.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
```

#### 7.2 After `builder.Services.AddDbContext...`, add:

```csharp
// Register AuthService for dependency injection
builder.Services.AddScoped<IAuthService, AuthService>();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

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
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero // Remove default 5-minute tolerance
    };
});

builder.Services.AddAuthorization();
```

#### 7.3 After `app.UseHttpsRedirection();`, add:

```csharp
app.UseAuthentication(); // Must come BEFORE UseAuthorization
app.UseAuthorization();
```

**📖 What this configures:**

- **Dependency Injection** - `AddScoped<IAuthService, AuthService>` means when a controller needs `IAuthService`, create an `AuthService` instance
- **JWT Authentication** - Validates JWT tokens on protected endpoints
- **Token Validation** - Checks issuer, audience, expiration, signature
- **Middleware Order** - Authentication must come before Authorization

#### 7.4 Complete `Program.cs` should look like:

```csharp
using System.Text;
using BSE.Data;
using BSE.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Database Configuration
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register Services
builder.Services.AddScoped<IAuthService, AuthService>();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

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
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUi(options =>
    {
        options.DocumentPath = "/openapi/v1.json";
    });
}

app.UseHttpsRedirection();

app.UseAuthentication(); // Must come BEFORE UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();
```

---

### **STEP 8: Test Your Implementation**

#### 8.1 Run the Application

```bash
dotnet run
```

The API should start on `https://localhost:5001` (or similar port).

#### 8.2 Test with BSE.http file

Create or update `BSE.http` with these requests:

```http
### Sign Up New User
POST https://localhost:5001/api/auth/signup
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe"
}

###

### Sign In
POST https://localhost:5001/api/auth/signup
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}

###

### Test Protected Endpoint (Add this after creating a protected endpoint)
GET https://localhost:5001/api/weather
Authorization: Bearer YOUR_JWT_TOKEN_HERE

###
```

**Note:** Replace `YOUR_JWT_TOKEN_HERE` with the actual token from the sign-in response.

#### 8.3 Test with Swagger UI

1. Navigate to `https://localhost:5001/swagger`
2. Find `POST /api/auth/signup`
3. Click "Try it out"
4. Enter test data:
   ```json
   {
     "email": "test@example.com",
     "password": "Test1234!",
     "fullName": "Test User"
   }
   ```
5. Click "Execute"
6. You should see a 201 response with a JWT token

**Repeat for sign-in:**
1. Use `POST /api/auth/signin`
2. Enter same email/password
3. You should receive the same user info with a new token

#### 8.4 Understanding the Response

Successful sign-up/sign-in returns:
```json
{
  "userId": 1,
  "email": "test@example.com",
  "fullName": "Test User",
  "role": "User",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2024-01-15T10:30:00Z"
}
```

**What to do with the token:**
- Store it in your client app (localStorage, cookies, etc.)
- Include it in the `Authorization` header for protected endpoints:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

#### 8.5 Create a Protected Endpoint (Optional Test)

Add this to `AuthController.cs` to test authentication:

```csharp
[HttpGet("profile")]
[Authorize] // Requires valid JWT token
[ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public IActionResult GetProfile()
{
    // User.Claims comes from the JWT token
    var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
    var name = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
    var role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

    return Ok(new
    {
        userId,
        email,
        name,
        role,
        message = "This endpoint is protected!"
    });
}
```

**Test it:**
1. Call `GET /api/auth/profile` without Authorization header → 401 Unauthorized
2. Call with valid token → 200 OK with user info

---

## 🎓 Next Steps & Enhancements

Congratulations! You've built a production-ready authentication system. Here's what to implement next:

### **1. Refresh Tokens** ⭐ Recommended
**Problem:** JWT tokens expire after 60 minutes, forcing users to sign in again.

**Solution:** Issue two tokens:
- **Access Token** (short-lived, 15 minutes) - For API requests
- **Refresh Token** (long-lived, 7 days) - To get new access tokens

**Implementation:**
- Add `RefreshToken` and `RefreshTokenExpiry` to User entity
- Create `POST /api/auth/refresh` endpoint
- Store refresh tokens securely (HttpOnly cookies recommended)

### **2. Role-Based Authorization** ⭐ Recommended
**Use Case:** Restrict certain endpoints to Admin users only.

**Implementation:**
```csharp
[HttpDelete("blogs/{id}")]
[Authorize(Roles = "Admin")] // Only Admin role can delete
public async Task<IActionResult> DeleteBlog(int id)
{
    // Delete logic
}
```

**Add Admin Creation:**
- Modify `SignUpAsync` to accept optional role parameter
- Create a seed method to create initial admin user

### **3. Email Verification**
**Use Case:** Verify user owns the email address.

**Implementation:**
- Add `IsEmailVerified` and `EmailVerificationToken` to User entity
- Send email with verification link on signup
- Create `GET /api/auth/verify-email?token=xxx` endpoint
- Prevent sign-in until email verified

### **4. Password Reset/Forgot Password**
**Implementation:**
- Add `PasswordResetToken` and `PasswordResetExpiry` to User entity
- Create `POST /api/auth/forgot-password` (sends email with reset link)
- Create `POST /api/auth/reset-password` (validates token, updates password)

### **5. Account Lockout (Security)**
**Use Case:** Prevent brute-force attacks.

**Implementation:**
- Add `FailedLoginAttempts` and `LockoutEnd` to User entity
- Increment `FailedLoginAttempts` on wrong password
- Lock account for 15 minutes after 5 failed attempts
- Reset counter on successful login

### **6. Two-Factor Authentication (2FA)**
**Implementation:**
- Use `Google.Authenticator` NuGet package
- Add `TwoFactorEnabled` and `TwoFactorSecret` to User entity
- Generate QR code for authenticator app
- Require TOTP code during sign-in

### **7. Token Blacklisting/Revocation**
**Use Case:** Invalidate tokens on logout or password change.

**Implementation:**
- Store active tokens in database or Redis
- Check if token is revoked on each authenticated request
- Revoke all user tokens on password change

### **8. Social Login (OAuth)**
**Providers:** Google, Facebook, GitHub, Microsoft

**Implementation:**
- Install `Microsoft.AspNetCore.Authentication.Google` (and others)
- Configure OAuth in Program.cs
- Create callback endpoint to handle OAuth response
- Link social account to User entity

### **9. Audit Logging**
**Track user actions for security/compliance.**

**Implementation:**
- Create `AuditLog` entity (UserId, Action, Timestamp, IpAddress)
- Log sign-ins, sign-ups, password changes, sensitive operations
- Create admin dashboard to view logs

### **10. Rate Limiting**
**Prevent API abuse.**

**Implementation:**
- Install `AspNetCoreRateLimit` NuGet package
- Configure limits (e.g., 100 requests per minute per IP)
- Apply stricter limits to auth endpoints

---

## 📚 Learning Resources

### Official Microsoft Docs
- [ASP.NET Core Web API Tutorial](https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api)
- [Entity Framework Core Documentation](https://learn.microsoft.com/en-us/ef/core/)
- [ASP.NET Core Security](https://learn.microsoft.com/en-us/aspnet/core/security/)

### JWT & Authentication
- [JWT.io](https://jwt.io/) - Decode and understand JWT tokens
- [Understanding JWT](https://auth0.com/docs/secure/tokens/json-web-tokens)

### Security Best Practices
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Password Hashing with BCrypt](https://github.com/BcryptNet/bcrypt.net)

---

## 🐛 Common Errors & Troubleshooting

### **Error: "No connection string named 'DefaultConnection' was found"**
**Cause:** Connection string not in `appsettings.json`
**Fix:** Add `ConnectionStrings` section to `appsettings.json` (see Step 1.1)

### **Error: "Unable to create migrations"**
**Cause:** EF Core CLI tools not installed
**Fix:** Run `dotnet tool install --global dotnet-ef`

### **Error: "Password verification failed"**
**Cause:** Password hashing/verification mismatch
**Fix:** Ensure you're using `BCrypt.Net.BCrypt.HashPassword` and `BCrypt.Net.BCrypt.Verify`

### **Error: 401 Unauthorized on protected endpoint**
**Cause:** JWT token missing, expired, or invalid
**Fix:**
- Check token is in `Authorization: Bearer <token>` header
- Verify token hasn't expired (`expiresAt` in response)
- Ensure `UseAuthentication()` is before `UseAuthorization()` in Program.cs

### **Error: "IDX10503: Signature validation failed"**
**Cause:** JWT SecretKey mismatch
**Fix:** Ensure same secret key in token generation and validation

### **Database connection fails**
**Cause:** PostgreSQL not running or wrong credentials
**Fix:**
- Check PostgreSQL service is running
- Verify username/password in connection string
- Test connection: `psql -U your_username -d postgres`

---

## 📝 Summary Checklist

Before moving forward, verify:

- [ ] PostgreSQL is running and connection string is configured
- [ ] `AppDbContext.cs` has all DbSets (Users, Blogs, BlogImages)
- [ ] Migrations created and applied (`dotnet ef migrations add InitialCreate` + `dotnet ef database update`)
- [ ] DTOs created (SignUpRequest, SignInRequest, AuthResponse)
- [ ] AuthService implemented with password hashing and JWT generation
- [ ] AuthController created with signup/signin endpoints
- [ ] Program.cs configured with JWT authentication
- [ ] Application runs without errors (`dotnet run`)
- [ ] Sign-up creates users successfully
- [ ] Sign-in returns valid JWT tokens
- [ ] Protected endpoints reject requests without tokens

---

## 🎉 You Did It!

You've successfully implemented:
✅ User registration with password hashing
✅ User authentication with JWT tokens
✅ PostgreSQL database integration
✅ Industry-standard architecture (DTOs, Services, Controllers)

**What you learned:**
- Entity Framework Core migrations
- Dependency injection in .NET
- BCrypt password hashing
- JWT token generation and validation
- Async/await patterns
- Error handling and logging
- API design best practices

Keep building! Next, try implementing the Blog CRUD operations using the same patterns you learned here.

Happy coding! 🚀

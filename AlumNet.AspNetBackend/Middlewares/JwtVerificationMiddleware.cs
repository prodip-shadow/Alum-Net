using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;


namespace AlumNet.AspNetBackend.Middlewares
{
    public class JwtVerificationMiddleware
    {
        private readonly RequestDelegate _next;

        public JwtVerificationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var token = context.Request.Headers.Authorization
                .FirstOrDefault()?
                .Split(" ")
                .Last();

            if (token != null)
            {
                AttachUserToContext(context, token);
            }

            await _next(context);
        }

        private void AttachUserToContext(HttpContext context, string token)
        {
            try
            {
                var secret = Environment.GetEnvironmentVariable("BACKEND_JWT_SECRET");

                if (string.IsNullOrWhiteSpace(secret))
                {
                    return;
                }

                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(secret);

                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),

                    ValidateIssuer = false,
                    ValidateAudience = false,

                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                tokenHandler.ValidateToken(
                    token,
                    validationParameters,
                    out SecurityToken validatedToken
                );

                var jwtToken = (JwtSecurityToken)validatedToken;

                var userId = jwtToken.Claims
                    .FirstOrDefault(claim => claim.Type == "userId")?
                    .Value;

                var email = jwtToken.Claims
                    .FirstOrDefault(claim => claim.Type == "email")?
                    .Value;

                var role = jwtToken.Claims
                    .FirstOrDefault(claim => claim.Type == "role")?
                    .Value;

                context.Items["userId"] = userId;
                context.Items["email"] = email;
                context.Items["role"] = role;
            }
            catch
            {
            }
        }
    }
}
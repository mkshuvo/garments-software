# Use the official .NET 8 SDK image for building the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Copy the project file and restore dependencies
COPY ["GarmentsERP.API.csproj", "."]
RUN dotnet restore "GarmentsERP.API.csproj"

# Copy the entire source code
COPY . .

# Build the application
RUN dotnet build "GarmentsERP.API.csproj" -c Release -o /app/build

# Publish the application
RUN dotnet publish "GarmentsERP.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the official ASP.NET Core runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

# Create a non-root user for security
RUN addgroup --system --gid 1001 dotnetgroup && \
    adduser --system --uid 1001 --ingroup dotnetgroup dotnetuser

WORKDIR /app

# Copy the published application
COPY --from=build /app/publish .

# Set ownership to the non-root user
RUN chown -R dotnetuser:dotnetgroup /app

# Switch to the non-root user
USER dotnetuser

# Set environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080

# Expose the port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Set the entry point
ENTRYPOINT ["dotnet", "GarmentsERP.API.dll"]

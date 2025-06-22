# Use the official .NET 8 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY ["GarmentsERP.API/GarmentsERP.API.csproj", "GarmentsERP.API/"]
RUN dotnet restore "GarmentsERP.API/GarmentsERP.API.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/GarmentsERP.API"
RUN dotnet build "GarmentsERP.API.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "GarmentsERP.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the official .NET 8 runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy the published application
COPY --from=publish /app/publish .

# Change ownership of the app directory to the appuser
RUN chown -R appuser:appuser /app

# Switch to the non-root user
USER appuser

# Expose the port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Entry point
ENTRYPOINT ["dotnet", "GarmentsERP.API.dll"]

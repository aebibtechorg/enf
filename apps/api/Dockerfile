# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files
COPY ["apps/api/Api.csproj", "apps/api/"]
COPY ["packages/contracts/Contracts.csproj", "packages/contracts/"]
COPY ["packages/infrastructure/ServiceDefaults/ServiceDefaults.csproj", "packages/infrastructure/ServiceDefaults/"]

# Restore dependencies
RUN dotnet restore "apps/api/Api.csproj"

# Copy everything else
COPY ["apps/api/", "apps/api/"]
COPY ["packages/contracts/", "packages/contracts/"]
COPY ["packages/infrastructure/ServiceDefaults/", "packages/infrastructure/ServiceDefaults/"]

# Build and publish
WORKDIR "/src/apps/api"
RUN dotnet publish "Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Api.dll"]

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY RestauranteSaaS.Api/RestauranteSaaS.Api.csproj RestauranteSaaS.Api/
RUN dotnet restore RestauranteSaaS.Api/RestauranteSaaS.Api.csproj

COPY RestauranteSaaS.Api/ RestauranteSaaS.Api/
RUN dotnet publish RestauranteSaaS.Api/RestauranteSaaS.Api.csproj \
    --configuration Release \
    --output /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
COPY ["seed inicial entidades_multitenant.sql", "seeds/initial_multitenant.sql"]

ENTRYPOINT ["dotnet", "RestauranteSaaS.Api.dll"]

# -------- Build Stage --------
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

COPY . .
RUN ./mvnw clean package -DskipTests

# -------- Run Stage --------
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/target/*SNAPSHOT.jar app.jar

ENV PORT=8080
EXPOSE 8080

CMD ["java", "-jar", "app.jar"]

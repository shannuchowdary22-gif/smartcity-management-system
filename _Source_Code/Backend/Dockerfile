
FROM maven:3.9.11-eclipse-temurin-25 AS build

WORKDIR /app

COPY _Source_Code/Backend/pom.xml ./pom.xml
COPY _Source_Code/Backend/src ./src

RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:25-jre

WORKDIR /app

COPY --from=build /app/target/smartcity-backend-1.0.0.jar ./app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]

FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY backend/ .
RUN chmod +x mvnw 2>/dev/null || true
RUN sh ./mvnw clean package -DskipTests -DskipITs || mvn clean package -DskipTests -DskipITs

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENV PORT=8080
ENTRYPOINT ["sh", "-c", "java -jar app.jar"]

# Multi-stage Dockerfile for seatflow-backend (Java 21)
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy Maven wrapper & pom.xml first for dependency caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline -B

# Copy source code & build jar
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Production image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy compiled jar from builder
COPY --from=builder /app/target/seatflow-backend-*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=dev", "app.jar"]

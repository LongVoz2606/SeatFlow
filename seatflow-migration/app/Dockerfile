FROM maven:3.9.6-eclipse-temurin-21-alpine
WORKDIR /app

COPY pom.xml /app/
COPY config /app/config
COPY sql /app/sql

RUN mvn dependency:go-offline
RUN mvn flyway:info || true

CMD ["mvn", "flyway:info", "flyway:migrate"]

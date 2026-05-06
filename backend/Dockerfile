FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY pom.xml .
RUN apk add --no-cache maven && mvn dependency:go-offline
COPY src ./src
EXPOSE 8080
CMD ["sh", "-c", "mvn spring-boot:run"]
package com.seatflow.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SeatFlow Event Ticket Booking API")
                        .version("1.0.0")
                        .description("High-concurrency Event Ticket Booking System API documentation")
                        .contact(new Contact()
                                .name("LongVoz2606")
                                .url("https://github.com/LongVoz2606/SeatFlow"))
                        .license(new License().name("MIT License").url("https://opensource.org/licenses/MIT")));
    }
}

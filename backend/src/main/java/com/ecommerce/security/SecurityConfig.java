package com.ecommerce.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(ex -> ex.authenticationEntryPoint(
                new HttpStatusEntryPoint(HttpServletResponse.SC_UNAUTHORIZED)))
            .authorizeHttpRequests(auth -> auth
                // Permitir acceso público (sin autenticación)
                .requestMatchers("/api/auth/**", "/**").permitAll()
                // Productos: GET público, POST/PATCH solo admin
                .requestMatchers("GET", "/api/products/**").permitAll()
                .requestMatchers("POST", "PATCH", "/api/products/**").hasRole("ADMIN")
                // Carrito y Órdenes: Requieren autenticación (cualquier cliente)
                .requestMatchers("/api/cart/**", "/api/orders/**").authenticated()
                // Todo lo demás requiere autenticación
                .anyRequest().authenticated())
            )
            // Desactivar form login y session management
            .httpBasic(AbstractHttpConfigurer::disable)
            .formLogin(AbstractHttpConfigurer::disable)
            .sessionManagement(sess -> sess.sessionCreationStrategy(
                org.springframework.security.config.sessionmanagement.SessionCreationState.IF_REQUIRED))
            // Agregar filtro JWT personalizado al inicio de la cadena
            .addFilterAt(jwtAuthenticationFilter, 
                         org.springframework.security.web.FilterPosition.AUTHORIZATION_FILTER);
        
        return http.build();
    }
}
package com.asta.gateway.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
                // 1. 禁用 CSRF 防护
                .csrf(ServerHttpSecurity.CsrfSpec::disable)

                // 2. 配置其他规则，例如哪些路径需要认证，哪些路径可以匿名访问
                .authorizeExchange(exchange -> exchange
                        .pathMatchers("/auth/**").permitAll() // 比如，允许所有到 /auth/** 的请求
                        .anyExchange().authenticated()        // 其他所有请求都需要认证
                );

        return http.build();
    }
}

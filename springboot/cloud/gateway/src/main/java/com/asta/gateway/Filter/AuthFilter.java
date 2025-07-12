package com.asta.gateway.Filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AuthFilter implements GlobalFilter, Ordered {

    // 从 nacos 读取
    @Value("${jwt.secret}")
    private String secret;

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    private final AntPathMatcher antPathMatcher = new AntPathMatcher();

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // 1. 跳过不需要认证的路径
        if (antPathMatcher.match("/auth/**", path)) {
            return chain.filter(exchange);
        }

        // 2. 获取JWT
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange); // 返回401
        }
        String token = authHeader.substring(7);

        // 3. 校验JWT
        try{
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret)))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // 4. 将用户信息添加到请求头，转发给下游服务
            ServerHttpRequest newRequest = request.mutate()
                    .header("X-User-Name", claims.getSubject())
                    .header("X-User-Roles", claims.get("roles", List.class).toString())
                    .build();

            return chain.filter(exchange.mutate().request(newRequest).build());
        }catch (JwtException e) {
            // JWT解析或验证失败
            return unauthorized(exchange);
        }

    }

    @Override
    public int getOrder() {
        return -1;
    }
}

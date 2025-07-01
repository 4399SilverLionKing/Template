package com.asta.backend.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${jwt.secret}") // 从 application.yml 读取 secret
    private String secret;

    @Value("${jwt.expiration}") // 从 application.yml 读取过期时间 (毫秒)
    private long expirationTime;

    /**
     * 从 token 中提取用户名
     * @param token 用户token
     * @return 用户名
     */
    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    /**
     * 从 token 中提取过期时间
     * @param token 用户token
     * @return 过期时间
     */
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    /**
     * 从 token 中提取特定的 claim
     * @param token 用户token
     * @param claimsResolver 自定义如何从 Claims 对象中提取数据，接收一个 Claims 对象作为输入，并返回一个类型为 T 的结果
     * @return 需要提取的信息
     * @param <T> 需要提取信息的类型
     */
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    /**
     * 从 token 中提取所有 claims
     * @param token 用户token
     * @return claims信息
     */
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * 检查 token 是否过期
     * @param token 用户token
     * @return 是否过期
     */
    private Boolean isTokenExpired(String token) {
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    /**
     * 生成 token (使用用户名)
     * @param userDetails 用户信息
     * @return 生成的token
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    /**
     * 生成 token (自定义 claims)
     * @param claims 自定义声明
     * @param subject 用于生成token的信息
     * @return 生成的token
     */
    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims) //设置 JWT 的 payload (claims)
                .setSubject(subject) //设置 JWT 的 subject (通常是用户名)
                .setIssuedAt(new Date(System.currentTimeMillis())) //设置 JWT 的签发时间
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime)) //设置 JWT 的过期时间
                .signWith(key()) //使用 key 签名方法对 JWT 进行签名
                .compact(); //将 JWT 构建成紧凑的字符串形式
    }

    /**
     * 签名方法
     * @return 用于 JWT 的签名和验证的 key
     */
    private Key key(){
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    /**
     * 验证 token
     * @param token 用户token
     * @param userDetails 用户信息
     * @return token是否有效
     */
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}

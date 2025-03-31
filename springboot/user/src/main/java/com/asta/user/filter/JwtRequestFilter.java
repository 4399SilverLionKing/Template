package com.asta.user.filter;

import com.asta.user.utils.JwtUtil;
import com.asta.user.service.MyUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter { //确保每个请求只执行一次过滤器

    @Autowired
    private MyUserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // 从请求 Header 中提取 Authorization 信息
        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            // 从请求 Authorization 中提取 Token 信息
            jwtToken = authorizationHeader.substring(7); // 去除 "Bearer " 前缀
            try {
                // 从 token 获取 username
                username = jwtUtil.getUsernameFromToken(jwtToken);
            } catch (Exception e) {
                // Token 解析失败或过期等情况
                logger.warn("JWT 解析失败或过期: " + e.getMessage());
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) { // 确保当前请求没有被其他过滤器认证过
            // 加载与令 token 关联的用户
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // 校验 Token（用户名匹配且未过期）
            if (jwtUtil.validateToken(jwtToken, userDetails)) {
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                usernamePasswordAuthenticationToken
                        .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                // 存储当前 request 的 Authentication 信息，将 UsernamePasswordAuthenticationToken 与该 Token 关联的 UserDetails 和 authorities 设置在一起
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }

        chain.doFilter(request, response);
    }
}

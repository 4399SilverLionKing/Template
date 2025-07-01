package com.asta.backend.config;

import com.asta.backend.filter.JwtRequestFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsService userDetailsService;

    private final JwtRequestFilter jwtRequestFilter;

    /**
     * 配置Spring Security的过滤器链。
     *
     * @param http HttpSecurity对象，用于配置HttpSecurity。
     * @return SecurityFilterChain 返回构建的过滤器链。
     * @throws Exception 如果配置过程中发生任何异常。
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 禁用CSRF保护，因为我们使用JWT进行认证
            .csrf(AbstractHttpConfigurer::disable)
            // 启用CORS，使用WebConfig中的配置
            .cors(cors -> {})
            // 配置授权规则
            .authorizeHttpRequests(auth -> auth
                    // 允许所有用户访问 /authenticate 端点，用于用户登录获取JWT
                    .requestMatchers("/authenticate/**").permitAll()
                    // 允许所有用户访问 /public/** 下的所有端点，通常用于公开资源
                    .requestMatchers("/public/**").permitAll()
                    // 除以上permitAll配置的端点外，所有其他请求都需要认证
                    .anyRequest().authenticated()
            )
            // 配置session管理
            .sessionManagement(session -> session
                    // 设置session创建策略为STATELESS，即无状态，不使用session，因为我们使用JWT
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            // 在UsernamePasswordAuthenticationFilter之前添加jwtRequestFilter，用于在用户名密码认证前先进行JWT认证
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * 配置密码编码器Bean。
     *
     * @return PasswordEncoder 返回BCryptPasswordEncoder实例，用于密码加密和验证。
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * 配置认证管理器Bean。
     * AuthenticationManager 用于处理认证请求，它会委托给配置的AuthenticationProvider。
     *
     * @param config AuthenticationConfiguration对象，用于获取AuthenticationManagerBuilder。
     * @return AuthenticationManager 返回AuthenticationManager实例。
     * @throws Exception 如果获取AuthenticationManager过程中发生任何异常。
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

}

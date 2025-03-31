package com.asta.user.config;

import com.asta.user.filter.JwtRequestFilter;
import com.asta.user.service.MyUserDetailsService;
import jakarta.annotation.Resource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity //启用Spring Security的Web安全功能。
public class SecurityConfig {

    @Resource
    private MyUserDetailsService myUserDetailsService;

    @Resource
    private JwtRequestFilter jwtRequestFilter;

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
            // 配置认证提供者，使用我们自定义的authenticationProvider
            .authenticationProvider(authenticationProvider())
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
     * 配置认证提供者Bean。
     * DaoAuthenticationProvider 是一个基于DAO的AuthenticationProvider实现，使用UserDetailsService来获取用户信息。
     *
     * @return AuthenticationProvider 返回DaoAuthenticationProvider实例。
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        // 设置UserDetailsService为我们自定义的myUserDetailsService
        authProvider.setUserDetailsService(myUserDetailsService);
        // 设置密码编码器，使用上面定义的passwordEncoder
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
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

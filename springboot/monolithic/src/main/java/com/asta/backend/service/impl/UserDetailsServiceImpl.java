package com.asta.backend.service.impl;

import com.asta.backend.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserMapper userMapper;
    /**
     *  根据用户名加载用户详细信息。
     *  此方法是 UserDetailsService 接口的实现，Spring Security 在身份验证过程中会调用此方法。
     *
     * @param username 用户名
     * @return UserDetails 用户详细信息，包含用户名、密码和权限等
     * @throws UsernameNotFoundException 如果根据用户名找不到用户，则抛出此异常
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        try {
            // 调用 userMapper 的 findByUsername 方法根据用户名从数据库中查找用户 TODO
            User user = userMapper.findByUsername(username)
                    .orElseThrow(() -> new UsernameNotFoundException("User not exists by Username or Email"));

            // 创建 Spring Security 的 UserDetails 对象并返回
            // UserDetails 是 Spring Security 定义的用户信息接口，包含了进行身份验证和授权所需的用户信息
            return new User(
                    user.getUsername(),       // 用户名
                    user.getPassword(),       // 密码
                    user.getAuthorities()     // 权限集合
            );
        } catch (Exception e) {
            throw e;
        }
    }
}

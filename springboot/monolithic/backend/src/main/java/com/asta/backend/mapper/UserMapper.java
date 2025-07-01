package com.asta.backend.mapper;

import com.asta.backend.entity.po.User;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.mapstruct.Mapper;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * <p>
 *  Mapper 接口
 * </p>
 *
 * @author asta
 * @since 2025-06-29
 */
public interface UserMapper extends BaseMapper<User> {

    /**
     * 通过用户名查找用户
     * @param username 用户名
     * @return 包含Spring Security User对象的Optional(处理用户不存在的场景)
     */
    default Optional<org.springframework.security.core.userdetails.User> findByUsername(String username) {
        // 构建查询条件
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("username", username);

        // 执行查询
        User user = selectOne(wrapper);

        // 如果用户不存在，返回空Optional
        if (user == null) {
            return Optional.empty();
        }

        // 创建权限集合
        Set<GrantedAuthority> authorities = new HashSet<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole()));

        // 创建并返回Spring Security User对象
        return Optional.of(
                new org.springframework.security.core.userdetails.User(
                        user.getUsername(),
                        user.getPassword(),
                        authorities
                )
        );
    }
}

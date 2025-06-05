package com.asta.user.mapper;

import com.asta.user.entity.Users;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * <p>
 *  Mapper 接口
 * </p>
 *
 * @author Asta
 * @since 2025-03-24
 */
@Mapper
public interface UsersMapper extends BaseMapper<Users> {
    
    /**
     * 根据用户ID查询角色名称列表
     * @param userId 用户ID
     * @return 角色名称列表
     */
    @Select("SELECT r.name FROM roles r " +
            "JOIN users_roles ur ON r.id = ur.role_id " +
            "WHERE ur.user_id = #{userId}")
    List<String> findRoleNamesByUserId(Integer userId);
    
    /**
     * 通过用户名查找用户
     * @param username 用户名
     * @return 包含Spring Security User对象的Optional(处理用户不存在的场景)
     */
    default Optional<User> findByUsername(String username) {
        // 构建查询条件
        QueryWrapper<Users> wrapper = new QueryWrapper<>();
        wrapper.eq("username", username);
        
        // 执行查询
        Users user = selectOne(wrapper);
        
        // 如果用户不存在，返回空Optional
        if (user == null) {
            return Optional.empty();
        }
        
        // 创建权限集合
        Set<GrantedAuthority> authorities = new HashSet<>();
        
        // 查询该用户所有的角色名称
        List<String> roleNames = findRoleNamesByUserId(user.getId());
        
        // 将角色名称转换为Spring Security的权限对象
        for (String roleName : roleNames) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName));
        }
        
        // 如果没有找到任何角色，至少添加一个默认的USER角色
        if (authorities.isEmpty()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }
        
        // 创建并返回Spring Security User对象
        return Optional.of(
            new User(
                user.getUsername(),
                user.getPassword(),
                authorities
            )
        );
    }
}

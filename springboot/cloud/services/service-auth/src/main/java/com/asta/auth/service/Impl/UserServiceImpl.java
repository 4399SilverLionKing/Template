package com.asta.auth.service.Impl;

import com.asta.auth.mapper.UserMapper;
import com.asta.auth.service.IUserService;
import com.asta.auth.util.JwtUtil;
import com.asta.domain.po.User;
import com.asta.domain.query.auth.LoginQuery;
import com.asta.domain.query.auth.RegisterQuery;
import com.asta.domain.vo.auth.LoginVO;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * <p>
 *  服务实现类
 * </p>
 *
 * @author asta
 * @since 2025-06-29
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserMapper mapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public LoginVO login(LoginQuery query) {

        // 1. 调用 AuthenticationManager 进行认证，认证失败会抛出异常
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        query.getUsername(),
                        query.getPassword()
                )
        );

        // 2. 认证成功，从 Authentication 对象中获取 UserDetails
        final UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // 3. 生成JWT
        final String token = jwtUtil.generateToken(userDetails);

        // 4. 封装返回结果
        LoginVO loginVO = new LoginVO();
        loginVO.setUsername(userDetails.getUsername());
        loginVO.setToken(token);

        return loginVO;
    }

    @Override
    public boolean register(RegisterQuery query) {

        // 1. 检查用户是否已经存在
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("username", query.getUsername())
                    .or()
                    .eq("email", query.getEmail());
        User existingUser = mapper.selectOne(queryWrapper);

        // 2. 如果用户已存在，返回false
        if (existingUser != null) {
            return false;
        }

        // 3. 如果用户不存在，创建新用户
        User newUser = new User();
        newUser.setUsername(query.getUsername());
        newUser.setEmail(query.getEmail());
        newUser.setRole(query.getRole());
        // 使用BCrypt加密密码
        String encodedPassword = passwordEncoder.encode(query.getPassword());
        newUser.setPassword(encodedPassword);

        // 4. 保存用户到数据库
        int result = mapper.insert(newUser);

        return result > 0;
    }
}

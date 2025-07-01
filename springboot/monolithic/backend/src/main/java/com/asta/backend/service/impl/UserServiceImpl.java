package com.asta.backend.service.impl;

import com.asta.backend.entity.po.User;
import com.asta.backend.mapper.UserMapper;
import com.asta.backend.service.IUserService;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
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
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {

}

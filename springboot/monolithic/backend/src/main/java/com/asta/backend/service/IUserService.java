package com.asta.backend.service;

import com.asta.backend.entity.po.User;
import com.asta.backend.entity.query.LoginQuery;
import com.asta.backend.entity.query.RegisterQuery;
import com.asta.backend.entity.vo.LoginVO;
import com.baomidou.mybatisplus.extension.service.IService;

/**
 * <p>
 *  服务类
 * </p>
 *
 * @author asta
 * @since 2025-06-29
 */
public interface IUserService extends IService<User> {

    /**
     * 用户登录
     * @param query 登录参数
     * @return 用户是否登录成功
     */
    LoginVO login(LoginQuery query);

    /**
     * 用户注册
     * @param query 注册参数
     * @return 如果用户已存在，则注册失败，返回false
     */
    boolean register(RegisterQuery query);
}

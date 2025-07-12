package com.asta.auth.service;

import com.asta.domain.po.User;
import com.asta.domain.query.auth.LoginQuery;
import com.asta.domain.query.auth.RegisterQuery;
import com.asta.domain.vo.auth.LoginVO;
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

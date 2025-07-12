package com.asta.auth.controller;

import com.asta.auth.service.IUserService;
import com.asta.domain.query.auth.LoginQuery;
import com.asta.domain.query.auth.RegisterQuery;
import com.asta.domain.vo.JsonVO;
import com.asta.domain.vo.auth.LoginVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 认证
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @PostMapping("/login")
    JsonVO<LoginVO> login(@RequestBody LoginQuery query){

        LoginVO vo = userService.login(query);

        return JsonVO.success(vo);
    }

    @PostMapping("/register")
    JsonVO<String> register(@RequestBody RegisterQuery register){

        boolean res = userService.register(register);

        if (!res) return JsonVO.fail("注册失败!");
        return JsonVO.success("注册成功!");
    }
}

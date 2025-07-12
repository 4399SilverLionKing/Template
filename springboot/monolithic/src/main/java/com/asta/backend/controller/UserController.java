package com.asta.backend.controller;


import com.asta.backend.entity.query.LoginQuery;
import com.asta.backend.entity.query.RegisterQuery;
import com.asta.backend.entity.vo.JsonVO;
import com.asta.backend.entity.vo.LoginVO;
import com.asta.backend.service.IUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;

/**
 * 认证
 */
@RestController
@RequestMapping("/authenticate")
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

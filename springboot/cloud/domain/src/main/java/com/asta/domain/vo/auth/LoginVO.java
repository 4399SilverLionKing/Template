package com.asta.domain.vo.auth;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class LoginVO {

    private String username;

    private String token;
}

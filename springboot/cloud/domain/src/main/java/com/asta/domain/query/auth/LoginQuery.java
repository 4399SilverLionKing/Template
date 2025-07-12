package com.asta.domain.query.auth;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class LoginQuery {

    private String username;

    private String password;
}

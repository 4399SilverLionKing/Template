package com.asta.domain.query.auth;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class RegisterQuery {

    private String username;

    private String email;

    private String password;

    private String role;
}

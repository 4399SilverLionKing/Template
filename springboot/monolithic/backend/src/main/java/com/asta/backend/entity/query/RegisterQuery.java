package com.asta.backend.entity.query;

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

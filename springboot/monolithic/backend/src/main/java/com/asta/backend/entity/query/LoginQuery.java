package com.asta.backend.entity.query;

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

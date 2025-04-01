package com.asta.user.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;

/**
 * <p>
 *
 * </p>
 *
 * @author Asta
 * @since 2025-03-24
 */
@Getter
@Setter
@ToString
@TableName("users_roles")
public class Users_Roles implements Serializable{

    /**
     * id
     */
    @TableId("id")
    private Integer id;

    /**
     * 用户id
     */
    @TableField("user_id")
    private Integer userId;

    /**
     * 角色id
     */
    @TableField("role_id")
    private Integer roleId;
}

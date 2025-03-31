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
@TableName("roles")
public class Roles implements Serializable{

    /**
     * 角色id
     */
    @TableId("id")
    private Integer id;

    /**
     * 角色名
     */
    @TableField("name")
    private String name;

}

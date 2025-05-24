package com.asta.common.utils;

import com.baomidou.mybatisplus.generator.FastAutoGenerator;
import com.baomidou.mybatisplus.generator.engine.FreemarkerTemplateEngine;

public class CodeGenerator {
    public static void main(String[] args) {
        // 使用 FastAutoGenerator 快速配置代码生成器
        // 配置数据库信息 TODO
        FastAutoGenerator.create("jdbc:mysql://182.92.222.108:3306/blog?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC", "root", "1263976832")
                .globalConfig(builder -> {
                    builder.author("Asta") // 设置作者
                            .disableOpenDir() // 不允许自动打开输出目录
                            .outputDir("web/src/main/java"); // 输出目录
                })
                .packageConfig(builder -> {
                    builder.parent("com.asta") // 设置父包名
                            .moduleName("web") // 设置父包模块名
                            .entity("entity") // 设置实体类包名
                            .mapper("mapper") // 设置 Mapper 接口包名
                            .service("service") // 设置 Service 接口包名
                            .serviceImpl("service.impl"); // 设置 Service 实现类包名
                })
                .strategyConfig(builder -> {
                    builder.addInclude("test") // 设置需要生成的表名 TODO
                            .entityBuilder()
                            .enableLombok() // 启用 Lombok
                            .enableTableFieldAnnotation() // 启用字段注解
                            .controllerBuilder()
                            .enableRestStyle(); // 启用 REST 风格
                })
                .templateEngine(new FreemarkerTemplateEngine()) // 使用 Freemarker 模板引擎
                .execute(); // 执行生成
    }
}

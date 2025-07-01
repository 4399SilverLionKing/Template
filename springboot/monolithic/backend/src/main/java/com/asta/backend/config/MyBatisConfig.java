package com.asta.backend.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class MyBatisConfig {

    /**
     * 自动插入配置
     */
    @Bean
    public MetaObjectHandler metaObjectHandler(){
        return new MetaObjectHandler() {
            @Override
            public void insertFill(MetaObject metaObject) {
                // 如果实体类中有对应的字段，并且该字段的值当前为 null (或者根据填充策略允许被填充)
                // MyBatis-Plus 会自动将该字段的值设置为当前的日期和时间。
                this.strictInsertFill(metaObject,"createDate",LocalDateTime.class,LocalDateTime.now());
            }

            @Override
            public void updateFill(MetaObject metaObject) {
                this.strictUpdateFill(metaObject,"updateDate",LocalDateTime.class,LocalDateTime.now());
            }
        };
    }

    /**
     * 分页配置
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();

        // 1. 创建分页插件的内部拦截器
        PaginationInnerInterceptor paginationInnerInterceptor = new PaginationInnerInterceptor();
        // 2. 设置数据库类型 (必填)
        paginationInnerInterceptor.setDbType(DbType.MYSQL);
        // 3. 设置溢出总页数后查询最后一页
        paginationInnerInterceptor.setOverflow(true);
        // 4. 设置单页分页条数限制防止恶意查询
        paginationInnerInterceptor.setMaxLimit(1000L);

        // 5. 将分页拦截器添加到 MybatisPlusInterceptor 中
        interceptor.addInnerInterceptor(paginationInnerInterceptor);

        return interceptor;
    }
}

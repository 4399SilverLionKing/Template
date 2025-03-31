package com.asta.domain.dto;

public interface DataTransCallBack<T, D> {
    /**
     * 执行转换
     * @param src 待转换对象
     * @return 转换目标对象
     */
    T executeTrans(D src);
}
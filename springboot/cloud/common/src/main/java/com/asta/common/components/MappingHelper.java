package com.asta.common.components;

import org.mapstruct.Named;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * MapStruct 映射辅助类
 */
@Component
public class MappingHelper {

    private static final String COMMA = ",";

    /**
     * 将逗号分隔的字符串转换为 Set<String>
     */
    @Named("stringToSet")
    public Set<String> stringToSet(String str) {
        if (str == null || str.trim().isEmpty()) {
            return Collections.emptySet();
        }
        return Arrays.stream(str.split(COMMA)).map(String::trim).collect(Collectors.toSet());
    }
}
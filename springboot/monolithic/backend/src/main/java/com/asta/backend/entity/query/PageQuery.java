package com.asta.backend.entity.query;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class PageQuery {

    @Min(value = 1, message = "页码最小值为1")
    private long pageIndex;

    @Min(value = 1, message = "条数最小值为1")
    private long pageSize;
}
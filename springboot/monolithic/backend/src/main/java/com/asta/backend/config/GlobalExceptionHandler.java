package com.asta.backend.config;

import com.asta.backend.entity.vo.JsonVO;
import com.asta.backend.entity.vo.ResultStatus;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    /**
     * 系统通用异常处理
     *
     * @param e 异常类型
     * @return 返回异常信息回显数据
     */
    @ExceptionHandler(value = Exception.class)
    public JsonVO<String> exceptionHandler(Exception e) {
        if (e instanceof HttpMediaTypeException) {
            return JsonVO.create(e.getMessage(), ResultStatus.CONTENT_TYPE_ERR);
        }
        return JsonVO.create(e.getMessage(), ResultStatus.SERVER_ERROR);
    }

    /**
     * requestBody参数校验异常处理
     *
     * @param e 异常类型
     * @return 返回异常信息回显数据
     */
    @ExceptionHandler(value =
            {MethodArgumentNotValidException.class, BindException.class})
    public JsonVO<String> methodArgumentNotValidHandler(Exception e) {
        BindingResult bindingResult;
        if (e instanceof MethodArgumentNotValidException) {
            //@RequestBody参数校验
            bindingResult = ((MethodArgumentNotValidException) e).getBindingResult();
        } else {
            //@ModelAttribute参数校验
            bindingResult = ((BindException) e).getBindingResult();
        }
        FieldError fieldError = bindingResult.getFieldError();
        String data = "[" + fieldError.getField() + "]" + fieldError.getDefaultMessage();
        return JsonVO.create(data, ResultStatus.PARAMS_INVALID);
    }
}

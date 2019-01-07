package controller2;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * @description: hello
 * @author: Mission Lee
 * @create: 2019-01-07 14:43
 */
@RestController
@RequestMapping("/c2")
public class HelloWorld2 {
    @RequestMapping("/he")
    public Object hello(){
        return "heeeeello2";
    }
}

package controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * @description: hello
 * @author: Mission Lee
 * @create: 2019-01-07 11:45
 */
@Controller
@RequestMapping("/c")
public class HelloWorld {
    @RequestMapping("/he")
    @ResponseBody
    public Object hello(){
        return "heeeeello";
    }
}

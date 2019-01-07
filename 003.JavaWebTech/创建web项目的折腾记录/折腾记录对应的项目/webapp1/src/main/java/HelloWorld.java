import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * @description: hello
 * @author: Mission Lee
 * @create: 2019-01-07 10:24
 */
public class HelloWorld extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json; charset=utf-8");
        response.getWriter().write("hello");
    }
    @Override
    protected void doPost(HttpServletRequest request,HttpServletResponse response) throws IOException {
        doGet(request,response);
    }
}

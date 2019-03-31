## Model
Same as in Spring WebFlux

- 可以在这些地方使用 @ModelAttribute annotation:
  - 作为 @RequestMapping 方法的入参，创建或者access一个model的object，用WebDataBinder把固定到request上
  - （方法级注解）注解 @Controller or @ControllerAdvice 类的方法上， 从在调用的时候把model创建到 @RequestMapping方法中
  - On a @RequestMapping method to mark its return value is a model attribute.

下面讨论上面所说第二种情况，一个Controller可以有任意个 @ModelAttribute 方法。所有的这些method都会在当前Controller中@RequestMapping方法调用前被 调用。 

一个@ModelAttribute方法可以通过@ControllerAdvice 使其可以在多个Controller里面使用

@ModelAttribute 方法结构是灵活的. 它支持和 @RequestMapping一样的参数,除了@ModelAttribute itself or anything related to the request body.

The following example shows a @ModelAttribute method:
```java
@ModelAttribute
public void populateModel(@RequestParam String number, Model model) {
    model.addAttribute(accountRepository.findAccount(number));
    // add more ...
}
```
The following example adds only one attribute:
```java
@ModelAttribute
public Account addAccount(@RequestParam String number) {
    return accountRepository.findAccount(number);
}
```

```note
When a name is not explicitly specified, a default name is chosen based on the Object type, as explained in the javadoc for Conventions. You can always assign an explicit name by using the overloaded addAttribute method or through the name attribute on @ModelAttribute (for a return value).
```

同样可以把 @ModelAttribute 作为方法级别注解，主街道 @RequestMapping 方法上, 在这种情况下 @RequestMapping方法的返回值会被拦截作为model的attribute. 这不是必须的,因为这本身就是HTML controller的默认操作, 除非方法返回一个String，这时返回值会被当成一个view的名字. 

@ModelAttribute can also customize the model attribute name, as the following example shows:
```java
@GetMapping("/accounts/{id}")
@ModelAttribute("myAccount")
public Account handle() {
    // ...
    return account;
}
```

## DataBinder
Same as in Spring WebFlux

@Controller or @ControllerAdvice classes can have @InitBinder methods that initialize instances of WebDataBinder, and those, in turn, can:

- Bind request parameters (that is, form or query data) to a model object.
- ⭐ Convert String-based request values (such as request parameters, path variables, headers, cookies, and others) to the target type of controller method arguments.
- Format model object values as String values when rendering HTML forms.

@InitBinder methods can register controller-specific java.bean.PropertyEditor or Spring Converter and Formatter components. In addition, you can use the MVC config to register Converter and Formatter types in a globally shared FormattingConversionService.

@InitBinder methods support many of the same arguments that @RequestMapping methods do, except for @ModelAttribute (command object) arguments. Typically, they are declared with a WebDataBinder argument (for registrations) and a void return value. The following listing shows an example:
> 注册一个 CustomEditor
```java
@Controller
public class FormController {

    @InitBinder 
    public void initBinder(WebDataBinder binder) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        dateFormat.setLenient(false);
        binder.registerCustomEditor(Date.class, new CustomDateEditor(dateFormat, false));
    }

    // ...
}
```

Defining an @InitBinder method.


Alternatively, when you use a Formatter-based setup through a shared FormattingConversionService, you can re-use the same approach and register controller-specific Formatter implementations, as the following example shows:

> 添加一个CustomFormatter
```java
@Controller
public class FormController {

    @InitBinder 
    protected void initBinder(WebDataBinder binder) {
        binder.addCustomFormatter(new DateFormatter("yyyy-MM-dd"));
    }

    // ...
}
```
Defining an @InitBinder method on a custom formatter.


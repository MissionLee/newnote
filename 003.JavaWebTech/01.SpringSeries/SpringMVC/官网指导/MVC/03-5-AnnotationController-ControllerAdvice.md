## Controller Advice
Same as in Spring WebFlux

Typically @ExceptionHandler, @InitBinder, and @ModelAttribute methods apply within the @Controller class (or class hierarchy) in which they are declared. If you want such methods to apply more globally (across controllers), you can declare them in a class marked with @ControllerAdvice or @RestControllerAdvice.

@ControllerAdvice is marked with @Component, which means such classes can be registered as Spring beans through component scanning. @RestControllerAdvice is also a meta-annotation marked with both @ControllerAdvice and @ResponseBody, which essentially means @ExceptionHandler methods are rendered to the response body through message conversion (versus view resolution or template rendering).

On startup, the infrastructure classes for @RequestMapping and @ExceptionHandler methods detect Spring beans of type @ControllerAdvice and then apply their methods at runtime. Global @ExceptionHandler methods (from a @ControllerAdvice) are applied after local ones (from the @Controller). By contrast, global @ModelAttribute and @InitBinder methods are applied before local ones.

By default, @ControllerAdvice methods apply to every request (that is, all controllers), but you can narrow that down to a subset of controllers by using attributes on the annotation, as the following example shows:
```java
// Target all Controllers annotated with @RestController
@ControllerAdvice(annotations = RestController.class)
public class ExampleAdvice1 {}

// Target all Controllers within specific packages
@ControllerAdvice("org.example.controllers")
public class ExampleAdvice2 {}

// Target all Controllers assignable to specific classes
@ControllerAdvice(assignableTypes = {ControllerInterface.class, AbstractController.class})
public class ExampleAdvice3 {}
```
The selectors in the preceding example are evaluated at runtime and may negatively impact performance if used extensively. See the @ControllerAdvice javadoc for more details.
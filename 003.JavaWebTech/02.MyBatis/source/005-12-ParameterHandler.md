# ParmeterHandler

> ParameterHandler 的主要作用是把： 
- 1.PreparedStatement 
- 2.ParameterMapping 
- 3.parameterObject 
> 三者配置起来，生成数据库可用的 PreparedStatement

里面使用了 [MetaObject](./005-13-MetaObject.md) 作为不同类型的 parameterObject 的代理，使用了一层 wapper类，让不同类型的参数可以使用同样的方法获取参数值。

```java
package org.apache.ibatis.scripting.defaults;
/**
 * @author Clinton Begin
 * @author Eduardo Macarron
 */
public class DefaultParameterHandler implements ParameterHandler {

  private final TypeHandlerRegistry typeHandlerRegistry;

  private final MappedStatement mappedStatement;
  private final Object parameterObject;
  private final BoundSql boundSql;
  private final Configuration configuration;

  public DefaultParameterHandler(MappedStatement mappedStatement, Object parameterObject, BoundSql boundSql) {
    this.mappedStatement = mappedStatement;
    this.configuration = mappedStatement.getConfiguration();
    this.typeHandlerRegistry = mappedStatement.getConfiguration().getTypeHandlerRegistry();
    this.parameterObject = parameterObject;
    this.boundSql = boundSql;
  }

  @Override
  public Object getParameterObject() {
    return parameterObject;
  }

  @Override
  public void setParameters(PreparedStatement ps) {
    ErrorContext.instance().activity("setting parameters").object(mappedStatement.getParameterMap().getId());
    // ⭐⭐⭐⭐ 从这里开始
    List<ParameterMapping> parameterMappings = boundSql.getParameterMappings();
    if (parameterMappings != null) {
      for (int i = 0; i < parameterMappings.size(); i++) {
        ParameterMapping parameterMapping = parameterMappings.get(i);
        if (parameterMapping.getMode() != ParameterMode.OUT) {
          Object value;
          // ⭐ 获取 参数名
          String propertyName = parameterMapping.getProperty();
          // 主力 propertyName 为  xxxx.yyy 的情况 这时候，这个参数应该是额外参数，不是从 pa
          if (boundSql.hasAdditionalParameter(propertyName)) { // issue #448 ask first for additional params
            value = boundSql.getAdditionalParameter(propertyName);
          } else if (parameterObject == null) {
            value = null;
          } else if (typeHandlerRegistry.hasTypeHandler(parameterObject.getClass())) {
            value = parameterObject;
          } else {
            // ⭐⭐⭐ 多数时候我们的参数用一个 map 或者是 JavaBean
            // ⭐⭐⭐ 这种情况下我们使用MetaObject用统一的方式获取参数
            // ⭐⭐⭐ 例如：使用map，就是每次找得到 map里面对应key的value并赋值
            MetaObject metaObject = configuration.newMetaObject(parameterObject);
            value = metaObject.getValue(propertyName);
          }
          TypeHandler typeHandler = parameterMapping.getTypeHandler();
          JdbcType jdbcType = parameterMapping.getJdbcType();
          if (value == null && jdbcType == null) {
            jdbcType = configuration.getJdbcTypeForNull();
          }
          try {
            // 最终 typeHandler 将 对应值设置搭配 PS（PreparedStatement）对应的位置
            typeHandler.setParameter(ps, i + 1, value, jdbcType);
          } catch (TypeException e) {
            throw new TypeException("Could not set parameters for mapping: " + parameterMapping + ". Cause: " + e, e);
          } catch (SQLException e) {
            throw new TypeException("Could not set parameters for mapping: " + parameterMapping + ". Cause: " + e, e);
          }
        }
      }
    }
  }

}
```
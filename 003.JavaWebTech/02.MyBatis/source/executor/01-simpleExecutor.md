# Simple Executor

> 在BaseExecutor里面我们已经看到了：BaseExecutor已经处理了缓存等MyBatis的功能，子类Executor主要完成的工作是实际操作数据库

> Executor 对外提供 doUpdate / doQuery / doQueryCursor / doFulshStatements 四个方法

> 在BaseExecutor中，我们以 query为例子分析了以下执行过程，在这里就看一下 doQuery方法

```java

package org.apache.ibatis.executor;

/**
 * @author Clinton Begin
 */
public class SimpleExecutor extends BaseExecutor {

  public SimpleExecutor(Configuration configuration, Transaction transaction) {
    super(configuration, transaction);
  }

  @Override
  public int doUpdate(MappedStatement ms, Object parameter) throws SQLException {
      // ⭐ 首先外部会传入一个 MappedStatement（未经处理的SQL），和本次操作的参数
    Statement stmt = null;
    try {
        // 从 ms传来的参数，可以获得一个 StatementHandler
      Configuration configuration = ms.getConfiguration();
      StatementHandler handler = configuration.newStatementHandler(this, ms, parameter, RowBounds.DEFAULT, null, null);
      stmt = prepareStatement(handler, ms.getStatementLog());
      return handler.update(stmt);
    } finally {
      closeStatement(stmt);
    }
  }

  @Override
  public <E> List<E> doQuery(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) throws SQLException {
    Statement stmt = null;
    try {
      // ⭐ 获取Configuration
      Configuration configuration = ms.getConfiguration();
      // ⭐ StatementHandler
      StatementHandler handler = configuration.newStatementHandler(wrapper, ms, parameter, rowBounds, resultHandler, boundSql);
      stmt = prepareStatement(handler, ms.getStatementLog());
      return handler.<E>query(stmt, resultHandler);
    } finally {
      closeStatement(stmt);
    }
  }

  @Override
  protected <E> Cursor<E> doQueryCursor(MappedStatement ms, Object parameter, RowBounds rowBounds, BoundSql boundSql) throws SQLException {
    Configuration configuration = ms.getConfiguration();
    StatementHandler handler = configuration.newStatementHandler(wrapper, ms, parameter, rowBounds, null, boundSql);
    Statement stmt = prepareStatement(handler, ms.getStatementLog());
    return handler.<E>queryCursor(stmt);
  }

  @Override
  public List<BatchResult> doFlushStatements(boolean isRollback) throws SQLException {
    return Collections.emptyList();
  }

  private Statement prepareStatement(StatementHandler handler, Log statementLog) throws SQLException {
    Statement stmt;
    Connection connection = getConnection(statementLog);
    stmt = handler.prepare(connection, transaction.getTimeout());
    handler.parameterize(stmt);
    return stmt;
  }

}
```
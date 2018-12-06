 ```java
    /**
   * Proxy needed to route MyBatis method calls to the proper SqlSession got
   * from Spring's Transaction Manager
   * It also unwraps exceptions thrown by {@code Method#invoke(Object, Object...)} to
   * pass a {@code PersistenceException} to the {@code PersistenceExceptionTranslator}.
   */

   /**
    *  这是在SqlSessionTemplate中的一个内部类
    *  作为执行Mybatis方法的 拦截器
    */
  private class SqlSessionInterceptor implements InvocationHandler {
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        // ★★★★★★★★★★  首先，获取一个合适的 SqlSession ★★★★★★★★★★
      SqlSession sqlSession = getSqlSession(
          SqlSessionTemplate.this.sqlSessionFactory,
          SqlSessionTemplate.this.executorType,
          SqlSessionTemplate.this.exceptionTranslator);
      try {
          // ★★★★★  然后 将方法交由刚刚选好的 sqlSession来执行：method.invoke(sqlSession,args) ★★★★★★★★★★
        Object result = method.invoke(sqlSession, args);
          // ★★★★★  如果当前并不是执行一个事务，也强制 执行一次 commit 操作，因为有些  ★★★★★★★★★★
        if (!isSqlSessionTransactional(sqlSession, SqlSessionTemplate.this.sqlSessionFactory)) {
          // force commit even on non-dirty sessions because some databases require
          // a commit/rollback before calling close()
          sqlSession.commit(true);
        }
        return result;
      } catch (Throwable t) {
        Throwable unwrapped = unwrapThrowable(t);
        if (SqlSessionTemplate.this.exceptionTranslator != null && unwrapped instanceof PersistenceException) {
          // release the connection to avoid a deadlock if the translator is no loaded. See issue #22
          closeSqlSession(sqlSession, SqlSessionTemplate.this.sqlSessionFactory);
          sqlSession = null;
          Throwable translated = SqlSessionTemplate.this.exceptionTranslator.translateExceptionIfPossible((PersistenceException) unwrapped);
          if (translated != null) {
            unwrapped = translated;
          }
        }
        throw unwrapped;
      } finally {
        if (sqlSession != null) {
          closeSqlSession(sqlSession, SqlSessionTemplate.this.sqlSessionFactory);
        }
      }
    }
  }
```

> 在这里调用了 getSqlSession 这个方法

> 从 Spring Transaction Manager 中获取一个SqlSession ,要求是 这个 SqlSession 当前没有执行其他的事务，如果没有的话， 就创建一个新的（我们传入了对应的SqlSessionFactory所以它有能力做乍见是）

> 如果 Spring TX（Spring 事务）是激活的并且配置了 SpringmanagedTransactionFactory 为Transaction Manager（事务管理器），那么就会把 这个 SqlSession和当前的事务绑定在一起，

```java
//  在 SqlSessionUtils 这个类中
  /**
   * Gets an SqlSession from Spring Transaction Manager or creates a new one if needed.
   * Tries to get a SqlSession out of current transaction. If there is not any, it creates a new one.
   * Then, it synchronizes the SqlSession with the transaction if Spring TX is active and
   * <code>SpringManagedTransactionFactory</code> is configured as a transaction manager.
   *
   * @param sessionFactory a MyBatis {@code SqlSessionFactory} to create new sessions
   * @param executorType The executor type of the SqlSession to create
   * @param exceptionTranslator Optional. Translates SqlSession.commit() exceptions to Spring exceptions.
   * @throws TransientDataAccessResourceException if a transaction is active and the
   *             {@code SqlSessionFactory} is not using a {@code SpringManagedTransactionFactory}
   * @see SpringManagedTransactionFactory
   */
  public static SqlSession getSqlSession(SqlSessionFactory sessionFactory, ExecutorType executorType, PersistenceExceptionTranslator exceptionTranslator) {

    notNull(sessionFactory, NO_SQL_SESSION_FACTORY_SPECIFIED);
    notNull(executorType, NO_EXECUTOR_TYPE_SPECIFIED);

    SqlSessionHolder holder = (SqlSessionHolder) TransactionSynchronizationManager.getResource(sessionFactory);

    SqlSession session = sessionHolder(executorType, holder);
    if (session != null) {
      return session;
    }

    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug("Creating a new SqlSession");
    }

    session = sessionFactory.openSession(executorType);

    registerSessionHolder(sessionFactory, executorType, exceptionTranslator, session);

    return session;
  }
```
package fr.acoss.posdoc.database.aspect;

import fr.acoss.posdoc.database.configuration.AccessType;

public class AccessTypeContext {

  // Private constructor to prevent instantiation
  private AccessTypeContext() {
    throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
  }

  private static final ThreadLocal<AccessType> threadLocal = new ThreadLocal<>();

  public static void set(final AccessType accessType) {
    threadLocal.set(accessType);
  }

  public static AccessType get() {
    return threadLocal.get();
  }

  public static void clear() {
    threadLocal.remove();
  }

}

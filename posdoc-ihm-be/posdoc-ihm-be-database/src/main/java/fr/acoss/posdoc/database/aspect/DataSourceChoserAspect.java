package fr.acoss.posdoc.database.aspect;

import fr.acoss.posdoc.database.TransactionalReadOnly;
import fr.acoss.posdoc.database.configuration.AccessType;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/*
  Par défaut la transaction est définie en LOWEST_PRECEDENCE, qui est à la valeur Integer.MAX_VALUE.
  On a juste besoin que l'aspect s'exécute avant la création de la transaction, pour çà il suffit de
  mettre une valeur plus basse
 */
@Component
@Aspect
@Order(100)
public class DataSourceChoserAspect {

  private static final Logger LOGGER = LoggerFactory.getLogger(DataSourceChoserAspect.class);

  @Pointcut("@annotation(fr.acoss.posdoc.database.TransactionalReadOnly) ")
  public void transactionalReadOnlyAnnotations() {
    // Cette méthode est intentionnellement vide.
    // Elle sert uniquement à définir un pointcut pour l'aspect AOP, qui va intercepter les méthodes annotées avec @TransactionalReadOnly.
    // Aucune logique métier n'est nécessaire ici.
  }

  @Pointcut("@annotation(fr.acoss.posdoc.database.TransactionalReadWrite)")
  public void transactionalReadWriteAnnotations() {
    // Cette méthode est intentionnellement vide.
    // Elle sert uniquement à définir un pointcut pour l'aspect AOP, qui intercepte les méthodes annotées avec @TransactionalReadWrite.
    // Aucune implémentation supplémentaire n'est nécessaire ici.
  }

  @Around("transactionalReadOnlyAnnotations() || transactionalReadWriteAnnotations()")
  private Object intercept(final ProceedingJoinPoint call) throws Throwable {

    final var signature = (MethodSignature) call.getSignature();
    final var method = signature.getMethod();

    final AccessType accessType = method.isAnnotationPresent(TransactionalReadOnly.class)
            ? AccessType.READ_ONLY
            : AccessType.READ_WRITE;

    if (LOGGER.isDebugEnabled()) {
      LOGGER.debug("[{}] {}.{}", accessType, method.getDeclaringClass().getSimpleName(), method.getName());
    }

    AccessTypeContext.set(accessType);
    try {
      return call.proceed();
    } finally {
      // Le clear DOIT être dans un finally : sans cela, une exception laisserait
      // le ThreadLocal positionné et polluerait la prochaine requête servie par le même thread du pool.
      AccessTypeContext.clear();
    }
  }

}

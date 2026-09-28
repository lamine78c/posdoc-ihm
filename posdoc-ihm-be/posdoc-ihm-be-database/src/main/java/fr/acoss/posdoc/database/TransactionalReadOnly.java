package fr.acoss.posdoc.database;

import org.springframework.transaction.annotation.Transactional;

import java.lang.annotation.*;

@Inherited
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
@Transactional(readOnly = true)
public @interface TransactionalReadOnly {}

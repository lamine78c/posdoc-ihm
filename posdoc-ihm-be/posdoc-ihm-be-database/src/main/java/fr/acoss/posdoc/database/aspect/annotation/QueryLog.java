package fr.acoss.posdoc.database.aspect.annotation;

import fr.acoss.posdoc.types.MyslogAction;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface QueryLog {
    String entity();
    MyslogAction action();

}

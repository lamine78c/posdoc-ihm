package fr.acoss.posdoc.domain.common.validator;

import java.util.function.Function;

/**
 * Représente un validateur de données
 *
 * @param <T> Type de la donnée à valider
 */
@FunctionalInterface
public interface Validator<T> {

  Boolean validate(T value);

  /**
   * Throw l'exception fournie en sortie de la fonction en paramètre.
   *
   * @param exceptionToThrowFunction fonction fournissant l'exception à throw
   * @param <X>                      type de l'exception fournie par la fonction
   * @return true
   * @throws X si le paramètre est n'est pas valide throws X
   */
  default <X extends RuntimeException> Validator<T> orThrow(
      final Function<T, X> exceptionToThrowFunction) throws X {

    return value -> {
      if (Boolean.FALSE.equals(validate(value))) {
        throw exceptionToThrowFunction.apply(value);
      }
      else{
        return true;
      }
    };
  }

}

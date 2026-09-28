package fr.acoss.posdoc.database.search;

import fr.acoss.posdoc.domain.common.search.FilterCriteria;
import fr.acoss.posdoc.domain.common.search.FilterCriterion;
import fr.acoss.posdoc.exceptions.NoConverterFoundException;
import fr.acoss.posdoc.exceptions.NotManagedSearchOperationException;
import fr.acoss.posdoc.types.SearchOperation;
import fr.acoss.posdoc.types.Systeme;
import fr.acoss.posdoc.types.TypeEchantillon;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.function.Function;

public class GenericSearchSpecification<T> implements Specification<T> {

    private static final Map<Class<?>, Function<String, Object>> CONVERTERS = new HashMap<>();

    static {
        CONVERTERS.put(String.class, v -> v);
        CONVERTERS.put(Long.class, Long::valueOf);
        CONVERTERS.put(Integer.class, Integer::valueOf);
        CONVERTERS.put(Boolean.class, Boolean::parseBoolean);
        CONVERTERS.put(Systeme.class, Systeme::valueOf);
        CONVERTERS.put(TypeEchantillon.class, TypeEchantillon::valueOf);
    }

    private static final Logger LOGGER = LoggerFactory.getLogger(GenericSearchSpecification.class);

    private final FilterCriteria filterCriteria;

    public GenericSearchSpecification(final FilterCriteria filterCriteria) {
        this.filterCriteria = filterCriteria;
    }

    @Override
    public Predicate toPredicate(final Root<T> root, final CriteriaQuery<?> query,
                                 final CriteriaBuilder criteriaBuilder) {

        if (filterCriteria != null) {

            return criteriaBuilder.and(filterCriteria.getCriteria().stream()
                    .map(c -> searchCriterionToExpression(criteriaBuilder, root, c))
                    .toArray(Predicate[]::new));
        }
        //Si siltercriteria est null -> on sélectionne tout
        return criteriaBuilder.and();
    }

    private Predicate searchCriterionToExpression(final CriteriaBuilder cb, final Root<T> root,
                                                  final FilterCriterion criterion) {

        final Path<String> column = buildPathToColumn(root, criterion.getColumn());

        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("column type: {}", column.getJavaType());
        }

        final var convertedValue = convertValue(criterion.getValue(), column.getJavaType());

        if (SearchOperation.LIKE.equals(criterion.getOperation())) {
            return cb.like(column, criterion.getValue());
        } else if (SearchOperation.EQUALS.equals(criterion.getOperation())) {
            return cb.equal(column, convertedValue);
        }
        throw new NotManagedSearchOperationException(criterion.getOperation().name());
    }

    private Object convertValue(final String value, final Class<?> destinationClass) {

        if (CONVERTERS.containsKey(destinationClass)) {
            return CONVERTERS.get(destinationClass).apply(value);
        }

        throw new NoConverterFoundException(value, destinationClass);
    }

    private Path<String> buildPathToColumn(final Root<T> root, final String column) {
        // 1 Check if composed column (contains '.')
        // 2 Découpage des points
        // 3 Création du path

        final var splitted = new LinkedList<>(Arrays.asList(column.split("\\.")));

        Path<String> path = root.get(splitted.poll());

        for (final String stringPath : splitted) {
            path = path.get(stringPath);
        }

        return path;
    }

}

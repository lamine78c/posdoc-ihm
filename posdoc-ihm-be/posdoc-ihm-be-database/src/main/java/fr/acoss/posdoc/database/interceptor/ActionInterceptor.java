package fr.acoss.posdoc.database.interceptor;

import fr.acoss.posdoc.common.util.StringUtils;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.database.dao.HistoryRepository;
import fr.acoss.posdoc.database.entities.HistoryEntity;
import fr.acoss.posdoc.database.entities.UtiLogEntity;
import fr.acoss.posdoc.database.services.SubstringSorterService;
import fr.acoss.posdoc.database.services.VersionAdelaideService;
import fr.acoss.posdoc.types.MyslogAction;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.EmptyInterceptor;
import org.hibernate.type.Type;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.persistence.Column;
import javax.persistence.EmbeddedId;
import javax.persistence.Id;
import java.io.Serializable;
import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ActionInterceptor extends EmptyInterceptor {

    private static final Logger LOGGER = LoggerFactory.getLogger(ActionInterceptor.class);

    private static final String ENTITY = "Entity";
    public static final String AND = " AND ";
    private static final String DELIMITER = ", ";
    private static final int BEGIN_INDEX = 0;
    private static final int MAX_INDEX = 6;
    private transient HistoryRepository historyRepository;
    private transient VersionAdelaideService versionAdelaideService;

    @Autowired
    public void setHistoryRepository(final HistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    @Autowired
    public void setVersionAdelaideService(final VersionAdelaideService versionAdelaideService) {
        this.versionAdelaideService = versionAdelaideService;
    }

    @Override
    public boolean onSave(Object entity, Serializable id, Object[] state, String[] propertyNames, Type[] types) {
        if (isIgnoredEntites(entity)) {
            return false;
        }
        HistoryEntity history = createHistoryEntity(entity, MyslogAction.INSERT);
        var dataSortie = getDatas(buildTableField(entity));
        var sortDataSortie = SubstringSorterService.substringSorterHistoryValues(dataSortie);
        history.setSortie(sortDataSortie);
        historyRepository.save(history);
        return super.onSave(entity, id, state, propertyNames, types);
    }

    @Override
    public boolean onFlushDirty(Object entity, Serializable id, Object[] currentState, Object[] previousState, String[] propertyNames, Type[] types) {
        if (isIgnoredEntites(entity)) {
            return false;
        }
        HistoryEntity history = createHistoryEntity(entity, MyslogAction.UPDATE);
        var tableField = buildTableField(entity);
        var dataEntree = getEntreeDelta(previousState, propertyNames, tableField);
        var sortDataEntree = SubstringSorterService.substringSorterHistoryValues(dataEntree);
        history.setEntree(sortDataEntree);
        var dataSortie = getSortieDelta(previousState, propertyNames, tableField);
        var sortDataSortie = SubstringSorterService.substringSorterHistoryValues(dataSortie);
        history.setSortie(sortDataSortie);
        var dataCondition = getClauseWhereById(entity, id);
        var sortDataCondition = SubstringSorterService.substringSorterHistoryCondition(dataCondition);
        history.setCondition(sortDataCondition);
        historyRepository.save(history);
        return super.onFlushDirty(entity, id, currentState, previousState, propertyNames, types);
    }

    @Override
    public void onDelete(Object entity, Serializable id, Object[] state, String[] propertyNames, Type[] types) {
        if (isIgnoredEntites(entity)) {
            return;
        }
        HistoryEntity history = createHistoryEntity(entity, MyslogAction.DELETE);
        var dataEntree = getDatas(buildTableField(entity));
        var sortDataEntree = SubstringSorterService.substringSorterHistoryValues(dataEntree);
        history.setEntree(sortDataEntree);
        var dataCondition = getClauseWhereById(entity, id);
        var sortDataCondition = SubstringSorterService.substringSorterHistoryCondition(dataCondition);
        history.setCondition(sortDataCondition);
        historyRepository.save(history);
        super.onDelete(entity, id, state, propertyNames, types);
    }

    private boolean isIgnoredEntites(Object entity) {
        return entity instanceof HistoryEntity || entity instanceof UtiLogEntity;
    }

    private HistoryEntity createHistoryEntity(final Object entity, final MyslogAction action) {
        HistoryEntity history = new HistoryEntity();
        history.setInsertionDate(LocalDateTime.now());
        String entityLabel = entity.getClass().getSimpleName().replace(ENTITY, StringUtils.EMPTY);
        history.setEntite(entityLabel.length() <= MAX_INDEX ? entityLabel : entityLabel.substring(BEGIN_INDEX, MAX_INDEX));
        history.setActionUtilisateur(action);
        history.setStation(ContextHolder.getContext().getHost());
        history.setUtilisateur(ContextHolder.getContext().getUser());
        history.setCodulo(ContextHolder.getContext().getId());
        history.setVersio(versionAdelaideService.getAdelaideVersion());
        return history;
    }

    private static String getDatas(final Map<String, FieldTable> fields) {
        return fields.keySet().stream().map(key -> fields.get(key).getColumnName() + StringUtils.EQUAL + fields.get(key).getValue()).collect(Collectors.joining(DELIMITER));
    }

    private static String getEntreeDelta(final Object[] previousState, final String[] propertyNames, final Map<String, FieldTable> fields) {
        return doBuildDelta(false, previousState, propertyNames, fields);
    }

    private static String getSortieDelta(final Object[] previousState, final String[] propertyNames, final Map<String, FieldTable> fields) {
        return doBuildDelta(true, previousState, propertyNames, fields);
    }

    private static String doBuildDelta(boolean afterUpdate, final Object[] previousState, final String[] propertyNames, final Map<String, FieldTable> fields) {
        List<String> list = new ArrayList<>();
        for (int i = BEGIN_INDEX; i < propertyNames.length; i++) {
            String propertyName = propertyNames[i];
            Object previousStat = previousState[i] != null ? previousState[i] : null;
            String value = fields.get(propertyName) != null ? fields.get(propertyName).getValue() : null;
            if (isAdd(fields, value, previousStat, propertyName)) {
                list.add(fields.get(propertyName).getColumnName() + StringUtils.EQUAL + getValue(afterUpdate, propertyName, previousStat, fields));
            }
        }
        return String.join(DELIMITER, list);
    }

    private static boolean isAdd(final Map<String, FieldTable> fields, final String value, final Object previousStat, final String propertyName) {
        boolean isSame = (value == null && previousStat == null) || previousStat != null && previousStat.toString().equals(value);
        boolean isColumn = fields.get(propertyName) != null;
        return isColumn && !isSame;
    }

    private static String getValue(boolean afterUpdate, String propertyName, Object previousStat, Map<String, FieldTable> fields) {
        if (afterUpdate) {
            return fields.get(propertyName).getValue();
        }
        return ((previousStat != null) ? previousStat.toString() : null);
    }

    private static Map<String, FieldTable> buildTableField(final Object entity) {
        Map<String, FieldTable> result = new HashMap<>();
        for (Field field : entity.getClass().getDeclaredFields()) {
            // Garder la réflection volontairement pour l'accessiblité
            field.setAccessible(true);//NOSONAR
            try {
                Object value = field.get(entity);
                addColumn(field, value, result);
                addEmbeddedId(field, value, result);
            } catch (IllegalAccessException iae) {
                LOGGER.error(iae.getMessage());
            }
        }
        return result;
    }

    private static void addColumn(final Field field, final Object value, final Map<String, FieldTable> resultFields) {
        Annotation annotation = getAnnotationByColumn(field);
        if (annotation != null) {
            FieldTable fieldTable = new FieldTable(((Column) annotation).name(), value != null ? value.toString() : null);
            resultFields.put(field.getName(), fieldTable);
        }
    }

    private static void addEmbeddedId(final Field rootField, final Object entity, final Map<String, FieldTable> resultFields) throws IllegalAccessException {
        Annotation annotationEmbedded = getAnnotationByEmbeddedId(rootField);
        if (annotationEmbedded != null) {
            for (Field field : entity.getClass().getDeclaredFields()) {
                // Garder la réflection volontairement pour l'accessiblité
                field.setAccessible(true);//NOSONAR
                Object value = field.get(entity);
                addColumn(field, value, resultFields);
            }
        }
    }

    private static Annotation getAnnotationByType(final Field field, final Class<? extends Annotation> type) {
        for (final Annotation annotation : field.getAnnotations()) {
            if (type.equals(annotation.annotationType())) {
                return annotation;
            }
        }
        return null;
    }

    private static boolean isExistAnnotation(final Field[] fields, final Class<? extends Annotation> type) {
        return Arrays.stream(fields).allMatch(field -> {
            for (final Annotation annotation : field.getAnnotations()) {
                if (type.equals(annotation.annotationType())) {
                    return true;
                }
            }
            return false;
        });
    }

    private String getClauseWhereById(final Object entity, final Serializable id) {
        Field[] fields = id.getClass().getDeclaredFields();
        if (isExistAnnotation(fields, Column.class)) {
            return Arrays.stream(fields).map(field -> {
                try {
                    // Garder la réflection volontairement pour l'accessiblité
                    field.setAccessible(true);//NOSONAR
                    return ((Column) getAnnotationByColumn(field)).name() + StringUtils.EQUAL + field.get(id);
                } catch (IllegalAccessException iae) {
                    LOGGER.error(iae.getMessage());
                }
                return null;
            }).collect(Collectors.joining(AND));
        } else {
            return getFieldId(entity) + StringUtils.EQUAL + id;
        }
    }

    private static Annotation getAnnotationByEmbeddedId(final Field field) {
        return getAnnotationByType(field, EmbeddedId.class);
    }

    private static Annotation getAnnotationByColumn(final Field field) {
        return getAnnotationByType(field, Column.class);
    }

    private static Annotation getAnnotationById(final Field field) {
        return getAnnotationByType(field, Id.class);
    }

    private static String getFieldId(final Object entity) {
        for (Field field : entity.getClass().getDeclaredFields()) {
            // Garder la réflection volontairement pour l'accessiblité
            field.setAccessible(true);//NOSONAR
            if (getAnnotationById(field) != null) {
                Annotation annotation = getAnnotationByColumn(field);
                if (annotation != null) {
                    return ((Column) annotation).name();
                }
            }
        }
        return null;
    }


    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    private static class FieldTable {
        private String columnName;
        private String value;
    }
}
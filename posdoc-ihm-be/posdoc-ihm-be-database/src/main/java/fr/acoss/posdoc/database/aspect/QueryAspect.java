package fr.acoss.posdoc.database.aspect;

import fr.acoss.posdoc.common.util.DateUtils;
import fr.acoss.posdoc.common.util.StringUtils;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.database.aspect.annotation.QueryLog;
import fr.acoss.posdoc.database.dao.HistoryRepository;
import fr.acoss.posdoc.database.entities.HistoryEntity;
import fr.acoss.posdoc.database.services.SubstringSorterService;
import fr.acoss.posdoc.database.services.VersionAdelaideService;
import fr.acoss.posdoc.exceptions.PosdocException;
import fr.acoss.posdoc.types.MyslogAction;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.hibernate.Filter;
import org.hibernate.Session;
import org.hibernate.internal.SessionFactoryImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import static fr.acoss.posdoc.common.util.StringUtils.COMMA;
import static fr.acoss.posdoc.common.util.StringUtils.DOT;
import static fr.acoss.posdoc.common.util.StringUtils.EMPTY;
import static fr.acoss.posdoc.common.util.StringUtils.END_BRACKET;
import static fr.acoss.posdoc.common.util.StringUtils.ESPACE;
import static fr.acoss.posdoc.common.util.StringUtils.SIMPLE_QUOTE;
import static fr.acoss.posdoc.common.util.StringUtils.START_QUERY_PARAM;
import static fr.acoss.posdoc.common.util.StringUtils.TWO_POINTS;

@Aspect
@Configuration
public class QueryAspect {

    private static final  Logger LOGGER = LoggerFactory.getLogger(QueryAspect.class);

    private static final String ENTITY = "Entity";
    private static final int BEGIN_INDEX = 0;
    private static final int MAX_INDEX = 6;
    private static final String WHERE_CLAUSE = "where";
    private static final String DELETE_CLAUSE = "DELETE";
    private static final String UPDATE_CLAUSE = "UPDATE";
    private static final String SET_CLAUSE = "SET";
    private static final String FROM_CLAUSE = "FROM";
    private static final String AND_CLAUSE = "AND";
    private static final String SQL_NULL = "NULL";
    private static final int FIELD_CONDITION_MAX_LENGTH = 255;
    private static final Pattern SQL_FIELD_PREFIX_PATTERN = Pattern.compile("\\b\\w+_\\.");

    private HistoryRepository historyRepository;
    private VersionAdelaideService versionAdelaideService;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public void setHistoryRepository(final HistoryRepository historyRepository) {
        this.historyRepository = historyRepository;
    }

    @Autowired
    public void setVersionAdelaideService(final VersionAdelaideService versionAdelaideService) {
        this.versionAdelaideService = versionAdelaideService;
    }

    @Before("@annotation(fr.acoss.posdoc.database.aspect.annotation.QueryLog)")
    public void before(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        QueryLog queryLog = signature.getMethod().getAnnotation(QueryLog.class);
        if (!MyslogAction.DELETE.equals(queryLog.action()) && !MyslogAction.UPDATE.equals(queryLog.action())) {
            throw new PosdocException("L'action " + queryLog.action().toString() + " n'a pas été implémentée, merci de le faire.");
        } else {
            HistoryEntity historyEntity = createHistoryEntity(queryLog.entity(), queryLog.action());
            String formattedHqlQuery = formatQuery(signature, joinPoint.getArgs());
            var dataCondition = truncate(getCondition(formattedHqlQuery, queryLog), FIELD_CONDITION_MAX_LENGTH);
            var sortDataCondition = SubstringSorterService.substringSorterHistoryCondition(dataCondition);
            historyEntity.setCondition(sortDataCondition);
            if (MyslogAction.UPDATE.equals(queryLog.action())) {
                var dataSortie = getSetParameter(formattedHqlQuery);
                var sortDataSortie = SubstringSorterService.substringSorterHistoryValues(dataSortie);
                historyEntity.setSortie(sortDataSortie);
            }
            this.historyRepository.save(historyEntity);
        }
    }

    private String getSetParameter(final String formattedHqlQuery) {
        String entityWithPrefix = formattedHqlQuery.substring(
                formattedHqlQuery.indexOf(UPDATE_CLAUSE) + UPDATE_CLAUSE.length(),
                formattedHqlQuery.indexOf(SET_CLAUSE)
        );
        String setClause = formattedHqlQuery.substring(
                formattedHqlQuery.indexOf(SET_CLAUSE) + SET_CLAUSE.length(),
                formattedHqlQuery.indexOf(WHERE_CLAUSE.toUpperCase())
        ).replace(COMMA, ESPACE + AND_CLAUSE);
        String selectQuery = FROM_CLAUSE + ESPACE + entityWithPrefix + ESPACE + WHERE_CLAUSE.toUpperCase() + ESPACE + setClause;
        String sqlQuery = convertHqlToSql(selectQuery);
        return removeAliases(extractCondition(sqlQuery)).replace(ESPACE + AND_CLAUSE.toLowerCase(), COMMA);
    }

    private String getCondition(final String formattedHqlQuery, final QueryLog queryLog) {
        String selectQuery = getSelectQueryFromMutationQuery(formattedHqlQuery, queryLog.action());
        String sqlQuery = convertHqlToSql(selectQuery);
        return removeAliases(extractCondition(sqlQuery));
    }

    private static String truncate(final String value, final int size) {
        return (value.length() >= size) ? value.substring(0, size) : value;
    }

    private static String formatQuery(final MethodSignature signature, final Object[] args) {
        Query query = signature.getMethod().getAnnotation(Query.class);
        Annotation[][] parameterAnnotations = signature.getMethod().getParameterAnnotations();
        Map<String, Object> map = new HashMap<>();
        for (int i = 0; i < args.length; i++) {
            Object object = args[i];
            Param annotation = (Param) parameterAnnotations[i][0];
            map.putAll(buildTableField(annotation.value(), object));
        }
        String queryString = query.value();
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            boolean isSimpleParam = !entry.getKey().contains(DOT);
            if (isSimpleParam) {
                queryString = queryString.replace(TWO_POINTS + entry.getKey(), SIMPLE_QUOTE + entry.getValue().toString() + SIMPLE_QUOTE);
            } else {
                queryString = queryString.replace(entry.getKey(), SIMPLE_QUOTE + entry.getValue().toString() + SIMPLE_QUOTE);
            }
        }
        return queryString.replace(START_QUERY_PARAM, EMPTY).replace(END_BRACKET, EMPTY).replace(TWO_POINTS, EMPTY);
    }

    public String getSelectQueryFromMutationQuery(final String hql, final MyslogAction action) {
        String resultHql = StringUtils.EMPTY;
        if (MyslogAction.DELETE.equals(action)) {
            resultHql = hql.replace(DELETE_CLAUSE, EMPTY);
        }
        if (MyslogAction.UPDATE.equals(action)) {
            StringBuilder builder = new StringBuilder(hql);
            resultHql = builder.replace(hql.indexOf(SET_CLAUSE), hql.indexOf(WHERE_CLAUSE.toUpperCase()), EMPTY)
                    .toString()
                    .replace(UPDATE_CLAUSE, FROM_CLAUSE);
        }
        return resultHql;
    }

    public String convertHqlToSql(final String hql) {
        Session session = entityManager.unwrap(Session.class);
        session.createQuery(hql);
        Map<String, Filter> map = Map.of();
        org.hibernate.engine.query.spi.HQLQueryPlan queryPlan =
                ((SessionFactoryImpl) session.getSessionFactory())
                        .getQueryPlanCache()
                        .getHQLQueryPlan(hql, false, map);

        return queryPlan.getTranslators()[0].getSQLString();
    }

    private static String extractCondition(final String query) {
        return query.substring(query.indexOf(WHERE_CLAUSE)).replaceFirst(WHERE_CLAUSE, EMPTY).trim();
    }

    public static String removeAliases(String sql) {
        sql = SQL_FIELD_PREFIX_PATTERN.matcher(sql).replaceAll(EMPTY);
        return sql.replace(SIMPLE_QUOTE, EMPTY);
    }

    private HistoryEntity createHistoryEntity(final String entity, final MyslogAction action) {
        HistoryEntity history = new HistoryEntity();
        history.setInsertionDate(LocalDateTime.now());
        String entityLabel = entity.replace(ENTITY, EMPTY);
        history.setEntite(entityLabel.length() <= MAX_INDEX ? entityLabel : entityLabel.substring(BEGIN_INDEX, MAX_INDEX));
        history.setActionUtilisateur(action);
        history.setStation(ContextHolder.getContext().getHost());
        history.setUtilisateur(ContextHolder.getContext().getUser());
        history.setCodulo(ContextHolder.getContext().getId());
        history.setVersio(versionAdelaideService.getAdelaideVersion());
        return history;
    }

    private static Map<String, Object> buildTableField(final String paramName, final Object entity) {
        Map<String, Object> result = new HashMap<>();
        if (entity != null) {
            return doBuildValues(paramName, entity, result);
        } else {
            result.put(paramName, SQL_NULL);
            return result;
        }
    }

    private static Map<String, Object> doBuildValues(final String paramName, final Object entity, final Map<String, Object> result) {
        if (entity instanceof Date) {
            LocalDateTime localDateTime = DateUtils.getLocaldateTimeFromSqlDate((Date) entity);
            result.put(paramName, DateUtils.formatLocalDateEnFr(localDateTime));
        } else if (entity instanceof String || entity instanceof Integer) {
            result.put(paramName, entity);
        } else {
            for (Field field : entity.getClass().getDeclaredFields()) {
                // Garder la réflection volontairement pour l'accessiblité
                field.setAccessible(true);//NOSONAR
                try {
                    Object value = field.get(entity) != null ? field.get(entity) : SQL_NULL;
                    result.put(paramName + StringUtils.DOT + field.getName(), value);
                } catch (IllegalAccessException iae) {
                    LOGGER.error(iae.getMessage());
                }
            }
        }
        return result;
    }


}

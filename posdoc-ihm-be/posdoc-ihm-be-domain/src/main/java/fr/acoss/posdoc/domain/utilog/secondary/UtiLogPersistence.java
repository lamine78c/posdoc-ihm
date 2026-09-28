package fr.acoss.posdoc.domain.utilog.secondary;

import fr.acoss.posdoc.domain.utilog.model.FindUtiLogByQuery;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;

import java.util.List;

public interface UtiLogPersistence {
    UtiLog insertOrUpdateUtilog(final UtiLog utiLog);

    List<UtiLog> findUtiLogByQuery(final FindUtiLogByQuery query);

    List<String> findDistinctUser();

    List<String> findDistinctAction();

    List<String> findDistinctFormId();

    List<Integer> findRowNotInMyslogToPurge(int days, int rowlimit);

    void deleteByCoduloIn(Iterable<Integer> codulos);
}

package fr.acoss.posdoc.domain.history.secondary;

import fr.acoss.posdoc.domain.history.model.FindHistoryByQuery;
import fr.acoss.posdoc.domain.history.model.History;

import java.util.List;

public interface HistoryPersistence {

  List<History> selectAll();

  List<History> findHistoryByQuery(FindHistoryByQuery query);

  List<String> findDistinctUser();

  List<String> findDistinctEntity();

  List<History> findHistoryByCodulo(Integer codulo);

  List<Integer> findRowToPurge(int days, int limit);

  void deleteByIdIn(Iterable<Integer> ids);
}

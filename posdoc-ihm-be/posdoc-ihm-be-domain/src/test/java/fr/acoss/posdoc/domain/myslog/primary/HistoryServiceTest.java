package fr.acoss.posdoc.domain.myslog.primary;

import fr.acoss.posdoc.domain.history.primary.HistoryService;
import fr.acoss.posdoc.domain.history.secondary.HistoryPersistence;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.mockito.Mockito.when;

class HistoryServiceTest {

  @Test
  void test_purge() {
    HistoryPersistence historyPersistence = Mockito.mock(HistoryPersistence.class);
    HistoryService historyService = new HistoryService(historyPersistence);
    when(historyPersistence.findRowToPurge(Mockito.any(Integer.class), Mockito.any(Integer.class))).thenReturn(List.of(1));
    historyService.purge(1, 1);
    Mockito.verify(historyPersistence).findRowToPurge(1, 1);
    Mockito.verify(historyPersistence).deleteByIdIn(List.of(1));
  }
}
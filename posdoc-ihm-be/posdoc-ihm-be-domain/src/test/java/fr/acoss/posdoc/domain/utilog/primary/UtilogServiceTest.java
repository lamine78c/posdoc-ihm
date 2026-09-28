package fr.acoss.posdoc.domain.utilog.primary;

import fr.acoss.posdoc.domain.parametre.secondary.ParametrePersistence;
import fr.acoss.posdoc.domain.utilog.secondary.UtiLogPersistence;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.mockito.Mockito.when;

class UtilogServiceTest {

  @Test
  void test_purge() {
    UtiLogPersistence utiLogPersistence = Mockito.mock(UtiLogPersistence.class);
    ParametrePersistence parametrePersistence = Mockito.mock(ParametrePersistence.class);
    UtiLogService utiLogService = new UtiLogService(utiLogPersistence, parametrePersistence);
    when(utiLogPersistence.findRowNotInMyslogToPurge(Mockito.any(Integer.class), Mockito.any(Integer.class))).thenReturn(List.of(1));
    utiLogService.purgeRowNotInMyslog(1, 10);
    Mockito.verify(utiLogPersistence).findRowNotInMyslogToPurge(1, 10);
    Mockito.verify(utiLogPersistence).deleteByCoduloIn(List.of(1));
  }
}
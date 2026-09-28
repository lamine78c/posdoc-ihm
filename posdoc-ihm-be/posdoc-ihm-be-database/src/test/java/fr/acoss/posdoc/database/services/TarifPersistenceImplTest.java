package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.database.dao.TarifRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import javax.transaction.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class TarifPersistenceImplTest {

  @Mock
  private TarifRepository tarifRepository;

  @Autowired
  private TarifPersistenceImpl tarifPersistence;

  @Test
  @Transactional
  void nextNumero() {
    assertEquals("0005", tarifPersistence.nextNumero("CP2"));
    //Si inexistant, le numéro est 0000
    assertEquals("0000", tarifPersistence.nextNumero("AV2"));
  }

  @Test
  @Transactional
  void should_deleTarifsByTypes_nominal() {
    tarifPersistence = new TarifPersistenceImpl(tarifRepository);
    List<String> types = List.of("T1", "T2");
    tarifPersistence.deleTarifsByTypes(types);
    verify(tarifRepository).deleteTarifEntitiesByTypes(types);
  }


}
package fr.acoss.posdoc.database;

import fr.acoss.posdoc.database.dao.CommandeRepository;
import fr.acoss.posdoc.database.dao.HistoryRepository;
import fr.acoss.posdoc.database.entities.CommandeCompositeId;
import fr.acoss.posdoc.database.entities.CommandeEntity;
import fr.acoss.posdoc.database.entities.HistoryEntity;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class TestActionInterceptor {

    @Autowired
    private CommandeRepository commandeRepository;

    @Autowired
    private HistoryRepository historyRepository;

    @Test
    void testCommandeAndAction() {
        int size = historyRepository.findAll().size();
        CommandeEntity commandeEntity = new CommandeEntity();
        CommandeCompositeId commandeCompositeId = new CommandeCompositeId("A", "org", "app", "code");
        commandeEntity.setId(commandeCompositeId);
        commandeEntity.setLibelle("libelle");
        commandeRepository.save(commandeEntity);

        List<HistoryEntity> histories = historyRepository.findAll();
        assertEquals(size + 1, histories.size());
        HistoryEntity historySave = histories.get(size);
        assertEquals("c05_codenv=A, c05_codorg=org,c05_codapp=app, c05_codcom=code, s05_libcom=libelle", historySave.getSortie());
        assertNull(historySave.getEntree());
        commandeEntity.setLibelle("libelle1");
        commandeRepository.saveAndFlush(commandeEntity);

        histories = historyRepository.findAll();
        assertEquals(size + 2, histories.size());
        HistoryEntity historyUpdate = histories.get(size + 1);
        assertEquals("s05_libcom=libelle", historyUpdate.getEntree());
        assertEquals("s05_libcom=libelle1", historyUpdate.getSortie());

        commandeRepository.delete(commandeEntity);
        histories = historyRepository.findAll();
        assertEquals(size + 3, histories.size());

        HistoryEntity historyDelete = histories.get(size + 2);
        assertEquals("c05_codenv=A, c05_codorg=org,c05_codapp=app, c05_codcom=code, s05_libcom=libelle1", historyDelete.getEntree());
        assertNull(historyDelete.getSortie());
    }
}

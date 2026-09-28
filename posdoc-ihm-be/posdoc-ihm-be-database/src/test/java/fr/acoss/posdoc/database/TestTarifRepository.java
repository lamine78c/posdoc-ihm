package fr.acoss.posdoc.database;

import fr.acoss.posdoc.database.dao.TarifRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class TestTarifRepository {

    @Autowired
    private TarifRepository tarifRepository;

    @Test
    @Transactional
    void test_tarifrepository() {
        //schema.sql comporte 3 entrées, on check leur présence pour voir si hibernate est bien configuré
        final var all = tarifRepository.findAll();
        assertNotNull(all);
        assertFalse(all.isEmpty());
    }

}

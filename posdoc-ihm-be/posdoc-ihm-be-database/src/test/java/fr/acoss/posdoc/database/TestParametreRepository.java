package fr.acoss.posdoc.database;

import fr.acoss.posdoc.database.dao.ParametreRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class TestParametreRepository {

    @Autowired
    private ParametreRepository parametreRepository;

    @Test
    @Transactional
    void test_parametrerepository() {
        final var all = parametreRepository.findAll();
        assertNotNull(all);
        assertFalse(all.isEmpty());
    }

    @Test
    @Transactional
    void test_paramtre_value() {
        assertEquals("FT", parametreRepository.getValueByCode("MASGAM"));
        assertEquals("MAS", parametreRepository.getValueByCode("MASAPP"));
    }
}

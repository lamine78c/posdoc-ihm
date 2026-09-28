package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.commande.model.CodLibCommandeDTO;
import fr.acoss.posdoc.domain.commande.model.CommandeFiltersPayload;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class CommandePersistenceImplTest {

    @Autowired
    private CommandePersistenceImpl commandePersistence;

    @Test
    void should_return_codlib_with_all_filters() {
        CommandeFiltersPayload filters = new CommandeFiltersPayload("N", "750", "SNV2");

        List<CodLibCommandeDTO> result = commandePersistence.getCodLibCommandeByEnvOrgApp(filters);

        assertFalse(result.isEmpty());
        assertEquals("ER04", result.get(0).getCode());
        assertNotNull(result.get(0).getLibelle());
    }

    @Test
    void should_return_empty_when_no_match() {
        CommandeFiltersPayload filters = new CommandeFiltersPayload("Z", "999", "UNKNOWN");

        List<CodLibCommandeDTO> result = commandePersistence.getCodLibCommandeByEnvOrgApp(filters);

        assertEquals(0, result.size());
    }
}

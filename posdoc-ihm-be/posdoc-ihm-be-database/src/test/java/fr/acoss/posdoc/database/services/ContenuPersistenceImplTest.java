package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.contenu.model.Contenu;
import fr.acoss.posdoc.domain.contenu.model.ContenuForAccueil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/contenu/insert-contenu.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/contenu/clean-contenu.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class ContenuPersistenceImplTest {
    @Autowired
    private ContenuPersistenceImpl contenuPersistenceImpl;

    @Test
    void test_getContenusForAccueil() {
        List<String> userOrganismes = List.of("117");
        List<ContenuForAccueil> response = contenuPersistenceImpl.getContenusForAccueil(userOrganismes);

        assertEquals(1, response.size());
        assertEquals("Test", response.get(0).getTitre());
    }

    @Test
    void should_select_all_contenu() {
        List<Contenu> results = contenuPersistenceImpl.selectAll();
        assertNotNull(results);
        assertEquals(1, results.size());
    }
}

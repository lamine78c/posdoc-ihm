package fr.acoss.posdoc.database;

import fr.acoss.posdoc.database.dao.InformationOrganismeRepository;
import fr.acoss.posdoc.database.dao.OrganismeRepository;
import fr.acoss.posdoc.database.entities.InformationOrganismeEntity;
import fr.acoss.posdoc.database.entities.OrganismeEntity;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class TestInformationOrganismeRepository {

    private static final Logger LOGGER = LoggerFactory
            .getLogger(TestInformationOrganismeRepository.class);

    @Autowired
    private InformationOrganismeRepository informationOrganismeRepository;

    @Autowired
    private OrganismeRepository organismeRepository;


    @Test
    @Transactional
    void test_organismerepository() {
        //schema.sql comporte 6 entrées, on check leur présence pour voir si hibernate est bien configuré
        final var all = organismeRepository.findAll();
        assertEquals(6, all.size());

        final var organisme = organismeRepository.findById("750").get();
        assertEquals("URSSAF ILE DE FRANCE", organisme.getLibelle());
        assertNull(organisme.getAdresse1());
        assertNull(organisme.getAdresse2());
        assertNull(organisme.getAdresse3());
        assertNull(organisme.getAdresse4());
        assertEquals("R", organisme.getType());
        assertEquals("117", organisme.getCodeRegion());
        assertTrue(organisme.getCodeSite().isBlank());
    }

    @Test
    @Transactional
    void test_infoorganismerepository() {

        final var organisme = new OrganismeEntity();
        organisme.setCode("750");

        final var infoOrganisme = new InformationOrganismeEntity();
        infoOrganisme.setId(0);
        infoOrganisme.setOrganismeEntity(organisme);
        infoOrganisme.setMessage("Message à destination de l'organisme 750");
        infoOrganisme.setActif(true);
        infoOrganisme.setDate(LocalDateTime.now());

        informationOrganismeRepository.save(infoOrganisme);

        final var all = informationOrganismeRepository.findAll();
        assertEquals(1, informationOrganismeRepository.findAll().size());

        final var infoOrg = all.get(0);
        assertEquals("750", infoOrg.getOrganismeEntity().getCode());
        assertEquals("Message à destination de l'organisme 750", infoOrg.getMessage());
        assertTrue(infoOrg.getActif());

    }

    @Test()
    @Transactional
    void test_delete_all_by_id_in() {
        final var organisme = new OrganismeEntity();
        organisme.setCode("750");

        var infoOrganisme1 = new InformationOrganismeEntity();
        infoOrganisme1.setId(1);
        infoOrganisme1.setOrganismeEntity(organisme);
        infoOrganisme1.setMessage("Message à destination de l'organisme 750");
        infoOrganisme1.setActif(true);
        infoOrganisme1.setDate(LocalDateTime.now());

        infoOrganisme1 = informationOrganismeRepository.save(infoOrganisme1);

        var infoOrganisme2 = new InformationOrganismeEntity();
        infoOrganisme2.setId(2);
        infoOrganisme2.setOrganismeEntity(organisme);
        infoOrganisme2.setMessage("Message à destination de l'organisme 750");
        infoOrganisme2.setActif(true);
        infoOrganisme2.setDate(LocalDateTime.now());

        infoOrganisme2 = informationOrganismeRepository.save(infoOrganisme2);

        var infoOrganisme3 = new InformationOrganismeEntity();
        infoOrganisme3.setId(3);
        infoOrganisme3.setOrganismeEntity(organisme);
        infoOrganisme3.setMessage("Message à destination de l'organisme 750");
        infoOrganisme3.setActif(true);
        infoOrganisme3.setDate(LocalDateTime.now());

        infoOrganisme3 = informationOrganismeRepository.save(infoOrganisme3);

        assertEquals(3, informationOrganismeRepository.count());

        final var ids = Arrays.asList(infoOrganisme2.getId(), infoOrganisme3.getId());
        informationOrganismeRepository.deleteAllByIdIn(ids);

        assertEquals(1, informationOrganismeRepository.count());

        final var find = informationOrganismeRepository.findAll().get(0);
        assertEquals(infoOrganisme1.getId(), find.getId());
    }

}

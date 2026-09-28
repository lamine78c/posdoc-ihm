package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.database.dao.ParametreEditionRepository;
import fr.acoss.posdoc.domain.parametre.distribution.model.CodeEnvOrgsAppPayload;
import fr.acoss.posdoc.domain.parametre.distribution.model.RessourceCodeEnvOrgsAppDTO;
import fr.acoss.posdoc.domain.parametre.edition.model.ParametreEdition;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import javax.transaction.Transactional;
import java.util.Arrays;
import java.util.List;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/parametre-edition/insert-parametre-edition.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/parametre-edition/clean-parametre-edition.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class ParametreEditionPersistenceImplTest {

    @Autowired
    private ParametreEditionPersistenceImpl parametreEditionPersistence;

    @Autowired
    private ParametreEditionRepository parametreEditionRepository;

    @Test
    @Transactional
    void selectAll_should_return_all_parametre_editions_ordered_by_reference() {
        List<ParametreEdition> parametres = this.parametreEditionPersistence.selectAll();

        Assertions.assertNotNull(parametres);
        Assertions.assertEquals(4, parametres.size());

        Assertions.assertEquals("REF001", parametres.get(0).getReference());
        Assertions.assertEquals("REF002", parametres.get(1).getReference());
        Assertions.assertEquals("REF003", parametres.get(2).getReference());
        Assertions.assertEquals("REF004", parametres.get(3).getReference());

        ParametreEdition premier = parametres.get(0);
        Assertions.assertEquals("PDF", premier.getType());
        Assertions.assertEquals("Référence édition 1", premier.getLibelle());
        Assertions.assertEquals(1, premier.getLineNumber());
        Assertions.assertEquals(1, premier.getColumnNumber());
        Assertions.assertEquals(100, premier.getLength());
    }

    @Test
    @Transactional
    void deleteAll_should_delete_parametre_editions_by_references() {
        List<String> idsToDelete = Arrays.asList("REF001", "REF003");

        this.parametreEditionPersistence.deleteAll(idsToDelete);

        long count = this.parametreEditionRepository.count();
        Assertions.assertEquals(2, count);

        Assertions.assertTrue(this.parametreEditionRepository.existsById("REF002"));
        Assertions.assertTrue(this.parametreEditionRepository.existsById("REF004"));

        Assertions.assertFalse(this.parametreEditionRepository.existsById("REF001"));
        Assertions.assertFalse(this.parametreEditionRepository.existsById("REF003"));
    }

    @Test
    @Transactional
    void deleteAll_should_do_nothing_when_ids_list_is_empty() {
        List<String> idsToDelete = Arrays.asList();

        this.parametreEditionPersistence.deleteAll(idsToDelete);

        long count = this.parametreEditionRepository.count();
        Assertions.assertEquals(4, count);
    }

    @Test
    @Transactional
    void formatsExistsInparametresEditions_should_return_existing_formats() {
        List<String> formatCodes = Arrays.asList("PDF", "XML", "CSV");

        List<String> existingFormats = this.parametreEditionPersistence.formatsExistsInparametresEditions(formatCodes);

        Assertions.assertNotNull(existingFormats);
        Assertions.assertEquals(2, existingFormats.size());
        Assertions.assertTrue(existingFormats.contains("PDF"));
        Assertions.assertTrue(existingFormats.contains("XML"));
        Assertions.assertFalse(existingFormats.contains("CSV"));
    }

    @Test
    @Transactional
    void formatsExistsInparametresEditions_should_return_empty_list_when_no_format_exists() {
        List<String> formatCodes = Arrays.asList("CSV", "JSON");

        List<String> existingFormats = this.parametreEditionPersistence.formatsExistsInparametresEditions(formatCodes);

        Assertions.assertNotNull(existingFormats);
        Assertions.assertEquals(0, existingFormats.size());
    }

    @Test
    @Transactional
    void getRessourcesByCodeEnvOrgsApp_should_return_ressources_without_profil_admin() {
        CodeEnvOrgsAppPayload payload = new CodeEnvOrgsAppPayload();
        payload.setCodenv("P");
        payload.setCodapp("AP1");
        payload.setCodorgs(new String[]{"750", "100"});
        payload.setIsProfilAdmin(false);

        List<RessourceCodeEnvOrgsAppDTO> ressources = this.parametreEditionPersistence.getRessourcesByCodeEnvOrgsApp(payload);

        Assertions.assertNotNull(ressources);
        Assertions.assertEquals(1, ressources.size());

        RessourceCodeEnvOrgsAppDTO ressource = ressources.get(0);
        Assertions.assertNotNull(ressource);
        Assertions.assertNotNull(ressource.getCodgam());
        Assertions.assertNotNull(ressource.getCodsit());
        Assertions.assertNotNull(ressource.getCodres());
    }

    @Test
    @Transactional
    void getRessourcesByCodeEnvOrgsApp_should_return_ressources_including_profil_admin() {
        CodeEnvOrgsAppPayload payload = new CodeEnvOrgsAppPayload();
        payload.setCodenv("P");
        payload.setCodapp("AP1");
        payload.setCodorgs(new String[]{"999", "210"});
        payload.setIsProfilAdmin(true);

        List<RessourceCodeEnvOrgsAppDTO> ressources = this.parametreEditionPersistence.getRessourcesByCodeEnvOrgsApp(payload);

        Assertions.assertNotNull(ressources);
        Assertions.assertFalse(ressources.isEmpty());
    }

    @Test
    @Transactional
    void getRessourcesByCodeEnvOrgsApp_should_return_empty_list_when_no_match() {
        CodeEnvOrgsAppPayload payload = new CodeEnvOrgsAppPayload();
        payload.setCodenv("X");
        payload.setCodapp("APPINEXISTANT");
        payload.setCodorgs(new String[]{"999"});
        payload.setIsProfilAdmin(false);

        List<RessourceCodeEnvOrgsAppDTO> ressources = this.parametreEditionPersistence.getRessourcesByCodeEnvOrgsApp(payload);

        Assertions.assertNotNull(ressources);
        Assertions.assertEquals(0, ressources.size());
    }

    @Test
    @Transactional
    void getCodeDestinatairesByCodeOrgs_should_return_common_destinataires() {
        List<String> codorgs = Arrays.asList("750", "100");

        List<String> destinataires = this.parametreEditionPersistence.getCodeDestinatairesByCodeOrgs(codorgs);

        Assertions.assertNotNull(destinataires);
        Assertions.assertEquals(0, destinataires.size());
    }

    @Test
    @Transactional
    void getCodeDestinatairesByCodeOrgs_should_return_destinataires_for_single_org() {
        List<String> codorgs = List.of("750");

        List<String> destinataires = this.parametreEditionPersistence.getCodeDestinatairesByCodeOrgs(codorgs);

        Assertions.assertNotNull(destinataires);
        Assertions.assertEquals(1, destinataires.size());
        Assertions.assertEquals("DEST001", destinataires.get(0));
    }

    @Test
    @Transactional
    void getCodeDestinatairesByCodeOrgs_should_return_empty_list_when_org_not_found() {
        List<String> codorgs = List.of("INEXISTANT");

        List<String> destinataires = this.parametreEditionPersistence.getCodeDestinatairesByCodeOrgs(codorgs);

        Assertions.assertNotNull(destinataires);
        Assertions.assertEquals(0, destinataires.size());
    }
}

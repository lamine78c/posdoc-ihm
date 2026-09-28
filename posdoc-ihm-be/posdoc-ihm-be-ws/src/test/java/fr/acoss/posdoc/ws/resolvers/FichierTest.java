package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.FichierRepository;
import fr.acoss.posdoc.database.entities.FichierCompositeId;
import fr.acoss.posdoc.domain.fichier.model.FichierComposite;
import fr.acoss.posdoc.domain.fichier.model.query.SearchFichierFilterQuery;
import fr.acoss.posdoc.domain.fichier.model.query.SearchOrgByEnvAppComFicsQuery;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateFichierPayloadDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"/sql/fichier/insert-fichier.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"/sql/fichier/clean-fichier.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class FichierTest extends AbstractGraphqlTest {

    @Autowired
    private FichierRepository fichierRepository;

    @Test
    void liste_environnement() throws IOException {
        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/liste-environnement-existant.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(4, response.getList("$.data.getDistinctEnvsFromFichier", String.class).size());
        assertEquals(fichierRepository.getDistinctEnvironnement(), response.getList("$.data.getDistinctEnvsFromFichier", String.class));
    }

    @Test
    void liste_organisme_by_environnement() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("query", new ObjectMapper().valueToTree(
                this.getParamData(List.of("D", "T"), null, null, null)
        ));

        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/liste_organisme_by_environnement.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(4, response.getList("$.data.getDistOrgByEnvFromFichier", String.class).size());

        SearchFichierFilterQuery query = new SearchFichierFilterQuery();
        query.setCodenvs(List.of("D", "T"));
        assertEquals(fichierRepository.findDistOrgByEnv(query), response.getList("$.data.getDistOrgByEnvFromFichier", String.class));
    }

    @Test
    void liste_organisme_by_environnement_with_user_profile() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("query", new ObjectMapper().valueToTree(
                this.getParamData(List.of("D", "T"), null, null, null)
        ));

        graphQLTestTemplate.addHeader("user.organismes", "904");
        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/liste_organisme_by_environnement.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(1, response.getList("$.data.getDistOrgByEnvFromFichier", String.class).size());

        graphQLTestTemplate.clearHeaders();
    }

    @Test
    void liste_application_by_environnement_organisme() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("query", new ObjectMapper().valueToTree(
                this.getParamData(List.of("D", "T"), List.of("750", "904"), null, null)
        ));

        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/liste_application_by_environnement_organisme.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(1, response.getList("$.data.getDistAppByEnvOrgFromFichier", String.class).size());

        SearchFichierFilterQuery query = new SearchFichierFilterQuery();
        query.setCodenvs(List.of("D", "T"));
        query.setCodorgs(List.of("750", "904"));
        assertEquals(fichierRepository.findDistAppByEnvOrg(query), response.getList("$.data.getDistAppByEnvOrgFromFichier", String.class));
    }

    @Test
    void liste_commande_by_environnement_organisme_application() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("query", new ObjectMapper().valueToTree(
                this.getParamData(List.of("D", "T"), List.of("750", "904"), "SNV2", null)
        ));

        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/liste_commande_by_environnement_organisme_application.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(2, response.getList("$.data.getDistComByEnvOrgAppFromFichier", String.class).size());

        SearchFichierFilterQuery query = new SearchFichierFilterQuery();
        query.setCodenvs(List.of("D", "T"));
        query.setCodorgs(List.of("750", "904"));
        query.setCodapp("SNV2");
        assertEquals(fichierRepository.findDistComByEnvOrgApp(query), response.getList("$.data.getDistComByEnvOrgAppFromFichier", String.class));
    }

    @Test
    void liste_fichier_by_environnement_organisme_application_commande() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("query", new ObjectMapper().valueToTree(
                this.getParamData(List.of("D", "T"), List.of("750", "904"), "SNV2", "RDEH")
        ));
        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/liste-fichier-by-env-org-app-com.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        var res = response.getList("$.data.getDistFicByEnvOrgAppCom", String.class);
        assertEquals(2, res.size());

        SearchFichierFilterQuery query = new SearchFichierFilterQuery();
        query.setCodenvs(List.of("D", "T"));
        query.setCodorgs(List.of("750", "904"));
        query.setCodapp("SNV2");
        query.setCodcom("RDEH");
        assertEquals(fichierRepository.findDistFicByEnvOrgAppCom(query), response.getList("$.data.getDistFicByEnvOrgAppCom", String.class));
    }

    @Test
    void lister_fichiers() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("query", new ObjectMapper().valueToTree(
                this.getParamData(List.of("D", "T"), List.of("750", "904"), "SNV2", "RDEH")
        ));

        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/liste-fichier-existant.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        var res = response.getList("$.data.getPreselectedFichier", CreateOrUpdateFichierPayloadDTO.class);
        assertEquals(2, res.size());

    }

    @Test
    void lister_fichiers_with_user_profile() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("query", new ObjectMapper().valueToTree(
                this.getParamData(List.of("D", "T"), List.of("750", "904"), "SNV2", "RDEH")
        ));

        graphQLTestTemplate.addHeader("user.organismes", "904");
        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/liste-fichier-existant.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        var res = response.getList("$.data.getPreselectedFichier", CreateOrUpdateFichierPayloadDTO.class);
        assertEquals(1, res.size());

        // nettoyer l'entete http
        graphQLTestTemplate.clearHeaders();

    }

    @Test
    void get_fichiers_to_add_new_exemplaire_should_be_ok() throws IOException {
        String codeEnv = "T";
        String codeOrg = "750";
        String codeApp = "SNV2";
        String perCod = "240523-00";
        String codeGam = "FT";

        final var variables = new ObjectMapper().createObjectNode();
        variables.put("codeEnv", codeEnv);
        variables.put("codeOrg", codeOrg);
        variables.put("codeApp", codeApp);
        variables.put("perCod", perCod);
        variables.put("codeGam", codeGam);

        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/get-fichiers-to-add-new-exemplaire.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(1, response.getList("$.data.getFichiersToAddNewExemplaire", String.class).size());

        assertEquals(
                fichierRepository.getFichiersToAddNewExemplaire(codeEnv, codeOrg, codeApp, perCod, codeGam),
                response.getList("$.data.getFichiersToAddNewExemplaire", String.class)
        );
    }

    private SearchFichierFilterQuery getParamData(List<String> codenvs, List<String> codorgs, String codapp, String codcom) {
        SearchFichierFilterQuery query = new SearchFichierFilterQuery();
        query.setCodenvs(codenvs);
        query.setCodorgs(codorgs);
        query.setCodapp(codapp);
        query.setCodcom(codcom);
        return query;
    }
    @Test
    void get_Fichiers_Search_By_Environnement() throws IOException {
        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/liste-fichiers-by-environnement.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
    }

    @Test
    void get_org_by_env_app_com_fics() throws IOException {
        SearchOrgByEnvAppComFicsQuery query = new SearchOrgByEnvAppComFicsQuery();
        query.setCodeEnv("D");
        query.setCodeApp("SNV2");
        query.setCodeCom("RDEH");
        query.setCodesFic(List.of("L04"));
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("query", new ObjectMapper().valueToTree(query));
        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/get-org-by-env-app-com-fics.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(1, response.getList("$.data.getOrgByEnvAppComFics", String.class).size());
    }

    @Test
    void liste_organisme_no_mas_by_environnement() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("query", new ObjectMapper().valueToTree(
                this.getParamData(List.of("D", "T"), null, null, null)
        ));

        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/liste_organisme_no_mas_by_environnement.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals(1, response.getList("$.data.getDistOrgNoMasByEnvFromFichier", String.class).size());
    }

    @Test
    void update_message_by_ids() throws IOException {
        List<FichierComposite> ids = new ArrayList<>();
        FichierComposite id = new FichierComposite();
        id.setCodeEnv("D");
        id.setCodeOrg("904");
        id.setCodeApp("SNV2");
        id.setCodeCom("RDEH");
        id.setCodeFich("L04");
        ids.add(id);

        final var variables = new ObjectMapper().createObjectNode();
        variables.set("ids", new ObjectMapper().valueToTree(ids));
        variables.set("message", new ObjectMapper().valueToTree("messagetest"));

        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/update-message-by-fic-ids.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());

        FichierCompositeId idFic = new FichierCompositeId();
        idFic.setCodeEnv("D");
        idFic.setCodeApp("SNV2");
        idFic.setCodeCom("RDEH");
        idFic.setCodeOrg("904");
        idFic.setCodeFich("L04");
        var fichier = fichierRepository.findById(idFic);
        assertTrue(fichier.isPresent());
        assertEquals("messagetest", fichier.get().getFicAtt());
    }

    @Test
    void get_all_fichiers_should_be_ok() throws IOException {
        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/all-fichiers.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        var fichiers = response.getList("$.data.allFichiers", CreateOrUpdateFichierPayloadDTO.class);
        assertNotNull(fichiers);
        assertFalse(fichiers.isEmpty());
    }

    @Test
    void get_fichiers_by_app_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.put("codenv", "D");
        variables.set("codesOrg", new ObjectMapper().valueToTree(List.of("904")));
        variables.set("codesApp", new ObjectMapper().valueToTree(List.of("SNV2")));
        variables.set("codesCom", new ObjectMapper().valueToTree(List.of("RDEH")));

        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/get-fichiers-by-app.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        var fichiers = response.getList("$.data.getFichiersByApp", CreateOrUpdateFichierPayloadDTO.class);
        assertNotNull(fichiers);
        assertFalse(fichiers.isEmpty());
    }

    @Test
    void get_fichiers_search_elements_should_be_ok() throws IOException {
        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/get-fichiers-search-elements.graphql", null);
        assertNotNull(response);
        assertTrue(response.isOk());
        var elements = response.getList("$.data.getFichiersSearchElements", Object.class);
        assertNotNull(elements);
        assertFalse(elements.isEmpty());
    }

    @Test
    void get_fichiers_for_updating_reference_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("codesEnv", new ObjectMapper().valueToTree(List.of("D", "T")));
        variables.set("codesApp", new ObjectMapper().valueToTree(List.of("SNV2")));
        variables.set("refsImp", new ObjectMapper().valueToTree(List.of("L04")));

        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/get-fichiers-for-updating-reference.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        var fichiers = response.getList("$.data.getFichiersForUpdatingReference", CreateOrUpdateFichierPayloadDTO.class);
        assertNotNull(fichiers);
    }

    @Test
    void get_fichiers_for_ads_null_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.put("codeEnv", "D");
        variables.put("codeOrg", "904");
        variables.put("codeApp", "SNV2");
        variables.put("codeCom", "RDEH");
        variables.put("codeFic", "L04");
        variables.put("refImprime", "L04");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/get-fichiers-for-ads-null.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        var fichiers = response.getList("$.data.getFichiersForAdsNull", CreateOrUpdateFichierPayloadDTO.class);
        assertNotNull(fichiers);
    }

    @Test
    void delete_fichiers_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var deleteFichiers = variables.putArray("deleteFichiers");

        final var fichier1 = deleteFichiers.addObject();
        fichier1.put("codeEnv", "D");
        fichier1.put("codeOrg", "904");
        fichier1.put("codeApp", "SNV2");
        fichier1.put("codeCom", "TEST");
        fichier1.put("codeFich", "F01");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/delete-fichiers.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("true", response.get("$.data.deleteFichiers.ok"));

        FichierCompositeId idFic = new FichierCompositeId();
        idFic.setCodeEnv("D");
        idFic.setCodeOrg("904");
        idFic.setCodeApp("SNV2");
        idFic.setCodeCom("TEST");
        idFic.setCodeFich("F01");
        var fichier = fichierRepository.findById(idFic);
        assertFalse(fichier.isPresent());
    }

    @Test
    void update_fichiers_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var fichiers = variables.putArray("fichiers");

        final var fichier1 = fichiers.addObject();
        fichier1.put("codeEnv", "T");
        fichier1.put("codeOrg", "750");
        fichier1.put("codeApp", "SNV2");
        fichier1.put("codeCom", "RDEH");
        fichier1.put("codeFich", "L02");
        fichier1.put("libFichier", "LISTE MODIFIEE");
        fichier1.put("refImprime", "V90R");
        fichier1.put("typeFormat", "V");
        fichier1.put("typeSupport", "S");
        fichier1.put("typeMultif", "-");
        fichier1.put("refFormat", "661");
        fichier1.put("refSupport", "301");
        fichier1.put("typeSig", "V");
        fichier1.put("page", 5);
        fichier1.put("eclatement", 0);

        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/update-fichiers.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        var fichiersUpdated = response.getList("$.data.updateFichiers", CreateOrUpdateFichierPayloadDTO.class);
        assertNotNull(fichiersUpdated);
        assertFalse(fichiersUpdated.isEmpty());

        FichierCompositeId idFic = new FichierCompositeId();
        idFic.setCodeEnv("T");
        idFic.setCodeOrg("750");
        idFic.setCodeApp("SNV2");
        idFic.setCodeCom("RDEH");
        idFic.setCodeFich("L02");
        var fichierUpdated = fichierRepository.findById(idFic);
        assertTrue(fichierUpdated.isPresent());
        assertEquals("LISTE MODIFIEE", fichierUpdated.get().getLibFichier());
    }

    @Test
    void create_fichier_with_exemplaire_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var createFichier = variables.putArray("createFichier");

        final var fichier1 = createFichier.addObject();
        fichier1.put("codeEnv", "T");
        fichier1.put("codeOrg", "910");
        fichier1.put("codeApp", "SNV2");
        fichier1.put("codeCom", "RDEH");
        fichier1.put("codeFich", "L99");
        fichier1.put("libFichier", "Fichier avec exemplaire");
        fichier1.put("refImprime", "L99");
        fichier1.put("typeFormat", "B");
        fichier1.put("typeSupport", "I");
        fichier1.put("typeMultif", "-");
        fichier1.put("refFormat", "724");
        fichier1.put("refSupport", "RSI");
        fichier1.put("typeSig", "V");
        fichier1.put("page", 5);
        fichier1.put("eclatement", 0);

        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/create-fichier-with-exemplaire.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertNotNull(response.get("$.data.createFichierWithExemplaire.nbFichiers"));
        assertNotNull(response.get("$.data.createFichierWithExemplaire.nbProduits"));
        assertNotNull(response.get("$.data.createFichierWithExemplaire.nbExemplaires"));
    }

    @Test
    void set_new_imprime_to_fichiers_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var fichiers = variables.putArray("fichiers");

        final var fichier1 = fichiers.addObject();
        fichier1.put("codeEnv", "D");
        fichier1.put("codeOrg", "904");
        fichier1.put("codeApp", "SNV2");
        fichier1.put("codeCom", "RDEH");
        fichier1.put("codeFich", "L04");
        fichier1.put("libFichier", "ECHEANCIER TRIMESTRIEL PRELEVE");
        fichier1.put("refImprime", "NEWREF1");
        fichier1.put("typeFormat", "B");
        fichier1.put("typeSupport", "I");
        fichier1.put("typeMultif", "-");
        fichier1.put("refFormat", "724");
        fichier1.put("refSupport", "RSI");
        fichier1.put("typeSig", "V");
        fichier1.put("page", 5);
        fichier1.put("eclatement", 0);

        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/set-new-imprime-to-fichiers.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        var fichiersUpdated = response.getList("$.data.setNewImprimeToFichiers", CreateOrUpdateFichierPayloadDTO.class);
        assertNotNull(fichiersUpdated);
        assertFalse(fichiersUpdated.isEmpty());
    }

    @Test
    void set_new_imprime_to_fichier_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var fichier = variables.putObject("fichier");

        fichier.put("codeEnv", "T");
        fichier.put("codeOrg", "750");
        fichier.put("codeApp", "SNV2");
        fichier.put("codeCom", "RDEH");
        fichier.put("codeFich", "L02");
        fichier.put("libFichier", "LISTE SURVEILLANCE DES STRUCTU");
        fichier.put("refImprime", "NEWREF2");
        fichier.put("typeFormat", "V");
        fichier.put("typeSupport", "S");
        fichier.put("typeMultif", "-");
        fichier.put("refFormat", "661");
        fichier.put("refSupport", "301");
        fichier.put("typeSig", "V");
        fichier.put("page", 5);
        fichier.put("eclatement", 0);

        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/set-new-imprime-to-fichier.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("T", response.get("$.data.setNewImprimeToFichier.codeEnv"));
        assertEquals("750", response.get("$.data.setNewImprimeToFichier.codeOrg"));
    }

    @Test
    void get_existed_fichiers_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();

        variables.set("codeEnv", new ObjectMapper().valueToTree(List.of("I", "P")));
        variables.put("codeApp", "SNV2");
        variables.put("codeCom", "AZ00");
        variables.put("codeFic", "L00");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/get-existed-fichiers.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        var fichiers = response.getList("$.data.getExistedFichiers", CreateOrUpdateFichierPayloadDTO.class);
        assertNotNull(fichiers);
        assertEquals(2, fichiers.size());
    }

    @Test
    void get_all_distinct_cod_com_fic_prd_should_be_ok() throws IOException {
        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/get-all-distinct-cod-com-fic-prd.graphql", null);

        assertNotNull(response);
        assertTrue(response.isOk());
        var elements = response.getList("$.data.getAllDistinctCodComCodFicCodPrd", Object.class);
        assertNotNull(elements);
    }

    @Test
    void find_fichiers_for_affectation_notice_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var query = variables.putObject("query");
        query.put("codeEnv", "D");
        query.put("codeOrg", "904");
        query.put("codeApp", "SNV2");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/find-fichiers-for-affectation-notice.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
    }

    @Test
    void update_fic_att_by_env_orgs_app_com_fic_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var query = variables.putObject("query");

        query.put("codenv", "D");
        query.set("codorgs", new ObjectMapper().valueToTree(List.of("904")));
        query.put("codapp", "SNV2");
        query.put("codcom", "RDEH");
        query.put("codfic", "L04");
        variables.put("message", "Message test bulk update");

        final var response = graphQLTestTemplate
                .perform("graphql-requests/fichier/update-fic-att-by-env-orgs-app-com-fic.graphql", variables);

        assertNotNull(response);
        assertTrue(response.isOk());
        assertEquals("true", response.get("$.data.updateFicAttByEnvOrgsAppComFic"));
    }

}

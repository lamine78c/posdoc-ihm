package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.database.dao.FichierRepository;
import fr.acoss.posdoc.database.entities.FichierCompositeId;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireByFilterQuery;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireByResource;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireFichier;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireFichierCodficRefimpCodprdDTO;
import fr.acoss.posdoc.domain.exemplaire.model.ExemplaireRessource;
import fr.acoss.posdoc.domain.exemplaire.model.FindOrganismesToCompleteInput;
import fr.acoss.posdoc.domain.exemplaire.model.query.ExemplaireByRessourceQuery;
import fr.acoss.posdoc.ws.resolvers.inputs.CreateOrUpdateExemplaireInputDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class ExemplaireTest extends AbstractGraphqlTest {

    @Autowired
    private FichierRepository fichierRepository;

    @Test
    void get_distinct_envs_from_exemplaire_should_be_ok() throws IOException {
        final var response = graphQLTestTemplate.perform(
                "graphql-requests/exemplaire/get-distinct-envs-from-exemplaires.graphql", null
        );

        assertNotNull(response);
        assertTrue(response.isOk());

        List<String> envList = response.getList("$.data.getDistinctEnvsFromExemplaire", String.class);

        assertEquals(3, envList.size());
        assertEquals("I", envList.get(0));
        assertEquals("P", envList.get(1));
    }

    @Test
    void get_distinct_org_by_env_from_exemplaire_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        ArrayNode codesEnv = new ObjectMapper().createArrayNode().add("I");
        variables.set("codenvs", codesEnv);

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/exemplaire/get-distinct-org-by-env-from-exemplaire.graphql",
                variables
        );

        assertNotNull(response);
        assertTrue(response.isOk());

        List<String> orgList = response.getList("$.data.getDistOrgByEnvFromExemplaire", String.class);

        assertEquals(2, orgList.size());
        assertEquals("010", orgList.get(0));
    }

    @Test
    void get_distinct_org_by_env_from_exemplaire_with_user_profile_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        ArrayNode codesEnv = new ObjectMapper().createArrayNode().add("I");
        variables.set("codenvs", codesEnv);

        graphQLTestTemplate.addHeader("user.organismes", "010");
        final var response = graphQLTestTemplate.perform(
                "graphql-requests/exemplaire/get-distinct-org-by-env-from-exemplaire.graphql",
                variables
        );

        assertNotNull(response);
        assertTrue(response.isOk());

        List<String> orgList = response.getList("$.data.getDistOrgByEnvFromExemplaire", String.class);

        assertEquals(1, orgList.size());
        assertEquals("010", orgList.get(0));

        graphQLTestTemplate.clearHeaders();
    }

    @Test
    void get_distinct_app_by_env_org_from_exemplaire_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        ArrayNode codesEnv = new ObjectMapper().createArrayNode().add("I").add("P");
        ArrayNode codesOrg = new ObjectMapper().createArrayNode().add("010").add("973");
        variables.set("codenvs", codesEnv);
        variables.set("codorgs", codesOrg);

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/exemplaire/get-distinct-app-by-env-org-from-exemplaire.graphql",
                variables
        );

        assertNotNull(response);
        assertTrue(response.isOk());

        List<String> appList = response.getList("$.data.getDistAppByEnvOrgFromExemplaire", String.class);

        assertEquals(1, appList.size());
        assertEquals("SNV2", appList.get(0));
    }

    @Test
    void get_distinct_fic_by_env_org_app_com_from_exemplaire_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        List<String> codesEnv = new ArrayList<>();
        codesEnv.add("I");
        codesEnv.add("P");
        List<String> codesOrg = new ArrayList<>();
        codesOrg.add("010");
        codesOrg.add("973");
        List<String> codesApp = new ArrayList<>();
        codesApp.add("SNV2");
        List<String> codesCom = new ArrayList<>();
        codesCom.add("EI02");
        final var query = new ExemplaireByFilterQuery();
        query.setCodesEnv(codesEnv);
        query.setCodesOrg(codesOrg);
        query.setCodesApp(codesApp);
        query.setCodesCom(codesCom);
        variables.set("query", new ObjectMapper().valueToTree(query));

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/exemplaire/get-distinct-fic-by-env-org-app-com-from-exemplaire.graphql",
                variables
        );

        assertNotNull(response);
        assertTrue(response.isOk());

        List<ExemplaireFichierCodficRefimpCodprdDTO> appList = response.getList("$.data.getDistFicByEnvOrgAppComFromExemplaire", ExemplaireFichierCodficRefimpCodprdDTO.class);

        assertEquals(2, appList.size());
    }

    @Test
    void get_preselected_exemplaire_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        List<String> codesEnv = new ArrayList<>();
        codesEnv.add("T");
        List<String> codesOrg = new ArrayList<>();
        codesOrg.add("750");
        List<String> codesApp = new ArrayList<>();
        codesApp.add("SNV2");
        List<String> codesCom = new ArrayList<>();
        codesCom.add("RDEH");
        List<String> codesFic = new ArrayList<>();
        codesFic.add("L02");
        final var query = new ExemplaireByFilterQuery();
        query.setCodesEnv(codesEnv);
        query.setCodesOrg(codesOrg);
        query.setCodesApp(codesApp);
        query.setCodesCom(codesCom);
        query.setCodesFic(codesFic);
        variables.set("query", new ObjectMapper().valueToTree(query));

        final var response = graphQLTestTemplate.perform(
                "graphql-requests/exemplaire/get-preselected-exemplaire.graphql",
                variables
        );

        assertNotNull(response);
        assertTrue(response.isOk());

        List<ExemplaireFichier> comList = response.getList("$.data.getPreselectedExemplaire", ExemplaireFichier.class);

        assertEquals(2, comList.size());
        assertEquals("PC52C", comList.get(0).getCodeProd());
        assertEquals("LISTE SURVEILLANCE DES STRUCTU", comList.get(0).getLibFichier());
        assertEquals("V90R", comList.get(0).getRefImprime());
        assertEquals("RECTO-SIMPLE", comList.get(0).getFicatt());
    }

    @Test
    void create_an_existing_exemplaire_should_not_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var exemplaire = new ObjectMapper().createObjectNode();
        exemplaire.put("codenv", "T");
        exemplaire.put("codorg", "750");
        exemplaire.put("codapp", "SNV2");
        exemplaire.put("codcom", "RDEH");
        exemplaire.put("codfic", "L02");
        exemplaire.put("codgam", "ST");
        exemplaire.put("numexe", "02");
        exemplaire.put("codsit", "CIRTIL");
        exemplaire.put("codres", "MASSI");
        exemplaire.put("coddes", "");
        exemplaire.put("nbrexe", 2);
        exemplaire.put("exeact", 1);
        final var exemplaires = new ObjectMapper().createArrayNode().add(exemplaire);
        variables.set("exemplaires", exemplaires);
        variables.put("message", "message");
        final var response = graphQLTestTemplate.perform("graphql-requests/exemplaire/create-exemplaire.graphql",
                variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<CreateOrUpdateExemplaireInputDTO> exemplaireList = response.getList("$.data.createExemplaires", CreateOrUpdateExemplaireInputDTO.class);

        assertEquals(0, exemplaireList.size());

        FichierCompositeId id = new FichierCompositeId();
        id.setCodeEnv("T");
        id.setCodeApp("SNV2");
        id.setCodeCom("RDEH");
        id.setCodeOrg("750");
        id.setCodeFich("L02");
        final var fichier = fichierRepository.findById(id);
        // Le message du fichier n'est pas modifié si aucun exemplaire crée
        assertTrue(fichier.isPresent());
        assertEquals("RECTO-SIMPLE", fichier.get().getFicAtt());
    }

    @Test
    void create_exemplaire_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var exemplaire = new ObjectMapper().createObjectNode();
        exemplaire.put("codenv", "D");
        exemplaire.put("codorg", "904");
        exemplaire.put("codapp", "SNV2");
        exemplaire.put("codcom", "RDEH");
        exemplaire.put("codfic", "L04");
        exemplaire.put("codgam", "FT");
        exemplaire.put("codsit", "CIRTIL");
        exemplaire.put("codres", "COALA");
        exemplaire.put("coddes", "");
        exemplaire.put("nbrexe", 2);
        exemplaire.put("exeact", 1);
        final var exemplaires = new ObjectMapper().createArrayNode().add(exemplaire);
        variables.set("exemplaires", exemplaires);
        variables.put("message", "message");
        final var response = graphQLTestTemplate.perform("graphql-requests/exemplaire/create-exemplaire.graphql",
                variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<CreateOrUpdateExemplaireInputDTO> exemplaireList = response.getList("$.data.createExemplaires", CreateOrUpdateExemplaireInputDTO.class);

        assertEquals(1, exemplaireList.size());
        assertEquals("RDEH", exemplaireList.get(0).getCodcom());
        assertEquals(true, exemplaireList.get(0).getExeact());
        assertEquals(2, exemplaireList.get(0).getNbrexe());
        assertEquals("01", exemplaireList.get(0).getNumexe());

        FichierCompositeId id = new FichierCompositeId();
        id.setCodeEnv("D");
        id.setCodeApp("SNV2");
        id.setCodeCom("RDEH");
        id.setCodeOrg("904");
        id.setCodeFich("L04");
        final var fichier = fichierRepository.findById(id);
        // Le message du fichier est modifié
        assertTrue(fichier.isPresent());
        assertEquals("message", fichier.get().getFicAtt());
    }

    @Test
    void delete_exemplaire_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var id = new ObjectMapper().createObjectNode();
        id.put("codenv", "P");
        id.put("codorg", "010");
        id.put("codapp", "SNV2");
        id.put("codcom", "EI02");
        id.put("codfic", "L02");
        id.put("codgam", "ST");
        id.put("numexe", "01");
        final var ids = new ObjectMapper().createArrayNode().add(id);
        variables.set("ids", ids);

        final var response = graphQLTestTemplate.perform("graphql-requests/exemplaire/delete-exemplaire.graphql",
                variables);
        assertNotNull(response);
        assertTrue(response.isOk());
    }

    @Test
    void update_exemplaire_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var exemplaire = new ObjectMapper().createObjectNode();
        exemplaire.put("codenv", "T");
        exemplaire.put("codorg", "750");
        exemplaire.put("codapp", "SNV2");
        exemplaire.put("codcom", "RDEH");
        exemplaire.put("codfic", "L02");
        exemplaire.put("codgam", "MA");
        exemplaire.put("numexe", "1");
        exemplaire.put("codsit", "CIRTIL");
        exemplaire.put("codres", "MASSI");
        exemplaire.put("coddes", "");
        exemplaire.put("nbrexe", 1);
        exemplaire.put("exeact", 1);
        variables.set("updateExemplaire", exemplaire);

        final var response = graphQLTestTemplate.perform("graphql-requests/exemplaire/update-exemplaire.graphql",
                variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        CreateOrUpdateExemplaireInputDTO updatedExemplaire = response.get("$.data.updateExemplaire", CreateOrUpdateExemplaireInputDTO.class);

        assertEquals("CIRTIL", updatedExemplaire.getCodsit());
        assertEquals("MASSI", updatedExemplaire.getCodres());
    }

    @Test
    void get_parametre_edition_par_ressource_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var query = new ExemplaireByRessourceQuery();
        query.setCodenv("T");
        query.setCodorgs(List.of("010", "750"));
        query.setCodapp("SNV2");
        query.setCodcom("RDEH");
        query.setCodfics(List.of("L00", "L01", "L02"));
        query.setRessources(List.of("MA/CIRTIL/MASSI", "FT/CIRTIL/MASSI"));
        query.setIsRessourcesAbsentes(true);
        variables.set("query", new ObjectMapper().valueToTree(query));
        final var response = graphQLTestTemplate.perform("graphql-requests/exemplaire/get-exemplaire-par-ressource.graphql",
                variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<ExemplaireByResource> result = response.getList("$.data.getExemplairesByRessource", ExemplaireByResource.class);
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("RECTO-SIMPLE", result.get(0).getMessage());
        List<ExemplaireRessource> ressources = result.get(0).getRessources();
        assertEquals(1, ressources.size());
        assertEquals("MASSI", ressources.get(0).getCodres());
        assertEquals("CIRTIL", ressources.get(0).getCodsit());
        assertEquals(true, ressources.get(0).getEtat());
        assertEquals("DESTI", ressources.get(0).getCoddes());
    }

    @Test
    void get_organisme_0_to_complete_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var input = new FindOrganismesToCompleteInput();
        input.setCodenv("T");
        input.setCodapp("SNV2");
        input.setCodcom("RDEH");
        input.setCodfic("L02");
        input.setCodgam("MA");
        input.setCodsit("CIRTIL");
        input.setCodres("MASSI");
        input.setIsadmin(true);
        variables.set("input", new ObjectMapper().valueToTree(input));
        final var response = graphQLTestTemplate.perform("graphql-requests/exemplaire/get-organismes-to-complete.graphql",
                variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<String> result = response.getList("$.data.findExemplaireOrganismeToComplete", String.class);
        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    void get_organisme_1_to_complete_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var input = new FindOrganismesToCompleteInput();
        input.setCodenv("D");
        input.setCodapp("SNV2");
        input.setCodcom("RDEH");
        input.setCodfic("L04");
        input.setCodgam("FT");
        input.setCodsit("CIRTIL");
        input.setCodres("COALA");
        input.setIsadmin(true);
        variables.set("input", new ObjectMapper().valueToTree(input));
        final var response = graphQLTestTemplate.perform("graphql-requests/exemplaire/get-organismes-to-complete.graphql",
                variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<String> result = response.getList("$.data.findExemplaireOrganismeToComplete", String.class);
        assertNotNull(result);
        assertEquals(1, result.size());
    }
}
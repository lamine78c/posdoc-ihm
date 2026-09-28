package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.graphql.spring.boot.test.GraphQLResponse;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.fichier.model.query.SearchByEnvsOrgsAppProfilsQuery;
import fr.acoss.posdoc.domain.ressource.model.RessourceGamSitRes;
import fr.acoss.posdoc.domain.ressource.model.SearchRessourceByEnvOrgAppProfilQuery;
import fr.acoss.posdoc.ws.resolvers.payloads.CreateOrUpdateRessourcePayloadDTO;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/ressource/insert-ressource.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/ressource/clean-ressource.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)

class RessourceResolverTest extends AbstractGraphqlTest {

    @Test
    void get_ressources_by_envs_orgs_app_noadmin_single_site() throws IOException {
        SearchByEnvsOrgsAppProfilsQuery query = new SearchByEnvsOrgsAppProfilsQuery();
        List<String> envs = new ArrayList<>();
        envs.add("P");
        List<String> orgs = new ArrayList<>();
        orgs.add("117");
        orgs.add("770");
        query.setCodesEnv(envs);
        query.setCodesOrg(orgs);
        query.setCodeApp("SNV2");
        query.setIsProfilAdmin(false);
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("query", new ObjectMapper().valueToTree(query));
        final var response = graphQLTestTemplate
                .perform("graphql-requests/ressource/get-ressources-by-envs-orgs-app-noadmin.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<CreateOrUpdateRessourcePayloadDTO> responseList = response.getList("$.data.getRessourcesGam", CreateOrUpdateRessourcePayloadDTO.class);
        assertEquals(3, responseList.size());
    }

    @Test
    void get_ressources_by_envs_orgs_app_noadmin_multi_site() throws IOException {
        SearchByEnvsOrgsAppProfilsQuery query = new SearchByEnvsOrgsAppProfilsQuery();
        List<String> envs = new ArrayList<>();
        envs.add("P");
        List<String> orgs = new ArrayList<>();
        orgs.add("117");
        orgs.add("750");
        query.setCodesEnv(envs);
        query.setCodesOrg(orgs);
        query.setCodeApp("SNV2");
        query.setIsProfilAdmin(false);
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("query", new ObjectMapper().valueToTree(query));
        final var response = graphQLTestTemplate
                .perform("graphql-requests/ressource/get-ressources-by-envs-orgs-app-noadmin.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        List<CreateOrUpdateRessourcePayloadDTO> responseList = response.getList("$.data.getRessourcesGam", CreateOrUpdateRessourcePayloadDTO.class);
        assertEquals(6, responseList.size());
    }

    @Test
    void get_ressources_gam_sit_res_should_return_distinct_triplets_of_the_org_and_the_generic_one() throws IOException {
        // Toutes les ressources de 117, plus celles de l'organisme générique (999) du site de 117 (CIRSO),
        // les doublons étant fusionnés
        final var response = performGetRessourcesGamSitRes("117", false);

        List<RessourceGamSitRes> responseList = response.getList("$.data.getRessourcesGamSitRes", RessourceGamSitRes.class);
        assertEquals(3, responseList.size());
        assertGamSitRes(responseList.get(0), "FC", "CIRSO", "COALA");
        assertGamSitRes(responseList.get(1), "FT", "CIRSO", "COALA");
        assertGamSitRes(responseList.get(2), "FT", "CIRTIL", "COALA");
    }

    @Test
    void get_ressources_gam_sit_res_should_return_ressources_with_profil_for_an_admin() throws IOException {
        final var response = performGetRessourcesGamSitRes("117", true);

        List<RessourceGamSitRes> responseList = response.getList("$.data.getRessourcesGamSitRes", RessourceGamSitRes.class);
        assertEquals(4, responseList.size());
        assertGamSitRes(responseList.get(0), "FC", "CIRSO", "COALA");
        assertGamSitRes(responseList.get(1), "FT", "CIRSO", "COALA");
        assertGamSitRes(responseList.get(2), "FT", "CIRSO", "RESADM");
        assertGamSitRes(responseList.get(3), "FT", "CIRTIL", "COALA");
    }

    @Test
    void get_ressources_gam_sit_res_should_only_return_generic_ressources_of_the_site_of_the_org() throws IOException {
        // 750 est sur le site CIRTIL : la ressource générique du site CIRSO est écartée,
        // contrairement aux ressources propres à 750 qui ne sont pas filtrées sur le site
        final var response = performGetRessourcesGamSitRes("750", false);

        List<RessourceGamSitRes> responseList = response.getList("$.data.getRessourcesGamSitRes", RessourceGamSitRes.class);
        assertEquals(3, responseList.size());
        assertGamSitRes(responseList.get(0), "FC", "CIRTIL", "COALA");
        assertGamSitRes(responseList.get(1), "FT", "CIRSO", "MASSI");
        assertGamSitRes(responseList.get(2), "FT", "CIRTIL", "MASSI");
    }

    private GraphQLResponse performGetRessourcesGamSitRes(String codorg, boolean isProfilAdmin) throws IOException {
        SearchRessourceByEnvOrgAppProfilQuery query =
                new SearchRessourceByEnvOrgAppProfilQuery("P", codorg, "SNV2", isProfilAdmin);
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("query", new ObjectMapper().valueToTree(query));
        final var response = graphQLTestTemplate
                .perform("graphql-requests/ressource/get-ressources-gam-sit-res.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        return response;
    }

    private void assertGamSitRes(RessourceGamSitRes actual, String codgam, String codsit, String codres) {
        assertEquals(codgam, actual.getCodgam());
        assertEquals(codsit, actual.getCodsit());
        assertEquals(codres, actual.getCodres());
    }
}

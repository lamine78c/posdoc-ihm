package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractAdelaideTest;
import fr.acoss.posdoc.domain.message.model.ExpMassification;
import fr.acoss.posdoc.service.adelaide.impl.AdelaideUtil;
import fr.acoss.posdoc.ws.resolvers.payloads.MassificationResultPayloadDTO;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/params/insert-params.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/params/clean-params.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class MassificationActionTest extends AbstractAdelaideTest {

    public static final String COD_APP = "codApp";
    public static final String COD_ENV = "codEnv";
    public static final String PRE_COD = "preCod";
    public static final String COD_ORG = "codOrg";
    public static final String FILE = "mas0_m0001_00_p_117_snv2_250103-05_00_eds2_l04";
    public static final String FILE1 = "mas0_m0001_00_p_117_snv2_250103-05_00_pc01_l00";
    public static final String FILE3 = "mas3_m3808_00_p_200_scrb_251211-00_00_scrb_urs";

    public static final String TYPE = "type";
    public static final String ID = "id";
    public static final String USER = "user";

    private static @NotNull ExpMassification createExpMassification(final Boolean isSimule, final String file) {
        ExpMassification massification = new ExpMassification();
        massification.setCodApp(COD_APP);
        massification.setCodEnv(COD_ENV);
        massification.setPerCod(PRE_COD);
        massification.setCodOrg(COD_ORG);
        massification.setListeFic(file);
        massification.setTypar(TYPE);
        massification.setFormId(ID);
        massification.setUser(USER);
        massification.setIsSimu(isSimule);
        return massification;
    }

    @Test
    void test_action_batch_massifications_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        List<ExpMassification> massifications = new LinkedList<>();
        massifications.add(createExpMassification(Boolean.FALSE, FILE));
        massifications.add(createExpMassification(Boolean.FALSE, FILE1));
        variables.set("data", new ObjectMapper().valueToTree(massifications));
        final var response = graphQLTestTemplate.perform("graphql-requests/massification-action/massification-action-batch-message.graphql", variables);
        assertNotNull(response);
        MassificationResultPayloadDTO result = response.get("$.data.massifierFiles", MassificationResultPayloadDTO.class);
        assertNotNull(result);
        assertNotNull(result.getUtiLog());
        assertEquals(AdelaideUtil.FONC_MASSIFIER + COD_ENV + AdelaideUtil.CAR_CHAMP + COD_ORG + AdelaideUtil.CAR_CHAMP + PRE_COD + AdelaideUtil.CAR_CHAMP + TYPE + AdelaideUtil.CAR_CHAMP + "0" + AdelaideUtil.CAR_CHAMP + FILE + AdelaideUtil.CAR_CHAMP + FILE1 + AdelaideUtil.CAR_FIN, result.getUtiLog().getErreur(), "Validation du message");
        assertTrue(response.isOk());
    }

    @Test
    void test_action_batch_simulation_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        List<ExpMassification> massifications = new LinkedList<>();
        massifications.add(createExpMassification(Boolean.TRUE, FILE));
        variables.set("data", new ObjectMapper().valueToTree(massifications));
        final var response = graphQLTestTemplate.perform("graphql-requests/massification-action/simulation-action-batch-message.graphql", variables);
        assertNotNull(response);
        MassificationResultPayloadDTO result = response.get("$.data.simulerFiles", MassificationResultPayloadDTO.class);
        assertNotNull(result);
        assertNotNull(result.getUtiLog());
        assertEquals(AdelaideUtil.FONC_MASSIFIER + COD_ENV + AdelaideUtil.CAR_CHAMP + COD_ORG + AdelaideUtil.CAR_CHAMP + PRE_COD + AdelaideUtil.CAR_CHAMP + TYPE + AdelaideUtil.CAR_CHAMP + "1" + AdelaideUtil.CAR_CHAMP + FILE + AdelaideUtil.CAR_FIN, result.getUtiLog().getErreur(), "Validation du message");
        assertTrue(response.isOk());

        massifications.add(createExpMassification(Boolean.TRUE, FILE1));
        variables.set("data", new ObjectMapper().valueToTree(massifications));
        final var response2 = graphQLTestTemplate.perform("graphql-requests/massification-action/simulation-action-batch-message.graphql", variables);
        MassificationResultPayloadDTO result2 = response2.get("$.data.simulerFiles", MassificationResultPayloadDTO.class);
        assertNotNull(result2);
        assertNotNull(result2.getUtiLog());
        assertEquals(AdelaideUtil.FONC_MASSIFIER + COD_ENV + AdelaideUtil.CAR_CHAMP + COD_ORG + AdelaideUtil.CAR_CHAMP + PRE_COD + AdelaideUtil.CAR_CHAMP + TYPE + AdelaideUtil.CAR_CHAMP + "1" + AdelaideUtil.CAR_CHAMP + FILE + AdelaideUtil.CAR_CHAMP + FILE1 + AdelaideUtil.CAR_FIN, result2.getUtiLog().getErreur(), "Validation du message");
        assertTrue(response2.isOk());
    }

    @Test
    void test_action_massification_empty_typtar_should_not_send_space() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        ExpMassification massification = createExpMassification(Boolean.FALSE, FILE);
        massification.setTypar("");
        List<ExpMassification> massifications = new LinkedList<>();
        massifications.add(massification);
        variables.set("data", new ObjectMapper().valueToTree(massifications));

        final var response = graphQLTestTemplate.perform("graphql-requests/massification-action/massification-action-batch-message.graphql", variables);
        assertNotNull(response);
        MassificationResultPayloadDTO result = response.get("$.data.massifierFiles", MassificationResultPayloadDTO.class);
        assertNotNull(result);
        assertNotNull(result.getUtiLog());

        // Typtar vide entre PRE_COD et "0" : deux CAR_CHAMP consécutifs (PAS d'espace inséré)
        String expectedMessage = AdelaideUtil.FONC_MASSIFIER + COD_ENV + AdelaideUtil.CAR_CHAMP
                + COD_ORG + AdelaideUtil.CAR_CHAMP
                + PRE_COD + AdelaideUtil.CAR_CHAMP
                + "" + AdelaideUtil.CAR_CHAMP
                + "0" + AdelaideUtil.CAR_CHAMP
                + FILE + AdelaideUtil.CAR_FIN;
        assertEquals(expectedMessage, result.getUtiLog().getErreur(), "Le typtar vide doit produire deux CAR_CHAMP consécutifs, pas un espace");
        assertTrue(response.isOk());
    }

    @Test
    void test_action_batch_simulation_ko() throws IOException {
        List<ExpMassification> massifications = new LinkedList<>();
        massifications.add(createExpMassification(Boolean.TRUE, FILE));
        massifications.add(createExpMassification(Boolean.TRUE, FILE1));
        massifications.add(createExpMassification(Boolean.TRUE, FILE3));
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("data", new ObjectMapper().valueToTree(massifications));
        final var response = graphQLTestTemplate.perform("graphql-requests/massification-action/simulation-action-batch-message.graphql", variables);
        assertNotNull(response);
        MassificationResultPayloadDTO result = response.get("$.data.simulerFiles", MassificationResultPayloadDTO.class);
        assertNotNull(result);
        assertNotNull(result.getUtiLog());
        assertNotNull(result.getUtiLog().getErreur());
        assertTrue(result.getUtiLog().getErreur().contains("Erreur, il ne devrait pas y avoir plusieurs pools de massification dans une demande."), "Vérifie le message d'erreur");
    }
}

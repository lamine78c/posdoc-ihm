package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.bontravail.model.BonTravailUpdateDTO;
import fr.acoss.posdoc.domain.bontravail.model.BonTravailUpdatePayload;
import fr.acoss.posdoc.domain.bontravail.model.UserInfoPayload;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/bon-travail-update/insert-bon-travail-update.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/bon-travail-update/clean-bon-travail-update.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class BonTravailUpdateTest extends AbstractGraphqlTest {

    @Test
    void updateBonTravail_withInput_returnData() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        final var bonTravailList = new ArrayList<BonTravailUpdatePayload>();
        final var userInfo = new UserInfoPayload("AC75098133", "Bon de travail");
        bonTravailList.add(BonTravailUpdatePayload.builder()
                .id("testid").codapp("SNV2").codfic("L02").numcom("00").codcom("RDEH").codenv("T").percod("240523-00").codorg("750")
                .datexp("2025-01-05 18:00:00").inform("info test")
                .build());
        variables.set("updateBonTravail", new ObjectMapper().valueToTree(bonTravailList));
        variables.set("userInfo", new ObjectMapper().valueToTree(userInfo));
        final var response = graphQLTestTemplate.perform("graphql-requests/bon-travail/update-bon-travail.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<BonTravailUpdateDTO> responseList = response.getList("$.data.updateBonTravail", BonTravailUpdateDTO.class);

        assertEquals(7, responseList.get(0).getDelmsp());
    }
}
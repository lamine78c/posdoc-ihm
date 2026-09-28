package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.bontravail.model.IsBonTravailManuelInput;
import fr.acoss.posdoc.domain.genfic.model.BonTravailGroupByPeriodeDTO;
import fr.acoss.posdoc.domain.genfic.model.BonTravailGroupByPeriodeResultDTO;
import fr.acoss.posdoc.domain.genfic.model.BonTravailPayload;
import fr.acoss.posdoc.domain.genfic.model.BonTravailPeriodeFilterPayload;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Sql(scripts = {"classpath:sql/bon-travail/insert-bon-travail.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/bon-travail/clean-bon-travail.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class BonTravailTest extends AbstractGraphqlTest {

    @Test
    void getBonTravail_withInput_returnData() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("bonTravailPayload", new ObjectMapper().valueToTree(
                this.getParamData(List.of("750"))));

        final var response = graphQLTestTemplate.perform("graphql-requests/bon-travail/bon-travail.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());
        BonTravailGroupByPeriodeResultDTO result = response.get("$.data.searchBonTravail", BonTravailGroupByPeriodeResultDTO.class);

        assertNotNull(result);

        List<BonTravailGroupByPeriodeDTO> groupedBonTravail = result.getGroupedBonTravail();

        assertEquals(1, groupedBonTravail.size());
        assertEquals("RDEH", groupedBonTravail.get(0).getCodcom());
        assertEquals("SNV2", groupedBonTravail.get(0).getCodapp());
    }

    @Test
    void getPeriodeFilter_withInput_returnData() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("bonTravailPeriodeFilterPayload", new ObjectMapper().valueToTree(
                this.getPeriodeParamData()));

        final var response = graphQLTestTemplate.perform("graphql-requests/bon-travail/bon-travail-periode-filter.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        List<String> responseList = response.getList("$.data.getDistinctEnvOrgAppPerFromGenApp", String.class);

        assertEquals(1, responseList.size());
        assertEquals("240523-00", responseList.get(0));
    }

    private BonTravailPeriodeFilterPayload getPeriodeParamData() {
        BonTravailPeriodeFilterPayload paramData = new BonTravailPeriodeFilterPayload();
        paramData.setCodenv("T");
        paramData.setCodorg(List.of("750"));
        paramData.setCodapp("SNV2");

        return paramData;
    }

    private BonTravailPayload getParamData(List <String> codorgs) {
        BonTravailPayload paramData = new BonTravailPayload();
        paramData.setCodenv("T");
        paramData.setCodorg(codorgs);
        paramData.setCodapp("SNV2");
        paramData.setPercod(null);
        paramData.setCodcom(null);
        paramData.setCodfic(null);
        paramData.setCodcli(null);
        paramData.setCodbon(null);
        paramData.setDappcrDeb(null);
        paramData.setDappcrFin(null);
        paramData.setDfiexpDeb(null);
        paramData.setDfiexpFin(null);
        paramData.setIsDateEmpty(false);
        paramData.setDelmsp(null);
        paramData.setCodsit(null);

        return paramData;
    }

    @Test
    void is_bon_travail_manuel_should_be_ok() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("isBonTravailManuelInput", new ObjectMapper().valueToTree(
                IsBonTravailManuelInput.builder()
                        .codenv("T")
                        .codorg("750")
                        .codapp("SNV2")
                        .percod("240523-00")
                        .build()
        ));

        final var response = graphQLTestTemplate.perform("graphql-requests/bon-travail/is-bon-travail-manuel.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        Boolean isBonTravailManuel = response.get("$.data.isBonTravailManuel", Boolean.class);

        assertFalse(isBonTravailManuel);
    }

}
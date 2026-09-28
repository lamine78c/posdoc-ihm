package fr.acoss.posdoc.ws.resolvers;

import com.fasterxml.jackson.databind.ObjectMapper;
import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.domain.genetp.model.VideoStepDetailsFichierDTO;
import fr.acoss.posdoc.domain.genetp.model.VideoStepDetailsFichierPayload;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

@Sql(scripts = {"classpath:sql/occurrence-etape/insert-occurrence-etape.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/occurrence-etape/clean-occurrence-etape.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
class VideoStepDetailsFichierTest extends AbstractGraphqlTest {

    @Test
    void getVideoStepDetailsFichier_withValidInput_returnsDetails() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("videoStepDetailsFichierPayload", new ObjectMapper().valueToTree(this.getParamData("T", "750", "SNV2", "240523-00", "RDEH", "L02", "00")));

        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-application/video-step-details-fichier.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        VideoStepDetailsFichierDTO responseItem = response.get("$.data.getVideoStepDetailsFichier", VideoStepDetailsFichierDTO.class);

        assertNotNull(responseItem);
        assertEquals("RDEH", responseItem.getCodcom());
        assertEquals("L02", responseItem.getCodfic());
    }

    @Test
    void getVideoStepDetailsFichier_withInvalidInput_returnsNull() throws IOException {
        final var variables = new ObjectMapper().createObjectNode();
        variables.set("videoStepDetailsFichierPayload", new ObjectMapper().valueToTree(this.getParamData("invalidCodEnv", "invalidCodOrg", "invalidCodApp", "invalidPerCod", "invalidCodCom", "invalidCodFic", "invalidNumCom")));

        final var response = graphQLTestTemplate.perform("graphql-requests/occurrence-application/video-step-details-fichier.graphql", variables);
        assertNotNull(response);
        assertTrue(response.isOk());

        VideoStepDetailsFichierDTO responseItem = response.get("$.data.getVideoStepDetailsFichier", VideoStepDetailsFichierDTO.class);

        assertNull(responseItem);
    }

    private VideoStepDetailsFichierPayload getParamData(String codenv, String codorg, String codapp, String percod, String codcom, String codfic, String numcom) {
        VideoStepDetailsFichierPayload paramData = new VideoStepDetailsFichierPayload();
        paramData.setCodenv(codenv);
        paramData.setCodorg(codorg);
        paramData.setCodapp(codapp);
        paramData.setPercod(percod);
        paramData.setCodcom(codcom);
        paramData.setCodfic(codfic);
        paramData.setNumcom(numcom);

        return paramData;
    }
}
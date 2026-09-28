package fr.acoss.posdoc.database;

import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.database.dao.GenDocRepository;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocDemQuery;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocVideoInfoDetailQuery;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocVideoQuery;
import fr.acoss.posdoc.types.Constantes;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/generation-document/insert-generation-documents.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/generation-document/clean-generation-documents.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class TestGenDocRepository {
    public static final String DATDEM_EXIST = "20240315";
    public static final Integer NUMDEM_EXIST = 1002;
    public static final String CODDOC = "RSCAE";
    public static final String REFDEM = "REST_F20190830_31128";
    public static final String TYPACt = "1";
    public static final String CODENV = "V";
    public static final String CODORG = "OR2";
    public static final String DOCSTA = "S";
    public static final String DOCINF = "F2";
    public static final String IMPRIM = "1";
    public static final String CODE_SITE_DEMATERIALISATION = "SITE_B";
    public static final String LIBINF = "Document Info 2";

    @Autowired
    private GenDocRepository genDocRepository;

    @Test
    void test_findByCriteres() {
        SearchDocDemQuery query = new SearchDocDemQuery();
        query.setDate("20240523");
        List<Map<String, String>> result = genDocRepository.findByCriteres(query);
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void test_findBySpecificCriteres() {
        SearchDocVideoQuery query = new SearchDocVideoQuery();
        query.setCoddoc(CODDOC);
        query.setTypact(TYPACt);
        query.setCodenv(CODENV);
        PageRequest limitSize = PageRequest.of(Constantes.LIMIT_MIN, Constantes.LIMIT_MAX); // 0 est la page, limitSize est le nombre d'éléments min et max retourner par l'appel
        List<Map<String, String>> result = genDocRepository.findBySpecificCriteres(query,limitSize);

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void findBySpecificVideoInfoDetailCriteres_FoundCompletRecord() {
        // Cas nominal - test avec des données qui existent
        SearchDocVideoInfoDetailQuery query = new SearchDocVideoInfoDetailQuery();
        query.setDatdem(DATDEM_EXIST);
        query.setNumdem(NUMDEM_EXIST);

        Map<String, Object> result = genDocRepository.findBySpecificVideoInfoDetailCriteres(query);

        assertNotNull(result);
        assertEquals(CODENV, result.get(ParamsUtils.CODENV));
        assertEquals(CODORG, result.get(ParamsUtils.CODORG));
        assertEquals(CODDOC, result.get(ParamsUtils.CODDOC));
        assertEquals(REFDEM, result.get(ParamsUtils.REFDEM));
        assertEquals(TYPACt, result.get(ParamsUtils.TYPACT));
        assertEquals(IMPRIM, result.get(ParamsUtils.IMPRIM));
        assertEquals(DOCSTA, result.get(ParamsUtils.DOCSTA));
        assertEquals(DOCINF, result.get(ParamsUtils.DOCINF));
        assertEquals(CODE_SITE_DEMATERIALISATION, result.get(ParamsUtils.CODE_SITE_DEMATERIALISATION));
        assertEquals(LIBINF, result.get(ParamsUtils.LIBINF));
    }
}

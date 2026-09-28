package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.genpro.model.SearchProduitsByFichierInput;
import fr.acoss.posdoc.domain.genpro.model.SearchProduitsByFichierPayloadDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/genpro/insert-genpro.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/genpro/clean-genpro.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class GenProPersistenceImplTest {

    @Autowired
    private GenProPersistenceImpl genProPersistenceImpl;

    @Test
    void search_occ_pro_by_fic_should_be_ok() {
        SearchProduitsByFichierInput query = new SearchProduitsByFichierInput();
        query.setCodenv("T");
        query.setCodapp("MAS");
        query.setCodorg("00L");
        query.setPercod("230331-00");
        query.setCodfic("CV02A");
        query.setCodcom("IPVT");
        query.setNumcom("00");
        List<SearchProduitsByFichierPayloadDTO> result = genProPersistenceImpl.searchProduitsByFichier(query);
        assertNotNull(result);
        assertEquals(2, result.size());
    }
}

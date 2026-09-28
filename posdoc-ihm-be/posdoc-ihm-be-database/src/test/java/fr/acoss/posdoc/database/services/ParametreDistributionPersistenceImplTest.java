package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.domain.parametre.distribution.model.ParametreDistribution;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import javax.transaction.Transactional;
import java.util.List;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/parametre-distribution/insert-parametre-distribution.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/parametre-distribution/clean-parametre-distribution.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class ParametreDistributionPersistenceImplTest {

    @Autowired
    private ParametreDistributionPersistenceImpl parametreDistributionPersistence;

    @Test
    @Transactional
    void selectAll_should_return_all_parametre_editions_ordered_by_reference() {
        List<ParametreDistribution> parametres = this.parametreDistributionPersistence.selectAll();

        Assertions.assertNotNull(parametres);
        Assertions.assertEquals(3, parametres.size());

        Assertions.assertEquals("ABORT", parametres.get(0).getReference());
        Assertions.assertEquals(true, parametres.get(0).getIsNotAuthorisedToBeDeleted());
        Assertions.assertEquals("ADL_PLATYPUS", parametres.get(1).getReference());
        Assertions.assertEquals(true, parametres.get(1).getIsNotAuthorisedToBeDeleted());
        Assertions.assertEquals("BUROTIK_10", parametres.get(2).getReference());
        Assertions.assertEquals(false, parametres.get(2).getIsNotAuthorisedToBeDeleted());
    }
}

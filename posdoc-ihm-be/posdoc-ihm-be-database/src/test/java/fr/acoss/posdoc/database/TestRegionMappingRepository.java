package fr.acoss.posdoc.database;

import fr.acoss.posdoc.database.dao.RegionMappingRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;
import static org.junit.jupiter.api.Assertions.assertEquals;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/default/schema-insert-data.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/default/schema-clean-data.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class TestRegionMappingRepository {

    @Autowired
    private RegionMappingRepository regionMappingRepository;

    @Test
    @Transactional
    void test_findRegion(){
        List<String> codeAnais = new ArrayList<>();
        codeAnais.add("UR117");
        codeAnais.add("UR154");
        assertEquals(1,regionMappingRepository.findByCodeAnaisIn(codeAnais).size());
        codeAnais = new ArrayList<>();
        codeAnais.add("UR117");
        codeAnais.add("UR114");
        assertEquals(2,regionMappingRepository.findByCodeAnaisIn(codeAnais).size());
    }
}

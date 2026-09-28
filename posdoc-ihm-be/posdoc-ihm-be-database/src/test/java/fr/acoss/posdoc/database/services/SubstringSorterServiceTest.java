package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.TestApplication;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(classes = TestApplication.class)
@ActiveProfiles("test")
class SubstringSorterServiceTest {
    @Test
    void test_substring_sorter_condition_case_insensitive() {
        String input = "c45_codorg=967 and c45_codenv=P and c45_percod=250728-80 and c45_codapp=SNV2 and c45_codcom=PCA1 and c45_numcom=00 and c45_codfic=L09 and c45_typtar=RG";
        String result = SubstringSorterService.substringSorterHistoryCondition(input);
        String resultToCompare = "c45_codenv=P and c45_codorg=967 and c45_codapp=SNV2 and c45_percod=250728-80 and c45_codcom=PCA1 and c45_codfic=L09 and c45_numcom=00 and c45_typtar=RG";
        assertEquals(result, resultToCompare);

        input = "c45_codorg=967 AND c45_codenv=P AND c45_percod=250728-80 AND c45_codapp=SNV2 AND c45_codcom=PCA1 AND c45_numcom=00 AND c45_codfic=L09 AND c45_typtar=RG";
        result = SubstringSorterService.substringSorterHistoryCondition(input);
        resultToCompare = "c45_codenv=P and c45_codorg=967 and c45_codapp=SNV2 and c45_percod=250728-80 and c45_codcom=PCA1 and c45_codfic=L09 and c45_numcom=00 and c45_typtar=RG";
        assertEquals(result, resultToCompare);
    }
    @Test
    void test_substring_sorter_condition_with_or() {
        String input = "c45_codorg=967 and c45_codenv=P and c45_percod=250728-80 and (c45_codapp=SNV2 or c45_codapp=MAS) and c45_codcom=PCA1 and c45_numcom=00 and c45_codfic=L09 and c45_typtar=RG";
        String result = SubstringSorterService.substringSorterHistoryCondition(input);
        String resultToCompare = "c45_codenv=P and c45_codorg=967 and (c45_codapp=SNV2 or c45_codapp=MAS) and c45_percod=250728-80 and c45_codcom=PCA1 and c45_codfic=L09 and c45_numcom=00 and c45_typtar=RG";
        assertEquals(result, resultToCompare);
    }
    @Test
    void test_substring_sorter_condition_with_subquery_no_change() {
        String input = "c60_idpere in (select c59_idetap from genetp  where s59_codenv=P and s59_codorg=117 and s59_codapp=SNV2 and s59_percod=250818-M0)";
        String result = SubstringSorterService.substringSorterHistoryCondition(input);
        assertEquals(result, input);

        input = "s59_codenv=P and cond=(SELECT CASE WHEN (s37_mywher like %(select % and s37_action=DELETE) THEN true ELSE false END from myslog) and s59_percod=250818-M0";
        result = SubstringSorterService.substringSorterHistoryCondition(input);
        assertEquals(result, input);

        input = "c45_codcom=PCA1 and (c45_typtar=RG or c60_idpere in (select c59_idetap from genetp)) and (c45_codnot=ABC or c45_codapp=MAS) and c45_numcom=00 ";
        result = SubstringSorterService.substringSorterHistoryCondition(input);
        assertEquals(result, input);
    }
    @Test
    void test_substring_sorter_condition_with_between() {
        String input = "c45_codorg=967 and date BETWEEN 2025-01-01 and 2025-12-31 and c28_codnot=NOT and c45_codenv=P";
        String result = SubstringSorterService.substringSorterHistoryCondition(input);
        String resultToCompare = "c45_codenv=P and c45_codorg=967 and date BETWEEN 2025-01-01 and 2025-12-31 and c28_codnot=NOT";
        assertEquals(result, resultToCompare);
    }
    @Test
    void test_substring_sorter_values() {
        String input = "c28_codorg=117, c28_codenv=P, c28_codapp=SNV2, c28_codfic=L22, c28_codnot=#APRIA, c28_percod=250813-M1, c28_numcom=00, c28_codcom=AD04, n28_poinot=0";
        String result = SubstringSorterService.substringSorterHistoryValues(input);
        String resultToCompare = "c28_codenv=P,c28_codorg=117, c28_codapp=SNV2, c28_percod=250813-M1, c28_codcom=AD04, c28_codfic=L22, c28_codnot=#APRIA, c28_numcom=00, n28_poinot=0";
        assertEquals(result, resultToCompare);
    }
}

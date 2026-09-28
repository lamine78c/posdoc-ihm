package fr.acoss.posdoc.database.aspects;

import fr.acoss.posdoc.database.aspect.QueryAspect;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class QueryAspectTest {

    @Test
    void test_removeAliases() {
        String sql = "notficenti0_.c27_codenv='P' and notficenti0_.c27_codorg='117' and notficenti0_.c27_codapp='SNV2' and notficenti0_.c27_codcom='AD04' and notficenti0_.c27_codfic='L00' and notficenti0_.c27_codnot='#AZ'";
        String aliasesRemoved = QueryAspect.removeAliases(sql);
        assertEquals("c27_codenv=P and c27_codorg=117 and c27_codapp=SNV2 and c27_codcom=AD04 and c27_codfic=L00 and c27_codnot=#AZ", aliasesRemoved);

        sql = "gentarenti1_.d27_dnotid='28/08/2025' and gentarenti1_.d27_dnotit='NULL'";
        aliasesRemoved = QueryAspect.removeAliases(sql);
        assertEquals("d27_dnotid=28/08/2025 and d27_dnotit=NULL", aliasesRemoved);
    }
}

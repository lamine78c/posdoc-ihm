package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.GenDocCompositeId;
import fr.acoss.posdoc.database.entities.GenDocEntity;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocDemOccurrenceApplicationQuery;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocDemQuery;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocVideoInfoDetailQuery;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocVideoQuery;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;


@Repository
public interface GenDocRepository extends GenericRepository<GenDocEntity, GenDocCompositeId> {

    @Query("SELECT " +
            " ge.id.datdem as datdem,cast(ge.id.numdem as string) as numdem,ge.codenv as codenv,ge.codorg as codorg,ge.percod as percod,ge.codcom as codcom,ge.codfic as codfic," +
            " ge.codapp as codapp,ge.coddoc as coddoc,ge.refdem as refdem,ge.typact as typact,cast(ge.imprim as string) as imprim,ge.docsta as docsta, ge.docinf as docinf, " +
            " cast(ge.ddodeb as string) as ddodeb,cast(ge.ddofin as string) as ddofin,cast(ge.ddosus as string) as ddosus,cast(ge.tpscom as string) as tpscom, " +
            " so.codeSiteDematerialisation as codeSiteDematerialisation, " +
            " sd.libinf as libinf " +
            " FROM GenDocEntity ge " +
            " LEFT JOIN SiteOrganismeEntity so ON so.codeOrganisme = ge.codorg " +
            " LEFT JOIN StaDocEntity sd ON ge.docinf = sd.docinf " +
            " WHERE ge.id.datdem = (:#{#query.date}) " +
            " AND ( (:#{#query.docsta}) IS NULL OR ge.docsta = (:#{#query.docsta}) ) " +
            " and ( (:#{#query.codorgs}) IS NULL OR ge.codorg IN (:#{#query.codorgs}) ) " +
            " AND ( (:#{#query.coddoc}) IS NULL OR ge.coddoc = (:#{#query.coddoc}) ) " +
            " AND ( (:#{#query.typact}) IS NULL OR ge.typact = (:#{#query.typact}) ) " +
            " AND ( (:#{#query.codapp}) IS NULL OR ge.codapp = (:#{#query.codapp}) ) " +
            " AND ( (:#{#query.codcom}) IS NULL OR ge.codcom = (:#{#query.codcom}) ) " +
             " ORDER BY ge.id.datdem DESC, ge.id.numdem DESC "
     )
     List<Map<String, String>> findByCriteres(@Param("query") SearchDocDemQuery query);

    @Query("SELECT " +
            " ge.id.datdem as datdem, cast(ge.id.numdem as string) as numdem, ge.coddoc as coddoc, ge.refdem as refdem, ge.typact as typact, cast(ge.imprim as string) as imprim, ge.docsta as docsta " +
            " FROM GenDocEntity ge " +
            " WHERE ( (:#{#query.datdem}) IS NULL OR ge.id.datdem IN (:#{#query.datdem}) ) " +
            " AND ( (:#{#query.docsta}) IS NULL OR ge.docsta IN (:#{#query.docsta}) ) " +
            " and ( (:#{#query.codenv}) IS NULL OR ge.codenv IN (:#{#query.codenv}) ) " +
            " AND ( (:#{#query.coddoc}) IS NULL OR ge.coddoc IN (:#{#query.coddoc}) ) " +
            " AND ( (:#{#query.typact}) IS NULL OR ge.typact IN (:#{#query.typact}) ) " +
             " ORDER BY ge.id.datdem DESC, ge.id.numdem DESC "
     )
     List<Map<String, String>> findBySpecificCriteres(@Param("query") SearchDocVideoQuery query, Pageable pageable);


    @Query("SELECT " +
            "ge.codenv as codenv,ge.codorg as codorg,ge.percod as percod,ge.codcom as codcom,ge.codfic as codfic," +
            " ge.codapp as codapp,ge.coddoc as coddoc,ge.refdem as refdem,ge.typact as typact,cast(ge.imprim as string) as imprim,ge.docsta as docsta, ge.docinf as docinf, " +
            " cast(ge.ddodeb as string) as ddodeb,cast(ge.ddofin as string) as ddofin,cast(ge.ddosus as string) as ddosus,cast(ge.tpscom as string) as tpscom, " +
            " so.codeSiteDematerialisation as codeSiteDematerialisation, " +
            " sd.libinf as libinf " +
            " FROM GenDocEntity ge " +
            " LEFT JOIN SiteOrganismeEntity so ON so.codeOrganisme = ge.codorg " +
            " LEFT JOIN StaDocEntity sd ON ge.docinf = sd.docinf " +
            " WHERE ( ge.id.datdem = (:#{#query.datdem}) ) " +
            " AND ( ge.id.numdem = (:#{#query.numdem}) )  "
    )
    Map<String, Object> findBySpecificVideoInfoDetailCriteres(@Param("query") SearchDocVideoInfoDetailQuery query);

    @Query("SELECT gd.id.datdem as datdem, CAST(gd.id.numdem as string) as numdem, gd.coddoc as coddoc, gd.refdem as refdem, " +
            "   gd.typact as typact, CAST(gd.ddodeb as string) as ddodeb, CAST(gd.ddofin as string) as ddofin " +
            "FROM GenDocEntity gd " +
            "WHERE gd.codenv = :#{#query.codenv} AND gd.codorg = :#{#query.codorg} " +
            "   AND gd.codapp = :#{#query.codapp} AND gd.codcom = :#{#query.codcom} " +
            "   AND gd.codfic = :#{#query.codfic} AND gd.percod = :#{#query.percod} " +
            "   AND gd.numcom = :#{#query.numcom} " +
            "ORDER BY datdem, numdem")
    List<Map<String, String>> getDocDemOccurrenceApplication(@Param("query") SearchDocDemOccurrenceApplicationQuery query);

    @Query("SELECT DISTINCT codorg as codorg, codapp as codapp, codcom as codcom FROM GenDocEntity " +
            " WHERE codorg IS NOT NULL AND codorg != '' AND codapp IS NOT NULL AND codapp != '' AND codcom IS NOT NULL AND codcom != '' " +
            " ORDER BY codorg, codapp, codcom ")
    List<Map<String, String>> getDistinctOrgAppComFromGendoc();
}

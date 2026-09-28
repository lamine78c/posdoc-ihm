package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.GenMasCompositeId;
import fr.acoss.posdoc.database.entities.GenMasEntity;
import fr.acoss.posdoc.domain.suivimassification.model.SuiviMassificationPayload;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface SuiviMassificationRepository extends GenericRepository<GenMasEntity, GenMasCompositeId> {

    String CONST_SEARCH_SUIVI_MASSIFICATION_QUERY =
            "FROM FichierEntity fic " +
            "INNER JOIN GenFicEntity genfic ON (fic.id.codeFich = genfic.id.codfic) AND (fic.id.codeCom = genfic.id.codcom) AND " +
            "   (fic.id.codeApp = genfic.id.codapp) AND (fic.id.codeOrg = genfic.id.codorg) AND (fic.id.codeEnv = genfic.id.codenv) " +
            "INNER JOIN GenMasEntity genmas ON (genfic.id.codfic = genmas.id.masfic) AND (genfic.id.numcom = genmas.id.masnum) AND " +
            "   (genfic.id.codcom = genmas.id.mascom) AND (genfic.id.percod = genmas.id.masper) AND (genfic.id.codapp = genmas.id.masapp) AND " +
            "   (genfic.id.codorg = genmas.id.masorg) AND (genfic.id.codenv = genmas.id.masenv) " +
            "INNER JOIN GenFicEntity genfic1 ON (genmas.id.codfic = genfic1.id.codfic) AND (genmas.id.numcom = genfic1.id.numcom) AND " +
            "   (genmas.id.codcom = genfic1.id.codcom) AND (genmas.id.percod = genfic1.id.percod) AND (genmas.id.codapp = genfic1.id.codapp) AND " +
            "   (genmas.id.codorg = genfic1.id.codorg) AND (genmas.id.codenv = genfic1.id.codenv) " +
            "INNER JOIN GenProEntity genpro ON (genfic1.id.codfic = genpro.id.codeFic) AND (genfic1.id.numcom = genpro.id.numCom) AND " +
            "   (genfic1.id.codcom = genpro.id.codeCom) AND (genfic1.id.percod = genpro.id.perCod) AND (genfic1.id.codapp = genpro.id.codeApp) AND " +
            "   (genfic1.id.codorg = genpro.id.codeOrg) AND (genfic1.id.codenv = genpro.id.codeEnv) " +
            "INNER JOIN SiteCNPEntity site ON (fic.id.codeOrg = site.organismeMassification) " +
            "INNER JOIN SupportEntity sup ON (genfic.typsup = sup.type) " +
            "WHERE fic.id.codeEnv=:#{#payload.codenv} AND fic.id.codeApp=:masApp AND genpro.id.codeGam=:masGam " +
            "   AND ((:#{#payload.sitesMas == null or #payload.sitesMas.isEmpty()} = true)" +
                    "      OR genfic.codsit IN (:#{#payload.sitesMas})) " +
            "   AND (:#{#payload.periodeFin} = '' OR genfic.id.percod <= :#{#payload.periodeFin}) " +
            "   AND (:#{#payload.periodeDebut} = '' OR genfic.id.percod >= :#{#payload.periodeDebut}) ";

    @Query(value = "SELECT CAST(genapp.c14_codenv as varchar) as masenv, genapp.c14_codorg as masorg, genapp.c14_percod as masper, STRING_AGG(s.c73_codsit, ',') as codsit, " +
            "   CAST(genapp.s14_appsta as varchar) as appsta, CAST(genapp.d14_dappld as varchar) as dappld, CAST(genapp.d14_dapplt as varchar) as dapplt " +
            "FROM genapp INNER JOIN sitcnp s ON s.s73_masorg = genapp.c14_codorg " +
            "GROUP BY masenv, masorg, masper, appsta, dappld, dapplt", nativeQuery = true)
    List <Map <String, String> > distinctFiltreMassification();

    @Query("SELECT DISTINCT genmas.id.masper as masper, genmas.id.mascom as mascom, genmas.id.masfic as masfic, genmas.id.masnum as masnum, " +
            "   genmas.id.codorg as codorg, genmas.id.codapp as codapp, genmas.id.percod as percod, genmas.id.codcom as codcom, " +
            "   genmas.id.codfic as codfic, genmas.id.numcom as numcom, genmas.id.codenv as codenv, fic.libFichier as libFichier, sup.libelle as libsup, " +
            "   genfic1.codprd as codprd, genfic1.masuti as masuti, CAST(genpro.pagFic as string) as pagFic, CAST(genpro.pliFic as string) as pliFic, " +
            "   genfic1.codcli as codcli, genfic.codsit as codsit " +
            CONST_SEARCH_SUIVI_MASSIFICATION_QUERY +
            "ORDER BY genfic.codsit, genmas.id.masper DESC, genmas.id.mascom, genmas.id.masfic")
    List<Map<String, String>> suiviMassification(@Param("payload") SuiviMassificationPayload payload, @Param("masApp") String masApp,
                                                 @Param("masGam") String masGam);

    @Query("SELECT COUNT(genmas) " + CONST_SEARCH_SUIVI_MASSIFICATION_QUERY)
    Integer suiviMassificationCount(@Param("payload") SuiviMassificationPayload payload, @Param("masApp") String masApp,
                                    @Param("masGam") String masGam);

    @Query("SELECT params.value FROM ParametreEntity params WHERE params.code = 'MASAPP'")
    String suiviMassificationApplication();

    @Query("SELECT params.value FROM ParametreEntity params WHERE params.code = 'MASGAM'")
    String suiviMassificationGamme();
}

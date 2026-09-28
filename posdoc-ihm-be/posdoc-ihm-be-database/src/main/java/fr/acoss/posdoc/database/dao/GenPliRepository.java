package fr.acoss.posdoc.database.dao;

import fr.acoss.posdoc.database.entities.GenPliEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Map;

@Repository
public interface GenPliRepository extends GenericRepository<GenPliEntity, String> {
    @Query(" SELECT " +
            " gpli.status as status, gpli.numpli as numpli, gpli.idtpli as idtpli, " +
            " gpli.codenv as codenv, gpli.codorg as codorg, gpli.codapp as codapp, " +
            " gpli.percod as percod, gpli.codcom as codcom, gpli.codfic as codfic, " +
            " gpli.numcom as numcom, gpli.plista as plista, gpli.pliinf as pliinf, " +
            " gpli.zoncli as zoncli, CAST(gpli.dplidc as string) as dplidc, CAST(gpli.dplidd as string) as dplidd, " +
            " CAST(gpli.dplidt as string) as dplidt, CAST(gpli.dplide as string) as dplide, CAST(gpli.dplidh as string) as dplidh, " +
            " gpli.nbpage as nbpage, gpli.nbfeui as nbfeui, gpli.edtype as edtype, " +
            " gpli.poipli as poipli, gpli.coupli as coupli, gpli.codpos as codpos, " +
            " gpli.codpay as codpay, gpli.expad1 as expad1, gpli.expad2 as expad2, " +
            " gpli.expad3 as expad3, gpli.expad4 as expad4, gpli.genpro as genpro, " +
            " gpli.infcl1 as infcl1, gpli.infcl2 as infcl2, CAST(gpli.datdep as string) as datdep, " +
            " gpli.mpsidd as mpsidd, gpli.cominf as cominf, gpli.adres1 as adres1, " +
            " gpli.adres2 as adres2, gpli.adres3 as adres3, gpli.adres4 as adres4, " +
            " gpli.adres5 as adres5, gpli.adres6 as adres6, gpli.adres7 as adres7, " +
            " gpli.codgam as codgam, gpro.proSta as prosta, gpro.proInf as proinf, " +
            " (CASE WHEN (gpro.prefec = 1) then 'true' else 'false' end)  as prefec, CAST(gpro.dprodc as string) as dprodc, CAST(gpro.dprodd as string) as dprodd, " +
            " CAST(gpro.dprodt as string) as dprodt, CAST(gpro.dprods as string) as dprods, CAST(gpro.dprodh as string) as dprodh, " +
            " CAST(gpro.pagFic as string) as pagfic, CAST(gpro.pliFic as string) as plific, CAST(gpro.rejFic as string) as rejfic " +
            " FROM GenPliEntity gpli LEFT JOIN GenProEntity gpro ON " +
            " gpli.numcom = gpro.id.numCom AND " +
            " gpli.codfic = gpro.id.codeFic AND " +
            " gpli.codcom = gpro.id.codeCom AND " +
            " gpli.percod = gpro.id.perCod AND " +
            " gpli.codapp = gpro.id.codeApp AND " +
            " gpli.codorg = gpro.id.codeOrg AND " +
            " gpli.codenv = gpro.id.codeEnv " +
            " WHERE gpli.id = :numpli "
    )
    Map<String, String> searchPliByNumpli(@Param("numpli") String numpli);
}

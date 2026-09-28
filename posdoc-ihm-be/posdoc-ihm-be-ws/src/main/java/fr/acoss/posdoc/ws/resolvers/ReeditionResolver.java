package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.database.dao.ParametreRepository;
import fr.acoss.posdoc.domain.genetp.model.query.GenEtpExistsQuery;
import fr.acoss.posdoc.domain.genetp.secondary.GenEtpPersistence;
import fr.acoss.posdoc.domain.genfic.model.EnvOrg;
import fr.acoss.posdoc.domain.genfic.model.EnvOrgApp;
import fr.acoss.posdoc.domain.genfic.model.ReeditionMassification;
import fr.acoss.posdoc.domain.genfic.model.ReeditionProduit;
import fr.acoss.posdoc.domain.genfic.model.ReeditionRessource;
import fr.acoss.posdoc.domain.genfic.model.query.SearchReeditionParMassificationQuery;
import fr.acoss.posdoc.domain.genfic.secondary.GenFicPersistence;
import fr.acoss.posdoc.domain.message.model.ExpReedition;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;
import fr.acoss.posdoc.service.adelaide.ReeditionAdelaideService;
import fr.acoss.posdoc.service.adelaide.impl.AdelaideUtil;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Component;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static fr.acoss.posdoc.types.Parametre.PARAM_CODE_MASAPP;
import static fr.acoss.posdoc.types.Parametre.PARAM_CODE_MASGAM;

@Component
public class ReeditionResolver extends AbstractResolver {
    private final GenFicPersistence genFicPersistence;
    private final GenEtpPersistence genEtpPersistence;
    private final ParametreRepository parametreRepository;
    private final ReeditionAdelaideService adelaideReeditionService;

    public ReeditionResolver(
            final ReeditionAdelaideService adelaideReeditionService,
            final GenEtpPersistence genEtpPersistence,
            final GenFicPersistence genFicPersistence,
            final ParametreRepository parametreRepository
    ) {
        this.genFicPersistence = genFicPersistence;
        this.genEtpPersistence = genEtpPersistence;
        this.adelaideReeditionService = adelaideReeditionService;
        this.parametreRepository = parametreRepository;
    }

    public List<EnvOrgApp> getDistinctEnvOrgAppFromGenfic() {
        return this.genFicPersistence.getDistinctEnvOrgApp();
    }

    public List<EnvOrg> getDistinctEnvOrgFromGenfic() {
        return this.genFicPersistence.getDistinctEnvOrg();
    }

    public List<String> getPeriodeFromGenfic(String codenv, List<String> codorg, String codapp) {
        return this.genFicPersistence.getPeriodeFromGenfic(codenv, codorg, codapp);
    }

    public List<String> getCommandeFromGenfic(String codenv, List<String> codorg, String periode) {
        return this.genFicPersistence.getCommandeFromGenfic(codenv, codorg, periode);
    }

    public List<String> getCommandeFromGenficWithApp(String codenv, List<String> codorg, String codapp, String periode) {
        return this.genFicPersistence.getCommandeFromGenficWithApp(codenv, codorg, codapp, periode);
    }

    public List<String> getFichierFromGenfic(String codenv, List<String> codorg, String periode, String commande) {
        return this.genFicPersistence.getFichierFromGenfic(codenv, codorg, periode, commande);
    }

    public List<String> getFichierFromGenficWithApp(String codenv, List<String> codorg, String codapp, String periode, String commande) {
        return this.genFicPersistence.getFichierFromGenficWithApp(codenv, codorg, codapp, periode, commande);
    }

    public List<ReeditionRessource> searchReeditionPerRessurce(String codenv, List<String> codorg, String codapp, String periode) {
        return this.genFicPersistence.searchReeditionPerRessurce(codenv, codorg, codapp, periode);
    }

    public List<ReeditionMassification> searchReeditionParMassification(SearchReeditionParMassificationQuery searchReeditionParMassificationQuery){
        searchReeditionParMassificationQuery.setMasgam(parametreRepository.getValueByCode(PARAM_CODE_MASGAM));
        searchReeditionParMassificationQuery.setMasapp(parametreRepository.getValueByCode(PARAM_CODE_MASAPP));
        return this.genFicPersistence.searchReeditionParMassification(searchReeditionParMassificationQuery);
    }

    public List<ReeditionProduit> searchReeditionPerProduit(String codenv, List<String> codorg, String application, String periode, String codcom, String codfic) {
        return this.genFicPersistence.searchReeditionPerProduit(codenv, codorg, application, periode, codcom, codfic);
    }

    public List<String> getOrganismeMassification() {
        return this.genFicPersistence.getOrganismeMassification();
    }

    public List<UtiLog> reediter(final List<ExpReedition> expReeditions) {
        List<ExpReedition> result = getGroupsExpReedition(expReeditions);
        return this.adelaideReeditionService.reediter(result);
    }

    private static @NotNull List<ExpReedition> getGroupsExpReedition(final List<ExpReedition> expReeditions) {
        //regroupe par codEnv, codOrg, codApp et percod
        Map<String, List<ExpReedition>> groupBy = expReeditions.stream().collect(Collectors.groupingBy(e -> e.getCodEnv() + e.getCodOrg() + e.getCodApp() + e.getPerCod()));
        List<ExpReedition> results = new LinkedList<>();
        for (List<ExpReedition> reeditions : groupBy.values()) {
            ExpReedition reeditionResult = null;
            for (ExpReedition reedition : reeditions) {
                if (reeditionResult == null) {
                    reeditionResult = new ExpReedition();
                    reeditionResult.setCodEnv(reedition.getCodEnv());
                    reeditionResult.setCodOrg(reedition.getCodOrg());
                    reeditionResult.setCodApp(reedition.getCodApp());
                    reeditionResult.setPerCod(reedition.getPerCod());
                    reeditionResult.setFormId(reedition.getFormId());
                    reeditionResult.setUser(reedition.getUser());
                    reeditionResult.setProduct(reedition.getProduct());
                } else
                    reeditionResult.setProduct(reeditionResult.getProduct() + AdelaideUtil.CAR_CHAMP + reedition.getProduct());
            }
            results.add(reeditionResult);
        }
        return results;
    }

    public boolean checkIfGenEtpExists(GenEtpExistsQuery query) {
        return this.genEtpPersistence.checkIfGenEtpExists(query);
    }

}

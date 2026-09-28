package fr.acoss.posdoc.domain.genfic.secondary;

import fr.acoss.posdoc.domain.genfic.model.*;
import fr.acoss.posdoc.domain.genfic.model.query.SearchReeditionParMassificationQuery;
import fr.acoss.posdoc.domain.occurrence.application.model.OccurrenceApplicationInput;
import fr.acoss.posdoc.domain.occurrence.application.model.ParamDataFacturationInput;

import java.util.List;

public interface GenFicPersistence {

    List<EnvOrgApp> getDistinctEnvOrgApp();

    List<EnvOrg> getDistinctEnvOrg();

    List<String> getPeriodeFromGenfic(String codenv, List<String> codorg, String codapp);

    List<String> getCommandeFromGenfic(String codenv, List<String> codorg, String periode);

    List<String> getCommandeFromGenficWithApp(String codenv, List<String> codorg, String codapp, String periode);

    List<String> getFichierFromGenfic(String codenv, List<String> codorg, String periode, String commande);

    List<String> getFichierFromGenficWithApp(String codenv, List<String> codorg, String codapp, String periode, String commande);

    List<ReeditionRessource> searchReeditionPerRessurce(String codenv, List<String> codorg, String codapp, String periode);

    List<ReeditionMassification> searchReeditionParMassification(SearchReeditionParMassificationQuery searchReeditionQuery);

    List<ReeditionProduit> searchReeditionPerProduit(String codenv, List<String> codorg, String application, String periode, String codcom, String codfic);

    List<String> getOrganismeMassification();

    List<Facturation> getFacturation(ParamDataFacturationInput paramData);

    void termineGenFic(OccurrenceApplicationInput paramData);

    List<GenFic> findOccurrencesFichiers(OccurrencesFichiersFiltersInput filtersPayload);

    String findOccurrencesFichiersWithMaxSizeCheck(OccurrencesFichiersFiltersInput filtersPayload);

    SearchOccAppByFicPayloadDTO searchOccAppByFic(SearchOccAppByFicQuery query);
}

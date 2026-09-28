package fr.acoss.posdoc.domain.massification.secondary;

import fr.acoss.posdoc.domain.massification.model.MassificationPool;
import fr.acoss.posdoc.domain.massification.model.MassificationSearch;
import fr.acoss.posdoc.domain.massification.model.MassificationUpdate;
import fr.acoss.posdoc.domain.massification.model.OptionFields;
import fr.acoss.posdoc.domain.massification.model.SearchMassificationQuery;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsMassification;
import fr.acoss.posdoc.domain.occurrence.application.model.ParamDataMassificationInput;

import java.util.List;

public interface MassificationPersistence {
    List<OptionFields> getDistinctFieldsFromTmpMasGenFicGenProOrg();

    List<MassificationSearch> searchForMassification(
            SearchMassificationQuery query,
            String codegam
    );

    List<MassificationPool> getPoolElementsForMassification(List<String> masfics);

    List<MassificationSearch> updateMassification(List<MassificationUpdate> data, String codsit, String codegam);

    boolean deleteMassification(List<MassificationSearch> data);

    List<DetailsMassification> findDetailsMassificationForOccurrenceApplication(ParamDataMassificationInput paramData);

    List<String> findPercodForMassification(
            String codenv,
            String codorg,
            String codapp,
            String percod
    );
}

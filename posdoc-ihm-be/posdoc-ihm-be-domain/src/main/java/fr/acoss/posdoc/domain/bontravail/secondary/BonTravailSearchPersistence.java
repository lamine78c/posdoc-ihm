package fr.acoss.posdoc.domain.bontravail.secondary;

import fr.acoss.posdoc.domain.bontravail.model.SearchBonTravailManuelQuery;
import fr.acoss.posdoc.domain.genfic.model.BonTravailGroupByPeriodeDTO;
import fr.acoss.posdoc.domain.genfic.model.BonTravailGroupByPeriodeResultDTO;
import fr.acoss.posdoc.domain.genfic.model.BonTravailPayload;
import fr.acoss.posdoc.domain.genfic.model.BonTravailPeriodeFilterPayload;
import fr.acoss.posdoc.domain.genfic.model.GenFic;

import java.util.List;

public interface BonTravailSearchPersistence {

    GenFic findById(String codenv, String codorg, String codapp, String percod, String codcom, String numcom, String codfic);

    List<String> getPeriodeFromGenAppWhereCodEnvAndCodOrg(BonTravailPeriodeFilterPayload bonTravailPeriodeFilterPayload);

    List<BonTravailGroupByPeriodeDTO> findBonTravailManuel(SearchBonTravailManuelQuery query);

    BonTravailGroupByPeriodeResultDTO findBonTravail(BonTravailPayload bonTravailPayload, String masapp);

}

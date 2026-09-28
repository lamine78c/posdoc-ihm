package fr.acoss.posdoc.domain.bontravail.secondary;

import fr.acoss.posdoc.domain.bontravail.model.BonTravailPdfInput;
import fr.acoss.posdoc.domain.bontravail.model.BonTravailUpdateDTO;
import fr.acoss.posdoc.domain.bontravail.model.BonTravailUpdatePayload;
import fr.acoss.posdoc.domain.bontravail.model.UserInfoPayload;
import fr.acoss.posdoc.domain.genfic.model.GenFic;

import java.util.List;

public interface BonTravailPersistence extends BonTravailSearchPersistence {

    List<BonTravailUpdateDTO> updateAll(List<GenFic> genFicList);

    List<BonTravailUpdateDTO> updateBonTravail(List<BonTravailUpdatePayload> listBonTravailUpdate, UserInfoPayload userInfoPayload);

    String getBonTravailPdf(BonTravailPdfInput input);

}

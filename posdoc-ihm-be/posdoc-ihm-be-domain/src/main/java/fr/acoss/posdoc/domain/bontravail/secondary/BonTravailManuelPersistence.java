package fr.acoss.posdoc.domain.bontravail.secondary;

import fr.acoss.posdoc.domain.bontravail.model.DeleteBonTravailManuelQuery;
import fr.acoss.posdoc.domain.genfic.model.CreateOrUpdateBonTravailManuelDTO;
import fr.acoss.posdoc.domain.genfic.model.CreateOrUpdateBonTravailManuelPayload;

public interface BonTravailManuelPersistence extends BonTravailSearchPersistence {

    CreateOrUpdateBonTravailManuelDTO createOrUpdate(CreateOrUpdateBonTravailManuelPayload payload);

    void deleteBonTravailManuel(DeleteBonTravailManuelQuery query);
}

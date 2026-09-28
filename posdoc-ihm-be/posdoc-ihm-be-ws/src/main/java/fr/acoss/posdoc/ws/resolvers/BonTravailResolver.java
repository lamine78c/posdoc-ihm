package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.bontravail.model.BonTravailPdfInput;
import fr.acoss.posdoc.domain.bontravail.model.BonTravailUpdateDTO;
import fr.acoss.posdoc.domain.bontravail.model.BonTravailUpdatePayload;
import fr.acoss.posdoc.domain.bontravail.model.IsBonTravailManuelInput;
import fr.acoss.posdoc.domain.bontravail.model.UserInfoPayload;
import fr.acoss.posdoc.domain.bontravail.secondary.BonTravailPersistence;
import fr.acoss.posdoc.domain.genapp.secondary.GenAppPersistence;
import fr.acoss.posdoc.domain.genfic.model.BonTravailGroupByPeriodeResultDTO;
import fr.acoss.posdoc.domain.genfic.model.BonTravailPayload;
import fr.acoss.posdoc.domain.genfic.model.BonTravailPeriodeFilterPayload;
import fr.acoss.posdoc.domain.parametre.secondary.ParametrePersistence;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

import static fr.acoss.posdoc.types.Parametre.PARAM_CODE_MASAPP;

@Component
public class BonTravailResolver extends AbstractResolver {
    private final BonTravailPersistence bonTravailPersistence;
    private final GenAppPersistence genAppPersistence;
    private final ParametrePersistence parametrePersistence;

    @Autowired
    public BonTravailResolver(
            final BonTravailPersistence bonTravailPersistence,
            final GenAppPersistence genAppPersistence,
            final ParametrePersistence parametrePersistence
    ) {
        this.bonTravailPersistence = bonTravailPersistence;
        this.genAppPersistence = genAppPersistence;
        this.parametrePersistence = parametrePersistence;
    }

    public Boolean isBonTravailManuel(IsBonTravailManuelInput isBonTravailManuelInput) {
        return this.genAppPersistence.isBonTravailManuel(isBonTravailManuelInput);
    }

    public String getBonTravailPdf(BonTravailPdfInput input) {
        return this.bonTravailPersistence.getBonTravailPdf(input);
    }

    public List<String> getDistinctEnvOrgAppPerFromGenApp(BonTravailPeriodeFilterPayload bonTravailPeriodeFilterPayload) {
        return bonTravailPersistence.getPeriodeFromGenAppWhereCodEnvAndCodOrg(bonTravailPeriodeFilterPayload);
    }

    public BonTravailGroupByPeriodeResultDTO searchBonTravail(BonTravailPayload bonTravailPayload) {
        return bonTravailPersistence.findBonTravail(bonTravailPayload,parametrePersistence.getValueByCode(PARAM_CODE_MASAPP));
    }

    @Historisable(form = "Suivi > Bons de travail", action = Action.UPDATE)
    public List<BonTravailUpdateDTO> updateBonTravail(List<BonTravailUpdatePayload> listBonTravailUpdate, UserInfoPayload userInfoPayload) {
        return bonTravailPersistence.updateBonTravail(listBonTravailUpdate, userInfoPayload);
    }
}
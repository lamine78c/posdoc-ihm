package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.domain.bontravail.model.BonTravailInput;
import fr.acoss.posdoc.domain.bontravail.model.DeleteBonTravailManuelQuery;
import fr.acoss.posdoc.domain.bontravail.model.SearchBonTravailManuelQuery;
import fr.acoss.posdoc.domain.bontravail.secondary.BonTravailManuelPersistence;
import fr.acoss.posdoc.domain.genfic.model.BonTravailGroupByPeriodeDTO;
import fr.acoss.posdoc.domain.genfic.model.CreateOrUpdateBonTravailManuelDTO;
import fr.acoss.posdoc.domain.genfic.model.CreateOrUpdateBonTravailManuelPayload;
import fr.acoss.posdoc.domain.message.model.GenericAdelaideMessage;
import fr.acoss.posdoc.service.adelaide.impl.AdelaideUtil;
import fr.acoss.posdoc.service.adelaide.impl.GenericMessageAdelaideServiceImpl;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideResult;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.resolvers.payloads.DeletePayloadDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BonTravailManuelResolver extends AbstractResolver {

    private final BonTravailManuelPersistence bonTravailManuelPersistence;
    private final GenericMessageAdelaideServiceImpl genericMessageAdelaideService;

    @Autowired
    public BonTravailManuelResolver(
            GenericMessageAdelaideServiceImpl genericMessageAdelaideService,
            BonTravailManuelPersistence bonTravailManuelPersistence
    ) {
        super();
        this.bonTravailManuelPersistence = bonTravailManuelPersistence;
        this.genericMessageAdelaideService = genericMessageAdelaideService;
    }

    public List<BonTravailGroupByPeriodeDTO> searchBonTravailManuel(SearchBonTravailManuelQuery query) {
        return bonTravailManuelPersistence.findBonTravailManuel(query);
    }

    @Historisable(form = "Exploitation éditique > Bons de travail manuels", action = Action.DELETE)
    public DeletePayloadDTO deleteBonTravailManuel(DeleteBonTravailManuelQuery query) {
        this.bonTravailManuelPersistence.deleteBonTravailManuel(query);
        return new DeletePayloadDTO(Boolean.TRUE);
    }

    @Historisable(form = "Exploitation éditique > Bons de travail manuels", action = Action.CREATE)
    public CreateOrUpdateBonTravailManuelDTO createBonTravailManuel(CreateOrUpdateBonTravailManuelPayload payload) {
        return bonTravailManuelPersistence.createOrUpdate(payload);
    }

    @Historisable(form = "Exploitation éditique > Bons de travail manuels", action = Action.UPDATE)
    public CreateOrUpdateBonTravailManuelDTO updateBonTravailManuel(CreateOrUpdateBonTravailManuelPayload payload) {
        return bonTravailManuelPersistence.createOrUpdate(payload);
    }

    public String imprimerBonTravail(BonTravailInput bonTravailInput) {
        GenericAdelaideMessage genericAdelaideMessage = new GenericAdelaideMessage(
                getBonTravailImprimerMsg(bonTravailInput)
        );
        AdelaideResult result = this.genericMessageAdelaideService.sendGenericMessage(genericAdelaideMessage);
        return result.getResult();
    }

    private String getBonTravailImprimerMsg(BonTravailInput bonTravailInput) {
        String strCmd = AdelaideUtil.ADL_RUN + "/shref/bon_manuel.sh " + getSignalMsg(bonTravailInput);
        return AdelaideUtil.FONC_EXEC_CMD + strCmd + AdelaideUtil.CAR_FIN;
    }

    private String getSignalMsg(BonTravailInput bonTravailInput) {
        return bonTravailInput.getCodenv() + AdelaideUtil.UNDERSCORE + bonTravailInput.getCodorg() +
                AdelaideUtil.UNDERSCORE + bonTravailInput.getCodapp() + AdelaideUtil.UNDERSCORE + bonTravailInput.getPercod() +
                AdelaideUtil.UNDERSCORE + bonTravailInput.getNumcom() + AdelaideUtil.UNDERSCORE + bonTravailInput.getCodcom() +
                AdelaideUtil.UNDERSCORE + bonTravailInput.getCodfic();
    }
}

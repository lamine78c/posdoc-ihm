package fr.acoss.posdoc.service.adelaide.impl;

import fr.acoss.posdoc.database.services.VersionAdelaideService;
import fr.acoss.posdoc.domain.message.model.ExpMassification;
import fr.acoss.posdoc.domain.message.model.IAdelaideMessage;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;
import fr.acoss.posdoc.domain.utilog.primary.UtiLogService;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideSocketServiceImpl;
import org.springframework.stereotype.Service;

@Service
public abstract class AbstractMassificationServiceImpl extends AbstractAdelaideServiceImpl<UtiLog> {
    protected final UtiLogService utiLogService;

    protected AbstractMassificationServiceImpl(final UtiLogService utiLogService,
                                               final VersionAdelaideService adelaideVersionService, final AdelaideSocketServiceImpl adelaideSocketService) {
        super(adelaideVersionService, adelaideSocketService);
        this.utiLogService = utiLogService;
    }

    @Override
    protected String createMessage(final IAdelaideMessage iadelaideMessage) {
        ExpMassification massificationMessage = (ExpMassification) iadelaideMessage;
        String isSimu = Boolean.TRUE.equals(massificationMessage.getIsSimu()) ? "1" : "0";
        String typTar = massificationMessage.getTypar() != null ? massificationMessage.getTypar() : "";
        String message = AdelaideUtil.FONC_MASSIFIER
                + massificationMessage.getCodEnv()
                + AdelaideUtil.CAR_CHAMP
                + massificationMessage.getCodOrg()
                + AdelaideUtil.CAR_CHAMP
                + massificationMessage.getPerCod()
                + AdelaideUtil.CAR_CHAMP
                + typTar
                + AdelaideUtil.CAR_CHAMP
                + isSimu
                + AdelaideUtil.CAR_CHAMP
                + massificationMessage.getListeFic()
                + AdelaideUtil.CAR_FIN;
        doLogBefore(getClass().getName(), message);
        return message;
    }

}

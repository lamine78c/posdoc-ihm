package fr.acoss.posdoc.service.adelaide.impl;

import fr.acoss.posdoc.domain.message.model.AdelaideMessage;
import fr.acoss.posdoc.domain.message.model.ExpReedition;
import fr.acoss.posdoc.domain.message.model.IAdelaideMessage;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;
import fr.acoss.posdoc.domain.utilog.primary.UtiLogService;
import fr.acoss.posdoc.service.adelaide.ReeditionAdelaideService;
import fr.acoss.posdoc.database.services.VersionAdelaideService;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideSocketServiceImpl;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class ReeditionAdelaideServiceImpl extends AbstractAdelaideUtilogServiceImpl implements ReeditionAdelaideService {


    public ReeditionAdelaideServiceImpl(final UtiLogService utiLogService,
                                        final VersionAdelaideService adelaideVersionService,
                                        final AdelaideSocketServiceImpl adelaideSocketService) {
        super(utiLogService, adelaideVersionService, adelaideSocketService);

    }

    public List<UtiLog> reediter(final List<ExpReedition> reeditions) {
        List<IAdelaideMessage> adelaideMessages = reeditions.stream()
                .filter(Objects::nonNull)
                .map(AdelaideMessage.class::cast)
                .collect(Collectors.toList());
        return this.connectAndBatchSend(adelaideMessages);
    }

    @Override
    protected String createMessage(final IAdelaideMessage iadelaideMessage) {
        ExpReedition reeditionMessage = (ExpReedition) iadelaideMessage;
        String message = AdelaideUtil.FONC_REEDITER + reeditionMessage.getCodEnv() + AdelaideUtil.CAR_CHAMP + reeditionMessage.getCodOrg() + AdelaideUtil.CAR_CHAMP + reeditionMessage.getCodApp() + AdelaideUtil.CAR_CHAMP + reeditionMessage.getPerCod() + AdelaideUtil.CAR_CHAMP + reeditionMessage.getProduct() + AdelaideUtil.CAR_FIN;
        doLogBefore(getClass().getName(), message);
        return message;
    }

}

package fr.acoss.posdoc.service.adelaide.impl;

import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.domain.message.model.AdelaideMessage;
import fr.acoss.posdoc.domain.message.model.IAdelaideMessage;
import fr.acoss.posdoc.domain.occurrence.application.model.TerminaisonGenAppInput;
import fr.acoss.posdoc.domain.utilog.UtiLogUtil;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;
import fr.acoss.posdoc.domain.utilog.primary.UtiLogService;
import fr.acoss.posdoc.service.adelaide.TerminaisonGenAppAdelaideService;
import fr.acoss.posdoc.database.services.VersionAdelaideService;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideResult;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideSocketServiceImpl;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class TerminaisonGenAppAdelaideServiceImpl extends AbstractAdelaideUtilogServiceImpl implements TerminaisonGenAppAdelaideService {

    public TerminaisonGenAppAdelaideServiceImpl(final UtiLogService utiLogService,
                                                final VersionAdelaideService adelaideVersionService,
                                                final AdelaideSocketServiceImpl adelaideSocketService) {
        super(utiLogService, adelaideVersionService, adelaideSocketService);

    }

    public UtiLog terminerGenApp(final TerminaisonGenAppInput param) {
        if (Boolean.TRUE.equals(param.getIsAnnule())) {
            String params = UtiLogUtil.PARAM_PREFIX_GENAPP + param.getCodEnv() + UtiLogUtil.PARAM_SEP + param.getCodOrg() + UtiLogUtil.PARAM_SEP + param.getCodApp() + UtiLogUtil.PARAM_SEP + param.getPerCod();
            return this.utiLogService.insertUtilog(UtiLogUtil.ERR_ANNULATION, params, UtiLogUtil.ACT_TERMINER, ContextHolder.getContext().getHost(), param.getUser(), param.getFormId());
        } else {
            List<TerminaisonGenAppInput> params = new ArrayList<>();
            params.add(param);
            List<IAdelaideMessage> adelaideMessages = params.stream()
                    .filter(Objects::nonNull)
                    .map(AdelaideMessage.class::cast)
                    .collect(Collectors.toList());
            List<UtiLog> results = this.connectAndBatchSend(adelaideMessages);
            return results.get(0);
        }
    }

    @Override
    protected String createMessage(final IAdelaideMessage iAdelaideMessage) {
        AdelaideMessage adelaideMessage = (AdelaideMessage) iAdelaideMessage;
        String message = AdelaideUtil.FONC_SET_GENAPP_TERM + adelaideMessage.getCodEnv() + AdelaideUtil.CAR_CHAMP + adelaideMessage.getCodOrg() + AdelaideUtil.CAR_CHAMP + adelaideMessage.getCodApp() + AdelaideUtil.CAR_CHAMP + adelaideMessage.getPerCod() + AdelaideUtil.CAR_FIN;
        doLogBefore(getClass().getName(), message);
        return message;
    }

    @Override
    protected UtiLog logResult(final AdelaideResult result, final IAdelaideMessage iAdelaideMessage) {
        String error = (result != null) ? result.getError() : null;
        AdelaideMessage adelaideMessage = (AdelaideMessage) iAdelaideMessage;
        doLogAfter(getClass().getName(), error);
        String params = UtiLogUtil.PARAM_PREFIX_GENAPP + adelaideMessage.getCodEnv() + UtiLogUtil.PARAM_SEP + adelaideMessage.getCodOrg() + UtiLogUtil.PARAM_SEP + adelaideMessage.getCodApp() + UtiLogUtil.PARAM_SEP + adelaideMessage.getPerCod();
        return this.utiLogService.insertUtilog(error, params, UtiLogUtil.ACT_TERMINER, ContextHolder.getContext().getHost(), adelaideMessage.getUser(), adelaideMessage.getFormId());
    }
}

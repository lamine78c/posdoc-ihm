package fr.acoss.posdoc.service.adelaide.impl;

import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.domain.message.model.AdelaideMessage;
import fr.acoss.posdoc.domain.message.model.IAdelaideMessage;
import fr.acoss.posdoc.domain.utilog.UtiLogUtil;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;
import fr.acoss.posdoc.domain.utilog.primary.UtiLogService;
import fr.acoss.posdoc.database.services.VersionAdelaideService;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideResult;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideSocketServiceImpl;
import org.springframework.stereotype.Service;

@Service
public abstract class AbstractAdelaideUtilogServiceImpl extends AbstractAdelaideServiceImpl<UtiLog> {
    protected final UtiLogService utiLogService;

    protected AbstractAdelaideUtilogServiceImpl(final UtiLogService utiLogService,
                                                final VersionAdelaideService adelaideVersionService, final AdelaideSocketServiceImpl adelaideSocketService) {
        super(adelaideVersionService, adelaideSocketService);
        this.utiLogService = utiLogService;
    }

    @Override
    protected UtiLog logResult(final AdelaideResult result, final IAdelaideMessage iAdelaideMessage) {
        String error = (result != null) ? result.getError() : null;
        AdelaideMessage adelaideMessage = (AdelaideMessage) iAdelaideMessage;
        doLogAfter(getClass().getName(), error);
        String params = UtiLogUtil.PARAM_PREFIX_GENAPP + adelaideMessage.getCodEnv() + UtiLogUtil.PARAM_SEP + adelaideMessage.getCodOrg() + UtiLogUtil.PARAM_SEP + adelaideMessage.getCodApp() + UtiLogUtil.PARAM_SEP + adelaideMessage.getPerCod();
        return this.utiLogService.insertUtilog(error, params, UtiLogUtil.ACT_VALIDER, ContextHolder.getContext().getHost(), adelaideMessage.getUser(), adelaideMessage.getFormId());
    }

}

package fr.acoss.posdoc.service.adelaide;

import fr.acoss.posdoc.domain.occurrence.application.model.TerminaisonGenAppInput;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;

public interface TerminaisonGenAppAdelaideService {
    UtiLog terminerGenApp(TerminaisonGenAppInput param);
}

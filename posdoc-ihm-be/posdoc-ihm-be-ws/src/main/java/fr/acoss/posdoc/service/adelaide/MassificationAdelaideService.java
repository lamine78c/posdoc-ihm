package fr.acoss.posdoc.service.adelaide;

import fr.acoss.posdoc.domain.message.model.ExpMassification;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;

public interface MassificationAdelaideService {
    UtiLog massifier(ExpMassification massification);
}

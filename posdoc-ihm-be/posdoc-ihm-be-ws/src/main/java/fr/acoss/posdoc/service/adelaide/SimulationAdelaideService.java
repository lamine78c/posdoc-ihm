package fr.acoss.posdoc.service.adelaide;

import fr.acoss.posdoc.domain.message.model.ExpMassification;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;

public interface SimulationAdelaideService {
    UtiLog simuler(ExpMassification massification);
}

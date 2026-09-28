package fr.acoss.posdoc.service.adelaide;

import fr.acoss.posdoc.domain.message.model.ExpReedition;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;

import java.util.List;

public interface ReeditionAdelaideService {

    List<UtiLog> reediter(List<ExpReedition> reeditions);
}

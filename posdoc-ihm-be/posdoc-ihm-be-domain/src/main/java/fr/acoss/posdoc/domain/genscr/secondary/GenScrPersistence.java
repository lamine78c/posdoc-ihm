package fr.acoss.posdoc.domain.genscr.secondary;

import fr.acoss.posdoc.domain.occurrence.application.model.DetailsIncident;
import fr.acoss.posdoc.domain.occurrence.application.model.ParamDataIncidentInput;
import fr.acoss.posdoc.domain.occurrence.etape.model.Incidents;

import java.util.List;

public interface GenScrPersistence {
    List<DetailsIncident> getDetailsIncident(ParamDataIncidentInput paramData);
    List<Incidents> getIncidentsByIdetap(Integer id);
}

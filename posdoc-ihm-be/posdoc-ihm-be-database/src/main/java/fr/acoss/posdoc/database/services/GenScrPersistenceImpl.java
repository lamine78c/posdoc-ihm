package fr.acoss.posdoc.database.services;


import fr.acoss.posdoc.database.dao.GenScrRepository;
import fr.acoss.posdoc.database.entities.GenScrCompositeId;
import fr.acoss.posdoc.database.entities.GenScrEntity;
import fr.acoss.posdoc.database.mappers.GenScrMapper;
import fr.acoss.posdoc.domain.genscr.model.GenScr;
import fr.acoss.posdoc.domain.genscr.secondary.GenScrPersistence;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsIncident;
import fr.acoss.posdoc.domain.occurrence.application.model.ParamDataIncidentInput;
import fr.acoss.posdoc.domain.occurrence.etape.model.Incidents;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;

@Service
public class GenScrPersistenceImpl extends AbstractObjectPersistence<GenScrEntity, GenScrCompositeId, GenScr>
    implements GenScrPersistence {

  private static final GenScrMapper MAPPER = GenScrMapper.INSTANCE;
  private final GenScrRepository genScrRepository;

  public GenScrPersistenceImpl(final GenScrRepository genScrRepository) {
    this.genScrRepository = genScrRepository;
  }

  @Override
  protected JpaSpecificationExecutor<GenScrEntity> getSpecificationExecutor() {
    return genScrRepository;
  }

  @Override
  protected JpaRepository<GenScrEntity, GenScrCompositeId> getRepository() {
    return genScrRepository;
  }

  @Override
  protected Function<GenScrEntity, GenScr> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<GenScr, GenScrEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  public List<DetailsIncident> getDetailsIncident(ParamDataIncidentInput paramData) {
    String codenv = paramData.getCodEnv();
    String codorg = paramData.getCodOrg();
    String codapp = paramData.getCodApp();
    String percod = paramData.getPerCod();
    return genScrRepository.getDetailsIncident(codenv, codorg, codapp, percod);
  }

  public List<Incidents> getIncidentsByIdetap(Integer id) {
    return genScrRepository.getIncidentsByIdetap(id);
  }
}

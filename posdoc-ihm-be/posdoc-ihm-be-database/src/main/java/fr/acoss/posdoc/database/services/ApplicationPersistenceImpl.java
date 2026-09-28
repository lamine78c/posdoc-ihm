package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.ApplicationRepository;
import fr.acoss.posdoc.database.entities.ApplicationCompositeId;
import fr.acoss.posdoc.database.entities.ApplicationEntity;
import fr.acoss.posdoc.database.mappers.ApplicationMapper;
import fr.acoss.posdoc.domain.application.model.Application;
import fr.acoss.posdoc.domain.application.model.ApplicationComposite;
import fr.acoss.posdoc.domain.application.secondary.ApplicationPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ApplicationPersistenceImpl
    extends AbstractObjectPersistence<ApplicationEntity, ApplicationCompositeId, Application>
    implements ApplicationPersistence {

  private static final ApplicationMapper MAPPER = ApplicationMapper.INSTANCE;

  private final ApplicationRepository applicationRepository;

  public ApplicationPersistenceImpl(final ApplicationRepository applicationRepository) {
    this.applicationRepository = applicationRepository;
  }

  @Override
  protected JpaSpecificationExecutor<ApplicationEntity> getSpecificationExecutor() {
    return applicationRepository;
  }

  @Override
  protected JpaRepository<ApplicationEntity, ApplicationCompositeId> getRepository() {
    return applicationRepository;
  }

  @Override
  protected Function<ApplicationEntity, Application> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<Application, ApplicationEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<Application> selectAll() {
    return applicationRepository.findApplications() ;
  }

  @Override
  public List<Application> findApplicationsByEnv(List<String> codesEnv) {
    return applicationRepository.findApplicationsByEnv(codesEnv)
            .stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public boolean exists( String codenv,  String codorg, String codapp) {
    return exists(new ApplicationCompositeId(codenv, codorg,codapp));
  }

  @Override
  public void deleteAll(Iterable<ApplicationComposite> ids) {
    List<ApplicationCompositeId> deletes = new ArrayList<>();
    ids.forEach(e-> deletes.add(new ApplicationCompositeId(  e.getCodeEnvironnement(),e.getCodeOrganisation(),e.getCode() )));
    applicationRepository.deleteByIdIn(deletes);
  }

  @Override
  public List<String> environnementsExistsInApplications(List<String> environnementCodes) {
    return applicationRepository.environnementsExistsInApplications(environnementCodes);
  }

  @Override
  public List<String> organismesExistsInApplications(List<String> organismeCodes) {
    return applicationRepository.organismesExistsInApplications(organismeCodes);
  }

  @Override
  public List<String> findCodeApp() {
      return applicationRepository.findCodeApp();
  }

  @Override
  public List<String> findCodeAppByEnvOrgs(String codenv, List<String> codorgs) {
    return applicationRepository.findCodeAppByEnvOrgs(codenv, codorgs);
  }
}

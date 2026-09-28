package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.database.dao.DestinataireRepository;
import fr.acoss.posdoc.database.dao.ParametreEditionRepository;
import fr.acoss.posdoc.database.dao.RessourceRepository;
import fr.acoss.posdoc.database.entities.ParametreEditionEntity;
import fr.acoss.posdoc.database.mappers.ParametreEditionMapper;
import fr.acoss.posdoc.domain.parametre.distribution.model.CodeEnvAppIsadminPayload;
import fr.acoss.posdoc.domain.parametre.distribution.model.CodeEnvOrgsAppPayload;
import fr.acoss.posdoc.domain.parametre.distribution.model.RessourceCodeEnvOrgsAppDTO;
import fr.acoss.posdoc.domain.parametre.edition.model.ParametreEdition;
import fr.acoss.posdoc.domain.parametre.edition.secondary.ParametreEditionPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ParametreEditionPersistenceImpl
    extends AbstractObjectPersistence<ParametreEditionEntity, String, ParametreEdition>
    implements ParametreEditionPersistence {
  private static final ParametreEditionMapper PARAMETRE_EDITION_MAPPER = ParametreEditionMapper.INSTANCE;
  private final ParametreEditionRepository parametreEditionRepository;
  private final RessourceRepository ressourceRepository;
  private final DestinataireRepository destinataireRepository;

  public ParametreEditionPersistenceImpl(
          final ParametreEditionRepository parametreEditionRepository,
          final RessourceRepository ressourceRepository,
          final DestinataireRepository destinataireRepository
  ) {
    this.parametreEditionRepository = parametreEditionRepository;
    this.ressourceRepository = ressourceRepository;
    this.destinataireRepository = destinataireRepository;
  }

  @Override
  protected JpaSpecificationExecutor<ParametreEditionEntity> getSpecificationExecutor() {
    return parametreEditionRepository;
  }

  @Override
  protected JpaRepository<ParametreEditionEntity, String> getRepository() {
    return parametreEditionRepository;
  }

  @Override
  protected Function<ParametreEditionEntity, ParametreEdition> entityToDomainFunction() {
    return PARAMETRE_EDITION_MAPPER::entityToDomain;
  }

  @Override
  protected Function<ParametreEdition, ParametreEditionEntity> domainToEntityFunction() {
    return PARAMETRE_EDITION_MAPPER::domainToEntity;
  }
  @Override
  public List<ParametreEdition> selectAll() {
    return parametreEditionRepository.selectAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }
  @Override
  public void deleteAll(List<String> ids) {
    parametreEditionRepository.deleteByReferenceIn(ids);
  }

  @Override
  public List<String> formatsExistsInparametresEditions(List<String> formatCodes) {
    return parametreEditionRepository.formatsExistsInparametresEditions(formatCodes);
  }

  @Override
  public List<RessourceCodeEnvOrgsAppDTO> getRessourcesByCodeEnvOrgsApp(CodeEnvOrgsAppPayload codeEnvOrgsAppPayload) {
    List<RessourceCodeEnvOrgsAppDTO> results = findIntersectRessourceByEnvOrgAppIsadmin(codeEnvOrgsAppPayload);
    CodeEnvAppIsadminPayload payload = new CodeEnvAppIsadminPayload();
    payload.setCodenv(codeEnvOrgsAppPayload.getCodenv());
    payload.setCodapp(codeEnvOrgsAppPayload.getCodapp());
    payload.setIsadmin(codeEnvOrgsAppPayload.getIsProfilAdmin());
    results.addAll(findGeneralRessourceByEnvAppIsadmin(payload));
    return results;
  }

  @Override
  public List<String> getCodeDestinatairesByCodeOrgs(List<String> codorgs) {
    return destinataireRepository.findIntersectDestinByOrg(codorgs, (long) codorgs.size());
  }

  private List<RessourceCodeEnvOrgsAppDTO> findGeneralRessourceByEnvAppIsadmin(CodeEnvAppIsadminPayload payload) {
    return ressourceRepository.findGeneralRessourceByEnvAppIsadmin(payload).stream()
            .map(row -> new RessourceCodeEnvOrgsAppDTO(
                    row.get(ParamsUtils.CODGAM),
                    row.get(ParamsUtils.CODSIT),
                    row.get(ParamsUtils.CODRES)
            ))
            .collect(Collectors.toList());
  }

  private List<RessourceCodeEnvOrgsAppDTO> findIntersectRessourceByEnvOrgAppIsadmin(CodeEnvOrgsAppPayload codeEnvOrgsAppPayload) {
    return ressourceRepository.findIntersectRessourceByEnvOrgAppIsadmin(codeEnvOrgsAppPayload, (long) codeEnvOrgsAppPayload.getCodorgs().length)
            .stream()
            .map(row -> new RessourceCodeEnvOrgsAppDTO(
                    row.get(ParamsUtils.CODGAM),
                    row.get(ParamsUtils.CODSIT),
                    row.get(ParamsUtils.CODRES)
            ))
            .collect(Collectors.toList());
  }
}

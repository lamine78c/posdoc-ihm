package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.ParametreRepository;
import fr.acoss.posdoc.database.entities.ParametreEntity;
import fr.acoss.posdoc.database.mappers.ParametreMapper;
import fr.acoss.posdoc.domain.parametre.model.Parametre;
import fr.acoss.posdoc.domain.parametre.secondary.ParametrePersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ParametrePersistenceImpl
    extends AbstractObjectPersistence<ParametreEntity, String, Parametre>
    implements ParametrePersistence {

  private static final ParametreMapper MAPPER = ParametreMapper.INSTANCE;

  private final ParametreRepository parametreRepository;

  public ParametrePersistenceImpl(
      ParametreRepository parametreRepository) {this.parametreRepository = parametreRepository;}

  @Override
  protected JpaSpecificationExecutor<ParametreEntity> getSpecificationExecutor() {
    return parametreRepository;
  }

  @Override
  protected JpaRepository<ParametreEntity, String> getRepository() {
    return parametreRepository;
  }

  @Override
  protected Function<ParametreEntity, Parametre> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<Parametre, ParametreEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<Parametre> selectAll() {
    return parametreRepository.findAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public void deleteAll(Iterable<String> ids) {
    parametreRepository.deleteByCodeIn(ids);
  }

  @Override
  public String getAdelaideVersion() {
    return parametreRepository.getAdelaideVersion();
  }

  @Override
  public String getCodeGamme() {
      return parametreRepository.getValueForMASGAM();
  }

  @Override
  public String getValueByCode(final String code) {
    return parametreRepository.getValueByCode(code);
  }

  @Override
  public List<Parametre> getParamsForMasappMasgamMasuti() {
    return parametreRepository.getParamsForMasappMasgamMasuti();
  }

  @Override
  public String getValueDocDematerialises() {
    return parametreRepository.getValueDocDematerialises();
  }
}

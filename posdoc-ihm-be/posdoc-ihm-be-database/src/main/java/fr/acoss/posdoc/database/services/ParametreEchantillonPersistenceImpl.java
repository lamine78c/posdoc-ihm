package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.ParametreEchantillonRepository;
import fr.acoss.posdoc.database.entities.ParametreEchantillonEntity;
import fr.acoss.posdoc.database.mappers.ParametreEchantillonMapper;
import fr.acoss.posdoc.domain.parametre.echantillon.model.ParametreEchantillon;
import fr.acoss.posdoc.domain.parametre.echantillon.secondary.ParametreEchantillonPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ParametreEchantillonPersistenceImpl
    extends AbstractObjectPersistence<ParametreEchantillonEntity, String, ParametreEchantillon>
    implements ParametreEchantillonPersistence {

  private static final ParametreEchantillonMapper MAPPER = ParametreEchantillonMapper.INSTANCE;

  private final ParametreEchantillonRepository parametreEchantillonRepository;

  public ParametreEchantillonPersistenceImpl(
      ParametreEchantillonRepository parametreEchantillonRepository) {this.parametreEchantillonRepository = parametreEchantillonRepository;}

  @Override
  protected JpaSpecificationExecutor<ParametreEchantillonEntity> getSpecificationExecutor() {
    return parametreEchantillonRepository;
  }

  @Override
  protected JpaRepository<ParametreEchantillonEntity, String> getRepository() {
    return parametreEchantillonRepository;
  }

  @Override
  protected Function<ParametreEchantillonEntity, ParametreEchantillon> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<ParametreEchantillon, ParametreEchantillonEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<ParametreEchantillon> selectAll() {
    return parametreEchantillonRepository.selectAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public void deleteAll(List<String> ids) {
    parametreEchantillonRepository.deleteAllByReferenceIn(ids);
  }
}

package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.TarposRepository;
import fr.acoss.posdoc.database.entities.TarposEntity;
import fr.acoss.posdoc.database.mappers.TarposMapper;
import fr.acoss.posdoc.domain.tarpos.model.Tarpos;
import fr.acoss.posdoc.domain.tarpos.secondary.TarposPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class TarposPersistenceImpl extends AbstractObjectPersistence<TarposEntity, String, Tarpos>
    implements TarposPersistence {

  private static final TarposMapper MAPPER = TarposMapper.INSTANCE;

  private final TarposRepository tarposRepository;

  public TarposPersistenceImpl(TarposRepository tarposRepository) {this.tarposRepository = tarposRepository;}

  @Override
  protected JpaSpecificationExecutor<TarposEntity> getSpecificationExecutor() {
    return tarposRepository;
  }

  @Override
  protected JpaRepository<TarposEntity, String> getRepository() {
    return tarposRepository;
  }

  @Override
  protected Function<TarposEntity, Tarpos> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<Tarpos, TarposEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<Tarpos> selectAll() {
    return tarposRepository.findAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public List<Tarpos> selectAllWithAuthorisation() {
    return tarposRepository.selectAllTarposWithAuthorisation().stream().map(TarposMapper.INSTANCE::mapToTarpos).collect(Collectors.toList());
  }

  @Override
  public List<Tarpos> allTarposByPerimetreEqualToZero() {
    return tarposRepository.findTarposByPerimetre();
  }

  @Override
  public List<String> getTarifsByCompta() {
    return tarposRepository.findTarposByCompta().stream().map(TarposEntity::getType).collect(Collectors.toList());
  }

  @Override
  public void deleteAll(List<String> tarposTypes) {
    tarposRepository.deleteByTypeIn(tarposTypes);
  }
}

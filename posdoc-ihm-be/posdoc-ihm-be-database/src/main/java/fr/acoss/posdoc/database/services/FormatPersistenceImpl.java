package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.FormatRepository;
import fr.acoss.posdoc.database.entities.FormatEntity;
import fr.acoss.posdoc.database.mappers.FormatMapper;
import fr.acoss.posdoc.domain.format.model.Format;
import fr.acoss.posdoc.domain.format.secondary.FormatPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class FormatPersistenceImpl
    extends AbstractObjectPersistence<FormatEntity, String, Format>
    implements FormatPersistence {

  private static final FormatMapper FORMAT_MAPPER = FormatMapper.INSTANCE;

  private final FormatRepository formatRepository;

  public FormatPersistenceImpl(FormatRepository formatRepository) {
    this.formatRepository = formatRepository;
  }

  @Override
  protected JpaSpecificationExecutor<FormatEntity> getSpecificationExecutor() {
    return formatRepository;
  }

  @Override
  protected JpaRepository<FormatEntity, String> getRepository() {
    return formatRepository;
  }

  @Override
  protected Function<FormatEntity, Format> entityToDomainFunction() {
    return FORMAT_MAPPER::entityToDomain;
  }

  @Override
  protected Function<Format, FormatEntity> domainToEntityFunction() {
    return FORMAT_MAPPER::domainToEntity;
  }

  @Override
  public List<Format> selectAll() {
    return formatRepository.selectAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }
  @Override
  public void deleteAll(Iterable<String> ids) {
    formatRepository.deleteByCodeIn(ids);
  }

  @Override
  public boolean existsByType(String typeFormat) {
    return formatRepository.existsByType(typeFormat);
  }
}

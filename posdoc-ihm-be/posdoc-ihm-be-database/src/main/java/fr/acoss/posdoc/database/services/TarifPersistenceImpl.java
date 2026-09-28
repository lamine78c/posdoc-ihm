package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.TarifRepository;
import fr.acoss.posdoc.database.entities.TarifCompositeId;
import fr.acoss.posdoc.database.entities.TarifEntity;
import fr.acoss.posdoc.database.mappers.TarifMapper;
import fr.acoss.posdoc.domain.tarif.model.DeleteTarif;
import fr.acoss.posdoc.domain.tarif.model.Tarif;
import fr.acoss.posdoc.domain.tarif.model.TarifAlreadyExistsOnPeriodQuery;
import fr.acoss.posdoc.domain.tarif.secondary.TarifPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class TarifPersistenceImpl
    extends AbstractObjectPersistence<TarifEntity, TarifCompositeId, Tarif>
    implements TarifPersistence {

  private static final TarifMapper MAPPER = TarifMapper.INSTANCE;

  private final TarifRepository tarifRepository;

  public TarifPersistenceImpl(TarifRepository tarifRepository) {
    this.tarifRepository = tarifRepository;
  }

  @Override
  public void deletes(List<DeleteTarif> deleteTarifs) {
    tarifRepository.deleteByIdIn(
            deleteTarifs.stream()
                    .map(deleteTarif -> new TarifCompositeId(deleteTarif.getType(), deleteTarif.getNumero()))
                    .collect(Collectors.toList())
    );
  }

  @Override
  public boolean exists(String type, String numero) {
    return exists(new TarifCompositeId(type, numero));
  }

  @Override
  @Transactional
  public String nextNumero(final String typeTarif) {

    return tarifRepository.findFirstByIdTypeOrderByIdNumeroDesc(typeTarif).map(tarif ->
        Integer.parseInt(tarif.getId().getNumero()) + 1).map(nextNumero -> String
        .format("%04d", nextNumero)).orElse("0000");
  }

  @Override
  protected JpaSpecificationExecutor<TarifEntity> getSpecificationExecutor() {
    return tarifRepository;
  }

  @Override
  protected JpaRepository<TarifEntity, TarifCompositeId> getRepository() {
    return tarifRepository;
  }

  @Override
  protected Function<TarifEntity, Tarif> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<Tarif, TarifEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<Tarif> selectAll() {
    return tarifRepository.findAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public List<Tarif> selectByType(String type) {
    return tarifRepository.getTarifByType(type).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public void deleTarifsByTypes(List<String> types) {
    tarifRepository.deleteTarifEntitiesByTypes(types);
  }

  @Override
  public Boolean searchIfTarifExistsOnPeriod(TarifAlreadyExistsOnPeriodQuery query) {
    Integer tarifCount = tarifRepository.searchIfTarifExistsOnPeriod(query);
    return tarifCount > 0;
  }

}

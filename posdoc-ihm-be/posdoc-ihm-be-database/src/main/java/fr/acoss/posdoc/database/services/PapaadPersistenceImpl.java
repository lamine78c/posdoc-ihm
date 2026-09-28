package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.PapaadRepository;
import fr.acoss.posdoc.database.entities.PapaadCompositeIdEntity;
import fr.acoss.posdoc.database.entities.PapaadEntity;
import fr.acoss.posdoc.database.mappers.PapaadMapper;
import fr.acoss.posdoc.domain.papaad.model.Papaad;
import fr.acoss.posdoc.domain.papaad.model.PapaadCompositeId;
import fr.acoss.posdoc.domain.papaad.secondary.PapaadPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PapaadPersistenceImpl extends AbstractObjectPersistence<PapaadEntity, PapaadCompositeIdEntity, Papaad>
    implements PapaadPersistence {

  private static final PapaadMapper MAPPER = PapaadMapper.INSTANCE;

  private final PapaadRepository papaadRepository;

  public PapaadPersistenceImpl(PapaadRepository papaadRepository) {this.papaadRepository = papaadRepository;}

  @Override
  protected JpaSpecificationExecutor<PapaadEntity> getSpecificationExecutor() {
    return papaadRepository;
  }

  @Override
  protected JpaRepository<PapaadEntity, PapaadCompositeIdEntity> getRepository() {
    return papaadRepository;
  }

  @Override
  protected Function<PapaadEntity, Papaad> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<Papaad, PapaadEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }


  @Override
  public List<Papaad> updateAll(List<Papaad> papaads) {
    var entity = papaads.stream().map(e -> domainToEntityFunction().apply(e)).collect(Collectors.toList());
    return papaadRepository.saveAll(entity).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public boolean exists(String codeCommande, String codeFichier, String codeNotif) {
    return exists(new PapaadCompositeIdEntity(codeCommande, codeFichier, codeNotif));
  }

  @Override
  public List<Papaad> selectAll() {
    return papaadRepository.findAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public void deleteAll(Iterable<PapaadCompositeId> ids) {
    List<PapaadCompositeIdEntity> deletes = new ArrayList<>();
    ids.forEach(e-> deletes.add(new PapaadCompositeIdEntity(e.getCodeCommande(), e.getCodeFichier(), e.getCodeNotif())));
    papaadRepository.deleteByIdIn(deletes);
  }

}

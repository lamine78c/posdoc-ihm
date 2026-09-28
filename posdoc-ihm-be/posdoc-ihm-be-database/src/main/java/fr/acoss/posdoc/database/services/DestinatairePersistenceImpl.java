package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.database.dao.DestinataireRepository;
import fr.acoss.posdoc.database.entities.DestinataireCompositeId;
import fr.acoss.posdoc.database.entities.DestinataireEntity;
import fr.acoss.posdoc.database.mappers.DestinataireMapper;
import fr.acoss.posdoc.domain.destinataire.model.CodeDestinataireCodeOrg;
import fr.acoss.posdoc.domain.destinataire.model.Destinataire;
import fr.acoss.posdoc.domain.destinataire.model.DestinataireCompositeIdModel;
import fr.acoss.posdoc.domain.destinataire.model.DestinataireToAddNewExemplaire;
import fr.acoss.posdoc.domain.destinataire.secondary.DestinatairePersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class DestinatairePersistenceImpl extends AbstractObjectPersistence<DestinataireEntity, DestinataireCompositeId, Destinataire>
    implements DestinatairePersistence {

  private static final DestinataireMapper MAPPER = DestinataireMapper.INSTANCE;

  private final DestinataireRepository destinataireRepository;

  public DestinatairePersistenceImpl(final DestinataireRepository destinataireRepository) {
    this.destinataireRepository = destinataireRepository;
  }

  @Override
  protected JpaSpecificationExecutor<DestinataireEntity> getSpecificationExecutor() {
    return destinataireRepository;
  }

  @Override
  protected JpaRepository<DestinataireEntity, DestinataireCompositeId> getRepository() {
    return destinataireRepository;
  }

  @Override
  protected Function<DestinataireEntity, Destinataire> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<Destinataire, DestinataireEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public void deleteAll(Iterable<DestinataireCompositeIdModel> ids) {
    List<DestinataireCompositeId> toDeletes = new ArrayList<>();
    ids.forEach(e-> toDeletes.add(MAPPER.domainToEntity(e)));
    destinataireRepository.deleteByIdIn(toDeletes);
  }

  @Override
  public List<Destinataire> updateAll(List<Destinataire> destinataires) {
    var entity = destinataires.stream().map(e -> domainToEntityFunction().apply(e)).collect(Collectors.toList());
    return destinataireRepository.saveAll(entity).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  public boolean exists(String code, String codeOrg) {
    return exists(new DestinataireCompositeId(code, codeOrg));
  }

  @Override
  public List<Destinataire> selectAll() {
    return destinataireRepository.findAllDestins();
  }

  @Override
  public List<DestinataireToAddNewExemplaire> getDestinatairesToAddNewExemplaire(String codeOrg) {
    return destinataireRepository.getDestinatairesToAddNewExemplaire(codeOrg).stream().map(map -> {
      DestinataireToAddNewExemplaire destinataire = new DestinataireToAddNewExemplaire();
      destinataire.setCode(map.get(ParamsUtils.CODE));
      destinataire.setText(map.get(ParamsUtils.TEXT));
      return destinataire;
    }).collect(Collectors.toList());
  }

  @Override
  public List<String> getDestinatairesByOrgs(List<String> orgs) {
    return destinataireRepository.getDestinatairesByOrgs(orgs);
  }

  @Override
  public List<String> organismesExistsInDestinations(List<String> organismeCodes) {
    return destinataireRepository.organismesExistsInDestinations(organismeCodes);
  }

  @Override
  public List<CodeDestinataireCodeOrg> findAllCodeDestinsAndCodeOrg() {
    return destinataireRepository.findAllCodeDestinsAndCodeOrg().stream().map(DestinataireMapper.INSTANCE::mapToCodeDestinataireCodeOrg).collect(Collectors.toList());
  }

}

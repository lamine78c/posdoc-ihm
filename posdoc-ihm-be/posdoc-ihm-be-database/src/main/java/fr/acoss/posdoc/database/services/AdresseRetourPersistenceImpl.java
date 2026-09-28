package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.AdresseRetourRepository;
import fr.acoss.posdoc.database.dao.FichierRepository;
import fr.acoss.posdoc.database.entities.AdresseRetourCompositeId;
import fr.acoss.posdoc.database.entities.AdresseRetourEntity;
import fr.acoss.posdoc.database.entities.FichierEntity;
import fr.acoss.posdoc.database.mappers.AdresseRetourMapper;
import fr.acoss.posdoc.database.mappers.FichierMapper;
import fr.acoss.posdoc.domain.adresseretour.model.AdresseRetour;
import fr.acoss.posdoc.domain.adresseretour.model.AdresseRetourComposite;
import fr.acoss.posdoc.domain.adresseretour.secondary.AdresseRetourPersistence;
import fr.acoss.posdoc.domain.fichier.model.Fichier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AdresseRetourPersistenceImpl
    extends AbstractObjectPersistence<AdresseRetourEntity, AdresseRetourCompositeId, AdresseRetour>
    implements AdresseRetourPersistence {

  private static final AdresseRetourMapper MAPPER = AdresseRetourMapper.INSTANCE;

  private static final FichierMapper FICHIER_MAPPER = FichierMapper.INSTANCE;

  private final AdresseRetourRepository adresseRetourRepository;
  private final FichierRepository fichierRepository;

  public AdresseRetourPersistenceImpl(AdresseRetourRepository adresseRetourRepository, FichierRepository fichierRepository) {
    this.adresseRetourRepository = adresseRetourRepository;
    this.fichierRepository = fichierRepository;
  }

  @Override
  public void delete(String code, String codeOrganisme) {
    fichierRepository.setCodeAdrNullByFicAdr(code, codeOrganisme);
    delete(new AdresseRetourCompositeId(code, codeOrganisme));
  }

  @Override
  public boolean exists(String code, String codeOrganisme) {
    return exists(new AdresseRetourCompositeId(code, codeOrganisme));
  }


  @Override
  protected JpaSpecificationExecutor<AdresseRetourEntity> getSpecificationExecutor() {
    return adresseRetourRepository;
  }

  @Override
  protected JpaRepository<AdresseRetourEntity, AdresseRetourCompositeId> getRepository() {
    return adresseRetourRepository;
  }

  @Override
  protected Function<AdresseRetourEntity, AdresseRetour> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<AdresseRetour, AdresseRetourEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  public List<AdresseRetour> selectAll() {
    List<AdresseRetour> listAdresseRetour = adresseRetourRepository.findAllAdresseRetour();
    List<FichierEntity> fichiers = fichierRepository.getFichiersWithCodeAdr();
    List<AdresseRetour> adresseRetours = new ArrayList<>();
    listAdresseRetour.forEach(ad -> {
      if(Boolean.TRUE.equals(ad.getIsNotAuthorisedToBeDeleted())) {
        List<Fichier> fichiersAdr = new ArrayList<>();
        fichiers.forEach(f -> {
          if (f.getCodeAdr().equals(ad.getCode()) && f.getId().getCodeOrg().equals(ad.getCodeOrganisme())) {
            fichiersAdr.add(FICHIER_MAPPER.entityToDomain(f));
          }
        });
        ad.setFichiers(fichiersAdr);
      }
      adresseRetours.add(ad);
    });
    return adresseRetours;
  }

  @Override
  public List<AdresseRetour> updateAll(List<AdresseRetour> adressesRetour) {
    var entity = adressesRetour.stream().map(e -> domainToEntityFunction().apply(e)).collect(Collectors.toList());
    return adresseRetourRepository.saveAll(entity).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }
  @Override
  public void deleteAll(Iterable<AdresseRetourComposite> ids) {
    ids.forEach(e-> this.delete(e.getCode() , e.getCodeOrganisme()));
  }
}

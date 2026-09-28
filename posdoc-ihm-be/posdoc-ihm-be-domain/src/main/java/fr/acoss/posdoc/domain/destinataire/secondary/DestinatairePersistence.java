package fr.acoss.posdoc.domain.destinataire.secondary;

import fr.acoss.posdoc.domain.destinataire.model.CodeDestinataireCodeOrg;
import fr.acoss.posdoc.domain.destinataire.model.Destinataire;
import fr.acoss.posdoc.domain.destinataire.model.DestinataireCompositeIdModel;
import fr.acoss.posdoc.domain.destinataire.model.DestinataireToAddNewExemplaire;

import java.util.List;


public interface DestinatairePersistence {

  List<DestinataireToAddNewExemplaire> getDestinatairesToAddNewExemplaire(String codeOrg);

  List<String> getDestinatairesByOrgs(List<String> orgs);

  List<Destinataire> selectAll();

  Destinataire create(Destinataire destinataire);

  Destinataire update(Destinataire destinataire);

  List<Destinataire> updateAll(List<Destinataire> destinataires);

  void deleteAll(Iterable<DestinataireCompositeIdModel> ids);

  boolean exists(String code, String codeOrg);

  List<String> organismesExistsInDestinations(List<String> organismeCodes);

  List<CodeDestinataireCodeOrg> findAllCodeDestinsAndCodeOrg();
}

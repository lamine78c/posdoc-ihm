package fr.acoss.posdoc.domain.format.primary;

import fr.acoss.posdoc.domain.fichier.secondary.FichierPersistence;
import fr.acoss.posdoc.domain.format.model.Format;
import fr.acoss.posdoc.domain.format.secondary.FormatPersistence;
import fr.acoss.posdoc.domain.parametre.edition.secondary.ParametreEditionPersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.StileExistingElement;

import java.util.List;

import static fr.acoss.posdoc.domain.client.validators.ClientValidators.codeValidator;
import static fr.acoss.posdoc.domain.client.validators.ClientValidators.libelleValidator;

public class FormatService {

  public static final String FORMAT = "Format";
  public static final String FICHIER = "Fichier";
  public static final String PARAMETRES_EDITION = "Paramètres d'édition";
  public static final String FICHIER_PARAMETRES_EDITION1 = "Fichier et Paramètres d'édition";
  private final  FormatPersistence formatPersistence;
  private final FichierPersistence fichierPersistence;
  private final ParametreEditionPersistence parametreEditionPersistence;

  public FormatService(final FormatPersistence formatPersistence, final FichierPersistence fichierPersistence,
                       final ParametreEditionPersistence parametreEditionPersistence) {
    this.formatPersistence = formatPersistence;
    this.fichierPersistence = fichierPersistence;
    this.parametreEditionPersistence = parametreEditionPersistence;
  }

  public Format createFormat(final Format format) {

    codeValidator().validate(format.getCode());
    libelleValidator().validate(format.getLibelle());

    if (formatPersistence.exists(format.getCode())) {
      throw new AlreadyExistingElement(FORMAT, format.getCode());
    }

    return formatPersistence.create(format);
  }

  public Format updateFormat(final Format format) {

    codeValidator().validate(format.getCode());
    libelleValidator().validate(format.getLibelle());

    if (!formatPersistence.exists(format.getCode())) {
      throw new ElementNotFoundException(FORMAT, format.getCode());
    }

    return formatPersistence.create(format);
  }

  public void deleteFormats(List<String> formatCodes) {
    // vérification dépendance Fichier
    List<String> listFich = fichierPersistence.formatsExistsInFichiers(formatCodes);
    // vérification dépendance Paramètres d'éditions
    List<String> listPED = parametreEditionPersistence.formatsExistsInparametresEditions(formatCodes);
    if (!listFich.isEmpty() && !listPED.isEmpty()) {
      throw new StileExistingElement(FORMAT, formatCodes, FICHIER_PARAMETRES_EDITION1);
    } else if (!listFich.isEmpty()) {
      throw new StileExistingElement(FORMAT, formatCodes, FICHIER);
    } else if (!listPED.isEmpty()) {
      throw new StileExistingElement(FORMAT, formatCodes, PARAMETRES_EDITION);
    }
    formatPersistence.deleteAll(formatCodes);
  }

}

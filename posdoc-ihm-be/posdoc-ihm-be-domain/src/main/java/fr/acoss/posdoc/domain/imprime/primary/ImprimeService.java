package fr.acoss.posdoc.domain.imprime.primary;

import fr.acoss.posdoc.domain.fichier.secondary.FichierPersistence;
import fr.acoss.posdoc.domain.imprime.model.Imprime;
import fr.acoss.posdoc.domain.imprime.secondary.ImprimePersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.StileExistingElement;

import java.util.List;

import static fr.acoss.posdoc.domain.common.validator.CommonValidators.objectNotNullOrThrow;
import static fr.acoss.posdoc.domain.imprime.validators.ImprimeValidators.codeRNDValidator;
import static fr.acoss.posdoc.domain.imprime.validators.ImprimeValidators.libelleValidator;
import static fr.acoss.posdoc.domain.imprime.validators.ImprimeValidators.referenceValidator;
import static fr.acoss.posdoc.domain.imprime.validators.ImprimeValidators.typeCompositionValidator;
import static fr.acoss.posdoc.domain.imprime.validators.ImprimeValidators.typeCouleurValidator;

public class ImprimeService {

    private static final String IMPRIME = "Imprime";
    private static final String RECTO_VERSO = "rectoVerso";
    private static final String FICHIER = "Fichier";
    private final ImprimePersistence imprimePersistence;
    private final FichierPersistence fichierPersistence;

    public ImprimeService(
            final ImprimePersistence imprimePersistence,
            final FichierPersistence fichierPersistence
    ) {
        this.imprimePersistence = imprimePersistence;
        this.fichierPersistence = fichierPersistence;
    }

    public Imprime createImprime(final Imprime imprime) {
        referenceValidator().validate(imprime.getReference());
        libelleValidator().validate(imprime.getLibelle());
        codeRNDValidator().validate(imprime.getCodeRND());
        typeCompositionValidator().validate(imprime.getTypeComposition());
        typeCouleurValidator().validate(imprime.getTypeCouleur());
        objectNotNullOrThrow(RECTO_VERSO).validate(imprime.getRectoVerso());
        if (imprimePersistence.exists(imprime.getReference())) {
            throw new AlreadyExistingElement(IMPRIME, imprime.getReference());
        }
        return imprimePersistence.create(imprime);
    }

    public Imprime updateImprime(final Imprime imprime) {
        referenceValidator().validate(imprime.getReference());
        libelleValidator().validate(imprime.getLibelle());
        typeCompositionValidator().validate(imprime.getTypeComposition());
        typeCouleurValidator().validate(imprime.getTypeCouleur());
        objectNotNullOrThrow(RECTO_VERSO).validate(imprime.getRectoVerso());
        if (!imprimePersistence.exists(imprime.getReference())) {
            throw new ElementNotFoundException(IMPRIME, imprime.getReference());
        }
        return imprimePersistence.update(imprime);
    }

    public void deleteImprime(final String id) {
        imprimePersistence.delete(id);
    }

    public void deleteImprimes(final List<String> imprimeCodes) {
        // vérification dépendance Fichier
        List<String> listFich = fichierPersistence.imprimesExistsInFichiers(imprimeCodes);
        if (!listFich.isEmpty()) {
            throw new StileExistingElement(IMPRIME, imprimeCodes, FICHIER);
        }
        imprimePersistence.deleteAll(imprimeCodes);
    }
}

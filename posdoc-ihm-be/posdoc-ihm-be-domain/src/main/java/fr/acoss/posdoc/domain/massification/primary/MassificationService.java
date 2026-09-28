package fr.acoss.posdoc.domain.massification.primary;
import fr.acoss.posdoc.domain.massification.model.MassificationMessage;
import fr.acoss.posdoc.domain.massification.model.SearchMassificationQuery;
import fr.acoss.posdoc.domain.site.model.SiteCNP;
import fr.acoss.posdoc.domain.site.secondary.SiteCNPPersistence;
import fr.acoss.posdoc.domain.massification.model.MassificationUpdate;
import fr.acoss.posdoc.exceptions.CustomExceptionMessage;
import fr.acoss.posdoc.domain.massification.model.MassificationSearch;
import fr.acoss.posdoc.domain.massification.secondary.MassificationPersistence;
import fr.acoss.posdoc.domain.parametre.secondary.ParametrePersistence;

import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.List;

import static fr.acoss.posdoc.types.Parametre.PARAM_CODE_MASAPP;

public class MassificationService {

    private static final String MASIND = "MASIND";
    private static final String CONFIRMEZ_LA_MASSIFICATION = "Confirmez la massification";
    private static final String CONFIRMEZ_LA_SIMULATION = "Confirmez la simulation de la massification";
    private static final String AVEC_LA_PERIODE_GENEREE = "avec la période générée";
    private static final String SPACE = " ";
    private static final String UNDERSCORE = "_";
    private static final String DASH = "-";
    private static final String ZERO = "0";
    private static final String EMPTY = "";
    private static final String LAST_SERIAL_NBR = "ZZ";
    private static final String PERCENT = "%";

    private final MassificationPersistence massificationPersistence;
    private final ParametrePersistence parametrePersistence;
    private final SiteCNPPersistence siteCNPPersistence;

    public MassificationService(
            MassificationPersistence massificationPersistence,
            ParametrePersistence parametrePersistence,
            SiteCNPPersistence siteCNPPersistence
    ) {
        this.massificationPersistence = massificationPersistence;
        this.parametrePersistence = parametrePersistence;
        this.siteCNPPersistence = siteCNPPersistence;
    }

    public List<MassificationSearch> searchForMassification(SearchMassificationQuery query) {
        String codegam = parametrePersistence.getCodeGamme();

       return massificationPersistence.searchForMassification(query, codegam);
    }

    public List<MassificationSearch> updateMassification(List<MassificationUpdate> data, String codsit) {
        String codegam = parametrePersistence.getCodeGamme();
        return massificationPersistence.updateMassification(data, codsit, codegam);
    }

    public boolean deleteMassification(List<MassificationSearch> data) {
        return massificationPersistence.deleteMassification(data);
    }

    public MassificationMessage getMassificationMessage(String codenv, String typtar, String codsit, Boolean isTarifUrgent) {
        String masapp = this.parametrePersistence.getValueByCode(PARAM_CODE_MASAPP);
        SiteCNP sitecnp = this.siteCNPPersistence.findById(codsit);
        if(sitecnp == null) {
            throw new CustomExceptionMessage("Impossible de trouve le site : "+codsit);
        }
        String masorg = sitecnp.getOrganismeMassification();
        String applis = codenv + UNDERSCORE + masorg + UNDERSCORE + masapp;
        String percod = this.getPercodForMassification(codenv, masorg, masapp);
        String message;
        if (Boolean.TRUE.equals(isTarifUrgent)) {
            message = CONFIRMEZ_LA_MASSIFICATION + SPACE + applis + SPACE + AVEC_LA_PERIODE_GENEREE + SPACE + percod +
                    SPACE + "et les tarifs urgents";
        } else if (typtar.isEmpty()) {
            message = CONFIRMEZ_LA_MASSIFICATION + SPACE + applis + SPACE + AVEC_LA_PERIODE_GENEREE + SPACE + percod +
                    SPACE + "et les tarifs par défaut";
        } else {
            message = CONFIRMEZ_LA_MASSIFICATION + SPACE + applis + SPACE + AVEC_LA_PERIODE_GENEREE + SPACE + percod +
                    SPACE + "et le tarif spécial" + SPACE + typtar;
        }
        return MassificationMessage.builder()
                .message(message)
                .codenv(codenv)
                .codorg(masorg)
                .codapp(masapp)
                .percod(percod)
                .build();
    }

    public MassificationMessage getSimulationMessage(String codenv, String codsit) {
        String masapp = this.parametrePersistence.getValueByCode(PARAM_CODE_MASAPP);
        SiteCNP sitecnp = this.siteCNPPersistence.findById(codsit);
        if(sitecnp == null) {
            throw new CustomExceptionMessage("Impossible de trouve le site : "+codsit);
        }
        String masorg = sitecnp.getOrganismeMassification();
        String applis = codenv + UNDERSCORE + masorg + UNDERSCORE + masapp;
        String percod = this.getPercodForMassification(codenv, masorg, masapp);
        return MassificationMessage.builder()
                .message(CONFIRMEZ_LA_SIMULATION + SPACE + applis + SPACE + AVEC_LA_PERIODE_GENEREE + SPACE + percod)
                .codenv(codenv)
                .codorg(masorg)
                .codapp(masapp)
                .percod(percod)
                .build();
    }

    public String getPercodForMassification(String codenv, String masorg, String masapp) {
        String percod = this.massificationPersistence.findPercodForMassification(
                codenv,
                masorg,
                masapp,
                this.getPercod() + PERCENT
        ).stream().max(String::compareTo).orElse(null);
        if (percod != null && !percod.isEmpty()) {
            // Get the last two characters
            String lastPercod = percod.substring(7, 9);
            // Check if we are in the last serial number
            if (lastPercod.equals(LAST_SERIAL_NBR)) {
                throw new CustomExceptionMessage("Impossible de créer une nouvelle période codifiée...");
            }
            String incrementedPercod = incrementTwoChars(lastPercod);

            // Append the incremented characters to Percod
            return this.getPercod() + DASH + incrementedPercod;
        } else {
            return this.getPercod() + DASH + this.parametrePersistence.getValueByCode(MASIND);
        }
    }

    private String getPercod() {
        GregorianCalendar calJour = new GregorianCalendar();
        int aa = calJour.get(Calendar.YEAR) - 2000;
        int mm = calJour.get(Calendar.MONTH) + 1;
        int jj = calJour.get(Calendar.DAY_OF_MONTH);
        return aa + (mm < 10 ? ZERO : EMPTY) + mm + (jj < 10 ? ZERO : EMPTY) + jj;
    }

    // Function to increment two characters in base-36 system
    private static String incrementTwoChars(String input) {
        // Convert input to base-36 number
        int base36Number = Integer.parseInt(input.toLowerCase(), 36);
        // Increment the base-36 number
        base36Number++;
        // Convert the incremented number back to base-36
        String incrementedString = Integer.toString(base36Number, 36);
        // Pad the result to ensure it has 2 characters
        if (incrementedString.length() < 2) {
            incrementedString = ZERO + incrementedString;
        }
        return incrementedString.substring(0, 2).toUpperCase();
    }
}


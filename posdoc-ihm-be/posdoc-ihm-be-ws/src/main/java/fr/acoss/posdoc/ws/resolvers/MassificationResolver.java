package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.common.util.StringUtils;
import fr.acoss.posdoc.domain.massification.model.MassificationMessage;
import fr.acoss.posdoc.domain.massification.model.MassificationPool;
import fr.acoss.posdoc.domain.massification.model.MassificationSearch;
import fr.acoss.posdoc.domain.massification.model.MassificationUpdate;
import fr.acoss.posdoc.domain.massification.model.OptionFields;
import fr.acoss.posdoc.domain.massification.model.SearchMassificationQuery;
import fr.acoss.posdoc.domain.massification.primary.MassificationService;
import fr.acoss.posdoc.domain.massification.secondary.MassificationPersistence;
import fr.acoss.posdoc.domain.message.model.ExpMassification;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;
import fr.acoss.posdoc.exceptions.MassificationNotUniqueException;
import fr.acoss.posdoc.service.BilanPDFService;
import fr.acoss.posdoc.service.adelaide.DeleteMassificationAdelaideService;
import fr.acoss.posdoc.service.adelaide.MassificationAdelaideService;
import fr.acoss.posdoc.service.adelaide.SimulationAdelaideService;
import fr.acoss.posdoc.service.adelaide.impl.AdelaideUtil;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideResult;
import fr.acoss.posdoc.ws.aop.annotation.Action;
import fr.acoss.posdoc.ws.aop.annotation.Historisable;
import fr.acoss.posdoc.ws.resolvers.payloads.DeleteMassificationPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.MassificationResultPayloadDTO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class MassificationResolver extends AbstractResolver {

    private final MassificationService massificationService;
    private final MassificationPersistence searchForMassificationPersistence;
    private final MassificationAdelaideService massifierAdelaideService;
    private final SimulationAdelaideService simulerAdelaideService;
    private final DeleteMassificationAdelaideService deleteMassificationAdelaideService;
    private final BilanPDFService bilanPDFService;

    public MassificationResolver(
            final MassificationService massificationService,
            final MassificationPersistence searchForMassificationPersistence,
            final MassificationAdelaideService massifierAdelaideService,
            final DeleteMassificationAdelaideService deleteMassificationAdelaideService,
            final SimulationAdelaideService simulerAdelaideService,
            final BilanPDFService bilanPDFService
    ) {
        this.massificationService = massificationService;
        this.searchForMassificationPersistence = searchForMassificationPersistence;
        this.massifierAdelaideService = massifierAdelaideService;
        this.simulerAdelaideService = simulerAdelaideService;
        this.deleteMassificationAdelaideService = deleteMassificationAdelaideService;
        this.bilanPDFService = bilanPDFService;
    }

    public List<OptionFields> getDistinctFieldsFromTmpMasGenFicGenProOrg() {
        return this.searchForMassificationPersistence.getDistinctFieldsFromTmpMasGenFicGenProOrg();
    }

    public List<MassificationSearch> searchForMassification(SearchMassificationQuery query) {
        return this.massificationService.searchForMassification(query);
    }

    public List<MassificationPool> getPoolElementsForMassification(final List<String> masfics) {
        return this.searchForMassificationPersistence.getPoolElementsForMassification(masfics);
    }

    @Historisable(form = "Exploitation éditique > Massifications", action = Action.UPDATE)
    public List<MassificationSearch> updateMassification(final List<MassificationUpdate> data, String codsit) {
        return this.massificationService.updateMassification(data, codsit);
    }

    @Historisable(form = "Exploitation éditique > Massifications", action = Action.DELETE)
    public DeleteMassificationPayloadDTO deleteMassification(final List<MassificationSearch> data) {
        boolean success = this.massificationService.deleteMassification(data);
        AdelaideResult result = this.deleteMassificationAdelaideService.delete(data);
        String error = (result != null) ? result.getError() : null;
        return new DeleteMassificationPayloadDTO(success, error);
    }

    public MassificationResultPayloadDTO massifierFiles(final List<ExpMassification> massifications) {
        String pdfBase64 = this.bilanPDFService.generateAndSaveBilan(massifications, "massification");
        UtiLog utiLog;
        try {
            ExpMassification massificationRequest = convertExpMassificationsToExpMassification(massifications);
            utiLog = this.massifierAdelaideService.massifier(massificationRequest);
        } catch (Exception e) {
            utiLog = UtiLog.builder()
                    .codulo(0)
                    .codsta("")
                    .codusr("")
                    .formid("")
                    .action("")
                    .erreur(e.getMessage())
                    .build();
        }
        return new MassificationResultPayloadDTO(utiLog, pdfBase64);
    }

    public MassificationResultPayloadDTO simulerFiles(final List<ExpMassification> massifications) {
        String pdfBase64 = this.bilanPDFService.generateAndSaveBilan(massifications, "simulation");
        UtiLog utiLog;
        try {
            ExpMassification massificationRequest = convertExpMassificationsToExpMassification(massifications);
            utiLog = this.simulerAdelaideService.simuler(massificationRequest);
        } catch (Exception e) {
            utiLog = UtiLog.builder()
                    .codulo(0)
                    .codsta("")
                    .codusr("")
                    .formid("")
                    .action("")
                    .erreur(e.getMessage())
                    .build();
        }
        return new MassificationResultPayloadDTO(utiLog, pdfBase64);
    }

    private static @NotNull ExpMassification convertExpMassificationsToExpMassification(final List<ExpMassification> massifications) {
        if (!checkUniqueMassification(massifications)){
            throw new MassificationNotUniqueException("Erreur, il ne devrait pas y avoir plusieurs pools de massification dans une demande.");
        }
        ExpMassification request = new ExpMassification();
        BeanUtils.copyProperties(massifications.get(0), request, "listeFic");
        // Utilisation des Streams pour concaténer les 'listeFic' des massifications avec un séparateur
        String listFile = massifications.stream()
                .map(ExpMassification::getListeFic)  // Récupère 'listeFic' de chaque élément
                .collect(Collectors.joining(String.valueOf(AdelaideUtil.CAR_CHAMP))); // Concatène avec un séparateur
        request.setListeFic(listFile);
        return request;
    }

    private static boolean checkUniqueMassification(final List<ExpMassification> massifications){
        if (massifications == null || massifications.size() <2 ){
            return true;
        }
        String firstFile = massifications.get(0).getListeFic();
        int sizePool = firstFile.indexOf(StringUtils.UNDERSCORE,firstFile.indexOf(StringUtils.UNDERSCORE)+1);
        String pool = massifications.get(0).getListeFic().substring(0,sizePool);
        return massifications.stream().allMatch(s -> s.getListeFic().length() > sizePool && s.getListeFic().startsWith(pool));
    }


    public MassificationMessage getMassificationMessage(final String codenv, final String typtar, final String codsit, final Boolean isTarifUrgent) {
        return this.massificationService.getMassificationMessage(codenv, typtar, codsit, isTarifUrgent);
    }

    public MassificationMessage getSimulationMessage(final String codenv, final String codsit) {
        return this.massificationService.getSimulationMessage(codenv, codsit);
    }
}

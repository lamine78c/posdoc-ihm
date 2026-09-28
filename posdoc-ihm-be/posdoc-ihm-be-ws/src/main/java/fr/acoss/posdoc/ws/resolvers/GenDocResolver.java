package fr.acoss.posdoc.ws.resolvers;

import fr.acoss.posdoc.common.util.ConvertorUtils;
import fr.acoss.posdoc.domain.gendoc.model.DocDemOccurrenceApplication;
import fr.acoss.posdoc.domain.gendoc.model.DocVideoInformationDetail;
import fr.acoss.posdoc.domain.gendoc.model.GenDocOrgAppCom;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocDemOccurrenceApplicationQuery;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocDemQuery;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocVideoInfoDetailQuery;
import fr.acoss.posdoc.domain.gendoc.model.SearchDocVideoQuery;
import fr.acoss.posdoc.domain.gendoc.secondary.GenDocPersistence;
import fr.acoss.posdoc.types.ErrorMessages;
import fr.acoss.posdoc.ws.mappers.GenDocMapper;
import fr.acoss.posdoc.ws.resolvers.payloads.DocDematerialisePayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DocVideoInfoDetailPayloadDTO;
import fr.acoss.posdoc.ws.resolvers.payloads.DocVideoPayloadDTO;
import org.hibernate.service.spi.ServiceException;
import org.springframework.stereotype.Component;

import javax.persistence.EntityNotFoundException;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class GenDocResolver extends AbstractQueryResolver {

    private static final GenDocMapper MAPPER = GenDocMapper.INSTANCE;

    private final GenDocPersistence genDocPersistence;

    public GenDocResolver(GenDocPersistence genDocPersistence) {
        this.genDocPersistence = genDocPersistence;
    }

    public List<DocDematerialisePayloadDTO> getDocsDematerialises(SearchDocDemQuery query) {
        return genDocPersistence.findByCriteres(query)
                .stream().map(MAPPER::domainToPayloadDTO).collect(Collectors.toList());
    }

    public List<DocVideoPayloadDTO> getDocsDematerialisesVideo(SearchDocVideoQuery query) {
        if (!query.getDatdem().isEmpty()) {
            query.setDatdem(ConvertorUtils.convertDateToDatdem(query.getDatdem()));
        }

        return genDocPersistence.findByVideoCriteres(query)
                .stream().map(MAPPER::domain2ToPayloadDTO).collect(Collectors.toList());
    }

    public DocVideoInfoDetailPayloadDTO getDocsDematerialisesVideoInfoDetail(SearchDocVideoInfoDetailQuery query) {
        // Validation des paramètres obligatoires
        if (query == null) {
            throw new IllegalArgumentException(ErrorMessages.QUERY_NULL);
        }

        // Validation et conversion de la date
        if (query.getDatdem() == null || query.getDatdem().isEmpty()) {
            throw new IllegalArgumentException(ErrorMessages.DATDEM_REQUIRED);
        }
        if (query.getNumdem() == null) {
            throw new IllegalArgumentException(ErrorMessages.NUMDEM_REQUIRED);
        }

        try {
            // Conversion de la date
            String convertedDatdem = ConvertorUtils.convertDateToDatdem(query.getDatdem());
            query.setDatdem(convertedDatdem);

            // Récupération et conversion des données
            DocVideoInformationDetail domainResult = genDocPersistence.findByVideoInfoDetailCriteres(query);
            if (domainResult == null) {
                throw new EntityNotFoundException(ErrorMessages.DOCUMENT_NOT_FOUND);
            }

            return MAPPER.domainVideoToPayloadDTO(domainResult);

        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException(ErrorMessages.DATDEM_INVALID, e);
        } catch (Exception e) {
            throw new ServiceException(ErrorMessages.RETRIEVAL_ERROR, e);
        }
    }

    public List<DocDemOccurrenceApplication> getDocDemOccurrenceApplication(SearchDocDemOccurrenceApplicationQuery query) {
        return this.genDocPersistence.getDocDemOccurrenceApplication(query);
    }

    public List<GenDocOrgAppCom> getDistinctOrgAppComFromGendoc() {
        return this.genDocPersistence.getDistinctOrgAppComFromGendoc();
    }
}

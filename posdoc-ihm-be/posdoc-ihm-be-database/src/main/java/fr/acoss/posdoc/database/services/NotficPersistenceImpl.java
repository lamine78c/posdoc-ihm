package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.ConvertorUtils;
import fr.acoss.posdoc.common.util.DateUtils;
import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.database.dao.GenFicRepository;
import fr.acoss.posdoc.database.dao.NotficRepository;
import fr.acoss.posdoc.database.entities.NotficEntity;
import fr.acoss.posdoc.database.mappers.NotficMapper;
import fr.acoss.posdoc.domain.notfic.model.FindNoticeDetailsByFichierPayload;
import fr.acoss.posdoc.domain.notfic.model.NotFic;
import fr.acoss.posdoc.domain.notfic.model.NotFicCompositeId;
import fr.acoss.posdoc.domain.notfic.model.NotficFichier;
import fr.acoss.posdoc.domain.notfic.model.NoticeDetailDTO;
import fr.acoss.posdoc.domain.notfic.model.NoticesFichiersDTO;
import fr.acoss.posdoc.domain.notfic.model.SearchNoticesFichiersPayload;
import fr.acoss.posdoc.domain.notfic.model.SearchNotficQuery;
import fr.acoss.posdoc.domain.notfic.model.UpdateNotficsPayload;
import fr.acoss.posdoc.domain.notfic.secondary.NotficPersistence;
import fr.acoss.posdoc.types.LogMessages;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class NotficPersistenceImpl extends AbstractObjectPersistence<NotficEntity, String, NotFic>
        implements NotficPersistence  {


    private final NotficRepository notficRepository;
    private final GenFicRepository genFicRepository;

    private static final NotficMapper MAPPER = NotficMapper.INSTANCE;

    private static final Logger LOGGER = LoggerFactory.getLogger(NotficPersistenceImpl.class);

    public NotficPersistenceImpl(NotficRepository notficRepository, GenFicRepository genFicRepository) {
        this.notficRepository = notficRepository;
        this.genFicRepository = genFicRepository;
    }

    @Override
    protected JpaSpecificationExecutor<NotficEntity> getSpecificationExecutor() {
        return notficRepository;
    }

    @Override
    protected JpaRepository<NotficEntity, String> getRepository() {
        return notficRepository;
    }

    @Override
    protected Function<NotficEntity, NotFic> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<NotFic, NotficEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

    @Override
    public List<NotficFichier> findNotficByParam(SearchNotficQuery searchNotficQuery) {
         List<Map<String, String>> resultMap = notficRepository.findNotficWithFichie(searchNotficQuery);

        if (resultMap.isEmpty()) {
            LOGGER.warn(LogMessages.NO_NOTFIC_FOUND);
        }
        return resultMap.stream().map(this::mapToNotficFichier).collect(Collectors.toList());
    }

    @Override
    public List<NotficFichier> updateNotfic(UpdateNotficsPayload query) {
        Date dnotid = convertToDate(query.getDnotid());
        Date dnotit = convertToDate(query.getDnotit());

        notficRepository.updateNotfic(query, dnotid, dnotit);

        return getNotficUpdated(query);
    }

    private Date convertToDate(String localDate) {
        if (localDate == null) {
            return null;
        }
        return DateUtils.getDateFromLocalDateTime(
                DateUtils.getDateAtStartOfDay(localDate)
        );
    }

    @Override
    public List<NotficFichier> updateNotfics(List<UpdateNotficsPayload> notifcs) {
        List<NotficFichier> allUpdatedNotfics = new ArrayList<>();

        for (UpdateNotficsPayload notifc : notifcs) {
            List<NotficFichier> updatedNotfics = updateNotfic(notifc);
            allUpdatedNotfics.addAll(updatedNotfics);
        }

        return allUpdatedNotfics;
    }

    private List<NotficFichier> getNotficUpdated(UpdateNotficsPayload query) {
        SearchNotficQuery searchQuery = new SearchNotficQuery();
        searchQuery.setCodnot(query.getCodnot());
        searchQuery.setCodenv(query.getCodenv());
        searchQuery.setCodorg(List.of(query.getCodorg()));
        searchQuery.setCodapp(query.getCodapp());
        searchQuery.setCodcom(query.getCodcom());
        searchQuery.setCodfic(List.of(query.getCodfic()));

        return findNotficByParam(searchQuery);
    }

    @Override
    public void deleteNotfic(NotFicCompositeId query) {
        notficRepository.deleteNotfic(query);
    }

    @Override
    public void deleteNotfics(List<NotFicCompositeId> notficIds) {
        notficIds.forEach(notficRepository::deleteNotfic);
    }

    private NotficFichier mapToNotficFichier(Map<String, String> map) {
        return NotficFichier.builder()
                .codenv(map.get(ParamsUtils.CODENV))
                .codorg(map.get(ParamsUtils.CODORG))
                .codapp(map.get(ParamsUtils.CODAPP))
                .codcom(map.get(ParamsUtils.CODCOM))
                .codfic(map.get(ParamsUtils.CODFIC))
                .codeProd(map.get(ParamsUtils.CODPRD))
                .refImprime(map.get(ParamsUtils.REFIMP))
                .maxnot(ConvertorUtils.convertToInteger(map.get(ParamsUtils.MAXNOT)))
                .dnotid(map.get(ParamsUtils.DNOTID))
                .dnotit(map.get(ParamsUtils.DNOTIT))
                .build();
    }

    @Override
    public List<NotFic> affectationNotfic(List<NotFic> notFicList) {
        List<NotficEntity> listEntityToSave = new ArrayList<>();
        var zero = new BigDecimal(0);
        notFicList.forEach( notFic -> {
            NotFicCompositeId id = MAPPER.domainToCompositeId(notFic);
            // ne pas modifier les notfic existants
            if(notficRepository.isNotExistByCompositeId(id)) {
                notFic.setMaxnot(zero);
                notFic.setCurnot(zero);
                listEntityToSave.add(domainToEntityFunction().apply(notFic));
            }
        });
        return notficRepository.saveAll(listEntityToSave).stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public List<NoticesFichiersDTO> findNoticesFichiers(SearchNoticesFichiersPayload payload) {
        String masapp = genFicRepository.findValueByCodeMASAPP();
        // Utilise une liste vide plutôt que null dans les requêtes natives
        if (payload.getCodorg() == null) {
            payload.setCodorg(Collections.emptyList());
        }
        if (payload.getCodfic() == null) {
            payload.setCodfic(Collections.emptyList());
        }
        List<Map<String, String>> resultMap = notficRepository.findNoticesFichiers(payload, masapp);

        if (resultMap.isEmpty()) {
            LOGGER.warn("No notices fichiers found");
        }

        return resultMap.stream().map(this::mapToNoticesFichiersDTO).collect(Collectors.toList());
    }

    private NoticesFichiersDTO mapToNoticesFichiersDTO(Map<String, String> map) {
        Object noticesObj = map.get("notices");
        String noticesStr = noticesObj != null ? String.valueOf(noticesObj) : null;
        List<String> noticesList = (noticesStr != null && !noticesStr.isEmpty())
                ? java.util.Arrays.asList(noticesStr.split(","))
                : new ArrayList<>();

        return NoticesFichiersDTO.builder()
                .codenv(getString(map, ParamsUtils.CODENV))
                .codorg(getString(map, ParamsUtils.CODORG))
                .codapp(getString(map, ParamsUtils.CODAPP))
                .codcom(getString(map, ParamsUtils.CODCOM))
                .codfic(getString(map, ParamsUtils.CODFIC))
                .codeProd(getString(map, ParamsUtils.CODPRD))
                .refImprime(getString(map, ParamsUtils.REFIMP))
                .notices(noticesList)
                .build();
    }

    private String getString(Map<String, String> map, String key) {
        Object value = map.get(key);
        return value != null ? String.valueOf(value) : null;
    }

    @Override
    public List<NoticeDetailDTO> findNoticeDetailsByFichier(
            FindNoticeDetailsByFichierPayload payload) {
        List<Map<String, Object>> resultMap = notficRepository.findNoticeDetailsByFichier(payload);

        if (resultMap.isEmpty()) {
            LOGGER.warn("No notice details found for fichier: {}/{}/{}/{}/{}",
                payload.getCodenv(), payload.getCodorg(), payload.getCodapp(),
                payload.getCodcom(), payload.getCodfic());
        }

        return resultMap.stream().map(this::mapToNoticeDetailDTO).collect(Collectors.toList());
    }

    private NoticeDetailDTO mapToNoticeDetailDTO(Map<String, Object> map) {
        Object poidsObj = map.get("poids");
        BigDecimal poids = null;
        if (poidsObj != null) {
            if (poidsObj instanceof BigDecimal) {
                poids = (BigDecimal) poidsObj;
            } else {
                poids = ConvertorUtils.convertToBigDecimal(poidsObj.toString());
            }
        }

        return NoticeDetailDTO.builder()
                .codeNotice(ConvertorUtils.convertToString(map.get("codenotice")))
                .format(ConvertorUtils.convertToString(map.get("format")))
                .poids(poids)
                .portee(ConvertorUtils.convertToString(map.get("portee")))
                .dateDebut(DateUtils.convertDateToLocalDate((Date) map.get("datedebut")))
                .dateFin(DateUtils.convertDateToLocalDate((Date) map.get("datefin")))
                .build();
    }
}

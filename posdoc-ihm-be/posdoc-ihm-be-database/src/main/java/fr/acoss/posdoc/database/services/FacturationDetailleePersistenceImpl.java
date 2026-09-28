package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.ConvertorUtils;
import fr.acoss.posdoc.common.util.DateUtils;
import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.common.util.StringUtils;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.database.dao.ClientRepository;
import fr.acoss.posdoc.database.dao.GenFicRepository;
import fr.acoss.posdoc.database.dao.GenTarRepository;
import fr.acoss.posdoc.database.dao.HistoryRepository;
import fr.acoss.posdoc.database.dao.OrganismeRepository;
import fr.acoss.posdoc.database.entities.ClientEntity;
import fr.acoss.posdoc.database.entities.GenTarCompositeId;
import fr.acoss.posdoc.database.entities.GenTarEntity;
import fr.acoss.posdoc.database.entities.HistoryEntity;
import fr.acoss.posdoc.database.mappers.GenTarMapper;
import fr.acoss.posdoc.domain.facturationdetaillee.model.ConsolidationFacturation;
import fr.acoss.posdoc.domain.facturationdetaillee.model.ConsolidationFacturationDTO;
import fr.acoss.posdoc.domain.facturationdetaillee.model.FacturationDetaillee;
import fr.acoss.posdoc.domain.facturationdetaillee.model.FacturationDetailleeDTO;
import fr.acoss.posdoc.domain.facturationdetaillee.model.GenTar;
import fr.acoss.posdoc.domain.facturationdetaillee.model.UpdateConsolidationFacturation;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.SearchConsolidationFacturationQuery;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.SearchFacturationDetailleeQuery;
import fr.acoss.posdoc.domain.facturationdetaillee.secondary.FacturationDetailleePersistence;
import fr.acoss.posdoc.exceptions.StileExistingElement;
import fr.acoss.posdoc.types.MyslogAction;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class FacturationDetailleePersistenceImpl
        extends AbstractObjectPersistence<GenTarEntity, GenTarCompositeId, GenTar>
        implements FacturationDetailleePersistence {

    private static final int FIELD_CONDITION_MAX_LENGTH = 255;

    @Value("${" + StringUtils.QUERY_RESULTS_MAX_SIZE + "}")
    private int maxSize;

    private static final GenTarMapper MAPPER = GenTarMapper.INSTANCE;

    private static final String SELECT_FROM_GENFIC = "SELECT gf.c15_codorg as codorg, gf.c15_codcom as codcom, gf.c15_codfic as codfic, gf.n15_pagfic as pagfic, gf.c15_numcom as numcom, " +
            "   CAST(gf.d15_dfiexp as varchar) as dfiexp, string_agg(gt.c45_typtar, ',') as typtar, string_agg(CAST(gt.n45_nbplis as varchar), ',') as nbplis, " +
            "   string_agg(CAST(gt.n45_coutot as varchar), ',') as coutot, gf.c15_codapp as codapp, o.s00_codreg as codreg, " +
            "   gf.s15_codcli as codcli, gf.s15_codsit as codsit, gf.c15_percod as percod, gf.s15_libfic as libfic " +
            "FROM genfic gf ";
    private static final String INNER_JOIN_GENTAR = "INNER JOIN gentar gt ON gf.c15_codfic = gt.c45_codfic " +
            "   AND gf.c15_numcom = gt.c45_numcom AND gf.c15_codcom = gt.c45_codcom " +
            "   AND gf.c15_percod = gt.c45_percod AND gf.c15_codapp = gt.c45_codapp " +
            "   AND gf.c15_codorg = gt.c45_codorg AND gf.c15_codenv = gt.c45_codenv ";
    private static final String INNER_JOIN_ORGANISME_FOR_GENFIC = "INNER JOIN organi o ON gf.c15_codorg = o.c00_codorg ";
    private static final String SELECT_FROM_HISFIC = "SELECT hf.c22_codorg as codorg, hf.c22_codcom as codcom, hf.c22_codfic as codfic, hf.n22_pagfic as pagfic, hf.c22_numcom as numcom, " +
            "   CAST(hf.d22_dfiexp as varchar) as dfiexp, string_agg(ht.c46_typtar, ',') as typtar, string_agg(CAST(ht.n46_nbplis as varchar), ',') as nbplis, " +
            "   string_agg(CAST(ht.n46_coutot as varchar), ',') as coutot, hf.c22_codapp as codapp, o.s00_codreg as codreg, " +
            "   hf.s22_codcli as codcli, hf.s22_codsit as codsit, hf.c22_percod as percod,  hf.s22_libfic as libfic " +
            "FROM hisfic hf ";
    private static final String INNER_JOIN_HISTAR = "INNER JOIN histar ht ON hf.c22_codfic = ht.c46_codfic " +
            "   AND hf.c22_numcom = ht.c46_numcom AND hf.c22_codcom = ht.c46_codcom " +
            "   AND hf.c22_percod = ht.c46_percod AND hf.c22_codapp = ht.c46_codapp " +
            "   AND hf.c22_codorg = ht.c46_codorg AND hf.c22_codenv = ht.c46_codenv ";
    private static final String INNER_JOIN_ORGANISME_FOR_HISFIC = "INNER JOIN organi o ON hf.c22_codorg = o.c00_codorg ";
    private static final String GENFIC_WHERE_CLAUSE = "WHERE D15_Dfiexp >= TO_DATE(:dfiexpDeb, 'YYYY-MM-DD') AND D15_Dfiexp <= TO_DATE(:dfiexpFin, 'YYYY-MM-DD') " +
            "AND (:codenv IS NULL OR C15_Codenv = CAST(:codenv as varchar)) " +
            "AND (:codapp IS NULL OR C15_Codapp = CAST(:codapp as varchar)) " +
            "AND (:codcom IS NULL OR UPPER(C15_Codcom) LIKE CAST(:codcom as varchar)) " +
            "AND (:codfic IS NULL OR UPPER(C15_Codfic) LIKE CAST(:codfic as varchar)) " +
            "AND (:codsit IS NULL OR S15_Codsit LIKE CAST(:codsit as varchar)) " +
            "AND C15_Codorg IN (:codorgs) " +
            "AND S15_Codcli IN (:codclis) " +
            "AND C45_Typtar IN (:typtars) ";
    private static final String HISFIC_WHERE_CLAUSE = "WHERE D22_Dfiexp >= TO_DATE(:dfiexpDeb, 'YYYY-MM-DD') AND D22_Dfiexp <= TO_DATE(:dfiexpFin, 'YYYY-MM-DD') " +
            "AND (:codenv IS NULL OR C22_Codenv = CAST(:codenv as varchar)) " +
            "AND (:codapp IS NULL OR C22_Codapp = CAST(:codapp as varchar)) " +
            "AND (:codcom IS NULL OR C22_Codcom LIKE CAST(:codcom as varchar)) " +
            "AND (:codfic IS NULL OR C22_Codfic LIKE CAST(:codfic as varchar)) " +
            "AND (:codsit IS NULL OR S22_Codsit LIKE CAST(:codsit as varchar)) " +
            "AND C22_Codorg IN (:codorgs) " +
            "AND S22_Codcli IN (:codclis) " +
            "AND C46_Typtar IN (:typtars) ";
    private static final String GROUP_BY = "GROUP BY codorg, codcom, codfic, libfic, pagfic, numcom, dfiexp, codapp, codreg, codcli, codsit, percod ";
    private static final String ORDER_BY = "ORDER BY dfiexp, codorg, codcom, codfic, codsit, typtar ";
    private static final String SELECT_SUBREQUEST = "SELECT codorg, codcom, codfic, CAST(SUM(pagfic) as varchar) as pagfic, dfiexp, string_agg(typtar, ',') as typtar, " +
            "   string_agg(nbplis, ',') as nbplis, string_agg(coutot, ',') as coutot, codapp, codreg, codcli, codsit, libfic ";
    private static final String SELECT_SUBREQUEST_TOTAL = "SELECT CAST(SUM(pagfic) as varchar) as pagfic, string_agg(typtar, ',') as typtar, " +
            "   string_agg(nbplis, ',') as nbplis, string_agg(coutot, ',') as coutot ";
    private static final String GROUP_BY_SUBREQUEST = "GROUP BY codorg, codcom, codfic, dfiexp, codapp, codreg, codcli, codsit, libfic ";
    private static final List<String> INDEXES = Arrays.asList(ParamsUtils.CODORG, ParamsUtils.CODCOM, ParamsUtils.CODFIC,
            ParamsUtils.PAGFIC, ParamsUtils.DFIEXP, ParamsUtils.TYPTAR, ParamsUtils.NBPLIS, ParamsUtils.COUTOT,
            ParamsUtils.CODAPP, ParamsUtils.CODREG, ParamsUtils.CODCLI, ParamsUtils.CODSIT, ParamsUtils.LIBFIC);
    private static final List<String> INDEXES_TOTAL = Arrays.asList(ParamsUtils.PAGFIC, ParamsUtils.TYPTAR,
            ParamsUtils.NBPLIS, ParamsUtils.COUTOT);
    private static final String PERCENT = "%";

    private static final String ENTITY_GENTAR = "GenTar";
    private static final String ENTITY_GENFIC = "GenFic";

    private final GenFicRepository genFicRepository;
    private final GenTarRepository genTarRepository;
    private final OrganismeRepository organismeRepository;
    private final ClientRepository clientRepository;
    private final HistoryRepository historyRepository;
    private final VersionAdelaideService versionAdelaideService;

    @PersistenceContext
    private EntityManager entityManager;


    public FacturationDetailleePersistenceImpl(
            GenFicRepository genFicRepository, GenTarRepository genTarRepository,
            OrganismeRepository organismeRepository, ClientRepository clientRepository,
            HistoryRepository historyRepository, VersionAdelaideService versionAdelaideService
    ) {
        this.genFicRepository = genFicRepository;
        this.genTarRepository = genTarRepository;
        this.organismeRepository = organismeRepository;
        this.clientRepository = clientRepository;
        this.historyRepository = historyRepository;
        this.versionAdelaideService = versionAdelaideService;
    }

    @Override
    protected JpaSpecificationExecutor<GenTarEntity> getSpecificationExecutor() {
        return null;
    }

    @Override
    protected JpaRepository<GenTarEntity, GenTarCompositeId> getRepository() {
        return genTarRepository;
    }

    @Override
    protected Function<GenTarEntity, GenTar> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<GenTar, GenTarEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

    @Override
    public FacturationDetailleeDTO searchFacturationDetaillee(SearchFacturationDetailleeQuery query) {
        boolean showTotal = query.isShowTotal();
        String request = getSearchFactureDetailleeRequest(showTotal);
        Query sqlQuery = entityManager.createNativeQuery(request);
        sqlQuery.setParameter("dfiexpDeb", query.getDfiexpDeb());
        sqlQuery.setParameter("dfiexpFin", query.getDfiexpFin());
        sqlQuery.setParameter("codorgs", getCodorgs(query.getCodorgs()));
        sqlQuery.setParameter("codclis", getCodclis(query.getCodclis()));
        sqlQuery.setParameter("typtars", getTyptars(query.getTyptars()));
        sqlQuery.setParameter("codenv", query.getCodenv());
        sqlQuery.setParameter("codapp", query.getCodapp());
        sqlQuery.setParameter("codcom", query.getCodcom() != null ? PERCENT + query.getCodcom().toUpperCase() + PERCENT : null);
        sqlQuery.setParameter("codfic", query.getCodfic() != null ? PERCENT + query.getCodfic().toUpperCase() + PERCENT : null);
        sqlQuery.setParameter("codsit", query.getCodsit());
        List<Object[]> result = sqlQuery.getResultList();

        if (result.size() > maxSize) {
            return new FacturationDetailleeDTO(
                    new ArrayList<>(),
                    StringUtils.QUERY_RESULTS_MAX_SIZE_MESSAGE + maxSize
            );
        }

        List<FacturationDetaillee> facturationList = result.stream().map(Arrays::asList).map(facturation -> {
            FacturationDetaillee.FacturationDetailleeBuilder<?, ?> builder = FacturationDetaillee.builder()
                    .pagfic(ConvertorUtils.convertToInteger((String) facturation.get(getIndex(showTotal, ParamsUtils.PAGFIC))))
                    .codfic("Total")
                    .typtar((String) facturation.get(getIndex(showTotal, ParamsUtils.TYPTAR)))
                    .nbplis((String) facturation.get(getIndex(showTotal, ParamsUtils.NBPLIS)))
                    .coutot((String) facturation.get(getIndex(showTotal, ParamsUtils.COUTOT)));
            if (!showTotal) {
                builder.codorg((String) facturation.get(getIndex(showTotal, ParamsUtils.CODORG)))
                        .codcom((String) facturation.get(getIndex(showTotal, ParamsUtils.CODCOM)))
                        .codfic((String) facturation.get(getIndex(showTotal, ParamsUtils.CODFIC)))
                        .libfic((String) facturation.get(getIndex(showTotal, ParamsUtils.LIBFIC)))
                        .dfiexp(DateUtils.getDateAtStartOfDay((String) facturation.get(getIndex(showTotal, ParamsUtils.DFIEXP))))
                        .codapp((String) facturation.get(getIndex(showTotal, ParamsUtils.CODAPP)))
                        .codreg((String) facturation.get(getIndex(showTotal, ParamsUtils.CODREG)))
                        .codcli((String) facturation.get(getIndex(showTotal, ParamsUtils.CODCLI)))
                        .codsit((String) facturation.get(getIndex(showTotal, ParamsUtils.CODSIT)));
            }
            return builder.build();
        }).collect(Collectors.toList());

        return new FacturationDetailleeDTO(facturationList, "");
    }

    private String getSearchFactureDetailleeRequest(boolean showTotal) {
        String subrequest = SELECT_FROM_GENFIC;
        subrequest += INNER_JOIN_GENTAR
                + INNER_JOIN_ORGANISME_FOR_GENFIC;
        subrequest += GENFIC_WHERE_CLAUSE;
        subrequest += GROUP_BY;

        subrequest += "UNION ";

        subrequest += SELECT_FROM_HISFIC;
        subrequest += INNER_JOIN_HISTAR
                + INNER_JOIN_ORGANISME_FOR_HISFIC;
        subrequest += HISFIC_WHERE_CLAUSE;
        subrequest += GROUP_BY;

        String request = (showTotal ? SELECT_SUBREQUEST_TOTAL : SELECT_SUBREQUEST)
                + "FROM (" + subrequest + ") as subrequest ";
        if (!showTotal) {
            request += GROUP_BY_SUBREQUEST;
            request += ORDER_BY;
        }
        return request;
    }

    private int getIndex(boolean showTotal, String libelle) {
        List<String> indexArray = showTotal ? INDEXES_TOTAL : INDEXES;
        return indexArray.indexOf(libelle);
    }

    @Override
    public List<String> findTyptarFromGentar() {
        return genTarRepository.findTyptarFromGentar();
    }

    @Override
    public ConsolidationFacturationDTO searchConsolidationFacturation(SearchConsolidationFacturationQuery query) {
        List<Map<String, String>> resultMap;
        String masapp = genFicRepository.findValueByCodeMASAPP();
        if (query.getCodcom() != null) {
            query.setCodcom(PERCENT + query.getCodcom() + PERCENT);
        }
        if (query.getCodfic() != null) {
            query.setCodfic(PERCENT + query.getCodfic() + PERCENT);
        }
        if (masapp.equals(query.getCodapp())) {
            resultMap = genFicRepository.getConsolidationFacturationMasapp(query);
        } else {
            resultMap = genFicRepository.getConsolidationFacturation(query);
        }

        if (resultMap.size() > maxSize) {
            return new ConsolidationFacturationDTO(
                    new ArrayList<>(),
                    StringUtils.QUERY_RESULTS_MAX_SIZE_MESSAGE + maxSize
            );
        }

        List<ConsolidationFacturation> consolidationFacturationList = resultMap.stream().map(this::mapToConsolidationFacturation).collect(Collectors.toList());

        return new ConsolidationFacturationDTO(consolidationFacturationList, StringUtils.EMPTY);
    }

    @Override
    public void updateConsolidationFacturation(GenTar gentar) {
        genTarRepository.updateGenTarForConsolidationFacturation(gentar);
    }

    @Override
    public void deleteConsolidationFacturation(GenTar gentar) {
        GenTarCompositeId id = new GenTarCompositeId();
        id.setC45Codenv(gentar.getCodenv());
        id.setC45Codorg(gentar.getCodorg());
        id.setC45Codapp(gentar.getCodapp());
        id.setC45Percod(gentar.getPercod());
        id.setC45Codcom(gentar.getCodcom());
        id.setC45Numcom(gentar.getNumcom());
        id.setC45Codfic(gentar.getCodfic());
        id.setC45Typtar(gentar.getTyptar());
        Optional<GenTarEntity> toDelete = genTarRepository.findById(id);
        if (toDelete.isEmpty()) {
            throw new StileExistingElement("Ressource", id,  "Exemplaire");
        }
        genTarRepository.deleteGenTarForConsolidationFacturation(gentar);
    }

    @Override
    public boolean gentarExists(GenTar gentar) {
        return genTarRepository.existsById(domainToEntityFunction().apply(gentar).getId());
    }

    @Override
    public void recalculatePlific(SearchConsolidationFacturationQuery query) {
        String masapp = genFicRepository.findValueByCodeMASAPP();
        if (masapp.equals(query.getCodapp())) {
            genFicRepository.recalculatePlificMas(query);
        }else {
            genFicRepository.recalculatePlific(query);
        }
        this.logRecalculate(query, ENTITY_GENFIC, masapp);
    }

    @Override
    public void recalculateCout(SearchConsolidationFacturationQuery query) {
        String masapp = genFicRepository.findValueByCodeMASAPP();
        if (masapp.equals(query.getCodapp())) {
            genTarRepository.recalculateCoutMas(query);
        }else {
            genTarRepository.recalculateCout(query);
        }
        this.logRecalculate(query, ENTITY_GENTAR, masapp);
    }

    private ConsolidationFacturation mapToConsolidationFacturation(Map<String, String> map) {
        return ConsolidationFacturation.builder()
                .codenv(map.get(ParamsUtils.CODENV))
                .codorg(map.get(ParamsUtils.CODORG))
                .codapp(map.get(ParamsUtils.CODAPP))
                .percod(map.get(ParamsUtils.PERCOD))
                .codcom(map.get(ParamsUtils.CODCOM))
                .codfic(map.get(ParamsUtils.CODFIC))
                .numcom(map.get(ParamsUtils.NUMCOM))
                .codprd(map.get(ParamsUtils.CODPRD))
                .codcli(map.get(ParamsUtils.CODCLI))
                .plific(ConvertorUtils.convertToInteger(map.get(ParamsUtils.PLIFIC)))
                .dfiexp(DateUtils.getDateAtStartOfDay(map.get(ParamsUtils.DFIEXP)))
                .typtar(map.get(ParamsUtils.TYPTAR))
                .nbplis(map.get(ParamsUtils.NBPLIS))
                .coutot(map.get(ParamsUtils.COUTOT))
                .codsit(map.get(ParamsUtils.CODSIT))
                .compta(map.get(ParamsUtils.COMPTA))
                .perime(map.get(ParamsUtils.PERIME))
                .build();
    }

    private List<String> getCodorgs(List<String> codorgs) {
        if (codorgs == null || codorgs.isEmpty()) {
            codorgs = organismeRepository.findCodeOrganismesByTypeR();
        }
        return codorgs;
    }

    private List<String> getCodclis(List<String> codclis) {
        if (codclis == null || codclis.isEmpty()) {
            codclis = clientRepository.findAllByOrderByCodeAsc().stream().map(ClientEntity::getCode).collect(Collectors.toList());
        }
        return codclis;
    }

    private List<String> getTyptars(List<String> typtars) {
        if (typtars == null || typtars.isEmpty()) {
            typtars = findTyptarFromGentar();
        }
        return typtars;
    }

    private void logRecalculate(SearchConsolidationFacturationQuery query, String entity, String masapp) {
        boolean isMas = masapp.equals(query.getCodapp());
        String sortie = "";
        if(entity.equals(ENTITY_GENFIC)) {
            sortie = "n15_plific = Recalcul des plis";
        }else if(entity.equals(ENTITY_GENTAR)) {
            sortie = "n45_coutot = Recalcul des coûts";
        }
        if(isMas) {
            sortie += " sur le périmère MAS";
        }
        HistoryEntity history = new HistoryEntity();
        history.setInsertionDate(LocalDateTime.now());
        history.setEntite(entity);
        history.setActionUtilisateur(MyslogAction.UPDATE);
        history.setStation(ContextHolder.getContext().getHost());
        history.setUtilisateur(ContextHolder.getContext().getUser());
        history.setCodulo(ContextHolder.getContext().getId());
        history.setVersio(versionAdelaideService.getAdelaideVersion());
        history.setCondition(truncate(getConditionRecalculate(query, entity, isMas), FIELD_CONDITION_MAX_LENGTH));
        history.setSortie(sortie);
        historyRepository.save(history);
    }

    private String getConditionRecalculate(SearchConsolidationFacturationQuery query, String entity, boolean isMas) {
        String envColumn;
        String orgColumn;
        String appColumn;
        String perColumn;
        String comColumn;
        String ficColumn;
        String sitColumn = "s15_codsit";

        if (isMas) {
            envColumn = "c31_masenv";
            orgColumn = "c31_masorg";
            appColumn = "c31_masapp";
            perColumn = "c31_masper";
            comColumn = "c31_mascom";
            ficColumn = "c31_masfic";
        } else if (ENTITY_GENFIC.equals(entity)) {
            envColumn = "c15_codenv";
            orgColumn = "c15_codorg";
            appColumn = "c15_codapp";
            perColumn = "c15_percod";
            comColumn = "c15_codcom";
            ficColumn = "c15_codfic";
        } else if (ENTITY_GENTAR.equals(entity)) {
            envColumn = "c45_codenv";
            orgColumn = "c45_codorg";
            appColumn = "c45_codapp";
            perColumn = "c45_percod";
            comColumn = "c45_codcom";
            ficColumn = "c45_codfic";
        } else {
            return "";
        }

        StringBuilder builder = new StringBuilder()
                .append(envColumn).append("=").append(query.getCodenv())
                .append(" and ").append(orgColumn).append(" in (").append(String.join(", ", query.getCodorg()))
                .append(") and ").append(appColumn).append("=").append(query.getCodapp());
        if (query.getPercod() != null) {
            builder.append(" and ").append(perColumn).append("=").append(query.getPercod());
        }
        if (query.getCodcom() != null) {
            builder.append(" and ").append(comColumn).append(" like ").append(query.getCodcom());
        }
        if (query.getCodfic() != null) {
            builder.append(" and ").append(ficColumn).append(" like ").append(query.getCodfic());
        }
        if (query.getCodsit() != null) {
            builder.append(" and ").append(sitColumn).append("=").append(query.getCodsit());
        }
        return builder.toString();
    }

    private static String truncate(final String value, final int size) {
        return (value.length() >= size) ? value.substring(0, size) : value;
    }

    @Override
    public void updatePlificForConsolidationFacturation(UpdateConsolidationFacturation consolidation) {
        Integer nbPlis = genTarRepository.getNbplisForConsolidationFacturation(consolidation);
        genFicRepository.updatePlificForConsolidationFacturation(consolidation, nbPlis);
    }

    @Override
    public void updateCoutotForConsolidationFacturation(UpdateConsolidationFacturation consolidation) {
        genTarRepository.recalculateCoutotForConsolidationFacturation(consolidation);
        this.logRecalculateCoutot(consolidation, ENTITY_GENTAR);
    }

    private void logRecalculateCoutot(UpdateConsolidationFacturation consolidation, String entity) {
        String sortie = "n45_coutot = Recalcul des coûts";
        HistoryEntity history = new HistoryEntity();
        history.setInsertionDate(LocalDateTime.now());
        history.setEntite(entity);
        history.setActionUtilisateur(MyslogAction.UPDATE);
        history.setStation(ContextHolder.getContext().getHost());
        history.setUtilisateur(ContextHolder.getContext().getUser());
        history.setCodulo(ContextHolder.getContext().getId());
        history.setVersio(versionAdelaideService.getAdelaideVersion());
        history.setCondition(truncate(getConditionRecalculateCoutot(consolidation), FIELD_CONDITION_MAX_LENGTH));
        history.setSortie(sortie);
        historyRepository.save(history);
    }

    private String getConditionRecalculateCoutot(UpdateConsolidationFacturation consolidation) {
        return new StringBuilder()
                .append("c45_codenv").append("=").append(consolidation.getCodenv())
                .append(" and ").append("c45_codorg").append("=").append(consolidation.getCodorg())
                .append(" and ").append("c45_codapp").append("=").append(consolidation.getCodapp())
                .append(" and ").append("c45_percod").append("=").append(consolidation.getPercod())
                .append(" and ").append("c45_codcom").append("=").append(consolidation.getCodcom())
                .append(" and ").append("c45_numcom").append("=").append(consolidation.getCodapp())
                .append(" and ").append("c45_codfic").append("=").append(consolidation.getCodfic())
                .toString();
    }
}

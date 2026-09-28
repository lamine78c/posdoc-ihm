package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.ConvertorUtils;
import fr.acoss.posdoc.common.util.DateUtils;
import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.common.util.StringUtils;
import fr.acoss.posdoc.database.dao.GenFicRepository;
import fr.acoss.posdoc.database.entities.GenFicCompositeId;
import fr.acoss.posdoc.database.entities.GenFicEntity;
import fr.acoss.posdoc.database.mappers.GenFicMapper;
import fr.acoss.posdoc.domain.bontravail.model.BonTravailUpdateDTO;
import fr.acoss.posdoc.domain.bontravail.model.SearchBonTravailManuelQuery;
import fr.acoss.posdoc.domain.bontravail.secondary.BonTravailSearchPersistence;
import fr.acoss.posdoc.domain.genfic.model.BonTravailDTO;
import fr.acoss.posdoc.domain.genfic.model.BonTravailGroupByPeriodeDTO;
import fr.acoss.posdoc.domain.genfic.model.BonTravailGroupByPeriodeResultDTO;
import fr.acoss.posdoc.domain.genfic.model.BonTravailPayload;
import fr.acoss.posdoc.domain.genfic.model.BonTravailPeriodeFilterPayload;
import fr.acoss.posdoc.domain.genfic.model.BonTravailResultDTO;
import fr.acoss.posdoc.domain.genfic.model.GenFic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.persistence.Tuple;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

import static fr.acoss.posdoc.common.util.ParamsUtils.CODAPP;
import static fr.acoss.posdoc.common.util.ParamsUtils.CODBON;
import static fr.acoss.posdoc.common.util.ParamsUtils.CODCLI;
import static fr.acoss.posdoc.common.util.ParamsUtils.CODCOM;
import static fr.acoss.posdoc.common.util.ParamsUtils.CODENV;
import static fr.acoss.posdoc.common.util.ParamsUtils.CODFIC;
import static fr.acoss.posdoc.common.util.ParamsUtils.CODNOT;
import static fr.acoss.posdoc.common.util.ParamsUtils.CODORG;
import static fr.acoss.posdoc.common.util.ParamsUtils.CODPAL;
import static fr.acoss.posdoc.common.util.ParamsUtils.CODSIT;
import static fr.acoss.posdoc.common.util.ParamsUtils.DAPPCR;
import static fr.acoss.posdoc.common.util.ParamsUtils.DELMSP;
import static fr.acoss.posdoc.common.util.ParamsUtils.DFIEXP;
import static fr.acoss.posdoc.common.util.ParamsUtils.DRECEP;
import static fr.acoss.posdoc.common.util.ParamsUtils.INFORM;
import static fr.acoss.posdoc.common.util.ParamsUtils.LIBFIC;
import static fr.acoss.posdoc.common.util.ParamsUtils.LIBNOT;
import static fr.acoss.posdoc.common.util.ParamsUtils.MASAPP;
import static fr.acoss.posdoc.common.util.ParamsUtils.MASCOM;
import static fr.acoss.posdoc.common.util.ParamsUtils.MASENV;
import static fr.acoss.posdoc.common.util.ParamsUtils.MASFIC;
import static fr.acoss.posdoc.common.util.ParamsUtils.MASORG;
import static fr.acoss.posdoc.common.util.ParamsUtils.MASPER;
import static fr.acoss.posdoc.common.util.ParamsUtils.NUMCOM;
import static fr.acoss.posdoc.common.util.ParamsUtils.PAGFIC;
import static fr.acoss.posdoc.common.util.ParamsUtils.PERCOD;
import static fr.acoss.posdoc.common.util.ParamsUtils.PLIFIC;

public class BonTravailSearchPresistenceImpl
        extends AbstractObjectPersistence<GenFicEntity, GenFicCompositeId, GenFic>
        implements BonTravailSearchPersistence {

    private static final GenFicMapper MAPPER = GenFicMapper.INSTANCE;
    @Value("${" + StringUtils.QUERY_RESULTS_MAX_SIZE + "}")
    private int maxSize;

    // Query findBonTravail
    private static final String SELECT_DISTINCT = "SELECT DISTINCT gfe.s15_codbon as codbon , gfe.c15_codenv as codenv, gfe.c15_codorg as codorg, gfe.c15_codapp as codapp, gfe.c15_percod as percod, gfe.c15_codcom as codcom, gfe.c15_codfic as codfic, gfe.c15_numcom as numcom, gfe.n15_pagfic as pagfic, gfe.d15_dappcr as dappcr, gfe.d15_drecep as drecep, gfe.d15_dfiexp as dfiexp, gfe.n15_delmsp as delmsp, gfe.s15_inform as inform, gfe.n15_codpal as codpal, gfe.s15_libfic as libfic, ne.c26_codnot as codnot, ne.s26_libnot as libnot, gfe.s15_codsit as codsit, gfe.n15_plific as plific";
    private static final String FROM_GEN_FIC_ENTITY = " FROM genfic as gfe";
    private static final String INNER_JOIN_GEN_MAS = " INNER JOIN genmas as gme ON  gme.c31_numcom  = gfe.c15_numcom AND gme.c31_codcom = gfe.c15_codcom AND gme.c31_percod = gfe.c15_percod AND gme.c31_codapp = gfe.c15_codapp AND gme.c31_codorg = gfe.c15_codorg AND gme.c31_codenv = gfe.c15_codenv AND gme.c31_codfic = gfe.c15_codfic";
    private static final String INNER_JOIN_GEN_TAR = " INNER JOIN gentar as gte ON  gte.c45_codenv = gfe.c15_codenv AND gte.c45_codorg = gfe.c15_codorg AND gte.c45_codapp = gfe.c15_codapp AND gte.c45_percod = gfe.c15_percod AND gte.c45_codcom = gfe.c15_codcom AND gte.c45_codfic = gfe.c15_codfic AND gte.c45_numcom = gfe.c15_numcom";
    private static final String LEFT_JOIN_GEN_NOT = " LEFT JOIN gennot as gne ON  gne.c28_codfic  = gfe.c15_codfic AND gne.c28_codcom = gfe.c15_codcom AND gne.c28_percod = gfe.c15_percod AND gne.c28_codapp = gfe.c15_codapp AND gne.c28_codorg = gfe.c15_codorg AND gne.c28_codenv = gfe.c15_codenv AND gne.c28_numcom = gfe.c15_numcom";
    private static final String LEFT_JOIN_NOTICE = " LEFT JOIN notice as ne ON ne.c26_codnot = gne.c28_codnot";
    //End Query

    // Query findPeriode
    private static final String SELECT_FROM_GENAPP = "SELECT DISTINCT ga.c14_percod as percod FROM genapp ga ";
    private static final String INNER_JOIN_GENFIC = "INNER JOIN genfic gf ON ga.c14_codenv = gf.c15_codenv " +
            "AND ga.c14_codorg = gf.c15_codorg " +
            "AND ga.c14_codapp = gf.c15_codapp " +
            "AND ga.c14_percod = gf.c15_percod ";
    private static final String WHERE_GENAPP = "WHERE ga.c14_codenv = :codenv AND ga.c14_codorg IN (:codorgs) AND ga.c14_codapp = :codapp ";
    private static final String ORDER_BY_PERCOD = "ORDER BY percod DESC";
    // End Query

    protected final GenFicRepository genFicRepository;
    @PersistenceContext
    protected EntityManager entityManager;

    public BonTravailSearchPresistenceImpl(final GenFicRepository genFicRepository) {
        this.genFicRepository = genFicRepository;
    }

    @Override
    public List<BonTravailGroupByPeriodeDTO> findBonTravailManuel(SearchBonTravailManuelQuery query) {
        return genFicRepository.getBonTravailManuel(query)
                .stream().map(map -> BonTravailGroupByPeriodeDTO.builder()
                        .codbon(map.get(ParamsUtils.CODBON))
                        .codenv(map.get(ParamsUtils.CODENV))
                        .codorg(map.get(ParamsUtils.CODORG))
                        .codapp(map.get(ParamsUtils.CODAPP))
                        .percod(map.get(ParamsUtils.PERCOD))
                        .codcom(map.get(ParamsUtils.CODCOM))
                        .codfic(map.get(ParamsUtils.CODFIC))
                        .numcom(map.get(ParamsUtils.NUMCOM))
                        .pagfic(ConvertorUtils.convertToInteger(map.get(ParamsUtils.PAGFIC)))
                        .plific(ConvertorUtils.convertToInteger(map.get(ParamsUtils.PLIFIC)))
                        .dappcr(DateUtils.dateTimeFormatterFromStringISO(map.get(ParamsUtils.DAPPCR)))
                        .drecep(DateUtils.dateTimeFormatterFromStringISO(map.get(ParamsUtils.DRECEP)))
                        .dfiexp(DateUtils.getDateAtStartOfDay(map.get(ParamsUtils.DFIEXP)))
                        .delmsp(ConvertorUtils.convertToInteger(map.get(ParamsUtils.DELMSP)))
                        .inform(map.get(ParamsUtils.INFORM))
                        .codpal(ConvertorUtils.convertToInteger(map.get(ParamsUtils.CODPAL)))
                        .libfic(map.get(ParamsUtils.LIBFIC))
                        .codnot(ConvertorUtils.convertStringToSplitToArrayString(map.get(ParamsUtils.CODNOT), ","))
                        .libnot(ConvertorUtils.convertStringToSplitToArrayString(map.get(ParamsUtils.LIBNOT), ","))
                        .codsit(map.get(ParamsUtils.CODSIT))
                        .typtar(map.get(ParamsUtils.TYPTAR))
                        .build()).collect(Collectors.toList());
    }

    @Override
    public GenFic findById(final String codenv, final String codorg, final String codapp, final String percod, final String codcom, final String numcom, final String codfic) {
        Optional<GenFicEntity> genFicEntity = genFicRepository.findById(new GenFicCompositeId(codenv, codorg, codapp, percod, codcom, numcom, codfic));
        return genFicEntity.map(e -> entityToDomainFunction().apply(e)).orElse(null);
    }

    @Override
    public List<String> getPeriodeFromGenAppWhereCodEnvAndCodOrg(final BonTravailPeriodeFilterPayload bonTravailPeriodeFilterPayload) {
        String request = SELECT_FROM_GENAPP + INNER_JOIN_GENFIC + WHERE_GENAPP;
        request += ORDER_BY_PERCOD;
        Query query = entityManager.createNativeQuery(request);
        query.setParameter("codenv", bonTravailPeriodeFilterPayload.getCodenv());
        query.setParameter("codorgs", bonTravailPeriodeFilterPayload.getCodorg());
        query.setParameter("codapp", bonTravailPeriodeFilterPayload.getCodapp());
        return query.getResultList();
    }

    public BonTravailGroupByPeriodeResultDTO findBonTravail(final BonTravailPayload bonTravailPayload, final String masapp) {
        return groupBonTravailByPeriod(bonTravailPayload, masapp);
    }

    public BonTravailGroupByPeriodeResultDTO groupBonTravailByPeriod(BonTravailPayload bonTravailPayload, String masapp) {
        BonTravailResultDTO resultDTO = doSearchBonTravail(bonTravailPayload, masapp);
        List<BonTravailDTO> bonTravailList = resultDTO.getBonsTravail();
        Map<String, BonTravailGroupByPeriodeDTO> groupedMap = new HashMap<>();

        for (BonTravailDTO bonTravail : bonTravailList) {
            // créer un id du group, le code bon n'est pas unique, il faut rajouter les elements comme env, org, app, percod, codcom, numcom et codfic
            String idGroup = bonTravail.getCodbon()+bonTravail.getCodenv()+bonTravail.getCodorg()+bonTravail.getCodapp()+bonTravail.getPercod()+bonTravail.getCodcom()+bonTravail.getNumcom()+bonTravail.getCodfic();
            groupedMap.putIfAbsent(idGroup, initializeBonTravailGroupeByPeriodeDTO(bonTravail));
            BonTravailGroupByPeriodeDTO grouped = groupedMap.get(idGroup);

            if (bonTravail.getCodnot() != null && !grouped.getCodnot().contains(bonTravail.getCodnot())) {
                grouped.getCodnot().add(bonTravail.getCodnot());
            }
            if (bonTravail.getLibnot() != null && !grouped.getLibnot().contains(bonTravail.getLibnot())) {
                grouped.getLibnot().add(bonTravail.getLibnot());
            }
        }

        return new BonTravailGroupByPeriodeResultDTO(
                new ArrayList<>(groupedMap.values()),
                resultDTO.getMessage()
        );
    }

    public BonTravailResultDTO doSearchBonTravail(final BonTravailPayload bonTravailPayload, final String masapp) {
        List<Tuple> rawResult = doFindByQuery(bonTravailPayload, masapp);
        if (rawResult.size() > maxSize) {
            return new BonTravailResultDTO(
                    new ArrayList<>(),
                    "Le nombre de résultats dépasse la limite autorisée (" + maxSize + ")"
            );
        }
        List<BonTravailDTO> result = rawResult.stream().map(this::mapToBontravailDto).collect(Collectors.toList());
        return new BonTravailResultDTO(result, "");
    }

    private List<Tuple> doFindByQuery(final BonTravailPayload bonTravailPayload, final String masapp) {
        String request = SELECT_DISTINCT + FROM_GEN_FIC_ENTITY;
        // JOIN
        request += INNER_JOIN_GEN_TAR;
        if (bonTravailPayload.getCodapp().equals(masapp)) {
            request += INNER_JOIN_GEN_MAS;
        }
        request += LEFT_JOIN_GEN_NOT;
        request += LEFT_JOIN_NOTICE;

        // WHERE
        request = addWhereClause(bonTravailPayload, masapp, request, false);

        // create and populate the query
        Query query = entityManager.createNativeQuery(request, Tuple.class);

        setQueryParams(bonTravailPayload, masapp, query);

        return query.getResultList();
    }

    private static String addWhereClause(BonTravailPayload bonTravailPayload, String masapp, String request, Boolean isHis) {
        request += " WHERE 1 = 1 ";

        if (bonTravailPayload.getCodapp().equals(masapp)) {
            request = addMasappFilters(bonTravailPayload, request, isHis);
        } else {
            request = addGenficFilters(bonTravailPayload, request, isHis);
        }

        request = addDefaultFilters(bonTravailPayload, request, isHis);

        request = addDateRangeFilters(bonTravailPayload, request, isHis);

        request = addDelmspFilter(bonTravailPayload, request, isHis);

        return request;
    }

    private static String addDefaultFilters(BonTravailPayload bonTravailPayload, String request, Boolean isHis) {
        if (StringUtils.isNotEmpty(bonTravailPayload.getCodcli())) {
            request += Boolean.TRUE.equals(isHis) ? " AND hfe.s22_codcli LIKE :codcli" : " AND gfe.s15_codcli LIKE :codcli";
        }

        if (StringUtils.isNotEmpty(bonTravailPayload.getCodsit())) {
            request += Boolean.TRUE.equals(isHis) ? " AND hfe.s22_codsit LIKE :codsit" : " AND gfe.s15_codsit LIKE :codsit";
        }

        if (StringUtils.isNotEmpty(bonTravailPayload.getCodbon())) {
            request += Boolean.TRUE.equals(isHis) ? " AND hfe.s22_codbon LIKE :codbon" : " AND gfe.s15_codbon LIKE :codbon";
        }
        return request;
    }

    private static String addMasappFilters(final BonTravailPayload bonTravailPayload, String request, Boolean isHis) {
        if (Boolean.TRUE.equals(isHis)) {
            request += " AND hme.c33_masenv = :masenv AND hme.c33_masorg IN (:masorg) AND hme.c33_masapp = :masapp";
        } else {
            request += " AND gme.c31_masenv = :masenv AND gme.c31_masorg IN (:masorg) AND gme.c31_masapp = :masapp";
        }

        if (StringUtils.isNotEmpty(bonTravailPayload.getCodcom())) {
            request += Boolean.TRUE.equals(isHis) ? " AND hme.c33_mascom LIKE :mascom" : " AND gme.c31_mascom LIKE :mascom";
        }

        if (StringUtils.isNotEmpty(bonTravailPayload.getCodfic())) {
            request += Boolean.TRUE.equals(isHis) ? " AND hme.c33_masfic LIKE :masfic" : " AND gme.c31_masfic LIKE :masfic";
        }

        if (StringUtils.isNotEmpty(bonTravailPayload.getPercod())) {
            request += Boolean.TRUE.equals(isHis) ? " AND hme.c33_masper LIKE :masper" : " AND gme.c31_masper LIKE :masper";
        }

        return request;
    }

    private static String addGenficFilters(final BonTravailPayload bonTravailPayload, String request, Boolean isHis) {
        if (Boolean.TRUE.equals(isHis)) {
            request += " AND hfe.c22_codenv = :codenv AND hfe.c22_codorg IN (:codorg) AND hfe.c22_codapp = :codapp";
        } else {
            request += " AND gfe.c15_codenv = :codenv AND gfe.c15_codorg IN (:codorg) AND gfe.c15_codapp = :codapp";
        }

        if (StringUtils.isNotEmpty(bonTravailPayload.getCodcom())) {
            request += Boolean.TRUE.equals(isHis) ? " AND hfe.c22_codcom LIKE :codcom" : " AND gfe.c15_codcom LIKE :codcom";
        }

        if (StringUtils.isNotEmpty(bonTravailPayload.getCodfic())) {
            request += Boolean.TRUE.equals(isHis) ? " AND hfe.c22_codfic LIKE :codfic" : " AND gfe.c15_codfic LIKE :codfic";
        }

        if (StringUtils.isNotEmpty(bonTravailPayload.getPercod())) {
            request += Boolean.TRUE.equals(isHis) ? " AND hfe.c22_percod LIKE :percod" : " AND gfe.c15_percod LIKE :percod";
        }

        return request;
    }

    private static String addDateRangeFilters(final BonTravailPayload bonTravailPayload, String request, Boolean isHis) {
        if (Boolean.TRUE.equals(bonTravailPayload.getIsDateEmpty())) {
            request += Boolean.TRUE.equals(isHis) ? " AND hfe.d22_dfiexp IS NULL" : " AND gfe.d15_dfiexp IS NULL";
        }
        if (StringUtils.isNotEmpty(bonTravailPayload.getDappcrDeb())) {
            LocalDateTime dappcrDebFormatted = DateUtils.dateTimeFormatterFromStringISO(bonTravailPayload.getDappcrDeb());
            request += (Boolean.TRUE.equals(isHis) ? " AND hfe.d22_dappcr >= '" : " AND gfe.d15_dappcr >= '") + dappcrDebFormatted + "'";
        }
        if (StringUtils.isNotEmpty(bonTravailPayload.getDappcrFin())) {
            LocalDateTime dappcrFinFormatted = DateUtils.dateTimeFormatterFromStringISO(bonTravailPayload.getDappcrFin());
            request += (Boolean.TRUE.equals(isHis) ? " AND hfe.d22_dappcr <= '" : " AND gfe.d15_dappcr <= '") + dappcrFinFormatted + "'";
        }

        if (StringUtils.isNotEmpty(bonTravailPayload.getDfiexpDeb())) {
            LocalDate dfiexpDebFormatted = DateUtils.dateFormatterFromStringISO(bonTravailPayload.getDfiexpDeb().split(" ")[0]);
            request += (Boolean.TRUE.equals(isHis) ? " AND hfe.d22_dfiexp >= '" : " AND gfe.d15_dfiexp >= '") + dfiexpDebFormatted + "'";
        }
        if (StringUtils.isNotEmpty(bonTravailPayload.getDfiexpFin())) {
            LocalDate dfiexpFinFormatted = DateUtils.dateFormatterFromStringISO(bonTravailPayload.getDfiexpFin().split(" ")[0]);
            request += (Boolean.TRUE.equals(isHis) ? " AND hfe.d22_dfiexp <= '" : " AND gfe.d15_dfiexp <= '") + dfiexpFinFormatted + "'";
        }

        return request;
    }

    private static String addDelmspFilter(final BonTravailPayload bonTravailPayload, String request, Boolean isHis) {
        if (StringUtils.isNotEmpty(bonTravailPayload.getDelmsp())) {
            Set<String> delmspValidValues = Set.of("1", "2", "3", "4", "5");

            if (delmspValidValues.contains(bonTravailPayload.getDelmsp())) {
                request += (Boolean.TRUE.equals(isHis) ? " AND hfe.n22_delmsp = '" : " AND gfe.n15_delmsp = '") + bonTravailPayload.getDelmsp() + "'";
            } else if ("<=5".equals(bonTravailPayload.getDelmsp())) {
                request += Boolean.TRUE.equals(isHis) ? " AND hfe.n22_delmsp <= 5" : " AND gfe.n15_delmsp <= 5";
            } else {
                request += Boolean.TRUE.equals(isHis) ? " AND hfe.n22_delmsp > 5" : " AND gfe.n15_delmsp > 5";
            }
        }

        return request;
    }


    private BonTravailDTO mapToBontravailDto(Tuple tuple) {
        BonTravailDTO bonTravailDTO = new BonTravailDTO();
        bonTravailDTO.setCodapp((String) tuple.get(CODAPP));
        bonTravailDTO.setCodorg((String) tuple.get(CODORG));
        bonTravailDTO.setCodenv(((Character) tuple.get(CODENV)).toString());
        bonTravailDTO.setPercod((String) tuple.get(PERCOD));
        bonTravailDTO.setCodcom((String) tuple.get(CODCOM));
        bonTravailDTO.setCodfic((String) tuple.get(CODFIC));
        bonTravailDTO.setNumcom((String) tuple.get(NUMCOM));
        bonTravailDTO.setCodbon((String) tuple.get(CODBON));
        bonTravailDTO.setPagfic(ConvertorUtils.convertFromBigDecimalToInteger((BigDecimal) tuple.get(PAGFIC)));
        bonTravailDTO.setDappcr(DateUtils.getLocalDateTimeFromTimestamp((Timestamp) tuple.get(DAPPCR)));
        bonTravailDTO.setDfiexp(DateUtils.getLocaldateTimeFromSqlDate((Date) tuple.get(DFIEXP)));
        bonTravailDTO.setDrecep(DateUtils.getLocalDateTimeFromTimestamp((Timestamp) tuple.get(DRECEP)));
        bonTravailDTO.setDelmsp(ConvertorUtils.convertFromBigDecimalToInteger((BigDecimal) tuple.get(DELMSP)));
        bonTravailDTO.setCodpal(ConvertorUtils.convertFromBigDecimalToInteger((BigDecimal) tuple.get(CODPAL)));
        bonTravailDTO.setLibfic((String) tuple.get(LIBFIC));
        bonTravailDTO.setCodnot((String) tuple.get(CODNOT));
        bonTravailDTO.setLibnot((String) tuple.get(LIBNOT));
        bonTravailDTO.setCodsit((String) tuple.get(CODSIT));
        bonTravailDTO.setInform((String) tuple.get(INFORM));
        bonTravailDTO.setPlific(ConvertorUtils.convertFromBigDecimalToInteger((BigDecimal) tuple.get(PLIFIC)));

        return bonTravailDTO;
    }

    private static void setQueryParams(BonTravailPayload bonTravailPayload, String masapp, Query query) {
        Map<String, String> parameters;
        if (bonTravailPayload.getCodapp().equals(masapp)) {
            parameters = Map.of(
                    "ENV", MASENV,
                    "ORG", MASORG,
                    "APP", MASAPP,
                    "COM", MASCOM,
                    "FIC", MASFIC,
                    "PER", MASPER
            );
        } else {
            parameters = Map.of(
                    "ENV", CODENV,
                    "ORG", CODORG,
                    "APP", CODAPP,
                    "COM", CODCOM,
                    "FIC", CODFIC,
                    "PER", PERCOD
            );
        }
        setQueryParameters(bonTravailPayload, query, parameters);
        setDefaultQueryParameters(bonTravailPayload, query, CODCLI, CODBON, CODSIT);
    }

    private static void setDefaultQueryParameters(final BonTravailPayload bonTravailPayload, Query query, String codcli, String codbon, String codsit) {
        if (StringUtils.isNotEmpty(bonTravailPayload.getCodcli())) {
            query.setParameter(codcli, bonTravailPayload.getCodcli());
        }

        if (StringUtils.isNotEmpty(bonTravailPayload.getCodbon())) {
            query.setParameter(codbon, "%" + bonTravailPayload.getCodbon() + "%");
        }

        if (StringUtils.isNotEmpty(bonTravailPayload.getCodsit())) {
            query.setParameter(codsit, bonTravailPayload.getCodsit());
        }
    }

    private static void setQueryParameters(final BonTravailPayload bonTravailPayload, Query query, Map<String, String> parameterKeys) {
        if (StringUtils.isNotEmpty(bonTravailPayload.getCodenv())) {
            query.setParameter(parameterKeys.get("ENV"), bonTravailPayload.getCodenv());
        }

        if (!bonTravailPayload.getCodorg().isEmpty()) {
            query.setParameter(parameterKeys.get("ORG"), bonTravailPayload.getCodorg());
        }

        if (StringUtils.isNotEmpty(bonTravailPayload.getCodapp())) {
            query.setParameter(parameterKeys.get("APP"), bonTravailPayload.getCodapp());
        }

        if (StringUtils.isNotEmpty(bonTravailPayload.getCodcom())) {
            query.setParameter(parameterKeys.get("COM"), "%" + bonTravailPayload.getCodcom().toUpperCase() + "%");
        }

        if (StringUtils.isNotEmpty(bonTravailPayload.getCodfic())) {
            query.setParameter(parameterKeys.get("FIC"), "%" + bonTravailPayload.getCodfic().toUpperCase() + "%");
        }

        if (StringUtils.isNotEmpty(bonTravailPayload.getPercod())) {
            query.setParameter(parameterKeys.get("PER"), bonTravailPayload.getPercod());
        }
    }

    private BonTravailGroupByPeriodeDTO initializeBonTravailGroupeByPeriodeDTO(final BonTravailDTO bonTravail) {
        return new BonTravailGroupByPeriodeDTO(
                bonTravail.getCodbon(),
                bonTravail.getCodenv(),
                bonTravail.getCodorg(),
                bonTravail.getCodapp(),
                bonTravail.getPercod(),
                bonTravail.getCodcom(),
                bonTravail.getCodfic(),
                bonTravail.getNumcom(),
                bonTravail.getPagfic(),
                bonTravail.getPlific(),
                bonTravail.getDappcr(),
                bonTravail.getDrecep(),
                bonTravail.getDfiexp(),
                bonTravail.getDelmsp(),
                bonTravail.getInform(),
                bonTravail.getCodpal(),
                bonTravail.getLibfic(),
                new ArrayList<>(),
                new ArrayList<>(),
                bonTravail.getCodsit(),
                bonTravail.getTyptar()
        );
    }


    protected Function<GenFicEntity, BonTravailUpdateDTO> entityToDomainBonTravail() {
        return MAPPER::entityToDomainBonTravail;
    }

    @Override
    protected JpaSpecificationExecutor<GenFicEntity> getSpecificationExecutor() {
        return genFicRepository;
    }

    @Override
    protected JpaRepository<GenFicEntity, GenFicCompositeId> getRepository() {
        return genFicRepository;
    }

    @Override
    protected Function<GenFicEntity, GenFic> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<GenFic, GenFicEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

}

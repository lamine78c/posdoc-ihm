package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.DateUtils;
import fr.acoss.posdoc.database.dao.GenPliRepository;
import fr.acoss.posdoc.database.entities.GenPliEntity;
import fr.acoss.posdoc.database.mappers.GenPliMapper;
import fr.acoss.posdoc.domain.genpli.model.GenPli;
import fr.acoss.posdoc.domain.genpli.model.SearchPliQueryInput;
import fr.acoss.posdoc.domain.genpli.model.SearchPliResult;
import fr.acoss.posdoc.domain.genpli.model.SuiviAuPliDetailResult;
import fr.acoss.posdoc.domain.genpli.secondary.GenPliPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class GenPliPersistenceImpl extends AbstractObjectPersistence<GenPliEntity, String, GenPli>
        implements GenPliPersistence {

    private static final GenPliMapper MAPPER = GenPliMapper.INSTANCE;

    private final GenPliRepository genPliRepository;
    
    public static final String SQL_SUIVI_PLI_SELECT = "SELECT new map(g.status as status, g.numpli as numpli, g.idtpli as idtpli, " +
            " g.adres1 as adres1, g.adres2 as adres2, g.adres3 as adres3, g.adres4 as adres4, " +
            " g.adres5 as adres5, g.adres6 as adres6, g.adres7 as adres7, g.genpro as genpro, " +
            " g.codgam as codgam, g.mpsidd as mpsidd, CAST(g.datdep as string) as datdep ) ";
    public static final String SQL_SUIVI_PLI_FROM = " FROM GenPliEntity g ";
    public static final String SQL_SUIVI_PLI_WHERE = " WHERE 1=1 ";
    public static final String SQL_SUIVI_PLI_WHERE_DATE = " AND g.dplidc >= :dtdeb AND g.dplidc <= :dtfin ";
    public static final String SQL_SUIVI_PLI_WHERE_NOT_ISCNAV = " AND g.genpro NOT LIKE :cnav ";
    public static final String SQL_SUIVI_PLI_WHERE_ISCNAV = " AND g.genpro LIKE :cnav ";
    public static final String SQL_SUIVI_PLI_WHERE_NUMPLI = " AND g.numpli LIKE :numpli ";
    public static final String SQL_SUIVI_PLI_WHERE_IDTPLI = " AND g.idtpli LIKE :idtpli ";
    public static final String SQL_SUIVI_PLI_WHERE_ADRESSE = " (g.adres1 LIKE :adresse " +
            " OR g.adres2 LIKE :adresse " +
            " OR g.adres3 LIKE :adresse " +
            " OR g.adres4 LIKE :adresse " +
            " OR g.adres5 LIKE :adresse " +
            " OR g.adres6 LIKE :adresse " +
            " OR g.adres7 LIKE :adresse) ";
    public static final String SQL_SUIVI_PLI_ORDER_BY = " ORDER BY g.numpli, g.idtpli " ;
    private static final String PERCENT = "%";
    private static final String SPACE = " ";

    public GenPliPersistenceImpl(final GenPliRepository genPliRepository) {
        this.genPliRepository = genPliRepository;
    }

    @Override
    protected JpaSpecificationExecutor<GenPliEntity> getSpecificationExecutor() {
        return genPliRepository;
    }

    @Override
    protected JpaRepository<GenPliEntity, String> getRepository() {
        return genPliRepository;
    }

    @Override
    protected Function<GenPliEntity, GenPli> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<GenPli, GenPliEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

    protected Function<Map<String, String>, SuiviAuPliDetailResult> mapToSuiviAuPliDetailResultFunction() {
        return MAPPER::mapToSuiviAuPliDetailResult;
    }


    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<SearchPliResult> searchPliByQuery(final SearchPliQueryInput input) {
        StringBuilder sql = new StringBuilder();
        addSelectSearchPli(sql);
        addWhereClauseSearchPli(input, sql);
        sql.append(SQL_SUIVI_PLI_ORDER_BY);
        Query query = entityManager.createQuery(sql.toString());
        setQueryParametersSearchPli(input, query);
        List<Map<String, String>> results = query.getResultList();
        return results.stream().map(MAPPER::mapToSearchPliResult).collect(Collectors.toList());
    }

    private static void addSelectSearchPli(StringBuilder sql) {
        sql.append(SQL_SUIVI_PLI_SELECT);
        sql.append(SQL_SUIVI_PLI_FROM);
        sql.append(SQL_SUIVI_PLI_WHERE);
    }

    private static void addWhereClauseSearchPli(final SearchPliQueryInput input, StringBuilder sql) {
        boolean hasParamDate = input.getDtdeb() != null && !input.getDtdeb().isEmpty() && input.getDtfin() != null && !input.getDtfin().isEmpty();
        boolean hasParamNumpli = input.getNumpli() != null && !input.getNumpli().isEmpty();
        boolean hasParamIdtpli = input.getIdtpli() != null && !input.getIdtpli().isEmpty();
        boolean hasParamAdresse = input.getAdress() != null && !input.getAdress().isEmpty();
        boolean isCnav = Boolean.TRUE.equals(input.getIsCnav());
        if(hasParamDate) {
            sql.append(SQL_SUIVI_PLI_WHERE_DATE);
        }
        if(hasParamNumpli) {
            sql.append(SQL_SUIVI_PLI_WHERE_NUMPLI);
        }
        if(hasParamIdtpli) {
            sql.append(SQL_SUIVI_PLI_WHERE_IDTPLI);
        }
        if(isCnav) {
            sql.append(SQL_SUIVI_PLI_WHERE_ISCNAV);
        }else {
            sql.append(SQL_SUIVI_PLI_WHERE_NOT_ISCNAV);
        }
        if(hasParamAdresse) {
            AtomicInteger count = new AtomicInteger(1);
            List<String> adressList = new ArrayList<>();
            List.of(input.getAdress().split(SPACE)).forEach(adr -> adressList.add(SQL_SUIVI_PLI_WHERE_ADRESSE.replace(":adresse", ":adresse"+count.getAndIncrement())));
            sql.append(" AND ("+String.join(" OR ", adressList)+") ");
        }
    }

    private static void setQueryParametersSearchPli(final SearchPliQueryInput input, Query query) {
        boolean hasParamDate = input.getDtdeb() != null && !input.getDtdeb().isEmpty() && input.getDtfin() != null && !input.getDtfin().isEmpty();
        boolean hasParamNumpli = input.getNumpli() != null && !input.getNumpli().isEmpty();
        boolean hasParamIdtpli = input.getIdtpli() != null && !input.getIdtpli().isEmpty();
        boolean hasParamAdresse = input.getAdress() != null && !input.getAdress().isEmpty();
        if(hasParamDate) {
            query.setParameter("dtdeb", DateUtils.dateTimeFormatterFromStringISO(input.getDtdeb()+" 00:00:00"));
            query.setParameter("dtfin", DateUtils.dateTimeFormatterFromStringISO(input.getDtfin()+" 23:59:59"));
        }
        if(hasParamNumpli) {
            query.setParameter("numpli", PERCENT+input.getNumpli()+PERCENT);
        }
        if(hasParamIdtpli) {
            query.setParameter("idtpli", PERCENT+input.getIdtpli()+PERCENT);
        }
        if(hasParamAdresse) {
            AtomicInteger count = new AtomicInteger(1);
            List.of(input.getAdress().split(SPACE)).forEach(adr -> query.setParameter("adresse"+count.getAndIncrement(), PERCENT+adr+PERCENT));
        }
        query.setParameter("cnav", "%_cnav_%");
    }

    @Override
    public SuiviAuPliDetailResult searchPliByNumpli(String numpli) {
        return mapToSuiviAuPliDetailResultFunction().apply(genPliRepository.searchPliByNumpli(numpli));
    }
}

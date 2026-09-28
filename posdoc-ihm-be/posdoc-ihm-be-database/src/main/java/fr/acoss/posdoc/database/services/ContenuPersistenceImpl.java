package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.ContenuRepository;
import fr.acoss.posdoc.database.entities.ContenuEntity;
import fr.acoss.posdoc.database.mappers.ContenuMapper;
import fr.acoss.posdoc.domain.contenu.model.Contenu;
import fr.acoss.posdoc.domain.contenu.model.ContenuForAccueil;
import fr.acoss.posdoc.domain.contenu.secondary.ContenuPersistence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import javax.persistence.Tuple;
import java.util.Arrays;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ContenuPersistenceImpl
        extends AbstractObjectPersistence<ContenuEntity, Integer, Contenu>
        implements ContenuPersistence {

    private static final String SELECT_CONTENU_FOR_ACCUEIL = "SELECT DISTINCT c.titre as titre, c.message as message, string_agg(distinct cr.region_code, ',') as regions ";
    private static final String FROM_CONTENU_FOR_ACCUEIL = "FROM contenu c ";
    private static final String LEFT_JOIN_CONTENUS_REGIONS = "LEFT JOIN contenus_regions cr ON c.id = cr.contenu_id ";
    private static final String LEFT_JOIN_ORGANISMES = "LEFT JOIN organi o ON cr.region_code = o.s00_codreg ";
    private static final String WHERE_ACTIVATION_AND_EXPIRATION = "WHERE c.activation <= current_date AND c.expiration >= current_date ";
    private static final String WHERE_CODORG = "AND o.c00_codorg IN (:userOrganismes) ";
    private static final String GROUP_BY_CONTENU_FOR_ACCUEIL = "GROUP BY titre, message";

    private static final ContenuMapper MAPPER = ContenuMapper.INSTANCE;

    private final ContenuRepository contenuRepository;

    ContenuPersistenceImpl(ContenuRepository contenuRepository){
        this.contenuRepository = contenuRepository;
    }

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    protected JpaSpecificationExecutor<ContenuEntity> getSpecificationExecutor() {
        return contenuRepository;
    }

    @Override
    protected JpaRepository<ContenuEntity, Integer> getRepository() {
        return contenuRepository;
    }

    @Override
    protected Function<ContenuEntity, Contenu> entityToDomainFunction() {
        return MAPPER::entityToDomain;
    }

    @Override
    protected Function<Contenu, ContenuEntity> domainToEntityFunction() {
        return MAPPER::domainToEntity;
    }

    @Override
    public List<Contenu> selectAll() {
        return this.contenuRepository.findAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
    }

    @Override
    public List<ContenuForAccueil> getContenusForAccueil(List<String> userOrganismes) {
        String request = SELECT_CONTENU_FOR_ACCUEIL + FROM_CONTENU_FOR_ACCUEIL;
        request += LEFT_JOIN_CONTENUS_REGIONS + LEFT_JOIN_ORGANISMES;
        request += WHERE_ACTIVATION_AND_EXPIRATION;
        if (!userOrganismes.isEmpty()) {
            request += WHERE_CODORG;
        }
        request += GROUP_BY_CONTENU_FOR_ACCUEIL;

        Query sqlQuery = entityManager.createNativeQuery(request, Tuple.class);
        if (!userOrganismes.isEmpty()) {
            sqlQuery.setParameter("userOrganismes", userOrganismes);
        }

        List<Tuple> result = sqlQuery.getResultList();

        return result.stream().map(tuple -> {
            ContenuForAccueil contenu = new ContenuForAccueil();
            contenu.setTitre((String) tuple.get("titre"));
            contenu.setMessage((String) tuple.get("message"));
            String regions = (String) tuple.get("regions");
            if (regions != null) {
                contenu.setRegions(Arrays.asList(regions.split(",")));
            }
            return contenu;
        }).collect(Collectors.toList());
    }

}

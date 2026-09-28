package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.DateUtils;
import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.common.util.StringUtils;
import fr.acoss.posdoc.database.dao.GenFicRepository;
import fr.acoss.posdoc.database.entities.GenFicCompositeId;
import fr.acoss.posdoc.database.entities.GenFicEntity;
import fr.acoss.posdoc.database.mappers.GenFicMapper;
import fr.acoss.posdoc.domain.expedition.model.Expedition;
import fr.acoss.posdoc.domain.expedition.model.ExpeditionPayloadDTO;
import fr.acoss.posdoc.domain.expedition.model.SearchExpeditionQuery;
import fr.acoss.posdoc.domain.expedition.secondary.ExpeditionPersistence;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ExpeditionPersistenceImpl
        extends AbstractObjectPersistence<GenFicEntity, GenFicCompositeId, Expedition>
        implements ExpeditionPersistence {

    private static final GenFicMapper MAPPER = GenFicMapper.INSTANCE;
    @Value("${" + StringUtils.QUERY_RESULTS_MAX_SIZE + "}")
    private int maxSize;

    private final GenFicRepository genFicRepository;

    public ExpeditionPersistenceImpl(GenFicRepository genFicRepository) {
        this.genFicRepository = genFicRepository;
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
    protected Function<GenFicEntity, Expedition> entityToDomainFunction() {
        return MAPPER::genFicEntityToExpedition;
    }

    @Override
    protected Function<Expedition, GenFicEntity> domainToEntityFunction() {
        return MAPPER::expeditionTogenFicEntity;
    }

    @Override
    public ExpeditionPayloadDTO findExpeditions(SearchExpeditionQuery query) {
        List<Map<String, String>> result = genFicRepository.findGenficInnerJoinGentar(query);
        if (result.size() > maxSize) {
            return new ExpeditionPayloadDTO(
                    new ArrayList<>(),
                    StringUtils.QUERY_RESULTS_MAX_SIZE_MESSAGE + maxSize
            );
        }
        return new ExpeditionPayloadDTO(result.stream().map(this::mapToExpedition).collect(Collectors.toList()), StringUtils.EMPTY);
    }

    private Expedition mapToExpedition(Map<String, String> map) {
        return Expedition.builder().codenv(map.get(ParamsUtils.CODENV)).codorg(map.get(ParamsUtils.CODORG)).codapp(map.get(ParamsUtils.CODAPP))
                .codcom(map.get(ParamsUtils.CODCOM)).codfic(map.get(ParamsUtils.CODFIC)).codprd(map.get(ParamsUtils.CODPRD))
                .numcom(map.get(ParamsUtils.NUMCOM)).refimp(map.get(ParamsUtils.REFIMP)).codsit(map.get(ParamsUtils.CODSIT))
                .pagfic(Integer.parseInt(map.get(ParamsUtils.PAGFIC))).codcli(map.get(ParamsUtils.CODCLI))
                .dfiexp(DateUtils.getDateAtStartOfDay(map.get(ParamsUtils.DFIEXP)))
                .percod(map.get(ParamsUtils.PERCOD))
                .libfic(map.get(ParamsUtils.LIBFIC))
                .build();
    }
}

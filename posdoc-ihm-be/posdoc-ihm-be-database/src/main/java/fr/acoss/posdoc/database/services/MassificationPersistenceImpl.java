package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.database.dao.MassificationRepository;
import fr.acoss.posdoc.database.entities.TmpMasCompositeId;
import fr.acoss.posdoc.database.entities.TmpMasEntity;
import fr.acoss.posdoc.domain.massification.model.MassificationPool;
import fr.acoss.posdoc.domain.massification.model.MassificationSearch;
import fr.acoss.posdoc.domain.massification.model.MassificationUpdate;
import fr.acoss.posdoc.domain.massification.model.OptionFields;
import fr.acoss.posdoc.domain.massification.model.SearchMassificationQuery;
import fr.acoss.posdoc.domain.massification.secondary.MassificationPersistence;
import fr.acoss.posdoc.domain.occurrence.application.model.DetailsMassification;
import fr.acoss.posdoc.domain.occurrence.application.model.ParamDataMassificationInput;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;

@Service
public class MassificationPersistenceImpl extends AbstractObjectPersistence<TmpMasEntity, String, TmpMasCompositeId>
        implements MassificationPersistence {

    MassificationRepository massificationRepository;
    public MassificationPersistenceImpl(MassificationRepository massificationRepository){
        this.massificationRepository = massificationRepository;
    }

    @Override
    protected JpaSpecificationExecutor<TmpMasEntity> getSpecificationExecutor() {
        return null;
    }

    @Override
    protected JpaRepository<TmpMasEntity, String> getRepository() {
        return null;
    }

    @Override
    protected Function<TmpMasEntity, TmpMasCompositeId> entityToDomainFunction() {
        return null;
    }

    @Override
    protected Function<TmpMasCompositeId, TmpMasEntity> domainToEntityFunction() {
        return null;
    }

    @Override
    public List<MassificationSearch> searchForMassification(SearchMassificationQuery query, String codegam) {
        return this.massificationRepository.searchForMassification(query, codegam);
    }

    @Override
    public List<MassificationPool> getPoolElementsForMassification(List<String> masfics) {
        return this.massificationRepository.getPoolElementsForMassification(masfics);
    }

    @Override
    public List<OptionFields> getDistinctFieldsFromTmpMasGenFicGenProOrg() {
        return this.massificationRepository.getDistinctFieldsFromTmpMasGenFicGenProOrg();
    }

    @Override
    public List<MassificationSearch> updateMassification(List<MassificationUpdate> data, String codsit, String codegam) {
        List<MassificationSearch> updatedData = new ArrayList<>();
        for (MassificationUpdate payload : data) {
            if(!Objects.equals(codsit, payload.getCodsit())) {
                this.massificationRepository.updateMassification(codsit, payload);
                boolean isAllFichiersInPoolSelected = Boolean.TRUE.equals(payload.getIsAllFichiersInPoolSelected());
                if(isAllFichiersInPoolSelected) {
                    this.massificationRepository.updatePremas(codsit, payload);
                }
                this.massificationRepository.updateGenfic(codsit, payload);

                updatedData.addAll(
                    this.massificationRepository.findUpdatedMassification(payload, codegam)
                );
            }
        }
        return updatedData;
    }

    @Override
    public boolean deleteMassification(List<MassificationSearch> data) {
        try {
            if(data.isEmpty()) {
                return false;
            }

            for (MassificationSearch payload : data) {
                this.massificationRepository.deleteMassification(payload.getCodenv(), payload.getCodorg(), payload.getCodapp(),
                        payload.getPercod(), payload.getCodcom(), payload.getCodfic(), payload.getNumcom());
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public List<DetailsMassification> findDetailsMassificationForOccurrenceApplication(ParamDataMassificationInput paramData) {
        String codenv = paramData.getCodEnv();
        String codorg = paramData.getCodOrg();
        String codapp = paramData.getCodApp();
        String percod = paramData.getPerCod();
        String codgam = paramData.getMasGam();
        return this.massificationRepository.findDetailsMassificationForOccurrenceApplication(codenv, codorg, codapp, percod, codgam);
    }

    @Override
    public List<String> findPercodForMassification(
            String codenv,
            String codorg,
            String codapp,
            String percod
    ) {
        return this.massificationRepository.findPercodForMassification(
                codenv,
                codorg,
                codapp,
                percod
        );
    }
}
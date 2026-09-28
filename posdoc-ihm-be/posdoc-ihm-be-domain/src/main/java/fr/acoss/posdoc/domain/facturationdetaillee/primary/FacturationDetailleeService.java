package fr.acoss.posdoc.domain.facturationdetaillee.primary;

import fr.acoss.posdoc.common.util.ConvertorUtils;
import fr.acoss.posdoc.common.util.StringUtils;
import fr.acoss.posdoc.domain.facturationdetaillee.model.AbstractFacturationWithTyptar;
import fr.acoss.posdoc.domain.facturationdetaillee.model.ConsolidationFacturation;
import fr.acoss.posdoc.domain.facturationdetaillee.model.ConsolidationFacturationDTO;
import fr.acoss.posdoc.domain.facturationdetaillee.model.ConsolidationFacturationWithAllColumns;
import fr.acoss.posdoc.domain.facturationdetaillee.model.ConsolidationFacturationWithAllColumnsDTO;
import fr.acoss.posdoc.domain.facturationdetaillee.model.FacturationDetaillee;
import fr.acoss.posdoc.domain.facturationdetaillee.model.FacturationDetailleeDTO;
import fr.acoss.posdoc.domain.facturationdetaillee.model.FacturationDetailleeWithAllColumns;
import fr.acoss.posdoc.domain.facturationdetaillee.model.FacturationDetailleeWithAllColumnsDTO;
import fr.acoss.posdoc.domain.facturationdetaillee.model.GenTar;
import fr.acoss.posdoc.domain.facturationdetaillee.model.TarifFacturationDetaillee;
import fr.acoss.posdoc.domain.facturationdetaillee.model.UpdateConsolidationFacturation;
import fr.acoss.posdoc.domain.facturationdetaillee.model.UpdateTarifConsolidationFacturation;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.SearchConsolidationFacturationQuery;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.SearchFacturationDetailleeQuery;
import fr.acoss.posdoc.domain.facturationdetaillee.model.query.UpdateConsolidationFacturationQuery;
import fr.acoss.posdoc.domain.facturationdetaillee.secondary.FacturationDetailleePersistence;
import fr.acoss.posdoc.domain.tarpos.model.Tarpos;
import fr.acoss.posdoc.domain.tarpos.secondary.TarposPersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.CustomExceptionMessage;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

public class FacturationDetailleeService {

    private static final String COMMA = ",";

    private static final String PERCENT = StringUtils.PERCENT;

    private final TarposPersistence tarposPersistence;
    private final FacturationDetailleePersistence facturationDetailleePersistence;

    public FacturationDetailleeService(FacturationDetailleePersistence facturationDetailleePersistence, TarposPersistence tarposPersistence) {
        this.facturationDetailleePersistence = facturationDetailleePersistence;
        this.tarposPersistence = tarposPersistence;
    }

    public FacturationDetailleeWithAllColumnsDTO searchFacturationDetaillee(SearchFacturationDetailleeQuery query) {
        FacturationDetailleeDTO facturationDetaillees = facturationDetailleePersistence.searchFacturationDetaillee(query);
        if (facturationDetaillees.getMessage() != null && !facturationDetaillees.getMessage().isEmpty()) {
            return new FacturationDetailleeWithAllColumnsDTO(
                    new ArrayList<>(),
                    facturationDetaillees.getMessage()
            );
        }
        List<String> countableTarifs = this.tarposPersistence.getTarifsByCompta();
        List<FacturationDetailleeWithAllColumns> result = facturationDetaillees.getFacturationDetailleeList()
                .stream()
                .map(facturation -> mapFacturationToFacturationWithAllColumns(facturation, countableTarifs))
                .collect(Collectors.toList());
        return new FacturationDetailleeWithAllColumnsDTO(result, StringUtils.EMPTY);
    }

    private FacturationDetailleeWithAllColumns mapFacturationToFacturationWithAllColumns(FacturationDetaillee facturation, List<String> countableTarifs) {
        FacturationDetailleeWithAllColumns facturationWithAllCols = new FacturationDetailleeWithAllColumns();
        facturationWithAllCols.setCodorg(facturation.getCodorg());
        facturationWithAllCols.setCodapp(facturation.getCodapp());
        facturationWithAllCols.setCodcom(facturation.getCodcom());
        facturationWithAllCols.setCodfic(facturation.getCodfic());
        facturationWithAllCols.setLibfic(facturation.getLibfic());
        facturationWithAllCols.setDfiexp(facturation.getDfiexp());
        facturationWithAllCols.setCodsit(facturation.getCodsit());
        facturationWithAllCols.setCodreg(facturation.getCodreg());
        facturationWithAllCols.setCodcli(facturation.getCodcli());
        facturationWithAllCols.setTotalPages(facturation.getPagfic());
        facturationWithAllCols.setTotalPlis(getTotalPlis(facturation.getNbplis(), facturation.getTyptar(), countableTarifs));
        facturationWithAllCols.setCoutTotal(getCoutTotal(facturation.getCoutot(), facturation.getTyptar(), countableTarifs));

        facturationWithAllCols.setTarifs(getDynamicColumns(facturation));

        return facturationWithAllCols;
    }

    // ne prend en compte que les tarifs comptabilisés
    private Integer getTotalPlis(final String plis, final String tarifs, final List<String> countableTarifs) {
        if (tarifs != null) {
            List<String> facturationTarifs = Arrays.asList(tarifs.split(COMMA));
            AtomicInteger index = new AtomicInteger();
            return Arrays.stream(plis.split(COMMA))
                    .filter(pli -> {
                        String pliTarif = facturationTarifs.get(index.get());
                        index.getAndIncrement();
                        return countableTarifs.stream().anyMatch(tarif -> tarif.equals(pliTarif));
                    })
                    .map(ConvertorUtils::convertToInteger)
                    .mapToInt(Integer::intValue)
                    .sum();
        }
        return null;
    }

    // ne prend en compte que les tarifs comptabilisés
    private Float getCoutTotal(final String value, final String tarifs, final List<String> countableTarifs) {
        if (tarifs != null) {
            List<String> facturationTarifs = Arrays.asList(tarifs.split(COMMA));
            AtomicInteger index = new AtomicInteger();
            return (float) Arrays.stream(value.split(COMMA))
                    .filter(cout -> {
                        String coutTarif = facturationTarifs.get(index.get());
                        index.getAndIncrement();
                        return countableTarifs.stream().anyMatch(tarif -> tarif.equals(coutTarif));
                    })
                    .map(ConvertorUtils::convertCoutTotal)
                    .mapToDouble(Float::doubleValue)
                    .sum();
        }
        return null;
    }

    public ConsolidationFacturationWithAllColumnsDTO searchConsolidationFacturation(SearchConsolidationFacturationQuery query) {
        ConsolidationFacturationDTO consolidationFacturation = this.facturationDetailleePersistence.searchConsolidationFacturation(query);

        if (!consolidationFacturation.getMessage().isEmpty()) {
            return new ConsolidationFacturationWithAllColumnsDTO(
                    new ArrayList<>(),
                    consolidationFacturation.getMessage()
            );
        }

        List<ConsolidationFacturation> consolidationFacturationList = consolidationFacturation.getConsolidationFacturationList();
        List<ConsolidationFacturationWithAllColumns> consolidationFacturationWithAllColumnsList = consolidationFacturationList.stream()
                .map(consolidationItem -> {
                    ConsolidationFacturationWithAllColumns consolidationWithAllColumns = new ConsolidationFacturationWithAllColumns();
                    consolidationWithAllColumns.setCodenv(consolidationItem.getCodenv());
                    consolidationWithAllColumns.setCodorg(consolidationItem.getCodorg());
                    consolidationWithAllColumns.setCodapp(consolidationItem.getCodapp());
                    consolidationWithAllColumns.setPercod(consolidationItem.getPercod());
                    consolidationWithAllColumns.setCodcom(consolidationItem.getCodcom());
                    consolidationWithAllColumns.setCodfic(consolidationItem.getCodfic());
                    consolidationWithAllColumns.setNumcom(consolidationItem.getNumcom());
                    consolidationWithAllColumns.setCodprd(consolidationItem.getCodprd());
                    consolidationWithAllColumns.setCodcli(consolidationItem.getCodcli());
                    consolidationWithAllColumns.setCodsit(consolidationItem.getCodsit());
                    consolidationWithAllColumns.setPlific(consolidationItem.getPlific());
                    consolidationWithAllColumns.setCoufic(this.getCoutTotal(consolidationItem));
                    consolidationWithAllColumns.setDfiexp(consolidationItem.getDfiexp());
                    consolidationWithAllColumns.setTarifs(getDynamicColumns(consolidationItem));

                    return consolidationWithAllColumns;
                })
                .collect(Collectors.toList());

        return new ConsolidationFacturationWithAllColumnsDTO(consolidationFacturationWithAllColumnsList, StringUtils.EMPTY);
    }

    private Float getCoutTotal(ConsolidationFacturation consolidationFacturation) {
        String[] comptaValues = consolidationFacturation.getCompta().split(COMMA);
        String[] coutotValues = consolidationFacturation.getCoutot().split(COMMA);
        float sum = 0;

        for (int i = 0; i < coutotValues.length; i++) {
            // ne prend en compte que les tarifs comptabilisés
            if ("0".equals(comptaValues[i])) {
                sum += ConvertorUtils.convertCoutTotal(coutotValues[i]);
            }
        }
        return sum;
    }

    private List<TarifFacturationDetaillee> getDynamicColumns(AbstractFacturationWithTyptar facturation) {
        List<TarifFacturationDetaillee> tarifs = new ArrayList<>();
        int index = 0;
        String[] nbPlis = facturation.getNbplis().split(COMMA);
        String[] couts = facturation.getCoutot().split(COMMA);
        for (String typtar : facturation.getTyptar().split(COMMA)) {
            Optional<TarifFacturationDetaillee> optional = tarifs.stream().filter(e -> e.getCodeTar().equals(typtar)).findFirst();
            if (optional.isEmpty()) {
                TarifFacturationDetaillee tarif = new TarifFacturationDetaillee();
                tarif.setCodeTar(typtar);
                tarif.setPlis(ConvertorUtils.convertToInteger(nbPlis[index]));
                tarif.setCout(ConvertorUtils.convertCoutTotal(couts[index]));
                tarifs.add(tarif);
            } else {
                TarifFacturationDetaillee tarif = optional.get();
                tarif.setPlis(tarif.getPlis() + ConvertorUtils.convertToInteger(nbPlis[index]));
                tarif.setCout(tarif.getCout() + ConvertorUtils.convertCoutTotal(couts[index]));
            }

            index++;
        }
        return tarifs;
    }

    public void updateConsolidationFacturation(UpdateConsolidationFacturationQuery query) {
        List<Tarpos> allTarposAct = tarposPersistence.allTarposByPerimetreEqualToZero();
        // get all tarpos non périmés
        List<String> allTyptarAct = allTarposAct.stream()
                .map(Tarpos::getType)
                .collect(Collectors.toList());
        // itération facturation
        query.getConsolidations().forEach(consolidationUpdate -> {
            // itération tarif
            consolidationUpdate.getTarifs().forEach(tarifUpdate -> {
                // les tarifs périmés ne sont pas exploitables
                if (!allTyptarAct.contains(tarifUpdate.getTyptar())) {
                    throw new CustomExceptionMessage("Tarif périmé <" + tarifUpdate.getTyptar() + "> n'est pas exploitable");
                }
                GenTar gentar = this.getGenTarFromUpdateQuery(consolidationUpdate, tarifUpdate);
                if (tarifUpdate.getIsCreate()) {
                    if (facturationDetailleePersistence.gentarExists(gentar)) {
                        throw new AlreadyExistingElement("GenTar", gentar.toString());
                    }
                    facturationDetailleePersistence.create(gentar);
                } else if (tarifUpdate.getIsUpdate()) {
                    facturationDetailleePersistence.updateConsolidationFacturation(gentar);
                } else {
                    facturationDetailleePersistence.deleteConsolidationFacturation(gentar);
                }
            });
            // update coutot selon tarif, ne change rien pour les tarifs avec couts manuels
            facturationDetailleePersistence.updateCoutotForConsolidationFacturation(consolidationUpdate);
            // update plific après la consolidation de la facturation
            facturationDetailleePersistence.updatePlificForConsolidationFacturation(consolidationUpdate);
        });

        if(query.getConsolidations().size() == 0) {
            recalculateCoutAndPlific(query);
        }
    }

    // actualiser le cout dans gentar et total plis dans genfic
    private void recalculateCoutAndPlific(UpdateConsolidationFacturationQuery query) {
        SearchConsolidationFacturationQuery searchQuery = new SearchConsolidationFacturationQuery();
        searchQuery.setCodenv(query.getCodenv());
        searchQuery.setCodorg(query.getCodorg());
        searchQuery.setCodapp(query.getCodapp());
        searchQuery.setPercod(query.getPercod());
        if (query.getCodfic() != null) {
            searchQuery.setCodfic(PERCENT + query.getCodfic() + PERCENT);
        }
        if (query.getCodcom() != null) {
            searchQuery.setCodcom(PERCENT + query.getCodcom() + PERCENT);
        }
        searchQuery.setCodsit(query.getCodsit());
        // recalculate coutot dans gentar
        facturationDetailleePersistence.recalculateCout(searchQuery);
        // recalculate plific dans genfic
        facturationDetailleePersistence.recalculatePlific(searchQuery);
    }

    private GenTar getGenTarFromUpdateQuery(UpdateConsolidationFacturation consolidation, UpdateTarifConsolidationFacturation tarif) {
        GenTar gentar = new GenTar();
        gentar.setCodenv(consolidation.getCodenv());
        gentar.setCodorg(consolidation.getCodorg());
        gentar.setCodapp(consolidation.getCodapp());
        gentar.setPercod(consolidation.getPercod());
        gentar.setCodcom(consolidation.getCodcom());
        gentar.setNumcom(consolidation.getNumcom());
        gentar.setCodfic(consolidation.getCodfic());
        gentar.setTyptar(tarif.getTyptar());
        gentar.setNbplis(tarif.getNbplis());
        gentar.setCoutot(tarif.getCoutot());

        return gentar;
    }
}

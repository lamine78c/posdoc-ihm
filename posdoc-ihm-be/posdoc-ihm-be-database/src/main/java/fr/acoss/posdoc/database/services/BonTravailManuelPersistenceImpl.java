package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.DateUtils;
import fr.acoss.posdoc.common.util.StringUtils;
import fr.acoss.posdoc.database.dao.FichierRepository;
import fr.acoss.posdoc.database.dao.GenAppRepository;
import fr.acoss.posdoc.database.dao.GenBonRepository;
import fr.acoss.posdoc.database.dao.GenEtpRepository;
import fr.acoss.posdoc.database.dao.GenFicRepository;
import fr.acoss.posdoc.database.dao.GenLieRepository;
import fr.acoss.posdoc.database.dao.GenNotRepository;
import fr.acoss.posdoc.database.dao.GenTarRepository;
import fr.acoss.posdoc.database.dao.ParametreRepository;
import fr.acoss.posdoc.database.dao.TarifRepository;
import fr.acoss.posdoc.database.entities.FichierCompositeId;
import fr.acoss.posdoc.database.entities.FichierEntity;
import fr.acoss.posdoc.database.entities.GenAppCompositeId;
import fr.acoss.posdoc.database.entities.GenAppEntity;
import fr.acoss.posdoc.database.entities.GenBonEntity;
import fr.acoss.posdoc.database.entities.GenEtpEntity;
import fr.acoss.posdoc.database.entities.GenFicCompositeId;
import fr.acoss.posdoc.database.entities.GenFicEntity;
import fr.acoss.posdoc.database.entities.GenNotCompositeId;
import fr.acoss.posdoc.database.entities.GenNotEntity;
import fr.acoss.posdoc.database.entities.GenTarCompositeId;
import fr.acoss.posdoc.database.entities.GenTarEntity;
import fr.acoss.posdoc.database.entities.GenlieEntity;
import fr.acoss.posdoc.database.entities.ParametreEntity;
import fr.acoss.posdoc.database.entities.TarifEntity;
import fr.acoss.posdoc.database.entities.converters.CoutPliConverter;
import fr.acoss.posdoc.database.mappers.GenFicMapper;
import fr.acoss.posdoc.domain.bontravail.model.DeleteBonTravailManuelQuery;
import fr.acoss.posdoc.domain.bontravail.model.UpdateGenTarQuery;
import fr.acoss.posdoc.domain.bontravail.secondary.BonTravailManuelPersistence;
import fr.acoss.posdoc.domain.genfic.model.CreateOrUpdateBonTravailManuelDTO;
import fr.acoss.posdoc.domain.genfic.model.CreateOrUpdateBonTravailManuelPayload;
import fr.acoss.posdoc.exceptions.CustomExceptionMessage;
import fr.acoss.posdoc.types.GenEtpType;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.function.Function;

import static fr.acoss.posdoc.types.Constantes.APPINF_000;
import static fr.acoss.posdoc.types.ApplicationStatut.APPSTA_T;
import static fr.acoss.posdoc.types.Constantes.CLEBON;
import static fr.acoss.posdoc.types.CodeInformation.CODINF_0;
import static fr.acoss.posdoc.types.Constantes.CODSIG_S01;
import static fr.acoss.posdoc.types.Constantes.CODSIG_S02;
import static fr.acoss.posdoc.types.Constantes.FICINF_000;
import static fr.acoss.posdoc.types.Constantes.FICSTA_T;
import static fr.acoss.posdoc.types.Statut.TERMINE;
import static java.lang.Integer.parseInt;

@Service
public class BonTravailManuelPersistenceImpl
        extends BonTravailSearchPresistenceImpl
        implements BonTravailManuelPersistence {

    private static final GenFicMapper MAPPER_GENFIC = GenFicMapper.INSTANCE;
    private static final String ZERO = "0";
    private static final String LAST_SERIAL_NBR = "ZZ";
    private static final String CHAR_PERCOD_MANU = "M";
    private static final String ZERO_PREFIX_CODBON = "00000";
    private static final String FIRST_CODBON = "1";

    private final FichierRepository fichierRepository;
    private final GenAppRepository genAppRepository;
    private final GenBonRepository genBonRepository;
    private final ParametreRepository parametreRepository;
    private final TarifRepository tarifRepository;
    private final GenTarRepository genTarRepository;
    private final GenNotRepository genNotRepository;
    private final GenEtpRepository genEtpRepository;
    private final GenLieRepository genLieRepository;

    public BonTravailManuelPersistenceImpl(
            GenFicRepository genFicRepository,
            FichierRepository fichierRepository,
            GenAppRepository genAppRepository,
            GenBonRepository genBonRepository,
            ParametreRepository parametreRepository,
            TarifRepository tarifRepository,
            GenTarRepository genTarRepository,
            GenNotRepository genNotRepository,
            GenEtpRepository genEtpRepository,
            GenLieRepository genLieRepository
    ) {
        super(genFicRepository);
        this.fichierRepository = fichierRepository;
        this.genAppRepository = genAppRepository;
        this.genBonRepository = genBonRepository;
        this.parametreRepository = parametreRepository;
        this.tarifRepository = tarifRepository;
        this.genTarRepository = genTarRepository;
        this.genNotRepository = genNotRepository;
        this.genEtpRepository = genEtpRepository;
        this.genLieRepository = genLieRepository;
    }

    protected Function<FichierEntity, GenFicEntity> entityFichierToEntityGenFic() {
        return MAPPER_GENFIC::entityFichierToEntityGenFic;
    }

    @Override
    public void deleteBonTravailManuel(DeleteBonTravailManuelQuery query) {
        tarifRepository.deleteGentar(query);
        genNotRepository.deleteGennot(query);
        genFicRepository.deleteGenfic(query);
        genLieRepository.deleteGenliePere(query);
        genLieRepository.deleteGenlieFils(query);
        genEtpRepository.deleteGenEtp(query);
        genAppRepository.deleteGenApp(query);
    }

    public CreateOrUpdateBonTravailManuelDTO createOrUpdate(CreateOrUpdateBonTravailManuelPayload payload) {
        if (Boolean.TRUE.equals(payload.getIsedit())) {
            update(payload);
        } else {
            create(payload);
        }
        return createCreateOrUpdateBonTravailManuelDTO(payload);
    }

    private static CreateOrUpdateBonTravailManuelDTO createCreateOrUpdateBonTravailManuelDTO(final CreateOrUpdateBonTravailManuelPayload payload) {
        CreateOrUpdateBonTravailManuelDTO result = new CreateOrUpdateBonTravailManuelDTO();
        result.setNumcom(payload.getNumcom());
        result.setCodenv(payload.getCodenv());
        result.setCodorg(payload.getCodorg());
        result.setCodcom(payload.getCodcom());
        result.setCodfic(payload.getCodfic());
        result.setCodapp(payload.getCodapp());
        result.setPercod(payload.getPercod());
        return result;
    }

    private void create(CreateOrUpdateBonTravailManuelPayload payload) {
        payload.setPercod(incrementPercod(payload.getCodenv(), payload.getCodorg(), payload.getCodapp()));
        createGenApp(payload);
        createGenFic(payload);
        createGenTar(payload);
        createNotices(payload);
        createGenEtp(payload);
    }

    private void createGenApp(final CreateOrUpdateBonTravailManuelPayload payload) {
        genAppRepository.save(createGenAppEntity(createGenAppCompositeId(payload)));
    }

    private void createGenFic(final CreateOrUpdateBonTravailManuelPayload payload) {
        // Recherche et maj prochain Codbon
        // map Fichie to GenFic
        GenFicEntity genFicEntity = fichierRepository.findById(createFichierCompositeId(payload)).map(e -> entityFichierToEntityGenFic().apply(e)).orElseThrow();
        populateGenFicEntity(payload, genFicEntity);
        genFicRepository.save(genFicEntity);
    }

    private void createGenTar(CreateOrUpdateBonTravailManuelPayload payload) {
        genTarRepository.save(createGenTarEntity(payload));
    }

    private void createNotices(final CreateOrUpdateBonTravailManuelPayload payload) {
        if (payload.getNotices() != null && !payload.getNotices().isEmpty()) {
            List<GenNotEntity> notices = new ArrayList<>();
            payload.getNotices().forEach(notice -> {
                GenNotEntity genNotEntity = new GenNotEntity();
                GenNotCompositeId genNotCompositeId = new GenNotCompositeId();
                genNotCompositeId.setNumcom(payload.getNumcom());
                genNotCompositeId.setCodapp(payload.getCodapp());
                genNotCompositeId.setCodenv(payload.getCodenv());
                genNotCompositeId.setCodfic(payload.getCodfic());
                genNotCompositeId.setPercod(payload.getPercod());
                genNotCompositeId.setCodorg(payload.getCodorg());
                genNotCompositeId.setCodcom(payload.getCodcom());
                genNotCompositeId.setCodnot(notice.getCodnot());
                genNotEntity.setId(genNotCompositeId);
                genNotEntity.setPoinot(notice.getPoinot());
                notices.add(genNotEntity);
            });
            if (!notices.isEmpty()) {
                genNotRepository.saveAll(notices);
            }
        }
    }

    private void createGenEtp(CreateOrUpdateBonTravailManuelPayload payload) {
        GenEtpEntity genEtpEntity = genEtpRepository.save(createGenEtpEntity(payload));
        GenEtpEntity cloneFin = cloneGenEtpEntity(genEtpEntity);
        cloneFin.setTypetp(GenEtpType.FIN);
        genEtpRepository.save(cloneFin);

        GenEtpEntity cloneIdt = cloneGenEtpEntity(genEtpEntity);
        cloneIdt.setTypetp(GenEtpType.IDT);
        cloneIdt.setNumcom(payload.getNumcom());
        cloneIdt.setCodcom(payload.getCodcom());
        cloneIdt.setCodfic(payload.getCodfic());
        cloneIdt.setCodsig(CODSIG_S02);
        genEtpRepository.save(cloneIdt);

        // Création article Genlie
        List<GenlieEntity> liens = new ArrayList<>();
        liens.add(createGenlieEntity(genEtpEntity, cloneIdt));
        liens.add(createGenlieEntity(cloneIdt, cloneFin));
        genLieRepository.saveAll(liens);
    }

    //TODO voir si cette méthode existe déjà
    public String incrementPercod(final String codenv, final String codorg, final String codapp) {
        String percodPrefix = getPercodPrefix() + StringUtils.DASH;
        String incrementedPercod = CHAR_PERCOD_MANU + ZERO;
        String percod = this.genAppRepository.findPercodByPercod(codenv, codorg, codapp, percodPrefix + StringUtils.PERCENT).stream().max(String::compareTo).orElse(null);
        if (percod != null && !percod.isEmpty()) {
            String lastPercod = percod.substring(7, 9);
            if (lastPercod.equals(LAST_SERIAL_NBR)) {
                throw new CustomExceptionMessage("Impossible de créer une nouvelle période codifiée...");
            }
            incrementedPercod = incrementEnBase36(lastPercod);
        }
        return percodPrefix + incrementedPercod;
    }

    public static String getPercodPrefix() {
        GregorianCalendar calJour = new GregorianCalendar();
        int annee = calJour.get(Calendar.YEAR) - 2000;
        int mois = calJour.get(Calendar.MONTH) + 1;
        int jour = calJour.get(Calendar.DAY_OF_MONTH);
        return annee + (mois < 10 ? ZERO : StringUtils.EMPTY) + mois + (jour < 10 ? ZERO : StringUtils.EMPTY) + jour;
    }

    public static String incrementEnBase36(final String input) {
        return Integer.toString(Integer.parseInt(input.toLowerCase(), 36) + 1, 36).toUpperCase();
    }

    private static GenAppEntity createGenAppEntity(final GenAppCompositeId genAppCompositeId) {
        var genAppEntity = new GenAppEntity();
        genAppEntity.setId(genAppCompositeId);
        genAppEntity.setAppsta(APPSTA_T);
        genAppEntity.setAppinf(APPINF_000);
        genAppEntity.setManuel(true);
        genAppEntity.setDapplc(LocalDateTime.now());
        genAppEntity.setDappld(LocalDateTime.now());
        genAppEntity.setDapplt(LocalDateTime.now());
        return genAppEntity;
    }

    private static GenAppCompositeId createGenAppCompositeId(final CreateOrUpdateBonTravailManuelPayload payload) {
        var genAppCompositeId = new GenAppCompositeId();
        genAppCompositeId.setCodeEnv(payload.getCodenv());
        genAppCompositeId.setCodeApp(payload.getCodapp());
        genAppCompositeId.setCodeOrg(payload.getCodorg());
        genAppCompositeId.setPerCod(payload.getPercod());
        return genAppCompositeId;
    }

    private static FichierCompositeId createFichierCompositeId(final CreateOrUpdateBonTravailManuelPayload payload) {
        var fichierCompositeId = new FichierCompositeId();
        fichierCompositeId.setCodeEnv(payload.getCodenv());
        fichierCompositeId.setCodeOrg(payload.getCodorg());
        fichierCompositeId.setCodeApp(payload.getCodapp());
        fichierCompositeId.setCodeFich(payload.getCodfic());
        fichierCompositeId.setCodeCom(payload.getCodcom());
        return fichierCompositeId;
    }

    public int calculCoutTotal(final CreateOrUpdateBonTravailManuelPayload payload) {
        int iCoutot = 0;
        // Recherche tarif
        TarifEntity tarifEntity = tarifRepository.getTarifByTyptar(payload.getTyptar());
        if (tarifEntity != null) {
            CoutPliConverter coutPliConverter = new CoutPliConverter();
            iCoutot = coutPliConverter.convertToDatabaseColumn(tarifEntity.getCoutPli());
            // Recherche valeur de remise
            List<ParametreEntity> paramsRemises = parametreRepository.getParamsDeRemise();
            int nbrRemise = paramsRemises.size();
            if (nbrRemise >= 1 && Boolean.TRUE.equals(tarifEntity.getOptar1())) {
                iCoutot -= parseInt(paramsRemises.get(0).getValue());
            }
            if (nbrRemise >= 2 && Boolean.TRUE.equals(tarifEntity.getOptar2())) {
                iCoutot -= parseInt(paramsRemises.get(1).getValue());
            }
            if (nbrRemise >= 3 && Boolean.TRUE.equals(tarifEntity.getOptar3())) {
                iCoutot -= parseInt(paramsRemises.get(2).getValue());
            }
            iCoutot *= payload.getPlific();
        }
        return iCoutot;
    }

    private GenTarEntity createGenTarEntity(final CreateOrUpdateBonTravailManuelPayload payload) {
        GenTarEntity genTarEntity = new GenTarEntity();
        genTarEntity.setId(createGenTarCompositeId(payload));
        genTarEntity.setN45Coutot(calculCoutTotal(payload));
        genTarEntity.setN45Nbplis(payload.getPlific());
        return genTarEntity;
    }

    private static GenTarCompositeId createGenTarCompositeId(final CreateOrUpdateBonTravailManuelPayload payload) {
        GenTarCompositeId genTarCompositeId = new GenTarCompositeId();
        genTarCompositeId.setC45Codapp(payload.getCodapp());
        genTarCompositeId.setC45Codenv(payload.getCodenv());
        genTarCompositeId.setC45Codcom(payload.getCodcom());
        genTarCompositeId.setC45Numcom(payload.getNumcom());
        genTarCompositeId.setC45Codorg(payload.getCodorg());
        genTarCompositeId.setC45Codfic(payload.getCodfic());
        genTarCompositeId.setC45Percod(payload.getPercod());
        genTarCompositeId.setC45Typtar(payload.getTyptar());
        return genTarCompositeId;
    }

    private static GenlieEntity createGenlieEntity(final GenEtpEntity pere, final GenEtpEntity fils) {
        GenlieEntity genlieEntity = new GenlieEntity();
        genlieEntity.setIdpere(pere.getId());
        genlieEntity.setIdfils(fils.getId());
        return genlieEntity;
    }

    private static GenEtpEntity createGenEtpEntity(final CreateOrUpdateBonTravailManuelPayload payload) {
        GenEtpEntity genEtpEntity = new GenEtpEntity();
        genEtpEntity.setTypetp(GenEtpType.DEB);
        genEtpEntity.setCodenv(payload.getCodenv());
        genEtpEntity.setCodorg(payload.getCodorg());
        genEtpEntity.setCodapp(payload.getCodapp());
        genEtpEntity.setPercod(payload.getPercod());
        genEtpEntity.setCodsig(CODSIG_S01);
        genEtpEntity.setStatut(TERMINE);
        genEtpEntity.setCodinf(CODINF_0);
        genEtpEntity.setCreate(LocalDateTime.now());
        genEtpEntity.setValide(LocalDateTime.now());
        genEtpEntity.setTermin(LocalDateTime.now());
        return genEtpEntity;
    }

    private GenEtpEntity cloneGenEtpEntity(final GenEtpEntity genEtpEntity) {
        GenEtpEntity clone = new GenEtpEntity();
        clone.setTypetp(genEtpEntity.getTypetp());
        clone.setCodenv(genEtpEntity.getCodenv());
        clone.setCodorg(genEtpEntity.getCodorg());
        clone.setCodapp(genEtpEntity.getCodapp());
        clone.setPercod(genEtpEntity.getPercod());
        clone.setCodsig(genEtpEntity.getCodsig());
        clone.setStatut(genEtpEntity.getStatut());
        clone.setCodinf(genEtpEntity.getCodinf());
        clone.setCreate(genEtpEntity.getCreate());
        clone.setValide(genEtpEntity.getValide());
        clone.setTermin(genEtpEntity.getTermin());
        return clone;
    }

    private GenBonEntity getCodBon() {
        GenBonEntity genBonEntity = genBonRepository.findById(CLEBON).orElse(new GenBonEntity());
        GregorianCalendar calJour = new GregorianCalendar();
        String annee = Integer.toString(calJour.get(Calendar.YEAR)).substring(2);
        if (genBonEntity.getClebon() == null) {
            genBonEntity.setClebon(CLEBON);
            String codBon = genFicRepository.getCodBonByCodBon(annee + StringUtils.PERCENT);
            if (codBon != null) {
                genBonEntity.setCodbon(codBon);
            }
        }
        genBonEntity.setCodbon(incrementCodBon(genBonEntity.getCodbon(), annee));
        genBonRepository.flush();
        genBonRepository.save(genBonEntity);
        return genBonEntity;
    }

    public String incrementCodBon(final String codBon, final String annee) {
        String nextCodBon;
        if (codBon != null && !codBon.isEmpty() && codBon.substring(0, 2).equals(annee)) {
            int num = parseInt(codBon.substring(3)) + 1;
            String str = ZERO_PREFIX_CODBON + num;
            String quant = str.substring(str.length() - 6);
            nextCodBon = annee + StringUtils.DASH + quant;
        } else {
            nextCodBon = annee + StringUtils.DASH + ZERO_PREFIX_CODBON + FIRST_CODBON;
        }
        return nextCodBon;
    }

    private void update(final CreateOrUpdateBonTravailManuelPayload payload) {
        updateGenFic(payload);
        updateGenTar(payload);
        deleteOldNotices(payload);
        createNotices(payload);
    }

    private void updateGenFic(final CreateOrUpdateBonTravailManuelPayload payload) {
        GenFicCompositeId genFicCompositeId = createGenFicCompositeId(payload);
        GenFicEntity genFicEntity = genFicRepository.findById(genFicCompositeId).orElse(null);
        if (genFicEntity != null) {
            completeGenFicEntity(payload, genFicEntity);
            genFicRepository.save(genFicEntity);
            genFicRepository.flush();
        }
    }

    private static void completeGenFicEntity(final CreateOrUpdateBonTravailManuelPayload source, final GenFicEntity target) {
        target.setTyptar(source.getTyptar());
        target.setPagfic(source.getPagfic());
        target.setPlific(source.getPlific());
        target.setDappcr(DateUtils.replaceHour(source.getDappcr(), 12, 0, 0));
        target.setCodsit(source.getCodsit());
        target.setInform(source.getInform());
    }

    private void populateGenFicEntity(final CreateOrUpdateBonTravailManuelPayload source, final GenFicEntity target) {
        target.getId().setNumcom(source.getNumcom());
        target.getId().setPercod(source.getPercod());
        LocalDateTime dappcr = DateUtils.replaceHour(source.getDappcr(), 12, 0, 0);
        target.setDappcr(dappcr);
        target.setDrecep(dappcr);
        target.setTyptar(source.getTyptar());
        target.setCodsit(source.getCodsit());
        target.setPagfic(source.getPagfic());
        target.setPlific(source.getPlific());
        target.setInform(source.getInform());
        target.setFicsta(FICSTA_T);
        target.setFicinf(FICINF_000);
        target.setDfichc(LocalDateTime.now());
        target.setDfichd(LocalDateTime.now());
        target.setDficht(LocalDateTime.now());
        target.setCodbon(getCodBon().getCodbon());
    }

    private static GenFicCompositeId createGenFicCompositeId(final CreateOrUpdateBonTravailManuelPayload payload) {
        GenFicCompositeId genFicCompositeId = new GenFicCompositeId();
        genFicCompositeId.setPercod(payload.getPercod());
        genFicCompositeId.setCodfic(payload.getCodfic());
        genFicCompositeId.setCodenv(payload.getCodenv());
        genFicCompositeId.setCodcom(payload.getCodcom());
        genFicCompositeId.setNumcom(payload.getNumcom());
        genFicCompositeId.setCodapp(payload.getCodapp());
        genFicCompositeId.setCodorg(payload.getCodorg());
        return genFicCompositeId;
    }

    private void updateGenTar(final CreateOrUpdateBonTravailManuelPayload payload) {
        UpdateGenTarQuery updateGenTarQuery = new UpdateGenTarQuery();
        updateGenTarQuery.setCodapp(payload.getCodapp());
        updateGenTarQuery.setCodfic(payload.getCodfic());
        updateGenTarQuery.setCodorg(payload.getCodorg());
        updateGenTarQuery.setCodcom(payload.getCodcom());
        updateGenTarQuery.setCodenv(payload.getCodenv());
        updateGenTarQuery.setPercod(payload.getPercod());
        updateGenTarQuery.setTyptar(payload.getTyptar());
        updateGenTarQuery.setNbplis(payload.getPlific());
        updateGenTarQuery.setNumcom(payload.getNumcom());
        updateGenTarQuery.setCoutot(calculCoutTotal(payload));
        genTarRepository.updateGenTarForBonTravailManuel(updateGenTarQuery);
    }

    private void deleteOldNotices(final CreateOrUpdateBonTravailManuelPayload payload) {
        if (payload.getOldnotices() != null && !payload.getOldnotices().isEmpty()) {
            List<GenNotCompositeId> oldNotices = new ArrayList<>();
            payload.getOldnotices().forEach(codnot -> {
                GenNotCompositeId genNotCompositeId = new GenNotCompositeId();
                genNotCompositeId.setNumcom(payload.getNumcom());
                genNotCompositeId.setCodapp(payload.getCodapp());
                genNotCompositeId.setCodenv(payload.getCodenv());
                genNotCompositeId.setCodfic(payload.getCodfic());
                genNotCompositeId.setPercod(payload.getPercod());
                genNotCompositeId.setCodorg(payload.getCodorg());
                genNotCompositeId.setCodcom(payload.getCodcom());
                genNotCompositeId.setCodnot(codnot);
                oldNotices.add(genNotCompositeId);
            });
            if (!oldNotices.isEmpty()) {
                genNotRepository.deleteAllByIdIn(oldNotices);
            }
        }
    }
}

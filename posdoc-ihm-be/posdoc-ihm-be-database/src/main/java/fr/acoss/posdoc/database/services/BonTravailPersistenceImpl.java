package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.DateUtils;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.database.dao.GenFicRepository;
import fr.acoss.posdoc.domain.bontravail.model.BonTravailPdfInput;
import fr.acoss.posdoc.domain.bontravail.model.BonTravailUpdateDTO;
import fr.acoss.posdoc.domain.bontravail.model.BonTravailUpdatePayload;
import fr.acoss.posdoc.domain.bontravail.model.LogErreurUpdateBonTravailPayload;
import fr.acoss.posdoc.domain.bontravail.model.UserInfoPayload;
import fr.acoss.posdoc.domain.bontravail.secondary.BonTravailPersistence;
import fr.acoss.posdoc.domain.genetp.secondary.GenEtpPersistence;
import fr.acoss.posdoc.domain.genfic.model.GenFic;
import fr.acoss.posdoc.domain.parametre.secondary.ParametrePersistence;
import fr.acoss.posdoc.domain.utilog.UtiLogUtil;
import fr.acoss.posdoc.domain.utilog.primary.UtiLogService;
import fr.acoss.posdoc.exceptions.BonTravailException;
import fr.acoss.posdoc.exceptions.CustomExceptionMessage;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.FileStorageException;
import org.apache.commons.codec.binary.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import javax.transaction.Transactional;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import static fr.acoss.posdoc.common.util.ErrorMessageUtils.ERROR_ADELAIDE_COMMUNICATION;
import static fr.acoss.posdoc.common.util.ErrorMessageUtils.ERROR_ADELAIDE_NOT_CONFIGURED;
import static fr.acoss.posdoc.common.util.ErrorMessageUtils.ERROR_ADELAIDE_TIMEOUT;
import static fr.acoss.posdoc.common.util.ErrorMessageUtils.ERROR_PDF_FILE_NOT_FOUND;
import static fr.acoss.posdoc.common.util.ErrorMessageUtils.ERROR_PDF_FILE_NOT_FOUND_ADELAIDE;
import static fr.acoss.posdoc.common.util.ErrorMessageUtils.ERROR_PDF_FILE_READ;
import static fr.acoss.posdoc.common.util.StringUtils.BON_TRAVAIL_PREFIX;
import static fr.acoss.posdoc.common.util.StringUtils.CONFIG_ADELAIDE_EXPORT_PATH;
import static fr.acoss.posdoc.common.util.StringUtils.CONFIG_ADELAIDE_SERVER_HOST;
import static fr.acoss.posdoc.common.util.StringUtils.CONFIG_BON_TRAVAIL_DIRECTORY;
import static fr.acoss.posdoc.common.util.StringUtils.DASH;
import static fr.acoss.posdoc.common.util.StringUtils.EMPTY;
import static fr.acoss.posdoc.common.util.StringUtils.HTTP_PROTOCOL;
import static fr.acoss.posdoc.common.util.StringUtils.PDF_EXTENSION;
import static fr.acoss.posdoc.common.util.StringUtils.SLASH;
import static fr.acoss.posdoc.common.util.StringUtils.UNDERSCORE;
import static fr.acoss.posdoc.types.Constantes.GENFIC_MAX_DELMSP;
import static fr.acoss.posdoc.types.Parametre.PARAM_CODE_ETPMAS;
import static fr.acoss.posdoc.types.Parametre.PARAM_ETPMAS_VAL_1;

@Service
public class BonTravailPersistenceImpl
        extends BonTravailSearchPresistenceImpl
        implements BonTravailPersistence {

    private static final Logger LOG = LoggerFactory.getLogger(BonTravailPersistenceImpl.class);

    private final ParametrePersistence parametrePersistence;
    private final UtiLogService utiLogService;
    private final GenEtpPersistence genEtpPersistence;
    private final Environment environment;
    private final RestTemplate restTemplate;

    @Autowired
    public BonTravailPersistenceImpl(
            GenFicRepository genFicRepository,
            ParametrePersistence parametrePersistence,
            UtiLogService utiLogService,
            GenEtpPersistence genEtpPersistence,
            Environment environment,
            RestTemplate restTemplate
    ) {
        super(genFicRepository);

        this.parametrePersistence = parametrePersistence;
        this.utiLogService = utiLogService;
        this.genEtpPersistence = genEtpPersistence;
        this.environment = environment;
        this.restTemplate = restTemplate;
    }


    @Override
    @Transactional
    public List<BonTravailUpdateDTO> updateAll(List<GenFic> genFicList) {
        var entity = genFicList.stream().map(e -> domainToEntityFunction().apply(e)).collect(Collectors.toList());
        return genFicRepository.saveAll(entity).stream().map(e -> entityToDomainBonTravail().apply(e)).collect(Collectors.toList());
    }

    @Override
    public List<BonTravailUpdateDTO> updateBonTravail(List<BonTravailUpdatePayload> listBonTravailUpdate, UserInfoPayload userInfoPayload) {
        List<BonTravailUpdateDTO> result = new ArrayList<>();
        List<GenFic> genFicList = new ArrayList<>();
        List<BonTravailUpdatePayload> genEtpList = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        processBonTravailUpdates(listBonTravailUpdate, genFicList, genEtpList, errors, userInfoPayload);

        if (errors.isEmpty()) {
            handleSuccessfulUpdates(genFicList, genEtpList, result, userInfoPayload);
        } else {
            throw new CustomExceptionMessage(String.join(",", errors));
        }
        return result;
    }


    private void processBonTravailUpdates(List<BonTravailUpdatePayload> listBonTravailUpdate, List<GenFic> genFicList, List<BonTravailUpdatePayload> genEtpList, List<String> errors, UserInfoPayload userInfoPayload) {
        listBonTravailUpdate.forEach(bonTravail -> {
            try {
                processSingleBonTravailUpdate(bonTravail, genFicList, genEtpList, userInfoPayload);
            } catch (BonTravailException e) {
                errors.add(String.format("Bon de travail %s : %s", bonTravail.getId(), e.getMessage()));
            }
        });
    }

    private void processSingleBonTravailUpdate(BonTravailUpdatePayload bonTravail, List<GenFic> genFicList, List<BonTravailUpdatePayload> genEtpList, UserInfoPayload userInfoPayload) {
        LocalDateTime dateExp = DateUtils.dateTimeFormatterFromStringISO(bonTravail.getDatexp());
        String etpmas = this.parametrePersistence.getValueByCode(PARAM_CODE_ETPMAS);
        String info = (bonTravail.getInform() != null && !bonTravail.getInform().isEmpty()) ? bonTravail.getInform() : null;
        GenFic genFic = findById(bonTravail.getCodenv(), bonTravail.getCodorg(), bonTravail.getCodapp(), bonTravail.getPercod(), bonTravail.getCodcom(), bonTravail.getNumcom(), bonTravail.getCodfic());
        boolean isGenFicChanged = false;

        // on modifie la date si elle a été changée et non null
        if (dateExp != null && (genFic.getDfiexp() == null || dateExp.toLocalDate().compareTo(genFic.getDfiexp().toLocalDate()) != 0 )) {
            genFic.setDfiexp(dateExp);
            genFic.setDelmsp(getNewDelmsp(genFic.getDrecep(), dateExp, genFic, userInfoPayload.getUser(), userInfoPayload.getFormid()));
            isGenFicChanged = true;
            if (etpmas != null && etpmas.equals(PARAM_ETPMAS_VAL_1)) {
                genEtpList.add(bonTravail);
            }
        }
        // on modifie l'info si elle a été changée
        if (!Objects.equals(info, genFic.getInform())) {
            genFic.setInform(info);
            isGenFicChanged = true;
        }

        if (isGenFicChanged) {
            genFicList.add(genFic);
        }
    }

    private void handleSuccessfulUpdates(List<GenFic> genFicList, List<BonTravailUpdatePayload> genEtpList, List<BonTravailUpdateDTO> result, UserInfoPayload userInfoPayload) {
        if (!genFicList.isEmpty()) {
            result.addAll(updateAll(genFicList));
        } else {
            String msgErr = "Aucune modification effectuée...";
            logErreurUpdateBonTravail(new LogErreurUpdateBonTravailPayload("", "", "", msgErr, userInfoPayload.getUser(), userInfoPayload.getFormid()));
        }
        if (!genEtpList.isEmpty()) {
            genEtpList.forEach(genEtpPersistence::termineGenEtpByBonTravail);
        }
    }

    private void logErreurUpdateBonTravail(LogErreurUpdateBonTravailPayload logErreurUpdateBonTravailPayload) {
        String params = UtiLogUtil.PARAM_PREFIX_GENFIC + logErreurUpdateBonTravailPayload.getCodenv() + UtiLogUtil.PARAM_SEP + logErreurUpdateBonTravailPayload.getCodorg() + UtiLogUtil.PARAM_SEP + logErreurUpdateBonTravailPayload.getCodapp();
        this.utiLogService.insertUtilog(logErreurUpdateBonTravailPayload.getErreur(), params, UtiLogUtil.ACT_VALIDER, ContextHolder.getContext().getHost(), logErreurUpdateBonTravailPayload.getUser(), logErreurUpdateBonTravailPayload.getFormid());
    }

    private Boolean isFirstDateBeforeSecond(LocalDate firstDate, LocalDate secondDate) {
        return firstDate.isBefore(secondDate);
    }

    private Integer getNewDelmsp(final LocalDateTime dateRecep, final LocalDateTime dateExp, final GenFic genFic, final String user, final String formid) {
        Integer newDelmsp = 1;
        if (dateExp != null) {
            checkDateExp(dateRecep, dateExp, genFic, user, formid);
            newDelmsp = DateUtils.calculDelmsp(dateRecep, dateExp);
            if (newDelmsp > GENFIC_MAX_DELMSP) {
                String msgErr = "La date expédition " + DateUtils.formatLocalDateEnFr(dateExp) + " est trop loin par rapport à la date de prise en compte " + DateUtils.formatLocalDateEnFr(dateRecep);
                logErreurUpdateBonTravail(new LogErreurUpdateBonTravailPayload(genFic.getCodenv(), genFic.getCodorg(), genFic.getCodapp(), msgErr, user, formid));
                throw new CustomExceptionMessage(msgErr);
            }
        }
        return newDelmsp;
    }

    private void checkDateExp(LocalDateTime dateRecep, LocalDateTime dateExp, GenFic genFic, String user, String formid) {
        boolean isFirstDateBeforeSecond = Boolean.TRUE.equals(isFirstDateBeforeSecond(dateExp.toLocalDate(), dateRecep.toLocalDate()));
        if (isFirstDateBeforeSecond) {
            String msgErr = "La date expédition " + DateUtils.formatLocalDateEnFr(dateExp) + " doit être ultérieure ou égale à " + DateUtils.formatLocalDateEnFr(dateRecep);
            logErreurUpdateBonTravail(new LogErreurUpdateBonTravailPayload(genFic.getCodenv(), genFic.getCodorg(), genFic.getCodapp(), msgErr, user, formid));
            throw new CustomExceptionMessage(msgErr);
        }
    }

    @Override
    public String getBonTravailPdf(BonTravailPdfInput input) {
        String bonTravailDirectory = environment.getProperty(CONFIG_BON_TRAVAIL_DIRECTORY);
        String fileName = buildFileName(input);

        LOG.debug("Récupération du bon de travail PDF: {}", fileName);

        if (isLocalDirectoryConfigured(bonTravailDirectory)) {
            return getPdfFromLocalDirectory(bonTravailDirectory, fileName);
        } else {
            LOG.debug("Répertoire local non configuré, utilisation du serveur Adelaide");
            return downloadPdfFromAdelaide(fileName);
        }
    }

    private boolean isLocalDirectoryConfigured(String directory) {
        return directory != null && !directory.trim().isEmpty();
    }

    private String getPdfFromLocalDirectory(String directory, String fileName) {
        LOG.debug("Recherche du fichier dans le répertoire local: {}", directory);
        byte[] pdfBytes = readPdfFromLocalDirectory(directory, fileName);
        if (pdfBytes.length > 0) {
            LOG.info("Fichier PDF trouvé dans le répertoire local: {}", fileName);
            return Base64.encodeBase64String(pdfBytes);
        }
        throw buildFileNotFoundException(fileName, directory);
    }

    private ElementNotFoundException buildFileNotFoundException(String fileName, String directory) {
        String errorMessage = String.format(ERROR_PDF_FILE_NOT_FOUND, fileName + PDF_EXTENSION, directory);
        LOG.error(errorMessage);
        return new ElementNotFoundException(errorMessage, fileName);
    }

    private byte[] readPdfFromLocalDirectory(String directory, String fileName) {
        try {
            Path filePath = buildFilePath(directory, fileName);
            if (Files.exists(filePath)) {
                LOG.debug("Lecture du fichier: {}", filePath);
                return Files.readAllBytes(filePath);
            }
            LOG.debug("Le fichier n'existe pas: {}", filePath);
            return new byte[0];
        } catch (IOException e) {
            throw buildFileStorageException(fileName, directory, e);
        }
    }

    private Path buildFilePath(String directory, String fileName) {
        return Paths.get(directory, fileName + PDF_EXTENSION);
    }

    private FileStorageException buildFileStorageException(String fileName, String directory, IOException cause) {
        String errorMessage = String.format(ERROR_PDF_FILE_READ, fileName + PDF_EXTENSION, directory);
        return new FileStorageException(errorMessage, cause);
    }

    private String downloadPdfFromAdelaide(String fileName) {
        String adelaideBaseUrl = getAdelaideBaseUrl();
        String pdfUrl = buildPdfUrl(adelaideBaseUrl, fileName);

        LOG.info("Tentative de téléchargement du PDF depuis Adelaide: {}", pdfUrl);

        try {
            byte[] pdfBytes = downloadPdfBytes(pdfUrl);
            validatePdfBytes(pdfBytes, fileName, pdfUrl);
            LOG.info("Fichier PDF téléchargé avec succès depuis Adelaide: {}", fileName);
            return Base64.encodeBase64String(pdfBytes);
        } catch (ResourceAccessException e) {
            throw handleResourceAccessException(adelaideBaseUrl, fileName, pdfUrl, e);
        } catch (RestClientException e) {
            throw handleRestClientException(fileName, pdfUrl, e);
        }
    }

    private String getAdelaideBaseUrl() {
        String host = environment.getProperty(CONFIG_ADELAIDE_SERVER_HOST);

        if (host == null || host.isEmpty()) {
            throw new FileStorageException(ERROR_ADELAIDE_NOT_CONFIGURED, new IllegalStateException());
        }

        return HTTP_PROTOCOL + host + environment.getProperty(CONFIG_ADELAIDE_EXPORT_PATH);
    }

    private String buildPdfUrl(String baseUrl, String fileName) {
        return baseUrl + SLASH + fileName + PDF_EXTENSION;
    }

    private byte[] downloadPdfBytes(String pdfUrl) {
        return restTemplate.getForObject(pdfUrl, byte[].class);
    }

    private void validatePdfBytes(byte[] pdfBytes, String fileName, String pdfUrl) {
        if (pdfBytes == null || pdfBytes.length == 0) {
            String errorMessage = String.format(ERROR_PDF_FILE_NOT_FOUND_ADELAIDE, fileName + PDF_EXTENSION);
            LOG.error(errorMessage);
            throw new ElementNotFoundException(errorMessage, pdfUrl);
        }
    }

    private FileStorageException handleResourceAccessException(String adelaideBaseUrl, String fileName, String pdfUrl, ResourceAccessException e) {
        String errorMessage = String.format(ERROR_ADELAIDE_TIMEOUT, adelaideBaseUrl, fileName + PDF_EXTENSION);
        LOG.error("Timeout ou erreur d'accès lors du téléchargement depuis Adelaide: {} - {}", pdfUrl, e.getMessage());
        return new FileStorageException(errorMessage, e);
    }

    private FileStorageException handleRestClientException(String fileName, String pdfUrl, RestClientException e) {
        String errorMessage = String.format(ERROR_ADELAIDE_COMMUNICATION, fileName + PDF_EXTENSION);
        LOG.error("Erreur RestClient lors du téléchargement depuis Adelaide: {} - {}", pdfUrl, e.getMessage());
        return new FileStorageException(errorMessage, e);
    }

    private String buildFileName(BonTravailPdfInput input) {
        if (Boolean.TRUE.equals(input.getIsManuel())) {
            return buildManualBonTravailFileName(input);
        } else {
            return buildStandardBonTravailFileName(input);
        }
    }

    private String buildManualBonTravailFileName(BonTravailPdfInput input) {
        return String.join(UNDERSCORE,
            input.getCodenv(),
            input.getCodorg(),
            input.getCodapp(),
            input.getPercod(),
            input.getNumcom(),
            input.getCodcom(),
            input.getCodfic()
        ).toLowerCase();
    }

    private String buildStandardBonTravailFileName(BonTravailPdfInput input) {
        return BON_TRAVAIL_PREFIX + input.getCodbon().replace(DASH, EMPTY);
    }
}

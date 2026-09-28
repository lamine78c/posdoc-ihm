package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.ConvertorUtils;
import fr.acoss.posdoc.common.util.DateUtils;
import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.common.util.StringUtils;
import fr.acoss.posdoc.common.util.UploadPdfFileUtils;
import fr.acoss.posdoc.database.TransactionalReadOnly;
import fr.acoss.posdoc.database.TransactionalReadWrite;
import fr.acoss.posdoc.database.dao.NoticePdfRepository;
import fr.acoss.posdoc.database.dao.NoticeRepository;
import fr.acoss.posdoc.database.entities.NoticeEntity;
import fr.acoss.posdoc.database.entities.NoticePdfEntity;
import fr.acoss.posdoc.database.mappers.NoticeMapper;
import fr.acoss.posdoc.domain.notice.model.Base64FileInput;
import fr.acoss.posdoc.domain.notice.model.Notice;
import fr.acoss.posdoc.domain.notice.model.NoticeOccurrenceApplication;
import fr.acoss.posdoc.domain.notice.model.SearchNoticesOccurrenceApplicationQuery;
import fr.acoss.posdoc.domain.notice.secondary.NoticePersistence;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.FileStorageException;
import fr.acoss.posdoc.exceptions.NoticeDeletionException;
import fr.acoss.posdoc.types.NoticePornotType;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.fileupload.disk.DiskFileItem;
import org.springframework.core.env.Environment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class NoticePersistenceImpl extends AbstractObjectPersistence<NoticeEntity, String, Notice>
    implements NoticePersistence {

  public static final String ERROR_CREATING_MULTIPART_FILE_FROM_BASE_64 = "Error creating MultipartFile from Base64";
  private static final NoticeMapper MAPPER = NoticeMapper.INSTANCE;
  public static final String PROVIDED_FILE_IS_EMPTY = "The provided file is empty.";
  public static final String UNABLE_TO_DELETE_PDF_FILE = "Unable to delete PDF file:";
  public static final String ERROR_DELETING_FILE = "Error deleting file: ";
  public static final String MEGA_BYTE = "MB";
  public static final String ZERO_MEGA_BYTE = "0MB";
  public static final int NUMBER_1024 = 1024;
  public static final String FILE_SIZE_EXCEEDS_MAXIMUM_LIMIT = "File size exceeds the maximum limit of ";
  public static final String FILE_NOT_FOUND = "PDF file not found";
  public static final String ERROR_READING_FILE = "Error reading the PDF file";

  private final NoticeRepository noticeRepository;
  private final NoticePdfRepository noticePdfRepository;

  private final Environment environment;

  public NoticePersistenceImpl(
          NoticeRepository noticeRepository,
          NoticePdfRepository noticePdfRepository,
          Environment environment) {
    this.noticeRepository = noticeRepository;
    this.noticePdfRepository = noticePdfRepository;
    this.environment = environment;
  }

  @Override
  protected JpaSpecificationExecutor<NoticeEntity> getSpecificationExecutor() {
    return noticeRepository;
  }

  @Override
  protected JpaRepository<NoticeEntity, String> getRepository() {
    return noticeRepository;
  }

  @Override
  protected Function<NoticeEntity, Notice> entityToDomainFunction() {
    return MAPPER::entityToDomain;
  }

  @Override
  protected Function<Notice, NoticeEntity> domainToEntityFunction() {
    return MAPPER::domainToEntity;
  }

  @Override
  @TransactionalReadOnly
  public List<Notice> selectAll() {
    return noticeRepository.findAll().stream().map(e -> entityToDomainFunction().apply(e)).collect(Collectors.toList());
  }

  @Override
  @TransactionalReadOnly
  public List<Notice> getAllActiveNotices() {
    return noticeRepository.findAllActivNotices().stream()
            .map(this::mapToNotice)
            .collect(Collectors.toList());
  }

  @Override
  @TransactionalReadOnly
  public List<Notice> getAllExpiredNotices() {
    return noticeRepository.findAllExpiredNotices().stream()
            .map(this::mapToNotice)
            .collect(Collectors.toList());
  }

  @Override
  @TransactionalReadWrite
  public List<Notice> createNotice(Notice noticePayload) {
    NoticeEntity noticeEntity = domainToEntityFunction().apply(noticePayload);

    if (noticeRepository.existsById(noticeEntity.getCodnot())) {
      throw new AlreadyExistingElement(ParamsUtils.CODNOT, noticeEntity.getCodnot());
    }

    // ne pas enregistrer le codsit quand le pornot type égale à N (nationnale)
    if(String.valueOf(noticePayload.getPornot()).equals(String.valueOf(NoticePornotType.N))) {
      noticeEntity.setCodsit(null);
    }

    noticeRepository.save(noticeEntity);

    return getAllActiveNotices();
  }

  @Override
  @TransactionalReadWrite
  public List<Notice> updateNotice(Notice noticePayload) {
    NoticeEntity noticeEntity = domainToEntityFunction().apply(noticePayload);

    if (!noticeRepository.existsById(noticeEntity.getCodnot())) {
      throw new ElementNotFoundException(ParamsUtils.CODNOT, noticeEntity.getCodnot());
    }

    // ne pas enregistrer le codsit quand le pornot type égale à N (nationnale)
    if(String.valueOf(noticePayload.getPornot()).equals(String.valueOf(NoticePornotType.N))) {
      noticeEntity.setCodsit(null);
    }

    noticeRepository.save(noticeEntity);

    return getAllActiveNotices();
  }

  @Override
  @TransactionalReadWrite
  public List<Notice> deleteNotice(String codnot) {
    if (!noticeRepository.existsById(codnot)) {
      throw new ElementNotFoundException(ParamsUtils.CODNOT, codnot);
    }

    if (noticeRepository.isNoticeUsedInNotific(codnot)) {
      throw new NoticeDeletionException(codnot);
    }

    deleteNoticePdfFile(codnot);

    noticeRepository.deleteById(codnot);

    return getAllActiveNotices();
  }

  @Override
  @TransactionalReadWrite
  public List<Notice> uploadNoticePdf(String codnot, Base64FileInput fileInput) {
    MultipartFile file = convertBase64ToMultipartFile(fileInput)
            .orElseThrow(() -> new FileStorageException(
                    UploadPdfFileUtils.FILE_IS_EMPTY_MESSAGE,
                    new IllegalStateException(PROVIDED_FILE_IS_EMPTY)));

    validateFileSize(file);

    return noticeRepository.findById(codnot)
            .map(noticeEntity -> {
              saveNoticePdf(file, noticeEntity);
              return getAllActiveNotices();
            })
            .orElseThrow(() -> new ElementNotFoundException(ParamsUtils.CODNOT, codnot));
  }

  @Override
  @TransactionalReadWrite
  public List<Notice> deleteNoticePdf(String codnot) {
      if (!noticeRepository.existsById(codnot)) {
          throw new ElementNotFoundException(ParamsUtils.CODNOT, codnot);
      }

    deleteNoticePdfFile(codnot);

    return getAllActiveNotices();
  }

    @Override
    @TransactionalReadOnly
    public String getNoticePdf(String codnot) {
      NoticePdfEntity notice = noticePdfRepository.findById(codnot)
              .orElseThrow(() -> new ElementNotFoundException(ParamsUtils.CODNOT, codnot));

      String filePath = notice.getPdfFilePath();
      File file = new File(filePath);

      if (!file.exists()) {
        throw new ElementNotFoundException(FILE_NOT_FOUND, filePath);
      }

      try {
        byte[] fileContent = Files.readAllBytes(file.toPath());
        return Base64.encodeBase64String(fileContent);
      } catch (IOException e) {
        throw new FileStorageException(ERROR_READING_FILE, e);
      }
    }

  @Override
  @TransactionalReadOnly
  public List<NoticeOccurrenceApplication> getNoticesOccurrenceApplication(SearchNoticesOccurrenceApplicationQuery query) {
    return this.noticeRepository.getNoticesOccurrenceApplication(query)
            .stream().map(this::mapToNoticeOccurrenceApplication)
            .collect(Collectors.toList());
  }

  private Notice mapToNotice(Map<String, String> map) {
    return Notice.builder()
            .codnot(map.get(ParamsUtils.CODNOT))
            .libnot(map.get(ParamsUtils.LIBNOT))
            .fornot(map.get(ParamsUtils.FORNOT))
            .poinot(ConvertorUtils.convertToBigDecimal(map.get(ParamsUtils.POINOT)))
            .pornot(NoticePornotType.valueOf(map.get(ParamsUtils.PORNOT)))
            .dnotir(DateUtils.dateFormatterFromStringISO(map.get(ParamsUtils.DNOTIR)))
            .perime(Short.valueOf(map.get(ParamsUtils.PERIME)))
            .codsit(map.get(ParamsUtils.CODSIT))
            .pdfFilePath(map.get(ParamsUtils.PDF_FILE_PATH))
            .isNotAuthorisedToBeDeleted(ConvertorUtils.convertToInteger(map.get(ParamsUtils.IS_NOT_AUTHORISED_TO_BE_DELETED)) > 0)
            .build();
  }

  /**
   * Save the notice pdf file and the pdf file path in the database
   */
  private void saveNoticePdf(MultipartFile file, NoticeEntity noticeEntity) {
    String noticesDirectoryPath = getNoticesDirectoryPath();
    String filePath = UploadPdfFileUtils.saveFile(file, noticeEntity.getCodnot(), noticesDirectoryPath);

    NoticePdfEntity noticePdfEntity = new NoticePdfEntity();
    noticePdfEntity.setCodnot(noticeEntity.getCodnot());
    noticePdfEntity.setPdfFilePath(filePath);
    noticePdfEntity.setUploadDate(new Date());

    noticePdfRepository.save(noticePdfEntity);
  }

  public String getNoticesDirectoryPath() {
      return environment.getProperty(StringUtils.NOTICES_DIRECTORY);
  }

  private Long getMaxFileSizeInBytes() {
    String maxFileSize = environment.getProperty(StringUtils.MAX_FILE_SIZE, ZERO_MEGA_BYTE);

    return Long.parseLong(maxFileSize.replace(MEGA_BYTE, StringUtils.EMPTY)) * NUMBER_1024 * NUMBER_1024;
  }

  private void validateFileSize(MultipartFile file) {
    long maxFileSize = getMaxFileSizeInBytes();
    if (file.getSize() > maxFileSize) {
      throw new FileStorageException(FILE_SIZE_EXCEEDS_MAXIMUM_LIMIT + maxFileSize, new IllegalStateException());
    }
  }

  /**
   * Convert a Base64FileInput to a MultipartFile
   */
  private Optional<MultipartFile> convertBase64ToMultipartFile(Base64FileInput fileInput) {
    byte[] decodedBytes = Base64.decodeBase64(fileInput.getContent());

    if (decodedBytes.length == 0) {
      return Optional.empty();
    }

    try {
      DiskFileItem fileItem = new DiskFileItem(
              fileInput.getFilename(),
              UploadPdfFileUtils.PDF_CONTENT_TYPE,
              false,
              fileInput.getFilename(),
              decodedBytes.length,
              null
      );

      fileItem.getOutputStream().write(decodedBytes);
      return Optional.of(new CommonsMultipartFile(fileItem));

    } catch (IOException e) {
      throw new FileStorageException(ERROR_CREATING_MULTIPART_FILE_FROM_BASE_64, e);
    }
  }

  /**
   * Delete the notice pdf file and the pdf file path in the database
   */
  private void deleteNoticePdfFile(String codnot) {
    noticePdfRepository.findById(codnot).ifPresent(noticePdf -> {
      File pdfFile = new File(noticePdf.getPdfFilePath());

      try {
        java.nio.file.Files.deleteIfExists(pdfFile.toPath());
        noticePdfRepository.deleteById(codnot);
      } catch (IOException e) {
        throw new FileStorageException(ERROR_DELETING_FILE + pdfFile.getPath(), e);
      }
    });
  }

  private NoticeOccurrenceApplication mapToNoticeOccurrenceApplication(Map<String, String> map) {
    NoticeOccurrenceApplication notice = new NoticeOccurrenceApplication();
    notice.setCodnot(map.get(ParamsUtils.CODNOT));
    notice.setPoinot(Integer.valueOf(map.get(ParamsUtils.POINOT)));
    notice.setFornot(map.get(ParamsUtils.FORNOT));
    notice.setPornot(NoticePornotType.valueOf(map.get(ParamsUtils.PORNOT)));
    notice.setLibnot(map.get(ParamsUtils.LIBNOT));
    notice.setCodsit(map.get(ParamsUtils.CODSIT));

    return notice;
  }

}


package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.ParamsUtils;
import fr.acoss.posdoc.common.util.UploadPdfFileUtils;
import fr.acoss.posdoc.database.TestApplication;
import fr.acoss.posdoc.database.dao.NoticeRepository;
import fr.acoss.posdoc.domain.notice.model.Base64FileInput;
import fr.acoss.posdoc.domain.notice.model.Notice;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import fr.acoss.posdoc.exceptions.FileStorageException;
import fr.acoss.posdoc.exceptions.NoticeDeletionException;
import fr.acoss.posdoc.types.NoticePornotType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Base64;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = TestApplication.class)
@Sql(scripts = {"classpath:sql/notice/insert-notice.sql"} ,executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(scripts = {"classpath:sql/notice/clean-notice.sql"} ,executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
@ActiveProfiles("test")
class NoticePersistenceImplTest {

  public static final String CODNOT_TEST = "TEST";
  public static final String LIBNOT = "Test Notice";
  public static final String FORNOT = "ED";
  public static final String CODSIT = "DEV";
  public static final String CODNOT_CESU = "CESU";
  public static final String CODNOT_CESU2 = "CESU2";
  public static final String UPDATED_NOTICE = "Updated Notice";
  public static final String NON_EXISTING_CODNOT = "NON_EXISTING_CODNOT";
  public static final String TEST_PDF = "test.pdf";
  public static final String CODNOT_CNAV = "CNAV";
  public static final String TEST_CONTENT = "test content";
  @Autowired
  private NoticePersistenceImpl noticePersistence;

  @Autowired
  private NoticeRepository noticeRepository;

  @Test
  void createNotice_SuccessfullyCreatesNotice() {
    Notice noticePayload = new Notice();
    noticePayload.setCodnot(CODNOT_TEST);
    noticePayload.setLibnot(LIBNOT);
    noticePayload.setFornot(FORNOT);
    noticePayload.setPoinot(BigDecimal.valueOf(10));
    noticePayload.setPornot(NoticePornotType.N);
    noticePayload.setDnotir(LocalDate.now());
    noticePayload.setPerime((short) 0);
    noticePayload.setCodsit(CODSIT);

    List<Notice> notices = noticePersistence.createNotice(noticePayload);

    assertTrue(noticeRepository.existsById(CODNOT_TEST));
    assertEquals(5, notices.size());
    Notice updatedNotice = notices.stream()
            .filter(notice -> notice.getCodnot().equals(CODNOT_TEST))
            .findFirst()
            .orElse(null);

    assertNotNull(updatedNotice);
    assertEquals(LIBNOT, updatedNotice.getLibnot());
    assertEquals(BigDecimal.valueOf(10), updatedNotice.getPoinot());
    assertEquals((short) 0, updatedNotice.getPerime());
    assertEquals(null, updatedNotice.getCodsit());
  }

  @Test
  void createNotice_ThrowsAlreadyExistingElement() {
    Notice noticePayload = new Notice();
    noticePayload.setCodnot(CODNOT_CESU);
    noticePayload.setLibnot(LIBNOT);
    noticePayload.setFornot(FORNOT);
    noticePayload.setPoinot(BigDecimal.valueOf(10));
    noticePayload.setPornot(NoticePornotType.L);
    noticePayload.setDnotir(LocalDate.now());
    noticePayload.setPerime((short) 0);
    noticePayload.setCodsit(CODSIT);

    Exception exception = assertThrows(AlreadyExistingElement.class, () -> noticePersistence.createNotice(noticePayload));

    String expectedMessage = ParamsUtils.CODNOT;
    String actualMessage = exception.getMessage();

    assertTrue(actualMessage.contains(expectedMessage));
  }

  @Test
  void updateNotice_SuccessfullyUpdatesNotice() {
    Notice noticePayload = new Notice();
    noticePayload.setCodnot(CODNOT_CESU);
    noticePayload.setLibnot(UPDATED_NOTICE);
    noticePayload.setFornot(FORNOT);
    noticePayload.setPoinot(BigDecimal.valueOf(20));
    noticePayload.setPornot(NoticePornotType.N);
    noticePayload.setDnotir(LocalDate.now());
    noticePayload.setPerime((short) 0);
    noticePayload.setCodsit(CODSIT);

    List<Notice> notices = noticePersistence.updateNotice(noticePayload);

    assertEquals(4, notices.size());
    Notice updatedNotice = notices.stream()
            .filter(notice -> notice.getCodnot().equals(CODNOT_CESU))
            .findFirst()
            .orElse(null);

    assertNotNull(updatedNotice);
    assertEquals(UPDATED_NOTICE, updatedNotice.getLibnot());
    assertEquals(BigDecimal.valueOf(20), updatedNotice.getPoinot());
    assertEquals(null, updatedNotice.getCodsit());
  }

  @Test
  void updateNotice_ThrowsElementNotFoundException() {
    Notice noticePayload = new Notice();
    noticePayload.setCodnot(NON_EXISTING_CODNOT);
    noticePayload.setLibnot(LIBNOT);
    noticePayload.setFornot(FORNOT);
    noticePayload.setPoinot(BigDecimal.valueOf(10));
    noticePayload.setPornot(NoticePornotType.L);

    noticePayload.setDnotir(LocalDate.now());
    noticePayload.setPerime((short) 0);
    noticePayload.setCodsit(CODSIT);

    Exception exception = assertThrows(ElementNotFoundException.class, () -> noticePersistence.updateNotice(noticePayload));

    String expectedMessage = ParamsUtils.CODNOT;
    String actualMessage = exception.getMessage();

    assertTrue(actualMessage.contains(expectedMessage));
  }

  @Test
  void deleteNotice_SuccessfullyDeletesNotice() {
    List<Notice> notices = noticePersistence.deleteNotice(CODNOT_CESU);

    assertFalse(noticeRepository.existsById(CODNOT_CESU));
    assertEquals(3, notices.size());
    assertFalse(notices.stream().anyMatch(notice -> notice.getCodnot().equals(CODNOT_CESU)));
  }

  @Test
  void deleteNotice_ThrowsElementNotFoundException() {
    Exception exception = assertThrows(ElementNotFoundException.class, () -> noticePersistence.deleteNotice(NON_EXISTING_CODNOT));

    String expectedMessage = ParamsUtils.CODNOT;
    String actualMessage = exception.getMessage();

    assertTrue(actualMessage.contains(expectedMessage));
  }

  @Test
  void deleteNotice_ThrowsNoticeDeletionException() {
    Exception exception = assertThrows(NoticeDeletionException.class, () -> noticePersistence.deleteNotice(CODNOT_CESU2));

    String actualMessage = exception.getMessage();

    assertTrue(actualMessage.contains(CODNOT_CESU));
  }

  @Test
  void uploadNoticePdf_SuccessfullyPdfUploaded() {
    Base64FileInput fileInput = new Base64FileInput(TEST_PDF, Base64.getEncoder().encodeToString(TEST_CONTENT.getBytes()));

    List<Notice> notices = noticePersistence.uploadNoticePdf(CODNOT_CNAV, fileInput);

    Notice updatedNotice = notices.stream()
            .filter(notice -> notice.getCodnot().equals(CODNOT_CNAV))
            .findFirst()
            .orElse(null);

    assertNotNull(updatedNotice);
    MultipartFile multipartFile = new MockMultipartFile(
            fileInput.getFilename(),
            fileInput.getFilename(),
            UploadPdfFileUtils.PDF_CONTENT_TYPE,
            Base64.getDecoder().decode(fileInput.getContent())
    );
    String noticesDirectoryPath = noticePersistence.getNoticesDirectoryPath();
    String filePath = UploadPdfFileUtils.getFilePath(multipartFile, updatedNotice.getCodnot(), noticesDirectoryPath);
    assertEquals(filePath, updatedNotice.getPdfFilePath());
  }

  @Test
  void uploadNoticePdf_ThrowsElementNotFoundException() {
    Base64FileInput fileInput = new Base64FileInput(TEST_PDF, Base64.getEncoder().encodeToString(TEST_CONTENT.getBytes()));

    Exception exception = assertThrows(ElementNotFoundException.class, () -> noticePersistence.uploadNoticePdf(NON_EXISTING_CODNOT, fileInput));

    String expectedMessage = ParamsUtils.CODNOT;
    String actualMessage = exception.getMessage();

    assertTrue(actualMessage.contains(expectedMessage));
  }

  @Test
  void uploadNoticePdf_ThrowsFileStorageException() {
    Base64FileInput fileInput = new Base64FileInput(TEST_PDF, Base64.getEncoder().encodeToString(new byte[0]));

    Exception exception = assertThrows(FileStorageException.class, () -> noticePersistence.uploadNoticePdf(CODNOT_CNAV, fileInput));

    String actualMessage = exception.getMessage();

    assertTrue(actualMessage.contains(UploadPdfFileUtils.FILE_IS_EMPTY_MESSAGE));
  }
}
package fr.acoss.posdoc.ws.scheduler.service;

import fr.acoss.posdoc.domain.joblock.model.JobLock;
import fr.acoss.posdoc.domain.joblock.primary.JobLockService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.FileTime;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class BonTravailPurgeServiceTest {

    private BonTravailPurgeService service;

    @Mock
    private JobLockService jobLockService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        doNothing().when(jobLockService).unlockForce(anyString(), anyInt());

        JobLock mockJobLock = new JobLock();
        mockJobLock.setName("PURGE_BON_TRAVAIL");
        mockJobLock.setServer("localhost");
        mockJobLock.setDate(LocalDateTime.now());

        when(jobLockService.create(any(JobLock.class))).thenReturn(mockJobLock);
        doNothing().when(jobLockService).delete(anyString());

        service = new BonTravailPurgeService(jobLockService, tempDir.toString(), 90, true, false, 1);
    }

    @AfterEach
    void tearDown() throws IOException {
        if (Files.exists(tempDir)) {
            try (Stream<Path> paths = Files.walk(tempDir)) {
                paths.sorted((a, b) -> b.compareTo(a))
                     .forEach(path -> {
                         try {
                             Files.deleteIfExists(path);
                         } catch (IOException e) {
                             // Ignore
                         }
                     });
            }
        }
    }

    @Test
    void purge_withOldFiles_shouldDeleteThem() throws IOException {
        Path oldFile1 = createFileWithAge(tempDir, "old_bonTravail_1.pdf", 100);
        Path oldFile2 = createFileWithAge(tempDir, "old_bonTravail_2.pdf", 120);
        Path recentFile = createFileWithAge(tempDir, "recent_bonTravail.pdf", 30);

        service.purge();

        assertFalse(Files.exists(oldFile1), "Le fichier ancien devrait être supprimé");
        assertFalse(Files.exists(oldFile2), "Le fichier ancien devrait être supprimé");
        assertTrue(Files.exists(recentFile), "Le fichier récent devrait être conservé");
    }

    @Test
    void purge_withDryRun_shouldNotDeleteFiles() throws IOException {
        service = new BonTravailPurgeService(jobLockService, tempDir.toString(), 90, true, true, 1);
        Path oldFile = createFileWithAge(tempDir, "old_bonTravail.pdf", 100);

        service.purge();

        assertTrue(Files.exists(oldFile), "En mode dry-run, les fichiers ne doivent pas être supprimés");
    }

    @Test
    void purge_withDisabledPurge_shouldNotDeleteFiles() throws IOException {
        service = new BonTravailPurgeService(jobLockService, tempDir.toString(), 90, false, false, 1);
        Path oldFile = createFileWithAge(tempDir, "old_bonTravail.pdf", 100);

        service.purge();

        assertTrue(Files.exists(oldFile), "Si la purge est désactivée, les fichiers ne doivent pas être supprimés");
    }

    @Test
    void purge_withNonExistentDirectory_shouldNotThrowException() {
        service = new BonTravailPurgeService(jobLockService, "/chemin/inexistant", 90, true, false, 1);

        assertDoesNotThrow(() -> service.purge());
    }

    @Test
    void purge_withOnlyRecentFiles_shouldNotDeleteAnything() throws IOException {
        Path recentFile1 = createFileWithAge(tempDir, "recent_1.pdf", 10);
        Path recentFile2 = createFileWithAge(tempDir, "recent_2.pdf", 30);
        Path recentFile3 = createFileWithAge(tempDir, "recent_3.pdf", 60);

        service.purge();

        assertTrue(Files.exists(recentFile1), "Le fichier récent devrait être conservé");
        assertTrue(Files.exists(recentFile2), "Le fichier récent devrait être conservé");
        assertTrue(Files.exists(recentFile3), "Le fichier récent devrait être conservé");
    }

    @Test
    void purge_withCustomRetentionDays_shouldRespectIt() throws IOException {
        service = new BonTravailPurgeService(jobLockService, tempDir.toString(), 30, true, false, 1);

        Path file40days = createFileWithAge(tempDir, "file_40days.pdf", 40);
        Path file20days = createFileWithAge(tempDir, "file_20days.pdf", 20);

        service.purge();

        assertFalse(Files.exists(file40days), "Le fichier de 40 jours devrait être supprimé (rétention: 30 jours)");
        assertTrue(Files.exists(file20days), "Le fichier de 20 jours devrait être conservé (rétention: 30 jours)");
    }

    @Test
    void purge_withExactRetentionAge_shouldNotDelete() throws IOException {
        Path exactFile = createFileWithAge(tempDir, "exact_90days.pdf", 90);

        service.purge();

        assertTrue(Files.exists(exactFile), "Le fichier exactement à la limite ne devrait pas être supprimé");
    }

    @Test
    void purge_withMixedFileTypes_shouldPurgeOnlyPdf() throws IOException {
        Path oldPdf = createFileWithAge(tempDir, "old.pdf", 100);
        Path oldTxt = createFileWithAge(tempDir, "old.txt", 100);
        Path oldJson = createFileWithAge(tempDir, "old.json", 100);

        service.purge();

        assertFalse(Files.exists(oldPdf), "Le PDF ancien devrait être supprimé");
        assertTrue(Files.exists(oldTxt), "Le TXT ne devrait PAS être supprimé (pas un PDF)");
        assertTrue(Files.exists(oldJson), "Le JSON ne devrait PAS être supprimé (pas un PDF)");
    }

    @Test
    void purge_withConcurrentExecution_shouldPreventDuplicateExecution() throws IOException {
        when(jobLockService.create(any(JobLock.class))).thenReturn(null);

        Path oldFile = createFileWithAge(tempDir, "old_bonTravail.pdf", 100);

        service.purge();

        assertTrue(Files.exists(oldFile), "Le fichier devrait rester car le verrou n'a pas été acquis");
    }

    @Test
    void purge_withLockAcquired_shouldExecutePurge() throws IOException {
        JobLock mockJobLock = new JobLock();
        mockJobLock.setName("PURGE_BON_TRAVAIL");
        mockJobLock.setServer("localhost");
        mockJobLock.setDate(LocalDateTime.now());

        when(jobLockService.create(any(JobLock.class))).thenReturn(mockJobLock);

        Path oldFile = createFileWithAge(tempDir, "old_bonTravail.pdf", 100);

        service.purge();

        assertFalse(Files.exists(oldFile), "Le fichier devrait être supprimé car le verrou a été acquis");
    }

    @Test
    void purge_whenLockAcquired_shouldReleaseLockAfterExecution() throws IOException {
        JobLock mockJobLock = new JobLock();
        mockJobLock.setName("PURGE_BON_TRAVAIL");
        mockJobLock.setServer("localhost");
        mockJobLock.setDate(LocalDateTime.now());

        when(jobLockService.create(any(JobLock.class))).thenReturn(mockJobLock);

        createFileWithAge(tempDir, "old_bonTravail.pdf", 100);

        service.purge();

        verify(jobLockService).delete("PURGE_BON_TRAVAIL");
    }

    @Test
    void purge_whenLockNotAcquired_shouldNotCallDelete() throws IOException {
        when(jobLockService.create(any(JobLock.class))).thenReturn(null);

        createFileWithAge(tempDir, "old_bonTravail.pdf", 100);

        service.purge();

        verify(jobLockService, never()).delete(anyString());
    }

    @Test
    void purge_whenExceptionOccurs_shouldStillReleaseLock() throws IOException {
        JobLock mockJobLock = new JobLock();
        mockJobLock.setName("PURGE_BON_TRAVAIL");
        mockJobLock.setServer("localhost");
        mockJobLock.setDate(LocalDateTime.now());

        when(jobLockService.create(any(JobLock.class))).thenReturn(mockJobLock);

        service = new BonTravailPurgeService(jobLockService, null, 90, true, false, 1);

        assertDoesNotThrow(() -> service.purge());

        verify(jobLockService).delete("PURGE_BON_TRAVAIL");
    }

    private Path createFileWithAge(Path directory, String filename, int ageInDays) throws IOException {
        Path file = directory.resolve(filename);
        Files.writeString(file, "Test content for " + filename);

        Instant pastDate = Instant.now().minus(ageInDays, ChronoUnit.DAYS);
        Files.setLastModifiedTime(file, FileTime.from(pastDate));

        return file;
    }
}

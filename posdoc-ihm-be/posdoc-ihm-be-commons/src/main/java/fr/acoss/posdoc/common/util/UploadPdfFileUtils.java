package fr.acoss.posdoc.common.util;

import fr.acoss.posdoc.exceptions.FileStorageException;
import fr.acoss.posdoc.exceptions.InvalidFileTypeException;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Objects;

public class UploadPdfFileUtils {

    private static final String PDF_EXTENSION = ".pdf";
    public static final String PDF_CONTENT_TYPE = "application/pdf";
    public static final String PDF_FILES_ARE_ALLOWED = "Only PDF files are allowed.";
    public static final String EXTENSION_MUST_BE_PDF = "The file extension must be .pdf.";
    public static final String UNABLE_TO_SAVE_FILE = "Unable to save file ";
    public static final String FILE_IS_EMPTY_MESSAGE = "Unable to save file. The file is empty.";

    private UploadPdfFileUtils() {
        throw new IllegalStateException("Utility class");
    }

    /**
     * Validate the file
     */
    public static void validatePdfFile(MultipartFile file) {
        if (!PDF_CONTENT_TYPE.equals(file.getContentType())) {
            throw new InvalidFileTypeException(PDF_FILES_ARE_ALLOWED);
        }
        if (!Objects.requireNonNull(file.getOriginalFilename()).toLowerCase().endsWith(PDF_EXTENSION)) {
            throw new InvalidFileTypeException(EXTENSION_MUST_BE_PDF);
        }
    }

    /**
     * Get the file path
     */
    public static String getFilePath(MultipartFile file, String filename, String noticesDirectoryPath) {
        String sanitizedFilename = filename.replace(StringUtils.SLASH, StringUtils.POUND).trim();
        String fileExtension = getFileExtension(file.getOriginalFilename());
        String newFileName = sanitizedFilename + fileExtension;

        return noticesDirectoryPath + newFileName;
    }

    /**
     * Save the file in the file system
     */
    public static String saveFile(MultipartFile file, String filename, String noticesDirectory) {
        validatePdfFile(file);
        String filePath = getFilePath(file, filename, noticesDirectory);
        File destination = new File(filePath);

        try {
            file.transferTo(destination);
            return filePath;
        } catch (IOException e) {
            throw new FileStorageException(UNABLE_TO_SAVE_FILE + file.getOriginalFilename(), e);
        }
    }

    /**
     * Get the file extension
     */
    private static String getFileExtension(String fileName) {
        if (fileName != null && fileName.contains(StringUtils.DOT)) {
            return fileName.substring(fileName.lastIndexOf(StringUtils.DOT));
        }
        return StringUtils.EMPTY;
    }
}

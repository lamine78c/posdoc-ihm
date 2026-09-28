package fr.acoss.posdoc.common.util;

import java.sql.Timestamp;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class DateUtils {
    public static final String MIDNIGHT_TIME = "00:00:00";
    public static final String END_OF_DAY_TIME = "23:59:59";
    public static final DateTimeFormatter DATE_TIME_FORMATTER_ISO = new DateTimeFormatterBuilder()
            .appendPattern("yyyy-MM-dd HH:mm:ss")
            .optionalStart()
            .appendFraction(ChronoField.MICRO_OF_SECOND, 1, 6, true)
            .optionalEnd()
            .toFormatter();

    public static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    public static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private static final DateTimeFormatter DAY_OF_MONTH_FORMATTER = DateTimeFormatter.ofPattern("dd");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MM");
    private static final String SLASH = "/";
    private static final String DASH = "-";
    private static final String SPACE = " ";
    private static final DateTimeFormatter DATE_FORMATTER_ISO = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private DateUtils() {
        throw new IllegalStateException("Utility class");
    }

    private static LocalDate easterDays(final Integer year) {
        // First calculate the date of easter using Delambre's algorithm.
        double a = year % 19;
        double b = Math.floor((double) year / 100);
        double c = year % 100;
        double d = Math.floor(b / 4);
        double e = b % 4;
        double f = Math.floor((b + 8) / 25);
        double g = Math.floor((b - f + 1) / 3);
        double h = (19 * a + b - d - g + 15) % 30;
        double i = Math.floor(c / 4);
        double k = c % 4;
        double l = (32 + 2 * e + 2 * i - h - k) % 7;
        double m = Math.floor((a + 11 * h + 22 * l) / 451);
        double n = (h + l - 7 * m + 114);
        double month = Math.floor(n / 31);
        double day = n % 31 + 1;
        return LocalDate.of(year, (int) month, (int) day);
    }

    public static String formatDate(final String date, final String time) {
        if (date == null || date.isEmpty()) {
            return null;
        }
        String[] parts = date.split(SLASH);
        return parts[2] + SLASH + parts[1] + SLASH + parts[0] + SPACE + time;
    }

    public static String formatDateWithDash(final String date, final String time) {
        if (date == null || date.isEmpty()) {
            return null;
        }
        String[] parts = date.split(SLASH);
        return parts[2] + DASH + parts[1] + DASH + parts[0] + SPACE + time;
    }

    public static List<DayAndMonth> getListFeries(final Integer year) {
        LocalDate easterDays = easterDays(year);
        LocalDate paques = easterDays.plusDays(1);
        LocalDate ascension = easterDays.plusDays(39);
        LocalDate pentecote = easterDays.plusDays(50);
        List<DayAndMonth> listJoursFeries = new ArrayList<>();
        listJoursFeries.add(new DayAndMonth(1, 1));
        listJoursFeries.add(new DayAndMonth(5, 1));
        listJoursFeries.add(new DayAndMonth(5, 8));
        listJoursFeries.add(new DayAndMonth(7, 14));
        listJoursFeries.add(new DayAndMonth(8, 15));
        listJoursFeries.add(new DayAndMonth(11, 1));
        listJoursFeries.add(new DayAndMonth(11, 11));
        listJoursFeries.add(new DayAndMonth(12, 25));
        listJoursFeries.add(new DayAndMonth(paques.getMonthValue(), paques.getDayOfMonth()));
        listJoursFeries.add(new DayAndMonth(ascension.getMonthValue(), ascension.getDayOfMonth()));
        listJoursFeries.add(new DayAndMonth(pentecote.getMonthValue(), pentecote.getDayOfMonth()));
        return listJoursFeries;
    }

    public static boolean isJourFerie(final LocalDateTime dateTime) {
        List<DayAndMonth> listJoursFeries = getListFeries(dateTime.getYear());
        DayAndMonth dayAndMonth = new DayAndMonth(dateTime.getMonthValue(), dateTime.getDayOfMonth());
        return listJoursFeries.contains(dayAndMonth);
    }

    public static boolean isWeekend(final LocalDateTime dateTime) {
        DayOfWeek day = DayOfWeek.of(dateTime.get(ChronoField.DAY_OF_WEEK));
        return day.equals(DayOfWeek.SUNDAY) || day.equals(DayOfWeek.SATURDAY);
    }

    public static LocalDateTime dateTimeFormatterFromString(final String dateStr, final DateTimeFormatter dateTimeFormatter) {
        if (dateStr != null && !dateStr.isEmpty()) {
            return LocalDateTime.parse(dateStr, dateTimeFormatter);
        }
        return null;
    }

    public static LocalDateTime dateTimeFormatterFromStringISO(final String date) {
        return DateUtils.dateTimeFormatterFromString(date, DateUtils.DATE_TIME_FORMATTER_ISO);
    }

    public static LocalDate dateFormatterFromStringISO(String dateStr) {
        if (dateStr != null) {
            return LocalDate.parse(dateStr, DATE_FORMATTER_ISO);
        }
        return null;
    }

    public static String formatLocalDateEnFr(final LocalDateTime dateTime) {
        return dateTime.format(DAY_OF_MONTH_FORMATTER) + SLASH + dateTime.format(MONTH_FORMATTER) + SLASH + dateTime.getYear();
    }

    public static LocalDateTime getDateAtStartOfDay(final String date){
        if( date != null) {
            return LocalDate.parse(date).atStartOfDay();
        }
        return null;
    }

    public static Integer calculDelmsp(final LocalDateTime drecep, final LocalDateTime dfiexp) {
        int delmsp = 0;
        long diffDays = ChronoUnit.DAYS.between(drecep, dfiexp);
        int yearDrecep = drecep.getYear();
        int yearDfiexp = dfiexp.getYear();
        List<DayAndMonth> listJoursFeriesDrecep = DateUtils.getListFeries(yearDrecep);
        List<DayAndMonth> listJoursFeriesDfiexp = DateUtils.getListFeries(yearDfiexp);
        if (diffDays != 0) {
            for (int i = 1; i <= diffDays; i++) {
                LocalDateTime diffDay = drecep.plusDays(i);
                int yearDiffDay = diffDay.getYear();
                DayAndMonth dayAndMonth = new DayAndMonth(diffDay.getMonthValue(), diffDay.getDayOfMonth());
                boolean isFeriesDrecep = yearDiffDay == yearDrecep && listJoursFeriesDrecep.contains(dayAndMonth);
                boolean isFeriesDfiexp = yearDiffDay == yearDfiexp && listJoursFeriesDfiexp.contains(dayAndMonth);
                if (!DateUtils.isWeekend(diffDay) && !isFeriesDrecep && !isFeriesDfiexp) {
                    delmsp++;
                }
            }
        }
        return delmsp;
    }

    public static LocalDateTime replaceHour(final LocalDateTime d, final int hour, final int minute, final int second) {
        return LocalDateTime.of(d.getYear(), d.getMonthValue(), d.getDayOfMonth(),hour,minute,second);
    }

    public static Date getDateFromLocalDateTime(LocalDateTime localDateTime) {
        return Date.from(localDateTime.atZone(ZoneId.systemDefault())
            .toInstant());
    }

    public static LocalDateTime getLocalDateTimeFromTimestamp(Timestamp timestamp) {
        if (timestamp != null) {
            return timestamp.toLocalDateTime();
        }
        return null;
    }

    public static LocalDateTime getLocaldateTimeFromSqlDate(Date date) {
        if (date != null) {
            return Instant.ofEpochMilli(date.getTime())
                .atZone(ZoneId.systemDefault()).toLocalDateTime();
        }
        return null;
    }

    /**
     * Removes milliseconds from a date string if present
     * @param date the date string (ex: "2025-09-30 14:35:08.0")
     * @return the cleaned date string (ex: "2025-09-30 14:35:08")
     */
    public static String cleanDateString(String date) {
        if (date == null || date.isEmpty()) {
            return date;
        }
        if (date.contains(".")) {
            return date.substring(0, date.lastIndexOf('.'));
        }
        return date;
    }

    /**
     * Converts java.util.Date to java.time.LocalDate
     * @param date the date to convert
     * @return the LocalDate or null if date is null
     */
    public static LocalDate convertDateToLocalDate(Date date) {
        if (date == null) {
            return null;
        }
        LocalDateTime localDateTime = getLocaldateTimeFromSqlDate(date);
        return localDateTime != null ? localDateTime.toLocalDate() : null;
    }

}

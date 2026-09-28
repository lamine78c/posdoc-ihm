package fr.acoss.posdoc.common.util;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DateUtilsTest {

    @Test
    void testFormatDate() {
        assertEquals("1974/12/28 00:00:00", DateUtils.formatDate("28/12/1974", DateUtils.MIDNIGHT_TIME));
        assertEquals("1974/12/28 23:59:59", DateUtils.formatDate("28/12/1974", DateUtils.END_OF_DAY_TIME));
        assertNull(DateUtils.formatDate(null, DateUtils.END_OF_DAY_TIME));
    }

    @Test
    void testFormatDateWithDash() {
        assertEquals("1974-12-28 00:00:00", DateUtils.formatDateWithDash("28/12/1974", DateUtils.MIDNIGHT_TIME));
        assertEquals("1974-12-28 23:59:59", DateUtils.formatDateWithDash("28/12/1974", DateUtils.END_OF_DAY_TIME));
        assertNull(DateUtils.formatDateWithDash(null, DateUtils.END_OF_DAY_TIME));
    }

    @Test
    void testIsWkEnd() {
        assertTrue(DateUtils.isWeekend(LocalDateTime.of(2025, 1, 4, 0, 0)));
        assertTrue(DateUtils.isWeekend(LocalDateTime.of(2025, 1, 5, 0, 0)));
        assertFalse(DateUtils.isWeekend(LocalDateTime.of(2025, 1, 6, 0, 0)));
        assertFalse(DateUtils.isWeekend(LocalDateTime.of(2025, 1, 8, 0, 0)));
    }

    @Test
    void testIsJourFerie() {
        assertTrue(DateUtils.isJourFerie(LocalDateTime.of(2025, 1, 1, 0, 0)));
        assertTrue(DateUtils.isJourFerie(LocalDateTime.of(2025, 4, 21, 0, 0)));
        assertTrue(DateUtils.isJourFerie(LocalDateTime.of(2025, 5, 1, 0, 0)));
        assertTrue(DateUtils.isJourFerie(LocalDateTime.of(2025, 5, 8, 0, 0)));
        assertTrue(DateUtils.isJourFerie(LocalDateTime.of(2025, 5, 29, 0, 0)));
        assertTrue(DateUtils.isJourFerie(LocalDateTime.of(2025, 6, 9, 0, 0)));
        assertTrue(DateUtils.isJourFerie(LocalDateTime.of(2025, 7, 14, 0, 0)));
        assertTrue(DateUtils.isJourFerie(LocalDateTime.of(2025, 8, 15, 0, 0)));
        assertTrue(DateUtils.isJourFerie(LocalDateTime.of(2025, 11, 1, 0, 0)));
        assertTrue(DateUtils.isJourFerie(LocalDateTime.of(2025, 11, 11, 0, 0)));
        assertTrue(DateUtils.isJourFerie(LocalDateTime.of(2025, 12, 25, 0, 0)));
        assertFalse(DateUtils.isJourFerie(LocalDateTime.of(2025, 1, 15, 0, 0)));
    }

    @Test
    void testDateTimeFormatterString() {
        assertEquals(LocalDateTime.of(2026, 12, 25, 1, 1, 1), DateUtils.dateTimeFormatterFromString("2026-12-25 01:01:01", DateUtils.DATE_TIME_FORMATTER_ISO));
        assertNull(DateUtils.dateTimeFormatterFromString(null, DateUtils.DATE_TIME_FORMATTER_ISO));
    }

    @Test
    void testDateTimeFormatterFromStringISO() {
        assertEquals(LocalDateTime.of(2026, 12, 25, 1, 1, 1), DateUtils.dateTimeFormatterFromStringISO("2026-12-25 01:01:01"));
        assertNull(DateUtils.dateTimeFormatterFromStringISO(null));
    }

    @Test
    void testLocalDateEnFr() {
        assertEquals("03/01/2025", DateUtils.formatLocalDateEnFr(LocalDateTime.of(2025, 1, 3, 13, 32, 12)));
    }

    @Test
    void testCalculDelais() {
        assertEquals(Integer.valueOf(1), DateUtils.calculDelmsp(LocalDateTime.of(2025, 1, 7, 0, 0, 0), LocalDateTime.of(2025, 1, 8, 0, 0, 0)));
        assertEquals(Integer.valueOf(0), DateUtils.calculDelmsp(LocalDateTime.of(2025, 1, 7, 0, 0, 0), LocalDateTime.of(2025, 1, 7, 0, 0, 0)));
        assertEquals(Integer.valueOf(0), DateUtils.calculDelmsp(LocalDateTime.of(2025, 1, 8, 0, 0, 0), LocalDateTime.of(2025, 1, 7, 0, 0, 0)));
        assertEquals(Integer.valueOf(2), DateUtils.calculDelmsp(LocalDateTime.of(2024, 12, 30, 0, 0, 0), LocalDateTime.of(2025, 1, 2, 0, 0, 0)));
    }

    @Test
    void testStartDay(){
        assertNull(DateUtils.getDateAtStartOfDay(null));
        assertEquals("2024-12-28T00:00",DateUtils.getDateAtStartOfDay("2024-12-28").toString());
    }
}

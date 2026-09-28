package fr.acoss.posdoc.domain.tarpos.primay;

import fr.acoss.posdoc.domain.tarif.secondary.TarifPersistence;
import fr.acoss.posdoc.domain.common.validator.Validator;
import fr.acoss.posdoc.domain.tarpos.model.Tarpos;
import fr.acoss.posdoc.domain.tarpos.primary.TarposService;
import fr.acoss.posdoc.domain.tarpos.secondary.TarposPersistence;
import fr.acoss.posdoc.domain.tarpos.validators.TarposValidators;
import fr.acoss.posdoc.exceptions.AlreadyExistingElement;
import fr.acoss.posdoc.exceptions.ElementNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TarposServiceTest {

    @Mock
    private TarposPersistence tarposPersistence;

    @Mock
    private TarifPersistence tarifsPersistence;

    private TarposService tarposService;

    @BeforeEach
    void setUp() {
        tarposService = new TarposService(tarposPersistence, tarifsPersistence);
    }

    @Test
    void should_get_all_tarpos() {
        Tarpos tarpos = mock(Tarpos.class);
        when(tarposPersistence.selectAllWithAuthorisation()).thenReturn(List.of(tarpos));
        tarposService.getTarpos();
        verify(tarposPersistence).selectAllWithAuthorisation();
        verify(tarifsPersistence).selectAll();
        verify(tarpos).setTarifs(any());
    }

    @Test
    void should_get_tarpos_has_perimetre_equal_to_zero() {
        tarposService.getTarposByPerimetreEqualToZero();
        verify(tarposPersistence).allTarposByPerimetreEqualToZero();
    }

    @Test
    void should_create_tarpos_nominal() {
        Tarpos tarpos = mock(Tarpos.class);
        when(tarpos.getType()).thenReturn("TP1");
        when(tarpos.getLibelle()).thenReturn("le libelle de tarpos");
        when(tarpos.getOrdre()).thenReturn(10);

        when(tarposPersistence.exists("TP1")).thenReturn(false);

        try (MockedStatic<TarposValidators> mockedStatic = mockStatic(TarposValidators.class)) {
            Validator<String> mockTypeValidator = mock(Validator.class);
            Validator<String> mockLibelleValidator = mock(Validator.class);
            Validator<Integer> mockOrdreValidator = mock(Validator.class);

            mockedStatic.when(TarposValidators::typeValidator).thenReturn(mockTypeValidator);
            mockedStatic.when(TarposValidators::libelleValidator).thenReturn(mockLibelleValidator);
            mockedStatic.when(TarposValidators::ordreValidator).thenReturn(mockOrdreValidator);

            tarposService.createTarpos(tarpos);

            verify(tarposPersistence).create(tarpos);
            verify(mockTypeValidator).validate("TP1");
            verify(mockLibelleValidator).validate("le libelle de tarpos");
            verify(mockOrdreValidator).validate(10);
        }
    }

    @Test
    void should_create_tarpos_throw_exception() {
        Tarpos tarpos = mock(Tarpos.class);
        when(tarpos.getType()).thenReturn("TP1");
        when(tarpos.getLibelle()).thenReturn("le libelle de tarpos");
        when(tarpos.getOrdre()).thenReturn(10);

        when(tarposPersistence.exists("TP1")).thenReturn(true);

        try (MockedStatic<TarposValidators> mockedStatic = mockStatic(TarposValidators.class)) {
            Validator<String> mockTypeValidator = mock(Validator.class);
            Validator<String> mockLibelleValidator = mock(Validator.class);
            Validator<Integer> mockOrdreValidator = mock(Validator.class);

            mockedStatic.when(TarposValidators::typeValidator).thenReturn(mockTypeValidator);
            mockedStatic.when(TarposValidators::libelleValidator).thenReturn(mockLibelleValidator);
            mockedStatic.when(TarposValidators::ordreValidator).thenReturn(mockOrdreValidator);

            var ex = assertThrows(AlreadyExistingElement.class, () -> tarposService.createTarpos(tarpos));

            assertEquals("L'élément Tarpos (TP1) est déjà existant", ex.getMessage());
            verify(mockTypeValidator).validate("TP1");
            verify(mockLibelleValidator).validate("le libelle de tarpos");
            verify(mockOrdreValidator).validate(10);
        }
    }

    @Test
    void should_update_tarpos_nominal() {
        Tarpos tarpos = mock(Tarpos.class);
        when(tarpos.getType()).thenReturn("TP1");
        when(tarpos.getLibelle()).thenReturn("le libelle de tarpos");
        when(tarpos.getOrdre()).thenReturn(10);

        when(tarposPersistence.exists("TP1")).thenReturn(true);

        try (MockedStatic<TarposValidators> mockedStatic = mockStatic(TarposValidators.class)) {
            Validator<String> mockTypeValidator = mock(Validator.class);
            Validator<String> mockLibelleValidator = mock(Validator.class);
            Validator<Integer> mockOrdreValidator = mock(Validator.class);

            mockedStatic.when(TarposValidators::typeValidator).thenReturn(mockTypeValidator);
            mockedStatic.when(TarposValidators::libelleValidator).thenReturn(mockLibelleValidator);
            mockedStatic.when(TarposValidators::ordreValidator).thenReturn(mockOrdreValidator);

            tarposService.updateTarpos(tarpos);

            verify(tarposPersistence).update(tarpos);
            verify(mockTypeValidator).validate("TP1");
            verify(mockLibelleValidator).validate("le libelle de tarpos");
            verify(mockOrdreValidator).validate(10);
        }
    }

    @Test
    void should_update_tarpos_throw_exception() {
        Tarpos tarpos = mock(Tarpos.class);
        when(tarpos.getType()).thenReturn("TP1");
        when(tarpos.getLibelle()).thenReturn("le libelle de tarpos");
        when(tarpos.getOrdre()).thenReturn(10);

        when(tarposPersistence.exists("TP1")).thenReturn(false);

        try (MockedStatic<TarposValidators> mockedStatic = mockStatic(TarposValidators.class)) {
            Validator<String> mockTypeValidator = mock(Validator.class);
            Validator<String> mockLibelleValidator = mock(Validator.class);
            Validator<Integer> mockOrdreValidator = mock(Validator.class);

            mockedStatic.when(TarposValidators::typeValidator).thenReturn(mockTypeValidator);
            mockedStatic.when(TarposValidators::libelleValidator).thenReturn(mockLibelleValidator);
            mockedStatic.when(TarposValidators::ordreValidator).thenReturn(mockOrdreValidator);

            var ex = assertThrows(ElementNotFoundException.class, () -> tarposService.updateTarpos(tarpos));

            assertEquals("L'élément Tarpos (TP1) n'existe pas", ex.getMessage());
            verify(mockTypeValidator).validate("TP1");
            verify(mockLibelleValidator).validate("le libelle de tarpos");
            verify(mockOrdreValidator).validate(10);
        }
    }

    @Test
    void should_delete_tarpos_nominal() {
        List<String> types = Arrays.asList("TP1", "TP2");
        tarposService.deleteTarpos(types);

        verify(tarposPersistence).deleteAll(types);
    }

}

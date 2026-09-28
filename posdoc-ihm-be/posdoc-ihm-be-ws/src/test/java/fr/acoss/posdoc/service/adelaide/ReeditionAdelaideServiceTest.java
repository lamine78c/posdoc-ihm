package fr.acoss.posdoc.service.adelaide;

import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.context.Context;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.database.services.VersionAdelaideService;
import fr.acoss.posdoc.domain.message.model.ExpReedition;
import fr.acoss.posdoc.domain.utilog.UtiLogUtil;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;
import fr.acoss.posdoc.domain.utilog.primary.UtiLogService;
import fr.acoss.posdoc.service.adelaide.impl.ReeditionAdelaideServiceImpl;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideResult;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideSocketServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

class ReeditionAdelaideServiceTest extends AbstractGraphqlTest {

    private static final String FONC_REEDITER = "E";
    private static final char CAR_CHAMP = 24;
    private static final char CAR_FIN = 26;
    private static final String HOST = " ";

    @InjectMocks
    private ReeditionAdelaideServiceImpl adelaideReeditionService;
    @Mock
    private UtiLogService utiLogService;
    @Mock
    private VersionAdelaideService adelaideVersionService;
    @Mock
    private AdelaideSocketServiceImpl adelaideSocketService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.initMocks(this);
        adelaideReeditionService = new ReeditionAdelaideServiceImpl(utiLogService, adelaideVersionService, adelaideSocketService);
        Context context = new Context();
        context.setUser("testUser");
        context.setHost(HOST);
        ContextHolder.setContext(context);
    }

    @Test
    void test_reediter_should_be_ok() {
        List<ExpReedition> reeditions = new LinkedList<>();
        ExpReedition reedition = new ExpReedition();
        reedition.setCodOrg("org");
        reedition.setCodEnv("env");
        reedition.setCodApp("app");
        reedition.setPerCod("per");
        reedition.setProduct("prod");
        reeditions.add(reedition);
        String params = UtiLogUtil.PARAM_PREFIX_GENAPP + reedition.getCodEnv() + UtiLogUtil.PARAM_SEP + reedition.getCodOrg() + UtiLogUtil.PARAM_SEP + reedition.getCodApp() + UtiLogUtil.PARAM_SEP + reedition.getPerCod();
        when(this.utiLogService.insertUtilog(null, params, UtiLogUtil.ACT_VALIDER, HOST, null, null)).thenReturn(new UtiLog());
        List<UtiLog> result = adelaideReeditionService.reediter(reeditions);
        assertNotNull(result);
    }

    @Test
    void test_reediter_shoud_be_ko() throws IOException {
        List<ExpReedition> reeditions = new LinkedList<>();
        ExpReedition reedition = new ExpReedition();
        reedition.setCodOrg("org_error");
        reedition.setCodEnv("env_error");
        reedition.setCodApp("app_error");
        reedition.setPerCod("per_error");
        reedition.setProduct("prod_error");
        reeditions.add(reedition);

        String message = FONC_REEDITER + reedition.getCodEnv() + CAR_CHAMP + reedition.getCodOrg() + CAR_CHAMP + reedition.getCodApp() + CAR_CHAMP + reedition.getPerCod() + CAR_CHAMP + reedition.getProduct() + CAR_FIN;
        when(adelaideSocketService.sendMessage(message, null)).thenReturn(new AdelaideResult(null, "error"));
        UtiLog utilogError = new UtiLog();
        utilogError.setErreur("Message d'erreur !");
        String params = UtiLogUtil.PARAM_PREFIX_GENAPP + reedition.getCodEnv() + UtiLogUtil.PARAM_SEP + reedition.getCodOrg() + UtiLogUtil.PARAM_SEP + reedition.getCodApp() + UtiLogUtil.PARAM_SEP + reedition.getPerCod();
        when(this.utiLogService.insertUtilog("error", params, UtiLogUtil.ACT_VALIDER, HOST, null, null)).thenReturn(utilogError);
        List<UtiLog> result = adelaideReeditionService.reediter(reeditions);
        assertNotNull(result.get(0));
        assertEquals("Message d'erreur !", result.get(0).getErreur());
    }

}
package fr.acoss.posdoc.service.adelaide;

import fr.acoss.posdoc.context.Context;
import fr.acoss.posdoc.context.ContextHolder;
import fr.acoss.posdoc.database.services.VersionAdelaideService;
import fr.acoss.posdoc.domain.message.model.ExpMassification;
import fr.acoss.posdoc.domain.utilog.UtiLogUtil;
import fr.acoss.posdoc.domain.utilog.model.UtiLog;
import fr.acoss.posdoc.domain.utilog.primary.UtiLogService;
import fr.acoss.posdoc.service.adelaide.impl.MassificationAdelaideServiceImpl;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideSocketServiceImpl;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

class MassificationServiceTest {
    private static final String HOST = " ";

    @InjectMocks
    private MassificationAdelaideServiceImpl massificationAdelaideService;
    @Mock
    private UtiLogService utiLogService;
    @Mock
    private VersionAdelaideService adelaideVersionService;
    @Mock
    private AdelaideSocketServiceImpl adelaideSocketService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.initMocks(this);
        massificationAdelaideService = new MassificationAdelaideServiceImpl(utiLogService, adelaideVersionService, adelaideSocketService);
        Context context = new Context();
        context.setUser("testUser");
        context.setHost(HOST);
        ContextHolder.setContext(context);
    }

    private static @NotNull ExpMassification createMassification() {
        ExpMassification expMassification = new ExpMassification();
        expMassification.setCodOrg("org");
        expMassification.setCodEnv("env");
        expMassification.setCodApp("app");
        expMassification.setPerCod("per");
        expMassification.setListeFic("listeFic");
        expMassification.setIsSimu(true);
        expMassification.setTypar("typar");
        return expMassification;
    }

    @Test
    void test_massification_shouldbe_ok() {
        ExpMassification expMassification = createMassification();
        String params = UtiLogUtil.PARAM_PREFIX_GENAPP + expMassification.getCodEnv() + UtiLogUtil.PARAM_SEP + expMassification.getCodOrg() + UtiLogUtil.PARAM_SEP + expMassification.getCodApp() + UtiLogUtil.PARAM_SEP + expMassification.getPerCod();
        when(this.utiLogService.insertUtilog(null, params, UtiLogUtil.ACT_MASSIFIER, HOST, null, null)).thenReturn(new UtiLog());
        UtiLog result = massificationAdelaideService.massifier(expMassification);
        assertNotNull(result);
    }


}

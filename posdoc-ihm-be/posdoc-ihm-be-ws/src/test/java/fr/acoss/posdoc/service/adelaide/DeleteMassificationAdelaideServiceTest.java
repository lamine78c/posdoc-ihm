package fr.acoss.posdoc.service.adelaide;

import fr.acoss.posdoc.database.services.ParametrePersistenceImpl;
import fr.acoss.posdoc.database.services.VersionAdelaideService;
import fr.acoss.posdoc.domain.massification.model.MassificationSearch;
import fr.acoss.posdoc.domain.utilog.primary.UtiLogService;
import fr.acoss.posdoc.service.adelaide.impl.DeleteMassificationAdelaideServiceImpl;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideSocketServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.LinkedList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeleteMassificationAdelaideServiceTest {

    private static final String PARAM_CODE_MASREP = "MASREP";

    @InjectMocks
    private DeleteMassificationAdelaideServiceImpl deleteMassificationAdelaideServiceImpl;
    @Mock
    private VersionAdelaideService adelaideVersionService;
    @Mock
    private AdelaideSocketServiceImpl adelaideSocketService;
    @Mock
    private UtiLogService utiLogService;
    @Mock
    private ParametrePersistenceImpl parametrePersistence;

    @BeforeEach
    public void setUp() {
        deleteMassificationAdelaideServiceImpl = new DeleteMassificationAdelaideServiceImpl(parametrePersistence,utiLogService,adelaideVersionService,adelaideSocketService);
    }

    @Test
    void test_create_files(){
        MassificationSearch massificationSearch1 = new MassificationSearch();
        massificationSearch1.setCodenv("P");
        massificationSearch1.setCodorg("117");
        massificationSearch1.setCodapp("svn2");
        massificationSearch1.setPercod("250103-05");
        massificationSearch1.setNumcom("00");
        massificationSearch1.setCodcom("eds2");
        massificationSearch1.setCodfic("l04");
        MassificationSearch massificationSearch2 = new MassificationSearch();
        massificationSearch2.setCodenv("P");
        massificationSearch2.setCodorg("117");
        massificationSearch2.setCodapp("svn2");
        massificationSearch2.setPercod("250103-05");
        massificationSearch2.setNumcom("00");
        massificationSearch2.setCodcom("pc01");
        massificationSearch2.setCodfic("l00");
        MassificationSearch massificationSearch3 = new MassificationSearch();
        massificationSearch3.setCodenv("P");
        massificationSearch3.setCodorg("117");
        massificationSearch3.setCodapp("scrb");
        massificationSearch3.setPercod("251211-00");
        massificationSearch3.setNumcom("00");
        massificationSearch3.setCodcom("scrb");
        massificationSearch3.setCodfic("urs");
        List<MassificationSearch> list = new LinkedList<>();

        list.add(massificationSearch1);
        list.add(massificationSearch2);
        list.add(massificationSearch3);

        when(parametrePersistence.getValueByCode(PARAM_CODE_MASREP)).thenReturn("/adldatas/mas");

        List<String> result =  deleteMassificationAdelaideServiceImpl.createFiles(list);
        assertEquals("/adldatas/mas/p_117_svn2_250103-05_00_eds2_l04",result.get(0));
        assertEquals("/adldatas/mas/p_117_svn2_250103-05_00_pc01_l00",result.get(1));
        assertEquals("/adldatas/mas/p_117_scrb_251211-00_00_scrb_urs",result.get(2));

    }
}

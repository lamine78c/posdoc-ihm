package fr.acoss.posdoc.service.adelaide;

import fr.acoss.posdoc.AbstractGraphqlTest;
import fr.acoss.posdoc.service.adelaide.impl.AdelaideUtil;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideSocket;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideSocketServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.BufferedReader;
import java.io.PrintWriter;
import java.net.Socket;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class AdeaideServiceTest extends AbstractGraphqlTest {

    private static final char RET_OK = '0';

    @Spy
    @InjectMocks
    private AdelaideSocketServiceImpl adelaideSocketService;

    @Mock
    private Socket mockSocket;

    @Mock
    private PrintWriter mockOut;

    @Mock
    private BufferedReader mockIn;

    private AdelaideSocket adelaideSocket;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.initMocks(this);
        ReflectionTestUtils.setField(adelaideSocketService, "serverHost", "localhost");
        ReflectionTestUtils.setField(adelaideSocketService, "serverPort", "12345");
        doReturn(mockSocket).when(adelaideSocketService).createSocket(anyString(), anyInt());
        doReturn(mockOut).when(adelaideSocketService).createPrintWriter(any(Socket.class));
        doReturn(mockIn).when(adelaideSocketService).createBufferedReader(any(Socket.class));
        adelaideSocket = new AdelaideSocket(mockSocket, mockOut, mockIn);
    }

    @Test
    void testConnect_success() throws Exception {
        char[] response = {RET_OK};
        when(mockIn.read(any(char[].class))).thenAnswer(invocation -> {
            char[] buf = invocation.getArgument(0);
            System.arraycopy(response, 0, buf, 0, response.length);
            return response.length;
        });
        adelaideSocketService.connection();
        verify(mockOut, times(1)).print(anyString());
        verify(mockOut, times(1)).flush();
    }

    @Test
    void testSend_success() throws Exception {
        char[] response = {'0', 'm', 'e', 's', 's', 'a', 'g', 'e', AdelaideUtil.CAR_FIN};
        when(mockIn.read(any(char[].class))).thenAnswer(invocation -> {
            char[] buf = invocation.getArgument(0);
            System.arraycopy(response, 0, buf, 0, response.length);
            int index = (int) (Math.random() * (response.length));
            return (index == 0) ? 9 : index;
        });
        adelaideSocketService.sendMessage("testStream", adelaideSocket);
        verify(mockOut, times(1)).print(anyString());
        verify(mockOut, times(1)).flush();
    }

    @Test
    void testConnectAndSend_failure() throws Exception {
        char[] response = {'1'};  // Simulating a failure response
        when(mockIn.read(any(char[].class))).thenAnswer(invocation -> {
            char[] buf = invocation.getArgument(0);
            System.arraycopy(response, 0, buf, 0, response.length);

            return response.length;
        });
        Exception exception = assertThrows(RuntimeException.class, () -> adelaideSocketService.connection());
        assertNotNull(exception.getMessage());
    }
}
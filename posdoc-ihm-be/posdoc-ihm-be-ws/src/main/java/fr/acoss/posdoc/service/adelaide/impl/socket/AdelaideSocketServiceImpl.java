package fr.acoss.posdoc.service.adelaide.impl.socket;

import fr.acoss.posdoc.exceptions.PosdocException;
import fr.acoss.posdoc.service.adelaide.impl.AdelaideUtil;
import lombok.SneakyThrows;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

@Service
public class AdelaideSocketServiceImpl {

    private static final int SIZE_BUF = 10000;
    private static final String FONC_CONNECT = "0";
    private static final char RET_OK = '0';
    private static final String ERR_PREFIX = "ADELAIDE ERROR : ";

    private static final Logger LOGGER = LoggerFactory.getLogger(AdelaideSocketServiceImpl.class);


    @Value("${adelaide-server.host}")
    private String serverHost;
    @Value("${adelaide-server.port}")
    private String serverPort;

    public AdelaideSocket connection() throws IOException {
        Socket socket = createSocket(serverHost,Integer.parseInt(serverPort));
        socket.setKeepAlive(true);
        socket.setSoTimeout(0);
        AdelaideSocket adelaideSocket = new AdelaideSocket(socket, createPrintWriter(socket), createBufferedReader(socket));
        // Connection to Adelaide server
        adelaideSocket.getOut().print(FONC_CONNECT + AdelaideUtil.CAR_FIN);
        adelaideSocket.getOut().flush();
        char[] buf = new char[SIZE_BUF];
        int len = adelaideSocket.getIn().read(buf);
        if (buf[0] != RET_OK) {
            String message = new String(buf).substring(1, len - 1);
            throw new PosdocException(ERR_PREFIX + message);
        }

        return adelaideSocket;
    }

    public AdelaideResult sendMessage(final String message,final AdelaideSocket adelaideSocket) throws IOException {
        String error = null;
        int len;
        char[] buf = new char[SIZE_BUF];
        adelaideSocket.getOut().print(message);
        adelaideSocket.getOut().flush();
        len = adelaideSocket.getIn().read(buf);
        StringBuilder result = new StringBuilder();
        if (buf[0] != RET_OK) {
            error = new String(buf).substring(1, len);
        }else if(len < 2){
            result.append(buf,0,len);
            LOGGER.warn("Anomalie d'execution de la requête : {}",result);
        } else {
            readResult(adelaideSocket, result, buf, len);
        }
        return new AdelaideResult(result.toString(),error);
    }

    private static void readResult(final AdelaideSocket adelaideSocket, final StringBuilder result, final char[] buf, int len) throws IOException {
        result.append(buf, 1, (buf[len - 1] != AdelaideUtil.CAR_FIN ? len - 1 : len - 2));
        while (buf[len - 1] != AdelaideUtil.CAR_FIN) {
            if ((len = adelaideSocket.getIn().read(buf)) == -1) {
                break;
            }
            result.append(buf, 0, len);
        }

    }

    @SneakyThrows
    public Socket createSocket(final String host,final  int port) {
        return new Socket(host, port);
    }

    @SneakyThrows
    public PrintWriter createPrintWriter(final Socket socket) {
        return new PrintWriter(socket.getOutputStream(), true, StandardCharsets.ISO_8859_1);
    }

    @SneakyThrows
    public BufferedReader createBufferedReader(final Socket socket) {
        return new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.ISO_8859_1));
    }


}

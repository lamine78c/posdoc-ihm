package fr.acoss.posdoc.service.adelaide.impl.socket;

import lombok.*;

import java.io.BufferedReader;
import java.io.PrintWriter;
import java.net.Socket;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class AdelaideSocket {

    private Socket socket;
    private PrintWriter out;
    private BufferedReader in;

}

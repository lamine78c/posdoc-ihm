package fr.acoss.posdoc.configuration;

import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideResult;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideSocket;
import fr.acoss.posdoc.service.adelaide.impl.socket.AdelaideSocketServiceImpl;
import org.springframework.context.annotation.Bean;

import java.io.IOException;


public class AdelaideConfiguration {

    @Bean
    public AdelaideSocketServiceImpl adelaideSocketServiceImpl(){
        //mock
        return new AdelaideSocketServiceImpl(){

            public AdelaideSocket connection() throws IOException {
                //NOP
                return null;
            }

            public AdelaideResult sendMessage(final String message, final AdelaideSocket adelaideSocket) throws IOException {
                return new AdelaideResult(null,message);
            }
        };
    }

}

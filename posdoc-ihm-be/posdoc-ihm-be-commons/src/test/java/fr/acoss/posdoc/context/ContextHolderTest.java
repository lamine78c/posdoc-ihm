package fr.acoss.posdoc.context;

import org.junit.jupiter.api.Test;

import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ContextHolderTest {

    private static final String HOST = "host";

    @Test
     void testContextHolder() {
        Context context = new Context();
        context.setHost(HOST);
        ContextHolder.setContext(context);
        assertEquals(HOST, ContextHolder.getContext().getHost());
    }

    @Test
     void testContextHolderWithMultipleThreads() throws InterruptedException {
        new Thread(createRunnable()).start();
        new Thread(createRunnable()).start();
        assertEquals(" ", ContextHolder.getContext().getHost());
    }

    private Runnable createRunnable() {
        return () -> {
            Context context = new Context();
            Random random = new Random();
            int value = random.nextInt(11);
            context.setHost(HOST + value);
            ContextHolder.setContext(context);
            assertEquals(HOST + value, ContextHolder.getContext().getHost());
        };
    }
}

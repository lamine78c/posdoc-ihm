package fr.acoss.posdoc.context;

public class ContextHolder {

    private static final ThreadLocal<Context> THREAD_LOCAL = new ThreadLocal<>();

    private ContextHolder () {
        throw new IllegalStateException("Utility class");
    }

    public static Context getContext() {
        Context context = THREAD_LOCAL.get();
        if (context == null) {
            context = new Context();
            THREAD_LOCAL.set(context);
        }
        return THREAD_LOCAL.get();
    }

    public static void setContext(Context context) {
        THREAD_LOCAL.set(context);
    }

    public static void unload() {
        THREAD_LOCAL.remove();
    }

}

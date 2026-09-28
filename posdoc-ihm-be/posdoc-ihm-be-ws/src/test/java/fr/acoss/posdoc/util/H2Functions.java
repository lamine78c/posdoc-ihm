package fr.acoss.posdoc.util;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;

public class H2Functions {

    public static Timestamp toDate(String dateStr, String format) throws Exception {
        String h2Format = format.replace("YYYY", "yyyy").replace("DD", "dd");
        SimpleDateFormat sdf = new SimpleDateFormat(h2Format);
        return new Timestamp(sdf.parse(dateStr).getTime());
    }
    public static Timestamp toTimestamp(String dateStr, String format) throws Exception {
        String h2Format = format.replace("YYYY", "yyyy")
                .replace("DD", "dd")
                .replace("HH24", "HH")
                .replace("MI", "mm")
                .replace("SS", "ss");
        SimpleDateFormat sdf = new SimpleDateFormat(h2Format);
        return new Timestamp(sdf.parse(dateStr).getTime());
    }
}

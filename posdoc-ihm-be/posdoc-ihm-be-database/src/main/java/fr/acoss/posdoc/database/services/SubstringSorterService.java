package fr.acoss.posdoc.database.services;

import fr.acoss.posdoc.common.util.ParamsUtils;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

//TODO voir pour convertir en Utils
public class SubstringSorterService {

    private SubstringSorterService(){throw new IllegalStateException("Utility class");}

    private static final List<String> SUBSTRING_SORTER_KEYS = Arrays.asList(ParamsUtils.CODENV, ParamsUtils.CODORG, ParamsUtils.CODAPP, ParamsUtils.PERCOD, ParamsUtils.CODCOM, ParamsUtils.CODFIC);
    private static final String SUBSTRING_SORTER_DELIMITER = ",";
    private static final String SUBSTRING_SORTER_CONDITION_DELIMITER = " and ";
    private static final String SUBSTRING_SORTER_SUBQUERY_KEY = "(select ";

    public static String substringSorterHistoryValues(final String input) {
        return substringSorter(input, SUBSTRING_SORTER_DELIMITER, SUBSTRING_SORTER_KEYS);
    }

    public static String substringSorterHistoryCondition(final String input) {
        if (input.contains(SUBSTRING_SORTER_SUBQUERY_KEY)) { // ne traite pas les sous-requêtes
            return input;
        }
        return substringSorter(input, SUBSTRING_SORTER_CONDITION_DELIMITER, SUBSTRING_SORTER_KEYS);
    }

    public static String substringSorter(final String input, final String delimiter, final List<String> keys) {
        if (input == null || input.isEmpty()) {
            return null;
        }
        Map<String, Integer> keyIndexMap = getKeysPosition(keys);
        String[] arr = input.split("(?i)" + delimiter); // case-insensitive regex
        Map<String, Integer> originalIndexMap = getOriginalPosition(arr);
        return sorter(delimiter, keys, keyIndexMap, arr, originalIndexMap);
    }

    private static Map<String, Integer> getOriginalPosition(String[] arr) {
        Map<String, Integer> originalIndexMap = new HashMap<>();
        for(int i = 0; i < arr.length; i++) {
            originalIndexMap.put(arr[i], i);
        }
        return originalIndexMap;
    }

    private static Map<String, Integer> getKeysPosition(List<String> keys) {
        Map<String, Integer> keyIndexMap = new HashMap<>();
        for(int i = 0; i < keys.size(); i++) {
            keyIndexMap.put(keys.get(i).toLowerCase(), i); // create hashmap with lower case
        }
        return keyIndexMap;
    }

    private static String sorter(String delimiter, List<String> keys, Map<String, Integer> keyIndexMap, String[] arr, Map<String, Integer> originalIndexMap) {
        String regex = String.join("|", keys);
        Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE); // case-insensitive regex
        String result = Arrays.stream(arr)
                .sorted((s1, s2) -> {
                    int i1 = getKeyIndex(s1, keyIndexMap, pattern);
                    int i2 = getKeyIndex(s2, keyIndexMap, pattern);
                    // no match, no change for the original position
                    if(i1 == -1 && i2 == -1) {
                        return Integer.compare(originalIndexMap.get(s1), originalIndexMap.get(s2));
                    }
                    // s1 no match
                    if(i1 == -1) {
                        return 1;
                    }
                    // s2 no match
                    if(i2 == -1) {
                        return -1;
                    }
                    // all match, compare with the key index asc
                    return Integer.compare(i1, i2);
                })
                .collect(Collectors.joining(delimiter));
        return result.trim();
    }

    private static int getKeyIndex(final String s, final Map<String, Integer> keyIndexMap, final Pattern pattern) {
        Matcher matcher = pattern.matcher(s);
        if(matcher.find()) {
            String matched = matcher.group().toLowerCase();
            return keyIndexMap.getOrDefault(matched, -1); // compare with lower case
        }
        return -1;
    }
}

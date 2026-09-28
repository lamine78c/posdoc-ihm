Sonar
======

these are the false positives, and the won't fixes. that uou have to just report in Sonar without resolving.

False Positive
----------------

* _Static or private method \<method>(ResultSet, int) has unused parameters_ => due to Java 8 functionnal interface of rowmapper
* _Remove this unused method parameter "rowNum"_ => due to Java 8 functionnal interface of rowmapper
* _Method \<method in resources> returns modified parameter_ => data in comes from HTTP request so can't be modified by java code
* _Either log or rethrow this exception_ => (IF SL4J logger is used) Sonar doesn't recognize Sl4j logger

Won't fix
---------------

* _\<method> may expose internal representation by returning \<any Date>_ => This rule about mutable object brings more complication than resolve problems, this can be ignored
* For variable duplication in JDBC params and JDBC results mappers (in DAO and business beans) or in Gateway SecurityConfiguration class => better readability over duplication
* Define a constant instead of duplicating this literal "key" x times. (in jdbc params map) => better readability
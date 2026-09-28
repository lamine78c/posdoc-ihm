INSERT INTO organi(c00_codorg, s00_liborg, s00_adres1, s00_adres2, s00_adres3, s00_adres4, s00_typorg, s00_codreg, s00_codsit)
VALUES ('010', 'URSSAF DE L AIN', null, null, null, null, 'R', '827', 'CIRTIL'),
       ('071', 'URSSAF DE L ARDECHE', null, null, null, null, 'R', '827', 'CIRTIL'),
       ('300', 'URSSAF de NIMES', null, null, null, null, 'R', '917', 'CIRTIL'),
       ('660', 'URSSAF de PERPIGNAN', null, null, null, null, 'R', '917', 'CIRTIL'),
       ('200', 'URSSAF DE LA CORSE', null, null, null, null, 'F', '200', 'CIRTIL');

INSERT INTO region(c62_codreg, s62_libreg)
VALUES ('827', 'Région Rhône Alpes'),
       ('917', 'Région Languedoc Roussillon'),
       ('200', 'Région CORSE');

INSERT INTO region_mapping(codreg, codana)
VALUES ('827', 'CM422');

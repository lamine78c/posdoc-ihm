INSERT INTO genpro(c16_codenv, c16_codorg, c16_codapp, c16_percod, c16_codcom, c16_numcom, c16_codfic,
                           c16_codgam, s16_prosta, s16_proinf, b16_prefec, d16_dprodc, d16_dprodd, d16_dprodt,
                           d16_dprods, d16_dprodh, n16_pagfic, n16_plific, n16_rejfic)
VALUES ('T', '00L', 'MAS', '230331-00', 'IPVT', '00', 'CV02A', 'UP', 'H', '000', 0, '2024-05-23 20:34:36.000000',
        '2024-05-23 20:38:16.000000', '2024-05-23 23:52:58.000000', null, '2024-05-29 15:01:24.000000', 0, 0, 0),
       ('T', '00L', 'MAS', '230331-00', 'IPVT', '00', 'CV02A', 'RT', 'H', '000', 0, '2024-05-24 20:34:36.000000',
       '2024-05-24 20:38:16.000000', '2024-05-24 23:52:58.000000', null, '2024-05-29 15:01:24.000000', 0, 0, 0);

INSERT INTO gammes(C06_Codgam,S06_Libgam,S06_Codver) VALUES
    ('UP','Gamme de produits à mettre à jour','VERROU'),
    ('RT','Gamme de produits à supprimer','VERROU'),
    ('VG','Gamme de produits à supprimer','VERROU');
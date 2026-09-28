INSERT INTO genetp(c59_idetap, s59_typetp,
    s59_codenv, s59_codorg, s59_codapp, s59_percod, s59_codcom, s59_numcom, s59_codfic, s59_codgam,
                    s59_numexe, s59_codres, s59_codsit, s59_coddes, n59_nbrexe, s59_codser,
                   s59_codsig, s59_signal, b59_reedit, b59_fabsim, s59_statut, n59_codinf, d59_create, d59_valide, d59_debute,
                   d59_termin, d59_invali, d59_suspen, d59_histor, s59_script, n59_stepno, n59_numpid, s59_etpfus, s59_clefus, n59_idtfus)
VALUES (1, 'DIS',
    'P', '750', 'SNV2', '250106-00', 'IPVT', '00', 'L02', 'FT',
        null, 'COLI-ORG', 'CIRSO', null, 1, null,
        null, null, 0, 1,'S', 1, '2023-02-21 17:38:13', '2023-02-21 17:38:13', '2025-02-20 17:38:13',
        '2024-09-16 23:40:13', null, null, null, null, 1, 1, 'FAB', null, 1);

INSERT INTO genpro(c16_codenv, c16_codorg, c16_codapp, c16_percod, c16_codcom, c16_numcom, c16_codfic, c16_codgam,
    s16_prosta, s16_proinf, b16_prefec, d16_dprodc, d16_dprodd, d16_dprodt,
                           d16_dprods, d16_dprodh, n16_pagfic, n16_plific, n16_rejfic)
VALUES ('P', '750', 'SNV2', '250106-00', 'IPVT', '00', 'L02', 'FT',
        'H', '000', 0, '2024-05-23 20:34:36.000000',
        '2024-05-23 20:38:16.000000', '2024-05-23 23:52:58.000000', null, '2024-05-29 15:01:24.000000', 10, 0, 0);

INSERT INTO hispro(c23_codenv, c23_codorg, c23_codapp, c23_percod, c23_codcom, c23_numcom, c23_codfic, c23_codgam,
      s23_prosta, s23_proinf, b23_prefec, d23_dprodc, d23_dprodd, d23_dprodt,
      d23_dprods, d23_dprodh, n23_pagfic, n23_plific, n23_rejfic)
VALUES ('P', '750', 'SNV2', '250106-00', 'IPVT', '00', 'L02', 'FT',
        'H', '000', 0, '2024-05-23 20:34:36.000000',
        '2024-05-23 20:38:16.000000', '2024-05-23 23:52:58.000000', null, '2024-05-29 15:01:24.000000', 20, 0, 0);


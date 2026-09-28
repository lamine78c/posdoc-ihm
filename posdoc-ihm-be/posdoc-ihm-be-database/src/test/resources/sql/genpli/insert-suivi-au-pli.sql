INSERT INTO genpli(c101_numpli,s101_codenv,s101_codorg,s101_codapp,s101_percod,n101_numcom,s101_codcom,s101_codfic,
s101_plista,s101_pliinf,s101_zoncli,d101_dplidc,d101_dplidd,d101_dplidt,d101_dplide,d101_dplidh,n101_nbpage,n101_nbfeui,
s101_edtype,n101_poipli,n101_coupli,n101_idtpli,s101_codpos,s101_codpay,s101_adres1,s101_adres2,s101_adres3,s101_adres4,
s101_adres5,s101_adres6,s101_adres7,s101_expad1,s101_expad2,s101_expad3,s101_expad4,s101_genpro,s101_infcl1,s101_infcl2,
d101_datdep,n101_mspidd,n101_status,n101_cominf,s101_codgam)

VALUES ('86302335475002U', 'T', '00L', 'MAS', '230331-00', '00', 'MAS3', 'M4001',
        'C', '000', 'P_00L_MAS_231206-0F_00_MAS3_M3803_*', '2023-12-07 07:22:18', '2023-12-07 07:22:18', null, null, null, '000', '000',
        'PL', '00114', '0.614', '438 000007841334266', '13520', 'FRA', null, null, null, 'adres4',
        'adres5', 'adres6', null, '0', '0', '0', '0', 'p_438_snv2_231205-00_00_pds4_l00_ma', null, null,
        '2023-12-07', null, null, null, 'CH'),
        ('86302335475111Z', 'T', '00L', 'MAS', '230331-01', '00', 'MAS3', 'M4001',
        'C', '000', 'P_00L_MAS_231206-0F_00_MAS3_M3803_*', '2023-12-08 07:22:18', '2023-12-08 07:22:18', null, null, null, '000', '000',
        'PL', '00114', '0.614', '438 000007841334266', '13520', 'FRA', null, null, null, 'adres4',
        'adres5', 'adres6', null, '0', '0', '0', '0', 'p_815_cnav_250106-06_00_re01_cn01_ma', null, null,
        '2023-12-07', null, null, null, 'CH');

INSERT INTO genpro(c16_codenv, c16_codorg, c16_codapp, c16_percod, c16_codcom, c16_numcom, c16_codfic,
                           c16_codgam, s16_prosta, s16_proinf, b16_prefec, d16_dprodc, d16_dprodd, d16_dprodt,
                           d16_dprods, d16_dprodh, n16_pagfic, n16_plific, n16_rejfic)
VALUES ('T', '00L', 'MAS', '230331-00', 'IPVT', '00', 'CV02A', 'CH', 'H', '000', 0, '2024-05-23 20:34:36.000000',
        '2024-05-23 20:38:16.000000', '2024-05-23 23:52:58.000000', null, '2024-05-29 15:01:24.000000', 0, 0, 0),
       ('T', '00L', 'MAS', '230331-01', 'IPVT', '00', 'CV02A', 'CH', 'H', '000', 0, '2024-05-24 20:34:36.000000',
       '2024-05-24 20:38:16.000000', '2024-05-24 23:52:58.000000', null, '2024-05-29 15:01:24.000000', 0, 0, 0);
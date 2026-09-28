INSERT INTO public.ressou (c08_codenv, c08_codorg, c08_codapp, c08_codgam, c08_codsit, c08_codres, s08_codser,
                           s08_libres, s08_typres, s08_logtrf, s08_compro, s08_comlia, s08_userid, s08_passwd,
                           s08_typfus, b08_fusdes, s08_filimp, s08_infuti, b08_bloque, b08_resmsp, s08_profil)
VALUES ('T', '750', 'SNV2', 'MA', 'CIRTIL', 'MASSI', 'ADELAIDE', 'TEST - Mise Sous Pli - TEST', 'C', 'B', 'NODIST_BA',
        'NODIST_BA', '', '', '-', 0, '', '', 0, 1, null);

INSERT INTO public.organi(
    c00_codorg, s00_liborg, s00_adres1, s00_adres2, s00_adres3, s00_adres4, s00_typorg, s00_codreg, s00_codsit)
VALUES ('117', 'URSSAF ILE DE FRANCE', null, null, null, null, 'R', '117', 'CIRTIL');

INSERT INTO public.sitcnp(c73_codsit, s73_hostad, s73_userid, s73_passwd, s73_resdel, s73_masorg)
VALUES ('CIRTIL', 'cnp69adelaide.cer69.recouv', 'xxxx', 'xxxx', 'CNP31', '00L');

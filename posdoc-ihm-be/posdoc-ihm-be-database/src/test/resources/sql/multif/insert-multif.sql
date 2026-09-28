-- Insert test data for multifs
INSERT INTO multif (c19_typmul, s19_libmul) VALUES ('X', 'Multif Test X');
INSERT INTO multif (c19_typmul, s19_libmul) VALUES ('Y', 'Multif Test Y');
INSERT INTO multif (c19_typmul, s19_libmul) VALUES ('Z', 'Multif Test Z');

-- Un fichier qui référence le multif 'X' pour que isNotAuthorisedToBeDeleted soit true
INSERT INTO fichie (c07_codenv, c07_codorg, c07_codapp, c07_codcom, c07_codfic, s07_libfic, s07_typfor, s07_typsup, s07_typmul)
VALUES ('P', '117', 'APP1', 'COM1', 'FIC01', 'Fichier lié à Multif X', 'A', 'A', 'X');

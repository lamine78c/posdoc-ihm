-- Nettoyage des données pour les tests de ParametreEditionPersistenceImpl

DELETE FROM destin WHERE c10_codorg IN ('750', '100', '210', '999');
DELETE FROM ressou WHERE c08_codenv IN ('P', 'T') AND c08_codorg IN ('999', '750', '100', '210');
DELETE FROM parcle;
DELETE FROM organi WHERE c00_codorg IN ('999', '750', '100', '210');
DELETE FROM enviro WHERE c01_codenv IN ('P', 'T', 'D');
DELETE FROM params WHERE c32_codpar = 'OGUORG';
DELETE FROM myslog;
DELETE FROM utilog;

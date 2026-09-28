import { FullAdresseSuiviAuPli } from './search-pli';

export function getFullAdresse(data: FullAdresseSuiviAuPli, sep: string) {
  return getListFullAdresse(data)
    .filter(ad => !!ad)
    .join(sep);
}

export function getListFullAdresse(data: FullAdresseSuiviAuPli): string[] {
  const fullAdresse = [];
  fullAdresse.push(getAdresse(data.adres1));
  fullAdresse.push(getAdresse(data.adres2));
  fullAdresse.push(getAdresse(data.adres3));
  fullAdresse.push(getAdresse(data.adres4));
  fullAdresse.push(getAdresse(data.adres5));
  fullAdresse.push(getAdresse(data.adres6));
  fullAdresse.push(getAdresse(data.adres7));
  return fullAdresse;
}

function getAdresse(adresse) {
  return adresse ? adresse.trim() : null;
}

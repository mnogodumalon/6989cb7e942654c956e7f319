// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Lieferanten {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    lieferantennummer?: string;
    firmenname?: string;
    ansprechpartner_vorname?: string;
    ansprechpartner_nachname?: string;
    email?: string;
    telefon?: string;
    strasse?: string;
    hausnummer?: string;
    plz?: string;
    ort?: string;
    land?: string;
    zahlungsziel_tage?: number;
    bankverbindung?: string;
    notizen?: string;
  };
}

export interface Artikel {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    artikelnummer?: string;
    artikelbezeichnung?: string;
    artikelbeschreibung?: string;
    einheit?: 'stueck' | 'meter' | 'kilogramm' | 'liter' | 'paket' | 'karton' | 'set';
    einkaufspreis?: number;
    lieferant?: string; // applookup -> URL zu 'Lieferanten' Record
    lieferzeit_tage?: number;
    mindestbestellmenge?: number;
    verpackungseinheit?: number;
    artikel_notizen?: string;
  };
}

export interface StuecklistenImport {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    bearbeiter_nachname?: string;
    automatische_bestellgenerierung?: boolean;
    import_notizen?: string;
    stuecklisten_datei?: string;
    stuecklisten_name?: string;
    projekt_nummer?: string;
    importdatum?: string; // Format: YYYY-MM-DD oder ISO String
    bearbeiter_vorname?: string;
  };
}

export interface Bestellungen {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    bestellnummer?: string;
    bestelldatum?: string; // Format: YYYY-MM-DD oder ISO String
    lieferant_bestellung?: string; // applookup -> URL zu 'Lieferanten' Record
    gewuenschtes_lieferdatum?: string; // Format: YYYY-MM-DD oder ISO String
    bestellstatus?: 'entwurf' | 'zur_pruefung' | 'freigegeben' | 'versendet' | 'bestaetigt' | 'in_lieferung' | 'geliefert' | 'storniert';
    gesamtwert_netto?: number;
    gesamtwert_brutto?: number;
    referenz_stueckliste?: string;
    kostenstelle?: string;
    bestellung_notizen?: string;
  };
}

export interface Bestellpositionen {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    bestellung?: string; // applookup -> URL zu 'Bestellungen' Record
    positionsnummer?: number;
    artikel_position?: string; // applookup -> URL zu 'Artikel' Record
    menge?: number;
    einzelpreis?: number;
    gesamtpreis_position?: number;
    gewuenschter_liefertermin?: string; // Format: YYYY-MM-DD oder ISO String
    position_notizen?: string;
  };
}

export const APP_IDS = {
  LIEFERANTEN: '6989cb41c42007a14f3d53b7',
  ARTIKEL: '6989cb48595ec18a1209b28a',
  STUECKLISTEN_IMPORT: '6989cb48146d1be32cda3d18',
  BESTELLUNGEN: '6989cb49aad27975203714fc',
  BESTELLPOSITIONEN: '6989cb4a9f010e1154561333',
} as const;

// Helper Types for creating new records
export type CreateLieferanten = Lieferanten['fields'];
export type CreateArtikel = Artikel['fields'];
export type CreateStuecklistenImport = StuecklistenImport['fields'];
export type CreateBestellungen = Bestellungen['fields'];
export type CreateBestellpositionen = Bestellpositionen['fields'];
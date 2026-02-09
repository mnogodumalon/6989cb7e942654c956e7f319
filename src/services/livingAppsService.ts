// AUTOMATICALLY GENERATED SERVICE
import { APP_IDS } from '@/types/app';
import type { Lieferanten, Artikel, StuecklistenImport, Bestellungen, Bestellpositionen } from '@/types/app';

// Base Configuration
const API_BASE_URL = 'https://my.living-apps.de/rest';

// --- HELPER FUNCTIONS ---
export function extractRecordId(url: string | null | undefined): string | null {
  if (!url) return null;
  // Extrahiere die letzten 24 Hex-Zeichen mit Regex
  const match = url.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : null;
}

export function createRecordUrl(appId: string, recordId: string): string {
  return `https://my.living-apps.de/rest/apps/${appId}/records/${recordId}`;
}

async function callApi(method: string, endpoint: string, data?: any) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Nutze Session Cookies für Auth
    body: data ? JSON.stringify(data) : undefined
  });
  if (!response.ok) throw new Error(await response.text());
  // DELETE returns often empty body or simple status
  if (method === 'DELETE') return true;
  return response.json();
}

export class LivingAppsService {
  // --- LIEFERANTEN ---
  static async getLieferanten(): Promise<Lieferanten[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.LIEFERANTEN}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getLieferantenEntry(id: string): Promise<Lieferanten | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.LIEFERANTEN}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createLieferantenEntry(fields: Lieferanten['fields']) {
    return callApi('POST', `/apps/${APP_IDS.LIEFERANTEN}/records`, { fields });
  }
  static async updateLieferantenEntry(id: string, fields: Partial<Lieferanten['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.LIEFERANTEN}/records/${id}`, { fields });
  }
  static async deleteLieferantenEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.LIEFERANTEN}/records/${id}`);
  }

  // --- ARTIKEL ---
  static async getArtikel(): Promise<Artikel[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.ARTIKEL}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getArtikelEntry(id: string): Promise<Artikel | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.ARTIKEL}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createArtikelEntry(fields: Artikel['fields']) {
    return callApi('POST', `/apps/${APP_IDS.ARTIKEL}/records`, { fields });
  }
  static async updateArtikelEntry(id: string, fields: Partial<Artikel['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.ARTIKEL}/records/${id}`, { fields });
  }
  static async deleteArtikelEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.ARTIKEL}/records/${id}`);
  }

  // --- STUECKLISTEN_IMPORT ---
  static async getStuecklistenImport(): Promise<StuecklistenImport[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.STUECKLISTEN_IMPORT}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getStuecklistenImportEntry(id: string): Promise<StuecklistenImport | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.STUECKLISTEN_IMPORT}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createStuecklistenImportEntry(fields: StuecklistenImport['fields']) {
    return callApi('POST', `/apps/${APP_IDS.STUECKLISTEN_IMPORT}/records`, { fields });
  }
  static async updateStuecklistenImportEntry(id: string, fields: Partial<StuecklistenImport['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.STUECKLISTEN_IMPORT}/records/${id}`, { fields });
  }
  static async deleteStuecklistenImportEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.STUECKLISTEN_IMPORT}/records/${id}`);
  }

  // --- BESTELLUNGEN ---
  static async getBestellungen(): Promise<Bestellungen[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.BESTELLUNGEN}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getBestellungenEntry(id: string): Promise<Bestellungen | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.BESTELLUNGEN}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createBestellungenEntry(fields: Bestellungen['fields']) {
    return callApi('POST', `/apps/${APP_IDS.BESTELLUNGEN}/records`, { fields });
  }
  static async updateBestellungenEntry(id: string, fields: Partial<Bestellungen['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.BESTELLUNGEN}/records/${id}`, { fields });
  }
  static async deleteBestellungenEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.BESTELLUNGEN}/records/${id}`);
  }

  // --- BESTELLPOSITIONEN ---
  static async getBestellpositionen(): Promise<Bestellpositionen[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.BESTELLPOSITIONEN}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getBestellpositionenEntry(id: string): Promise<Bestellpositionen | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.BESTELLPOSITIONEN}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createBestellpositionenEntry(fields: Bestellpositionen['fields']) {
    return callApi('POST', `/apps/${APP_IDS.BESTELLPOSITIONEN}/records`, { fields });
  }
  static async updateBestellpositionenEntry(id: string, fields: Partial<Bestellpositionen['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.BESTELLPOSITIONEN}/records/${id}`, { fields });
  }
  static async deleteBestellpositionenEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.BESTELLPOSITIONEN}/records/${id}`);
  }

}
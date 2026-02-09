import { useState, useEffect, useMemo } from 'react';
import type { Bestellungen, Bestellpositionen, Lieferanten, Artikel, StuecklistenImport } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { format, parseISO, isAfter, subDays, startOfWeek, getISOWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Plus, Package, Truck, AlertTriangle, FileText, ClipboardList, Users, RefreshCw } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- Constants ---

const STATUS_LABELS: Record<string, string> = {
  entwurf: 'Entwurf',
  zur_pruefung: 'Zur Prüfung',
  freigegeben: 'Freigegeben',
  versendet: 'Versendet',
  bestaetigt: 'Bestätigt',
  in_lieferung: 'In Lieferung',
  geliefert: 'Geliefert',
  storniert: 'Storniert',
};

const STATUS_COLORS: Record<string, string> = {
  entwurf: 'hsl(210 10% 75%)',
  zur_pruefung: 'hsl(210 15% 65%)',
  freigegeben: 'hsl(200 30% 55%)',
  versendet: 'hsl(190 40% 48%)',
  bestaetigt: 'hsl(180 45% 42%)',
  in_lieferung: 'hsl(173 50% 38%)',
  geliefert: 'hsl(152 55% 41%)',
  storniert: 'hsl(0 60% 55%)',
};

const STATUS_ORDER = ['entwurf', 'zur_pruefung', 'freigegeben', 'versendet', 'bestaetigt', 'in_lieferung', 'geliefert', 'storniert'];

const CLOSED_STATUSES = ['geliefert', 'storniert'];

// --- Utility Functions ---

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '-';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
}

function formatNumber(value: number | null | undefined): string {
  if (value == null) return '-';
  return new Intl.NumberFormat('de-DE').format(value);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr.split('T')[0]), 'dd.MM.yyyy', { locale: de });
  } catch {
    return dateStr;
  }
}

// --- Sub-Components ---

function LoadingState() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-40 w-full rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-[65fr_35fr] gap-6">
        <div className="space-y-6">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-80 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Fehler beim Laden</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{error.message}</span>
          <Button variant="outline" size="sm" onClick={onRetry} className="ml-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// --- Order Detail Dialog ---

function OrderDetailDialog({
  order,
  lieferantMap,
  positionen,
  artikelMap,
  open,
  onOpenChange,
}: {
  order: Bestellungen;
  lieferantMap: Map<string, Lieferanten>;
  positionen: Bestellpositionen[];
  artikelMap: Map<string, Artikel>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const lieferantId = extractRecordId(order.fields.lieferant_bestellung);
  const lieferant = lieferantId ? lieferantMap.get(lieferantId) : null;

  const orderPositionen = positionen.filter((p) => {
    const bestId = extractRecordId(p.fields.bestellung);
    return bestId === order.record_id;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Bestellung {order.fields.bestellnummer || '-'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Bestelldatum</span>
                <p className="font-medium">{formatDate(order.fields.bestelldatum)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Lieferdatum</span>
                <p className="font-medium">{formatDate(order.fields.gewuenschtes_lieferdatum)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Lieferant</span>
                <p className="font-medium">{lieferant?.fields.firmenname || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status</span>
                <p>
                  <StatusBadge status={order.fields.bestellstatus} />
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Netto</span>
                <p className="font-medium">{formatCurrency(order.fields.gesamtwert_netto)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Brutto</span>
                <p className="font-medium">{formatCurrency(order.fields.gesamtwert_brutto)}</p>
              </div>
              {order.fields.kostenstelle && (
                <div>
                  <span className="text-muted-foreground">Kostenstelle</span>
                  <p className="font-medium">{order.fields.kostenstelle}</p>
                </div>
              )}
              {order.fields.referenz_stueckliste && (
                <div>
                  <span className="text-muted-foreground">Stückliste</span>
                  <p className="font-medium">{order.fields.referenz_stueckliste}</p>
                </div>
              )}
            </div>

            {order.fields.bestellung_notizen && (
              <div className="text-sm">
                <span className="text-muted-foreground">Notizen</span>
                <p className="mt-1 whitespace-pre-wrap">{order.fields.bestellung_notizen}</p>
              </div>
            )}

            {orderPositionen.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-3">Positionen ({orderPositionen.length})</h4>
                  <div className="space-y-2">
                    {orderPositionen.map((pos) => {
                      const artId = extractRecordId(pos.fields.artikel_position);
                      const artikel = artId ? artikelMap.get(artId) : null;
                      return (
                        <div
                          key={pos.record_id}
                          className="flex items-center justify-between text-sm py-2 px-3 rounded-md bg-muted/50"
                        >
                          <div>
                            <p className="font-medium">
                              {artikel?.fields.artikelbezeichnung || `Position ${pos.fields.positionsnummer || '-'}`}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {pos.fields.menge != null ? `${formatNumber(pos.fields.menge)} Stk.` : ''}{' '}
                              {pos.fields.einzelpreis != null ? `@ ${formatCurrency(pos.fields.einzelpreis)}` : ''}
                            </p>
                          </div>
                          <span className="font-semibold">{formatCurrency(pos.fields.gesamtpreis_position)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// --- Supplier Detail Dialog ---

function SupplierDetailDialog({
  supplier,
  orders,
  open,
  onOpenChange,
}: {
  supplier: Lieferanten;
  orders: Bestellungen[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const supplierOrders = orders.filter((o) => {
    const lid = extractRecordId(o.fields.lieferant_bestellung);
    return lid === supplier.record_id;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {supplier.fields.firmenname || 'Lieferant'}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {supplier.fields.lieferantennummer && (
                <div>
                  <span className="text-muted-foreground">Nr.</span>
                  <p className="font-medium">{supplier.fields.lieferantennummer}</p>
                </div>
              )}
              {(supplier.fields.ansprechpartner_vorname || supplier.fields.ansprechpartner_nachname) && (
                <div>
                  <span className="text-muted-foreground">Ansprechpartner</span>
                  <p className="font-medium">
                    {[supplier.fields.ansprechpartner_vorname, supplier.fields.ansprechpartner_nachname]
                      .filter(Boolean)
                      .join(' ')}
                  </p>
                </div>
              )}
              {supplier.fields.email && (
                <div>
                  <span className="text-muted-foreground">E-Mail</span>
                  <p className="font-medium">{supplier.fields.email}</p>
                </div>
              )}
              {supplier.fields.telefon && (
                <div>
                  <span className="text-muted-foreground">Telefon</span>
                  <p className="font-medium">{supplier.fields.telefon}</p>
                </div>
              )}
              {(supplier.fields.strasse || supplier.fields.ort) && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Adresse</span>
                  <p className="font-medium">
                    {[
                      [supplier.fields.strasse, supplier.fields.hausnummer].filter(Boolean).join(' '),
                      [supplier.fields.plz, supplier.fields.ort].filter(Boolean).join(' '),
                      supplier.fields.land,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              )}
              {supplier.fields.zahlungsziel_tage != null && (
                <div>
                  <span className="text-muted-foreground">Zahlungsziel</span>
                  <p className="font-medium">{supplier.fields.zahlungsziel_tage} Tage</p>
                </div>
              )}
            </div>

            {supplierOrders.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-3">Bestellungen ({supplierOrders.length})</h4>
                  <div className="space-y-2">
                    {supplierOrders
                      .sort((a, b) => (b.fields.bestelldatum || '').localeCompare(a.fields.bestelldatum || ''))
                      .slice(0, 10)
                      .map((o) => (
                        <div
                          key={o.record_id}
                          className="flex items-center justify-between text-sm py-2 px-3 rounded-md bg-muted/50"
                        >
                          <div>
                            <p className="font-medium">{o.fields.bestellnummer || '-'}</p>
                            <p className="text-muted-foreground text-xs">{formatDate(o.fields.bestelldatum)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(o.fields.gesamtwert_netto)}</p>
                            <StatusBadge status={o.fields.bestellstatus} />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// --- New Order Dialog ---

function NewOrderDialog({
  open,
  onOpenChange,
  lieferanten,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lieferanten: Lieferanten[];
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bestellnummer: '',
    bestelldatum: new Date().toISOString().split('T')[0],
    lieferant_bestellung: '',
    gewuenschtes_lieferdatum: '',
    bestellstatus: 'entwurf',
    kostenstelle: '',
    bestellung_notizen: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.bestellnummer.trim()) return;

    setSubmitting(true);
    try {
      const apiFields: Record<string, unknown> = {
        bestellnummer: formData.bestellnummer,
        bestelldatum: formData.bestelldatum,
        bestellstatus: formData.bestellstatus,
      };

      if (formData.lieferant_bestellung) {
        apiFields.lieferant_bestellung = createRecordUrl(APP_IDS.LIEFERANTEN, formData.lieferant_bestellung);
      }
      if (formData.gewuenschtes_lieferdatum) {
        apiFields.gewuenschtes_lieferdatum = formData.gewuenschtes_lieferdatum;
      }
      if (formData.kostenstelle) {
        apiFields.kostenstelle = formData.kostenstelle;
      }
      if (formData.bestellung_notizen) {
        apiFields.bestellung_notizen = formData.bestellung_notizen;
      }

      await LivingAppsService.createBestellungenEntry(apiFields as Bestellungen['fields']);

      setFormData({
        bestellnummer: '',
        bestelldatum: new Date().toISOString().split('T')[0],
        lieferant_bestellung: '',
        gewuenschtes_lieferdatum: '',
        bestellstatus: 'entwurf',
        kostenstelle: '',
        bestellung_notizen: '',
      });
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      console.error('Bestellung erstellen fehlgeschlagen:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Neue Bestellung
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bestellnummer">Bestellnummer *</Label>
              <Input
                id="bestellnummer"
                value={formData.bestellnummer}
                onChange={(e) => setFormData((f) => ({ ...f, bestellnummer: e.target.value }))}
                placeholder="z.B. B-2026-001"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="bestelldatum">Bestelldatum</Label>
                <Input
                  id="bestelldatum"
                  type="date"
                  value={formData.bestelldatum}
                  onChange={(e) => setFormData((f) => ({ ...f, bestelldatum: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lieferdatum">Lieferdatum</Label>
                <Input
                  id="lieferdatum"
                  type="date"
                  value={formData.gewuenschtes_lieferdatum}
                  onChange={(e) => setFormData((f) => ({ ...f, gewuenschtes_lieferdatum: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lieferant</Label>
              <Select
                value={formData.lieferant_bestellung || 'none'}
                onValueChange={(v) => setFormData((f) => ({ ...f, lieferant_bestellung: v === 'none' ? '' : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Lieferant auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kein Lieferant</SelectItem>
                  {lieferanten.map((l) => (
                    <SelectItem key={l.record_id} value={l.record_id}>
                      {l.fields.firmenname || l.fields.lieferantennummer || l.record_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.bestellstatus}
                onValueChange={(v) => setFormData((f) => ({ ...f, bestellstatus: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((key) => (
                    <SelectItem key={key} value={key}>
                      {STATUS_LABELS[key]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kostenstelle">Kostenstelle</Label>
              <Input
                id="kostenstelle"
                value={formData.kostenstelle}
                onChange={(e) => setFormData((f) => ({ ...f, kostenstelle: e.target.value }))}
                placeholder="z.B. KST-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notizen">Notizen</Label>
              <Textarea
                id="notizen"
                value={formData.bestellung_notizen}
                onChange={(e) => setFormData((f) => ({ ...f, bestellung_notizen: e.target.value }))}
                placeholder="Optionale Notizen..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={submitting || !formData.bestellnummer.trim()}>
                {submitting ? 'Wird erstellt...' : 'Bestellung anlegen'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// --- Status Badge ---

function StatusBadge({ status }: { status: string | undefined }) {
  if (!status) return <Badge variant="outline">-</Badge>;

  const color = STATUS_COLORS[status] || 'hsl(210 10% 60%)';
  const label = STATUS_LABELS[status] || status;

  return (
    <Badge
      variant="outline"
      className="text-xs font-medium border-0"
      style={{ backgroundColor: color, color: '#fff' }}
    >
      {label}
    </Badge>
  );
}

// --- Pipeline Bar Chart ---

function PipelineBar({ bestellungen }: { bestellungen: Bestellungen[] }) {
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    STATUS_ORDER.forEach((s) => (counts[s] = 0));
    bestellungen.forEach((b) => {
      const st = b.fields.bestellstatus;
      if (st && counts[st] !== undefined) counts[st]++;
    });
    return counts;
  }, [bestellungen]);

  const total = bestellungen.length;
  if (total === 0) return null;

  const segments = STATUS_ORDER.filter((s) => statusCounts[s] > 0);

  return (
    <div className="space-y-2">
      <div className="flex h-8 md:h-12 rounded-md overflow-hidden">
        {segments.map((s) => {
          const pct = (statusCounts[s] / total) * 100;
          return (
            <div
              key={s}
              className="relative group flex items-center justify-center text-xs font-medium text-white transition-opacity hover:opacity-90"
              style={{
                width: `${pct}%`,
                backgroundColor: STATUS_COLORS[s],
                minWidth: pct > 0 ? '24px' : '0',
              }}
              title={`${STATUS_LABELS[s]}: ${statusCounts[s]} (${pct.toFixed(0)}%)`}
            >
              {pct >= 8 && <span className="truncate px-1">{statusCounts[s]}</span>}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {STATUS_LABELS[s]}: {statusCounts[s]} ({pct.toFixed(0)}%)
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((s) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: STATUS_COLORS[s] }} />
            <span>
              {STATUS_LABELS[s]} ({statusCounts[s]})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Volume Chart ---

function VolumeChart({ bestellungen }: { bestellungen: Bestellungen[] }) {
  const chartData = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    const recentOrders = bestellungen.filter((b) => {
      if (!b.fields.bestelldatum) return false;
      try {
        const d = parseISO(b.fields.bestelldatum);
        return isAfter(d, thirtyDaysAgo);
      } catch {
        return false;
      }
    });

    const weekMap = new Map<string, number>();

    recentOrders.forEach((b) => {
      if (!b.fields.bestelldatum) return;
      try {
        const d = parseISO(b.fields.bestelldatum);
        const weekStart = startOfWeek(d, { weekStartsOn: 1 });
        const key = format(weekStart, 'yyyy-MM-dd');
        const current = weekMap.get(key) || 0;
        weekMap.set(key, current + (b.fields.gesamtwert_netto || 0));
      } catch {
        // skip invalid dates
      }
    });

    return Array.from(weekMap.entries())
      .map(([dateKey, value]) => ({
        date: dateKey,
        label: `KW ${getISOWeek(parseISO(dateKey))}`,
        value,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [bestellungen]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] md:h-[280px] text-sm text-muted-foreground">
        Keine Bestellungen in den letzten 30 Tagen
      </div>
    );
  }

  return (
    <div className="h-[200px] md:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(173 58% 39%)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(173 58% 39%)" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="hsl(215 10% 48%)" tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="hsl(215 10% 48%)"
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) =>
              new Intl.NumberFormat('de-DE', { notation: 'compact', compactDisplay: 'short' }).format(v)
            }
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(0 0% 100%)',
              border: '1px solid hsl(210 15% 90%)',
              borderRadius: '8px',
              fontSize: '13px',
            }}
            formatter={(value: number) => [formatCurrency(value), 'Volumen']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(173 58% 39%)"
            strokeWidth={2}
            fill="url(#tealGradient)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// --- Main Dashboard ---

export default function Dashboard() {
  const [bestellungen, setBestellungen] = useState<Bestellungen[]>([]);
  const [positionen, setPositionen] = useState<Bestellpositionen[]>([]);
  const [lieferanten, setLieferanten] = useState<Lieferanten[]>([]);
  const [artikel, setArtikel] = useState<Artikel[]>([]);
  const [stuecklisten, setStuecklisten] = useState<StuecklistenImport[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Bestellungen | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Lieferanten | null>(null);

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const [best, pos, lief, art, stueck] = await Promise.all([
        LivingAppsService.getBestellungen(),
        LivingAppsService.getBestellpositionen(),
        LivingAppsService.getLieferanten(),
        LivingAppsService.getArtikel(),
        LivingAppsService.getStuecklistenImport(),
      ]);
      setBestellungen(best);
      setPositionen(pos);
      setLieferanten(lief);
      setArtikel(art);
      setStuecklisten(stueck);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // --- Derived Data ---

  const lieferantMap = useMemo(() => {
    const m = new Map<string, Lieferanten>();
    lieferanten.forEach((l) => m.set(l.record_id, l));
    return m;
  }, [lieferanten]);

  const artikelMap = useMemo(() => {
    const m = new Map<string, Artikel>();
    artikel.forEach((a) => m.set(a.record_id, a));
    return m;
  }, [artikel]);

  const openOrders = useMemo(
    () => bestellungen.filter((b) => !CLOSED_STATUSES.includes(b.fields.bestellstatus || '')),
    [bestellungen]
  );

  const openOrdersValue = useMemo(
    () => openOrders.reduce((sum, b) => sum + (b.fields.gesamtwert_netto || 0), 0),
    [openOrders]
  );

  const entwurfCount = useMemo(
    () => bestellungen.filter((b) => b.fields.bestellstatus === 'entwurf').length,
    [bestellungen]
  );

  const inLieferungCount = useMemo(
    () => bestellungen.filter((b) => b.fields.bestellstatus === 'in_lieferung').length,
    [bestellungen]
  );

  const ueberfaelligCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bestellungen.filter((b) => {
      if (CLOSED_STATUSES.includes(b.fields.bestellstatus || '')) return false;
      if (!b.fields.gewuenschtes_lieferdatum) return false;
      try {
        const ld = parseISO(b.fields.gewuenschtes_lieferdatum);
        return ld < today;
      } catch {
        return false;
      }
    }).length;
  }, [bestellungen]);

  const recentOrders = useMemo(
    () =>
      [...bestellungen]
        .sort((a, b) => (b.fields.bestelldatum || '').localeCompare(a.fields.bestelldatum || ''))
        .slice(0, 8),
    [bestellungen]
  );

  const topLieferanten = useMemo(() => {
    const stats = new Map<string, { count: number; total: number }>();
    bestellungen.forEach((b) => {
      const lid = extractRecordId(b.fields.lieferant_bestellung);
      if (!lid) return;
      const cur = stats.get(lid) || { count: 0, total: 0 };
      cur.count++;
      cur.total += b.fields.gesamtwert_netto || 0;
      stats.set(lid, cur);
    });

    return lieferanten
      .map((l) => ({
        ...l,
        orderCount: stats.get(l.record_id)?.count || 0,
        orderTotal: stats.get(l.record_id)?.total || 0,
      }))
      .filter((l) => l.orderCount > 0)
      .sort((a, b) => b.orderTotal - a.orderTotal)
      .slice(0, 5);
  }, [lieferanten, bestellungen]);

  // --- Render ---

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-6 space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-in fade-in duration-500">
        <div>
          <h1 className="text-lg md:text-2xl font-bold tracking-tight">Bestellmanagement</h1>
          <p className="text-sm text-muted-foreground font-light">aus Stückliste</p>
        </div>
        <Button onClick={() => setNewOrderOpen(true)} size="default" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Neue Bestellung</span>
          <span className="sm:hidden">Neu</span>
        </Button>
      </div>

      {/* Hero KPI Banner */}
      <Card className="shadow-sm border-t-3 border-t-primary animate-in fade-in duration-500 delay-100" style={{ borderTopWidth: '3px' }}>
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs md:text-sm font-normal uppercase tracking-wider text-muted-foreground">
                Offene Bestellungen
              </p>
              <p className="text-4xl md:text-5xl font-bold tracking-tight">{openOrders.length}</p>
              <p className="text-lg md:text-xl font-medium text-muted-foreground">{formatCurrency(openOrdersValue)}</p>
            </div>

            <div className="flex flex-wrap gap-2 md:gap-3">
              <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Entwürfe</p>
                  <p className="text-sm font-semibold">{entwurfCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-accent px-3 py-2">
                <Truck className="h-4 w-4 text-accent-foreground" />
                <div>
                  <p className="text-xs text-accent-foreground">In Lieferung</p>
                  <p className="text-sm font-semibold text-accent-foreground">{inLieferungCount}</p>
                </div>
              </div>
              <div
                className={`flex items-center gap-2 rounded-md px-3 py-2 ${
                  ueberfaelligCount > 0 ? 'bg-destructive/10' : 'bg-muted'
                }`}
              >
                <AlertTriangle
                  className={`h-4 w-4 ${ueberfaelligCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`}
                />
                <div>
                  <p className={`text-xs ${ueberfaelligCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    Überfällig
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      ueberfaelligCount > 0 ? 'text-destructive' : 'text-foreground'
                    }`}
                  >
                    {ueberfaelligCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content: 65/35 Split on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-[1.85fr_1fr] gap-5 md:gap-6">
        {/* Left Column */}
        <div className="space-y-5 md:space-y-6">
          {/* Pipeline Bar */}
          <Card className="shadow-sm animate-in fade-in duration-500 delay-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Bestellstatus-Übersicht</CardTitle>
            </CardHeader>
            <CardContent>
              {bestellungen.length > 0 ? (
                <PipelineBar bestellungen={bestellungen} />
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">Keine Bestellungen vorhanden</p>
              )}
            </CardContent>
          </Card>

          {/* Volume Chart */}
          <Card className="shadow-sm animate-in fade-in duration-500 delay-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Bestellvolumen (30 Tage)</CardTitle>
            </CardHeader>
            <CardContent>
              <VolumeChart bestellungen={bestellungen} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-5 md:space-y-6">
          {/* Recent Orders */}
          <Card className="shadow-sm animate-in fade-in duration-500 delay-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Aktuelle Bestellungen</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentOrders.length > 0 ? (
                <div>
                  {recentOrders.map((order) => {
                    const lid = extractRecordId(order.fields.lieferant_bestellung);
                    const lieferant = lid ? lieferantMap.get(lid) : null;
                    return (
                      <div
                        key={order.record_id}
                        className="flex items-center justify-between px-5 py-3 cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {order.fields.bestellnummer || '-'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {lieferant?.fields.firmenname || 'Kein Lieferant'}
                          </p>
                        </div>
                        <div className="text-right ml-3 shrink-0">
                          <p className="text-sm font-medium">{formatCurrency(order.fields.gesamtwert_netto)}</p>
                          <StatusBadge status={order.fields.bestellstatus} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-5 py-8 text-center">
                  <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Noch keine Bestellungen</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => setNewOrderOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Erste Bestellung anlegen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Suppliers */}
          <Card className="shadow-sm animate-in fade-in duration-500 delay-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Top Lieferanten</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {topLieferanten.length > 0 ? (
                <div>
                  {topLieferanten.map((supplier) => (
                    <div
                      key={supplier.record_id}
                      className="flex items-center justify-between px-5 py-3 cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => setSelectedSupplier(supplier)}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{supplier.fields.firmenname || '-'}</p>
                        <p className="text-xs text-muted-foreground">
                          {supplier.orderCount} {supplier.orderCount === 1 ? 'Bestellung' : 'Bestellungen'}
                        </p>
                      </div>
                      <p className="text-sm font-medium ml-3 shrink-0">{formatCurrency(supplier.orderTotal)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-8 text-center">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Keine Lieferanten mit Bestellungen</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <NewOrderDialog
        open={newOrderOpen}
        onOpenChange={setNewOrderOpen}
        lieferanten={lieferanten}
        onSuccess={fetchData}
      />

      {selectedOrder && (
        <OrderDetailDialog
          order={selectedOrder}
          lieferantMap={lieferantMap}
          positionen={positionen}
          artikelMap={artikelMap}
          open={!!selectedOrder}
          onOpenChange={(open) => {
            if (!open) setSelectedOrder(null);
          }}
        />
      )}

      {selectedSupplier && (
        <SupplierDetailDialog
          supplier={selectedSupplier}
          orders={bestellungen}
          open={!!selectedSupplier}
          onOpenChange={(open) => {
            if (!open) setSelectedSupplier(null);
          }}
        />
      )}
    </div>
  );
}

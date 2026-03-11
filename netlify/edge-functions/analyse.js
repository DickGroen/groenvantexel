export default async (request, context) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const { prompt, bedrijf, sector, periode, bestanden } = body;

    const ANALYSE_PROMPT = `Je bent een financieel analist gespecialiseerd in MKB-bedrijven. Voer de MKB Stresstest Methode™ uit.

SECTOR: ${sector}
KLANT: ${bedrijf}
PERIODE: ${periode}

SECTORNORMEN VOOR ${sector.toUpperCase()}:
- Brutomarge: 30–40%
- EBITDA: 6–12%
- Personeelskosten: 45–60% van omzet
- Debiteurendagen: 30–45 dagen
- Voorraadratio: 30–60 dagen
- Solvabiliteit: 25–40%
- Current ratio: 1,3–1,8
- Liquiditeitsbuffer: 1–3 maanden omzet

STAP 1 — RATIO'S BEREKENEN & BEOORDELEN
Bereken en beoordeel de volgende ratio's uit de aangeleverde jaarcijfers:
— Brutomarge (%) = brutoresultaat / netto-omzet × 100
— Personeelskosten als % van omzet
— Debiteurendagen = (debiteuren / omzet) × 365
— Voorraadratio = (voorraad / omzet) × 365
— Current ratio = vlottende activa / kortlopende schulden
— Solvabiliteit = eigen vermogen / balanstotaal × 100
— Kasontwikkeling = vergelijk liquide middelen met nettowinst

STAP 2 — DRIE GROOTSTE AFWIJKINGEN
Geef de drie grootste afwijkingen met per afwijking:
1. Wat de afwijking is (in cijfers en procentpunten)
2. Financieel effect in euro's via de rekenregels uit Stap 3
3. Mogelijke oorzaak

STAP 3 — REKENREGELS VERBETERPOTENTIEEL
Post A — Personeelskosten: (Sectormidden % − werkelijk %) × omzet → risico-correctie, geen besparing
Post B — EV-overkapitalisatie: EV huidig − (sectormidden solvabiliteit % × balanstotaal)
Post C — Debiteurendagen: (werkelijke dagen − 45) / 365 × omzet (alleen als >45)
Post D — Voorraadratio: (werkelijke dagen − 60) / 365 × omzet (alleen als >60)
Post E — Kas-overschot: liquide middelen − (omzet / 12) (alleen als >2 maanden omzet)

STAP 4 — TOTALEN
Totaal 1-pager: Post B + C + D (euro)
Totaal Basiscan: Post A + B + C + D + E (euro)

STAP 5 — OUTPUTFORMAAT
Schrijf in zakelijk Nederlands. Begin direct met de ratio's. Geen inleidende tekst.
Geef output in deze volgorde:
1. Ratio-overzicht (tabel: ratio | uitkomst | sectornorm | beoordeling ✅/⚠/🔴)
2. Toelichting kasontwikkeling
3. Drie grootste afwijkingen (tabel: afwijking | eurobedrag | oorzaak)
4. Totaal 1-pager: € ___
5. Totaal Basiscan: € ___
6. Score: ___/100

MKB Stresstest Methode™ | Vertrouwelijk — intern gebruik`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY'),
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: ANALYSE_PROMPT,
        messages: [{
          role: 'user',
          content: bestanden || 'Analyseer de jaarcijfers op basis van de beschikbare informatie.'
        }]
      })
    });

    const data = await response.json();
    const tekst = data.content?.map(c => c.text || '').join('') || 'Geen resultaat.';

    return new Response(JSON.stringify({ resultaat: tekst }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
};

export const config = { path: '/api/analyse' };

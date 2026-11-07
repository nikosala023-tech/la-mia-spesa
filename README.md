# La mia spesa

App per telefono (iOS e Android) per fare la lista della spesa senza perdere tempo:

- **Lista** divisa per reparti, nell'ordine in cui si gira il supermercato. Scrivi due lettere e l'app propone il prodotto con reparto e prezzo stimato. I prodotti che compri spesso diventano "I tuoi soliti".
- **Budget** mensile: vedi quanto hai speso nel mese e quanto ti resta con la lista attuale. Con "Ho fatto la spesa" registri il totale dello scontrino.
- **Equilibrio**: punteggio da 0 a 100, il carrello disegnato come un piatto accanto al "piatto sano" di Harvard, e al massimo 3 consigli con il link alla fonte scientifica (OMS, IARC, WCRF, CREA 2018, BMJ 2016, NEJM/PREDIMED).

I dati restano sul telefono. Prezzi e porzioni sono stime medie: quando correggi un prezzo, l'app lo ricorda.

## Installarla su iPhone (consigliato)

La versione per iPhone è nella cartella `docs/` ed è pubblicata con GitHub Pages:
**https://nikosala023-tech.github.io/la-mia-spesa/**

1. Apri il link con **Safari** sull'iPhone.
2. Tocca il tasto **Condividi** (il quadrato con la freccia in su).
3. Scegli **Aggiungi alla schermata Home**, poi **Aggiungi**.

Compare l'icona "Spesa": si apre a schermo intero come le altre app e funziona anche senza campo.
I dati restano sull'iPhone. Gli aggiornamenti arrivano da soli alla riapertura.

## Versione Expo (React Native)

Il resto del repository è la stessa app in Expo, utile se un giorno la si vuole pubblicare sull'App Store.

### Provarla con Expo Go

Serve un computer con [Node.js](https://nodejs.org) (versione 20 o più recente).

1. Installa **Expo Go** sul telefono (App Store o Google Play).
2. Sul computer:
   ```bash
   git clone https://github.com/nikosala023-tech/la-mia-spesa.git
   cd la-mia-spesa
   npm install
   npx expo start
   ```
3. Inquadra il QR code che compare: su iPhone con la Fotocamera, su Android dall'app Expo Go.
   Se telefono e computer non sono sulla stessa rete Wi-Fi usa `npx expo start --tunnel`.

### Build installabile con EAS

Con un account gratuito su [expo.dev](https://expo.dev):

```bash
npm install -g eas-cli
eas login
eas build --profile preview --platform android
```

Alla fine EAS dà un link e un QR code per scaricare l'**APK**: aprilo dal telefono Android e installalo.

Su **iPhone** l'installazione fuori da Expo Go richiede un account Apple Developer (99 €/anno):
`eas build --profile preview --platform ios` per installarla sui tuoi dispositivi, oppure
`eas build --platform ios` e `eas submit` per TestFlight.

### Sviluppo

```bash
npx tsc --noEmit   # controllo dei tipi
npx expo start     # server di sviluppo
```

Struttura:

- `App.tsx`: schermata principale, budget, pannelli (modifica prodotto, chiudi spesa, budget e storico)
- `src/components/ListScreen.tsx`: lista per reparti e ricerca
- `src/components/BalanceScreen.tsx`: equilibrio, piatto e consigli
- `src/data.ts`: catalogo prodotti, reparti, gruppi alimentari, fonti
- `src/logic.ts`: calcolo del punteggio, consigli, ricerca, budget
- `src/store.ts`: salvataggio sul telefono (AsyncStorage)

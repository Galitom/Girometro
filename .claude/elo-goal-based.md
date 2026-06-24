# Elo basato sui gol

## Come funziona ora

Il sistema attuale usa l'Elo standard: il risultato è **binario**. Vinci o perdi,
e basta. Non importa se vinci 10-0 o 10-9 — il delta Elo è identico in entrambi i casi.

---

## L'idea

Invece di trattare ogni vittoria allo stesso modo, si usa il **punteggio effettivo**
per misurare *quanto* hai vinto o perso.

Il concetto è semplice: il risultato non è più 1 o 0, ma un valore proporzionale
ai gol segnati. Se fai tutti i gol, vali 1. Se non ne fai nessuno, vali 0.
Se la partita finisce in parità, vali 0.5.

Questo valore sostituisce il classico "hai vinto / hai perso" nella formula Elo,
che rimane invariata per tutto il resto.

---

## Effetti pratici

- **Vinci 10-0** → guadagni molti più punti rispetto a un 10-9
- **Perdi 10-9** → perdi pochissimi punti, la partita era quasi pari
- **Pareggio** → il delta è quasi zero per entrambi
- Battere un avversario molto più forte **con margine largo** ti premia doppiamente

---

## Tabella dei delta Elo

Il delta mostrato è quello del **vincitore** (chi fa 10 gol). Il perdente riceve
il valore opposto con segno negativo. Il "gap Elo" è la differenza tra il rating
del vincitore e quello del perdente prima della partita.

| Risultato | Gap −200 | Gap −100 | Gap 0 | Gap +100 | Gap +200 | Gap +500 |
|-----------|:--------:|:--------:|:-----:|:--------:|:--------:|:--------:|
| 10 – 0    | +24 | +20 | +16 |   +12    |    +8    |    +3    |
| 10 – 1    | +21 | +18 | +13 |    +9    |    +5    |    +2    |
| 10 – 2    | +19 | +15 | +11 |    +6    |    +3    |    +1    |
| 10 – 3    | +17 | +13 | +9  |    +4    |    +2    |    +1    |
| 10 – 4    | +15 | +11 | +7  |    +2    |    +1    |    +0    |
| 10 – 5    | +14 | +10 | +5  |    +1    |    +0    |    -1    |
| 10 – 6    | +12 | +8  | +4  |    +0    |    −4    |    −3    |
| 10 – 7    | +11 | +7  | +3  |    −2    |    −5    |    −6    |
| 10 – 8    | +10 | +6  | +2  |    −3    |    −7    |    −9    |
| 10 – 9    | +9  | +5  | +1  |    −4    |    −7    |   −12    |

> Gap negativo = il vincitore è più debole dell'avversario → guadagna di più.
> Gap positivo = il vincitore è più forte → guadagna di meno (o addirittura perde punti se vince di misura).

---

## Considerazioni

Il sistema diventa più sensibile alla qualità della prestazione, non solo al risultato.
Questo incentiva a giocare bene anche quando la vittoria è già sicura, e "consola"
chi perde di misura contro un avversario nettamente superiore.

Il rischio è che chi gioca in modo conservativo (vincere di poco va bene lo stesso)
venga leggermente penalizzato rispetto a chi punta sempre al massimo scarto.

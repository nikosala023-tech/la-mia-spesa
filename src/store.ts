import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { norm } from "./data";
import { exampleState, lookup, todayISO, uid, type Item, type State } from "./logic";

const KEY = "la-mia-spesa/state/v1";

/** Stato dell'app salvato sul telefono (AsyncStorage). */
export function useStore() {
  const [state, setState] = useState<State | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        const s = raw ? (JSON.parse(raw) as State) : null;
        setState(s && Array.isArray(s.items) ? { ...s, my: s.my ?? {}, freq: s.freq ?? {} } : exampleState());
      })
      .catch(() => setState(exampleState()));
  }, []);

  /** Applica una modifica e salva (con un piccolo ritardo per raggruppare i tocchi veloci). */
  const update = useCallback((fn: (draft: State) => void) => {
    setState((prev) => {
      if (!prev) return prev;
      const next: State = structuredClone(prev);
      fn(next);
      next.example = false;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      }, 400);
      return next;
    });
  }, []);

  const actions = {
    /** Aggiunge un prodotto, o ne aumenta la quantità se c'è già. Ritorna l'id e se è un prodotto nuovo. */
    add(name: string): { id: string; isNew: boolean; qty: number } | null {
      name = name.trim();
      if (!name || !state) return null;
      const k = norm(name);
      const ex = state.items.find((i) => norm(i.name) === k);
      if (ex) {
        update((d) => {
          const it = d.items.find((i) => i.id === ex.id)!;
          it.qty++;
          it.done = false;
        });
        return { id: ex.id, isNew: false, qty: ex.qty + 1 };
      }
      const c = lookup(state, name);
      const it: Item = c
        ? { ...c, id: uid(), qty: 1, done: false }
        : { id: uid(), name: name.charAt(0).toUpperCase() + name.slice(1), rep: "al", grp: "NA", price: 0, unit: "", porz: 1, qty: 1, done: false, custom: true };
      update((d) => void d.items.push(it));
      return { id: it.id, isNew: !c, qty: 1 };
    },
    toggle: (id: string) => update((d) => { const i = d.items.find((x) => x.id === id); if (i) i.done = !i.done; }),
    plus: (id: string) => update((d) => { const i = d.items.find((x) => x.id === id); if (i) i.qty++; }),
    minus: (id: string) => update((d) => { const i = d.items.find((x) => x.id === id); if (i && i.qty > 1) i.qty--; }),
    /** Toglie un prodotto e restituisce la funzione per annullare. */
    remove(id: string) {
      if (!state) return () => {};
      const ix = state.items.findIndex((i) => i.id === id);
      const it = state.items[ix];
      if (!it) return () => {};
      update((d) => { d.items = d.items.filter((x) => x.id !== id); });
      return () => update((d) => { d.items.splice(Math.min(ix, d.items.length), 0, it); });
    },
    /** Salva le modifiche a un prodotto e ricorda prezzo, reparto e tipo per la prossima volta. */
    save(id: string, patch: Partial<Item>) {
      update((d) => {
        const it = d.items.find((x) => x.id === id);
        if (!it) return;
        Object.assign(it, patch);
        if (patch.grp && !it.porz && patch.grp !== "NA" && patch.grp !== "BE") it.porz = 1;
        d.my[norm(it.name)] = { name: it.name, rep: it.rep, grp: it.grp, price: it.price, unit: it.unit || "", porz: it.porz };
      });
    },
    clearList: () => update((d) => { d.items = []; }),
    setBudget: (b: number) => update((d) => { d.budget = b; }),
    /** Registra lo scontrino: chiude i prodotti presi (o tutta la lista se nessuno è spuntato). */
    closeShop(total: number) {
      update((d) => {
        const done = d.items.filter((i) => i.done);
        const use = done.length ? done : d.items;
        d.history.push({ d: todayISO(), t: Math.round(total * 100) / 100, n: use.length });
        for (const i of use) d.freq[i.name] = (d.freq[i.name] || 0) + 1;
        const ids = new Set(use.map((i) => i.id));
        d.items = d.items.filter((i) => !ids.has(i.id));
      });
    },
    deleteShop: (index: number) => update((d) => { d.history.splice(index, 1); }),
  };

  return { state, actions };
}

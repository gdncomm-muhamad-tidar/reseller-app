# Reseller App — Vue 3 + BLUE Design System

Prototype Reseller App (Dealer Samsung), dikonversi dari Expo/React Native ke **Vue 3 + Vite**, UI memakai **BLUE Design System** (`@blibli/blue.*`, token `$blu-*`, ikon `@blibli/blue-dls-library-icon`).

```bash
npm install      # butuh akses registry GDN (@blibli:registry di .npmrc)
npm run dev      # http://localhost:5173
npm run build    # vue-tsc + vite build → dist/
```

Alur demo: layar kunci → ketuk notifikasi → Beranda + pop up misi. Tombol bintang melayang (MagicFab) melompat ke alur mana pun.
Versi Expo/React Native masih ada di branch `main`.

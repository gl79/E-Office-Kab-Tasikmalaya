
---

## 📄 `PROMPT_CUTI_EXECUTION.md`

```markdown
# 🧩 PROMPT — PHASED EXECUTION MODUL CUTI

## ATURAN EKSEKUSI
- Kerjakan **berurutan per phase**
- Jangan lompat phase
- Pastikan setiap phase bersih sebelum lanjut

---

## PHASE 0 — ANALISIS
- Review modul lain:
  - struktur folder
  - penamaan file
  - pola arsitektur
- Tentukan posisi modul cuti dalam project
- Mapping field existing → sistem baru

---

## PHASE 1 — DATABASE & MODEL
- Buat migration PostgreSQL-friendly
- Implement soft delete
- Buat Model + relationship
- Validasi konsistensi naming

---

## PHASE 2 — BUSINESS LOGIC
- Buat Service / Action:
  - create cuti
  - update cuti
  - cancel cuti
  - approve cuti
  - reject cuti
- Validasi status transition
- Tidak ada logic bisnis di controller

---

## PHASE 3 — CONTROLLER & POLICY
- Implement thin controller
- Pisahkan request validation
- Implement policy:
  - create
  - update
  - cancel
  - approve / reject

---

## PHASE 4 — FRONTEND STRUCTURE
- Buat Pages mengikuti standar modul lain
- Implement reusable components
- Buat hooks untuk logic reusable
- Integrasi Inertia SPA

---

## PHASE 5 — UX & PERFORMANCE
- Implement Deferred Props
- Tambahkan Shimmer / Skeleton Loader
- Pastikan SPA behavior
- Pastikan mobile responsive

---

## PHASE 6 — CLEANUP & VALIDATION
- Hapus code tidak terpakai
- Pastikan tidak ada duplikasi
- Pastikan semua reusable
- Review naming & struktur

---

## PHASE 7 — FINAL REVIEW
- Validasi flow end-to-end
- Uji edge case:
  - cancel sebelum approval
  - edit saat pending
- Pastikan siap production

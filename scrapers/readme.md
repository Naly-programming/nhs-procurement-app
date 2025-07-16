# 🏥 NHS Procurement Platform – Tender & Funding Discovery Feature

This feature enables users of the NHS Procurement Platform to discover live UK-based public sector tenders and funding opportunities relevant to healthcare, NHS services, and digital health. Data is sourced from trusted providers like [Contracts Finder](https://www.contractsfinder.service.gov.uk/) and more.

---

## ✅ Overview

This module fetches, parses, and stores procurement listings in a structured way to power a searchable, filterable dashboard within the platform.

### Current Capabilities:
- Scrapes detailed tender data from **Contracts Finder**
- Stores structured data in **Supabase Postgres**
- Built in **Node.js + TypeScript**
- Modular architecture for future multi-source scraping
- Flexible schema for rich filtering and display

---

## 📦 Supabase Schema

Tenders are stored in a `tenders` table in Supabase:

```sql
create table tenders (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  external_reference text,
  url text not null,
  title text,
  organisation text,
  location text,
  cpv_codes text[],
  industry text[],
  value_min numeric,
  value_max numeric,
  procurement_reference text,
  published_date date,
  closing_date date,
  closing_time text,
  contract_start_date date,
  contract_end_date date,
  contract_type text,
  procedure_type text,
  is_suitable_for_sme boolean,
  is_suitable_for_vcse boolean,
  description text,
  contact_name text,
  contact_email text,
  how_to_apply text,
  additional_text text,
  raw_html text,
  created_at timestamp with time zone default now()
);

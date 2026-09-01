/**
 * Country/currency configuration for Dokvera.
 * Adding a new country later means adding one entry here — no other
 * file needs to change, as long as it consumes `getCountryConfig()`
 * instead of hardcoding a currency.
 */

export type CountryCode = "MZ" | "AO" | "PT";

export type CountryConfig = {
  code: CountryCode;
  name: string;
  /** ISO 4217 currency code. */
  currency: string;
  /** Symbol/suffix shown to the user (kept separate from `currency` because
   *  Mozambique shows "MT", not the ISO code "MZN"). */
  currencySymbol: string;
  /** BCP-47 locale used for number/date formatting. */
  locale: string;
  /** Price of a single credit, in this country's currency.
   *  This is the ONLY per-country number the pricing engine needs —
   *  every document cost is expressed in credits (see document-specs.ts),
   *  so changing this one value re-prices the whole catalogue for that country. */
  creditPrice: number;
  /** Flat monthly price of the "Plano Pro" subscription, in local currency. */
  monthlyProPrice: number;
  /** Fallback city used in generated documents when the user leaves the
   *  city field empty — must never default to Maputo for non-MZ users. */
  defaultCity: string;
  /** How many decimal places this currency is normally shown with. */
  decimals: number;
};

export const COUNTRY_CONFIG: Record<CountryCode, CountryConfig> = {
  MZ: {
    code: "MZ",
    name: "Moçambique",
    currency: "MZN",
    currencySymbol: "MT",
    locale: "pt-MZ",
    creditPrice: 10,
    monthlyProPrice: 2750,
    defaultCity: "Maputo",
    decimals: 0,
  },
  AO: {
    code: "AO",
    name: "Angola",
    currency: "AOA",
    currencySymbol: "Kz",
    locale: "pt-AO",
    creditPrice: 110,
    monthlyProPrice: 30250,
    defaultCity: "Luanda",
    decimals: 0,
  },
  PT: {
    code: "PT",
    name: "Portugal",
    currency: "EUR",
    currencySymbol: "€",
    locale: "pt-PT",
    creditPrice: 0.24,
    monthlyProPrice: 66,
    defaultCity: "Lisboa",
    decimals: 2,
  },
};

export const DEFAULT_COUNTRY: CountryCode = "MZ";

export function getCountryConfig(country?: string | null | undefined): CountryConfig {
  if (country && country in COUNTRY_CONFIG) {
    return COUNTRY_CONFIG[country as CountryCode];
  }
  return COUNTRY_CONFIG[DEFAULT_COUNTRY];
}

export function listCountries(): CountryConfig[] {
  return Object.values(COUNTRY_CONFIG);
}
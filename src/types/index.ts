import React from "react";

export interface FinancialDataEntry {
  year: string;
  category: string;
  Jan: number;
  Feb: number;
  Mar: number;
  Apr: number;
  May: number;
  Jun: number;
  Jul: number;
  Aug: number;
  Sep: number;
  Oct: number;
  Nov: number;
  Dec: number;
}

// Bulan
export type Month =
  | "Jan"
  | "Feb"
  | "Mar"
  | "Apr"
  | "May"
  | "Jun"
  | "Jul"
  | "Aug"
  | "Sep"
  | "Oct"
  | "Nov"
  | "Dec";

// Data keuangan
export interface FinancialDataEntry {
  year: string;
  category: string;
  Jan: number;
  Feb: number;
  Mar: number;
  Apr: number;
  May: number;
  Jun: number;
  Jul: number;
  Aug: number;
  Sep: number;
  Oct: number;
  Nov: number;
  Dec: number;
}

// Data yang diproses
export interface ProcessedDataPoint {
  month: string;
  [key: string]: number | string;
}

// Data tren 
export interface TransposedTrendDataPoint {
  month: string;
  [key: string]: number | string;
}

// Kolom di DataTable
export interface Column<T> {
  key: string;
  header: string;
  accessor: keyof T;
  formatter?: (value: T[keyof T]) => React.ReactNode;
}

export interface InvestorDataEntry {
  year: string;
  region: string;
  month: string;
  investorPercentage: number;
  assetTrillionRp: number;
  assetPercentage: number;
}

export type Region =
  | "Jawa"
  | "Sumatera"
  | "Kalimantan"
  | "Sulawesi"
  | "Bali, NTT, NTB"
  | "Maluku & Papua";

export type DemografiOption =
  | "Laki-laki"
  | "Perempuan"
  | "<=30"
  | "31-40"
  | "41-50"
  | "51-60"
  | ">60"
  | "Ibu Rumah Tangga"
  | "Pelajar"
  | "Pegawai"
  | "Pengusaha"
  | "Lainnya"
  | "<= SMA"
  | "D3"
  | "S1"
  | ">= S2"
  | "<= Rp10 juta"
  | "Rp10-100 juta"
  | "Rp100-500 juta"
  | ">Rp500 juta";

export interface MetricComparison {
  region: string;
  assetTrillionRp: string;
  growth: string;
  volatility: string;
}

export interface DemographicMetricComparison {
  subcategory: string;
  assetTrillionRp: string;
  growth: string;
  volatility: string;
}

export interface ProcessedRegionDataPoint {
  region: string;
  investorPercentage: number;
  assetTrillionRp: number;
}

// Subcategory aset dalam demografi
export interface DemographicSubcategory {
  assetTrillionRp: number;
}

// Kategori-kategori dalam demografi
export interface DemographicCategories {
  gender: Record<string, DemographicSubcategory>;
  age: Record<string, DemographicSubcategory>;
  occupation: Record<string, DemographicSubcategory>;
  education: Record<string, DemographicSubcategory>;
  income: Record<string, DemographicSubcategory>;
}

// Entri data demografi
export interface DemographicDataEntry {
  year: string;
  month: string;
  categories: DemographicCategories;
}

// Demografi untuk visualisasi
export interface ProcessedDemographicDataPoint {
  name: string;
  value: number;
  color?: string;
}

// Data perbandingan tahun demografi
export interface DemographicComparisonDataPoint {
  year: string;
  [subcategory: string]: string | number;
}

// Opsi kategori demografi
export interface CategoryOption {
  id: keyof DemographicCategories;
  label: string;
  icon: React.ReactNode;
}

export interface DemographicPercentageChange {
  gender: { "Laki-laki": number; Perempuan: number };
  age: {
    "<=30": number;
    "31-40": number;
    "41-50": number;
    "51-60": number;
    ">60": number;
  };
  occupation: {
    "Ibu Rumah Tangga": number;
    Pelajar: number;
    Pegawai: number;
    Pengusaha: number;
    Lainnya: number;
  };
  education: {
    "<= SMA": number;
    D3: number;
    S1: number;
    ">= S2": number;
  };
  income: {
    "<= Rp10 juta": number;
    "Rp10-100 juta": number;
    "Rp100-500 juta": number;
    ">Rp500 juta": number;
  };
}

import React, { useState, useMemo, useCallback } from "react";
import clsx from "clsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import StatCard from "@/components/ui/stat-card";
import DonutChart from "@/components/ui/donut-chart";
import MetricGrid from "@/components/ui/metric-grid";
import DataTable from "@/components/ui/data-table";
import FilterBar from "@/components/ui/filter-bar";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  Filter as FilterIcon,
  UserCircle,
  BookOpen,
  Briefcase,
  Calendar,
  DollarSign,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Label,
  Cell,
} from "recharts";
import { demographicData } from "@/data/demographicData";
const GradientBackground: React.FC = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:to-gray-800" />
    <div
      className="absolute top-0 left-0 w-full h-full opacity-30"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />
  </div>
);
interface DemographicSubcategory {
  assetTrillionRp: number;
}
interface DemographicCategories {
  gender: Record<string, DemographicSubcategory>;
  age: Record<string, DemographicSubcategory>;
  occupation: Record<string, DemographicSubcategory>;
  education: Record<string, DemographicSubcategory>;
  income: Record<string, DemographicSubcategory>;
}
interface DemographicDataEntry {
  year: string;
  month: string;
  categories: DemographicCategories;
}
interface DetailDataEntry {
  year: string;
  month: string;
  subcategory: string;
  assetTrillionRp: number;
}
interface CategoryOption {
  id: keyof DemographicCategories;
  label: string;
  icon: React.ReactNode;
}
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number | string;
  }>;
  label?: string;
}
interface ProcessedDataPoint {
  name: string;
  value: number;
  color?: string;
}
interface ComparisonDataPoint {
  year: string;
  [subcategory: string]: string | number;
}
interface MetricComparison {
  subcategory: string;
  assetTrillionRp: string;
  growth: string;
  volatility: string;
}
interface TransposedTrendDataPoint {
  month: string;
  [key: string]: number | string;
}
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-4 py-2 bg-gray-800 text-white rounded-md shadow-lg">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center mb-1">
            <span
              className="inline-block w-3 h-3 mr-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></span>
            <span className="text-sm font-medium">{entry.name}: </span>
            <span className="text-sm">
              {typeof entry.value === "number"
                ? entry.name.includes("Aset")
                  ? new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 2,
                    }).format(entry.value)
                  : `${entry.value.toFixed(2)}%`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
const SelectionFilter: React.FC<{
  subcategories: string[];
  selectedSubcategories: string[];
  onChange: (subcategories: string[]) => void;
  title?: string;
}> = ({
  subcategories,
  selectedSubcategories,
  onChange,
  title = "Filter Subkategori",
}) => {
  const handleChange = (subcategory: string) => {
    const isSelected = selectedSubcategories.includes(subcategory);
    const newSelection = isSelected
      ? selectedSubcategories.filter((s) => s !== subcategory)
      : [...selectedSubcategories, subcategory];
    if (newSelection.length > 0) {
      onChange(newSelection);
    }
  };
  const handleSelectAll = () => {
    onChange([...subcategories]);
  };
  const handleClearAll = () => {
    onChange([subcategories[0]]);
  };
  return (
    <Card className="bg-white dark:bg-gray-800/80 shadow-sm mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FilterIcon className="w-5 h-5 text-blue-500" />
          {title}
        </CardTitle>
        <CardDescription>
          Pilih subkategori untuk memfilter visualisasi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 mb-3">
          {subcategories.map((subcategory) => (
            <button
              key={subcategory}
              onClick={() => handleChange(subcategory)}
              className={clsx(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                selectedSubcategories.includes(subcategory)
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ring-2 ring-blue-500"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200"
              )}
            >
              {subcategory}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-md hover:bg-blue-100"
          >
            Pilih Semua
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-1 text-xs bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100"
          >
            Hapus Semua
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
const formatNumber = (value: number, isCurrency = false): string => {
  return isCurrency
    ? new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 2,
      }).format(value)
    : new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
};
interface DemographicMetrics {
  currentAssetValue: number;
  growthAssetPercentage: number;
  trendAssetPercentage: number[];
  volatilityAssetPercentage: number;
  highestAsset: number;
  lowestAsset: number;
  roi: number;
}
const calculateDemographicMetrics = (
  year: string,
  subcategory: string,
  category: keyof DemographicCategories
): DemographicMetrics => {
  let yearData: DemographicDataEntry[] = [];
  if (year === "All") {
    yearData = [...demographicData];
  } else {
    yearData = demographicData.filter((d) => d.year === year);
  }
  if (yearData.length === 0)
    return {
      currentAssetValue: 0,
      growthAssetPercentage: 0,
      trendAssetPercentage: [],
      volatilityAssetPercentage: 0,
      highestAsset: 0,
      lowestAsset: 0,
      roi: 0,
    };
  const aggregatedAssets: Record<string, number> = {};
  months.forEach((month) => {
    const monthData = yearData.filter((d) => d.month === month);
    aggregatedAssets[month] = monthData.reduce((sum, data) => {
      const subCatData = data.categories[category][subcategory];
      return sum + (subCatData ? subCatData.assetTrillionRp : 0);
    }, 0);
  });
  const assetValues: number[] = months.map((month) => aggregatedAssets[month]);
  const currentAssetValue = assetValues[assetValues.length - 1];
  const initialAssetValue = assetValues[0];
  const growthAssetPercentage =
    initialAssetValue !== 0
      ? ((currentAssetValue - initialAssetValue) / initialAssetValue) * 100
      : 0;
  const trendAssetPercentage: number[] = months.map((month, idx) => {
    if (idx === 0) {
      return 0;
    }
    const prev = aggregatedAssets[months[idx - 1]];
    const curr = aggregatedAssets[month];
    return prev !== 0 ? ((curr - prev) / prev) * 100 : 0;
  });
  const validTrends = trendAssetPercentage.filter((v) => !isNaN(v));
  const average = validTrends.length
    ? validTrends.reduce((a, b) => a + b, 0) / validTrends.length
    : 0;
  const volatilityAssetPercentage = Math.sqrt(
    validTrends.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) /
      (validTrends.length || 1)
  );
  const highestAsset = Math.max(...assetValues);
  const lowestAsset = Math.min(...assetValues.filter((v) => v > 0)) || 0;
  const roi =
    initialAssetValue !== 0
      ? ((currentAssetValue - initialAssetValue) / initialAssetValue) * 100
      : 0;
  return {
    currentAssetValue,
    growthAssetPercentage,
    trendAssetPercentage: validTrends,
    volatilityAssetPercentage,
    highestAsset,
    lowestAsset,
    roi,
  };
};
const DemografiInvestorIndividu: React.FC = () => {
  const categoryOptions = useMemo<CategoryOption[]>(
    () => [
      { id: "gender", label: "Jenis Kelamin", icon: <UserCircle /> },
      { id: "age", label: "Umur", icon: <Calendar /> },
      { id: "occupation", label: "Pekerjaan", icon: <Briefcase /> },
      { id: "education", label: "Pendidikan", icon: <BookOpen /> },
      { id: "income", label: "Pendapatan", icon: <DollarSign /> },
    ],
    []
  );
  const colors = useMemo<string[]>(
    () => [
      "#2563eb",
      "#16a34a",
      "#dc2626",
      "#9333ea",
      "#f59e0b",
      "#14b8a6",
      "#06b6d4",
      "#ec4899",
    ],
    []
  );
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [selectedCategory, setSelectedCategory] =
    useState<keyof DemographicCategories>("gender");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    demographicData.forEach((entry) => years.add(entry.year));
    return Array.from(years).sort();
  }, []);
  const subcategories = useMemo<string[]>(() => {
    const subCats = new Set<string>();
    demographicData.forEach((entry) => {
      Object.keys(entry.categories[selectedCategory]).forEach((subCat) => {
        subCats.add(subCat);
      });
    });
    return Array.from(subCats);
  }, [selectedCategory]);
  const [selectedOverviewSubcategories, setSelectedOverviewSubcategories] =
    useState<string[]>(() => [...subcategories]);
  const [selectedAnalysisSubcategories, setSelectedAnalysisSubcategories] =
    useState<string[]>(() => [...subcategories]);
  const [selectedComparisonSubcategories, setSelectedComparisonSubcategories] =
    useState<string[]>(() => [...subcategories]);
  React.useEffect(() => {
    setSelectedOverviewSubcategories([...subcategories]);
    setSelectedAnalysisSubcategories([...subcategories]);
    setSelectedComparisonSubcategories([...subcategories]);
  }, [subcategories]);
  const currentSelectedSubcategories = useMemo(() => {
    if (activeTab === "overview") return selectedOverviewSubcategories;
    if (activeTab === "analysis") return selectedAnalysisSubcategories;
    return selectedComparisonSubcategories;
  }, [
    activeTab,
    selectedOverviewSubcategories,
    selectedAnalysisSubcategories,
    selectedComparisonSubcategories,
  ]);
  const processedData = useMemo<ProcessedDataPoint[]>(() => {
    if (selectedYear === "All") {
      const aggregatedData: Record<string, number> = {};
      subcategories.forEach((subCat) => {
        aggregatedData[subCat] = 0;
      });
      demographicData.forEach((yearEntry) => {
        subcategories.forEach((subCat) => {
          if (yearEntry.categories[selectedCategory][subCat]) {
            aggregatedData[subCat] +=
              yearEntry.categories[selectedCategory][subCat].assetTrillionRp;
          }
        });
      });
      return currentSelectedSubcategories
        .filter((subCat) => aggregatedData[subCat] > 0)
        .map((subCat, index) => ({
          name: subCat,
          value: aggregatedData[subCat],
          color: colors[index % colors.length],
        }));
    }
    const yearData = demographicData.find((d) => d.year === selectedYear);
    if (!yearData) return [];
    const categoryData = yearData.categories[selectedCategory];
    return currentSelectedSubcategories
      .filter((subCat) => categoryData[subCat])
      .map((subCat, index) => ({
        name: subCat,
        value: categoryData[subCat].assetTrillionRp,
        color: colors[index % colors.length],
      }));
  }, [
    selectedYear,
    selectedCategory,
    currentSelectedSubcategories,
    colors,
    subcategories,
  ]);
  const detailedData = useMemo<DetailDataEntry[]>(() => {
    const result: DetailDataEntry[] = [];
    demographicData.forEach((entry) => {
      if (selectedYear !== "All" && entry.year !== selectedYear) return;
      Object.keys(entry.categories[selectedCategory]).forEach((subcat) => {
        if (
          (activeTab === "overview" &&
            !selectedOverviewSubcategories.includes(subcat)) ||
          (activeTab === "analysis" &&
            !selectedAnalysisSubcategories.includes(subcat)) ||
          (activeTab === "comparison" &&
            !selectedComparisonSubcategories.includes(subcat))
        ) {
          return;
        }
        const assetValue =
          entry.categories[selectedCategory][subcat]?.assetTrillionRp || 0;
        result.push({
          year: entry.year,
          month: entry.month,
          subcategory: subcat,
          assetTrillionRp: assetValue,
        });
      });
    });
    return result;
  }, [
    selectedYear,
    selectedCategory,
    activeTab,
    selectedOverviewSubcategories,
    selectedAnalysisSubcategories,
    selectedComparisonSubcategories,
  ]);
  const subcategoryMetrics = useMemo(() => {
    const metrics: Record<string, DemographicMetrics> = {};
    subcategories.forEach((subcategory) => {
      metrics[subcategory] = calculateDemographicMetrics(
        selectedYear,
        subcategory,
        selectedCategory
      );
    });
    return metrics;
  }, [selectedYear, selectedCategory, subcategories]);
  const totalAssets = useMemo(() => {
    return processedData.reduce((sum, item) => sum + item.value, 0);
  }, [processedData]);
  const totalMetrics = useMemo(() => {
    let highestAsset = 0;
    let lowestAsset = Infinity;
    let averageGrowth = 0;
    let averageVolatility = 0;
    const filteredSubcategories = currentSelectedSubcategories;
    if (filteredSubcategories.length > 0) {
      const growthValues = filteredSubcategories.map(
        (subcat) => subcategoryMetrics[subcat]?.growthAssetPercentage || 0
      );
      const volatilityValues = filteredSubcategories.map(
        (subcat) => subcategoryMetrics[subcat]?.volatilityAssetPercentage || 0
      );
      averageGrowth =
        growthValues.reduce((sum, val) => sum + val, 0) / growthValues.length;
      averageVolatility =
        volatilityValues.reduce((sum, val) => sum + val, 0) /
        volatilityValues.length;
      filteredSubcategories.forEach((subcat) => {
        const metrics = subcategoryMetrics[subcat];
        if (metrics) {
          highestAsset = Math.max(highestAsset, metrics.highestAsset);
          if (metrics.lowestAsset > 0) {
            lowestAsset = Math.min(lowestAsset, metrics.lowestAsset);
          }
        }
      });
    }
    return {
      highestAsset,
      lowestAsset: lowestAsset === Infinity ? 0 : lowestAsset,
      totalAssets,
      averageGrowth,
      averageVolatility,
    };
  }, [subcategoryMetrics, totalAssets, currentSelectedSubcategories]);
  const topSubcategory = useMemo(() => {
    let maxGrowth = -Infinity;
    let topSubcat = "";
    currentSelectedSubcategories.forEach((subcat) => {
      const growth = subcategoryMetrics[subcat]?.growthAssetPercentage || 0;
      if (growth > maxGrowth) {
        maxGrowth = growth;
        topSubcat = subcat;
      }
    });
    return topSubcat;
  }, [subcategoryMetrics, currentSelectedSubcategories]);
  const yearlyComparisonData = useMemo<ComparisonDataPoint[]>(() => {
    return availableYears.map((year) => {
      const dataPoint: ComparisonDataPoint = { year };
      selectedComparisonSubcategories.forEach((subcat) => {
        const yearData = demographicData.find((d) => d.year === year);
        if (yearData && yearData.categories[selectedCategory][subcat]) {
          dataPoint[subcat] =
            yearData.categories[selectedCategory][subcat].assetTrillionRp;
        } else {
          dataPoint[subcat] = 0;
        }
      });
      return dataPoint;
    });
  }, [availableYears, selectedCategory, selectedComparisonSubcategories]);
  const monthlyTrendData = useMemo<TransposedTrendDataPoint[]>(() => {
    const result: TransposedTrendDataPoint[] = [];
    months.forEach((month) => {
      const dataPoint: TransposedTrendDataPoint = { month };
      selectedAnalysisSubcategories.forEach((subcat) => {
        const yearData = demographicData.filter(
          (d) =>
            (selectedYear === "All" || d.year === selectedYear) &&
            d.month === month
        );
        if (yearData.length > 0) {
          let assetValue = 0;
          let count = 0;
          yearData.forEach((data) => {
            const subcatData = data.categories[selectedCategory][subcat];
            if (subcatData) {
              assetValue += subcatData.assetTrillionRp;
              count++;
            }
          });
          dataPoint[subcat] = count > 0 ? assetValue / count : 0;
        } else {
          dataPoint[subcat] = 0;
        }
      });
      result.push(dataPoint);
    });
    return result;
  }, [selectedYear, selectedCategory, selectedAnalysisSubcategories]);
  const comparisonMonthlyData = useMemo(() => {
    return months.map((month) => {
      const dataPoint: Record<string, string | number> = { month };
      selectedComparisonSubcategories.forEach((subcat) => {
        if (selectedYear === "All") {
          const allYearsData = demographicData.filter((d) => d.month === month);
          if (allYearsData.length > 0) {
            let totalAsset = 0;
            let validCount = 0;
            allYearsData.forEach((yearData) => {
              const subcatData = yearData.categories[selectedCategory][subcat];
              if (subcatData) {
                totalAsset += subcatData.assetTrillionRp;
                validCount++;
              }
            });
            dataPoint[subcat] = validCount > 0 ? totalAsset / validCount : 0;
          } else {
            dataPoint[subcat] = 0;
          }
        } else {
          const monthData = demographicData.find(
            (d) => d.year === selectedYear && d.month === month
          );
          const subcatData = monthData?.categories[selectedCategory][subcat];
          dataPoint[subcat] = subcatData ? subcatData.assetTrillionRp : 0;
        }
      });
      return dataPoint;
    });
  }, [selectedComparisonSubcategories, selectedYear, selectedCategory]);
  const quarterlyComparisonData = useMemo(() => {
    const quarters = [
      { quarter: "Q1", months: ["Jan", "Feb", "Mar"] },
      { quarter: "Q2", months: ["Apr", "May", "Jun"] },
      { quarter: "Q3", months: ["Jul", "Aug", "Sep"] },
      { quarter: "Q4", months: ["Oct", "Nov", "Dec"] },
    ];
    return quarters.map(({ quarter, months: quarterMonths }) => {
      const dataPoint: Record<string, string | number> = { quarter };
      selectedComparisonSubcategories.forEach((subcat) => {
        let totalAsset = 0;
        let validCount = 0;
        quarterMonths.forEach((month) => {
          const monthData = demographicData.filter(
            (d) =>
              (selectedYear === "All" || d.year === selectedYear) &&
              d.month === month
          );
          monthData.forEach((data) => {
            const subcatData = data.categories[selectedCategory][subcat];
            if (subcatData) {
              totalAsset += subcatData.assetTrillionRp;
              validCount++;
            }
          });
        });
        dataPoint[subcat] = validCount > 0 ? totalAsset / validCount : 0;
      });
      return dataPoint;
    });
  }, [selectedComparisonSubcategories, selectedYear, selectedCategory]);
  const subcategoryGrowthData = useMemo<MetricComparison[]>(() => {
    if (availableYears.length < 2) return [];
    const sortedYears = [...availableYears].sort();
    const newestYear = sortedYears[sortedYears.length - 1];
    return selectedComparisonSubcategories.map((subcat) => {
      const metrics = subcategoryMetrics[subcat];
      const subcatData = demographicData.find((d) => d.year === newestYear)
        ?.categories[selectedCategory][subcat];
      const assetValue = subcatData ? subcatData.assetTrillionRp : 0;
      return {
        subcategory: subcat,
        assetTrillionRp: formatNumber(assetValue, false),
        growth: formatNumber(metrics?.growthAssetPercentage || 0, false) + "%",
        volatility:
          formatNumber(metrics?.volatilityAssetPercentage || 0, false) + "%",
      };
    });
  }, [
    availableYears,
    selectedCategory,
    selectedComparisonSubcategories,
    subcategoryMetrics,
  ]);
  const handleYearChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedYear(e.target.value);
    },
    []
  );
  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedCategory(e.target.value as keyof DemographicCategories);
    },
    []
  );
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);
  const handleOverviewSubcategoriesChange = useCallback((subcats: string[]) => {
    setSelectedOverviewSubcategories(subcats);
  }, []);
  const handleAnalysisSubcategoriesChange = useCallback((subcats: string[]) => {
    setSelectedAnalysisSubcategories(subcats);
  }, []);
  const handleComparisonSubcategoriesChange = useCallback(
    (subcats: string[]) => {
      setSelectedComparisonSubcategories(subcats);
    },
    []
  );
  return (
    <div className="relative min-h-screen w-full space-y-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <GradientBackground />
      {}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {}
        <div className="flex-1">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            KSEI Financial Dashboard: Demografi Investor Individu
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
            Analisis demografi investor individu berdasarkan berbagai kategori
            menggunakan data Kustodian Sentral Efek Indonesia (KSEI)
          </p>
        </div>
        {}
        <div className="flex flex-col gap-4">
          {}
          <div className="flex flex-col">
            <label
              htmlFor="year-select"
              className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Pilih Tahun
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={handleYearChange}
              className="px-4 py-2 border rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all hover:shadow-md"
              aria-label="Pilih Tahun"
            >
              <option value="All">Semua Tahun</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  Tahun {year}
                </option>
              ))}
            </select>
            {}
            {selectedYear === "All" ? (
              <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Menampilkan data agregat dari tahun 2021 hingga 2024.
              </span>
            ) : (
              <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Menampilkan data untuk tahun {selectedYear}.
              </span>
            )}
          </div>
          {}
          <div className="flex flex-col">
            <label
              htmlFor="category-select"
              className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
            >
              Pilih Kategori
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="px-4 py-2 border rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all hover:shadow-md"
              aria-label="Pilih Kategori"
            >
              {categoryOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {}
      <Alert variant="success" dismissible>
        <div>
          <strong>Selamat!</strong> Data terbaru telah berhasil diperbarui.
        </div>
      </Alert>
      {}
      <div>
        <nav
          className="flex space-x-4 border-b border-gray-200 dark:border-gray-700"
          aria-label="Tabs"
          role="tablist"
        >
          {["overview", "analysis", "comparison"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={clsx(
                "py-2 px-4 text-sm font-medium focus:outline-none",
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500 hover:text-blue-500"
              )}
              aria-selected={activeTab === tab}
              role="tab"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
        {}
        <div className="mt-6" role="tabpanel">
          {activeTab === "overview" && (
            <>
              {}
              <SelectionFilter
                subcategories={subcategories}
                selectedSubcategories={selectedOverviewSubcategories}
                onChange={handleOverviewSubcategoriesChange}
                title={`Filter ${
                  categoryOptions.find((c) => c.id === selectedCategory)
                    ?.label || "Subkategori"
                }`}
              />
              {}
              <MetricGrid>
                {}
                <StatCard
                  title="Aset Tertinggi (Rp Triliun)"
                  value={formatNumber(totalMetrics.highestAsset, true)}
                  change={totalMetrics.averageGrowth}
                  icon={<TrendingUp className="w-6 h-6 text-blue-500" />}
                />
                {}
                <StatCard
                  title="Aset Terendah (Rp Triliun)"
                  value={formatNumber(totalMetrics.lowestAsset, true)}
                  change={-totalMetrics.averageVolatility}
                  icon={<TrendingDown className="w-6 h-6 text-red-500" />}
                />
                {}
                <StatCard
                  title="Total Aset (Rp Triliun)"
                  value={formatNumber(totalMetrics.totalAssets, true)}
                  change={totalMetrics.averageGrowth}
                  icon={<PieChartIcon className="w-6 h-6 text-yellow-500" />}
                />
                {}
                {selectedOverviewSubcategories.map((subcat) => {
                  const metrics = subcategoryMetrics[subcat];
                  const subcatData = processedData.find(
                    (d) => d.name === subcat
                  );
                  return (
                    <StatCard
                      key={subcat}
                      title={subcat}
                      value={formatNumber(subcatData?.value || 0, true)}
                      change={metrics?.growthAssetPercentage || 0}
                      icon={<Activity className="w-6 h-6 text-cyan-500" />}
                    />
                  );
                })}
              </MetricGrid>
              {}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                {}
                <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-blue-500" />
                      Tren Aset Bulanan (Rp Triliun)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={monthlyTrendData}
                          margin={{ left: 10, right: 10, top: 20, bottom: 30 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: "0.8rem" }}
                            interval={
                              typeof window !== "undefined" &&
                              window.innerWidth < 768
                                ? 1
                                : 0
                            }
                          />
                          <YAxis
                            scale="log"
                            domain={[0.5, 6000]}
                            tickFormatter={(value) => `Rp ${value}`}
                            tickCount={6}
                            tick={{ fontSize: "0.8rem" }}
                            width={45}
                          />
                          <RechartsTooltip
                            content={<CustomTooltip />}
                            formatter={(value: number) =>
                              formatNumber(value, true)
                            }
                          />
                          <Legend
                            verticalAlign="top"
                            height={36}
                            layout="horizontal"
                            wrapperStyle={{
                              display: "flex",
                              justifyContent: "center",
                              flexWrap: "wrap",
                              gap: "8px",
                              fontSize: "0.8rem",
                            }}
                          />
                          {selectedOverviewSubcategories.map((subcat, idx) => (
                            <Line
                              key={subcat}
                              type="monotone"
                              dataKey={subcat}
                              stroke={colors[idx % colors.length]}
                              strokeWidth={2}
                              dot={{ r: 3 }}
                              activeDot={{ r: 5 }}
                              strokeOpacity={0.8}
                              name={`${subcat} Aset`}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                {}
                <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-blue-500" />
                      Distribusi Aset per{" "}
                      {categoryOptions.find((c) => c.id === selectedCategory)
                        ?.label || "Kategori"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DonutChart
                      title={`Distribusi Aset`}
                      data={processedData.map((item) => ({
                        ...item,
                        color: item.color || "#cccccc",
                      }))}
                    />
                  </CardContent>
                </Card>
              </div>
            </>
          )}
          {activeTab === "analysis" && (
            <>
              {}
              <Alert variant="default" dismissible>
                <div>
                  <strong>Insight:</strong> Subkategori{" "}
                  <em>{topSubcategory}</em> menunjukkan pertumbuhan investor
                  yang stabil selama tahun {selectedYear}.
                </div>
              </Alert>
              {}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <MetricGrid>
                  {}
                  <StatCard
                    title="Volatilitas Rata-rata (%)"
                    value={`${formatNumber(totalMetrics.averageVolatility)}%`}
                    change={totalMetrics.averageVolatility}
                    icon={<Activity className="w-6 h-6 text-blue-500" />}
                  />
                  {}
                  <StatCard
                    title="Rasio Pertumbuhan Tahunan (%)"
                    value={`${formatNumber(totalMetrics.averageGrowth)}%`}
                    change={totalMetrics.averageGrowth}
                    icon={<TrendingUp className="w-6 h-6 text-green-500" />}
                  />
                </MetricGrid>
              </div>
              {}
              <div className="mt-6 mb-8">
                <FilterBar
                  options={subcategories}
                  activeFilters={selectedAnalysisSubcategories}
                  onFilterChange={handleAnalysisSubcategoriesChange}
                  multiSelect
                />
              </div>
              {}
              <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all mt-6">
                <CardHeader>
                  <CardTitle>Tren Pertumbuhan Tahunan</CardTitle>
                  <CardDescription>
                    Nilai aset (Rp Triliun) masing-masing{" "}
                    {categoryOptions
                      .find((c) => c.id === selectedCategory)
                      ?.label.toLowerCase() || "kategori"}{" "}
                    dari tahun 2021 hingga 2024
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={yearlyComparisonData}
                        margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis
                          scale="log"
                          domain={[1, 10000]}
                          ticks={[1, 6, 20, 90, 300, 1000, 6000]}
                          tickFormatter={(value) => `Rp ${value}`}
                          width={60}
                        />
                        <RechartsTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-2 border border-gray-300 rounded shadow-md">
                                  <p className="font-medium">{`Tahun: ${label}`}</p>
                                  {payload.map((entry, index) => (
                                    <p
                                      key={`item-${index}`}
                                      style={{ color: entry.color }}
                                    >
                                      {`${entry.name}: Rp ${Number(
                                        entry.value
                                      ).toFixed(2)} Triliun`}
                                    </p>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend
                          verticalAlign="top"
                          height={36}
                          wrapperStyle={{
                            display: "flex",
                            justifyContent: "center",
                            flexWrap: "wrap",
                            gap: "8px",
                            fontSize: "0.8rem",
                          }}
                        />
                        {selectedAnalysisSubcategories.map((subcat, idx) => (
                          <Line
                            key={subcat}
                            type="monotone"
                            dataKey={subcat}
                            stroke={colors[idx % colors.length]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 6 }}
                            strokeOpacity={0.8}
                            name={subcat}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              {}
              <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all mt-6">
                <CardHeader>
                  <CardTitle>Perbandingan Total Aset</CardTitle>
                  <CardDescription>
                    Total aset (Rp Triliun) untuk setiap{" "}
                    {categoryOptions
                      .find((c) => c.id === selectedCategory)
                      ?.label.toLowerCase() || "kategori"}{" "}
                    pada tahun {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={processedData}
                        margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis
                          tickFormatter={(value) => `Rp ${value}`}
                          label={{
                            value: "Asset (Triliun Rp)",
                            angle: -90,
                            position: "insideLeft",
                            offset: -5,
                          }}
                        />
                        <RechartsTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-2 border border-gray-300 rounded shadow-md">
                                  <p className="font-medium">{`${label}`}</p>
                                  <p style={{ color: payload[0]?.color }}>
                                    {`Total Aset: Rp ${Number(
                                      payload[0]?.value
                                    ).toFixed(2)} Triliun`}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend />
                        <Bar dataKey="value" name="Total Aset (Rp Triliun)">
                          {processedData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.color || colors[index % colors.length]
                              }
                            />
                          ))}
                        </Bar>
                        {}
                        <ReferenceLine
                          y={totalAssets / (processedData.length || 1)}
                          stroke="#ff7300"
                          strokeDasharray="3 3"
                        >
                          <Label
                            value="Rata-rata"
                            position="insideBottomRight"
                            fill="#ff7300"
                          />
                        </ReferenceLine>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              {}
              <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all mt-6">
                <CardHeader>
                  <CardTitle>Analisis Tren Bulanan</CardTitle>
                  <CardDescription>
                    Perubahan nilai aset bulanan untuk{" "}
                    {categoryOptions
                      .find((c) => c.id === selectedCategory)
                      ?.label.toLowerCase() || "kategori"}{" "}
                    terpilih
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `Rp ${value}`} />
                        <RechartsTooltip
                          content={<CustomTooltip />}
                          formatter={(value: number | string) =>
                            typeof value === "number"
                              ? formatNumber(value, true)
                              : value
                          }
                        />
                        <Legend verticalAlign="top" height={36} />
                        {selectedAnalysisSubcategories.map((subcat, idx) => (
                          <Area
                            key={subcat}
                            type="monotone"
                            dataKey={subcat}
                            stroke={colors[idx % colors.length]}
                            fill={colors[idx % colors.length]}
                            fillOpacity={0.3}
                            name={subcat}
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              {}
              <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all mt-6">
                <CardHeader>
                  <CardTitle>Data Investor Detail</CardTitle>
                  <CardDescription>
                    Menampilkan data bulanan secara rinci untuk tahun{" "}
                    {selectedYear === "All" ? "2021-2024" : selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable<DetailDataEntry>
                    data={detailedData}
                    columns={[
                      { key: "year", header: "Tahun", accessor: "year" },
                      { key: "month", header: "Bulan", accessor: "month" },
                      {
                        key: "subcategory",
                        header:
                          categoryOptions.find((c) => c.id === selectedCategory)
                            ?.label || "Kategori",
                        accessor: "subcategory",
                      },
                      {
                        key: "assetTrillionRp",
                        header: "Aset (Rp Triliun)",
                        accessor: "assetTrillionRp",
                        formatter: (value: number | string) =>
                          typeof value === "number"
                            ? formatNumber(value, true)
                            : value,
                      },
                    ]}
                  />
                </CardContent>
              </Card>
            </>
          )}
          {activeTab === "comparison" && (
            <>
              {}
              <div className="mb-4">
                <FilterBar
                  options={subcategories}
                  activeFilters={selectedComparisonSubcategories}
                  onFilterChange={handleComparisonSubcategoriesChange}
                  multiSelect
                />
              </div>
              {}
              <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle>Tabel Perbandingan Metrik</CardTitle>
                  <CardDescription>
                    Menampilkan perbandingan metrik utama antar{" "}
                    {categoryOptions
                      .find((c) => c.id === selectedCategory)
                      ?.label.toLowerCase() || "kategori"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable<MetricComparison>
                    data={subcategoryGrowthData}
                    columns={[
                      {
                        key: "subcategory",
                        header: "Subkategori",
                        accessor: "subcategory",
                      },
                      {
                        key: "assetTrillionRp",
                        header: "Total Aset (Rp Triliun)",
                        accessor: "assetTrillionRp",
                      },
                      {
                        key: "growth",
                        header: "Pertumbuhan (%)",
                        accessor: "growth",
                      },
                      {
                        key: "volatility",
                        header: "Volatilitas (%)",
                        accessor: "volatility",
                      },
                    ]}
                  />
                </CardContent>
              </Card>
              {}
              <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all mt-6">
                <CardHeader>
                  <CardTitle>Perbandingan Aset Per Kuartal</CardTitle>
                  <CardDescription>
                    Membandingkan nilai aset per{" "}
                    {categoryOptions
                      .find((c) => c.id === selectedCategory)
                      ?.label.toLowerCase() || "kategori"}{" "}
                    pada setiap kuartal (dalam Triliun Rupiah)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={quarterlyComparisonData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quarter" />
                        <YAxis
                          allowDecimals={true}
                          tickFormatter={(value) => `${value} T`}
                          domain={[0, 60]}
                        />
                        <RechartsTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow">
                                  <p className="font-semibold">{`Kuartal: ${label}`}</p>
                                  {payload.map((entry, index) => (
                                    <p
                                      key={`item-${index}`}
                                      style={{ color: entry.color }}
                                    >
                                      {`${String(entry.name)}: ${formatNumber(
                                        Number(entry.value),
                                        true
                                      )}`}
                                    </p>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        {selectedComparisonSubcategories.map((subcat, idx) => (
                          <Bar
                            key={subcat}
                            dataKey={subcat}
                            fill={colors[idx % colors.length]}
                            name={subcat}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              {}
              <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all mt-6">
                <CardHeader>
                  <CardTitle>Visualisasi Perbandingan Aset Tahunan</CardTitle>
                  <CardDescription>
                    Membandingkan nilai aset per{" "}
                    {categoryOptions
                      .find((c) => c.id === selectedCategory)
                      ?.label.toLowerCase() || "kategori"}{" "}
                    antar tahun (2021-2024) dalam Triliun Rupiah
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={yearlyComparisonData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis
                          allowDecimals={true}
                          tickFormatter={(value) => `${value} T`}
                        />
                        <RechartsTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow">
                                  <p className="font-semibold">{`Tahun: ${label}`}</p>
                                  {payload.map((entry, index) => (
                                    <p
                                      key={`item-${index}`}
                                      style={{ color: entry.color }}
                                    >
                                      {`${String(entry.name)}: ${formatNumber(
                                        Number(entry.value),
                                        true
                                      )}`}
                                    </p>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        {selectedComparisonSubcategories.map((subcat, idx) => (
                          <Bar
                            key={subcat}
                            dataKey={subcat}
                            fill={colors[idx % colors.length]}
                            name={subcat}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              {}
              <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all mt-6">
                <CardHeader>
                  <CardTitle>
                    Grafik Perbandingan Aset Antar{" "}
                    {categoryOptions.find((c) => c.id === selectedCategory)
                      ?.label || "Kategori"}
                  </CardTitle>
                  <CardDescription>
                    Membandingkan nilai aset beberapa{" "}
                    {categoryOptions
                      .find((c) => c.id === selectedCategory)
                      ?.label.toLowerCase() || "kategori"}{" "}
                    sekaligus per bulan dalam Triliun Rupiah
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={comparisonMonthlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                          allowDecimals={true}
                          tickFormatter={(value: number) =>
                            `${value.toFixed(1)} T`
                          }
                        />
                        <RechartsTooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white dark:bg-gray-800 p-3 border rounded shadow">
                                  <p className="font-semibold">{`Bulan: ${label}`}</p>
                                  {payload.map((entry, index) => (
                                    <p
                                      key={`item-${index}`}
                                      style={{ color: entry.color }}
                                    >
                                      {`${String(entry.name)}: ${
                                        typeof entry.value === "number"
                                          ? entry.value.toFixed(2)
                                          : typeof entry.value === "string"
                                          ? parseFloat(entry.value).toFixed(2)
                                          : "0.00"
                                      } Triliun Rp`}
                                    </p>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        {selectedComparisonSubcategories.map((subcat, idx) => (
                          <Bar
                            key={subcat}
                            dataKey={subcat}
                            fill={colors[idx % colors.length]}
                            name={subcat}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      {}
      <div className="fixed top-0 right-0 -z-10 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 left-0 -z-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2" />
    </div>
  );
};
export default DemografiInvestorIndividu;

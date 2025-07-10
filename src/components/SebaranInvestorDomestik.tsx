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
import {
  InvestorDataEntry,
  ProcessedRegionDataPoint,
  MetricComparison,
  TransposedTrendDataPoint,
  Month,
} from "@/types";
import { investorData } from "@/data/investorData";
const GradientBackground: React.FC = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
    <div
      className="absolute top-0 left-0 w-full h-full opacity-30"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    />
  </div>
);
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    name: string;
    value: number | string;
  }>;
  label?: string;
}
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
                ? entry.name.includes("Aset (Rp Triliun)")
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
  regions: string[];
  selectedRegions: string[];
  onChange: (regions: string[]) => void;
}> = ({ regions, selectedRegions, onChange }) => {
  const handleChange = (region: string) => {
    const isSelected = selectedRegions.includes(region);
    const newSelection = isSelected
      ? selectedRegions.filter((r) => r !== region)
      : [...selectedRegions, region];
    if (newSelection.length > 0) {
      onChange(newSelection);
    }
  };
  const handleSelectAll = () => {
    onChange([...regions]);
  };
  const handleClearAll = () => {
    onChange([regions[0]]);
  };
  return (
    <Card className="bg-white dark:bg-gray-800/80 shadow-sm mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FilterIcon className="w-5 h-5 text-blue-500" />
          Filter Wilayah
        </CardTitle>
        <CardDescription>
          Pilih wilayah untuk memfilter visualisasi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 mb-3">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => handleChange(region)}
              className={clsx(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                selectedRegions.includes(region)
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ring-2 ring-blue-500"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200"
              )}
            >
              {region}
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
interface InvestorMetrics {
  currentInvestorPercentage: number;
  growthInvestorPercentage: number;
  trendInvestorPercentage: number[];
  volatilityInvestorPercentage: number;
  highestAsset: number;
  lowestAsset: number;
  roi: number;
}
interface ChartDataPoint {
  [key: string]: string | number;
}
const calculateInvestorMetrics = (
  year: string,
  region: string,
  months: ReadonlyArray<Month>
): InvestorMetrics => {
  let yearData: InvestorDataEntry[] = [];
  if (year === "All") {
    yearData = investorData.filter((d) => d.region === region);
  } else {
    yearData = investorData.filter(
      (d) => d.year === year && d.region === region
    );
  }
  if (yearData.length === 0)
    return {
      currentInvestorPercentage: 0,
      growthInvestorPercentage: 0,
      trendInvestorPercentage: [],
      volatilityInvestorPercentage: 0,
      highestAsset: 0,
      lowestAsset: 0,
      roi: 0,
    };
  const aggregatedInvestor: Record<Month, number> = {} as Record<Month, number>;
  const aggregatedAssetTrillion: Record<Month, number> = {} as Record<
    Month,
    number
  >;
  months.forEach((month) => {
    const monthData = yearData.filter((d) => d.month === month);
    aggregatedInvestor[month] = monthData.reduce(
      (sum, data) => sum + (data.investorPercentage || 0),
      0
    );
    aggregatedAssetTrillion[month] = monthData.reduce(
      (sum, data) => sum + (data.assetTrillionRp || 0),
      0
    );
  });
  const investorPercentages: number[] = months.map(
    (month) => aggregatedInvestor[month]
  );
  const currentInvestorPercentage =
    investorPercentages[investorPercentages.length - 1];
  const initialInvestorPercentage = investorPercentages[0];
  const growthInvestorPercentage =
    initialInvestorPercentage !== 0
      ? ((currentInvestorPercentage - initialInvestorPercentage) /
          initialInvestorPercentage) *
        100
      : 0;
  const trendInvestorPercentage: number[] = months.map((month, idx) => {
    if (idx === 0) {
      return 0;
    }
    const prev = aggregatedInvestor[months[idx - 1]];
    const curr = aggregatedInvestor[month];
    return prev !== 0 ? ((curr - prev) / prev) * 100 : 0;
  });
  const validTrends = trendInvestorPercentage.filter((v) => !isNaN(v));
  const average = validTrends.length
    ? validTrends.reduce((a, b) => a + b, 0) / validTrends.length
    : 0;
  const volatilityInvestorPercentage = Math.sqrt(
    validTrends.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) /
      (validTrends.length || 1)
  );
  const assetValues: number[] = months.map(
    (month) => aggregatedAssetTrillion[month]
  );
  const highestAsset = Math.max(...assetValues);
  const nonZeroAssetValues = assetValues.filter((val) => val > 0);
  const lowestAsset =
    nonZeroAssetValues.length > 0 ? Math.min(...nonZeroAssetValues) : 0;
  const roi =
    initialInvestorPercentage !== 0
      ? ((currentInvestorPercentage - initialInvestorPercentage) /
          initialInvestorPercentage) *
        100
      : 0;
  return {
    currentInvestorPercentage,
    growthInvestorPercentage,
    trendInvestorPercentage: validTrends,
    volatilityInvestorPercentage,
    highestAsset,
    lowestAsset,
    roi,
  };
};
const SebaranInvestorDomestik: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const months = useMemo<ReadonlyArray<Month>>(
    () => [
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
    ],
    []
  );
  const regions = useMemo<ReadonlyArray<string>>(
    () => [
      "Jawa",
      "Sumatera",
      "Kalimantan",
      "Sulawesi",
      "Bali, NTT, NTB",
      "Maluku & Papua",
    ],
    []
  );
  const colors = useMemo<ReadonlyArray<string>>(
    () => ["#2563eb", "#16a34a", "#dc2626", "#9333ea", "#f59e0b", "#14b8a6"],
    []
  );
  const [selectedOverviewRegions, setSelectedOverviewRegions] = useState<
    string[]
  >(() => Array.from(regions));
  const [selectedAnalysisRegions, setSelectedAnalysisRegions] = useState<
    string[]
  >(() => Array.from(regions));
  const [selectedComparisonRegions, setSelectedComparisonRegions] = useState<
    string[]
  >(() => Array.from(regions));
  const [activeTab, setActiveTab] = useState<string>("overview");
  const processedRegionData = useMemo<ProcessedRegionDataPoint[]>(() => {
    let currentSelectedRegions: string[] = [];
    if (activeTab === "overview") {
      currentSelectedRegions = selectedOverviewRegions;
    } else if (activeTab === "analysis") {
      currentSelectedRegions = selectedAnalysisRegions;
    } else if (activeTab === "comparison") {
      currentSelectedRegions = selectedComparisonRegions;
    }
    return currentSelectedRegions.map((region) => {
      if (selectedYear === "All") {
        const regionData = investorData.filter((d) => d.region === region);
        const totalInvestor = regionData.reduce(
          (sum, d) => sum + (d.investorPercentage || 0),
          0
        );
        const totalAssetTrillion = regionData.reduce(
          (sum, d) => sum + (d.assetTrillionRp || 0),
          0
        );
        return {
          region,
          investorPercentage: totalInvestor,
          assetTrillionRp: totalAssetTrillion,
        };
      } else {
        const regionData = investorData.filter(
          (d) => d.year === selectedYear && d.region === region
        );
        const totalInvestor = regionData.reduce(
          (sum, d) => sum + (d.investorPercentage || 0),
          0
        );
        const totalAssetTrillion = regionData.reduce(
          (sum, d) => sum + (d.assetTrillionRp || 0),
          0
        );
        return {
          region,
          investorPercentage: totalInvestor,
          assetTrillionRp: totalAssetTrillion,
        };
      }
    });
  }, [
    selectedYear,
    activeTab,
    selectedOverviewRegions,
    selectedAnalysisRegions,
    selectedComparisonRegions,
  ]);
  const metricsData = useMemo(() => {
    const metrics: Record<string, InvestorMetrics> = {};
    regions.forEach((region) => {
      metrics[region] = calculateInvestorMetrics(selectedYear, region, months);
    });
    return metrics;
  }, [selectedYear, months, regions]);
  const donutDataOverview = useMemo(() => {
    return processedRegionData.map((dataPoint, idx) => ({
      name: dataPoint.region,
      value: dataPoint.assetTrillionRp,
      color: colors[idx % colors.length],
    }));
  }, [processedRegionData, colors]);
  const totalMetrics = useMemo(() => {
    let currentSelectedRegions: string[] = [];
    if (activeTab === "overview") {
      currentSelectedRegions = selectedOverviewRegions;
    } else if (activeTab === "analysis") {
      currentSelectedRegions = selectedAnalysisRegions;
    } else if (activeTab === "comparison") {
      currentSelectedRegions = selectedComparisonRegions;
    }
    const totalAssetTrillion = processedRegionData.reduce(
      (sum, d) => sum + d.assetTrillionRp,
      0
    );
    let highestAsset = 0;
    let lowestAsset = Infinity;
    let averageGrowth = 0;
    let averageVolatility = 0;
    if (currentSelectedRegions.length > 0) {
      const growthValues = currentSelectedRegions.map(
        (region) => metricsData[region].growthInvestorPercentage
      );
      const volatilityValues = currentSelectedRegions.map(
        (region) => metricsData[region].volatilityInvestorPercentage
      );
      averageGrowth =
        growthValues.reduce((sum, val) => sum + val, 0) / growthValues.length;
      averageVolatility =
        volatilityValues.reduce((sum, val) => sum + val, 0) /
        volatilityValues.length;
      currentSelectedRegions.forEach((region) => {
        const metrics = metricsData[region];
        highestAsset = Math.max(highestAsset, metrics.highestAsset);
        if (metrics.lowestAsset > 0) {
          lowestAsset = Math.min(lowestAsset, metrics.lowestAsset);
        }
      });
    }
    return {
      highestAsset,
      lowestAsset: lowestAsset === Infinity ? 0 : lowestAsset,
      totalAssetTrillion,
      averageGrowth,
      averageVolatility,
    };
  }, [
    metricsData,
    processedRegionData,
    activeTab,
    selectedOverviewRegions,
    selectedAnalysisRegions,
    selectedComparisonRegions,
  ]);
  const topRegion = useMemo(() => {
    let currentSelectedRegions: string[] = [];
    if (activeTab === "overview") {
      currentSelectedRegions = selectedOverviewRegions;
    } else if (activeTab === "analysis") {
      currentSelectedRegions = selectedAnalysisRegions;
    } else if (activeTab === "comparison") {
      currentSelectedRegions = selectedComparisonRegions;
    }
    let maxGrowth = -Infinity;
    let topReg = "";
    currentSelectedRegions.forEach((region) => {
      if (metricsData[region].growthInvestorPercentage > maxGrowth) {
        maxGrowth = metricsData[region].growthInvestorPercentage;
        topReg = region;
      }
    });
    return topReg;
  }, [
    metricsData,
    activeTab,
    selectedOverviewRegions,
    selectedAnalysisRegions,
    selectedComparisonRegions,
  ]);
  const yearlyComparisonData = useMemo(() => {
    const years = ["2021", "2022", "2023", "2024"];
    return years.map((year) => {
      const dataPoint: ChartDataPoint = { year };
      selectedComparisonRegions.forEach((region) => {
        const yearData = investorData.filter(
          (d) => d.year === year && d.region === region
        );
        const totalInvestor = yearData.reduce(
          (sum, d) => sum + (d.investorPercentage || 0),
          0
        );
        dataPoint[region] = totalInvestor;
      });
      return dataPoint;
    });
  }, [selectedComparisonRegions]);
  const trendDataAnalysis = useMemo<TransposedTrendDataPoint[]>(() => {
    const combinedTrend: Record<string, number[]> = {};
    selectedAnalysisRegions.forEach((region) => {
      combinedTrend[region] = metricsData[region].trendInvestorPercentage;
    });
    const transposedTrend: TransposedTrendDataPoint[] = [];
    months.forEach((month, monthIndex) => {
      const dataPoint: TransposedTrendDataPoint = { month };
      selectedAnalysisRegions.forEach((region) => {
        dataPoint[region] =
          monthIndex === 0 ? 0 : combinedTrend[region][monthIndex] || 0;
      });
      transposedTrend.push(dataPoint);
    });
    return transposedTrend;
  }, [metricsData, selectedAnalysisRegions, months]);
  const assetTrendDataOverview = useMemo<TransposedTrendDataPoint[]>(() => {
    const combinedAssetTrend: Record<string, number[]> = {};
    selectedOverviewRegions.forEach((region) => {
      let regionData: InvestorDataEntry[] = [];
      if (selectedYear === "All") {
        regionData = investorData.filter((d) => d.region === region);
        const monthlyAsset = months.map((month) => {
          const monthData = regionData.filter((d) => d.month === month);
          return monthData.length > 0
            ? monthData.reduce((sum, d) => sum + (d.assetTrillionRp || 0), 0) /
                monthData.length
            : 0;
        });
        combinedAssetTrend[region] = monthlyAsset;
      } else {
        regionData = investorData.filter(
          (d) => d.region === region && d.year === selectedYear
        );
        const monthlyAsset = months.map((month) => {
          const monthData = regionData.find((d) => d.month === month);
          return monthData ? monthData.assetTrillionRp : 0;
        });
        combinedAssetTrend[region] = monthlyAsset;
      }
    });
    const transposedAssetTrend: TransposedTrendDataPoint[] = [];
    months.forEach((month) => {
      const dataPoint: TransposedTrendDataPoint = { month };
      selectedOverviewRegions.forEach((region) => {
        const monthIndex = months.indexOf(month);
        dataPoint[region] = combinedAssetTrend[region][monthIndex] || 0;
      });
      transposedAssetTrend.push(dataPoint);
    });
    return transposedAssetTrend;
  }, [selectedOverviewRegions, selectedYear, months]);
  const metricComparisonData = useMemo<MetricComparison[]>(() => {
    return selectedComparisonRegions.map((region) => {
      let totalAsset = 0;
      if (selectedYear === "All") {
        const regionData = investorData.filter((d) => d.region === region);
        totalAsset = regionData.reduce(
          (sum, d) => sum + (d.assetTrillionRp || 0),
          0
        );
      } else {
        const regionData = investorData.filter(
          (d) => d.year === selectedYear && d.region === region
        );
        totalAsset = regionData.reduce(
          (sum, d) => sum + (d.assetTrillionRp || 0),
          0
        );
      }
      let assetGrowth = 0;
      if (selectedYear !== "All") {
        const januaryData = investorData.find(
          (d) =>
            d.year === selectedYear && d.region === region && d.month === "Jan"
        );
        const decemberData = investorData.find(
          (d) =>
            d.year === selectedYear && d.region === region && d.month === "Dec"
        );
        if (januaryData && decemberData && januaryData.assetTrillionRp > 0) {
          assetGrowth =
            ((decemberData.assetTrillionRp - januaryData.assetTrillionRp) /
              januaryData.assetTrillionRp) *
            100;
        }
      } else {
        const oldestYearData = investorData.filter(
          (d) => d.year === "2021" && d.region === region
        );
        const newestYearData = investorData.filter(
          (d) => d.year === "2024" && d.region === region
        );
        const oldestYearAsset = oldestYearData.reduce(
          (sum, d) => sum + (d.assetTrillionRp || 0),
          0
        );
        const newestYearAsset = newestYearData.reduce(
          (sum, d) => sum + (d.assetTrillionRp || 0),
          0
        );
        if (oldestYearAsset > 0) {
          assetGrowth =
            ((newestYearAsset - oldestYearAsset) / oldestYearAsset) * 100;
        }
      }
      let assetVolatility = 0;
      if (selectedYear !== "All") {
        const monthlyAssets: number[] = months.map((month) => {
          const monthData = investorData.find(
            (d) =>
              d.year === selectedYear &&
              d.region === region &&
              d.month === month
          );
          return monthData ? monthData.assetTrillionRp : 0;
        });
        const assetChanges: number[] = [];
        for (let i = 1; i < monthlyAssets.length; i++) {
          if (monthlyAssets[i - 1] > 0) {
            const change =
              ((monthlyAssets[i] - monthlyAssets[i - 1]) /
                monthlyAssets[i - 1]) *
              100;
            assetChanges.push(change);
          }
        }
        if (assetChanges.length > 0) {
          const avgChange =
            assetChanges.reduce((sum, val) => sum + val, 0) /
            assetChanges.length;
          assetVolatility = Math.sqrt(
            assetChanges.reduce(
              (sum, val) => sum + Math.pow(val - avgChange, 2),
              0
            ) / assetChanges.length
          );
        }
      } else {
        const yearlyAssets: number[] = ["2021", "2022", "2023", "2024"].map(
          (year) => {
            const yearData = investorData.filter(
              (d) => d.year === year && d.region === region
            );
            return yearData.reduce(
              (sum, d) => sum + (d.assetTrillionRp || 0),
              0
            );
          }
        );
        const assetChanges: number[] = [];
        for (let i = 1; i < yearlyAssets.length; i++) {
          if (yearlyAssets[i - 1] > 0) {
            const change =
              ((yearlyAssets[i] - yearlyAssets[i - 1]) / yearlyAssets[i - 1]) *
              100;
            assetChanges.push(change);
          }
        }
        if (assetChanges.length > 0) {
          const avgChange =
            assetChanges.reduce((sum, val) => sum + val, 0) /
            assetChanges.length;
          assetVolatility = Math.sqrt(
            assetChanges.reduce(
              (sum, val) => sum + Math.pow(val - avgChange, 2),
              0
            ) / assetChanges.length
          );
        }
      }
      return {
        region,
        assetTrillionRp: totalAsset.toFixed(2),
        growth: `${assetGrowth.toFixed(2)}%`,
        volatility: `${assetVolatility.toFixed(2)}%`,
      };
    });
  }, [selectedComparisonRegions, selectedYear, months]);
  const handleYearChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedYear(e.target.value);
    },
    []
  );
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);
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
  const handleOverviewFilterChange = useCallback((filters: string[]) => {
    setSelectedOverviewRegions(filters);
  }, []);
  const handleAnalysisFilterChange = useCallback((filters: string[]) => {
    setSelectedAnalysisRegions(filters);
  }, []);
  const handleComparisonFilterChange = useCallback((filters: string[]) => {
    setSelectedComparisonRegions(filters);
  }, []);
  const comparisonMonthlyData = useMemo(() => {
    const monthsArray = months;
    return monthsArray.map((month) => {
      const dataPoint: Record<string, string | number> = { month };
      selectedComparisonRegions.forEach((region) => {
        if (selectedYear === "All") {
          const allYearsData = investorData.filter(
            (d) => d.region === region && d.month === month
          );
          if (allYearsData.length > 0) {
            const totalPercentage = allYearsData.reduce(
              (sum, d) => sum + (d.investorPercentage || 0),
              0
            );
            dataPoint[region] = totalPercentage / allYearsData.length;
          } else {
            dataPoint[region] = 0;
          }
        } else {
          const regionMonthData = investorData.find(
            (d) =>
              d.year === selectedYear &&
              d.region === region &&
              d.month === month
          );
          dataPoint[region] = regionMonthData
            ? regionMonthData.investorPercentage
            : 0;
        }
      });
      return dataPoint;
    });
  }, [selectedComparisonRegions, selectedYear, months]);
  const quarterlyComparisonData = useMemo(() => {
    const quarters = [
      { quarter: "Q1", months: ["Jan", "Feb", "Mar"] },
      { quarter: "Q2", months: ["Apr", "May", "Jun"] },
      { quarter: "Q3", months: ["Jul", "Aug", "Sep"] },
      { quarter: "Q4", months: ["Oct", "Nov", "Dec"] },
    ];
    return quarters.map(({ quarter, months: quarterMonths }) => {
      const dataPoint: Record<string, string | number> = { quarter };
      selectedComparisonRegions.forEach((region) => {
        let totalAsset = 0;
        let validCount = 0;
        quarterMonths.forEach((month) => {
          const monthData = investorData.filter(
            (d) =>
              (selectedYear === "All" || d.year === selectedYear) &&
              d.month === month &&
              d.region === region
          );
          monthData.forEach((data) => {
            if (data.assetTrillionRp) {
              totalAsset += data.assetTrillionRp;
              validCount++;
            }
          });
        });
        dataPoint[region] = validCount > 0 ? totalAsset / validCount : 0;
      });
      return dataPoint;
    });
  }, [selectedComparisonRegions, selectedYear]);
  return (
    <div className="relative min-h-screen w-full space-y-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <GradientBackground />
      {}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {}
        <div className="flex-1">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            KSEI Financial Dashboard: Sebaran Investor Domestik
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
            Analisis penyebaran investor domestik di berbagai wilayah Indonesia
            menggunakan data Kustodian Sentral Efek Indonesia (KSEI)
          </p>
        </div>
        {}
        <div className="flex flex-col">
          <label htmlFor="year-select" className="sr-only">
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
            {["2021", "2022", "2023", "2024"].map((year) => (
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
                regions={Array.from(regions)}
                selectedRegions={selectedOverviewRegions}
                onChange={handleOverviewFilterChange}
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
                  value={formatNumber(totalMetrics.totalAssetTrillion, true)}
                  change={totalMetrics.averageGrowth}
                  icon={<PieChartIcon className="w-6 h-6 text-yellow-500" />}
                />
                {}
                {selectedOverviewRegions.map((region) => {
                  const metrics = metricsData[region];
                  const regionData = processedRegionData.find(
                    (d) => d.region === region
                  );
                  return (
                    <StatCard
                      key={region}
                      title={region}
                      value={formatNumber(
                        regionData?.assetTrillionRp || 0,
                        true
                      )}
                      change={metrics.growthInvestorPercentage}
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
                          data={assetTrendDataOverview}
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
                          {selectedOverviewRegions.map((region, idx) => (
                            <Line
                              key={region}
                              type="monotone"
                              dataKey={region}
                              stroke={colors[idx % colors.length]}
                              strokeWidth={2}
                              dot={{ r: 3 }}
                              activeDot={{ r: 5 }}
                              strokeOpacity={0.8}
                              name={`${region} Aset`}
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
                      Distribusi Aset per Wilayah
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DonutChart
                      title="Distribusi Aset"
                      data={donutDataOverview}
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
                  <strong>Insight:</strong> Wilayah <em>{topRegion}</em>{" "}
                  menunjukkan pertumbuhan investor yang stabil selama tahun{" "}
                  {selectedYear}.
                </div>
              </Alert>
              {}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <MetricGrid>
                  {}
                  <StatCard
                    title="Volatilitas Rata-rata Investor (%)"
                    value={`${formatNumber(totalMetrics.averageVolatility)}%`}
                    change={totalMetrics.averageVolatility}
                    icon={<Activity className="w-6 h-6 text-blue-500" />}
                  />
                  {}
                  <StatCard
                    title="Rasio Pertumbuhan Tahunan Investor (%)"
                    value={`${formatNumber(totalMetrics.averageGrowth)}%`}
                    change={totalMetrics.averageGrowth}
                    icon={<TrendingUp className="w-6 h-6 text-green-500" />}
                  />
                </MetricGrid>
              </div>
              {}
              <div className="mt-6 mb-8">
                <FilterBar
                  options={Array.from(regions)}
                  activeFilters={selectedAnalysisRegions}
                  onFilterChange={handleAnalysisFilterChange}
                  multiSelect
                />
              </div>
              {}
              <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all mt-6">
                <CardHeader>
                  <CardTitle>Tren Pertumbuhan Tahunan per Wilayah</CardTitle>
                  <CardDescription>
                    Nilai aset (Rp Triliun) masing-masing wilayah dari tahun
                    2021 hingga 2024
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
                          tickFormatter={(value) => {
                            return `Rp ${value}`;
                          }}
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
                          onClick={(e) => {
                            const dataKey = e.dataKey;
                            if (typeof dataKey === "string") {
                              if (selectedAnalysisRegions.includes(dataKey)) {
                                setSelectedAnalysisRegions((prev) =>
                                  prev.filter((region) => region !== dataKey)
                                );
                              } else {
                                setSelectedAnalysisRegions((prev) => [
                                  ...prev,
                                  dataKey,
                                ]);
                              }
                            }
                          }}
                        />
                        {selectedAnalysisRegions.map((region, idx) => (
                          <Line
                            key={region}
                            type="monotone"
                            dataKey={region}
                            stroke={colors[idx % colors.length]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 6 }}
                            strokeOpacity={0.8}
                            name={region}
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
                  <CardTitle>Perbandingan Total Aset per Wilayah</CardTitle>
                  <CardDescription>
                    Total aset (Rp Triliun) untuk setiap wilayah pada tahun{" "}
                    {selectedYear}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={processedRegionData}
                        margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="region" />
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
                                  <p className="font-medium">{`Wilayah: ${label}`}</p>
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
                        <Bar
                          dataKey="assetTrillionRp"
                          name="Total Aset (Rp Triliun)"
                          fill="#2563eb"
                          radius={[4, 4, 0, 0]}
                        >
                          {processedRegionData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={colors[index % colors.length]}
                            />
                          ))}
                        </Bar>
                        {}
                        <ReferenceLine
                          y={
                            processedRegionData.reduce(
                              (sum, item) => sum + item.assetTrillionRp,
                              0
                            ) / processedRegionData.length
                          }
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
                    Perubahan persentase month-over-month untuk semua wilayah
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendDataAnalysis}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis
                          domain={[0, "dataMax + 5"]}
                          allowDecimals={true}
                          tickFormatter={(value: number) =>
                            `${value.toFixed(2)}%`
                          }
                        />
                        <RechartsTooltip
                          content={<CustomTooltip />}
                          formatter={(value: number | string) =>
                            typeof value === "number"
                              ? `${value.toFixed(2)}%`
                              : value
                          }
                        />
                        <Legend
                          verticalAlign="top"
                          height={36}
                          onClick={(e) => {
                            const dataKey = e.dataKey;
                            if (
                              typeof dataKey === "string" &&
                              selectedAnalysisRegions.length > 1
                            ) {
                              if (selectedAnalysisRegions.includes(dataKey)) {
                                setSelectedAnalysisRegions((prev) =>
                                  prev.filter((region) => region !== dataKey)
                                );
                              } else {
                                setSelectedAnalysisRegions((prev) => [
                                  ...prev,
                                  dataKey,
                                ]);
                              }
                            }
                          }}
                        />
                        {selectedAnalysisRegions.map((region, idx) => (
                          <Area
                            key={region}
                            type="monotone"
                            dataKey={region}
                            stroke={colors[idx % colors.length]}
                            fill={colors[idx % colors.length]}
                            fillOpacity={0.3}
                            name={region}
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
                  <DataTable<InvestorDataEntry>
                    data={investorData
                      .filter((d) => selectedAnalysisRegions.includes(d.region))
                      .filter(
                        (d) =>
                          selectedYear === "All" ||
                          d.year.toString() === selectedYear
                      )}
                    columns={[
                      { key: "year", header: "Tahun", accessor: "year" },
                      { key: "month", header: "Bulan", accessor: "month" },
                      {
                        key: "region",
                        header: "Wilayah",
                        accessor: "region",
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
                  options={Array.from(regions)}
                  activeFilters={selectedComparisonRegions}
                  onFilterChange={handleComparisonFilterChange}
                  multiSelect
                />
              </div>
              {}
              <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle>Tabel Perbandingan Metrik</CardTitle>
                  <CardDescription>
                    Menampilkan perbandingan metrik utama antar wilayah
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable<MetricComparison>
                    data={metricComparisonData}
                    columns={[
                      {
                        key: "region",
                        header: "Wilayah",
                        accessor: "region",
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
                    Membandingkan nilai aset per wilayah pada setiap kuartal
                    (dalam Triliun Rupiah)
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
                        {selectedComparisonRegions.map((region, idx) => (
                          <Bar
                            key={region}
                            dataKey={region}
                            fill={colors[idx % colors.length]}
                            name={region}
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
                    Membandingkan nilai aset per wilayah antar tahun (2021-2024)
                    dalam Triliun Rupiah
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
                          tickFormatter={(value: number) => `${value} T`}
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
                        {selectedComparisonRegions.map((region, idx) => (
                          <Bar
                            key={region}
                            dataKey={region}
                            fill={colors[idx % colors.length]}
                            name={region}
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
                  <CardTitle>Grafik Perbandingan Aset Antar Wilayah</CardTitle>
                  <CardDescription>
                    Membandingkan nilai aset beberapa wilayah sekaligus per
                    bulan dalam Triliun Rupiah
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
                        {selectedComparisonRegions.map((region, idx) => (
                          <Bar
                            key={region}
                            dataKey={region}
                            fill={colors[idx % colors.length]}
                            name={region}
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
export default SebaranInvestorDomestik;

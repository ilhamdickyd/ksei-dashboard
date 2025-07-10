import { financialData } from "@/data/financialData";
import React, { useState, useMemo } from "react";
import clsx from "clsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import KPICard from "@/components/ui/kpi-card";
import DonutChart from "@/components/ui/donut-chart";
import MetricGrid from "@/components/ui/metric-grid";
import DataTable from "@/components/ui/data-table";
import FilterBar from "@/components/ui/filter-bar";
import SebaranInvestorDomestik from "@/components/SebaranInvestorDomestik";
import DemografiInvestorIndividu from "@/components/DemografiInvestorIndividu";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  PieChart as PieChartIcon,
  Users,
  UserPlus,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
interface FinancialDataEntry {
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
type Month =
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
interface ProcessedDataPoint {
  month: Month;
  [key: string]: number | string;
}
interface GrowthDataPoint {
  month: Month;
  [key: string]: number | string;
}
interface TooltipPayload {
  value: number | string;
  name: string;
  color: string;
}
const GradientBackground = () => (
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
const formatNumber = (value: number, decimals: number = 0): string => {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};
const formatLargeNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}jt`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}rb`;
  }
  return formatNumber(value);
};
const calculateMetrics = (year: string, category: string, months: Month[]) => {
  let yearData: FinancialDataEntry[] = [];
  if (year === "All") {
    yearData = financialData.filter((d) => d.category === category);
  } else {
    const singleYearData = financialData.find(
      (d) => d.year === year && d.category === category
    );
    if (singleYearData) {
      yearData = [singleYearData];
    }
  }
  if (yearData.length === 0)
    return {
      current: 0,
      yearTotal: 0,
      growth: 0,
      trend: [] as number[],
      volatility: 0,
      highestValue: 0,
      highestMonth: "",
      lowestValue: 0,
      lowestMonth: "",
      roi: 0,
    };
  const aggregatedData: Record<Month, number> = {} as Record<Month, number>;
  months.forEach((month) => {
    aggregatedData[month] = yearData.reduce(
      (sum, d) => sum + (d[month] || 0),
      0
    );
  });
  const monthValues: number[] = months.map((month) => aggregatedData[month]);
  const yearTotal = monthValues.reduce((sum, val) => sum + val, 0);
  const current = monthValues[monthValues.length - 1];
  const initialValue = monthValues[0];
  const growth =
    initialValue !== 0 ? ((current - initialValue) / initialValue) * 100 : 0;
  const trend: number[] = months.slice(1).map((month, idx) => {
    const prev = aggregatedData[months[idx]];
    const curr = aggregatedData[month];
    return prev !== 0 ? ((curr - prev) / prev) * 100 : 0;
  });
  const validTrends = trend.filter((v) => !isNaN(v));
  const average = validTrends.length
    ? validTrends.reduce((a, b) => a + b, 0) / validTrends.length
    : 0;
  const volatility = Math.sqrt(
    validTrends.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) /
      (validTrends.length || 1)
  );
  let highestValue = -Infinity;
  let highestMonth = "";
  let lowestValue = Infinity;
  let lowestMonth = "";
  months.forEach((month) => {
    const value = aggregatedData[month];
    if (value > highestValue) {
      highestValue = value;
      highestMonth = month;
    }
    if (value < lowestValue) {
      lowestValue = value;
      lowestMonth = month;
    }
  });
  const roi =
    initialValue !== 0 ? ((current - initialValue) / initialValue) * 100 : 0;
  return {
    current,
    yearTotal,
    growth,
    trend: validTrends,
    volatility,
    highestValue,
    highestMonth,
    lowestValue,
    lowestMonth,
    roi,
  };
};
const calculateMonthlyGrowthRates = (
  data: FinancialDataEntry[],
  year: string,
  categories: string[],
  months: Month[]
): GrowthDataPoint[] => {
  const filteredData =
    year === "All" ? data : data.filter((d) => d.year === year);
  const growthData: GrowthDataPoint[] = [];
  months.forEach((month, idx) => {
    const monthData: GrowthDataPoint = { month };
    const isJanuary = idx === 0;
    if (isJanuary) {
      categories.forEach((category) => {
        monthData[category] = 0;
      });
    } else {
      const prevMonth = months[idx - 1];
      categories.forEach((category) => {
        if (year === "All") {
          const currentValue = filteredData
            .filter((d) => d.category === category)
            .reduce((sum, d) => sum + (d[month] || 0), 0);
          const prevValue = filteredData
            .filter((d) => d.category === category)
            .reduce((sum, d) => sum + (d[prevMonth] || 0), 0);
          monthData[category] =
            prevValue !== 0
              ? ((currentValue - prevValue) / prevValue) * 100
              : 0;
        } else {
          const yearEntry = filteredData.find(
            (d) => d.category === category && d.year === year
          );
          if (yearEntry) {
            const currentValue = yearEntry[month] || 0;
            const prevValue = yearEntry[prevMonth] || 0;
            monthData[category] =
              prevValue !== 0
                ? ((currentValue - prevValue) / prevValue) * 100
                : 0;
          } else {
            monthData[category] = 0;
          }
        }
      });
    }
    growthData.push(monthData);
  });
  return growthData;
};
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  formatter?: (value: number | string, name?: string) => [string, string];
}
const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  valuePrefix = "",
  valueSuffix = "",
  formatter,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-2 py-1 bg-gray-800 text-white rounded-md shadow-lg">
        <p className="font-semibold">{label}</p>
        {payload.map((entry, index) => {
          let displayValue;
          if (formatter) {
            displayValue = formatter(entry.value, entry.name);
          } else if (typeof entry.value === "number") {
            displayValue = `${valuePrefix}${formatNumber(
              entry.value
            )}${valueSuffix}`;
          } else {
            displayValue = entry.value;
          }
          return (
            <p key={`item-${index}`} className="text-sm">
              <span
                className="inline-block w-2 h-2 mr-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></span>
              {entry.name}: {displayValue}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};
const FinancialDashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [selectedComparisonCategories, setSelectedComparisonCategories] =
    useState<string[]>(["Pasar Modal", "Reksa Dana", "C-BEST", "SBN"]);
  const [selectedCorrelationCategories, setSelectedCorrelationCategories] =
    useState<string[]>(["Pasar Modal", "Reksa Dana", "C-BEST", "SBN"]);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [activeCategory, setActiveCategory] = useState<string>(
    "Persebaran Keuangan"
  );
  const months = useMemo<Month[]>(
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
  const categories = useMemo<string[]>(
    () => ["Pasar Modal", "Reksa Dana", "C-BEST", "SBN"],
    []
  );
  const colors = useMemo<string[]>(
    () => ["#2563eb", "#16a34a", "#dc2626", "#9333ea"],
    []
  );
  const processedData = useMemo<ProcessedDataPoint[]>(() => {
    return months.map((month) => {
      const monthData: ProcessedDataPoint = { month };
      if (selectedYear === "All") {
        categories.forEach((category) => {
          const total = financialData
            .filter((d) => d.category === category)
            .reduce((sum, d) => sum + (d[month] || 0), 0);
          monthData[category] = total;
        });
      } else {
        financialData
          .filter((d) => d.year === selectedYear)
          .forEach((d) => {
            monthData[d.category] = d[month];
          });
      }
      return monthData;
    });
  }, [selectedYear, categories, months]);
  const monthlyGrowthData = useMemo(() => {
    return calculateMonthlyGrowthRates(
      financialData,
      selectedYear,
      categories,
      months
    );
  }, [selectedYear, categories, months]);
  const metricsData = useMemo(() => {
    const metrics: Record<string, ReturnType<typeof calculateMetrics>> = {};
    categories.forEach((category) => {
      metrics[category] = calculateMetrics(selectedYear, category, months);
    });
    return metrics;
  }, [selectedYear, categories, months]);
  const donutData = useMemo(() => {
    return categories.map((category, idx) => ({
      name: category,
      value: metricsData[category].yearTotal,
      color: colors[idx],
    }));
  }, [categories, metricsData, colors]);
  const totalMetrics = useMemo(() => {
    let totalYearSum = 0;
    let totalGrowth = 0;
    let totalVolatility = 0;
    let highestValue = -Infinity;
    let highestCategory = "";
    let highestMonth = "";
    let lowestValue = Infinity;
    let lowestCategory = "";
    let lowestMonth = "";
    categories.forEach((category) => {
      const metrics = metricsData[category];
      totalYearSum += metrics.yearTotal;
      totalGrowth += metrics.growth;
      totalVolatility += metrics.volatility;
      if (metrics.highestValue > highestValue) {
        highestValue = metrics.highestValue;
        highestCategory = category;
        highestMonth = metrics.highestMonth;
      }
      if (metrics.lowestValue < lowestValue && metrics.lowestValue > 0) {
        lowestValue = metrics.lowestValue;
        lowestCategory = category;
        lowestMonth = metrics.lowestMonth;
      }
    });
    const averageGrowth = categories.length
      ? totalGrowth / categories.length
      : 0;
    const averageVolatility = categories.length
      ? totalVolatility / categories.length
      : 0;
    return {
      yearTotal: totalYearSum,
      growth: averageGrowth,
      volatility: averageVolatility,
      highestValue,
      highestCategory,
      highestMonth,
      lowestValue,
      lowestCategory,
      lowestMonth,
    };
  }, [metricsData, categories]);
  const topCategory = useMemo(() => {
    let maxGrowth = -Infinity;
    let topCat = "";
    categories.forEach((category) => {
      if (metricsData[category].growth > maxGrowth) {
        maxGrowth = metricsData[category].growth;
        topCat = category;
      }
    });
    return topCat;
  }, [metricsData, categories]);
  const yearlyComparisonData = useMemo(() => {
    const years = ["2021", "2022", "2023", "2024"];
    return years.map((year) => {
      const dataPoint: Record<string, string | number> = { year };
      selectedComparisonCategories.forEach((category) => {
        const yearData = financialData.filter(
          (d) => d.year === year && d.category === category
        );
        const total = yearData.reduce((sum, d) => {
          return (
            sum + months.reduce((mSum, month) => mSum + (d[month] || 0), 0)
          );
        }, 0);
        dataPoint[category] = total;
      });
      return dataPoint;
    });
  }, [selectedComparisonCategories, months]);
  const quarterlyComparisonData = useMemo(() => {
    const quarters = ["Q1", "Q2", "Q3", "Q4"];
    const quarterMonths: Month[][] = [
      ["Jan", "Feb", "Mar"],
      ["Apr", "May", "Jun"],
      ["Jul", "Aug", "Sep"],
      ["Oct", "Nov", "Dec"],
    ];
    type QuarterDataPoint = {
      quarter: string;
      [category: string]: string | number;
    };
    if (selectedYear === "All") {
      return quarters.map((quarter, qIndex) => {
        const dataPoint: QuarterDataPoint = { quarter };
        selectedComparisonCategories.forEach((category) => {
          let totalForAllYears = 0;
          const categoryData = financialData.filter(
            (d) => d.category === category
          );
          totalForAllYears = categoryData.reduce((sum, d) => {
            return (
              sum +
              quarterMonths[qIndex].reduce((qSum, month) => {
                return qSum + (d[month] || 0);
              }, 0)
            );
          }, 0);
          dataPoint[category] = totalForAllYears;
        });
        return dataPoint;
      });
    } else {
      return quarters.map((quarter, qIndex) => {
        const dataPoint: QuarterDataPoint = { quarter };
        selectedComparisonCategories.forEach((category) => {
          const yearData = financialData.filter(
            (d) => d.year === selectedYear && d.category === category
          );
          const quarterTotal = yearData.reduce((sum, d) => {
            return (
              sum +
              quarterMonths[qIndex].reduce((qSum, month) => {
                return qSum + (d[month] || 0);
              }, 0)
            );
          }, 0);
          dataPoint[category] = quarterTotal;
        });
        return dataPoint;
      });
    }
  }, [selectedYear, selectedComparisonCategories]);
  return (
    <div className="relative min-h-screen w-full p-6 space-y-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <GradientBackground />
      {}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveCategory("Persebaran Keuangan")}
          className={clsx(
            "py-2 px-4 rounded-lg border",
            activeCategory === "Persebaran Keuangan"
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}
        >
          Statistik Jumlah Investor Baru
        </button>
        <button
          onClick={() => setActiveCategory("Sebaran Investor Domestik")}
          className={clsx(
            "py-2 px-4 rounded-lg border",
            activeCategory === "Sebaran Investor Domestik"
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}
        >
          Sebaran Investor Domestik
        </button>
        <button
          onClick={() => setActiveCategory("Demografi Investor Individu")}
          className={clsx(
            "py-2 px-4 rounded-lg border",
            activeCategory === "Demografi Investor Individu"
              ? "bg-blue-500 text-white"
              : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
          )}
        >
          Demografi Investor Individu
        </button>
      </div>
      {}
      {activeCategory === "Persebaran Keuangan" ? (
        <>
          {}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {}
            <div className="flex-1">
              <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                KSEI Investor Dashboard: Analisis Jumlah Investor Baru
              </h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
                Insight pertumbuhan investor baru di pasar keuangan Indonesia
                berdasarkan data Kustodian Sentral Efek Indonesia (KSEI)
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
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 border rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all hover:shadow-md"
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
          <Alert>
            <div>
              <strong>Catatan:</strong> Data menunjukkan jumlah investor baru
              yang masuk setiap bulan (bukan data kumulatif).
            </div>
          </Alert>
          {}
          <div>
            {}
            <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("overview")}
                className={clsx(
                  "py-2 px-4 text-sm font-medium",
                  activeTab === "overview"
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-500 hover:text-blue-500"
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("analysis")}
                className={clsx(
                  "py-2 px-4 text-sm font-medium",
                  activeTab === "analysis"
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-500 hover:text-blue-500"
                )}
              >
                Analisis Detail
              </button>
              <button
                onClick={() => setActiveTab("comparison")}
                className={clsx(
                  "py-2 px-4 text-sm font-medium",
                  activeTab === "comparison"
                    ? "border-b-2 border-blue-500 text-blue-500"
                    : "text-gray-500 hover:text-blue-500"
                )}
              >
                Perbandingan
              </button>
            </div>
          </div>
          {}
          <div className="mt-6">
            {activeTab === "overview" && (
              <>
                {}
                <MetricGrid>
                  {}
                  <KPICard
                    title="Total Investor Baru"
                    value={totalMetrics.yearTotal.toLocaleString()}
                    trend={totalMetrics.growth}
                    icon={<Users className="w-6 h-6 text-cyan-500" />}
                    description="Jumlah total investor baru dari semua kategori"
                  />
                  {}
                  <KPICard
                    title="Rata-rata Pertumbuhan"
                    value={`${totalMetrics.growth.toFixed(2)}%`}
                    trend={totalMetrics.growth}
                    icon={<TrendingUp className="w-6 h-6 text-cyan-500" />}
                    description="Rata-rata pertumbuhan jumlah investor baru"
                  />
                  {}
                  <KPICard
                    title="Jumlah Tertinggi"
                    value={totalMetrics.highestValue.toLocaleString()}
                    trend={totalMetrics.growth}
                    icon={<TrendingUp className="w-6 h-6 text-cyan-500" />}
                    description={`${totalMetrics.highestCategory} - ${totalMetrics.highestMonth}`}
                  />
                  {}
                  <KPICard
                    title="Jumlah Terendah"
                    value={totalMetrics.lowestValue.toLocaleString()}
                    trend={-totalMetrics.volatility}
                    icon={<TrendingDown className="w-6 h-6 text-cyan-500" />}
                    description={`${totalMetrics.lowestCategory} - ${totalMetrics.lowestMonth}`}
                  />
                  {}
                  {categories.map((category) => {
                    const metrics = metricsData[category];
                    return (
                      <KPICard
                        key={category}
                        title={category}
                        value={metrics.yearTotal.toLocaleString()}
                        trend={metrics.growth}
                        icon={
                          category === "Pasar Modal" ? (
                            <Users className="w-6 h-6 text-cyan-500" />
                          ) : category === "Reksa Dana" ? (
                            <UserPlus className="w-6 h-6 text-cyan-500" />
                          ) : category === "C-BEST" ? (
                            <TrendingUp className="w-6 h-6 text-cyan-500" />
                          ) : category === "SBN" ? (
                            <PieChartIcon className="w-6 h-6 text-cyan-500" />
                          ) : null
                        }
                        description={`Jumlah Tertinggi: ${metrics.highestMonth}`}
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
                        Tren Investor Baru Bulanan
                      </CardTitle>
                      <CardDescription>
                        Menampilkan jumlah investor baru bulanan untuk setiap
                        kategori
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={processedData} margin={{ left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis
                              domain={["auto", "auto"]}
                              allowDecimals={false}
                              tickFormatter={(value: number) => {
                                return new Intl.NumberFormat("id-ID", {
                                  notation: "compact",
                                  compactDisplay: "short",
                                }).format(value);
                              }}
                            />
                            <RechartsTooltip
                              content={<CustomTooltip />}
                              formatter={(value: string | number) =>
                                typeof value === "number"
                                  ? value.toLocaleString()
                                  : value
                              }
                            />
                            <Legend verticalAlign="top" height={36} />
                            {categories.map((category, idx) => (
                              <Line
                                key={category}
                                type="monotone"
                                dataKey={category}
                                stroke={colors[idx]}
                                strokeWidth={2}
                                dot={false}
                                name={category}
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
                        Distribusi Investor Baru
                      </CardTitle>
                      <CardDescription>
                        Perbandingan jumlah total investor baru antar kategori
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DonutChart
                        title="Distribusi Total Investor Baru"
                        data={donutData}
                      />
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
            {activeTab === "analysis" && (
              <>
                {}
                <Alert>
                  <div>
                    <strong>Insight:</strong> Kategori <em>{topCategory}</em>{" "}
                    menunjukkan pertumbuhan jumlah investor tertinggi sebesar{" "}
                    {formatNumber(metricsData[topCategory].growth, 2)}%
                    {selectedYear !== "All"
                      ? ` pada tahun ${selectedYear}`
                      : " pada periode yang dipilih"}
                    .
                  </div>
                </Alert>
                {}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {}
                  <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Total Investor Baru
                          </p>
                          <h3 className="text-2xl font-bold mt-1">
                            {formatNumber(totalMetrics.yearTotal)}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {`Total dari semua kategori ${
                              selectedYear !== "All"
                                ? `pada tahun ${selectedYear}`
                                : "pada semua tahun"
                            }`}
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {}
                  <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Rata-rata Pertumbuhan
                          </p>
                          <h3 className="text-2xl font-bold mt-1">
                            {`${formatNumber(totalMetrics.growth)}%`}
                          </h3>
                          <div className="flex items-center mt-1">
                            <span
                              className={`text-xs ${
                                totalMetrics.growth >= 0
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {totalMetrics.growth >= 0 ? "↑" : "↓"}{" "}
                              {Math.abs(totalMetrics.growth).toFixed(2)}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Pertumbuhan rata-rata dari Jan ke Des
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-green-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {}
                  <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Jumlah Tertinggi
                          </p>
                          <h3 className="text-2xl font-bold mt-1">
                            {formatNumber(totalMetrics.highestValue)}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {`${totalMetrics.highestCategory} pada bulan ${totalMetrics.highestMonth}`}
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <UserPlus className="w-6 h-6 text-purple-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {}
                  <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Volatilitas
                          </p>
                          <h3 className="text-2xl font-bold mt-1">
                            {`${formatNumber(totalMetrics.volatility)}%`}
                          </h3>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-green-500">
                              ↓ {Math.abs(totalMetrics.volatility).toFixed(2)}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Stabilitas perubahan jumlah investor month-to-month
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                          <TrendingDown className="w-6 h-6 text-orange-500" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {}
                <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all mt-6">
                  <CardHeader>
                    <CardTitle>
                      Tren Pertumbuhan Jumlah Investor per Kategori
                    </CardTitle>
                    <CardDescription>
                      Pertumbuhan jumlah investor baru masing-masing kategori
                      dari tahun 2021 hingga 2024
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={yearlyComparisonData}
                          margin={{ left: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis
                            domain={["auto", "auto"]}
                            allowDecimals={false}
                            tickFormatter={(value) => {
                              if (typeof value === "number") {
                                return formatLargeNumber(value);
                              }
                              return "0";
                            }}
                          />
                          <RechartsTooltip
                            content={<CustomTooltip />}
                            formatter={(value, name) => {
                              if (typeof value === "number") {
                                return [formatNumber(value), name || ""];
                              }
                              return [value.toString(), name || ""];
                            }}
                          />
                          <Legend verticalAlign="top" height={36} />
                          {selectedComparisonCategories.map((category, idx) => (
                            <Line
                              key={category}
                              type="monotone"
                              dataKey={category}
                              stroke={colors[idx % colors.length]}
                              strokeWidth={2}
                              dot={true}
                              name={category}
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
                    <CardTitle>Perbandingan Pertumbuhan Bulanan</CardTitle>
                    <CardDescription>
                      Persentase pertumbuhan jumlah investor bulanan untuk
                      setiap kategori
                      {selectedYear !== "All"
                        ? ` pada tahun ${selectedYear}`
                        : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyGrowthData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis
                            domain={["auto", "auto"]}
                            tickFormatter={(value) => {
                              if (typeof value === "number") {
                                return `${formatNumber(value, 1)}%`;
                              }
                              return `0%`;
                            }}
                          />
                          <RechartsTooltip
                            content={<CustomTooltip />}
                            formatter={(value, name) => {
                              if (typeof value === "number") {
                                return [
                                  `${formatNumber(value, 2)}%`,
                                  name || "",
                                ];
                              }
                              return [value.toString(), name || ""];
                            }}
                          />
                          <Legend verticalAlign="top" height={36} />
                          {categories.map((category, idx) => (
                            <Line
                              key={category}
                              type="monotone"
                              dataKey={category}
                              stroke={colors[idx % colors.length]}
                              strokeWidth={2}
                              dot={true}
                              activeDot={{ r: 6 }}
                              name={category}
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
                    <CardTitle>
                      Analisis Kategori dengan Performa Terbaik
                    </CardTitle>
                    <CardDescription>
                      Perbandingan jumlah total investor baru per kategori{" "}
                      {selectedYear !== "All"
                        ? `pada tahun ${selectedYear}`
                        : "pada semua tahun"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={categories.map((category) => ({
                            category,
                            total: metricsData[category].yearTotal,
                            growth: metricsData[category].growth,
                          }))}
                          margin={{ left: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis
                            yAxisId="left"
                            orientation="left"
                            stroke="#8884d8"
                            tickFormatter={(value) => {
                              if (typeof value === "number") {
                                return formatLargeNumber(value);
                              }
                              return "0";
                            }}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#82ca9d"
                            tickFormatter={(value) => {
                              if (typeof value === "number") {
                                return `${formatNumber(value, 0)}%`;
                              }
                              return `0%`;
                            }}
                          />
                          <RechartsTooltip
                            content={<CustomTooltip />}
                            formatter={(value, name) => {
                              if (
                                name === "total" &&
                                typeof value === "number"
                              ) {
                                return [formatNumber(value), "Jumlah Investor"];
                              }
                              if (
                                name === "growth" &&
                                typeof value === "number"
                              ) {
                                return [
                                  `${formatNumber(value, 2)}%`,
                                  "Pertumbuhan",
                                ];
                              }
                              return [value.toString(), name || ""];
                            }}
                          />
                          <Legend />
                          <Bar
                            dataKey="total"
                            fill="#8884d8"
                            name="Jumlah Investor Baru"
                            yAxisId="left"
                          />
                          <Line
                            type="monotone"
                            dataKey="growth"
                            stroke="#82ca9d"
                            name="Pertumbuhan (%)"
                            yAxisId="right"
                            strokeWidth={2}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                {}
                <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all mt-6">
                  <CardHeader>
                    <CardTitle>Data Investor Baru Detail</CardTitle>
                    <CardDescription>
                      Menampilkan data bulanan jumlah investor baru secara rinci
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCorrelationCategories((prev) => {
                              if (prev.includes(category)) {
                                return prev.filter((c) => c !== category);
                              } else {
                                return [...prev, category];
                              }
                            });
                          }}
                          className={`px-3 py-1 text-sm rounded-full ${
                            selectedCorrelationCategories.includes(category)
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100 dark:bg-gray-800">
                            <th className="p-2 text-left">Tahun</th>
                            <th className="p-2 text-left">Kategori</th>
                            {months.map((month) => (
                              <th key={month} className="p-2 text-right">
                                {month}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {financialData
                            .filter(
                              (d) =>
                                (selectedYear === "All" ||
                                  d.year === selectedYear) &&
                                selectedCorrelationCategories.includes(
                                  d.category
                                )
                            )
                            .map((row, idx) => (
                              <tr
                                key={`${row.year}-${row.category}`}
                                className={
                                  idx % 2 === 0
                                    ? "bg-white dark:bg-gray-900"
                                    : "bg-gray-50 dark:bg-gray-800"
                                }
                              >
                                <td className="p-2 border-t">{row.year}</td>
                                <td className="p-2 border-t">{row.category}</td>
                                {months.map((month) => (
                                  <td
                                    key={month}
                                    className="p-2 border-t text-right"
                                  >
                                    {typeof row[month] === "number"
                                      ? formatNumber(row[month], 0)
                                      : "-"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            {activeTab === "comparison" && (
              <>
                {}
                <div className="mb-4">
                  <FilterBar
                    options={categories}
                    activeFilters={selectedComparisonCategories}
                    onFilterChange={(filters) =>
                      setSelectedComparisonCategories(filters)
                    }
                    multiSelect
                  />
                </div>
                {}
                <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all">
                  <CardHeader>
                    <CardTitle>Tabel Perbandingan Metrik</CardTitle>
                    <CardDescription>
                      Menampilkan perbandingan metrik utama antar kategori
                      investor
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {}
                    <DataTable<{
                      category: string;
                      total: number;
                      growth: string;
                      volatility: string;
                    }>
                      data={selectedComparisonCategories.map((category) => ({
                        category,
                        total: metricsData[category].yearTotal,
                        growth: `${metricsData[category].growth.toFixed(2)}%`,
                        volatility: `${metricsData[category].volatility.toFixed(
                          2
                        )}%`,
                      }))}
                      columns={[
                        {
                          key: "category",
                          header: "Kategori",
                          accessor: "category",
                        },
                        {
                          key: "total",
                          header: "Total Investor Baru",
                          accessor: "total",
                          formatter: (value: string | number) =>
                            typeof value === "number"
                              ? value.toLocaleString()
                              : value,
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
                    <CardTitle>
                      Grafik Perbandingan Investor Baru Antar Kategori
                    </CardTitle>
                    <CardDescription>
                      Membandingkan jumlah investor baru beberapa kategori
                      sekaligus per bulan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={processedData} margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis
                            domain={["auto", "auto"]}
                            allowDecimals={false}
                            tickFormatter={(value: number) =>
                              formatLargeNumber(value)
                            }
                          />
                          <RechartsTooltip
                            content={<CustomTooltip />}
                            formatter={(value: string | number) =>
                              typeof value === "number"
                                ? formatNumber(value)
                                : value
                            }
                          />
                          <Legend verticalAlign="top" height={36} />
                          {selectedComparisonCategories.map((category, idx) => (
                            <Bar
                              key={category}
                              dataKey={category}
                              fill={colors[idx % colors.length]}
                              opacity={0.7}
                              name={category}
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
                    <CardTitle>Visualisasi Perbandingan Tahunan</CardTitle>
                    <CardDescription>
                      Membandingkan jumlah investor baru per kategori antar
                      tahun (2021-2024)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={yearlyComparisonData}
                          margin={{ left: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis
                            domain={["auto", "auto"]}
                            allowDecimals={false}
                            tickFormatter={(value: number) =>
                              formatLargeNumber(value)
                            }
                          />
                          <RechartsTooltip
                            content={<CustomTooltip />}
                            formatter={(value: string | number) =>
                              typeof value === "number"
                                ? formatNumber(value)
                                : value
                            }
                          />
                          <Legend verticalAlign="top" height={36} />
                          {selectedComparisonCategories.map((category, idx) => (
                            <Bar
                              key={category}
                              dataKey={category}
                              fill={colors[idx % colors.length]}
                              name={category}
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
                      Perbandingan Investor Baru Per Kuartal
                    </CardTitle>
                    <CardDescription>
                      {selectedYear === "All"
                        ? "Menampilkan perbandingan jumlah investor baru antar kategori berdasarkan kuartal (total semua tahun)"
                        : `Menampilkan perbandingan jumlah investor baru antar kategori berdasarkan kuartal (${selectedYear})`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={quarterlyComparisonData}
                          margin={{ left: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="quarter" />
                          <YAxis
                            domain={["auto", "auto"]}
                            allowDecimals={false}
                            tickFormatter={(value: number) =>
                              formatLargeNumber(value)
                            }
                          />
                          <RechartsTooltip
                            content={<CustomTooltip />}
                            formatter={(value: string | number) =>
                              typeof value === "number"
                                ? formatNumber(value)
                                : value
                            }
                          />
                          <Legend verticalAlign="top" height={36} />
                          {selectedComparisonCategories.map((category, idx) => (
                            <Bar
                              key={category}
                              dataKey={category}
                              fill={colors[idx % colors.length]}
                              name={category}
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
          {}
          <div className="fixed top-0 right-0 -z-10 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2" />
          <div className="fixed bottom-0 left-0 -z-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2" />
        </>
      ) : activeCategory === "Sebaran Investor Domestik" ? (
        <SebaranInvestorDomestik />
      ) : activeCategory === "Demografi Investor Individu" ? (
        <DemografiInvestorIndividu />
      ) : null}
    </div>
  );
};
export default FinancialDashboard;

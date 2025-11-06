import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface CategoryData {
  category: string;
  total_kwh: number;
  total_cost: number;
  count: number;
}

interface AreaData {
  area_name: string;
  total_kwh: number;
  total_cost: number;
}

interface ReportChartsProps {
  projectId: string;
  tariff: number;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export const ReportCharts = ({ projectId, tariff }: ReportChartsProps) => {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [areaData, setAreaData] = useState<AreaData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChartData();
  }, [projectId]);

  const fetchChartData = async () => {
    try {
      // Get all areas for this project
      const { data: areas, error: areasError } = await supabase
        .from("areas")
        .select("id, name")
        .eq("project_id", projectId);

      if (areasError) throw areasError;

      if (!areas || areas.length === 0) {
        setLoading(false);
        return;
      }

      const areaIds = areas.map((a) => a.id);

      // Get all equipment
      const { data: equipment, error: equipmentError } = await supabase
        .from("equipment")
        .select("*")
        .in("area_id", areaIds);

      if (equipmentError) throw equipmentError;

      // Aggregate by category
      const categoryMap = new Map<string, { total_kwh: number; total_cost: number; count: number }>();
      
      equipment?.forEach((eq) => {
        const existing = categoryMap.get(eq.category) || { total_kwh: 0, total_cost: 0, count: 0 };
        categoryMap.set(eq.category, {
          total_kwh: existing.total_kwh + (eq.kwh_per_month || 0),
          total_cost: existing.total_cost + (eq.kwh_per_month || 0) * tariff,
          count: existing.count + 1,
        });
      });

      const categoryArray = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        ...data,
      }));

      setCategoryData(categoryArray);

      // Aggregate by area
      const areaMap = new Map<string, { total_kwh: number; total_cost: number }>();
      
      equipment?.forEach((eq) => {
        const area = areas.find((a) => a.id === eq.area_id);
        if (area) {
          const existing = areaMap.get(area.name) || { total_kwh: 0, total_cost: 0 };
          areaMap.set(area.name, {
            total_kwh: existing.total_kwh + (eq.kwh_per_month || 0),
            total_cost: existing.total_cost + (eq.kwh_per_month || 0) * tariff,
          });
        }
      });

      const areaArray = Array.from(areaMap.entries()).map(([area_name, data]) => ({
        area_name,
        ...data,
      }));

      setAreaData(areaArray);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      toast({
        title: "Error",
        description: "Failed to load chart data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Energy Consumption by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                total_kwh: {
                  label: "kWh/Month",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="total_kwh" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                total_cost: {
                  label: "Cost (GHS/Month)",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="total_cost"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Energy Consumption by Area</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              total_kwh: {
                label: "kWh/Month",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area_name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="total_kwh" fill="hsl(var(--chart-3))" name="kWh/Month" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equipment Count by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              count: {
                label: "Number of Equipment",
                color: "hsl(var(--chart-4))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="count" stroke="hsl(var(--chart-4))" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Zap, TrendingUp, DollarSign } from "lucide-react";

interface ProjectSummaryProps {
  projectId: string;
  tariff: number;
}

interface CategorySummary {
  category: string;
  total_kwh: number;
  total_cost: number;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const ProjectSummary = ({ projectId, tariff }: ProjectSummaryProps) => {
  const [totalKwh, setTotalKwh] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [categoryData, setCategoryData] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummaryData();
  }, [projectId, tariff]);

  const fetchSummaryData = async () => {
    try {
      const { data: areas, error: areasError } = await supabase
        .from("areas")
        .select("id")
        .eq("project_id", projectId);

      if (areasError) throw areasError;

      if (!areas || areas.length === 0) {
        setLoading(false);
        return;
      }

      const areaIds = areas.map((a) => a.id);

      const { data: equipment, error: equipmentError } = await supabase
        .from("equipment")
        .select("*")
        .in("area_id", areaIds);

      if (equipmentError) throw equipmentError;

      if (!equipment) {
        setLoading(false);
        return;
      }

      let total = 0;
      const categoryMap = new Map<string, number>();

      equipment.forEach((item) => {
        const kwhMonth = item.kwh_per_month;
        total += kwhMonth;

        const current = categoryMap.get(item.category) || 0;
        categoryMap.set(item.category, current + kwhMonth);
      });

      setTotalKwh(total);
      setTotalCost(total * tariff);

      const categoryArray: CategorySummary[] = Array.from(categoryMap.entries()).map(
        ([category, total_kwh]) => ({
          category,
          total_kwh,
          total_cost: total_kwh * tariff,
        })
      );

      categoryArray.sort((a, b) => b.total_kwh - a.total_kwh);
      setCategoryData(categoryArray);
    } catch (error) {
      console.error("Error fetching summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading summary...</div>;
  }

  if (categoryData.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">
            No equipment data available. Add equipment to see the summary.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totalKwh.toFixed(2)} kWh
            </div>
            <p className="text-xs text-muted-foreground">per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              GHS {totalCost.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">per month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryData.length}</div>
            <p className="text-xs text-muted-foreground">equipment types</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consumption by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_kwh" fill="hsl(var(--primary))" name="kWh/month" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribution by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) =>
                  `${category}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="total_kwh"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectSummary;

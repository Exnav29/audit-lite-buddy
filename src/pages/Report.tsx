import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EquipmentDataTable } from "@/components/EquipmentDataTable";
import { ReportCharts } from "@/components/ReportCharts";
import { useToast } from "@/hooks/use-toast";

interface AuditProject {
  id: string;
  client_name: string;
  site_address: string;
  audit_date: string;
  tariff_ghs_per_kwh: number;
}

const Report = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<AuditProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const { data, error } = await supabase
        .from("audit_projects")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error("Error fetching project:", error);
      toast({
        title: "Error",
        description: "Failed to load project data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Preparing your report for download...",
    });
    // Export functionality will be implemented in the table component
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Project not found</h2>
          <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(`/project/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Project
          </Button>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Energy Audit Report</CardTitle>
            <CardDescription>
              {project.client_name} - {project.site_address}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">Audit Date:</span>{" "}
                {new Date(project.audit_date).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Tariff:</span> GHS{" "}
                {project.tariff_ghs_per_kwh}/kWh
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="data" className="space-y-4">
          <TabsList>
            <TabsTrigger value="data">Data Table</TabsTrigger>
            <TabsTrigger value="charts">Charts & Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="data">
            <EquipmentDataTable projectId={id!} tariff={project.tariff_ghs_per_kwh} />
          </TabsContent>

          <TabsContent value="charts">
            <ReportCharts projectId={id!} tariff={project.tariff_ghs_per_kwh} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Report;

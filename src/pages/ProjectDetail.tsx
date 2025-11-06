import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, BarChart3, FileText, ClipboardList, FileBarChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EquipmentList from "@/components/EquipmentList";
import ObservationsForm from "@/components/ObservationsForm";
import ProjectSummary from "@/components/ProjectSummary";
import RecommendationsList from "@/components/RecommendationsList";

interface AuditProject {
  id: string;
  client_name: string;
  site_address: string;
  contact_person: string;
  audit_date: string;
  building_type: string;
  auditor_names: string[];
  tariff_ghs_per_kwh: number;
  status: string;
}

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<AuditProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("equipment");

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
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error("Error fetching project:", error);
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Project not found</h2>
          <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <Button onClick={() => navigate(`/report/${id}`)} className="gap-2">
            <FileBarChart className="w-4 h-4" />
            View Report
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{project.client_name}</h1>
          <p className="text-muted-foreground">{project.site_address}</p>
          <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
            <span>Building: {project.building_type}</span>
            <span>•</span>
            <span>Date: {new Date(project.audit_date).toLocaleDateString()}</span>
            <span>•</span>
            <span>Tariff: GHS {project.tariff_ghs_per_kwh}/kWh</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="equipment" className="gap-2">
              <Plus className="w-4 h-4" />
              Equipment
            </TabsTrigger>
            <TabsTrigger value="observations" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              Observations
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-2">
              <FileText className="w-4 h-4" />
              Recommendations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="equipment">
            <EquipmentList projectId={id!} tariff={project.tariff_ghs_per_kwh} />
          </TabsContent>

          <TabsContent value="observations">
            <ObservationsForm projectId={id!} />
          </TabsContent>

          <TabsContent value="summary">
            <ProjectSummary projectId={id!} tariff={project.tariff_ghs_per_kwh} />
          </TabsContent>

          <TabsContent value="recommendations">
            <RecommendationsList projectId={id!} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProjectDetail;

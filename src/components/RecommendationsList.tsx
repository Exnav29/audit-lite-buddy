import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddRecommendationDialog from "./AddRecommendationDialog";

interface Recommendation {
  id: string;
  description: string;
  explanation?: string;
  estimated_savings_kwh_month?: number;
  estimated_savings_ghs_month?: number;
}

interface RecommendationsListProps {
  projectId: string;
}

const RecommendationsList = ({ projectId }: RecommendationsListProps) => {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [projectId]);

  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from("recommendations")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at");

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const deleteRecommendation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("recommendations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recommendation deleted",
      });

      fetchRecommendations();
    } catch (error) {
      console.error("Error deleting recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to delete recommendation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Energy Saving Recommendations</h3>
          <p className="text-sm text-muted-foreground">
            Actionable suggestions to reduce energy consumption
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Recommendation
        </Button>
      </div>

      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Lightbulb className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No recommendations yet</h3>
            <p className="text-muted-foreground mb-6">
              Add energy-saving recommendations based on your audit findings
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add First Recommendation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {recommendations.map((rec, index) => (
            <Card key={rec.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-full flex-shrink-0">
                      <Lightbulb className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {rec.description}
                      </CardTitle>
                      {rec.explanation && (
                        <CardDescription className="text-sm">
                          {rec.explanation}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRecommendation(rec.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              {(rec.estimated_savings_kwh_month || rec.estimated_savings_ghs_month) && (
                <CardContent>
                  <div className="flex gap-4">
                    {rec.estimated_savings_kwh_month && (
                      <Badge variant="secondary" className="text-sm">
                        Save ~{rec.estimated_savings_kwh_month.toFixed(2)} kWh/month
                      </Badge>
                    )}
                    {rec.estimated_savings_ghs_month && (
                      <Badge className="bg-success text-sm">
                        Save ~GHS {rec.estimated_savings_ghs_month.toFixed(2)}/month
                      </Badge>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <AddRecommendationDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        projectId={projectId}
        onSuccess={() => {
          fetchRecommendations();
          setShowAddDialog(false);
        }}
      />
    </div>
  );
};

export default RecommendationsList;

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ObservationsFormProps {
  projectId: string;
}

const ObservationsForm = ({ projectId }: ObservationsFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [observationId, setObservationId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    ventilation_condition: "",
    comfort_levels: "",
    lighting_adequacy: "",
    signs_of_waste: "",
    maintenance_issues: "",
    safety_concerns: "",
  });

  useEffect(() => {
    fetchObservations();
  }, [projectId]);

  const fetchObservations = async () => {
    try {
      const { data, error } = await supabase
        .from("observations")
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setObservationId(data.id);
        setFormData({
          ventilation_condition: data.ventilation_condition || "",
          comfort_levels: data.comfort_levels || "",
          lighting_adequacy: data.lighting_adequacy || "",
          signs_of_waste: data.signs_of_waste || "",
          maintenance_issues: data.maintenance_issues || "",
          safety_concerns: data.safety_concerns || "",
        });
      }
    } catch (error) {
      console.error("Error fetching observations:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (observationId) {
        const { error } = await supabase
          .from("observations")
          .update(formData)
          .eq("id", observationId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("observations")
          .insert({
            project_id: projectId,
            ...formData,
          })
          .select()
          .single();

        if (error) throw error;
        setObservationId(data.id);
      }

      toast({
        title: "Success",
        description: "Observations saved successfully",
      });
    } catch (error) {
      console.error("Error saving observations:", error);
      toast({
        title: "Error",
        description: "Failed to save observations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Building Observations</CardTitle>
        <CardDescription>
          Document building conditions and operational notes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ventilation">Ventilation Condition</Label>
            <Textarea
              id="ventilation"
              placeholder="Describe the ventilation system and air quality..."
              value={formData.ventilation_condition}
              onChange={(e) =>
                setFormData({ ...formData, ventilation_condition: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comfort">Comfort Levels</Label>
            <Textarea
              id="comfort"
              placeholder="Temperature, humidity, general comfort observations..."
              value={formData.comfort_levels}
              onChange={(e) =>
                setFormData({ ...formData, comfort_levels: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lighting">Lighting Adequacy</Label>
            <Textarea
              id="lighting"
              placeholder="Natural lighting, artificial lighting conditions..."
              value={formData.lighting_adequacy}
              onChange={(e) =>
                setFormData({ ...formData, lighting_adequacy: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="waste">Signs of Energy Waste</Label>
            <Textarea
              id="waste"
              placeholder="e.g., lights on during daytime, AC with windows open..."
              value={formData.signs_of_waste}
              onChange={(e) =>
                setFormData({ ...formData, signs_of_waste: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenance">Maintenance Issues</Label>
            <Textarea
              id="maintenance"
              placeholder="Equipment requiring maintenance or repair..."
              value={formData.maintenance_issues}
              onChange={(e) =>
                setFormData({ ...formData, maintenance_issues: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="safety">Safety Concerns</Label>
            <Textarea
              id="safety"
              placeholder="Any safety issues or hazards observed..."
              value={formData.safety_concerns}
              onChange={(e) =>
                setFormData({ ...formData, safety_concerns: e.target.value })
              }
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Observations"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ObservationsForm;

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface AddRecommendationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess: () => void;
}

const AddRecommendationDialog = ({ open, onOpenChange, projectId, onSuccess }: AddRecommendationDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    explanation: "",
    estimated_savings_kwh_month: "",
    estimated_savings_ghs_month: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("recommendations")
        .insert({
          project_id: projectId,
          description: formData.description,
          explanation: formData.explanation || null,
          estimated_savings_kwh_month: formData.estimated_savings_kwh_month
            ? parseFloat(formData.estimated_savings_kwh_month)
            : null,
          estimated_savings_ghs_month: formData.estimated_savings_ghs_month
            ? parseFloat(formData.estimated_savings_ghs_month)
            : null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Recommendation added successfully",
      });

      setFormData({
        description: "",
        explanation: "",
        estimated_savings_kwh_month: "",
        estimated_savings_ghs_month: "",
      });
      onSuccess();
    } catch (error) {
      console.error("Error adding recommendation:", error);
      toast({
        title: "Error",
        description: "Failed to add recommendation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Recommendation</DialogTitle>
            <DialogDescription>
              Suggest an energy-saving measure with estimated savings
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Recommendation</Label>
              <Input
                id="description"
                placeholder="e.g., Replace fluorescent tubes with LED"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="explanation">Explanation (Optional)</Label>
              <Textarea
                id="explanation"
                placeholder="Provide details on implementation and benefits..."
                value={formData.explanation}
                onChange={(e) =>
                  setFormData({ ...formData, explanation: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kwh_savings">Estimated kWh Savings/Month</Label>
                <Input
                  id="kwh_savings"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 150"
                  value={formData.estimated_savings_kwh_month}
                  onChange={(e) =>
                    setFormData({ ...formData, estimated_savings_kwh_month: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ghs_savings">Estimated GHS Savings/Month</Label>
                <Input
                  id="ghs_savings"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 150"
                  value={formData.estimated_savings_ghs_month}
                  onChange={(e) =>
                    setFormData({ ...formData, estimated_savings_ghs_month: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Recommendation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecommendationDialog;

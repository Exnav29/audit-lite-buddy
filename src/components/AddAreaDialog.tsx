import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AddAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess: () => void;
}

const AddAreaDialog = ({ open, onOpenChange, projectId, onSuccess }: AddAreaDialogProps) => {
  const { toast } = useToast();
  const [areaName, setAreaName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("areas")
        .insert({
          project_id: projectId,
          name: areaName,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Area added successfully",
      });

      setAreaName("");
      onSuccess();
    } catch (error) {
      console.error("Error adding area:", error);
      toast({
        title: "Error",
        description: "Failed to add area",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Area</DialogTitle>
            <DialogDescription>
              Create a new room or area to audit
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="area_name">Area Name</Label>
            <Input
              id="area_name"
              placeholder="e.g., Main Office, Server Room"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Area"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAreaDialog;

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";

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
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoUrl = null;

      if (photo) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw userError || new Error('Not authenticated');

        const fileExt = photo.name.split('.').pop();
        const fileName = `${projectId}-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('area-photos')
          .upload(filePath, photo, {
            upsert: true
          });

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('area-photos')
          .getPublicUrl(filePath);
        
        photoUrl = publicUrl;
      }

      const { error } = await supabase
        .from("areas")
        .insert({
          project_id: projectId,
          name: areaName,
          photo_url: photoUrl,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Area added successfully",
      });

      setAreaName("");
      setPhoto(null);
      setPhotoPreview(null);
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
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="area_name">Area Name</Label>
              <Input
                id="area_name"
                placeholder="e.g., Main Office, Server Room"
                value={areaName}
                onChange={(e) => setAreaName(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="area-photo">Area Photo (Optional)</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('area-photo')?.click()}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {photo ? 'Change Photo' : 'Take Photo'}
                </Button>
                <Input
                  id="area-photo"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
              {photoPreview && (
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="mt-2 w-full h-48 object-cover rounded-md border"
                />
              )}
            </div>
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

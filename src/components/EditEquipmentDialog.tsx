import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";

interface Equipment {
  id: string;
  category: string;
  description: string;
  quantity: number;
  wattage_w: number;
  hours_per_day: number;
  days_per_week: number;
  condition: string;
  notes?: string;
  photo_url?: string;
}

interface EditEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onSuccess: () => void;
}

const CATEGORIES = [
  "Lighting",
  "Air Conditioning",
  "Fans",
  "Refrigeration",
  "ICT Equipment",
  "Motors",
  "Pumps",
  "Water Heaters",
  "Kitchen Equipment",
  "Other",
];

const CONDITIONS = ["Working", "Not Working", "Needs Service"];

const EditEquipmentDialog = ({ open, onOpenChange, equipment, onSuccess }: EditEquipmentDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    quantity: 1,
    wattage_w: 0,
    hours_per_day: 0,
    days_per_week: 7,
    condition: "Working",
    notes: "",
  });

  useEffect(() => {
    if (equipment) {
      setFormData({
        category: equipment.category,
        description: equipment.description,
        quantity: equipment.quantity,
        wattage_w: equipment.wattage_w,
        hours_per_day: equipment.hours_per_day,
        days_per_week: equipment.days_per_week,
        condition: equipment.condition,
        notes: equipment.notes || "",
      });
      setPhotoPreview(equipment.photo_url || null);
      setPhoto(null);
    }
  }, [equipment]);

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
    if (!equipment) return;
    
    setLoading(true);

    try {
      let photoUrl = equipment.photo_url;

      if (photo) {
        // Delete old photo if it exists
        if (equipment.photo_url) {
          const oldPath = equipment.photo_url.split('/equipment-photos/')[1];
          if (oldPath) {
            await supabase.storage
              .from('equipment-photos')
              .remove([oldPath]);
          }
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw userError || new Error('Not authenticated');

        const fileExt = photo.name.split('.').pop();
        const fileName = `${equipment.id}-${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('equipment-photos')
          .upload(filePath, photo, { upsert: true });

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('equipment-photos')
          .getPublicUrl(filePath);
        
        photoUrl = publicUrl;
      }

      const kwhPerDay = (formData.quantity * formData.wattage_w * formData.hours_per_day) / 1000;
      const kwhPerMonth = kwhPerDay * 30;

      const { error } = await supabase
        .from("equipment")
        .update({
          ...formData,
          photo_url: photoUrl,
          kwh_per_day: kwhPerDay,
          kwh_per_month: kwhPerMonth,
        })
        .eq("id", equipment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Equipment updated successfully",
      });

      onSuccess();
    } catch (error) {
      console.error("Error updating equipment:", error);
      toast({
        title: "Error",
        description: "Failed to update equipment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Equipment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category">Equipment Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Equipment Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="e.g., LED Bulb 60W"
              required
            />
          </div>

          <div>
            <Label htmlFor="edit-equipment-photo">Equipment Photo (Optional)</Label>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('edit-equipment-photo')?.click()}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                {photo ? 'Change Photo' : photoPreview ? 'Update Photo' : 'Take Photo'}
              </Button>
              <Input
                id="edit-equipment-photo"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: parseInt(e.target.value) })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="wattage">Wattage (W)</Label>
              <Input
                id="wattage"
                type="number"
                min="0"
                step="0.1"
                value={formData.wattage_w}
                onChange={(e) =>
                  setFormData({ ...formData, wattage_w: parseFloat(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hours">Hours per Day</Label>
              <Input
                id="hours"
                type="number"
                min="0"
                max="24"
                step="0.1"
                value={formData.hours_per_day}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hours_per_day: parseFloat(e.target.value),
                  })
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="days">Days per Week</Label>
              <Input
                id="days"
                type="number"
                min="1"
                max="7"
                value={formData.days_per_week}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    days_per_week: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="condition">Condition</Label>
            <Select
              value={formData.condition}
              onValueChange={(value) =>
                setFormData({ ...formData, condition: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((cond) => (
                  <SelectItem key={cond} value={cond}>
                    {cond}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Any additional observations..."
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Updating..." : "Update Equipment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEquipmentDialog;

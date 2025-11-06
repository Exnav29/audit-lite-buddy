import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";

const EQUIPMENT_CATEGORIES = [
  "Lighting",
  "Fans",
  "Air Conditioning",
  "Refrigerator",
  "ICT Equipment",
  "Motors",
  "Water Heater",
  "Other",
];

const CONDITIONS = ["Working", "Not Working", "Needs Service"];

interface AddEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areaId: string;
  onSuccess: () => void;
}

const AddEquipmentDialog = ({ open, onOpenChange, areaId, onSuccess }: AddEquipmentDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    quantity: "1",
    wattage_w: "",
    hours_per_day: "",
    days_per_week: "7",
    condition: "Working",
    notes: "",
  });

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
        const fileExt = photo.name.split('.').pop();
        const fileName = `${areaId}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('equipment-photos')
          .upload(fileName, photo);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('equipment-photos')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrl;
      }

      const { error } = await supabase
        .from("equipment")
        .insert({
          area_id: areaId,
          category: formData.category,
          description: formData.description,
          quantity: parseInt(formData.quantity),
          wattage_w: parseFloat(formData.wattage_w),
          hours_per_day: parseFloat(formData.hours_per_day),
          days_per_week: parseInt(formData.days_per_week),
          condition: formData.condition,
          notes: formData.notes || null,
          photo_url: photoUrl,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Equipment added successfully",
      });

      setFormData({
        category: "",
        description: "",
        quantity: "1",
        wattage_w: "",
        hours_per_day: "",
        days_per_week: "7",
        condition: "Working",
        notes: "",
      });
      setPhoto(null);
      setPhotoPreview(null);
      onSuccess();
    } catch (error) {
      console.error("Error adding equipment:", error);
      toast({
        title: "Error",
        description: "Failed to add equipment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Equipment</DialogTitle>
            <DialogDescription>
              Record equipment details and operating conditions
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EQUIPMENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) =>
                    setFormData({ ...formData, condition: value })
                  }
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., LED Tube Light, Split AC Unit"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment-photo">Equipment Photo (Optional)</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('equipment-photo')?.click()}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {photo ? 'Change Photo' : 'Take Photo'}
                </Button>
                <Input
                  id="equipment-photo"
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
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wattage">Wattage (W)</Label>
                <Input
                  id="wattage"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 18, 1500"
                  value={formData.wattage_w}
                  onChange={(e) =>
                    setFormData({ ...formData, wattage_w: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hours">Hours per Day</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  placeholder="e.g., 8, 12"
                  value={formData.hours_per_day}
                  onChange={(e) =>
                    setFormData({ ...formData, hours_per_day: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="days">Days per Week</Label>
                <Input
                  id="days"
                  type="number"
                  min="1"
                  max="7"
                  value={formData.days_per_week}
                  onChange={(e) =>
                    setFormData({ ...formData, days_per_week: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional observations..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Equipment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEquipmentDialog;

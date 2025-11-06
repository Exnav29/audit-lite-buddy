import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddEquipmentDialog from "./AddEquipmentDialog";
import AddAreaDialog from "./AddAreaDialog";
import EditEquipmentDialog from "./EditEquipmentDialog";

interface Area {
  id: string;
  name: string;
}

interface Equipment {
  id: string;
  area_id: string;
  category: string;
  description: string;
  quantity: number;
  wattage_w: number;
  hours_per_day: number;
  days_per_week: number;
  condition: string;
  notes?: string;
  kwh_per_day: number;
  kwh_per_month: number;
  photo_url?: string;
}

interface EquipmentListProps {
  projectId: string;
  tariff: number;
}

const EquipmentList = ({ projectId, tariff }: EquipmentListProps) => {
  const { toast } = useToast();
  const [areas, setAreas] = useState<Area[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [showAddArea, setShowAddArea] = useState(false);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [showEditEquipment, setShowEditEquipment] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  useEffect(() => {
    fetchAreas();
  }, [projectId]);

  useEffect(() => {
    if (selectedAreaId) {
      fetchEquipment(selectedAreaId);
    }
  }, [selectedAreaId]);

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from("areas")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at");

      if (error) throw error;
      setAreas(data || []);
      if (data && data.length > 0 && !selectedAreaId) {
        setSelectedAreaId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching areas:", error);
    }
  };

  const fetchEquipment = async (areaId: string) => {
    try {
      const { data, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("area_id", areaId)
        .order("created_at");

      if (error) throw error;
      setEquipment(data || []);
    } catch (error) {
      console.error("Error fetching equipment:", error);
    }
  };

  const handleEdit = (item: Equipment) => {
    setEditingEquipment(item);
    setShowEditEquipment(true);
  };

  const deleteEquipment = async (equipmentId: string) => {
    try {
      const { error } = await supabase
        .from("equipment")
        .delete()
        .eq("id", equipmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Equipment deleted successfully",
      });

      if (selectedAreaId) {
        fetchEquipment(selectedAreaId);
      }
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast({
        title: "Error",
        description: "Failed to delete equipment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {areas.map((area) => (
            <Button
              key={area.id}
              variant={selectedAreaId === area.id ? "default" : "outline"}
              onClick={() => setSelectedAreaId(area.id)}
            >
              {area.name}
            </Button>
          ))}
          <Button variant="outline" onClick={() => setShowAddArea(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Area
          </Button>
        </div>
        <Button
          onClick={() => setShowAddEquipment(true)}
          disabled={!selectedAreaId}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {areas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No areas created yet. Start by adding a room or area.
            </p>
            <Button onClick={() => setShowAddArea(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Area
            </Button>
          </CardContent>
        </Card>
      ) : equipment.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No equipment in this area yet.
            </p>
            <Button onClick={() => setShowAddEquipment(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Equipment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {equipment.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.description}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.category} • {item.condition}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEquipment(item.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {item.photo_url && (
                  <img 
                    src={item.photo_url} 
                    alt={item.description}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Quantity</p>
                    <p className="font-semibold">{item.quantity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Wattage</p>
                    <p className="font-semibold">{item.wattage_w}W</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">kWh/Month</p>
                    <p className="font-semibold text-primary">
                      {item.kwh_per_month.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cost/Month</p>
                    <p className="font-semibold text-accent">
                      GHS {(item.kwh_per_month * tariff).toFixed(2)}
                    </p>
                  </div>
                </div>
                {item.notes && (
                  <p className="mt-3 text-sm text-muted-foreground italic">
                    Note: {item.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddAreaDialog
        open={showAddArea}
        onOpenChange={setShowAddArea}
        projectId={projectId}
        onSuccess={() => {
          fetchAreas();
          setShowAddArea(false);
        }}
      />

      <AddEquipmentDialog
        open={showAddEquipment}
        onOpenChange={setShowAddEquipment}
        areaId={selectedAreaId || ""}
        onSuccess={() => {
          if (selectedAreaId) {
            fetchEquipment(selectedAreaId);
          }
          setShowAddEquipment(false);
        }}
      />

      <EditEquipmentDialog
        open={showEditEquipment}
        onOpenChange={setShowEditEquipment}
        equipment={editingEquipment}
        onSuccess={() => {
          if (selectedAreaId) {
            fetchEquipment(selectedAreaId);
          }
          setShowEditEquipment(false);
        }}
      />
    </div>
  );
};

export default EquipmentList;

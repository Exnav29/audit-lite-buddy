import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X } from "lucide-react";

interface Equipment {
  id: string;
  area_id: string;
  area_name?: string;
  category: string;
  description: string;
  quantity: number;
  wattage_w: number;
  hours_per_day: number;
  days_per_week: number;
  kwh_per_day: number;
  kwh_per_month: number;
  condition: string;
  notes?: string;
}

interface EquipmentDataTableProps {
  projectId: string;
  tariff: number;
}

export const EquipmentDataTable = ({ projectId, tariff }: EquipmentDataTableProps) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Equipment>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchEquipment();
  }, [projectId]);

  const fetchEquipment = async () => {
    try {
      // First get all areas for this project
      const { data: areas, error: areasError } = await supabase
        .from("areas")
        .select("id, name")
        .eq("project_id", projectId);

      if (areasError) throw areasError;

      if (!areas || areas.length === 0) {
        setEquipment([]);
        setLoading(false);
        return;
      }

      // Then get all equipment for these areas
      const areaIds = areas.map((a) => a.id);
      const { data: equipmentData, error: equipmentError } = await supabase
        .from("equipment")
        .select("*")
        .in("area_id", areaIds)
        .order("created_at", { ascending: false });

      if (equipmentError) throw equipmentError;

      // Merge area names with equipment
      const enrichedEquipment = (equipmentData || []).map((eq) => ({
        ...eq,
        area_name: areas.find((a) => a.id === eq.area_id)?.name,
      }));

      setEquipment(enrichedEquipment);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast({
        title: "Error",
        description: "Failed to load equipment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item: Equipment) => {
    setEditingId(item.id);
    setEditValues(item);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = async () => {
    if (!editingId) return;

    try {
      // Save edited fields
      const { error } = await supabase
        .from("equipment")
        .update({
          category: editValues.category,
          description: editValues.description,
          quantity: editValues.quantity,
          wattage_w: editValues.wattage_w,
          hours_per_day: editValues.hours_per_day,
          days_per_week: editValues.days_per_week,
          condition: editValues.condition,
          notes: editValues.notes,
        })
        .eq("id", editingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Equipment updated successfully",
      });

      setEditingId(null);
      setEditValues({});
      fetchEquipment();
    } catch (error) {
      console.error("Error updating equipment:", error);
      toast({
        title: "Error",
        description: "Failed to update equipment",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalKwhPerMonth = equipment.reduce((sum, eq) => sum + (eq.kwh_per_month || 0), 0);
  const totalCostPerMonth = totalKwhPerMonth * tariff;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equipment Data</CardTitle>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-muted-foreground">Total Monthly Consumption</div>
            <div className="text-2xl font-bold">{totalKwhPerMonth.toFixed(2)} kWh</div>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <div className="text-muted-foreground">Estimated Monthly Cost</div>
            <div className="text-2xl font-bold">GHS {totalCostPerMonth.toFixed(2)}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Wattage (W)</TableHead>
                <TableHead>Hrs/Day</TableHead>
                <TableHead>Days/Week</TableHead>
                <TableHead>kWh/Month</TableHead>
                <TableHead>Cost/Month</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center text-muted-foreground">
                    No equipment data available
                  </TableCell>
                </TableRow>
              ) : (
                equipment.map((item) => {
                  const isEditing = editingId === item.id;
                  const values = isEditing ? editValues : item;
                  const monthlyCost = (values.kwh_per_month || 0) * tariff;

                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.area_name}</TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={values.category}
                            onChange={(e) =>
                              setEditValues({ ...editValues, category: e.target.value })
                            }
                            className="h-8"
                          />
                        ) : (
                          values.category
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={values.description}
                            onChange={(e) =>
                              setEditValues({ ...editValues, description: e.target.value })
                            }
                            className="h-8"
                          />
                        ) : (
                          values.description
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={values.quantity}
                            onChange={(e) =>
                              setEditValues({ ...editValues, quantity: parseInt(e.target.value) })
                            }
                            className="h-8 w-16"
                          />
                        ) : (
                          values.quantity
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={values.wattage_w}
                            onChange={(e) =>
                              setEditValues({ ...editValues, wattage_w: parseFloat(e.target.value) })
                            }
                            className="h-8 w-20"
                          />
                        ) : (
                          values.wattage_w
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={values.hours_per_day}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                hours_per_day: parseFloat(e.target.value),
                              })
                            }
                            className="h-8 w-16"
                          />
                        ) : (
                          values.hours_per_day
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={values.days_per_week}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                days_per_week: parseInt(e.target.value),
                              })
                            }
                            className="h-8 w-16"
                          />
                        ) : (
                          values.days_per_week
                        )}
                      </TableCell>
                      <TableCell>{(values.kwh_per_month || 0).toFixed(2)}</TableCell>
                      <TableCell>GHS {monthlyCost.toFixed(2)}</TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={values.condition}
                            onChange={(e) =>
                              setEditValues({ ...editValues, condition: e.target.value })
                            }
                            className="h-8"
                          />
                        ) : (
                          values.condition
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={saveEdit}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEdit}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => startEdit(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BUILDING_TYPES = [
  "Office",
  "Classroom",
  "Hostel",
  "Residential",
  "Commercial",
  "Industrial",
];

const NewProject = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_name: "",
    site_address: "",
    contact_person: "",
    audit_date: new Date().toISOString().split("T")[0],
    building_type: "",
    auditor_names: "",
    tariff_ghs_per_kwh: "1.0",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const auditorNamesArray = formData.auditor_names
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name);

      const { data, error } = await supabase
        .from("audit_projects")
        .insert({
          user_id: user.id,
          client_name: formData.client_name,
          site_address: formData.site_address,
          contact_person: formData.contact_person,
          audit_date: formData.audit_date,
          building_type: formData.building_type,
          auditor_names: auditorNamesArray,
          tariff_ghs_per_kwh: parseFloat(formData.tariff_ghs_per_kwh),
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Audit project created successfully",
      });

      navigate(`/project/${data.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create audit project",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2" size="sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>New Energy Audit</CardTitle>
            <CardDescription>
              Create a new Level 1 walkthrough energy audit project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="client_name">Client Name</Label>
                <Input
                  id="client_name"
                  required
                  value={formData.client_name}
                  onChange={(e) =>
                    setFormData({ ...formData, client_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_address">Site Address</Label>
                <Input
                  id="site_address"
                  required
                  value={formData.site_address}
                  onChange={(e) =>
                    setFormData({ ...formData, site_address: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  required
                  value={formData.contact_person}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_person: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audit_date">Audit Date</Label>
                  <Input
                    id="audit_date"
                    type="date"
                    required
                    value={formData.audit_date}
                    onChange={(e) =>
                      setFormData({ ...formData, audit_date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="building_type">Building Type</Label>
                  <Select
                    value={formData.building_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, building_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUILDING_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auditor_names">Auditor Names (comma-separated)</Label>
                <Input
                  id="auditor_names"
                  required
                  placeholder="John Doe, Jane Smith"
                  value={formData.auditor_names}
                  onChange={(e) =>
                    setFormData({ ...formData, auditor_names: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tariff">Tariff (GHS per kWh)</Label>
                <Input
                  id="tariff"
                  type="number"
                  step="0.0001"
                  required
                  value={formData.tariff_ghs_per_kwh}
                  onChange={(e) =>
                    setFormData({ ...formData, tariff_ghs_per_kwh: e.target.value })
                  }
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button type="submit" disabled={loading} className="flex-1 w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Creating..." : "Create Audit"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NewProject;

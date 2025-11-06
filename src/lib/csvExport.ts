import { supabase } from "@/integrations/supabase/client";

interface AuditProject {
  id: string;
  client_name: string;
  site_address: string;
  contact_person: string;
  audit_date: string;
  building_type: string;
  auditor_names: string[];
  tariff_ghs_per_kwh: number;
}

interface Equipment {
  id: string;
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

interface Observations {
  ventilation_condition?: string;
  comfort_levels?: string;
  lighting_adequacy?: string;
  signs_of_waste?: string;
  maintenance_issues?: string;
  safety_concerns?: string;
}

interface Recommendation {
  description: string;
  explanation?: string;
  estimated_savings_kwh_month?: number;
  estimated_savings_ghs_month?: number;
}

const escapeCSV = (value: any): string => {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const arrayToCSVRow = (row: any[]): string => {
  return row.map(escapeCSV).join(",");
};

export const exportAuditReportToCSV = async (projectId: string): Promise<void> => {
  try {
    // Fetch project data
    const { data: project, error: projectError } = await supabase
      .from("audit_projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError) throw projectError;

    // Fetch areas
    const { data: areas, error: areasError } = await supabase
      .from("areas")
      .select("id, name")
      .eq("project_id", projectId);

    if (areasError) throw areasError;

    // Fetch equipment
    let equipment: Equipment[] = [];
    if (areas && areas.length > 0) {
      const areaIds = areas.map((a) => a.id);
      const { data: equipmentData, error: equipmentError } = await supabase
        .from("equipment")
        .select("*")
        .in("area_id", areaIds)
        .order("created_at", { ascending: true });

      if (equipmentError) throw equipmentError;

      // Enrich with area names
      equipment = (equipmentData || []).map((eq) => ({
        ...eq,
        area_name: areas.find((a) => a.id === eq.area_id)?.name,
      }));
    }

    // Fetch observations
    const { data: observations, error: observationsError } = await supabase
      .from("observations")
      .select("*")
      .eq("project_id", projectId)
      .maybeSingle();

    if (observationsError && observationsError.code !== "PGRST116") throw observationsError;

    // Fetch recommendations
    const { data: recommendations, error: recommendationsError } = await supabase
      .from("recommendations")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at");

    if (recommendationsError) throw recommendationsError;

    // Build CSV content
    const csvRows: string[] = [];

    // Header section
    csvRows.push("ENERGY AUDIT REPORT");
    csvRows.push("");
    csvRows.push("PROJECT INFORMATION");
    csvRows.push(arrayToCSVRow(["Client Name", project.client_name]));
    csvRows.push(arrayToCSVRow(["Site Address", project.site_address]));
    csvRows.push(arrayToCSVRow(["Contact Person", project.contact_person]));
    csvRows.push(arrayToCSVRow(["Building Type", project.building_type]));
    csvRows.push(arrayToCSVRow(["Audit Date", new Date(project.audit_date).toLocaleDateString()]));
    csvRows.push(arrayToCSVRow(["Auditors", (project.auditor_names || []).join(", ")]));
    csvRows.push(arrayToCSVRow(["Tariff (GHS/kWh)", project.tariff_ghs_per_kwh]));
    csvRows.push("");

    // Equipment inventory
    csvRows.push("EQUIPMENT INVENTORY");
    csvRows.push(
      arrayToCSVRow([
        "Area",
        "Category",
        "Description",
        "Quantity",
        "Wattage (W)",
        "Hours/Day",
        "Days/Week",
        "kWh/Day",
        "kWh/Month",
        "Cost/Month (GHS)",
        "Condition",
        "Notes",
      ])
    );

    let totalKwhMonth = 0;
    let totalCostMonth = 0;

    equipment.forEach((item) => {
      const monthlyCost = item.kwh_per_month * project.tariff_ghs_per_kwh;
      totalKwhMonth += item.kwh_per_month;
      totalCostMonth += monthlyCost;

      csvRows.push(
        arrayToCSVRow([
          item.area_name || "",
          item.category,
          item.description,
          item.quantity,
          item.wattage_w,
          item.hours_per_day,
          item.days_per_week,
          item.kwh_per_day.toFixed(4),
          item.kwh_per_month.toFixed(2),
          monthlyCost.toFixed(2),
          item.condition,
          item.notes || "",
        ])
      );
    });

    csvRows.push("");
    csvRows.push(arrayToCSVRow(["TOTAL MONTHLY CONSUMPTION", totalKwhMonth.toFixed(2), "kWh"]));
    csvRows.push(arrayToCSVRow(["TOTAL ESTIMATED MONTHLY COST", totalCostMonth.toFixed(2), "GHS"]));
    csvRows.push("");

    // Observations
    if (observations) {
      csvRows.push("OBSERVATIONS");
      csvRows.push("");

      if (observations.ventilation_condition) {
        csvRows.push(arrayToCSVRow(["Ventilation Condition"]));
        csvRows.push(arrayToCSVRow([observations.ventilation_condition]));
        csvRows.push("");
      }

      if (observations.comfort_levels) {
        csvRows.push(arrayToCSVRow(["Comfort Levels"]));
        csvRows.push(arrayToCSVRow([observations.comfort_levels]));
        csvRows.push("");
      }

      if (observations.lighting_adequacy) {
        csvRows.push(arrayToCSVRow(["Lighting Adequacy"]));
        csvRows.push(arrayToCSVRow([observations.lighting_adequacy]));
        csvRows.push("");
      }

      if (observations.signs_of_waste) {
        csvRows.push(arrayToCSVRow(["Signs of Energy Waste"]));
        csvRows.push(arrayToCSVRow([observations.signs_of_waste]));
        csvRows.push("");
      }

      if (observations.maintenance_issues) {
        csvRows.push(arrayToCSVRow(["Maintenance Issues"]));
        csvRows.push(arrayToCSVRow([observations.maintenance_issues]));
        csvRows.push("");
      }

      if (observations.safety_concerns) {
        csvRows.push(arrayToCSVRow(["Safety Concerns"]));
        csvRows.push(arrayToCSVRow([observations.safety_concerns]));
        csvRows.push("");
      }
    }

    // Recommendations
    if (recommendations && recommendations.length > 0) {
      csvRows.push("ENERGY SAVING RECOMMENDATIONS");
      csvRows.push(
        arrayToCSVRow([
          "Recommendation",
          "Explanation",
          "Est. Savings (kWh/month)",
          "Est. Savings (GHS/month)",
        ])
      );

      recommendations.forEach((rec) => {
        csvRows.push(
          arrayToCSVRow([
            rec.description,
            rec.explanation || "",
            rec.estimated_savings_kwh_month?.toFixed(2) || "",
            rec.estimated_savings_ghs_month?.toFixed(2) || "",
          ])
        );
      });
    }

    // Create and download CSV file
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const fileName = `Energy_Audit_Report_${project.client_name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting CSV:", error);
    throw error;
  }
};

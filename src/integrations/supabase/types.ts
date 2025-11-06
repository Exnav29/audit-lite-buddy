export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      areas: {
        Row: {
          created_at: string
          id: string
          name: string
          photo_url: string | null
          project_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          photo_url?: string | null
          project_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          photo_url?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "areas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "audit_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_projects: {
        Row: {
          audit_date: string
          auditor_names: string[]
          building_type: string
          client_name: string
          contact_person: string
          created_at: string
          id: string
          site_address: string
          status: string
          tariff_ghs_per_kwh: number
          updated_at: string
          user_id: string
        }
        Insert: {
          audit_date?: string
          auditor_names: string[]
          building_type: string
          client_name: string
          contact_person: string
          created_at?: string
          id?: string
          site_address: string
          status?: string
          tariff_ghs_per_kwh?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          audit_date?: string
          auditor_names?: string[]
          building_type?: string
          client_name?: string
          contact_person?: string
          created_at?: string
          id?: string
          site_address?: string
          status?: string
          tariff_ghs_per_kwh?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          area_id: string
          category: string
          condition: string
          created_at: string
          days_per_week: number
          description: string
          hours_per_day: number
          id: string
          kwh_per_day: number | null
          kwh_per_month: number | null
          notes: string | null
          photo_url: string | null
          quantity: number
          wattage_w: number
        }
        Insert: {
          area_id: string
          category: string
          condition?: string
          created_at?: string
          days_per_week: number
          description: string
          hours_per_day: number
          id?: string
          kwh_per_day?: number | null
          kwh_per_month?: number | null
          notes?: string | null
          photo_url?: string | null
          quantity?: number
          wattage_w: number
        }
        Update: {
          area_id?: string
          category?: string
          condition?: string
          created_at?: string
          days_per_week?: number
          description?: string
          hours_per_day?: number
          id?: string
          kwh_per_day?: number | null
          kwh_per_month?: number | null
          notes?: string | null
          photo_url?: string | null
          quantity?: number
          wattage_w?: number
        }
        Relationships: [
          {
            foreignKeyName: "equipment_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      observations: {
        Row: {
          comfort_levels: string | null
          created_at: string
          id: string
          lighting_adequacy: string | null
          maintenance_issues: string | null
          project_id: string
          safety_concerns: string | null
          signs_of_waste: string | null
          ventilation_condition: string | null
        }
        Insert: {
          comfort_levels?: string | null
          created_at?: string
          id?: string
          lighting_adequacy?: string | null
          maintenance_issues?: string | null
          project_id: string
          safety_concerns?: string | null
          signs_of_waste?: string | null
          ventilation_condition?: string | null
        }
        Update: {
          comfort_levels?: string | null
          created_at?: string
          id?: string
          lighting_adequacy?: string | null
          maintenance_issues?: string | null
          project_id?: string
          safety_concerns?: string | null
          signs_of_waste?: string | null
          ventilation_condition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "observations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "audit_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          created_at: string
          description: string
          estimated_savings_ghs_month: number | null
          estimated_savings_kwh_month: number | null
          explanation: string | null
          id: string
          project_id: string
        }
        Insert: {
          created_at?: string
          description: string
          estimated_savings_ghs_month?: number | null
          estimated_savings_kwh_month?: number | null
          explanation?: string | null
          id?: string
          project_id: string
        }
        Update: {
          created_at?: string
          description?: string
          estimated_savings_ghs_month?: number | null
          estimated_savings_kwh_month?: number | null
          explanation?: string | null
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "audit_projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

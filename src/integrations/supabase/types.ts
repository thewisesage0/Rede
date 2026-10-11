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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      contracts: {
        Row: {
          ae_earning: number
          final_contract_type: string
          id: string
          signed_at: string
          submission_id: string
        }
        Insert: {
          ae_earning?: number
          final_contract_type: string
          id?: string
          signed_at?: string
          submission_id: string
        }
        Update: {
          ae_earning?: number
          final_contract_type?: string
          id?: string
          signed_at?: string
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      platforms: {
        Row: {
          application_instructions: string | null
          application_link: string | null
          archived: boolean
          contract_types: string[]
          created_at: string
          description: string | null
          exclusive_benefits: string | null
          exclusive_bonus: number
          faq: Json
          genres: string[]
          id: string
          logo_url: string | null
          mab_details: string | null
          mab_requirements: string | null
          min_word_count: number | null
          monetization_details: string | null
          name: string
          nonexclusive_benefits: string | null
          nonexclusive_bonus: number
          onboarding_steps: Json
          process_images: Json
          referral_code: string | null
          referral_instructions: string | null
          referral_link: string | null
          requirements: string | null
          se_email_custom_note: string | null
          se_email_fields: Json
          se_email_intro: string | null
          se_email_subject_template: string | null
          senior_editor_email: string | null
          senior_editor_name: string | null
          signing_bonus_requirements: string | null
          slug: string
          tagline: string | null
          update_expectations: string | null
          updated_at: string
        }
        Insert: {
          application_instructions?: string | null
          application_link?: string | null
          archived?: boolean
          contract_types?: string[]
          created_at?: string
          description?: string | null
          exclusive_benefits?: string | null
          exclusive_bonus?: number
          faq?: Json
          genres?: string[]
          id?: string
          logo_url?: string | null
          mab_details?: string | null
          mab_requirements?: string | null
          min_word_count?: number | null
          monetization_details?: string | null
          name: string
          nonexclusive_benefits?: string | null
          nonexclusive_bonus?: number
          onboarding_steps?: Json
          process_images?: Json
          referral_code?: string | null
          referral_instructions?: string | null
          referral_link?: string | null
          requirements?: string | null
          se_email_custom_note?: string | null
          se_email_fields?: Json
          se_email_intro?: string | null
          se_email_subject_template?: string | null
          senior_editor_email?: string | null
          senior_editor_name?: string | null
          signing_bonus_requirements?: string | null
          slug: string
          tagline?: string | null
          update_expectations?: string | null
          updated_at?: string
        }
        Update: {
          application_instructions?: string | null
          application_link?: string | null
          archived?: boolean
          contract_types?: string[]
          created_at?: string
          description?: string | null
          exclusive_benefits?: string | null
          exclusive_bonus?: number
          faq?: Json
          genres?: string[]
          id?: string
          logo_url?: string | null
          mab_details?: string | null
          mab_requirements?: string | null
          min_word_count?: number | null
          monetization_details?: string | null
          name?: string
          nonexclusive_benefits?: string | null
          nonexclusive_bonus?: number
          onboarding_steps?: Json
          process_images?: Json
          referral_code?: string | null
          referral_instructions?: string | null
          referral_link?: string | null
          requirements?: string | null
          se_email_custom_note?: string | null
          se_email_fields?: Json
          se_email_intro?: string | null
          se_email_subject_template?: string | null
          senior_editor_email?: string | null
          senior_editor_name?: string | null
          signing_bonus_requirements?: string | null
          slug?: string
          tagline?: string | null
          update_expectations?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          answers: Json
          created_at: string
          id: string
          recommendation_reason: string | null
          recommended_platform: string | null
          suitability_score: number | null
          user_session: string | null
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          recommendation_reason?: string | null
          recommended_platform?: string | null
          suitability_score?: number | null
          user_session?: string | null
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          recommendation_reason?: string | null
          recommended_platform?: string | null
          suitability_score?: number | null
          user_session?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_recommended_platform_fkey"
            columns: ["recommended_platform"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          key: string
          kind: string
          label: string
          section: string
          sort_order: number
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          kind?: string
          label: string
          section?: string
          sort_order?: number
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          kind?: string
          label?: string
          section?: string
          sort_order?: number
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          author_name: string
          book_links: string | null
          contact_info: string | null
          contract_type: string | null
          created_at: string
          email: string
          genre: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          novel_title: string
          pen_name: string | null
          platform_id: string | null
          preferred_contact_method: string | null
          proof_url: string | null
          reader_traction: string | null
          status: Database["public"]["Enums"]["submission_status"]
          updated_at: string
          word_count: number | null
        }
        Insert: {
          author_name: string
          book_links?: string | null
          contact_info?: string | null
          contract_type?: string | null
          created_at?: string
          email: string
          genre?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          novel_title: string
          pen_name?: string | null
          platform_id?: string | null
          preferred_contact_method?: string | null
          proof_url?: string | null
          reader_traction?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
          word_count?: number | null
        }
        Update: {
          author_name?: string
          book_links?: string | null
          contact_info?: string | null
          contract_type?: string | null
          created_at?: string
          email?: string
          genre?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          novel_title?: string
          pen_name?: string | null
          platform_id?: string | null
          preferred_contact_method?: string | null
          proof_url?: string | null
          reader_traction?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      slugify: { Args: { input: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "user"
      submission_status:
        | "pending"
        | "contacted"
        | "forwarded"
        | "under_review"
        | "exclusive_signed"
        | "nonexclusive_signed"
        | "rejected"
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
    Enums: {
      app_role: ["admin", "user"],
      submission_status: [
        "pending",
        "contacted",
        "forwarded",
        "under_review",
        "exclusive_signed",
        "nonexclusive_signed",
        "rejected",
      ],
    },
  },
} as const

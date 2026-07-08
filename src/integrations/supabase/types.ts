export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string;
          browser: string | null;
          country: string | null;
          created_at: string;
          details: Json | null;
          device: string | null;
          entity: string | null;
          id: string;
          ip_hash: string | null;
          os: string | null;
          page: string | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          browser?: string | null;
          country?: string | null;
          created_at?: string;
          details?: Json | null;
          device?: string | null;
          entity?: string | null;
          id?: string;
          ip_hash?: string | null;
          os?: string | null;
          page?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          browser?: string | null;
          country?: string | null;
          created_at?: string;
          details?: Json | null;
          device?: string | null;
          entity?: string | null;
          id?: string;
          ip_hash?: string | null;
          os?: string | null;
          page?: string | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      client_brands: {
        Row: {
          accent_color: string | null;
          background_type: string | null;
          brand_name: string | null;
          default_thumbnail_url: string | null;
          font_family: string | null;
          logo_url: string | null;
          player_title: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          support_email: string | null;
          tagline: string | null;
          theme_mode: string | null;
          updated_at: string;
          user_id: string;
          website_url: string | null;
          welcome_message: string | null;
        };
        Insert: {
          accent_color?: string | null;
          background_type?: string | null;
          brand_name?: string | null;
          default_thumbnail_url?: string | null;
          font_family?: string | null;
          logo_url?: string | null;
          player_title?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          support_email?: string | null;
          tagline?: string | null;
          theme_mode?: string | null;
          updated_at?: string;
          user_id: string;
          website_url?: string | null;
          welcome_message?: string | null;
        };
        Update: {
          accent_color?: string | null;
          background_type?: string | null;
          brand_name?: string | null;
          default_thumbnail_url?: string | null;
          font_family?: string | null;
          logo_url?: string | null;
          player_title?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          support_email?: string | null;
          tagline?: string | null;
          theme_mode?: string | null;
          updated_at?: string;
          user_id?: string;
          website_url?: string | null;
          welcome_message?: string | null;
        };
        Relationships: [];
      };
      content: {
        Row: {
          active: boolean;
          artist: string | null;
          category: string | null;
          content_type: string | null;
          created_at: string;
          description: string | null;
          duration_seconds: number | null;
          id: string;
          release_year: number | null;
          stream_url: string | null;
          thumbnail_url: string | null;
          title: string;
        };
        Insert: {
          active?: boolean;
          artist?: string | null;
          category?: string | null;
          content_type?: string | null;
          created_at?: string;
          description?: string | null;
          duration_seconds?: number | null;
          id?: string;
          release_year?: number | null;
          stream_url?: string | null;
          thumbnail_url?: string | null;
          title: string;
        };
        Update: {
          active?: boolean;
          artist?: string | null;
          category?: string | null;
          content_type?: string | null;
          created_at?: string;
          description?: string | null;
          duration_seconds?: number | null;
          id?: string;
          release_year?: number | null;
          stream_url?: string | null;
          thumbnail_url?: string | null;
          title?: string;
        };
        Relationships: [];
      };
      package_content: {
        Row: {
          content_id: string;
          package_id: string;
        };
        Insert: {
          content_id: string;
          package_id: string;
        };
        Update: {
          content_id?: string;
          package_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "package_content_content_id_fkey";
            columns: ["content_id"];
            isOneToOne: false;
            referencedRelation: "content";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "package_content_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "packages";
            referencedColumns: ["id"];
          },
        ];
      };
      packages: {
        Row: {
          active: boolean;
          created_at: string;
          description: string | null;
          id: string;
          max_streams: number;
          name: string;
          price_monthly: number;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          description?: string | null;
          id?: string;
          max_streams?: number;
          name: string;
          price_monthly?: number;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          description?: string | null;
          id?: string;
          max_streams?: number;
          name?: string;
          price_monthly?: number;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          company: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          company?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          company?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          amount_paid: number | null;
          created_at: string;
          currency: string | null;
          expires_at: string | null;
          id: string;
          package_id: string;
          payment_method: string | null;
          receipt_id: string | null;
          renews_at: string | null;
          started_at: string;
          status: string;
          user_id: string;
        };
        Insert: {
          amount_paid?: number | null;
          created_at?: string;
          currency?: string | null;
          expires_at?: string | null;
          id?: string;
          package_id: string;
          payment_method?: string | null;
          receipt_id?: string | null;
          renews_at?: string | null;
          started_at?: string;
          status?: string;
          user_id: string;
        };
        Update: {
          amount_paid?: number | null;
          created_at?: string;
          currency?: string | null;
          expires_at?: string | null;
          id?: string;
          package_id?: string;
          payment_method?: string | null;
          receipt_id?: string | null;
          renews_at?: string | null;
          started_at?: string;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_package_id_fkey";
            columns: ["package_id"];
            isOneToOne: false;
            referencedRelation: "packages";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "client";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "client"],
    },
  },
} as const;

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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      fields: {
        Row: {
          city: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          city: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          city?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      match_players: {
        Row: {
          id: string
          match_id: string
          player_id: string
          team: string
        }
        Insert: {
          id?: string
          match_id: string
          player_id: string
          team: string
        }
        Update: {
          id?: string
          match_id?: string
          player_id?: string
          team?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_players_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_players_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "view_match_outcomes"
            referencedColumns: ["match_id"]
          },
          {
            foreignKeyName: "match_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string | null
          date: string
          field_id: string | null
          id: string
          notes: string | null
          result: string
          video_url: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          field_id?: string | null
          id?: string
          notes?: string | null
          result: string
          video_url?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          field_id?: string | null
          id?: string
          notes?: string | null
          result?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "fields"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          birth_date: string | null
          created_at: string | null
          first_name: string | null
          height: number | null
          id: string
          is_active: boolean | null
          is_guest: boolean | null
          last_name: string | null
          nickname: string | null
          preferred_foot: string | null
          username: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string | null
          first_name?: string | null
          height?: number | null
          id?: string
          is_active?: boolean | null
          is_guest?: boolean | null
          last_name?: string | null
          nickname?: string | null
          preferred_foot?: string | null
          username?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string | null
          first_name?: string | null
          height?: number | null
          id?: string
          is_active?: boolean | null
          is_guest?: boolean | null
          last_name?: string | null
          nickname?: string | null
          preferred_foot?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      view_match_outcomes: {
        Row: {
          date: string | null
          match_id: string | null
          outcome: string | null
          player_id: string | null
          result: string | null
          team: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      view_player_stats_all_time: {
        Row: {
          attendance_pct: number | null
          draw_rate: number | null
          draws: number | null
          form_array: string[] | null
          is_guest: boolean | null
          loss_rate: number | null
          losses: number | null
          matches_played: number | null
          nickname: string | null
          player_id: string | null
          points: number | null
          win_pct: number | null
          win_rate: number | null
          wins: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      view_player_stats_yearly: {
        Row: {
          attendance_pct: number | null
          draw_rate: number | null
          draws: number | null
          effectiveness: number | null
          form_array: string[] | null
          is_guest: boolean | null
          loss_rate: number | null
          losses: number | null
          matches_played: number | null
          nickname: string | null
          player_id: string | null
          points: number | null
          win_pct: number | null
          win_rate: number | null
          wins: number | null
          year: number | null
        }
        Relationships: [
          {
            foreignKeyName: "match_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      view_totals_global: {
        Row: {
          total_matches: number | null
        }
        Relationships: []
      }
      view_totals_yearly: {
        Row: {
          total_matches: number | null
          year: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_complete_match: {
        Args: {
          p_dark_players: string[]
          p_date: string
          p_field_id: string
          p_light_players: string[]
          p_result: string
        }
        Returns: string
      }
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

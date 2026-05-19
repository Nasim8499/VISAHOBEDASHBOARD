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
      activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          business_id: string | null
          created_at: string
          id: string
          target: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          business_id?: string | null
          created_at?: string
          id?: string
          target?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          business_id?: string | null
          created_at?: string
          id?: string
          target?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_history: {
        Row: {
          action: Database["public"]["Enums"]["approval_action"]
          approval_id: string
          business_id: string
          by_user: string | null
          by_user_name: string | null
          comment: string | null
          created_at: string
          id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["approval_action"]
          approval_id: string
          business_id: string
          by_user?: string | null
          by_user_name?: string | null
          comment?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          action?: Database["public"]["Enums"]["approval_action"]
          approval_id?: string
          business_id?: string
          by_user?: string | null
          by_user_name?: string | null
          comment?: string | null
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_history_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_history_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          business_id: string
          comment: string | null
          created_at: string
          created_by: string | null
          deliverable_id: string
          id: string
          status: Database["public"]["Enums"]["deliverable_status"]
        }
        Insert: {
          business_id: string
          comment?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_id: string
          id?: string
          status?: Database["public"]["Enums"]["deliverable_status"]
        }
        Update: {
          business_id?: string
          comment?: string | null
          created_at?: string
          created_by?: string | null
          deliverable_id?: string
          id?: string
          status?: Database["public"]["Enums"]["deliverable_status"]
        }
        Relationships: [
          {
            foreignKeyName: "approvals_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approvals_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
        ]
      }
      business_members: {
        Row: {
          business_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          budget: string | null
          category: string
          city: string | null
          color: string | null
          country: string | null
          cover: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          font: string | null
          id: string
          logo: string | null
          manager_name: string | null
          name: string
          palette: string[] | null
          progress: number
          slogan: string | null
          slug: string | null
          stage: string | null
          status: Database["public"]["Enums"]["business_status"]
          updated_at: string
        }
        Insert: {
          budget?: string | null
          category?: string
          city?: string | null
          color?: string | null
          country?: string | null
          cover?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          font?: string | null
          id?: string
          logo?: string | null
          manager_name?: string | null
          name: string
          palette?: string[] | null
          progress?: number
          slogan?: string | null
          slug?: string | null
          stage?: string | null
          status?: Database["public"]["Enums"]["business_status"]
          updated_at?: string
        }
        Update: {
          budget?: string | null
          category?: string
          city?: string | null
          color?: string | null
          country?: string | null
          cover?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          font?: string | null
          id?: string
          logo?: string | null
          manager_name?: string | null
          name?: string
          palette?: string[] | null
          progress?: number
          slogan?: string | null
          slug?: string | null
          stage?: string | null
          status?: Database["public"]["Enums"]["business_status"]
          updated_at?: string
        }
        Relationships: []
      }
      deliverables: {
        Row: {
          business_id: string
          created_at: string
          id: string
          progress: number
          status: Database["public"]["Enums"]["deliverable_status"]
          title: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          progress?: number
          status?: Database["public"]["Enums"]["deliverable_status"]
          title: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          progress?: number
          status?: Database["public"]["Enums"]["deliverable_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          business_id: string
          category: string | null
          created_at: string
          id: string
          name: string
          path: string
          size_bytes: number | null
          status: string | null
          uploaded_by: string | null
        }
        Insert: {
          business_id: string
          category?: string | null
          created_at?: string
          id?: string
          name: string
          path: string
          size_bytes?: number | null
          status?: string | null
          uploaded_by?: string | null
        }
        Update: {
          business_id?: string
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          path?: string
          size_bytes?: number | null
          status?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          agenda: string | null
          business_id: string
          created_at: string
          created_by: string | null
          id: string
          scheduled_at: string
          title: string
          type: string
        }
        Insert: {
          agenda?: string | null
          business_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          scheduled_at: string
          title: string
          type?: string
        }
        Update: {
          agenda?: string | null
          business_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          scheduled_at?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          business_id: string
          created_at: string
          id: string
          internal: boolean
          sender_id: string | null
          sender_name: string | null
        }
        Insert: {
          body: string
          business_id: string
          created_at?: string
          id?: string
          internal?: boolean
          sender_id?: string | null
          sender_name?: string | null
        }
        Update: {
          body?: string
          business_id?: string
          created_at?: string
          id?: string
          internal?: boolean
          sender_id?: string | null
          sender_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee_name: string | null
          business_id: string
          created_at: string
          due_date: string | null
          id: string
          priority: string
          status: Database["public"]["Enums"]["task_status"]
          title: string
        }
        Insert: {
          assignee_name?: string | null
          business_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          priority?: string
          status?: Database["public"]["Enums"]["task_status"]
          title: string
        }
        Update: {
          assignee_name?: string | null
          business_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          priority?: string
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      is_business_member: {
        Args: { _business_id: string; _user_id: string }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "employee" | "client"
      approval_action:
        | "submitted"
        | "approved"
        | "revision_requested"
        | "rejected"
        | "commented"
      business_status: "active" | "paused" | "completed"
      deliverable_status:
        | "Not Started"
        | "In Progress"
        | "Waiting Client Approval"
        | "Revision Requested"
        | "Completed"
        | "Rejected"
      task_status:
        | "Backlog"
        | "To Do"
        | "In Progress"
        | "Waiting Client Approval"
        | "Revision Requested"
        | "Completed"
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
      app_role: ["super_admin", "employee", "client"],
      approval_action: [
        "submitted",
        "approved",
        "revision_requested",
        "rejected",
        "commented",
      ],
      business_status: ["active", "paused", "completed"],
      deliverable_status: [
        "Not Started",
        "In Progress",
        "Waiting Client Approval",
        "Revision Requested",
        "Completed",
        "Rejected",
      ],
      task_status: [
        "Backlog",
        "To Do",
        "In Progress",
        "Waiting Client Approval",
        "Revision Requested",
        "Completed",
      ],
    },
  },
} as const

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
      beneficiaire_absences: {
        Row: {
          beneficiaire_id: string
          commentaire: string | null
          created_at: string
          date_debut: string
          date_fin: string
          id: string
          motif: string
        }
        Insert: {
          beneficiaire_id: string
          commentaire?: string | null
          created_at?: string
          date_debut: string
          date_fin: string
          id?: string
          motif?: string
        }
        Update: {
          beneficiaire_id?: string
          commentaire?: string | null
          created_at?: string
          date_debut?: string
          date_fin?: string
          id?: string
          motif?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaire_absences_beneficiaire_id_fkey"
            columns: ["beneficiaire_id"]
            isOneToOne: false
            referencedRelation: "beneficiaires"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiaire_entourage: {
        Row: {
          adresse: string | null
          beneficiaire_id: string
          created_at: string
          email: string | null
          id: string
          lien_parente: string | null
          nom: string
          personne_confiance: boolean
          personne_urgence: boolean
          prenom: string
          telephone_fixe: string | null
          telephone_mobile: string | null
        }
        Insert: {
          adresse?: string | null
          beneficiaire_id: string
          created_at?: string
          email?: string | null
          id?: string
          lien_parente?: string | null
          nom: string
          personne_confiance?: boolean
          personne_urgence?: boolean
          prenom: string
          telephone_fixe?: string | null
          telephone_mobile?: string | null
        }
        Update: {
          adresse?: string | null
          beneficiaire_id?: string
          created_at?: string
          email?: string | null
          id?: string
          lien_parente?: string | null
          nom?: string
          personne_confiance?: boolean
          personne_urgence?: boolean
          prenom?: string
          telephone_fixe?: string | null
          telephone_mobile?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaire_entourage_beneficiaire_id_fkey"
            columns: ["beneficiaire_id"]
            isOneToOne: false
            referencedRelation: "beneficiaires"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiaire_prises_en_charge: {
        Row: {
          beneficiaire_id: string
          created_at: string
          date_debut: string
          date_fin: string | null
          heures_dimanches_feries: number
          heures_normales: number
          id: string
          nb_heures: number
          nb_heures_restant: number
          organisme: string | null
          service: string | null
        }
        Insert: {
          beneficiaire_id: string
          created_at?: string
          date_debut: string
          date_fin?: string | null
          heures_dimanches_feries?: number
          heures_normales?: number
          id?: string
          nb_heures?: number
          nb_heures_restant?: number
          organisme?: string | null
          service?: string | null
        }
        Update: {
          beneficiaire_id?: string
          created_at?: string
          date_debut?: string
          date_fin?: string | null
          heures_dimanches_feries?: number
          heures_normales?: number
          id?: string
          nb_heures?: number
          nb_heures_restant?: number
          organisme?: string | null
          service?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaire_prises_en_charge_beneficiaire_id_fkey"
            columns: ["beneficiaire_id"]
            isOneToOne: false
            referencedRelation: "beneficiaires"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiaires: {
        Row: {
          adresse: string | null
          allergies: string | null
          civilite: string | null
          client: string | null
          code: string
          date_naissance: string | null
          etat: string
          gir: string | null
          id: string
          medecin_traitant: string | null
          nom: string
          numero_ss: string | null
          pathologies: string | null
          prenom: string
          secteur: string | null
          service: string | null
          situation_familiale: string | null
          telephone: string | null
        }
        Insert: {
          adresse?: string | null
          allergies?: string | null
          civilite?: string | null
          client?: string | null
          code: string
          date_naissance?: string | null
          etat?: string
          gir?: string | null
          id?: string
          medecin_traitant?: string | null
          nom: string
          numero_ss?: string | null
          pathologies?: string | null
          prenom: string
          secteur?: string | null
          service?: string | null
          situation_familiale?: string | null
          telephone?: string | null
        }
        Update: {
          adresse?: string | null
          allergies?: string | null
          civilite?: string | null
          client?: string | null
          code?: string
          date_naissance?: string | null
          etat?: string
          gir?: string | null
          id?: string
          medecin_traitant?: string | null
          nom?: string
          numero_ss?: string | null
          pathologies?: string | null
          prenom?: string
          secteur?: string | null
          service?: string | null
          situation_familiale?: string | null
          telephone?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          code: string
          date_creation: string
          etat: string
          id: string
          nom: string
        }
        Insert: {
          code: string
          date_creation?: string
          etat?: string
          id?: string
          nom: string
        }
        Update: {
          code?: string
          date_creation?: string
          etat?: string
          id?: string
          nom?: string
        }
        Relationships: []
      }
      devis: {
        Row: {
          beneficiaire_id: string | null
          beneficiaire_nom: string
          code: string
          created_at: string
          date_creation: string
          date_validite: string
          id: string
          montant_total: number
          notes: string | null
          statut: string
          updated_at: string
        }
        Insert: {
          beneficiaire_id?: string | null
          beneficiaire_nom: string
          code: string
          created_at?: string
          date_creation?: string
          date_validite: string
          id?: string
          montant_total?: number
          notes?: string | null
          statut?: string
          updated_at?: string
        }
        Update: {
          beneficiaire_id?: string | null
          beneficiaire_nom?: string
          code?: string
          created_at?: string
          date_creation?: string
          date_validite?: string
          id?: string
          montant_total?: number
          notes?: string | null
          statut?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "devis_beneficiaire_id_fkey"
            columns: ["beneficiaire_id"]
            isOneToOne: false
            referencedRelation: "beneficiaires"
            referencedColumns: ["id"]
          },
        ]
      }
      devis_lignes: {
        Row: {
          created_at: string
          description: string | null
          devis_id: string
          duree_heures: number
          frequence: string | null
          id: string
          montant: number
          service: string
          tarif_horaire: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          devis_id: string
          duree_heures?: number
          frequence?: string | null
          id?: string
          montant?: number
          service: string
          tarif_horaire?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          devis_id?: string
          duree_heures?: number
          frequence?: string | null
          id?: string
          montant?: number
          service?: string
          tarif_horaire?: number
        }
        Relationships: [
          {
            foreignKeyName: "devis_lignes_devis_id_fkey"
            columns: ["devis_id"]
            isOneToOne: false
            referencedRelation: "devis"
            referencedColumns: ["id"]
          },
        ]
      }
      employes: {
        Row: {
          civilite: string | null
          code: string
          contrat: string | null
          date_embauche: string | null
          etat: string
          id: string
          nom: string
          poste: string | null
          prenom: string
          service: string | null
          telephone: string | null
        }
        Insert: {
          civilite?: string | null
          code: string
          contrat?: string | null
          date_embauche?: string | null
          etat?: string
          id?: string
          nom: string
          poste?: string | null
          prenom: string
          service?: string | null
          telephone?: string | null
        }
        Update: {
          civilite?: string | null
          code?: string
          contrat?: string | null
          date_embauche?: string | null
          etat?: string
          id?: string
          nom?: string
          poste?: string | null
          prenom?: string
          service?: string | null
          telephone?: string | null
        }
        Relationships: []
      }
      factures: {
        Row: {
          beneficiaire: string
          code: string
          id: string
          montant_ht: number
          montant_ttc: number
          periode: string
          statut: string
          tva: number
        }
        Insert: {
          beneficiaire: string
          code: string
          id?: string
          montant_ht?: number
          montant_ttc?: number
          periode: string
          statut?: string
          tva?: number
        }
        Update: {
          beneficiaire?: string
          code?: string
          id?: string
          montant_ht?: number
          montant_ttc?: number
          periode?: string
          statut?: string
          tva?: number
        }
        Relationships: []
      }
      planning_events: {
        Row: {
          beneficiaire: string
          code: string
          date: string
          debut: string
          debut_reel: string | null
          employe: string
          fin: string
          fin_reelle: string | null
          id: string
          statut: string
        }
        Insert: {
          beneficiaire: string
          code: string
          date: string
          debut: string
          debut_reel?: string | null
          employe: string
          fin: string
          fin_reelle?: string | null
          id?: string
          statut?: string
        }
        Update: {
          beneficiaire?: string
          code?: string
          date?: string
          debut?: string
          debut_reel?: string | null
          employe?: string
          fin?: string
          fin_reelle?: string | null
          id?: string
          statut?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      secteurs: {
        Row: {
          code: string
          etat: string
          id: string
          nb_beneficiaires: number
          nb_employes: number
          nom: string
          service: string | null
        }
        Insert: {
          code: string
          etat?: string
          id?: string
          nb_beneficiaires?: number
          nb_employes?: number
          nom: string
          service?: string | null
        }
        Update: {
          code?: string
          etat?: string
          id?: string
          nb_beneficiaires?: number
          nb_employes?: number
          nom?: string
          service?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          client_id: string | null
          client_nom: string | null
          code: string
          date_creation: string
          etat: string
          id: string
          nom: string
          type: string
        }
        Insert: {
          client_id?: string | null
          client_nom?: string | null
          code: string
          date_creation?: string
          etat?: string
          id?: string
          nom: string
          type: string
        }
        Update: {
          client_id?: string | null
          client_nom?: string | null
          code?: string
          date_creation?: string
          etat?: string
          id?: string
          nom?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
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
    }
    Enums: {
      app_role:
        | "admin"
        | "responsable_service"
        | "responsable_secteur"
        | "coordinateur"
        | "comptable"
        | "rh"
        | "intervenant"
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
      app_role: [
        "admin",
        "responsable_service",
        "responsable_secteur",
        "coordinateur",
        "comptable",
        "rh",
        "intervenant",
      ],
    },
  },
} as const

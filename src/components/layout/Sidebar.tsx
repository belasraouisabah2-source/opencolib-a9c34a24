import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  CalendarDays,
  FileText,
  UserCog,
  Clock,
  ChevronDown,
  ChevronRight,
  Heart,
  MapPin,
} from "lucide-react";
import { useState } from "react";

const menuSections = [
  {
    label: "GÉNÉRAL",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Tableau de bord" },
    ],
  },
  {
    label: "GESTION",
    items: [
      { to: "/clients", icon: Building2, label: "Clients" },
      { to: "/services", icon: Briefcase, label: "Services" },
      { to: "/secteurs", icon: MapPin, label: "Secteurs" },
      { to: "/beneficiaires", icon: Heart, label: "Bénéficiaires" },
    ],
  },
  {
    label: "OPÉRATIONS",
    items: [
      { to: "/planning", icon: CalendarDays, label: "Planning" },
      { to: "/controle-heures", icon: Clock, label: "Contrôle des heures" },
    ],
  },
  {
    label: "RESSOURCES",
    items: [
      { to: "/employes", icon: UserCog, label: "Employés" },
      { to: "/facturation", icon: FileText, label: "Facturation" },
    ],
  },
];

const Sidebar = () => {
  const [collapsed] = useState<string[]>([]);
  const location = useLocation();

  return (
    <aside className="erp-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg" style={{ fontFamily: 'DM Sans' }}>O</span>
        </div>
        <div>
          <h1 className="text-sidebar-primary-foreground font-bold text-lg leading-none" style={{ fontFamily: 'DM Sans' }}>
            OpenColib
          </h1>
          <p className="text-xs text-sidebar-foreground/60 mt-0.5">Aide à domicile</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {menuSections.map((section) => {
          const isCollapsed = collapsed.includes(section.label);
          return (
            <div key={section.label}>
              <button
                className="flex items-center gap-1 px-2 mb-2 text-[10px] font-semibold tracking-widest text-sidebar-foreground/50 uppercase w-full hover:text-sidebar-foreground/70 transition-colors"
              >
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {section.label}
              </button>
              {!isCollapsed && (
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.to;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-primary/20"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`}
                      >
                        <item.icon className="w-4.5 h-4.5 shrink-0" />
                        {item.label}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <Users className="w-4 h-4 text-sidebar-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-primary-foreground truncate">Admin</p>
            <p className="text-[10px] text-sidebar-foreground/50">Administrateur</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const Topbar = () => {
  return (
    <header className="erp-topbar">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un bénéficiaire, employé, client..."
            className="pl-9 bg-secondary border-0 h-9 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
        </button>
        <div className="w-px h-8 bg-border" />
        <span className="text-sm text-muted-foreground">Service Paris Nord</span>
      </div>
    </header>
  );
};

export default Topbar;

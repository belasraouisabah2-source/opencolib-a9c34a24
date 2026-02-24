export const clients = [
  { id: "CL001", nom: "ADMR Île-de-France", dateCreation: "2024-01-15", etat: "Actif" },
  { id: "CL002", nom: "UNA Paris", dateCreation: "2024-02-20", etat: "Actif" },
  { id: "CL003", nom: "ADHAP Services Lyon", dateCreation: "2024-03-10", etat: "Actif" },
  { id: "CL004", nom: "Domidom Marseille", dateCreation: "2023-11-05", etat: "Archivé" },
  { id: "CL005", nom: "O2 Care Services", dateCreation: "2024-04-18", etat: "Actif" },
];

export const services = [
  { id: "SV001", nom: "SAAD Paris Nord", client: "ADMR Île-de-France", type: "SAD", etat: "Activé", dateCreation: "2024-01-20" },
  { id: "SV002", nom: "SSIAD Paris Sud", client: "ADMR Île-de-France", type: "SSIAD", etat: "Activé", dateCreation: "2024-01-25" },
  { id: "SV003", nom: "SAAD Lyon Centre", client: "ADHAP Services Lyon", type: "SAD", etat: "Activé", dateCreation: "2024-03-15" },
  { id: "SV004", nom: "SPASAD Marseille", client: "Domidom Marseille", type: "SPASAD", etat: "Archivé", dateCreation: "2023-12-01" },
  { id: "SV005", nom: "SAAD Paris Est", client: "UNA Paris", type: "SAD", etat: "Activé", dateCreation: "2024-05-10" },
];

export const beneficiaires = [
  { id: "BN001", civilite: "Mme", nom: "DUPONT", prenom: "Marie", client: "ADMR Île-de-France", service: "SAAD Paris Nord", dateNaissance: "1942-05-12", adresse: "15 rue de la Paix, 75002 Paris", telephone: "01 42 33 44 55", etat: "Actif" },
  { id: "BN002", civilite: "M.", nom: "MARTIN", prenom: "Jean", client: "ADMR Île-de-France", service: "SSIAD Paris Sud", dateNaissance: "1938-09-23", adresse: "8 avenue Victor Hugo, 75016 Paris", telephone: "01 45 67 89 10", etat: "Actif" },
  { id: "BN003", civilite: "Mme", nom: "BERNARD", prenom: "Suzanne", client: "ADHAP Services Lyon", service: "SAAD Lyon Centre", dateNaissance: "1945-03-07", adresse: "22 rue de la République, 69001 Lyon", telephone: "04 72 33 44 55", etat: "Actif" },
  { id: "BN004", civilite: "M.", nom: "PETIT", prenom: "Robert", client: "UNA Paris", service: "SAAD Paris Est", dateNaissance: "1940-11-30", adresse: "5 boulevard Voltaire, 75011 Paris", telephone: "01 43 55 66 77", etat: "Actif" },
  { id: "BN005", civilite: "Mme", nom: "MOREAU", prenom: "Françoise", client: "O2 Care Services", service: "SAAD Paris Nord", dateNaissance: "1935-07-18", adresse: "30 rue du Faubourg, 75010 Paris", telephone: "01 48 77 88 99", etat: "Archivé" },
];

export const employes = [
  { id: "EM001", civilite: "Mme", nom: "LEFEBVRE", prenom: "Sophie", service: "SAAD Paris Nord", poste: "Aide à domicile", contrat: "CDI", dateEmbauche: "2022-03-01", telephone: "06 12 34 56 78", etat: "Actif" },
  { id: "EM002", civilite: "M.", nom: "GARCIA", prenom: "Carlos", service: "SSIAD Paris Sud", poste: "Aide-soignant", contrat: "CDI", dateEmbauche: "2021-09-15", telephone: "06 23 45 67 89", etat: "Actif" },
  { id: "EM003", civilite: "Mme", nom: "ROUX", prenom: "Isabelle", service: "SAAD Lyon Centre", poste: "Aide à domicile", contrat: "CDD", dateEmbauche: "2024-01-10", telephone: "06 34 56 78 90", etat: "Actif" },
  { id: "EM004", civilite: "M.", nom: "FOURNIER", prenom: "Pierre", service: "SAAD Paris Est", poste: "Auxiliaire de vie", contrat: "CDI", dateEmbauche: "2020-06-20", telephone: "06 45 67 89 01", etat: "Actif" },
  { id: "EM005", civilite: "Mme", nom: "VINCENT", prenom: "Claire", service: "SAAD Paris Nord", poste: "Coordinatrice", contrat: "CDI", dateEmbauche: "2019-04-01", telephone: "06 56 78 90 12", etat: "Actif" },
];

export const planningEvents = [
  { id: "PL001", employe: "LEFEBVRE Sophie", beneficiaire: "DUPONT Marie", date: "2026-02-24", debut: "08:00", fin: "10:00", statut: "Terminée", debutReel: "08:05", finReelle: "10:02" },
  { id: "PL002", employe: "LEFEBVRE Sophie", beneficiaire: "MOREAU Françoise", date: "2026-02-24", debut: "10:30", fin: "12:00", statut: "En cours", debutReel: "10:28", finReelle: null },
  { id: "PL003", employe: "GARCIA Carlos", beneficiaire: "MARTIN Jean", date: "2026-02-24", debut: "08:00", fin: "09:30", statut: "Terminée", debutReel: "07:58", finReelle: "09:35" },
  { id: "PL004", employe: "GARCIA Carlos", beneficiaire: "PETIT Robert", date: "2026-02-24", debut: "14:00", fin: "16:00", statut: "Planifiée", debutReel: null, finReelle: null },
  { id: "PL005", employe: "ROUX Isabelle", beneficiaire: "BERNARD Suzanne", date: "2026-02-24", debut: "09:00", fin: "11:00", statut: "Planifiée", debutReel: null, finReelle: null },
  { id: "PL006", employe: "FOURNIER Pierre", beneficiaire: "PETIT Robert", date: "2026-02-24", debut: "08:30", fin: "10:30", statut: "Terminée", debutReel: "08:32", finReelle: "10:28" },
  { id: "PL007", employe: "LEFEBVRE Sophie", beneficiaire: "DUPONT Marie", date: "2026-02-25", debut: "08:00", fin: "10:00", statut: "Planifiée", debutReel: null, finReelle: null },
  { id: "PL008", employe: "GARCIA Carlos", beneficiaire: "MARTIN Jean", date: "2026-02-25", debut: "08:00", fin: "09:30", statut: "Planifiée", debutReel: null, finReelle: null },
];

export const dashboardStats = {
  beneficiairesActifs: 142,
  employesActifs: 68,
  interventionsJour: 87,
  heuresPlanifiees: 312,
  heuresRealisees: 298,
  tauxOccupation: 87,
  anomalies: 5,
  facturesImpayees: 12,
  chiffreAffairesMois: 185420,
};

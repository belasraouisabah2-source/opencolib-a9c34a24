import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface FactureData {
  code: string;
  beneficiaire: string;
  periode: string;
  date_emission: string;
  date_echeance: string | null;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  statut: string;
}

interface ContratData {
  code: string;
  beneficiaire_nom: string;
  date_debut: string;
  date_fin: string | null;
}

export function generateFacturePdf(facture: FactureData, contrat?: ContratData | null) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Header ──
  doc.setFillColor(30, 58, 82);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("FACTURE", 20, 25);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(facture.code, pageWidth - 20, 25, { align: "right" });

  // ── Infos section ──
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  let y = 55;

  doc.setTextColor(30, 58, 82);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Informations", 20, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);

  const infoLines: [string, string][] = [
    ["Bénéficiaire", facture.beneficiaire],
    ["Période", facture.periode],
    ["Date d'émission", formatDate(facture.date_emission)],
    ["Date d'échéance", facture.date_echeance ? formatDate(facture.date_echeance) : "—"],
    ["Statut", facture.statut],
  ];

  for (const [label, value] of infoLines) {
    doc.setTextColor(130, 130, 130);
    doc.text(label, 20, y);
    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "bold");
    doc.text(value, 80, y);
    doc.setFont("helvetica", "normal");
    y += 7;
  }

  // ── Contrat lié ──
  if (contrat) {
    y += 5;
    doc.setTextColor(30, 58, 82);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Contrat lié", 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`${contrat.code} — ${contrat.beneficiaire_nom}`, 20, y);
    y += 6;
    doc.text(`Du ${formatDate(contrat.date_debut)} au ${contrat.date_fin ? formatDate(contrat.date_fin) : "indéterminée"}`, 20, y);
    y += 6;
  }

  // ── Montants table ──
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [["Désignation", "Montant"]],
    body: [
      ["Montant HT", `${Number(facture.montant_ht).toFixed(2)} €`],
      ["TVA", `${Number(facture.tva).toFixed(2)} €`],
    ],
    foot: [["Total TTC", `${Number(facture.montant_ttc).toFixed(2)} €`]],
    styles: {
      fontSize: 10,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: [30, 58, 82],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    footStyles: {
      fillColor: [240, 245, 250],
      textColor: [30, 58, 82],
      fontStyle: "bold",
      fontSize: 12,
    },
    columnStyles: {
      1: { halign: "right" as const },
    },
    margin: { left: 20, right: 20 },
    theme: "grid" as const,
  });

  // ── Footer ──
  const finalY = (doc as any).lastAutoTable?.finalY ?? y + 50;
  const footerY = Math.min(finalY + 30, doc.internal.pageSize.getHeight() - 15);
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text("Document généré automatiquement — OpenColib", pageWidth / 2, footerY, { align: "center" });

  // Download
  doc.save(`Facture_${facture.code}.pdf`);
}

function formatDate(d: string): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return d;
  }
}

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function money(v) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return "-";
  return Number(v).toFixed(2);
}

function fmtDate(iso) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function fmtDateOnly(d) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return String(d);
  }
}

export function downloadInvoicePdf({
  reservation,
  billing,
  resort = {
    name: "Ocean View Resort",
    address: "Galle, Sri Lanka",
    email: "restinoceanview@gmail.com",
    phone: "",
  },
}) {
  if (!reservation || !billing) throw new Error("Missing reservation/billing.");

  const doc = new jsPDF("p", "mm", "a4");

  const pageW = doc.internal.pageSize.getWidth();
  const left = 14;
  const right = pageW - 14;

  // ===== Header =====
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(resort.name, left, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const headerLines = [
    resort.address,
    resort.email ? `Email: ${resort.email}` : "",
    resort.phone ? `Phone: ${resort.phone}` : "",
  ].filter(Boolean);

  doc.text(headerLines, left, 24);

  // Invoice badge (right)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("INVOICE", right, 18, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Invoice Date: ${fmtDateOnly(new Date())}`, right, 24, { align: "right" });
  doc.text(`Reservation No: ${reservation.reservationNo}`, right, 29, { align: "right" });

  // Line
  doc.setDrawColor(220);
  doc.line(left, 34, right, 34);

  // ===== Customer / Reservation Info =====
  const customerBoxY = 40;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("BILL TO", left, customerBoxY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    [
      billing.customerName || reservation.customerName || "-",
      billing.customerEmail || reservation.customerEmail || "-",
      billing.customerPhone || reservation.customerPhone || "-",
    ],
    left,
    customerBoxY + 6
  );

  doc.setFont("helvetica", "bold");
  doc.text("RESERVATION DETAILS", right, customerBoxY, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.text(
    [
      `Room Type: ${reservation.roomType || "-"}`,
      `Check-in: ${reservation.checkInDate ? String(reservation.checkInDate) : "-"}`,
      `Check-out: ${reservation.checkOutDate ? String(reservation.checkOutDate) : "-"}`,
      `Guests: Adults ${reservation.adults ?? "-"} / Children ${reservation.children ?? "-"}`,
      `Status: ${reservation.status || "-"}`,
    ],
    right,
    customerBoxY + 6,
    { align: "right" }
  );

  // ===== Charges Table =====
  const startY = 78;

  const currency = billing.currency || "LKR";
  const rate = billing.roomRatePerNight;
  const nights = billing.nights;

  const rows = [
    ["Room rate per night", `${currency} ${money(rate)}`],
    ["Nights", `${nights}`],
    ["Room subtotal", `${currency} ${money(billing.roomSubtotal)}`],
    [
      `Service charge (${Math.round((billing.serviceChargeRate || 0) * 100)}%)`,
      `${currency} ${money(billing.serviceChargeAmount)}`,
    ],
    [
      `Tax (${Math.round((billing.taxRate || 0) * 100)}%)`,
      `${currency} ${money(billing.taxAmount)}`,
    ],
    ["Discount", `- ${currency} ${money(billing.discountAmount)}`],
  ];

  autoTable(doc, {
    startY,
    head: [["Description", "Amount"]],
    body: rows,
    styles: { font: "helvetica", fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [17, 17, 17] }, // dark
    columnStyles: {
      0: { cellWidth: 120 },
      1: { halign: "right" },
    },
    theme: "striped",
  });

  const afterTableY = doc.lastAutoTable.finalY + 8;

  // ===== Total Box =====
  doc.setDrawColor(200);
  doc.roundedRect(right - 70, afterTableY, 70, 22, 2, 2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TOTAL", right - 64, afterTableY + 8);

  doc.setFontSize(14);
  doc.text(`${currency} ${money(billing.total)}`, right - 6, afterTableY + 16, { align: "right" });

  // ===== Notes / Footer =====
  const noteY = afterTableY + 30;

  if (billing.notes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("NOTES", left, noteY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(String(billing.notes), left, noteY + 6, { maxWidth: pageW - 28 });
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    `Generated: ${fmtDate(billing.updatedAt)} • Thank you for choosing ${resort.name}`,
    left,
    285
  );

  // filename
  const fileName = `Invoice_${reservation.reservationNo}.pdf`;
  doc.save(fileName);
}
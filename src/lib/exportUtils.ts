
"use client";

import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], fileName: string) => {
  // Create a new workbook and a worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

  // Customize column widths (optional)
  if(data.length > 0) {
    const cols = Object.keys(data[0]);
    const colWidths = cols.map(col => ({
      wch: Math.max(
        col.toString().length,
        ...data.map(row => row[col]?.toString().length ?? 0)
      ) + 2 // Add a little padding
    }));
    worksheet['!cols'] = colWidths;
  }


  // Generate the Excel file and trigger a download
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

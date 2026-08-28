import PptxGenJS from 'pptxgenjs';
import pptxgen from 'pptxgenjs';
import { TeamWsrData } from '../types/wsr';
import { calculateDynamicDateRange } from '../utils/dateUtils';

/**
 * Generates an executive PowerPoint (.pptx) deck matching the exact corporate WSR layout
 * provided by the user (Black header, Vibrant Cyan/Teal data rows, crisp white canvas, 16:9 widescreen).
 */
export async function generateWsrPptxDeck(
  teams: TeamWsrData[],
  reportTitle: string = 'Weekly Status Report (WSR)',
  overallDateRange: string = calculateDynamicDateRange(),
  managerName: string = 'Management Team'
): Promise<PptxGenJS> {
  const pptx = new PptxGenJS();

  // Define widescreen 16:9 layout (13.333 x 7.5 inches) so wide tables and headers never clip
  pptx.defineLayout({ name: 'WSR_16_9_WIDESCREEN', width: 13.333, height: 7.5 });
  pptx.layout = 'WSR_16_9_WIDESCREEN';
  pptx.author = 'OfficeHub360 AI WSR Bot';
  pptx.company = 'OfficeHub360 - VtabSquare';
  pptx.subject = 'Weekly Status Report';
  pptx.title = reportTitle;

  // Define corporate colors matching corporate theme
  const COLOR_HEADER_BG = '000000'; // Pure Black header
  const COLOR_HEADER_TEXT = 'FFFFFF';
  const COLOR_ROW_BG_1 = '0097A7'; // Vibrant Cyan / Teal row background
  const COLOR_ROW_BG_2 = '008BA3'; // Subtle contrast alternate
  const COLOR_TEXT = 'FFFFFF';
  const COLOR_TITLE = '111827';
  const COLOR_ACCENT_LINE = '0284C7';

  // Available canvas bounds for 13.333" wide by 7.5" high slide
  const SLIDE_WIDTH = 13.333;
  const MARGIN_LEFT = 0.6;
  const MARGIN_RIGHT = 0.6;
  const CONTENT_WIDTH = SLIDE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // 12.133 inches

  // ==========================================
  // SLIDE 1: Executive Cover Slide
  // ==========================================
  const coverSlide = pptx.addSlide();
  
  // Clean modern gradient / banner top
  coverSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.4,
    fill: { color: '0097A7' }
  });

  coverSlide.addText('OFFICEHUB360 • AUTOMATED WSR REPORT', {
    x: 0.8,
    y: 1.2,
    w: 11.5,
    h: 0.4,
    fontSize: 13,
    bold: true,
    color: '0097A7',
    charSpacing: 2
  });

  coverSlide.addText('Weekly Status Report', {
    x: 0.8,
    y: 1.6,
    w: 11.5,
    h: 1.1,
    fontSize: 38,
    bold: true,
    color: '0F172A',
    fontFace: 'Arial'
  });

  coverSlide.addText(`Performance, Timesheets & Task Velocity Deck`, {
    x: 0.8,
    y: 2.7,
    w: 11.5,
    h: 0.6,
    fontSize: 18,
    color: '475569',
    fontFace: 'Arial'
  });

  // Divider line
  coverSlide.addShape(pptx.ShapeType.line, {
    x: 0.8,
    y: 3.5,
    w: 11.7,
    h: 0,
    line: { color: 'CBD5E1', width: 1.5 }
  });

  // Metadata cards
  const totalEmployees = teams.reduce((acc, t) => acc + t.members.length, 0);
  const totalHours = teams.reduce(
    (acc, t) => acc + t.members.reduce((mAcc, m) => mAcc + m.totalHours, 0),
    0
  );
  const totalTasks = teams.reduce(
    (acc, t) => acc + t.members.reduce((mAcc, m) => mAcc + m.tasksCompleted, 0),
    0
  );

  // Card 1
  coverSlide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8,
    y: 3.9,
    w: 3.6,
    h: 2.2,
    fill: { color: 'F1F5F9' },
    line: { color: 'E2E8F0', width: 1 },
    rectRadius: 0.1
  });
  coverSlide.addText('REPORTING PERIOD', {
    x: 1.1,
    y: 4.1,
    w: 3.0,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: '64748B'
  });
  coverSlide.addText(overallDateRange, {
    x: 1.1,
    y: 4.5,
    w: 3.0,
    h: 0.6,
    fontSize: 16,
    bold: true,
    color: '0F172A'
  });
  coverSlide.addText(`Generated for ${managerName}`, {
    x: 1.1,
    y: 5.2,
    w: 3.0,
    h: 0.4,
    fontSize: 11,
    color: '475569'
  });

  // Card 2
  coverSlide.addShape(pptx.ShapeType.roundRect, {
    x: 4.8,
    y: 3.9,
    w: 3.6,
    h: 2.2,
    fill: { color: 'F1F5F9' },
    line: { color: 'E2E8F0', width: 1 },
    rectRadius: 0.1
  });
  coverSlide.addText('TEAMS & MEMBERS', {
    x: 5.1,
    y: 4.1,
    w: 3.0,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: '64748B'
  });
  coverSlide.addText(`${teams.length} Teams • ${totalEmployees} Members`, {
    x: 5.1,
    y: 4.5,
    w: 3.0,
    h: 0.6,
    fontSize: 16,
    bold: true,
    color: '0F172A'
  });
  coverSlide.addText(`${totalHours.toFixed(1)} Total Hours Logged`, {
    x: 5.1,
    y: 5.2,
    w: 3.0,
    h: 0.4,
    fontSize: 11,
    color: '0097A7',
    bold: true
  });

  // Card 3
  coverSlide.addShape(pptx.ShapeType.roundRect, {
    x: 8.8,
    y: 3.9,
    w: 3.7,
    h: 2.2,
    fill: { color: 'F1F5F9' },
    line: { color: 'E2E8F0', width: 1 },
    rectRadius: 0.1
  });
  coverSlide.addText('DELIVERY VELOCITY', {
    x: 9.1,
    y: 4.1,
    w: 3.0,
    h: 0.3,
    fontSize: 10,
    bold: true,
    color: '64748B'
  });
  coverSlide.addText(`${totalTasks} Tasks Completed`, {
    x: 9.1,
    y: 4.5,
    w: 3.0,
    h: 0.6,
    fontSize: 16,
    bold: true,
    color: '059669'
  });
  coverSlide.addText('Supabase Live Sync Active', {
    x: 9.1,
    y: 5.2,
    w: 3.0,
    h: 0.4,
    fontSize: 11,
    color: '475569'
  });

  // Bottom footer
  coverSlide.addText('Confidential • OfficeHub360 Weekly Analytics', {
    x: 0.8,
    y: 6.8,
    w: 11.7,
    h: 0.3,
    fontSize: 9,
    color: '94A3B8'
  });

  // ==========================================
  // SLIDES 2..N: Team WSR Slides (Exact image match)
  // ==========================================
  teams.forEach((team) => {
    const slide = pptx.addSlide();

    // 1. Slide Title Header: Left side "WSR – <Team Name>"
    slide.addText(`WSR – ${team.name}`, {
      x: MARGIN_LEFT,
      y: 0.45,
      w: 6.8,
      h: 0.6,
      fontSize: 24,
      bold: true,
      color: COLOR_TITLE,
      fontFace: 'Arial'
    });

    // 2. Date Range: Right side e.g. "10th Aug – 15th Aug 2026" (or dynamic)
    slide.addText(team.dateRange, {
      x: 7.2,
      y: 0.45,
      w: CONTENT_WIDTH - (7.2 - MARGIN_LEFT),
      h: 0.6,
      fontSize: 20,
      bold: true,
      color: COLOR_TITLE,
      align: 'right',
      fontFace: 'Arial'
    });

    // 3. Underline Accent Line matching images
    slide.addShape(pptx.ShapeType.line, {
      x: MARGIN_LEFT,
      y: 1.15,
      w: CONTENT_WIDTH,
      h: 0,
      line: { color: COLOR_ACCENT_LINE, width: 2 }
    });

    // 4. Construct Table Data exactly matching the row hierarchy in images
    const memberCount = Math.max(1, team.members.length);
    const dataFontSize = memberCount <= 4 ? 12 : memberCount <= 6 ? 10.5 : 9;
    const headerFontSize = memberCount <= 4 ? 13 : memberCount <= 6 ? 11.5 : 9.5;
    const cellMargin: [number, number, number, number] =
      memberCount <= 4 ? [0.08, 0.12, 0.08, 0.12] : [0.06, 0.06, 0.06, 0.06];

    // Header Row: Name | Member 1 | Member 2 | ...
    const headerRow: PptxGenJS.TableCell[] = [
      {
        text: 'Name',
        options: {
          bold: true,
          fill: { color: COLOR_HEADER_BG },
          color: COLOR_HEADER_TEXT,
          align: 'left' as const,
          fontSize: headerFontSize,
          fontFace: 'Arial'
        }
      },
      ...team.members.map((m) => ({
        text: m.displayName || m.name.split(' ')[0],
        options: {
          bold: true,
          fill: { color: COLOR_HEADER_BG },
          color: COLOR_HEADER_TEXT,
          align: 'left' as const,
          fontSize: headerFontSize,
          fontFace: 'Arial'
        }
      }))
    ];

    // Helper for data rows
    const createDataRow = (
      rowLabel: string,
      getValue: (m: typeof team.members[0]) => string | number,
      bgHex: string = COLOR_ROW_BG_1
    ): PptxGenJS.TableCell[] => [
      {
        text: rowLabel,
        options: {
          fill: { color: bgHex },
          color: COLOR_TEXT,
          align: 'left' as const,
          fontSize: dataFontSize,
          fontFace: 'Arial',
          bold: true
        }
      },
      ...team.members.map((m) => {
        const val = getValue(m);
        const textVal = typeof val === 'number' 
          ? (Number.isInteger(val) ? val.toString() : val.toFixed(2)) 
          : val.toString();

        return {
          text: textVal,
          options: {
            fill: { color: bgHex },
            color: COLOR_TEXT,
            align: 'left' as const,
            fontSize: dataFontSize,
            fontFace: 'Arial'
          }
        };
      })
    ];

    const tableRows: PptxGenJS.TableCell[][] = [
      headerRow,
      createDataRow('Total Hours', (m) => m.totalHours, COLOR_ROW_BG_1),
      createDataRow('Productive Hours', (m) => m.productiveHours, COLOR_ROW_BG_2),
      createDataRow('Non – Productive Hours', (m) => m.nonProductiveHours, COLOR_ROW_BG_1),
      createDataRow('Tasks Completed', (m) => m.tasksCompleted, COLOR_ROW_BG_2),
      createDataRow('Carry Forward', (m) => m.carryForward, COLOR_ROW_BG_1),
      createDataRow('Billable Hours', (m) => m.billableHours, COLOR_ROW_BG_2),
      createDataRow('Non – Billable Hours', (m) => m.nonBillableHours, COLOR_ROW_BG_1),
      createDataRow('Holidays Availed', (m) => m.holidaysAvailed, COLOR_ROW_BG_2)
    ];

    // Calculate dynamic column widths: first column 2.5 inches, remaining split equally
    const labelColWidth = memberCount <= 4 ? 2.6 : 2.3;
    const memberColWidth = (CONTENT_WIDTH - labelColWidth) / memberCount;
    const colWidths = [labelColWidth, ...team.members.map(() => memberColWidth)];

    // Add table to slide
    slide.addTable(tableRows, {
      x: MARGIN_LEFT,
      y: 1.5,
      w: CONTENT_WIDTH,
      colW: colWidths,
      border: { pt: 1, color: '006064' },
      margin: cellMargin
    });

    // Subtle bottom branding
    slide.addText(`OfficeHub360 WSR • ${team.name} • Confidential`, {
      x: MARGIN_LEFT,
      y: 6.9,
      w: CONTENT_WIDTH,
      h: 0.3,
      fontSize: 9,
      color: '94A3B8'
    });
  });

  // ==========================================
  // FINAL SLIDE: Executive KPI Summary & AI Highlights
  // ==========================================
  const summarySlide = pptx.addSlide();
  summarySlide.addText('Executive Summary & Productivity Index', {
    x: MARGIN_LEFT,
    y: 0.45,
    w: 8.0,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: COLOR_TITLE,
    fontFace: 'Arial'
  });

  summarySlide.addShape(pptx.ShapeType.line, {
    x: MARGIN_LEFT,
    y: 1.15,
    w: CONTENT_WIDTH,
    h: 0,
    line: { color: COLOR_ACCENT_LINE, width: 2 }
  });

  // Summary Table: Team-by-Team Totals
  const summaryHeader: PptxGenJS.TableCell[] = [
    { text: 'Team Name', options: { fill: { color: '000000' }, color: 'FFFFFF', bold: true, fontSize: 12 } },
    { text: 'Members', options: { fill: { color: '000000' }, color: 'FFFFFF', bold: true, fontSize: 12 } },
    { text: 'Total Hours', options: { fill: { color: '000000' }, color: 'FFFFFF', bold: true, fontSize: 12 } },
    { text: 'Productive Hrs', options: { fill: { color: '000000' }, color: 'FFFFFF', bold: true, fontSize: 12 } },
    { text: 'Productivity %', options: { fill: { color: '000000' }, color: 'FFFFFF', bold: true, fontSize: 12 } },
    { text: 'Tasks Done', options: { fill: { color: '000000' }, color: 'FFFFFF', bold: true, fontSize: 12 } },
    { text: 'Carry Fwd', options: { fill: { color: '000000' }, color: 'FFFFFF', bold: true, fontSize: 12 } },
    { text: 'Billable Hrs', options: { fill: { color: '000000' }, color: 'FFFFFF', bold: true, fontSize: 12 } }
  ];

  const summaryRows: PptxGenJS.TableCell[][] = [
    summaryHeader,
    ...teams.map((t, idx) => {
      const tTotal = t.members.reduce((acc, m) => acc + m.totalHours, 0);
      const tProd = t.members.reduce((acc, m) => acc + m.productiveHours, 0);
      const tTasks = t.members.reduce((acc, m) => acc + m.tasksCompleted, 0);
      const tCarry = t.members.reduce((acc, m) => acc + m.carryForward, 0);
      const tBill = t.members.reduce((acc, m) => acc + m.billableHours, 0);
      const prodPercent = tTotal > 0 ? ((tProd / tTotal) * 100).toFixed(1) + '%' : '0%';
      const rowBg = idx % 2 === 0 ? '0097A7' : '008BA3';

      return [
        { text: t.name, options: { fill: { color: rowBg }, color: 'FFFFFF', bold: true, fontSize: 11 } },
        { text: t.members.length.toString(), options: { fill: { color: rowBg }, color: 'FFFFFF', fontSize: 11 } },
        { text: tTotal.toFixed(1), options: { fill: { color: rowBg }, color: 'FFFFFF', fontSize: 11 } },
        { text: tProd.toFixed(1), options: { fill: { color: rowBg }, color: 'FFFFFF', fontSize: 11 } },
        { text: prodPercent, options: { fill: { color: rowBg }, color: 'FFFFFF', bold: true, fontSize: 11 } },
        { text: tTasks.toString(), options: { fill: { color: rowBg }, color: 'FFFFFF', fontSize: 11 } },
        { text: tCarry.toString(), options: { fill: { color: rowBg }, color: 'FFFFFF', fontSize: 11 } },
        { text: tBill.toFixed(1), options: { fill: { color: rowBg }, color: 'FFFFFF', fontSize: 11 } }
      ];
    })
  ];

  summarySlide.addTable(summaryRows, {
    x: MARGIN_LEFT,
    y: 1.5,
    w: CONTENT_WIDTH,
    colW: [2.333, 1.2, 1.4, 1.4, 1.4, 1.4, 1.4, 1.6],
    border: { pt: 1, color: '006064' },
    margin: [0.08, 0.1, 0.08, 0.1]
  });

  return pptx;
}

/**
 * Trigger immediate download of PPTX file in browser
 */
export async function downloadWsrPptx(
  teams: TeamWsrData[],
  fileName: string = 'OfficeHub360_Weekly_WSR_Report.pptx',
  reportTitle?: string,
  dateRange?: string
): Promise<void> {
  const pptx = await generateWsrPptxDeck(teams, reportTitle, dateRange);
  await pptx.writeFile({ fileName });
}

/**
 * Generate PPTX base64 string for direct email attachment
 */
export async function getWsrPptxBase64(
  teams: TeamWsrData[],
  reportTitle?: string,
  dateRange?: string
): Promise<string> {
  const pptx = await generateWsrPptxDeck(teams, reportTitle, dateRange);
  const base64Data = (await pptx.write({ outputType: 'base64' })) as string;
  return base64Data;
}


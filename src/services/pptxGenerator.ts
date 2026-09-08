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

  // Define corporate colors matching the new dark navy theme
  const COLOR_BG = '0D1B2A';
  const COLOR_HEADER_BG = '0C2233';
  const COLOR_HEADER_TEXT = '7DD3E0';
  const COLOR_ROW_BG_1 = '081F33'; // slightly transparent teal look
  const COLOR_ROW_BG_2 = '0C2233'; 
  const COLOR_TEXT = 'D4EEF5';
  const COLOR_TITLE = 'E8F4F8';
  const COLOR_ACCENT_LINE = '00C6D7';
  const COLOR_LABEL = 'A5E4EF';

  // Available canvas bounds for 13.333" wide by 7.5" high slide
  const SLIDE_WIDTH = 13.333;
  const MARGIN_LEFT = 0.6;
  const MARGIN_RIGHT = 0.6;
  const CONTENT_WIDTH = SLIDE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

  // ==========================================
  // SLIDE 1: Executive Cover Slide
  // ==========================================
  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: COLOR_BG };
  
  // Top gradient/accent bar (simulated with solid teal)
  coverSlide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.08, fill: { color: '00C6D7' }
  });

  // Badge
  coverSlide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.0, w: 3.5, h: 0.4,
    fill: { color: '0097A7', transparency: 80 },
    line: { color: '0097A7', width: 1 },
    rectRadius: 0.2
  });
  coverSlide.addText('● OFFICEHUB360 • EXECUTIVE WSR', {
    x: 0.8, y: 1.0, w: 3.5, h: 0.4,
    fontSize: 10, bold: true, color: '67D5E3', align: 'center', fontFace: 'Arial'
  });

  coverSlide.addText('Weekly Status Report', {
    x: 0.8, y: 1.6, w: 11.5, h: 1.1,
    fontSize: 42, bold: true, color: COLOR_TITLE, fontFace: 'Arial'
  });

  coverSlide.addText('Team Performance, Timesheets & Task Velocity Deck', {
    x: 0.8, y: 2.7, w: 11.5, h: 0.6,
    fontSize: 16, color: '4DB6C9', fontFace: 'Arial'
  });

  // Divider line
  coverSlide.addShape(pptx.ShapeType.rect, {
    x: 0.8, y: 3.4, w: 0.8, h: 0.05, fill: { color: '00C6D7' }
  });

  // Metadata cards
  const totalEmployees = teams.reduce((acc, t) => acc + t.members.length, 0);
  const totalHours = teams.reduce((acc, t) => acc + t.members.reduce((mAcc, m) => mAcc + m.totalHours, 0), 0);
  const totalTasks = teams.reduce((acc, t) => acc + t.members.reduce((mAcc, m) => mAcc + m.tasksCompleted, 0), 0);

  // Card 1
  coverSlide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 4.0, w: 3.6, h: 2.0,
    fill: { color: '0097A7', transparency: 88 },
    line: { color: '0097A7', width: 1, transparency: 70 },
    rectRadius: 0.1
  });
  coverSlide.addText('PERIOD', {
    x: 1.1, y: 4.2, w: 3.0, h: 0.3, fontSize: 10, bold: true, color: '4DB6C9'
  });
  coverSlide.addText(overallDateRange, {
    x: 1.1, y: 4.6, w: 3.0, h: 0.5, fontSize: 14, bold: true, color: 'CCE9F0'
  });
  coverSlide.addText('Current Reporting Cycle', {
    x: 1.1, y: 5.2, w: 3.0, h: 0.4, fontSize: 10, color: '2D8A99'
  });

  // Card 2
  coverSlide.addShape(pptx.ShapeType.roundRect, {
    x: 4.8, y: 4.0, w: 3.6, h: 2.0,
    fill: { color: '0097A7', transparency: 88 },
    line: { color: '0097A7', width: 1, transparency: 70 },
    rectRadius: 0.1
  });
  coverSlide.addText('COVERAGE', {
    x: 5.1, y: 4.2, w: 3.0, h: 0.3, fontSize: 10, bold: true, color: '4DB6C9'
  });
  coverSlide.addText(`${teams.length} Teams • ${totalEmployees} Engineers`, {
    x: 5.1, y: 4.6, w: 3.0, h: 0.5, fontSize: 14, bold: true, color: 'CCE9F0'
  });
  coverSlide.addText(`${totalHours.toFixed(1)} Total Hours Logged`, {
    x: 5.1, y: 5.2, w: 3.0, h: 0.4, fontSize: 10, color: '00C6D7', bold: true
  });

  // Card 3
  coverSlide.addShape(pptx.ShapeType.roundRect, {
    x: 8.8, y: 4.0, w: 3.7, h: 2.0,
    fill: { color: '10B981', transparency: 90 },
    line: { color: '10B981', width: 1, transparency: 70 },
    rectRadius: 0.1
  });
  coverSlide.addText('VELOCITY', {
    x: 9.1, y: 4.2, w: 3.0, h: 0.3, fontSize: 10, bold: true, color: '34D399'
  });
  coverSlide.addText(`${totalTasks} Tasks Completed`, {
    x: 9.1, y: 4.6, w: 3.0, h: 0.5, fontSize: 14, bold: true, color: 'A7F3D0'
  });
  coverSlide.addText('Supabase Live Sync Active', {
    x: 9.1, y: 5.2, w: 3.0, h: 0.4, fontSize: 10, color: '059669'
  });

  // Bottom footer
  coverSlide.addShape(pptx.ShapeType.line, {
    x: 0.8, y: 6.8, w: 11.7, h: 0, line: { color: '0097A7', width: 1, transparency: 80 }
  });
  coverSlide.addText('Confidential • Prepared for Engineering Leadership', {
    x: 0.8, y: 6.9, w: 5.0, h: 0.3, fontSize: 9, color: '2D8A99', bold: true
  });
  coverSlide.addText('OfficeHub360 WSR Engine', {
    x: 7.5, y: 6.9, w: 5.0, h: 0.3, fontSize: 9, color: '2D8A99', align: 'right'
  });

  // ==========================================
  // SLIDES 2..N: Team WSR Slides
  // ==========================================
  teams.forEach((team) => {
    const slide = pptx.addSlide();
    slide.background = { color: COLOR_BG };

    // Top accent bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: '100%', h: 0.08, fill: { color: '00C6D7' }
    });

    // Left Accent bar for title
    slide.addShape(pptx.ShapeType.roundRect, {
      x: MARGIN_LEFT, y: 0.55, w: 0.08, h: 0.4, fill: { color: '00E5FF' }, rectRadius: 0.5
    });

    // 1. Slide Title Header: Left side "WSR – <Team Name>"
    slide.addText(`WSR – ${team.name}`, {
      x: MARGIN_LEFT + 0.2, y: 0.45, w: 6.8, h: 0.6,
      fontSize: 22, bold: true, color: COLOR_TITLE, fontFace: 'Arial'
    });
    slide.addText('WEEKLY STATUS REPORT • CONFIDENTIAL', {
      x: MARGIN_LEFT + 0.2, y: 0.95, w: 6.8, h: 0.2,
      fontSize: 8, bold: true, color: '4DB6C9', fontFace: 'Arial'
    });

    // 2. Date Range: Right side
    slide.addText(team.dateRange, {
      x: 7.2, y: 0.45, w: CONTENT_WIDTH - (7.2 - MARGIN_LEFT), h: 0.4,
      fontSize: 14, bold: true, color: 'CCE9F0', align: 'right', fontFace: 'Arial'
    });
    // Live badge
    slide.addShape(pptx.ShapeType.roundRect, {
      x: SLIDE_WIDTH - MARGIN_RIGHT - 1.2, y: 0.9, w: 1.2, h: 0.25,
      fill: { color: '0097A7', transparency: 75 },
      line: { color: '0097A7', width: 1, transparency: 60 },
      rectRadius: 0.5
    });
    slide.addText('● LIVE DATA', {
      x: SLIDE_WIDTH - MARGIN_RIGHT - 1.2, y: 0.9, w: 1.2, h: 0.25,
      fontSize: 8, bold: true, color: '67D5E3', align: 'center', fontFace: 'Arial'
    });

    // 4. Construct Table Data
    const memberCount = Math.max(1, team.members.length);
    const dataFontSize = memberCount <= 4 ? 12 : memberCount <= 6 ? 10.5 : 9;
    const headerFontSize = memberCount <= 4 ? 12 : memberCount <= 6 ? 10.5 : 9.5;
    const cellMargin: [number, number, number, number] = memberCount <= 4 ? [0.08, 0.12, 0.08, 0.12] : [0.06, 0.06, 0.06, 0.06];

    // Header Row
    const headerRow: PptxGenJS.TableCell[] = [
      { text: 'METRIC', options: { bold: true, fill: { color: COLOR_HEADER_BG }, color: COLOR_HEADER_TEXT, align: 'left' as const, fontSize: headerFontSize, fontFace: 'Arial' } },
      ...team.members.map((m) => ({ text: m.displayName || m.name.split(' ')[0], options: { bold: true, fill: { color: COLOR_HEADER_BG }, color: 'E0F5F9', align: 'left' as const, fontSize: headerFontSize, fontFace: 'Arial' } }))
    ];

    const createDataRow = (
      rowLabel: string,
      getValue: (m: typeof team.members[0]) => string | number,
      bgHex: string = COLOR_ROW_BG_1,
      getColor?: (m: typeof team.members[0]) => string,
      isTotalHoursRow: boolean = false
    ): PptxGenJS.TableCell[] => [
      {
        text: rowLabel,
        options: { fill: { color: bgHex }, color: isTotalHoursRow ? COLOR_LABEL : COLOR_HEADER_TEXT, align: 'left', fontSize: dataFontSize, fontFace: 'Arial', bold: isTotalHoursRow || rowLabel === 'Productive Hours' }
      },
      ...team.members.map((m) => {
        const val = getValue(m);
        const textVal = typeof val === 'number' ? (Number.isInteger(val) ? val.toString() : val.toFixed(2)) : val.toString();
        
        // For total hours, format text specifically for PPTX (we can't do pill badges easily, so we use colored text)
        let cellText = textVal;
        if (isTotalHoursRow) {
           const expected = Math.max(0, (m.shiftDays || 5) - m.holidaysAvailed) * 9;
           cellText = `${textVal} (${expected})`;
        }

        return {
          text: cellText,
          options: {
            fill: { color: bgHex },
            color: getColor ? getColor(m) : COLOR_TEXT,
            align: 'left' as const,
            fontSize: dataFontSize,
            fontFace: 'Arial',
            bold: !!getColor || rowLabel === 'Tasks Completed'
          }
        };
      })
    ];

    const tableRows: PptxGenJS.TableCell[][] = [
      headerRow,
      createDataRow('Total Hours', (m) => m.totalHours, COLOR_ROW_BG_2, (m) => {
        const daysWorked = Math.max(0, (m.shiftDays || 5) - m.holidaysAvailed);
        if (m.totalHours >= 9 * daysWorked) return '34D399'; // Green
        if (m.totalHours >= 8.5 * daysWorked) return 'FBBF24'; // Amber
        return 'F87171'; // Red
      }, true),
      createDataRow('Productive Hours', (m) => m.productiveHours, COLOR_ROW_BG_1),
      createDataRow('Non – Productive Hours', (m) => m.nonProductiveHours, COLOR_ROW_BG_2),
      createDataRow('Tasks Completed', (m) => m.tasksCompleted, COLOR_ROW_BG_1, () => '67D5E3'),
      createDataRow('Carry Forward', (m) => m.carryForward, COLOR_ROW_BG_2, (m) => m.carryForward > 0 ? 'FBBF24' : COLOR_TEXT),
      createDataRow('Billable Hours', (m) => m.billableHours, COLOR_ROW_BG_1),
      createDataRow('Non – Billable Hours', (m) => m.nonBillableHours, COLOR_ROW_BG_2),
      createDataRow('Holidays Availed', (m) => m.holidaysAvailed, COLOR_ROW_BG_1),
      createDataRow('Permission Hours', (m) => m.permissionHours || 0, COLOR_ROW_BG_2),
      createDataRow('Compensated', (m) => m.permissionCompensated || '-', COLOR_ROW_BG_1)
    ];

    const labelColWidth = memberCount <= 4 ? 2.6 : 2.3;
    const memberColWidth = (CONTENT_WIDTH - labelColWidth) / memberCount;
    const colWidths = [labelColWidth, ...team.members.map(() => memberColWidth)];

    slide.addTable(tableRows, {
      x: MARGIN_LEFT, y: 1.5, w: CONTENT_WIDTH, colW: colWidths,
      border: { pt: 1, color: '0097A7' },
      margin: cellMargin
    });

    // Footer
    slide.addShape(pptx.ShapeType.rect, {
      x: 0, y: 7.1, w: '100%', h: 0.4, fill: { color: '000000', transparency: 80 }
    });
    slide.addText(`OfficeHub360 WSR Deck • ${team.name}`, {
      x: MARGIN_LEFT, y: 7.1, w: 5, h: 0.4, fontSize: 9, color: '4DB6C9', bold: true
    });
    slide.addText('Confidential', {
      x: 7.5, y: 7.1, w: 5.2, h: 0.4, fontSize: 9, color: '2D8A99', align: 'right'
    });
  });

  // ==========================================
  // FINAL SLIDE: Executive KPI Summary
  // ==========================================
  const summarySlide = pptx.addSlide();
  summarySlide.background = { color: COLOR_BG };
  
  // Top accent bar
  summarySlide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.08, fill: { color: '00C6D7' }
  });

  // Left Accent bar for title
  summarySlide.addShape(pptx.ShapeType.roundRect, {
    x: MARGIN_LEFT, y: 0.55, w: 0.08, h: 0.4, fill: { color: '00E5FF' }, rectRadius: 0.5
  });

  summarySlide.addText('WSR – Executive Summary & KPIs', {
    x: MARGIN_LEFT + 0.2, y: 0.45, w: 8.0, h: 0.6,
    fontSize: 22, bold: true, color: COLOR_TITLE, fontFace: 'Arial'
  });
  summarySlide.addText('CROSS-TEAM PERFORMANCE OVERVIEW', {
    x: MARGIN_LEFT + 0.2, y: 0.95, w: 6.8, h: 0.2,
    fontSize: 8, bold: true, color: '4DB6C9', fontFace: 'Arial'
  });
  
  // All teams badge
  summarySlide.addShape(pptx.ShapeType.roundRect, {
    x: SLIDE_WIDTH - MARGIN_RIGHT - 1.2, y: 0.9, w: 1.2, h: 0.25,
    fill: { color: '0097A7', transparency: 75 },
    line: { color: '0097A7', width: 1, transparency: 60 },
    rectRadius: 0.5
  });
  summarySlide.addText('● ALL TEAMS', {
    x: SLIDE_WIDTH - MARGIN_RIGHT - 1.2, y: 0.9, w: 1.2, h: 0.25,
    fontSize: 8, bold: true, color: '67D5E3', align: 'center', fontFace: 'Arial'
  });

  // Summary Table: Team-by-Team Totals
  const summaryHeader: PptxGenJS.TableCell[] = [
    { text: 'TEAM', options: { fill: { color: COLOR_HEADER_BG }, color: COLOR_HEADER_TEXT, bold: true, fontSize: 11, align: 'left' as const } },
    { text: 'ENG', options: { fill: { color: COLOR_HEADER_BG }, color: COLOR_HEADER_TEXT, bold: true, fontSize: 11, align: 'center' as const } },
    { text: 'Total Hrs', options: { fill: { color: COLOR_HEADER_BG }, color: COLOR_HEADER_TEXT, bold: true, fontSize: 11, align: 'right' as const } },
    { text: 'Prod Hrs', options: { fill: { color: COLOR_HEADER_BG }, color: COLOR_HEADER_TEXT, bold: true, fontSize: 11, align: 'right' as const } },
    { text: 'Prod %', options: { fill: { color: COLOR_HEADER_BG }, color: COLOR_HEADER_TEXT, bold: true, fontSize: 11, align: 'center' as const } },
    { text: 'Tasks', options: { fill: { color: COLOR_HEADER_BG }, color: COLOR_HEADER_TEXT, bold: true, fontSize: 11, align: 'center' as const } },
    { text: 'Carry', options: { fill: { color: COLOR_HEADER_BG }, color: COLOR_HEADER_TEXT, bold: true, fontSize: 11, align: 'center' as const } },
    { text: 'Billable', options: { fill: { color: COLOR_HEADER_BG }, color: COLOR_HEADER_TEXT, bold: true, fontSize: 11, align: 'right' as const } }
  ];

  const summaryRows: PptxGenJS.TableCell[][] = [
    summaryHeader,
    ...teams.map((t, idx) => {
      const tTotal = t.members.reduce((acc, m) => acc + m.totalHours, 0);
      const tProd = t.members.reduce((acc, m) => acc + m.productiveHours, 0);
      const tTasks = t.members.reduce((acc, m) => acc + m.tasksCompleted, 0);
      const tCarry = t.members.reduce((acc, m) => acc + m.carryForward, 0);
      const tBill = t.members.reduce((acc, m) => acc + m.billableHours, 0);
      const tExpected = t.members.reduce((acc, m) => acc + Math.max(0, ((m.shiftDays || 5) - m.holidaysAvailed) * 9), 0);
      const prodPercentNum = tExpected > 0 ? (tProd / tExpected) * 100 : 0;
      const prodPercent = prodPercentNum.toFixed(1) + '%';
      
      let ratioColor = '34D399'; // Green
      if (prodPercentNum < 80) ratioColor = 'F87171';
      else if (prodPercentNum < 95) ratioColor = 'FBBF24';
      
      const rowBg = idx % 2 === 0 ? COLOR_ROW_BG_1 : COLOR_ROW_BG_2;

      return [
        { text: t.name, options: { fill: { color: rowBg }, color: COLOR_LABEL, bold: true, fontSize: 10, align: 'left' as const } },
        { text: t.members.length.toString(), options: { fill: { color: rowBg }, color: COLOR_TEXT, fontSize: 10, align: 'center' as const } },
        { text: tTotal.toFixed(2), options: { fill: { color: rowBg }, color: COLOR_TEXT, fontSize: 10, align: 'right' as const } },
        { text: tProd.toFixed(2), options: { fill: { color: rowBg }, color: COLOR_TEXT, fontSize: 10, align: 'right' as const } },
        { text: prodPercent, options: { fill: { color: rowBg }, color: ratioColor, bold: true, fontSize: 10, align: 'center' as const } },
        { text: tTasks.toString(), options: { fill: { color: rowBg }, color: '67D5E3', bold: true, fontSize: 10, align: 'center' as const } },
        { text: tCarry.toString(), options: { fill: { color: rowBg }, color: tCarry > 0 ? 'FBBF24' : COLOR_TEXT, fontSize: 10, align: 'center' as const } },
        { text: tBill.toFixed(2), options: { fill: { color: rowBg }, color: COLOR_TEXT, fontSize: 10, align: 'right' as const } }
      ] as PptxGenJS.TableCell[];
    })
  ];

  summarySlide.addTable(summaryRows, {
    x: MARGIN_LEFT, y: 1.5, w: CONTENT_WIDTH, colW: [2.333, 1.2, 1.4, 1.4, 1.4, 1.4, 1.4, 1.6],
    border: { pt: 1, color: '0097A7' },
    margin: [0.08, 0.1, 0.08, 0.1]
  });

  // Footer
  summarySlide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 7.1, w: '100%', h: 0.4, fill: { color: '000000', transparency: 80 }
  });
  summarySlide.addText('Executive Summary • OfficeHub360', {
    x: MARGIN_LEFT, y: 7.1, w: 5, h: 0.4, fontSize: 9, color: '4DB6C9', bold: true
  });
  summarySlide.addText('Generated by AI WSR Bot', {
    x: 7.5, y: 7.1, w: 5.2, h: 0.4, fontSize: 9, color: '2D8A99', align: 'right'
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


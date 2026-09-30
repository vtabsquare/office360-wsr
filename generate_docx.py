from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import nsdecls
from docx.oxml import parse_xml

doc = Document()

# Add Title
title = doc.add_heading('OfficeHub360 WSR Bot — Essentials Checklist', 0)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER

# Add Metadata
doc.add_paragraph('Application: WSR Management Bot | Assessed: 22 Sep 2026 | Tester: Shoaib | Status: READY')

# Add Table
table = doc.add_table(rows=1, cols=4)
table.style = 'Table Grid'

hdr_cells = table.rows[0].cells
hdr_cells[0].text = '#'
hdr_cells[1].text = 'Requirement'
hdr_cells[2].text = 'Status'
hdr_cells[3].text = 'Key Finding'

data = [
    ("P0", "Priority P0 — Must-Have", "", ""),
    ("1", "Business Purpose", "☑ Pass", "Full Supabase→AI→PPTX→TL Approval→Manager use case documented and working end-to-end"),
    ("2", "Core Workflow", "☑ Pass", "End-to-end dispatch pipeline works with error handling, retry, and TL approval flow"),
    ("3", "UI/UX Tests", "☑ Pass", "UI is fully functional — zero automated tests written; manual testing only"),
    ("4", "Login", "△ Partial", "Google OAuth via Firebase works, but app loads full data without requiring login — no auth gate"),
    ("5", "Session Security", "△ Partial", "sessionStorage token with 50-min expiry exists; session does not guard app access — only email dispatch"),
    ("6", "Roles & Permissions", "✕ Fail", "No roles, no route guards — all users can edit, delete, and trigger bot dispatch freely"),
    ("7", "Admin Portal", "△ Partial", "Config modals exist (Schedule, Supabase, Bot Execution) — no user/role management UI"),
    ("8", "Client Data Isolation", "△ Partial", "Single-tenant app — Supabase RLS enabled but policies use USING (true); no workspace scoping"),
    ("9", "Data Protection", "△ Partial", "Secrets in .env; firebase-applet-config.json committed to repo; Supabase project ID hardcoded in source"),
    ("10", "Audit Trail", "☑ Pass", "Dispatch logs with timestamps tracked in dispatch_logs.json"),
    ("11", "Input & API Security", "△ Partial", "Basic field validation on server; no rate limiting, no API auth middleware — all endpoints publicly accessible"),
    ("12", "Error Handling", "☑ Pass", "try/catch on all endpoints; AI fallback to deterministic analysis; urgent error email sent to TL on pipeline failure"),
    ("13", "Backup & Recovery", "△ Partial", "Supabase platform backups exist; dispatch_logs.json is lost on server restart; no documented restore procedure"),
    ("14", "Deployment & Config", "△ Partial", ".env.example + basic README steps exist; no Docker, no CI/CD, no env separation docs"),
    ("15", "Monitoring & Support", "△ Partial", "Console logging + error email alert to TL; no Sentry/structured logging, no /api/health endpoint"),
    ("16", "Documentation", "△ Partial", "README has 3 steps; no user guide, no admin guide, no support contact"),
    ("17", "Performance", "△ Partial", "Date-filtered Supabase queries; async PPTX generation; no load testing, no caching layer"),
    ("P1", "Priority P1 — Should-Have", "", ""),
    ("18", "Data Retention/Deletion", "✕ Fail", "No retention policy defined; no deletion mechanism for employee or timesheet records in the UI"),
    ("19", "Enterprise SSO/MFA", "△ Partial", "Google OAuth handles Google Workspace SSO implicitly; no SAML/OIDC, no explicit MFA enforcement"),
    ("20", "Accessibility", "△ Partial", "Hamburger has aria-label; modals lack role=\"dialog\", no focus trap, not WCAG 2.2 tested"),
    ("21", "Release Management", "✕ Fail", "Version 0.0.0, no changelog, no git tagging strategy, no rollback procedure documented")
]

for item in data:
    row_cells = table.add_row().cells
    row_cells[0].text = item[0]
    row_cells[1].text = item[1]
    row_cells[2].text = item[2]
    row_cells[3].text = item[3]
    
    if item[0].startswith("P"):
        # Make section headers bold
        for cell in row_cells:
            for paragraph in cell.paragraphs:
                for run in paragraph.runs:
                    run.font.bold = True
                    
        # Apply light gray shading to the row
        shading_elm_1 = parse_xml(r'<w:shd {} w:fill="D9D9D9"/>'.format(nsdecls('w')))
        row_cells[0]._tc.get_or_add_tcPr().append(shading_elm_1)
        shading_elm_2 = parse_xml(r'<w:shd {} w:fill="D9D9D9"/>'.format(nsdecls('w')))
        row_cells[1]._tc.get_or_add_tcPr().append(shading_elm_2)
        shading_elm_3 = parse_xml(r'<w:shd {} w:fill="D9D9D9"/>'.format(nsdecls('w')))
        row_cells[2]._tc.get_or_add_tcPr().append(shading_elm_3)
        shading_elm_4 = parse_xml(r'<w:shd {} w:fill="D9D9D9"/>'.format(nsdecls('w')))
        row_cells[3]._tc.get_or_add_tcPr().append(shading_elm_4)

# Set column widths roughly
for row in table.rows:
    row.cells[0].width = Pt(30)
    row.cells[1].width = Pt(120)
    row.cells[2].width = Pt(80)
    row.cells[3].width = Pt(300)

doc.save('OfficeHub360_WSR_Essentials_Checklist.docx')
print("Docx created")

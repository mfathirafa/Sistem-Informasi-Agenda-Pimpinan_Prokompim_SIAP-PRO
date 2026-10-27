"""
Generator Buku Panduan SIAP-PRO dengan Desain Modern, Bersih, dan Profesional.
Output: docs/BUKU PANDUAN SIAP-PRO.docx
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

WORKSPACE_DIR = r"D:\Rafa\Projek\SIAP-PRO_Sistem Informasi Agenda Pimpinan Prokompim\sistem-spj-protokom"
OUTPUT_PATH = os.path.join(WORKSPACE_DIR, "docs", "BUKU PANDUAN SIAP-PRO.docx")
LOGO_PATH = os.path.join(WORKSPACE_DIR, "public", "logo-pemkab.png")

# Palette Warna SIAP-PRO (Modern Executive)
C_NAVY_DARK   = RGBColor(0x0F, 0x27, 0x44)  # #0F2744
C_NAVY_BLUE   = RGBColor(0x1E, 0x3A, 0x8A)  # #1E3A8A
C_ACCENT_BLUE = RGBColor(0x25, 0x63, 0xEB)  # #2563EB
C_GOLD        = RGBColor(0xD9, 0x77, 0x06)  # #D97706
C_TEXT_MAIN   = RGBColor(0x1E, 0x29, 0x3B)  # #1E293B (Slate 800)
C_TEXT_MUTED  = RGBColor(0x64, 0x74, 0x8B)  # #64748B (Slate 500)
C_WHITE       = RGBColor(0xFF, 0xFF, 0xFF)

HEX_NAVY_DARK = "0F2744"
HEX_NAVY_BLUE = "1E3A8A"
HEX_BLUE_BG   = "EFF6FF"
HEX_BLUE_LINE = "2563EB"
HEX_AMBER_BG  = "FFFBEB"
HEX_AMBER_LINE= "F59E0B"
HEX_SLATE_BG  = "F8FAFC"
HEX_SLATE_DIV = "E2E8F0"
HEX_GREEN_BG  = "F0FDF4"
HEX_GREEN_LINE= "16A34A"

FONT_MAIN = "Segoe UI"
FONT_HEADING = "Segoe UI"

doc = docx.Document()

# Setup Page: A4 Portrait, Margins 2.5 cm (Standard Modern)
for sec in doc.sections:
    sec.page_width = Cm(21.0)
    sec.page_height = Cm(29.7)
    sec.top_margin = Cm(2.5)
    sec.bottom_margin = Cm(2.5)
    sec.left_margin = Cm(2.8)
    sec.right_margin = Cm(2.5)
    sec.header_distance = Cm(1.2)
    sec.footer_distance = Cm(1.2)

# Normal Style
normal_style = doc.styles["Normal"]
normal_style.font.name = FONT_MAIN
normal_style.font.size = Pt(10.5)
normal_style.font.color.rgb = C_TEXT_MAIN

# Helper XML styling
def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>\n'
        f'  <w:top w:w="{top}" w:type="dxa"/>\n'
        f'  <w:bottom w:w="{bottom}" w:type="dxa"/>\n'
        f'  <w:left w:w="{left}" w:type="dxa"/>\n'
        f'  <w:right w:w="{right}" w:type="dxa"/>\n'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_cell_background(cell, hex_color):
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shd)

def set_callout_border(cell, hex_border_color):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>\n'
        f'  <w:top w:val="none"/>\n'
        f'  <w:left w:val="single" w:sz="36" w:space="0" w:color="{hex_border_color}"/>\n'
        f'  <w:bottom w:val="none"/>\n'
        f'  <w:right w:val="none"/>\n'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)

def add_header_footer(section):
    # Header
    header = section.header
    header.is_linked_to_previous = False
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    hp.paragraph_format.space_before = Pt(0)
    hp.paragraph_format.space_after = Pt(4)
    r = hp.add_run("SIAP-PRO  •  Buku Panduan Pengguna")
    r.font.name = FONT_MAIN
    r.font.size = Pt(8.5)
    r.font.color.rgb = C_TEXT_MUTED
    
    # Bottom border on header
    pPr = hp._p.get_or_add_pPr()
    pBdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="4" w:space="2" w:color="{HEX_SLATE_DIV}"/></w:pBdr>')
    pPr.append(pBdr)

    # Footer
    footer = section.footer
    footer.is_linked_to_previous = False
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
    fp.paragraph_format.space_before = Pt(4)
    fp.paragraph_format.space_after = Pt(0)
    
    # Top border on footer
    fpPr = fp._p.get_or_add_pPr()
    fpBdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:top w:val="single" w:sz="4" w:space="2" w:color="{HEX_SLATE_DIV}"/></w:pBdr>')
    fpPr.append(fpBdr)

    r_left = fp.add_run("Bagian Prokompim Setda Kabupaten Brebes\t\t")
    r_left.font.name = FONT_MAIN
    r_left.font.size = Pt(8.5)
    r_left.font.color.rgb = C_TEXT_MUTED
    
    # Page field
    r_page = fp.add_run("Halaman ")
    r_page.font.name = FONT_MAIN
    r_page.font.size = Pt(8.5)
    r_page.font.color.rgb = C_TEXT_MUTED
    
    fld1 = OxmlElement('w:fldSimple')
    fld1.set(qn('w:instr'), 'PAGE')
    fp._p.append(fld1)

# Helpers for content creation
def p_body(text, space_before=0, space_after=6, bold=False, color=C_TEXT_MAIN):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    pf.space_before = Pt(space_before)
    pf.space_after = Pt(space_after)
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing = 1.15
    run = p.add_run(text)
    run.font.name = FONT_MAIN
    run.font.size = Pt(10.5)
    run.bold = bold
    run.font.color.rgb = color
    return p

def p_bullet(text, level=0):
    p = doc.add_paragraph(style='List Bullet')
    pf = p.paragraph_format
    pf.left_indent = Inches(0.25 * (level + 1))
    pf.space_before = Pt(0)
    pf.space_after = Pt(3)
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing = 1.15
    run = p.add_run(text)
    run.font.name = FONT_MAIN
    run.font.size = Pt(10.0)
    run.font.color.rgb = C_TEXT_MAIN
    return p

def p_step(num_str, title_str, desc_str):
    p = doc.add_paragraph()
    pf = p.paragraph_format
    pf.left_indent = Inches(0.25)
    pf.space_before = Pt(2)
    pf.space_after = Pt(4)
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.line_spacing = 1.15
    
    r_num = p.add_run(f"{num_str}. ")
    r_num.font.name = FONT_MAIN
    r_num.font.size = Pt(10.0)
    r_num.bold = True
    r_num.font.color.rgb = C_NAVY_BLUE
    
    r_title = p.add_run(f"{title_str} ")
    r_title.font.name = FONT_MAIN
    r_title.font.size = Pt(10.0)
    r_title.bold = True
    r_title.font.color.rgb = C_TEXT_MAIN
    
    r_desc = p.add_run(desc_str)
    r_desc.font.name = FONT_MAIN
    r_desc.font.size = Pt(10.0)
    r_desc.font.color.rgb = C_TEXT_MAIN
    return p

def add_bab_banner(bab_num, bab_title):
    doc.add_page_break()
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Cm(15.7)
    
    set_cell_background(cell, HEX_NAVY_DARK)
    set_cell_margins(cell, top=160, bottom=160, left=240, right=200)
    
    # Left border gold
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>\n'
        f'  <w:top w:val="none"/>\n'
        f'  <w:left w:val="single" w:sz="36" w:space="0" w:color="F59E0B"/>\n'
        f'  <w:bottom w:val="none"/>\n'
        f'  <w:right w:val="none"/>\n'
        f'</w:tcBorders>'
    )
    tcPr.append(tcBorders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    r_sub = p.add_run(bab_num.upper())
    r_sub.font.name = FONT_HEADING
    r_sub.font.size = Pt(9.5)
    r_sub.bold = True
    r_sub.font.color.rgb = RGBColor(0xFB, 0xBF, 0x24) # Warm Gold
    
    p2 = cell.add_paragraph()
    p2.paragraph_format.space_before = Pt(2)
    p2.paragraph_format.space_after = Pt(0)
    r_title = p2.add_run(bab_title.upper())
    r_title.font.name = FONT_HEADING
    r_title.font.size = Pt(14.0)
    r_title.bold = True
    r_title.font.color.rgb = C_WHITE
    
    # Empty space after banner
    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(6)
    p_sp.paragraph_format.space_after = Pt(4)

def add_heading_sub(num_str, title_str):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    
    r = p.add_run(f"{num_str}  {title_str}")
    r.font.name = FONT_HEADING
    r.font.size = Pt(12.0)
    r.bold = True
    r.font.color.rgb = C_NAVY_BLUE
    return p

def add_callout(box_type, title, text):
    """Callout card modern: 'tips', 'warning', atau 'info'"""
    if box_type == 'tips':
        bg_hex, border_hex = HEX_BLUE_BG, HEX_BLUE_LINE
        icon, title_color = "💡 TIPS PRAKTIS: ", C_ACCENT_BLUE
    elif box_type == 'warning':
        bg_hex, border_hex = HEX_AMBER_BG, HEX_AMBER_LINE
        icon, title_color = "⚠️ PERHATIAN PENTING: ", C_GOLD
    else:
        bg_hex, border_hex = HEX_SLATE_BG, HEX_NAVY_BLUE
        icon, title_color = "ℹ️ CATATAN SISTEM: ", C_NAVY_BLUE
        
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Cm(15.7)
    
    set_cell_background(cell, bg_hex)
    set_callout_border(cell, border_hex)
    set_cell_margins(cell, top=100, bottom=100, left=180, right=140)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    
    r_icon = p.add_run(icon)
    r_icon.font.name = FONT_MAIN
    r_icon.font.size = Pt(9.5)
    r_icon.bold = True
    r_icon.font.color.rgb = title_color
    
    r_t = p.add_run(title + "\n")
    r_t.font.name = FONT_MAIN
    r_t.font.size = Pt(9.5)
    r_t.bold = True
    r_t.font.color.rgb = title_color
    
    r_body = p.add_run(text)
    r_body.font.name = FONT_MAIN
    r_body.font.size = Pt(9.5)
    r_body.font.color.rgb = C_TEXT_MAIN
    
    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(0)
    p_sp.paragraph_format.space_after = Pt(4)

def add_modern_table(headers, rows, col_widths=None):
    tbl = doc.add_table(rows=1 + len(rows), cols=len(headers))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    # Borderless vertical, subtle horizontal borders
    tblPr = tbl._tbl.tblPr
    tblBorders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>\n'
        f'  <w:top w:val="single" w:sz="12" w:space="0" w:color="{HEX_NAVY_BLUE}"/>\n'
        f'  <w:left w:val="none"/>\n'
        f'  <w:bottom w:val="single" w:sz="12" w:space="0" w:color="{HEX_NAVY_BLUE}"/>\n'
        f'  <w:right w:val="none"/>\n'
        f'  <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{HEX_SLATE_DIV}"/>\n'
        f'  <w:insideV w:val="none"/>\n'
        f'</w:tblBorders>'
    )
    tblPr.append(tblBorders)
    
    # Header styling
    hdr_cells = tbl.rows[0].cells
    for i, h in enumerate(headers):
        c = hdr_cells[i]
        set_cell_background(c, HEX_NAVY_BLUE)
        set_cell_margins(c, top=120, bottom=120, left=120, right=120)
        c.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
        p = c.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h)
        r.font.name = FONT_HEADING
        r.font.size = Pt(9.5)
        r.bold = True
        r.font.color.rgb = C_WHITE
        if col_widths and i < len(col_widths):
            c.width = Cm(col_widths[i])
            
    # Data rows
    for r_idx, row_data in enumerate(rows):
        row_cells = tbl.rows[r_idx + 1].cells
        bg_hex = "FFFFFF" if r_idx % 2 == 0 else HEX_SLATE_BG
        for c_idx, cell_value in enumerate(row_data):
            c = row_cells[c_idx]
            set_cell_background(c, bg_hex)
            set_cell_margins(c, top=80, bottom=80, left=120, right=120)
            c.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = c.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            r = p.add_run(str(cell_value))
            r.font.name = FONT_MAIN
            r.font.size = Pt(9.0)
            r.font.color.rgb = C_TEXT_MAIN
            if col_widths and c_idx < len(col_widths):
                c.width = Cm(col_widths[c_idx])
                
    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(2)
    p_sp.paragraph_format.space_after = Pt(6)


# =========================================================================
# 1. HALAMAN COVER MODERN & ELEGAN
# =========================================================================
first_sec = doc.sections[0]
first_sec.different_first_page_header_footer = True

# Logo Pemkab Brebes (Centered)
if os.path.exists(LOGO_PATH):
    p_logo = doc.add_paragraph()
    p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_logo.paragraph_format.space_before = Pt(30)
    p_logo.paragraph_format.space_after = Pt(12)
    p_logo.add_run().add_picture(LOGO_PATH, width=Inches(1.5))
else:
    p_logo = doc.add_paragraph()
    p_logo.paragraph_format.space_before = Pt(40)

# Tagline Pemerintah
p_pemkab = doc.add_paragraph()
p_pemkab.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_pemkab.paragraph_format.space_before = Pt(0)
p_pemkab.paragraph_format.space_after = Pt(4)
r_pemkab = p_pemkab.add_run("PEMERINTAH KABUPATEN BREBES")
r_pemkab.font.name = FONT_HEADING
r_pemkab.font.size = Pt(11.0)
r_pemkab.bold = True
r_pemkab.font.color.rgb = C_TEXT_MUTED

p_setda = doc.add_paragraph()
p_setda.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_setda.paragraph_format.space_before = Pt(0)
p_setda.paragraph_format.space_after = Pt(36)
r_setda = p_setda.add_run("SEKRETARIAT DAERAH  •  BAGIAN PROTOKOL & KOMUNIKASI PIMPINAN")
r_setda.font.name = FONT_MAIN
r_setda.font.size = Pt(9.5)
r_setda.font.color.rgb = C_TEXT_MUTED

# Kotak Judul Utama (Modern Card)
title_tbl = doc.add_table(rows=1, cols=1)
title_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
t_cell = title_tbl.cell(0, 0)
t_cell.width = Cm(15.7)
set_cell_background(t_cell, HEX_SLATE_BG)
set_cell_margins(t_cell, top=200, bottom=200, left=240, right=240)

# Left accent line navy & gold
t_tcPr = t_cell._tc.get_or_add_tcPr()
t_tcBorders = parse_xml(
    f'<w:tcBorders {nsdecls("w")}>\n'
    f'  <w:top w:val="none"/>\n'
    f'  <w:left w:val="single" w:sz="36" w:space="0" w:color="{HEX_NAVY_DARK}"/>\n'
    f'  <w:bottom w:val="none"/>\n'
    f'  <w:right w:val="none"/>\n'
    f'</w:tcBorders>'
)
t_tcPr.append(t_tcBorders)

p_t1 = t_cell.paragraphs[0]
p_t1.paragraph_format.space_before = Pt(0)
p_t1.paragraph_format.space_after = Pt(6)
r_tag = p_t1.add_run("BUKU PANDUAN RESMI PENGGUNA")
r_tag.font.name = FONT_HEADING
r_tag.font.size = Pt(10.0)
r_tag.bold = True
r_tag.font.color.rgb = C_GOLD

p_t2 = t_cell.add_paragraph()
p_t2.paragraph_format.space_before = Pt(0)
p_t2.paragraph_format.space_after = Pt(4)
r_main = p_t2.add_run("SIAP-PRO")
r_main.font.name = FONT_HEADING
r_main.font.size = Pt(34.0)
r_main.bold = True
r_main.font.color.rgb = C_NAVY_DARK

p_t3 = t_cell.add_paragraph()
p_t3.paragraph_format.space_before = Pt(0)
p_t3.paragraph_format.space_after = Pt(8)
r_sub = p_t3.add_run("Sistem Informasi Agenda Pimpinan Prokompim")
r_sub.font.name = FONT_MAIN
r_sub.font.size = Pt(13.0)
r_sub.bold = True
r_sub.font.color.rgb = C_ACCENT_BLUE

p_t4 = t_cell.add_paragraph()
p_t4.paragraph_format.space_before = Pt(0)
p_t4.paragraph_format.space_after = Pt(0)
r_desc = p_t4.add_run(
    "Pedoman operasional praktis pengelolaan agenda bupati dan wakil bupati, "
    "pembagian tugas tim protokoler, peliputan, pengemudi, serta pemantauan dokumen administrasi SPJ secara terpadu."
)
r_desc.font.name = FONT_MAIN
r_desc.font.size = Pt(9.5)
r_desc.font.color.rgb = C_TEXT_MUTED

# Spacer
p_sp_cover = doc.add_paragraph()
p_sp_cover.paragraph_format.space_before = Pt(70)

# Footer Cover Info
p_foot = doc.add_paragraph()
p_foot.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_foot.paragraph_format.space_before = Pt(0)
p_foot.paragraph_format.space_after = Pt(4)
r_edisi = p_foot.add_run("EDISI PEMBARUAN TAHUN 2026  •  VERSI 2.0")
r_edisi.font.name = FONT_HEADING
r_edisi.font.size = Pt(9.5)
r_edisi.bold = True
r_edisi.font.color.rgb = C_NAVY_BLUE

p_foot2 = doc.add_paragraph()
p_foot2.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_foot2.paragraph_format.space_before = Pt(0)
p_foot2.paragraph_format.space_after = Pt(0)
r_setda2 = p_foot2.add_run("Bagian Protokol dan Komunikasi Pimpinan  •  Sekretariat Daerah Kabupaten Brebes")
r_setda2.font.name = FONT_MAIN
r_setda2.font.size = Pt(9.0)
r_setda2.font.color.rgb = C_TEXT_MUTED


# =========================================================================
# 2. SECTION 2: KATA PENGANTAR & DAFTAR ISI
# =========================================================================
sec2 = doc.add_section()
add_header_footer(sec2)

# Judul Kata Pengantar
p_kp_h = doc.add_paragraph()
p_kp_h.paragraph_format.space_before = Pt(16)
p_kp_h.paragraph_format.space_after = Pt(12)
r_kp = p_kp_h.add_run("KATA PENGANTAR")
r_kp.font.name = FONT_HEADING
r_kp.font.size = Pt(16.0)
r_kp.bold = True
r_kp.font.color.rgb = C_NAVY_DARK

p_body("Puji syukur senantiasa kita panjatkan ke hadirat Allah SWT, Tuhan Yang Maha Esa, atas tersusun dan diterbitkannya Buku Panduan Pengguna Sistem Informasi Agenda Pimpinan Prokompim (SIAP-PRO) ini.")
p_body("Buku panduan ini disusun sebagai pegangan kerja sehari-hari bagi seluruh anggota di lingkungan Bagian Protokol dan Komunikasi Pimpinan (Prokompim) Sekretariat Daerah Kabupaten Brebes. SIAP-PRO hadir untuk mentransformasi tata kelola agenda kerja pimpinan daerah yang sebelumnya banyak dikelola secara manual menjadi sistem digital yang terintegrasi, akurat, dan transparan.")
p_body("Dengan adanya SIAP-PRO, seluruh alur kegiatan pimpinan—mulai dari masuknya surat permohonan acara, penataan jadwal Bupati dan Wakil Bupati, penugasan petugas protokol, juru liput, hingga driver, serta pemantauan naskah sambutan dan dokumen SPJ—dapat terpantau secara langsung (real-time).")
p_body("Panduan ini sengaja dirancang dengan visual yang bersih dan bahasa yang ringkas agar rekan-rekan staf dapat langsung mempraktikkannya tanpa mengalami kesulitan istilah teknis komputer. Kami mengucapkan terima kasih kepada seluruh tim yang telah berkontribusi.")

# TTD
p_sp_ttd = doc.add_paragraph()
p_sp_ttd.paragraph_format.space_before = Pt(20)

p_ttd = doc.add_paragraph()
p_ttd.alignment = WD_ALIGN_PARAGRAPH.RIGHT
p_ttd.paragraph_format.space_before = Pt(0)
p_ttd.paragraph_format.space_after = Pt(2)
r_t1 = p_ttd.add_run("Brebes, Oktober 2026\n")
r_t1.font.size = Pt(10.0)
r_t2 = p_ttd.add_run("Kepala Bagian Protokol & Komunikasi Pimpinan\nSekretariat Daerah Kabupaten Brebes\n\n\n\n")
r_t2.font.size = Pt(10.0)
r_t2.bold = True
r_t3 = p_ttd.add_run("( ____________________________________ )\n")
r_t3.font.size = Pt(10.0)
r_t3.bold = True
r_t4 = p_ttd.add_run("NIP. ............................................................")
r_t4.font.size = Pt(9.5)


# =========================================================================
# DAFTAR ISI VISUAL
# =========================================================================
doc.add_page_break()
p_di_h = doc.add_paragraph()
p_di_h.paragraph_format.space_before = Pt(16)
p_di_h.paragraph_format.space_after = Pt(12)
r_di = p_di_h.add_run("DAFTAR ISI LENGKAP")
r_di.font.name = FONT_HEADING
r_di.font.size = Pt(16.0)
r_di.bold = True
r_di.font.color.rgb = C_NAVY_DARK

toc_items = [
    ("KATA PENGANTAR", "i"),
    ("DAFTAR ISI", "ii"),
    ("BAB I   PENDAHULUAN & PENGENALAN SISTEM", "1"),
    ("  1.1 Mengenal SIAP-PRO", "1"),
    ("  1.2 Manfaat Utama Sistem", "1"),
    ("BAB II  HAK AKSES DAN JENIS PENGGUNA", "2"),
    ("  2.1 Tiga Peran Pengguna", "2"),
    ("  2.2 Matriks Wewenang & Hak Akses", "2"),
    ("BAB III CARA MASUK DAN KELUAR SISTEM", "3"),
    ("  3.1 Langkah Masuk (Login)", "3"),
    ("  3.2 Langkah Keluar (Logout) yang Aman", "3"),
    ("BAB IV  HALAMAN UTAMA (DASBOR EKSEKUTIF)", "4"),
    ("  4.1 Kartu Statistik dan Angka Kunci", "4"),
    ("  4.2 Grafik Kegiatan & Daftar Acara Terdekat", "4"),
    ("BAB V   KALENDER AGENDA KERJA", "5"),
    ("  5.1 Membaca Kalender Bulanan & Kode Warna", "5"),
    ("  5.2 Navigasi Tanggal dan Info Cepat", "5"),
    ("BAB VI  WORKSHEET (LEMBAR KERJA UTAMA)", "6"),
    ("  6.1 Pencarian dan Penyaringan Cepat", "6"),
    ("  6.2 Memahami 22 Kolom Data Kegiatan", "7"),
    ("  6.3 Menambah Kegiatan Baru (Langkah Praktis)", "8"),
    ("  6.4 Mengubah, Menghapus, dan Ekspor Excel", "9"),
    ("BAB VII DETAIL KEGIATAN & BERKAS SPJ", "10"),
    ("  7.1 Memantau 7 Dokumen Wajib SPJ", "10"),
    ("  7.2 Menautkan Link Google Drive & Progress Bar", "10"),
    ("  7.3 Riwayat Jejak Perubahan Data", "11"),
    ("BAB VIII REKAPITULASI LAPORAN (EXCEL & PDF)", "12"),
    ("  8.1 Menyesuaikan Filter dan Kolom Tampil", "12"),
    ("  8.2 Cetak Laporan Resmi Format PDF dan Spreadsheet", "12"),
    ("BAB IX  PENGELOLAAN DATA PETUGAS", "13"),
    ("  9.1 Tim Protokol, Liputan, dan Driver", "13"),
    ("BAB X   DATA INSTANSI PENYELENGGARA (LEADING SECTOR)", "14"),
    ("BAB XI  MANAJEMEN PENGGUNA (KHUSUS ADMIN)", "15"),
    ("BAB XII RIWAYAT AKTIVITAS SISTEM (AUDIT LOG)", "16"),
    ("BAB XIII ALUR RESMI PERJALANAN STATUS KEGIATAN", "17"),
    ("DAFTAR ISTILAH & TANYA JAWAB (FAQ)", "18"),
    ("PENUTUP", "19"),
]

for title, page_str in toc_items:
    p_toc = doc.add_paragraph()
    p_toc.paragraph_format.space_before = Pt(1)
    p_toc.paragraph_format.space_after = Pt(2)
    p_toc.paragraph_format.line_spacing = 1.15
    
    is_main = title.startswith("BAB") or title in ("KATA PENGANTAR", "DAFTAR ISI", "PENUTUP", "DAFTAR ISTILAH & TANYA JAWAB (FAQ)")
    
    r_t = p_toc.add_run(title)
    r_t.font.name = FONT_MAIN
    r_t.font.size = Pt(9.5 if not is_main else 10.0)
    r_t.bold = is_main
    r_t.font.color.rgb = C_NAVY_DARK if is_main else C_TEXT_MAIN
    
    # Dots tab
    p_toc.paragraph_format.tab_stops.add_tab_stop(Cm(15.7), WD_ALIGN_PARAGRAPH.RIGHT)
    r_dots = p_toc.add_run(f"\t{page_str}")
    r_dots.font.name = FONT_MAIN
    r_dots.font.size = Pt(9.5 if not is_main else 10.0)
    r_dots.bold = is_main
    r_dots.font.color.rgb = C_TEXT_MUTED if not is_main else C_NAVY_DARK


# =========================================================================
# BAB I: PENDAHULUAN
# =========================================================================
add_bab_banner("BAB I", "PENDAHULUAN & PENGENALAN SISTEM")

add_heading_sub("1.1", "Mengenal Aplikasi SIAP-PRO")
p_body(
    "SIAP-PRO (Sistem Informasi Agenda Pimpinan Prokompim) adalah aplikasi berbasis web yang dikembangkan "
    "khusus untuk mendukung efektivitas kerja Bagian Protokol dan Komunikasi Pimpinan Sekretariat Daerah Kabupaten Brebes. "
    "Sistem ini bertindak sebagai 'Buku Agenda Digital Terpusat' yang menyatukan seluruh alur penanganan kegiatan pimpinan."
)
p_body(
    "Sebelum diterapkannya SIAP-PRO, jadwal pimpinan dan penugasan staf sering kali tercatat di banyak lembaran terpisah, "
    "mulai dari disposisi surat fisik, papan tulis kantor, hingga file Excel mandiri yang rentan tercecer. "
    "Dengan SIAP-PRO, seluruh anggota tim memiliki satu sumber data yang sama, akurat, dan selalu diperbarui secara langsung."
)

add_heading_sub("1.2", "Manfaat dan Kemudahan Utama")
p_body("Penerapan sistem ini menghadirkan berbagai keuntungan operasional:")
p_bullet("Mencegah Jadwal Bertabrakan: Memastikan pimpinan tidak terjadwal di dua lokasi berbeda pada waktu yang sama.")
p_bullet("Pembagian Tugas Transparan: Petugas protokol, tim liputan, dan driver dapat langsung melihat jadwal penugasan masing-masing.")
p_bullet("Kesiapan Sambutan Terpantau: Memantau secara pasti kegiatan mana yang teks sambutannya sudah selesai atau masih dalam proses penulisan.")
p_bullet("Percepatan Penyelesaian SPJ: Daftar dokumen wajib SPJ per kegiatan terpantau persentasenya hingga tuntas 100%.")
p_bullet("Rekapitulasi Laporan Otomatis: Membuat laporan kegiatan bulanan dan tahunan dalam hitungan detik ke format Excel dan PDF.")

add_callout(
    "tips",
    "Dapat Diakses dari Komputer Maupun Ponsel",
    "SIAP-PRO dirancang responsif sehingga tetap nyaman dibuka melalui peramban (browser) di ponsel pintar Android maupun iPhone saat petugas sedang mendampingi pimpinan di lapangan."
)


# =========================================================================
# BAB II: HAK AKSES DAN JENIS PENGGUNA
# =========================================================================
add_bab_banner("BAB II", "HAK AKSES DAN JENIS PENGGUNA")

add_heading_sub("2.1", "Tiga Tingkatan Akun Pengguna")
p_body(
    "Untuk memastikan keamanan dan akuntabilitas data, pengguna SIAP-PRO dibagi menjadi tiga kelompok peran:"
)
p_bullet("1. Administrator (Admin): Pengelola sistem utama dengan akses ke semua fitur, termasuk pendaftaran akun pengguna baru.")
p_bullet("2. Staf Prokompim: Pengguna aktif sehari-hari yang bertugas menginput acara, menentukan petugas, melengkapi tautan SPJ, dan mengubah status.")
p_bullet("3. Kepala Bagian (Pimpinan): Akun pemantau khusus untuk pimpinan bagian yang memerlukan akses baca dan cetak laporan tanpa risiko data terubah tanpa sengaja.")

add_heading_sub("2.2", "Matriks Wewenang & Hak Akses")
p_body("Berikut perbandingan wewenang antara masing-masing tingkatan pengguna:")

headers_akses = ["Menu / Fitur Sistem", "Admin", "Staf Prokompim", "Kepala Bagian"]
rows_akses = [
    ["Melihat Dasbor & Kalender Bulanan", "✔ Dapat", "✔ Dapat", "✔ Dapat"],
    ["Melihat Lembar Kerja (Worksheet)", "✔ Dapat", "✔ Dapat", "✔ Dapat"],
    ["Menambah Kegiatan Baru", "✔ Dapat", "✔ Dapat", "✗ Tidak"],
    ["Mengubah & Memperbarui Kegiatan", "✔ Dapat", "✔ Dapat", "✗ Tidak"],
    ["Menghapus Data Kegiatan", "✔ Dapat", "✔ Dapat", "✗ Tidak"],
    ["Memperbarui Berkas & Dokumen SPJ", "✔ Dapat", "✔ Dapat", "✗ Tidak"],
    ["Mengunduh Laporan (Excel & PDF)", "✔ Dapat", "✔ Dapat", "✔ Dapat"],
    ["Mengelola Data Petugas & Instansi", "✔ Dapat", "✔ Dapat", "✗ Tidak"],
    ["Mendaftarkan Pengguna & Reset Password", "✔ Dapat", "✗ Tidak", "✗ Tidak"],
    ["Melihat Catatan Riwayat Aktivitas", "✔ Dapat", "✔ Dapat", "✗ Tidak"],
]
add_modern_table(headers_akses, rows_akses, [6.5, 3.0, 3.2, 3.0])


# =========================================================================
# BAB III: CARA MASUK DAN KELUAR SISTEM
# =========================================================================
add_bab_banner("BAB III", "CARA MASUK DAN KELUAR SISTEM")

add_heading_sub("3.1", "Langkah Masuk (Login) ke SIAP-PRO")
p_body("Ikuti langkah sederhana berikut untuk masuk ke aplikasi:")
p_step("1", "Buka Browser", "Gunakan Google Chrome, Microsoft Edge, atau Mozilla Firefox pada komputer kerja Anda.")
p_step("2", "Ketikkan Alamat", "Masukkan alamat situs SIAP-PRO pada bilah alamat atas, lalu tekan Enter.")
p_step("3", "Masukkan Akun", "Ketikkan Username dan Kata Sandi (Password) yang telah diberikan oleh Administrator.")
p_step("4", "Klik Tombol Masuk", "Klik tombol biru 'Masuk'. Anda akan langsung dialihkan ke Halaman Dasbor Utama.")

add_callout(
    "info",
    "Sesi Masuk Tetap Aktif",
    "Sistem menyimpan sesi masuk Anda selama 7 hari pada perangkat yang sama. Anda tidak perlu memasukkan ulang kata sandi setiap kali membuka komputer."
)

add_heading_sub("3.2", "Langkah Keluar (Logout) yang Aman")
p_body(
    "Apabila komputer kerja digunakan secara bergantian, sangat dianjurkan untuk selalu keluar dari sistem:"
)
p_step("1", "Klik Ikon Keluar", "Klik ikon pintu keluar (Logout) yang berada di pojok kanan atas bilah menu.")
p_step("2", "Konfirmasi Keluar", "Pada kotak dialog yang muncul, pilih tombol 'Keluar' untuk memastikan akun Anda tertutup dengan aman.")


# =========================================================================
# BAB IV: HALAMAN UTAMA (DASBOR EKSEKUTIF)
# =========================================================================
add_bab_banner("BAB IV", "HALAMAN UTAMA (DASBOR EKSEKUTIF)")

p_body(
    "Halaman Dasbor menyajikan rangkuman visual kondisi seluruh agenda kerja tanpa Anda perlu membuka baris data satu per satu."
)

add_heading_sub("4.1", "Empat Kartu Angka Kunci")
p_body("Di bagian atas dasbor terdapat 4 kotak kartu informasi cepat:")
p_bullet("Kegiatan Bulan Ini: Total seluruh agenda pimpinan pada bulan berjalan.")
p_bullet("Kegiatan Hari Ini: Jumlah acara yang berlangsung tepat pada hari ini.")
p_bullet("Total Sambutan: Memperlihatkan perbandingan jumlah naskah sambutan yang sudah siap (warna hijau) dan yang masih belum siap (warna kuning).")
p_bullet("Kegiatan Tahun Ini: Akumulasi seluruh kegiatan sepanjang tahun beserta jumlah kegiatan yang telah tuntas terlaksana.")

add_heading_sub("4.2", "Grafik Bulanan dan Agenda Terdekat")
p_body(
    "Pada baris kedua terdapat grafik batang yang memetakan kepadatan kegiatan dari bulan ke bulan. "
    "Di samping kanannya terdapat panel 'Kegiatan Terdekat' yang menampilkan daftar agenda mendatang "
    "sehingga staf dan tim protokoler dapat melakukan persiapan lebih awal."
)


# =========================================================================
# BAB V: KALENDER AGENDA KERJA
# =========================================================================
add_bab_banner("BAB V", "KALENDER AGENDA KERJA")

p_body(
    "Menu Kalender menyajikan jadwal kegiatan dalam bentuk grid tanggalan bulanan yang intuitif dan mudah dipahami."
)

add_heading_sub("5.1", "Membaca Penanda Warna pada Kalender")
p_body("Setiap kegiatan di dalam kotak tanggal ditandai dengan warna yang mencerminkan statusnya:")
p_bullet("🟣 Ungu (Acara Masuk): Kegiatan baru diterima dan dicatat, penugasan petugas belum final.")
p_bullet("🟡 Kuning (On Progress): Petugas lapangan telah ditentukan, acara siap atau sedang berjalan.")
p_bullet("🟢 Hijau (Selesai): Acara telah selesai dilaksanakan di lapangan.")
p_bullet("🔵 Biru (SPJ Selesai): Seluruh berkas administrasi dan SPJ telah rampung 100%.")

add_heading_sub("5.2", "Navigasi dan Jendela Info Cepat")
p_body(
    "Gunakan tombol panah ◀ (sebelumnya) dan ▶ (berikutnya) untuk berpindah bulan. "
    "Jika Anda mengeklik salah satu nama acara di kalender, jendela informasi cepat akan muncul "
    "menampilkan detail jam, tempat, pejabat yang hadir, petugas bertugas, dan tautan dokumen terkait."
)


# =========================================================================
# BAB VI: WORKSHEET (LEMBAR KERJA UTAMA)
# =========================================================================
add_bab_banner("BAB VI", "WORKSHEET (LEMBAR KERJA UTAMA)")

p_body(
    "Worksheet adalah jantung dari SIAP-PRO. Halaman ini memuat seluruh data kegiatan dalam format tabel besar "
    "yang dilengkapi fitur pencarian, filter bertingkat, penataan urutan, serta ekspor ke file Excel."
)

add_heading_sub("6.1", "Pencarian dan Penyaringan Cepat")
p_body("Di atas tabel tersedia sarana penyaringan komprehensif:")
p_bullet("Pencarian Teks: Ketikkan kata kunci nama acara, tempat, atau perihal surat, lalu tekan Enter.")
p_bullet("Filter Tahun & Bulan: Mempersempit tampilan data ke periode tertentu.")
p_bullet("Filter Status Sambutan: Menyaring kegiatan yang teks sambutannya 'Sudah' atau 'Belum'.")
p_bullet("Filter Status Kegiatan: Memilih kegiatan berdasarkan tahapan acara.")
p_bullet("Filter Pejabat: Memilih kehadiran Bupati, Wakil Bupati, Sekda, dll.")
p_bullet("Filter Instansi (Leading Sector): Mencari agenda berdasarkan OPD penyelenggara.")

add_heading_sub("6.2", "Rincian 22 Kolom Data Kegiatan")
p_body("Setiap baris kegiatan memuat 22 kolom informasi yang saling terintegrasi:")

headers_kolom = ["No", "Nama Kolom", "Penjelasan Fungsi Kolom"]
rows_kolom = [
    ["1", "No", "Nomor urut baris kegiatan."],
    ["2", "Tanggal Pelaksanaan", "Tanggal diadakannya acara (dapat diurutkan)."],
    ["3", "Waktu", "Jam dimulainya acara (contoh: 09.00 WIB)."],
    ["4", "Kegiatan", "Judul atau nama resmi kegiatan pimpinan."],
    ["5", "Perihal Surat", "Ringkasan perihal dari surat undangan yang diterima."],
    ["6", "Nomor Surat", "Nomor surat resmi dari instansi pengundang."],
    ["7", "Dresscode", "Ketentuan seragam dinas atau pakaian resmi."],
    ["8", "Tempat", "Lokasi spesifik tempat acara digelar."],
    ["9", "Pejabat", "Pimpinan yang dijadwalkan hadir."],
    ["10", "No. HP PIC", "Nomor kontak panitia/penanggung jawab instansi."],
    ["11", "Leading Sector", "Nama OPD atau instansi penyelenggara."],
    ["12", "Sambutan", "Status naskah sambutan (bisa diubah langsung di tabel)."],
    ["13", "Status Kegiatan", "Tahapan kegiatan saat ini (bisa diubah langsung)."],
    ["14", "Petugas Protokol", "Nama staf protokol yang bertugas."],
    ["15", "Petugas Liputan", "Nama tim juru foto, video, dan pembuat berita."],
    ["16", "Petugas Driver", "Nama pengemudi kendaraan dinas pimpinan."],
    ["17", "Dokumentasi", "Tautan folder Google Drive foto dan video."],
    ["18", "Medsos", "Tautan bukti tayang di TikTok (TT) dan Instagram (IG)."],
    ["19", "Berita", "Tautan publikasi berita media internal dan eksternal."],
    ["20", "Jenis Tugas", "Kategori tugas: Biasa, Lembur, atau SPPD."],
    ["21", "Publikasi", "Status publikasi: Belum Dirilis, Tidak Dirilis, Dirilis."],
    ["22", "Aksi", "Tombol Ubah (✏️), Hapus (🗑️), dan Detail Berkas (🔗)."],
]
add_modern_table(headers_kolom, rows_kolom, [1.2, 4.5, 10.0])

add_callout(
    "tips",
    "Ubah Status Langsung dari Tabel (Tanpa Form)",
    "Kolom Sambutan, Status Kegiatan, Jenis Tugas, dan Publikasi dapat diubah secara langsung dengan mengeklik kotak pilihannya pada tabel. Data akan tersimpan otomatis secara instan!"
)

add_heading_sub("6.3", "Menambah Kegiatan Baru")
p_body("Untuk menginput agenda baru, ikuti panduan berikut:")
p_step("1", "Klik Tombol Tambah", "Klik tombol biru '+ Tambah Kegiatan' di kanan atas lembar kerja.")
p_step("2", "Isi Data Utama", "Masukkan Nama Kegiatan, Tanggal, Jam, Tempat, Pejabat yang hadir, dan Instansi Penyelenggara.")
p_step("3", "Isi Surat & Narahubung", "Lengkapi Nomor Surat, Perihal, Dresscode, serta Nama & Nomor HP Narahubung (PIC).")
p_step("4", "Tugaskan Personel", "Pilih nama petugas protokol, liputan, dan driver. Centang 'Semua Crew' jika seluruh regu bertugas bersama.")
p_step("5", "Simpan Data", "Klik tombol 'Simpan'. Kegiatan baru otomatis terdaftar pada Worksheet dan Kalender.")

add_heading_sub("6.4", "Mengubah, Menghapus, dan Ekspor Excel")
p_body("Pengelolaan data lanjutan dapat dilakukan dengan mudah:")
p_bullet("Mengedit Kegiatan: Klik ikon pensil (✏️) pada baris yang diinginkan, lakukan perbaikan, lalu klik Simpan.")
p_bullet("Menghapus Kegiatan: Klik ikon tempat sampah (🗑️). Sistem akan meminta konfirmasi sebelum data dihapus secara permanen.")
p_bullet("Ekspor ke File Excel: Klik tombol 'Excel' di atas tabel. Seluruh data yang sedang tampil sesuai filter akan langsung terunduh ke komputer Anda dalam format spreadsheet (.xlsx).")


# =========================================================================
# BAB VII: DETAIL KEGIATAN & BERKAS SPJ
# =========================================================================
add_bab_banner("BAB VII", "DETAIL KEGIATAN & BERKAS SPJ")

p_body(
    "Klik tombol ikon rantai (🔗) pada kolom Aksi untuk membuka lembar kelengkapan berkas administrasi SPJ."
)

add_heading_sub("7.1", "Tujuh Dokumen Wajib yang Dipantau")
p_body("Sistem secara khusus melacak penyelesaian 7 berkas wajib:")
p_bullet("1. Surat Tugas")
p_bullet("2. Surat Undangan Resmi")
p_bullet("3. Naskah Pidato / Sambutan")
p_bullet("4. Dokumentasi Foto Lapangan")
p_bullet("5. Dokumentasi Rekaman Video")
p_bullet("6. Berkas Kuitansi SPJ & Bukti Riil")
p_bullet("7. Laporan Akhir Pelaksanaan Kegiatan")

add_heading_sub("7.2", "Link Google Drive dan Bilah Kemajuan (Progress Bar)")
p_body(
    "Cukup masukkan satu tautan link folder Google Drive yang menampung seluruh file acara tersebut. "
    "Di atas daftar berkas terdapat Bilah Kemajuan yang secara otomatis menghitung persentase "
    "kelengkapan dokumen dari 0% hingga 100% saat status berkas diubah ke 'Sudah Upload'."
)

add_callout(
    "warning",
    "Pastikan Akses Folder Google Drive Terbuka",
    "Gunakan pengaturan link Google Drive 'Siapa saja yang memiliki link dapat melihat' agar pimpinan dan bagian keuangan dapat memeriksa berkas lampiran secara lancar."
)


# =========================================================================
# BAB VIII: REKAPITULASI LAPORAN (EXCEL & PDF)
# =========================================================================
add_bab_banner("BAB VIII", "REKAPITULASI LAPORAN (EXCEL & PDF)")

p_body(
    "Menu Laporan menyediakan sarana pembuatan rekapitulasi kegiatan resmi yang dapat disesuaikan "
    "kolomnya dan langsung dicetak ke dokumen formal."
)

add_heading_sub("8.1", "Kustomisasi Kolom Laporan")
p_body(
    "Klik tombol 'Pengaturan Kolom' (ikon gerigi). Anda bebas mencentang kolom mana saja yang ingin dimunculkan "
    "pada lembar laporan (misalnya menyertakan kolom petugas dan menonaktifkan kolom media sosial)."
)

add_heading_sub("8.2", "Pilihan Format Unduhan")
p_bullet("Unduh PDF: Menghasilkan dokumen siap cetak lengkap dengan tata letak resmi kedinasan.")
p_bullet("Unduh Excel: Menghasilkan lembar spreadsheet untuk pengolahan data atau lampiran laporan bulanan.")


# =========================================================================
# BAB IX - XII: DATA MASTER & ADMINISTRASI
# =========================================================================
add_bab_banner("BAB IX", "PENGELOLAAN DATA PETUGAS")
p_body("Menu Petugas digunakan untuk mengelola daftar nama staf yang dapat ditugaskan:")
p_bullet("Protokol: Staf pengatur tata acara, MC, dan pengatur barisan pimpinan.")
p_bullet("Liputan: Tim dokumentasi foto, rekaman video, pembuat rilis, dan pengelola medsos.")
p_bullet("Driver: Pengemudi kendaraan dinas operasional pimpinan daerah.")
p_body("Anda dapat menambah nama baru, mengoreksi ejaan nama, atau menonaktifkan petugas yang sudah mutasi.")

add_bab_banner("BAB X", "DATA INSTANSI (LEADING SECTOR)")
p_body(
    "Menu Leading Sector mengelola daftar instansi, OPD, dan lembaga penyelenggara acara. "
    "Tersedia pengelompokan mulai dari Forkopimda, SKPD, Dinas, Instansi Vertikal, Badan, RSUD, Perumda, hingga Kecamatan se-Kabupaten Brebes."
)

add_bab_banner("BAB XI", "MANAJEMEN PENGGUNA (KHUSUS ADMIN)")
p_body("Khusus Administrator sistem, menu Kelola Pengguna menyediakan fitur:")
p_bullet("Mendaftarkan Akun Baru: Menginput nama lengkap, username unik, dan kata sandi sementara.")
p_bullet("Perubahan Peran: Mengubah tingkatan akun menjadi Admin, Staf, atau Kepala Bagian.")
p_bullet("Reset Password: Mereset kata sandi staf yang lupa atau melakukan reset massal seluruh staf.")

add_bab_banner("BAB XII", "RIWAYAT AKTIVITAS SISTEM (AUDIT LOG)")
p_body(
    "Sistem secara otomatis mencatat setiap tindakan: Siapa yang mengubah, Kapan waktunya, "
    "dan Data apa yang diubah. Hal ini menjamin transparansi dan memudahkan penelusuran jika terjadi kekeliruan data."
)


# =========================================================================
# BAB XIII: ALUR PERJALANAN STATUS KEGIATAN
# =========================================================================
add_bab_banner("BAB XIII", "ALUR PERJALANAN STATUS KEGIATAN")

p_body("Setiap agenda kegiatan melewati siklus empat tahapan alur resmi:")

headers_alur = ["Tahap Status", "Warna Badge", "Kapan Digunakan?"]
rows_alur = [
    ["1. Acara Masuk", "Ungu", "Undangan baru diagendakan ke sistem, pembagian petugas belum final."],
    ["2. On Progress", "Kuning Emas", "Petugas protokol, liputan, dan driver sudah ditentukan. Acara siap berjalan."],
    ["3. Kegiatan Selesai", "Hijau", "Acara di lapangan telah selesai dilaksanakan pimpinan."],
    ["4. SPJ Selesai", "Biru", "Seluruh dokumen pertanggungjawaban dan kuitansi SPJ rampung 100%."],
]
add_modern_table(headers_alur, rows_alur, [3.5, 2.5, 9.7])

add_callout(
    "info",
    "Status Bersifat Fleksibel",
    "Tahapan status dapat dimajukan atau dimundurkan kapan saja secara langsung dari tabel Worksheet apabila terdapat revisi jadwal atau perbaikan berkas di kantor."
)


# =========================================================================
# DAFTAR ISTILAH & FAQ
# =========================================================================
add_bab_banner("LAMPIRAN", "DAFTAR ISTILAH & TANYA JAWAB (FAQ)")

add_heading_sub("", "Daftar Istilah Singkat")
p_bullet("PIC (Person in Charge): Narahubung utama dari pihak panitia atau instansi pengundang.")
p_bullet("Leading Sector: Instansi, dinas, atau organisasi perangkat daerah yang menyelenggarakan kegiatan.")
p_bullet("Dresscode: Ketentuan pakaian resmi yang wajib dikenakan pejabat dan staf pendamping.")
p_bullet("SPPD: Surat Perintah Perjalanan Dinas untuk kegiatan kedinasan luar daerah.")
p_bullet("Progress Bar: Garis persentase yang memperlihatkan sejauh mana berkas SPJ telah terkumpul.")

add_heading_sub("", "Pertanyaan yang Sering Ditanyakan (FAQ)")
p_body("T: Mengapa tombol '+ Tambah Kegiatan' tidak muncul di layar saya?")
p_body("J: Akun Anda kemungkinan berstatus 'Kepala Bagian' yang bersifat pemantau. Hubungi Admin jika Anda memerlukan hak edit data.", bold=True, color=C_ACCENT_BLUE)

p_body("T: Bagaimana cara cepat mengubah status sambutan menjadi 'Sudah'?")
p_body("J: Cukup buka Worksheet, cari baris kegiatan terkait, lalu klik langsung kotak dropdown di kolom Sambutan tanpa perlu membuka form edit.", bold=True, color=C_ACCENT_BLUE)

p_body("T: Apakah data yang tidak sengaja terhapus dapat dikembalikan?")
p_body("J: Penghapusan bersifat permanen. Mohon selalu teliti sebelum menyetujui konfirmasi penghapusan data.", bold=True, color=C_ACCENT_BLUE)


# =========================================================================
# PENUTUP
# =========================================================================
add_bab_banner("PENUTUP", "PENUTUP")

p_body(
    "Buku Panduan Pengguna SIAP-PRO ini disusun agar seluruh pegawai dan staf di lingkungan Bagian Protokol dan Komunikasi Pimpinan "
    "Kabupaten Brebes memiliki panduan kerja yang jelas, terstandarisasi, dan mudah dipahami."
)
p_body(
    "Keberhasilan implementasi sistem ini sangat bertumpu pada kedisiplinan dan ketelitian kita bersama dalam memperbarui data kegiatan secara tepat waktu. "
    "Dengan data yang akurat, pelayanan terhadap agenda pimpinan daerah dapat terlaksana secara prima, profesional, dan akuntabel."
)

p_sp_end = doc.add_paragraph()
p_sp_end.paragraph_format.space_before = Pt(30)

p_end = doc.add_paragraph()
p_end.alignment = WD_ALIGN_PARAGRAPH.CENTER
r_end1 = p_end.add_run("BAGIAN PROTOKOL DAN KOMUNIKASI PIMPINAN\nSEKRETARIAT DAERAH KABUPATEN BREBES\n")
r_end1.font.name = FONT_HEADING
r_end1.font.size = Pt(11.0)
r_end1.bold = True
r_end1.font.color.rgb = C_NAVY_DARK

r_end2 = p_end.add_run("Tahun 2026")
r_end2.font.name = FONT_MAIN
r_end2.font.size = Pt(10.0)
r_end2.font.color.rgb = C_TEXT_MUTED

# Simpan Dokumen
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
doc.save(OUTPUT_PATH)
print(f"SUKSES! Dokumen modern tersimpan di: {OUTPUT_PATH}")

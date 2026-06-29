from weasyprint import HTML
from weasyprint.text.fonts import FontConfiguration
import sys

font_config = FontConfiguration()

html_path = sys.argv[1] if len(sys.argv) > 1 else "crud-form-study.html"
pdf_path = sys.argv[2] if len(sys.argv) > 2 else "crud-form-study.pdf"

HTML(filename=html_path).write_pdf(
    pdf_path,
    font_config=font_config,
)

print(f"✅ PDF generado: {pdf_path}")

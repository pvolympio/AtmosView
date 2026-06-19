import io
from datetime import datetime
from typing import Dict, Any, List, Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

class PDFService:
    def generate_report_pdf(
        self,
        city_name: str,
        report_type: str,  # "dashboard", "history", "comparison", "ml"
        period_str: str,
        data: Dict[str, Any]
    ) -> io.BytesIO:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        story = []
        styles = getSampleStyleSheet()

        # Custom styles
        title_style = ParagraphStyle(
            name="TitleStyle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=22,
            textColor=colors.HexColor("#ffffff"),
            alignment=TA_LEFT,
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            name="SubtitleStyle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10,
            textColor=colors.HexColor("#a5b4fc"),
            alignment=TA_LEFT
        )
        section_heading = ParagraphStyle(
            name="SectionHeading",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=12,
            textColor=colors.HexColor("#1e1b4b"),
            spaceBefore=14,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            name="BodyStyle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            textColor=colors.HexColor("#334155"),
            leading=13,
            spaceAfter=8
        )
        summary_style = ParagraphStyle(
            name="SummaryStyle",
            parent=styles["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=10,
            textColor=colors.HexColor("#312e81"),
            leading=14,
            spaceAfter=10
        )
        meta_label = ParagraphStyle(
            name="MetaLabel",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=colors.HexColor("#475569")
        )
        meta_value = ParagraphStyle(
            name="MetaValue",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9,
            textColor=colors.HexColor("#0f172a")
        )

        # 1. Header Banner Table
        header_text = f"RELATÓRIO CLIMÁTICO — {report_type.upper()}"
        header_data = [
            [
                Paragraph(header_text, title_style),
                Paragraph(f"AtmosView V5<br/>Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M')}", ParagraphStyle(
                    name="HeaderRight", parent=styles["Normal"], fontName="Helvetica", fontSize=8, textColor=colors.HexColor("#e0e7ff"), alignment=TA_RIGHT
                ))
            ],
            [
                Paragraph(f"Cidade Analisada: {city_name} | Período: {period_str}", subtitle_style),
                ""
            ]
        ]
        
        header_table = Table(header_data, colWidths=[380, 160])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#1e1b4b")),
            ('SPAN', (0,1), (1,1)),
            ('PADDING', (0,0), (-1,-1), 12),
            ('BOTTOMPADDING', (0,1), (-1,1), 12),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 15))

        # 2. Resumo da Análise / Narrativa
        if "summary" in data:
            story.append(Paragraph("Resumo da Análise", section_heading))
            summary_box_data = [[Paragraph(data["summary"], summary_style)]]
            summary_table = Table(summary_box_data, colWidths=[540])
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#e0e7ff")),
                ('PADDING', (0,0), (-1,-1), 10),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#c7d2fe")),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ]))
            story.append(summary_table)
            story.append(Spacer(1, 10))

        # 3. Seções específicas baseadas no tipo de relatório
        if report_type == "dashboard":
            story.append(Paragraph("Condições Climáticas Atuais", section_heading))
            curr = data.get("current", {})
            risk = data.get("risk", {})
            
            dashboard_data = [
                [Paragraph("Métrica", meta_label), Paragraph("Valor Registrado", meta_label), Paragraph("Métrica", meta_label), Paragraph("Valor Registrado", meta_label)],
                [Paragraph("Temperatura", body_style), Paragraph(f"{curr.get('temperature', 0.0)}°C", body_style), Paragraph("Sensação Térmica", body_style), Paragraph(f"{curr.get('apparent_temperature', 0.0)}°C", body_style)],
                [Paragraph("Umidade Relativa", body_style), Paragraph(f"{curr.get('relative_humidity', 0.0)}%", body_style), Paragraph("Pressão Atmosférica", body_style), Paragraph(f"{curr.get('surface_pressure', 0.0)} hPa", body_style)],
                [Paragraph("Velocidade do Vento", body_style), Paragraph(f"{curr.get('wind_speed', 0.0)} km/h", body_style), Paragraph("Precipitação Recente", body_style), Paragraph(f"{curr.get('precipitation', 0.0)} mm", body_style)],
                [Paragraph("Pontuação de Risco (ICR)", body_style), Paragraph(f"{risk.get('score', 0.0)}/10", body_style), Paragraph("Classificação de Risco", body_style), Paragraph(risk.get('nivel', 'Baixo'), body_style)],
            ]
            
            dash_table = Table(dashboard_data, colWidths=[140, 130, 140, 130])
            dash_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
                ('PADDING', (0,0), (-1,-1), 6),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ]))
            story.append(dash_table)
            
            if "risk" in data and "recomendacoes" in data["risk"]:
                story.append(Spacer(1, 10))
                story.append(Paragraph("Recomendações e Ações de Proteção", section_heading))
                recs = data["risk"]["recomendacoes"]
                rec_text = "<br/>".join([f"• {r}" for r in recs])
                story.append(Paragraph(rec_text, body_style))

        elif report_type == "history":
            story.append(Paragraph("Estatísticas de Resumo Histórico", section_heading))
            stats = data.get("stats", {})
            trend = data.get("trend", {})
            
            history_data = [
                [Paragraph("Indicador Climatológico", meta_label), Paragraph("Valor Consolidador", meta_label), Paragraph("Indicador Climatológico", meta_label), Paragraph("Valor Consolidador", meta_label)],
                [Paragraph("Temperatura Média", body_style), Paragraph(f"{stats.get('avg_temp', 0.0)}°C", body_style), Paragraph("Temperatura Máxima", body_style), Paragraph(f"{stats.get('max_temp', 0.0)}°C", body_style)],
                [Paragraph("Temperatura Mínima", body_style), Paragraph(f"{stats.get('min_temp', 0.0)}°C", body_style), Paragraph("Chuva Acumulada", body_style), Paragraph(f"{stats.get('total_rain', 0.0)} mm", body_style)],
                [Paragraph("Dias Sem Chuva", body_style), Paragraph(str(stats.get('days_no_rain', 0)), body_style), Paragraph("Dias com Chuva Relevante", body_style), Paragraph(str(stats.get('days_relevant_rain', 0)), body_style)],
                [Paragraph("Dias Muito Quentes (>32°C)", body_style), Paragraph(str(stats.get('days_hot', 0)), body_style), Paragraph("Tendência Térmica Angular", body_style), Paragraph(f"{trend.get('slope', 0.0)}°C/ano", body_style)],
            ]
            
            hist_table = Table(history_data, colWidths=[160, 110, 160, 110])
            hist_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
                ('PADDING', (0,0), (-1,-1), 6),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ]))
            story.append(hist_table)
            
            story.append(Spacer(1, 10))
            story.append(Paragraph("Interpretação da Tendência", section_heading))
            story.append(Paragraph(trend.get("interpretation", "Estável"), body_style))

        elif report_type == "comparison":
            story.append(Paragraph("Cruzamento Climático de Fontes", section_heading))
            sources_data = data.get("sources_data", {})
            metrics = data.get("comparison_metrics", {})
            
            comp_rows = [
                [Paragraph("Fonte de Dados", meta_label), Paragraph("Temp. Média", meta_label), Paragraph("Chuva Total", meta_label), Paragraph("Vento Máx", meta_label), Paragraph("Completude", meta_label)],
            ]
            
            for src_id, src_info in sources_data.items():
                stats = src_info.get("stats", {})
                quality = src_info.get("quality_report", {})
                comp_rows.append([
                    Paragraph(src_info.get("metadata", {}).get("name", src_id), body_style),
                    Paragraph(f"{stats.get('avg_temp', 0.0)}°C", body_style),
                    Paragraph(f"{stats.get('total_rain', 0.0)} mm", body_style),
                    Paragraph(f"{stats.get('max_wind', 0.0)} km/h", body_style),
                    Paragraph(f"{quality.get('completeness_percentage', 0.0)}% ({quality.get('quality_grade', 'Boa')})", body_style),
                ])
                
            comp_table = Table(comp_rows, colWidths=[150, 95, 95, 95, 105])
            comp_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
                ('PADDING', (0,0), (-1,-1), 6),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ]))
            story.append(comp_table)
            
            # Divergência
            if metrics:
                story.append(Spacer(1, 10))
                story.append(Paragraph("Métricas de Divergência Estatística", section_heading))
                div_lines = []
                for label, div_val in metrics.items():
                    div_lines.append(
                        f"• <strong>{label.replace('_', ' ').upper()}</strong>: "
                        f"Delta Temp: {div_val.get('diff_temp')}°C ({div_val.get('div_temp_pct')}% div) | "
                        f"Delta Chuva: {div_val.get('diff_rain')} mm ({div_val.get('div_rain_pct')}% div)"
                    )
                story.append(Paragraph("<br/>".join(div_lines), body_style))

        elif report_type == "ml":
            story.append(Paragraph("Previsões Geradas por Inteligência Artificial (Amanhã)", section_heading))
            preds = data.get("predictions", [])
            
            pred_rows = [
                [Paragraph("Variável Alvo", meta_label), Paragraph("Predição", meta_label), Paragraph("Confiança / Probabilidade", meta_label), Paragraph("Modelo Origem", meta_label)]
            ]
            for p in preds:
                label_mapping = {
                    "rain": "Previsão de Chuva",
                    "heavy_rain": "Chuva Forte / Tempestade",
                    "risk": "Nível de Risco ICR"
                }
                pred_rows.append([
                    Paragraph(label_mapping.get(p.get("prediction_type"), p.get("prediction_type")), body_style),
                    Paragraph(p.get("label", "Não"), body_style),
                    Paragraph(f"{int(p.get('probability', 0.0) * 100)}%" if p.get("probability") is not None else "Não avaliada", body_style),
                    Paragraph("Random Forest (IA)" if p.get("source") == "ml-model" else "Regras Heurísticas", body_style),
                ])
                
            pred_table = Table(pred_rows, colWidths=[150, 110, 140, 140])
            pred_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
                ('PADDING', (0,0), (-1,-1), 6),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ]))
            story.append(pred_table)

        # 4. Methodology Section at bottom
        story.append(Spacer(1, 25))
        story.append(Paragraph("Nota Metodológica e Responsabilidade", ParagraphStyle(
            name="MethodologyHeading", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9, textColor=colors.HexColor("#475569")
        )))
        methodology_text = (
            "Os relatórios gerados pelo AtmosView utilizam cruzamento estatístico e modelos preditivos baseados "
            "em dados das APIs públicas do INMET, NASA POWER e Open-Meteo. Este relatório tem fins puramente informativos, "
            "científicos e acadêmicos, e <strong>não substitui alertas meteorológicos oficiais</strong> emitidos pela Defesa Civil, "
            "INMET ou órgãos governamentais de segurança pública do Brasil."
        )
        story.append(Paragraph(methodology_text, ParagraphStyle(
            name="MethodologyText", parent=styles["Normal"], fontName="Helvetica", fontSize=8, textColor=colors.HexColor("#64748b"), leading=11
        )))

        # Build document
        doc.build(story)
        buffer.seek(0)
        return buffer

pdf_service = PDFService()

package com.example.hay_mart.services.laporan;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.text.SimpleDateFormat;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xddf.usermodel.XDDFColor;
import org.apache.poi.xddf.usermodel.XDDFShapeProperties;
import org.apache.poi.xddf.usermodel.XDDFSolidFillProperties;
import org.apache.poi.xddf.usermodel.chart.*;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import com.example.hay_mart.dto.laporan.LaporanPendapatanResponse;
import com.example.hay_mart.models.Pemesanan;
import com.example.hay_mart.repositorys.PemesananRepository;
import lombok.RequiredArgsConstructor;

@Service
@Component
@RequiredArgsConstructor
public class LaporanPendapatanServiceImpl implements LaporanPendapatanService {
    @Autowired
    private PemesananRepository pemesananRepository;

    @Override
    public List<LaporanPendapatanResponse> generateLaporanHarian() {
        LocalDate hariIni = LocalDate.now();

        List<Pemesanan> semuaPemesanan = pemesananRepository.findAll();

        List<Pemesanan> pemesananHariIni = semuaPemesanan.stream()
                .filter(p -> p.getTanggalPembelian().toLocalDate().equals(hariIni))
                .collect(Collectors.toList());

        System.out.println("Jumlah pemesanan hari ini (" + hariIni + "): " + pemesananHariIni.size());

        List<LaporanPendapatanResponse> laporanList = new ArrayList<>();

        if (pemesananHariIni.isEmpty()) {
            System.out.println("Tidak ada pemesanan untuk hari ini.");
            return null;
        }

        BigDecimal persenModal = new BigDecimal("0.85");

        DecimalFormat indonesianFormat = new DecimalFormat("#,###.00");
        indonesianFormat.setDecimalFormatSymbols(new DecimalFormatSymbols(Locale.forLanguageTag("id-ID")));

        BigDecimal totalPendapatan = BigDecimal.ZERO;
        BigDecimal totalModal = BigDecimal.ZERO;

        for (Pemesanan pemesanan : pemesananHariIni) {
            BigDecimal harga = BigDecimal.valueOf(pemesanan.getTotalHarga());
            totalPendapatan = totalPendapatan.add(harga);
            totalModal = totalModal.add(harga.multiply(persenModal));
            System.out.println("  Pemesanan ID: " + pemesanan.getPemesananId() + " | Total Harga: " + harga);
        }

        BigDecimal totalKeuntungan = totalPendapatan.subtract(totalModal);

        LaporanPendapatanResponse harian = new LaporanPendapatanResponse();
        harian.setPeriode(hariIni.toString());
        harian.setPendapatan(totalPendapatan.setScale(2, RoundingMode.HALF_UP));
        harian.setModal(totalModal.setScale(2, RoundingMode.HALF_UP));
        harian.setKeuntungan(totalKeuntungan.setScale(2, RoundingMode.HALF_UP));

        laporanList.add(harian);

        System.out.println(">> Pendapatan: " + indonesianFormat.format(totalPendapatan) +
                " | Modal: " + indonesianFormat.format(totalModal) +
                " | Keuntungan: " + indonesianFormat.format(totalKeuntungan));

        laporanList.sort(Comparator.comparing(LaporanPendapatanResponse::getPeriode));

        return laporanList;
    }

    @Override
    public List<LaporanPendapatanResponse> generateLaporanMingguan() {
        LocalDate today = LocalDate.now();

        LocalDate currentEndOfWeek = today.with(DayOfWeek.SUNDAY);
        LocalDate currentStartOfWeek = currentEndOfWeek.minusDays(6);
        List<LaporanPendapatanResponse> laporanList = new ArrayList<>();

        DecimalFormat indonesianFormat = new DecimalFormat("#,###.00");
        indonesianFormat.setDecimalFormatSymbols(
                new DecimalFormatSymbols(Locale.forLanguageTag("id-ID")));

        for (int i = 0; i < 5; i++) {
            LocalDateTime startDate = currentStartOfWeek.atStartOfDay();
            LocalDateTime endDate = currentEndOfWeek.atTime(23, 59, 59);

            List<Pemesanan> pemesananMingguan = pemesananRepository.findByTanggalPembelianBetween(startDate, endDate);

            if (!pemesananMingguan.isEmpty()) {
                BigDecimal totalPendapatan = BigDecimal.ZERO;
                BigDecimal totalModal = BigDecimal.ZERO;
                BigDecimal persenModal = new BigDecimal("0.85");

                for (Pemesanan pemesanan : pemesananMingguan) {
                    BigDecimal harga = BigDecimal.valueOf(pemesanan.getTotalHarga());
                    totalPendapatan = totalPendapatan.add(harga);
                    totalModal = totalModal.add(harga.multiply(persenModal));
                }

                BigDecimal totalKeuntungan = totalPendapatan.subtract(totalModal);

                LaporanPendapatanResponse mingguan = new LaporanPendapatanResponse();
                mingguan.setPeriode(currentStartOfWeek + "/" + currentEndOfWeek);
                mingguan.setPendapatan(totalPendapatan.setScale(2, RoundingMode.HALF_UP));
                mingguan.setModal(totalModal.setScale(2, RoundingMode.HALF_UP));
                mingguan.setKeuntungan(totalKeuntungan.setScale(2, RoundingMode.HALF_UP));

                laporanList.add(mingguan);

                System.out.println(">> Minggu: " + mingguan.getPeriode() +
                        " | Pendapatan: " + indonesianFormat.format(totalPendapatan) +
                        " | Modal: " + indonesianFormat.format(totalModal) +
                        " | Keuntungan: " + indonesianFormat.format(totalKeuntungan));
            }
            currentEndOfWeek = currentEndOfWeek.minusWeeks(1);
            currentStartOfWeek = currentEndOfWeek.minusDays(6);
        }

        return laporanList;
    }

    @Override
    public List<LaporanPendapatanResponse> generateLaporanBulanan() {
        List<LaporanPendapatanResponse> laporanList = new ArrayList<>();
        LocalDate current = LocalDate.now();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");

        DecimalFormat indonesianFormat = new DecimalFormat("#,###.00");
        indonesianFormat.setDecimalFormatSymbols(
                new DecimalFormatSymbols(Locale.forLanguageTag("id-ID")));

        for (int i = 0; i < 11; i++) {
            LocalDate bulan = current.minusMonths(i);
            LocalDate firstDay = bulan.withDayOfMonth(1);
            LocalDate lastDay = bulan.withDayOfMonth(bulan.lengthOfMonth());

            List<Pemesanan> pemesananBulanan = pemesananRepository.findByTanggalPembelianBetween(
                    firstDay.atStartOfDay(),
                    lastDay.atTime(23, 59, 59));

            if (!pemesananBulanan.isEmpty()) {
                BigDecimal totalPendapatan = pemesananBulanan.stream()
                        .map(p -> BigDecimal.valueOf(p.getTotalHarga()))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal persenModal = new BigDecimal("0.85");
                BigDecimal totalModal = pemesananBulanan.stream()
                        .map(p -> BigDecimal.valueOf(p.getTotalHarga()).multiply(persenModal))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal totalKeuntungan = totalPendapatan.subtract(totalModal);

                LaporanPendapatanResponse bulanan = new LaporanPendapatanResponse();
                bulanan.setPeriode(firstDay.format(formatter) + " - " + lastDay.format(formatter));
                bulanan.setPendapatan(totalPendapatan.setScale(2, RoundingMode.HALF_UP));
                bulanan.setModal(totalModal.setScale(2, RoundingMode.HALF_UP));
                bulanan.setKeuntungan(totalKeuntungan.setScale(2, RoundingMode.HALF_UP));

                laporanList.add(bulanan);

                System.out.println(">> Bulan: " + bulanan.getPeriode() +
                        " | Pendapatan: " + indonesianFormat.format(totalPendapatan) +
                        " | Modal: " + indonesianFormat.format(totalModal) +
                        " | Keuntungan: " + indonesianFormat.format(totalKeuntungan));
            }
        }

        return laporanList;
    }

    @Override
    public List<LaporanPendapatanResponse> generateLaporanTahunan() {
        List<LaporanPendapatanResponse> laporanList = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");

        DecimalFormat indonesianFormat = new DecimalFormat("#,###.00");
        indonesianFormat.setDecimalFormatSymbols(
                new DecimalFormatSymbols(Locale.forLanguageTag("id-ID")));

        int currentYear = LocalDate.now().getYear();

        for (int i = 0; i < 5; i++) {
            int year = currentYear - i;
            LocalDate startOfYear = LocalDate.of(year, 1, 1);
            LocalDate endOfYear = LocalDate.of(year, 12, 31);

            List<Pemesanan> pemesananTahunan = pemesananRepository
                    .findByTanggalPembelianBetween(startOfYear.atStartOfDay(), endOfYear.atTime(23, 59, 59));

            if (!pemesananTahunan.isEmpty()) {
                BigDecimal totalPendapatan = pemesananTahunan.stream()
                        .map(p -> BigDecimal.valueOf(p.getTotalHarga()))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal persenModal = new BigDecimal("0.85");
                BigDecimal totalModal = pemesananTahunan.stream()
                        .map(p -> BigDecimal.valueOf(p.getTotalHarga()).multiply(persenModal))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal totalKeuntungan = totalPendapatan.subtract(totalModal);

                LaporanPendapatanResponse tahunan = new LaporanPendapatanResponse();
                tahunan.setPeriode(startOfYear.format(formatter) + " - " + endOfYear.format(formatter));
                tahunan.setPendapatan(totalPendapatan.setScale(2, RoundingMode.HALF_UP));
                tahunan.setModal(totalModal.setScale(2, RoundingMode.HALF_UP));
                tahunan.setKeuntungan(totalKeuntungan.setScale(2, RoundingMode.HALF_UP));

                laporanList.add(tahunan);

                System.out.println(">> Tahun: " + year +
                        " | Pendapatan: " + indonesianFormat.format(totalPendapatan) +
                        " | Modal: " + indonesianFormat.format(totalModal) +
                        " | Keuntungan: " + indonesianFormat.format(totalKeuntungan));
            }
        }
        return laporanList;
    }

    @Override
    public List<LaporanPendapatanResponse> laporanPendapatan(LocalDate startDate, LocalDate endDate) {

        BigDecimal totalPendapatan = BigDecimal.ZERO;
        BigDecimal totalModal = BigDecimal.ZERO;

        DecimalFormat indonesianFormat = new DecimalFormat("#,###.00");
        indonesianFormat.setDecimalFormatSymbols(
                new DecimalFormatSymbols(Locale.forLanguageTag("id-ID")));

        List<Pemesanan> pendapatan = pemesananRepository.pendapatan(
                LocalDateTime.of(startDate.getYear(), startDate.getMonth(), startDate.getDayOfMonth(), 00, 00, 00),
                LocalDateTime.of(endDate.getYear(), endDate.getMonth(), endDate.getDayOfMonth(), 23, 59, 59));

        for (Pemesanan pemesanan : pendapatan) {
            totalPendapatan = totalPendapatan.add(BigDecimal.valueOf(pemesanan.getTotalHarga()));
        }

        List<Pemesanan> modal = pemesananRepository.modal(
                LocalDateTime.of(startDate.getYear(), startDate.getMonth(), startDate.getDayOfMonth(), 00, 00, 00),
                LocalDateTime.of(endDate.getYear(), endDate.getMonth(), endDate.getDayOfMonth(), 23, 59, 59));

        for (Pemesanan pemesanan : modal) {
            BigDecimal harga = BigDecimal.valueOf(pemesanan.getTotalHarga());
            totalModal = totalModal.add(harga.multiply(new BigDecimal("0.85")));
        }

        BigDecimal totalKeuntungan = totalPendapatan.subtract(totalModal);

        LaporanPendapatanResponse response = new LaporanPendapatanResponse();
        response.setPeriode(startDate.toString() + " - " + endDate.toString());
        response.setPendapatan(totalPendapatan.setScale(2, RoundingMode.HALF_UP));
        response.setModal(totalModal.setScale(2, RoundingMode.HALF_UP));
        response.setKeuntungan(totalKeuntungan.setScale(2, RoundingMode.HALF_UP));

        System.out.println(">> Periode: " + response.getPeriode() +
                " | Pendapatan: " + indonesianFormat.format(totalPendapatan) +
                " | Modal: " + indonesianFormat.format(totalModal) +
                " | Keuntungan: " + indonesianFormat.format(totalKeuntungan));

        System.out.println("Start datetime: " + startDate.atStartOfDay());
        System.out.println("End datetime: " + endDate.atTime(23, 59, 59));
        System.out.println("Data pendapatan ditemukan: " + pendapatan.size());
        System.out.println("Data modal ditemukan: " + modal.size());

        return Collections.singletonList(response);
    }

@Override
    public ByteArrayInputStream generateExcel(List<LaporanPendapatanResponse> data) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Laporan Pendapatan");

            // Define color scheme
            IndexedColors PRIMARY_COLOR = IndexedColors.DARK_BLUE;
            IndexedColors ACCENT_COLOR = IndexedColors.LIGHT_BLUE;
            IndexedColors HIGHLIGHT_COLOR = IndexedColors.GOLD;
            IndexedColors SECONDARY_COLOR = IndexedColors.GREY_25_PERCENT;

            DataFormat format = workbook.createDataFormat();

            // ========== STYLE DEFINITIONS ==========
            // Title Style
            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 20);
            titleFont.setFontName("Calibri");
            titleFont.setColor(IndexedColors.WHITE.getIndex());
            titleStyle.setFont(titleFont);
            titleStyle.setFillForegroundColor(PRIMARY_COLOR.getIndex());
            titleStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            titleStyle.setAlignment(HorizontalAlignment.CENTER);
            titleStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            titleStyle.setBorderBottom(BorderStyle.MEDIUM);

            // Subtitle Style
            CellStyle subtitleStyle = workbook.createCellStyle();
            Font subtitleFont = workbook.createFont();
            subtitleFont.setBold(true);
            subtitleFont.setFontHeightInPoints((short) 12);
            subtitleFont.setFontName("Calibri");
            subtitleFont.setColor(PRIMARY_COLOR.getIndex());
            subtitleStyle.setFont(subtitleFont);
            subtitleStyle.setAlignment(HorizontalAlignment.CENTER);
            subtitleStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 11);
            headerFont.setFontName("Calibri");
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(PRIMARY_COLOR.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.MEDIUM);
            headerStyle.setBorderTop(BorderStyle.MEDIUM);
            headerStyle.setBorderLeft(BorderStyle.MEDIUM);
            headerStyle.setBorderRight(BorderStyle.MEDIUM);

            // Data Cell Styles
            CellStyle textStyleEven = createDataCellStyle(workbook, false, SECONDARY_COLOR);
            CellStyle textStyleOdd = createDataCellStyle(workbook, false, null);
            CellStyle currencyStyleEven = createCurrencyCellStyle(workbook, format, false, SECONDARY_COLOR);
            CellStyle currencyStyleOdd = createCurrencyCellStyle(workbook, format, false, null);

            // Total Styles
            CellStyle totalLabelStyle = createTotalLabelStyle(workbook, PRIMARY_COLOR);
            CellStyle totalValueStyle = createTotalValueStyle(workbook, format, HIGHLIGHT_COLOR);

            // Other Styles
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle companyStyle = createCompanyStyle(workbook, PRIMARY_COLOR);
            CellStyle footerStyle = createFooterStyle(workbook);
            CellStyle summaryStyle = createSummaryStyle(workbook, ACCENT_COLOR);

            // ========== REPORT HEADER ==========
            // Company Information
            createCompanyHeader(sheet, companyStyle, textStyleEven);

            // Report Title
            createReportTitle(sheet, titleStyle, subtitleStyle, dateStyle);

            // Column Headers
            createColumnHeaders(sheet, headerStyle);

            // ========== REPORT DATA ==========
            int rowNum = 9; // Starting row for data
            double totalModal = 0, totalPendapatan = 0, totalKeuntungan = 0;

            for (int i = 0; i < data.size(); i++) {
                LaporanPendapatanResponse laporan = data.get(i);
                if (laporan == null || laporan.getPeriode() == null)
                    continue;

                boolean isEvenRow = (i % 2 == 0);
                Row row = sheet.createRow(rowNum++);

                // Apply alternating row colors
                CellStyle currentTextStyle = isEvenRow ? textStyleEven : textStyleOdd;
                CellStyle currentCurrencyStyle = isEvenRow ? currencyStyleEven : currencyStyleOdd;

                // No
                Cell noCell = row.createCell(0);
                noCell.setCellValue(i + 1);
                noCell.setCellStyle(currentTextStyle);

                // Periode
                Cell periodeCell = row.createCell(1);
                periodeCell.setCellValue(laporan.getPeriode());
                periodeCell.setCellStyle(currentTextStyle);

                // Modal
                double modal = laporan.getModal() != null ? laporan.getModal().doubleValue() : 0.0;
                createCurrencyCell(row, 2, modal, currentCurrencyStyle);
                totalModal += modal;

                // Pendapatan
                double pendapatan = laporan.getPendapatan() != null ? laporan.getPendapatan().doubleValue() : 0.0;
                createCurrencyCell(row, 3, pendapatan, currentCurrencyStyle);
                totalPendapatan += pendapatan;

                // Keuntungan
                double keuntungan = laporan.getKeuntungan() != null ? laporan.getKeuntungan().doubleValue() : 0.0;
                createCurrencyCell(row, 4, keuntungan, currentCurrencyStyle);
                totalKeuntungan += keuntungan;

                // Margin (%)
                Cell marginCell = row.createCell(5);
                double margin = (modal > 0) ? (keuntungan / modal) * 100 : 0;
                marginCell.setCellValue(String.format("%.2f%%", margin));
                marginCell.setCellStyle(currentTextStyle);
            }

            // ========== TOTALS SECTION ==========
            createTotalsSection(sheet, rowNum++, totalLabelStyle, totalValueStyle,
                    totalModal, totalPendapatan, totalKeuntungan);

            // ========== SUMMARY SECTION ==========
            String[] summaryLabels = {
                "Total Modal Investasi",
                "Total Pendapatan Usaha",
                "Total Keuntungan Bersih",
                "Margin Keuntungan (%)",
                "Rasio Pendapatan terhadap Modal"
            };
            
            int summaryStartRow = rowNum;
            createSummarySection(sheet, rowNum, summaryStyle, textStyleEven, currencyStyleEven,
                    totalModal, totalPendapatan, totalKeuntungan, summaryLabels);

            // ========== CHART SECTION ===========
            if (!data.isEmpty()) {
                createChartSheet(workbook, data, sheet);
            }

            // ========== FOOTER ==========
            int footerRowNum = summaryStartRow + summaryLabels.length + 4; // 4 untuk jarak
            createFooter(sheet, footerRowNum, footerStyle);

            // ========== FORMATTING ==========
            formatColumns(sheet);
            sheet.createFreezePane(0, 9); // Freeze header rows
            workbook.setActiveSheet(0);

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    // ========== HELPER METHODS ==========

    private CellStyle createDataCellStyle(Workbook workbook, boolean isBold, IndexedColors fillColor) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setFontName("Calibri");
        font.setFontHeightInPoints((short) 10);
        font.setBold(isBold);
        style.setFont(font);

        if (fillColor != null) {
            style.setFillForegroundColor(fillColor.getIndex());
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        }

        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setVerticalAlignment(VerticalAlignment.CENTER);

        return style;
    }

    private CellStyle createCurrencyCellStyle(Workbook workbook, DataFormat format, boolean isBold,
            IndexedColors fillColor) {
        CellStyle style = createDataCellStyle(workbook, isBold, fillColor);
        style.setDataFormat(format.getFormat("Rp#,##0.00"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        return style;
    }

    private CellStyle createTotalLabelStyle(Workbook workbook, IndexedColors fillColor) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(fillColor.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.MEDIUM);
        style.setBorderTop(BorderStyle.MEDIUM);
        style.setBorderLeft(BorderStyle.MEDIUM);
        style.setBorderRight(BorderStyle.MEDIUM);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createTotalValueStyle(Workbook workbook, DataFormat format, IndexedColors fillColor) {
        CellStyle style = createTotalLabelStyle(workbook, fillColor);
        style.setDataFormat(format.getFormat("Rp#,##0.00"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setItalic(true);
        font.setFontHeightInPoints((short) 10);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.RIGHT);
        return style;
    }

    private CellStyle createCompanyStyle(Workbook workbook, IndexedColors color) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        font.setColor(color.getIndex());
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.LEFT);
        return style;
    }

    private CellStyle createFooterStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setFontHeightInPoints((short) 8);
        font.setItalic(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }

    private CellStyle createSummaryStyle(Workbook workbook, IndexedColors fillColor) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(fillColor.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private void createCompanyHeader(Sheet sheet, CellStyle companyStyle, CellStyle textStyle) {
        // Company Row 1
        Row companyRow1 = sheet.createRow(0);
        companyRow1.setHeight((short) 400);
        Cell companyNameCell = companyRow1.createCell(0);
        companyNameCell.setCellValue("SnapMart");
        companyNameCell.setCellStyle(companyStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));

        // Company Row 2
        Row companyRow2 = sheet.createRow(1);
        Cell companyAddressCell = companyRow2.createCell(0);
        companyAddressCell.setCellValue("Jl. Sukaraja No. 123, Bandung");
        companyAddressCell.setCellStyle(textStyle);
        sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 5));

        // Company Row 3
        Row companyRow3 = sheet.createRow(2);
        Cell companyContactCell = companyRow3.createCell(0);
        companyContactCell.setCellValue("Telp: (021) 123-4567 | Email: info@snapmart.com");
        companyContactCell.setCellStyle(textStyle);
        sheet.addMergedRegion(new CellRangeAddress(2, 2, 0, 5));

        // Empty row
        sheet.createRow(3).setHeight((short) 200);
    }

    private void createReportTitle(Sheet sheet, CellStyle titleStyle, CellStyle subtitleStyle, CellStyle dateStyle) {
        // Title Row
        Row titleRow = sheet.createRow(4);
        titleRow.setHeight((short) 800);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("LAPORAN PENDAPATAN");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(4, 4, 0, 5));

        // Subtitle Row
        Row subtitleRow = sheet.createRow(5);
        subtitleRow.setHeight((short) 400);
        Cell subtitleCell = subtitleRow.createCell(0);
        subtitleCell.setCellValue("SnapMart - ANALISIS KEUANGAN");
        subtitleCell.setCellStyle(subtitleStyle);
        sheet.addMergedRegion(new CellRangeAddress(5, 5, 0, 5));

        // Date Row
        Row dateRow = sheet.createRow(6);
        Cell dateCell = dateRow.createCell(3);
        dateCell.setCellValue("Tanggal Cetak: " + new SimpleDateFormat("dd MMMM yyyy").format(new Date()));
        dateCell.setCellStyle(dateStyle);
        sheet.addMergedRegion(new CellRangeAddress(6, 6, 3, 5));

        // Empty row
        sheet.createRow(7).setHeight((short) 300);
    }

    private void createColumnHeaders(Sheet sheet, CellStyle headerStyle) {
        Row headerRow = sheet.createRow(8);
        headerRow.setHeight((short) 450);
        String[] headers = { "No", "Periode", "Modal", "Pendapatan", "Keuntungan", "Margin (%)" };

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private void createCurrencyCell(Row row, int column, double value, CellStyle style) {
        Cell cell = row.createCell(column);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private void createTotalsSection(Sheet sheet, int rowNum, CellStyle labelStyle,
            CellStyle valueStyle, double totalModal,
            double totalPendapatan, double totalKeuntungan) {
        // Empty row before totals
        sheet.createRow(rowNum++).setHeight((short) 200);

        // Totals Row
        Row totalRow = sheet.createRow(rowNum++);
        totalRow.setHeight((short) 500);

        // Total Label
        Cell totalLabelCell = totalRow.createCell(0);
        totalLabelCell.setCellValue("TOTAL");
        totalLabelCell.setCellStyle(labelStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 1));

        // Total Modal
        createCurrencyCell(totalRow, 2, totalModal, valueStyle);

        // Total Pendapatan
        createCurrencyCell(totalRow, 3, totalPendapatan, valueStyle);

        // Total Keuntungan
        createCurrencyCell(totalRow, 4, totalKeuntungan, valueStyle);

        // Total Margin
        Cell totalMarginCell = totalRow.createCell(5);
        double totalMargin = (totalModal > 0) ? (totalKeuntungan / totalModal) * 100 : 0;
        totalMarginCell.setCellValue(String.format("%.2f%%", totalMargin));
        totalMarginCell.setCellStyle(labelStyle);
    }

    private void createSummarySection(Sheet sheet, int rowNum, CellStyle headerStyle,
            CellStyle textStyle, CellStyle currencyStyle,
            double totalModal, double totalPendapatan,
            double totalKeuntungan, String[] summaryLabels) {
        // Empty rows before summary
        rowNum += 2;

        // Summary Header
        Row summaryHeaderRow = sheet.createRow(rowNum++);
        Cell summaryHeaderCell = summaryHeaderRow.createCell(0);
        summaryHeaderCell.setCellValue("RINGKASAN KINERJA KEUANGAN");
        summaryHeaderCell.setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 5));

        Object[] summaryValues = {
                totalModal,
                totalPendapatan,
                totalKeuntungan,
                String.format("%.2f%%", (totalModal > 0) ? (totalKeuntungan / totalModal) * 100 : 0),
                String.format("%.2f", totalModal > 0 ? totalPendapatan / totalModal : 0)
        };

        for (int i = 0; i < summaryLabels.length; i++) {
            Row summaryRow = sheet.createRow(rowNum++);

            // Label
            Cell labelCell = summaryRow.createCell(0);
            labelCell.setCellValue(summaryLabels[i]);
            labelCell.setCellStyle(textStyle);
            sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 2));

            // Value
            Cell valueCell = summaryRow.createCell(3);
            if (summaryValues[i] instanceof Double) {
                valueCell.setCellValue((Double) summaryValues[i]);
                valueCell.setCellStyle(currencyStyle);
            } else {
                valueCell.setCellValue(summaryValues[i].toString());
                valueCell.setCellStyle(textStyle);
            }
            sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 3, 5));
        }
    }

    private void createChartSheet(Workbook workbook, List<LaporanPendapatanResponse> data, Sheet mainSheet) {
        Sheet chartSheet = workbook.createSheet("Grafik Pendapatan");

        // Create header row
        Row chartHeaderRow = chartSheet.createRow(0);
        String[] headers = { "Periode", "Modal", "Pendapatan", "Keuntungan" };
        for (int i = 0; i < headers.length; i++) {
            chartHeaderRow.createCell(i).setCellValue(headers[i]);
        }

        // Copy data from main sheet
        for (int i = 0; i < data.size(); i++) {
            Row sourceRow = mainSheet.getRow(9 + i); // Data starts at row 9
            Row chartDataRow = chartSheet.createRow(i + 1);

            // Periode
            chartDataRow.createCell(0).setCellValue(sourceRow.getCell(1).getStringCellValue());

            // Numeric values
            for (int j = 1; j < 4; j++) {
                chartDataRow.createCell(j).setCellValue(sourceRow.getCell(j + 1).getNumericCellValue());
            }
        }

        // Create chart
        XSSFSheet xssfChartSheet = (XSSFSheet) chartSheet;
        XSSFDrawing drawing = xssfChartSheet.createDrawingPatriarch();
        XSSFClientAnchor anchor = drawing.createAnchor(0, 0, 0, 0, 0, 5, 10, 25);
        XSSFChart chart = drawing.createChart(anchor);

        // Chart configuration
        chart.setTitleText("Grafik Pendapatan dan Keuntungan");
        chart.setTitleOverlay(false);
        chart.getOrAddLegend().setPosition(LegendPosition.BOTTOM);

        // Create axes
        XDDFCategoryAxis bottomAxis = chart.createCategoryAxis(AxisPosition.BOTTOM);
        bottomAxis.setTitle("Periode");
        XDDFValueAxis leftAxis = chart.createValueAxis(AxisPosition.LEFT);
        leftAxis.setTitle("Nilai (Rp)");
        leftAxis.setCrosses(AxisCrosses.AUTO_ZERO);

        // Data sources
        XDDFDataSource<String> periodeSeries = XDDFDataSourcesFactory.fromStringCellRange(
                xssfChartSheet, new CellRangeAddress(1, data.size(), 0, 0));

        XDDFNumericalDataSource<Double> modalSeries = XDDFDataSourcesFactory.fromNumericCellRange(
                xssfChartSheet, new CellRangeAddress(1, data.size(), 1, 1));

        XDDFNumericalDataSource<Double> pendapatanSeries = XDDFDataSourcesFactory.fromNumericCellRange(
                xssfChartSheet, new CellRangeAddress(1, data.size(), 2, 2));

        XDDFNumericalDataSource<Double> keuntunganSeries = XDDFDataSourcesFactory.fromNumericCellRange(
                xssfChartSheet, new CellRangeAddress(1, data.size(), 3, 3));

        // Create chart data
        XDDFChartData chartData = chart.createData(ChartTypes.BAR, bottomAxis, leftAxis);

        // Add series with different colors
        XDDFChartData.Series series1 = chartData.addSeries(periodeSeries, modalSeries);
        series1.setTitle("Modal", null);
        setSeriesColor(series1, new byte[] { (byte) 0, (byte) 102, (byte) 204 }); // Blue

        XDDFChartData.Series series2 = chartData.addSeries(periodeSeries, pendapatanSeries);
        series2.setTitle("Pendapatan", null);
        setSeriesColor(series2, new byte[] { (byte) 0, (byte) 204, (byte) 102 }); // Green

        XDDFChartData.Series series3 = chartData.addSeries(periodeSeries, keuntunganSeries);
        series3.setTitle("Keuntungan", null);
        setSeriesColor(series3, new byte[] { (byte) 204, (byte) 102, (byte) 0 }); // Orange

        chart.plot(chartData);
    }

    private void setSeriesColor(XDDFChartData.Series series, byte[] rgb) {
        XDDFSolidFillProperties fill = new XDDFSolidFillProperties();
        fill.setColor(XDDFColor.from(rgb));
        XDDFShapeProperties shapeProperties = new XDDFShapeProperties();
        shapeProperties.setFillProperties(fill);
        series.setShapeProperties(shapeProperties);
    }

    private void createFooter(Sheet sheet, int rowNum, CellStyle footerStyle) {
        // Bersihkan dulu merged regions yang ada di row ini
        removeMergedRegionsInRow(sheet, rowNum);
        
        Row footerRow = sheet.createRow(rowNum);
        Cell footerCell = footerRow.createCell(0);
        footerCell.setCellValue("© SnapMart " + Calendar.getInstance().get(Calendar.YEAR) +
                " - Laporan ini dibuat secara otomatis dan valid tanpa tanda tangan.");
        footerCell.setCellStyle(footerStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowNum, rowNum, 0, 5));
    }

    private void formatColumns(Sheet sheet) {
        String[] headers = { "No", "Periode", "Modal", "Pendapatan", "Keuntungan", "Margin (%)" };

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
            int currentWidth = sheet.getColumnWidth(i);
            int desiredWidth = Math.min(currentWidth + 1000, 255 * 256);

            // Special handling for specific columns
            if (i == 1) { // Periode column
                desiredWidth = Math.max(desiredWidth, 4000); // Minimum width for period
            } else if (i == 5) { // Margin column
                desiredWidth = Math.max(desiredWidth, 3000); // Minimum width for margin
            }

            sheet.setColumnWidth(i, desiredWidth);
        }
    }

    private void removeMergedRegionsInRow(Sheet sheet, int rowNum) {
        List<Integer> toRemove = new ArrayList<>();
        for (int i = 0; i < sheet.getNumMergedRegions(); i++) {
            CellRangeAddress merged = sheet.getMergedRegion(i);
            if (merged.getFirstRow() <= rowNum && merged.getLastRow() >= rowNum) {
                toRemove.add(i);
            }
        }
        // Remove in reverse order to avoid index shifting
        Collections.reverse(toRemove);
        for (int index : toRemove) {
            sheet.removeMergedRegion(index);
        }
    }
}
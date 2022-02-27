package ru.academits.servlet;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.*;
import ru.academits.PhoneBook;
import ru.academits.model.Contact;
import ru.academits.service.ContactService;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ExportContactsServlet extends HttpServlet {
    private final ContactService phoneBookService = PhoneBook.phoneBookService;

    public void doGet(HttpServletRequest req, HttpServletResponse resp) {
        try {
            resp.setContentType("application/vnd.ms-excel");
            resp.setHeader("Content-Disposition", "attachment; filename=SampleExcel.xlsx");
            Workbook workbook = createExcel();
            workbook.write(resp.getOutputStream());
        } catch (Exception e) {
            System.out.println("error in GetContactsServlet POST: ");
            e.printStackTrace();
        }
    }

    private Workbook createExcel() {
        Workbook workbook = new XSSFWorkbook();
        Sheet worksheet = workbook.createSheet("My First POI Worksheet");

        Row row1 = worksheet.createRow(0);

        Cell cellA1 = row1.createCell(0);
        cellA1.setCellValue("Hurray! You did it.");
        CellStyle cellStyle = workbook.createCellStyle();
        cellA1.setCellStyle(cellStyle);

        return workbook;
    }
}
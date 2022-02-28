package ru.academits.servlet;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.*;
import ru.academits.PhoneBook;
import ru.academits.service.ContactService;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.OutputStream;

public class ExportContactsServlet extends HttpServlet {
    private final ContactService phoneBookService = PhoneBook.phoneBookService;

    public void doGet(HttpServletRequest req, HttpServletResponse resp) {
        try (OutputStream outputStream = resp.getOutputStream()) {
            resp.setContentType("application/vnd.ms-excel");
            resp.setHeader("Content-Disposition", "attachment; filename=phonebook.xls");

            Workbook workbook = createExcel();
            workbook.write(outputStream);

            outputStream.flush();
        } catch (Exception e) {
            System.out.println("error in ExportContactsServlet POST: ");
            e.printStackTrace();
        }
    }

    private Workbook createExcel() {
        Workbook workbook = new XSSFWorkbook();
        Sheet worksheet = workbook.createSheet("Worksheet");

        Row row1 = worksheet.createRow(0);

        Cell cellA1 = row1.createCell(0);
        cellA1.setCellValue("TEST DATA");

        return workbook;
    }
}
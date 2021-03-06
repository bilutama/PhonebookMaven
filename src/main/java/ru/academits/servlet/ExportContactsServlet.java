package ru.academits.servlet;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.*;
import ru.academits.PhoneBook;
import ru.academits.service.ContactService;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.OutputStream;

public class ExportContactsServlet extends HttpServlet {
    private final ContactService phoneBookService = PhoneBook.phoneBookService;

    public void doGet(HttpServletRequest req, HttpServletResponse resp) {
        try (OutputStream outputStream = resp.getOutputStream()) {
            Workbook workbook = new XSSFWorkbook();
            Sheet worksheet = workbook.createSheet("TestSheet");

            worksheet.createRow(1).createCell(1).setCellValue("1");
            worksheet.createRow(2).createCell(1).setCellValue("2");
            worksheet.createRow(3).createCell(1).setCellValue("3");

            resp.setContentType("application/vnd.ms-excel");
            resp.setHeader("Content-Disposition", "attachment; filename=phonebook.xls");

            workbook.write(outputStream);
        } catch (Exception e) {
            System.out.println("error in ExportContactsServlet POST: ");
            e.printStackTrace();
        }
    }
}
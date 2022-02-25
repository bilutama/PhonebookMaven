package ru.academits.servlet;

import org.apache.poi.hssf.usermodel.*;
import ru.academits.PhoneBook;
import ru.academits.converter.ContactConverter;
import ru.academits.service.ContactService;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.FileOutputStream;

public class ExportToExcelServlet {
    private final ContactService phoneBookService = PhoneBook.phoneBookService;
    private final ContactConverter contactConverter = PhoneBook.contactConverter;

    protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
        HSSFWorkbook workbook = new HSSFWorkbook();
        HSSFSheet firstSheet = workbook.createSheet("Phonebook");

        HSSFRow rowA = firstSheet.createRow(0);
        HSSFCell cellA = rowA.createCell(0);
        cellA.setCellValue(new HSSFRichTextString("FIRST SHEET"));

        // Write the workbook into a file
        try (FileOutputStream fileOutputStream = new FileOutputStream("Phonebook.xls")) {
            workbook.write(fileOutputStream);
        } catch (Exception e) {
            System.out.println("error in ExportToExcelServlet POST: ");
            e.printStackTrace();
        }
    }
}

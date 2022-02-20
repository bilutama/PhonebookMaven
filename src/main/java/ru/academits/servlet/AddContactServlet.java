package ru.academits.servlet;

import ru.academits.PhoneBook;
import ru.academits.converter.ContactConverter;
import ru.academits.converter.ContactValidationConverter;
import ru.academits.model.Contact;
import ru.academits.service.ContactService;
import ru.academits.service.ContactValidation;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

public class AddContactServlet extends HttpServlet {

    private final ContactService phoneBookService = PhoneBook.phoneBookService;
    private final ContactConverter contactConverter = PhoneBook.contactConverter;
    private final ContactValidationConverter contactValidationConverter = PhoneBook.contactValidationConverter;

    protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
        try (OutputStream responseStream = resp.getOutputStream()) {
            String contactJson = req.getReader().lines().collect(Collectors.joining(System.lineSeparator()));
            Contact contact = contactConverter.convertFromJson(contactJson);

            ContactValidation contactValidation = phoneBookService.addContact(contact);
            String contactValidationJson = contactValidationConverter.convertToJson(contactValidation);

            if (!contactValidation.isValid()) {
                resp.setStatus(500);
            }

            responseStream.write(contactValidationJson.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            System.out.println("error in AddContactServlet POST: ");
            e.printStackTrace();
        }
    }
}

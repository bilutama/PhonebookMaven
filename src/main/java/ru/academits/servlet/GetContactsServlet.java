package ru.academits.servlet;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import ru.academits.PhoneBook;
import ru.academits.converter.ContactConverter;
import ru.academits.model.Contact;
import ru.academits.service.ContactService;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.OutputStream;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

public class GetContactsServlet extends HttpServlet {
    private final ContactService phoneBookService = PhoneBook.phoneBookService;
    private final ContactConverter contactConverter = PhoneBook.contactConverter;

    protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
        try {
            String termJson = req.getReader().lines().collect(Collectors.joining(System.lineSeparator()));
            Gson gson = new Gson();
            Type termJsonType = new TypeToken<String>() {}.getType();
            String term = gson.fromJson(termJson, termJsonType);

            List<Contact> contactList = phoneBookService.getAllContacts();

            // Filter contacts if term is passed
            if (term != null) {
                String finalTerm = term.toLowerCase(Locale.ROOT);

                contactList = contactList.stream()
                        .filter(c -> c.getFirstName().toLowerCase(Locale.ROOT).contains(finalTerm) ||
                                c.getLastName().toLowerCase(Locale.ROOT).contains(finalTerm) ||
                                c.getPhone().toLowerCase(Locale.ROOT).contains(finalTerm))
                        .collect(Collectors.toList());
            }

            String contactListJson = contactConverter.convertToJson(contactList);

            // Set the default response content type and encoding
            resp.setContentType("text/html; charset=UTF-8");
            resp.setCharacterEncoding("UTF-8");

            resp.getOutputStream().write(contactListJson.getBytes(StandardCharsets.UTF_8));
            resp.getOutputStream().flush();
            resp.getOutputStream().close();
        } catch (Exception e) {
            System.out.println("error in GetContactsServlet POST: ");
            e.printStackTrace();
        }
    }
}

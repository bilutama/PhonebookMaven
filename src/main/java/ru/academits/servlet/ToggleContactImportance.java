package ru.academits.servlet;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import ru.academits.PhoneBook;
import ru.academits.service.ContactService;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.lang.reflect.Type;
import java.util.stream.Collectors;

public class ToggleContactImportance extends HttpServlet {
    private final ContactService phoneBookService = PhoneBook.phoneBookService;

    protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
        try {
            String contactIdsJson = req.getReader().lines().collect(Collectors.joining(System.lineSeparator()));
            Gson gson = new Gson();
            Type contactIdType = new TypeToken<Integer>() {
            }.getType();

            int contactId = gson.fromJson(contactIdsJson, contactIdType);
            boolean isModeChanged = phoneBookService.toggleImportant(contactId);

            if (!isModeChanged) {
                System.out.println("Contact status change failed. Possible reason: contact was deleted.");
            }
        } catch (Exception e) {
            System.out.println("error in ToggleContactImportantServlet POST: ");
            e.printStackTrace();
        }
    }
}
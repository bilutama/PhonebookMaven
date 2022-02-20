package ru.academits.servlet;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import ru.academits.PhoneBook;
import ru.academits.service.ContactService;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.stream.Collectors;

public class DeleteContactsServlet extends HttpServlet {
    private final ContactService phoneBookService = PhoneBook.phoneBookService;

    public void doPost(HttpServletRequest req, HttpServletResponse resp) {
        try {
            String contactIdsJson = req.getReader().lines().collect(Collectors.joining(System.lineSeparator()));
            Gson gson = new Gson();
            Type contactIdsType = new TypeToken<ArrayList<Integer>>() {
            }.getType();

            ArrayList<Integer> contactsIds = gson.fromJson(contactIdsJson, contactIdsType);
            phoneBookService.deleteContacts(contactsIds);
        } catch (Exception e) {
            System.out.println("error in DeleteContactsServlet POST: ");
            e.printStackTrace();
        }
    }
}

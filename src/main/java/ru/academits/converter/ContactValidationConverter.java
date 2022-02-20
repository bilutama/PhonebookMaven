package ru.academits.converter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import ru.academits.service.ContactValidation;

public class ContactValidationConverter {
    private Gson gson = new GsonBuilder().create();

    public String convertToJson(ContactValidation contactValidation) {
        return gson.toJson(contactValidation);
    }
}

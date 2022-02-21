function Contact(firstName, lastName, phone) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.checked = false;
    this.shown = true;
}

new Vue({
    el: "#app",

    data: {
        isGeneralCheckboxChecked: false,
        isGeneralCheckBoxIndeterminate: false,

        validation: false,
        serverValidation: false,
        firstName: "",
        lastName: "",
        phone: "",
        rows: [],
        selectedRowsIds: [],
        serverError: ""
    },

    directives: {
        indeterminate(el, binding) {
            el.indeterminate = Boolean(binding.value)
        }
    },

    methods: {
        contactToString(contact) {
            let note = "(";
            note += contact.firstName + ", ";
            note += contact.lastName + ", ";
            note += contact.phone;
            note += ")";
            return note;
        },

        convertContactList(contactListFromServer) {
            return contactListFromServer.map((contact, i) => {
                return {
                    id: contact.id,
                    firstName: contact.firstName,
                    lastName: contact.lastName,
                    phone: contact.phone,
                    checked: false,
                    shown: true,
                    number: i + 1
                };
            });
        },

        addContact() {
            if (this.hasError) {
                this.validation = true;
                this.serverValidation = false;
                return;
            }

            const contact = new Contact(this.firstName, this.lastName, this.phone);

            $.ajax({
                type: "POST",
                url: "/phonebook/add",
                data: JSON.stringify(contact)
            }).done(() => {
                this.serverValidation = false;
            }).fail(ajaxRequest => {
                const contactValidation = JSON.parse(ajaxRequest.responseText);
                this.serverError = contactValidation.error;
                this.serverValidation = true;
            }).always(() => {
                this.loadData();
            });

            this.firstName = "";
            this.lastName = "";
            this.phone = "";
            this.validation = false;
        },

        deleteContacts(contactsIds) {
            $.ajax({
                type: "POST",
                url: "/phonebook/delete",
                data: JSON.stringify(contactsIds)
            }).done(() => {
                this.serverValidation = false;
            }).fail(ajaxRequest => {
                console.log(ajaxRequest);
            }).always(() => {
                this.loadData();
            });
        },

        loadData() {
            $.get("/phonebook/get/all").done(response => {
                const contactListFromServer = JSON.parse(response);
                this.rows = this.convertContactList(contactListFromServer);
            }).always(() => {
                // Recovery previously selected rows
                const remainedContactsIds = this.rows.map(row => row.id);
                this.selectedRowsIds = this.selectedRowsIds.filter(id => remainedContactsIds.includes(id));
                this.rows.forEach(row => row.checked = this.selectedRowsIds.includes(row.id));
            });
        }
    },

    computed: {
        firstNameError() {
            if (this.firstName) {
                return {
                    message: "",
                    error: false
                };
            }

            return {
                message: "Поле Имя должно быть заполнено.",
                error: true
            };
        },

        lastNameError() {
            if (!this.lastName) {
                return {
                    message: "Поле Фамилия должно быть заполнено.",
                    error: true
                };
            }

            return {
                message: "",
                error: false
            };
        },

        phoneError() {
            if (!this.phone) {
                return {
                    message: "Поле Телефон должно быть заполнено.",
                    error: true
                };
            }

            const sameContact = this.rows.some(c => {
                return c.phone === this.phone;
            });

            if (sameContact) {
                return {
                    message: "Номер телефона не должен дублировать другие номера в телефонной книге.",
                    error: true
                };
            }

            return {
                message: "",
                error: false
            };
        },

        hasError() {
            return this.lastNameError.error || this.firstNameError.error || this.phoneError.error;
        }
    },

    created() {
        this.loadData();
    },

    watch: {
        // Updating GeneralCheckBox status and selectedContactIds of selected contacts
        rows: {
            deep: true,

            handler() {
                if (this.rows.length === 0) {
                    this.isGeneralCheckboxChecked = false;
                    this.isGeneralCheckBoxIndeterminate = false;
                    return;
                }
                let checkedCount = 0;
                let uncheckedCount = 0;

                this.rows.forEach(row => {
                    const currentId = row.id;

                    if (row.checked) {
                        ++checkedCount;

                        // Update the array with ids for delete
                        if (!this.selectedRowsIds.includes(currentId)) {
                            this.selectedRowsIds.push(currentId);
                        }
                    } else {
                        ++uncheckedCount;

                        // Update the array with ids for delete
                        this.selectedRowsIds = this.selectedRowsIds.filter(id => id !== currentId);
                    }
                });

                if (checkedCount > 0 && uncheckedCount > 0) {
                    this.isGeneralCheckBoxIndeterminate = true;
                    return;
                }

                this.isGeneralCheckBoxIndeterminate = false;
                this.isGeneralCheckboxChecked = checkedCount > 0;
            }
        },

        isGeneralCheckboxChecked() {
            this.rows.forEach(c => c.checked = this.isGeneralCheckboxChecked);
        }
    }
});


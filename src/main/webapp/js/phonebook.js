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

        contactForDelete: null,
        contactFullName: "",
        contactIdsForDelete: [],

        validation: false,
        serverValidation: false,
        firstName: "",
        lastName: "",
        phone: "",
        rows: [],
        selectedRowsIds: [],
        serverError: "",

        term: ""
    },

    directives: {
        indeterminate(el, binding) {
            el.indeterminate = Boolean(binding.value)
        }
    },

    methods: {
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

        clearForm() {
            this.firstName = "";
            this.lastName = "";
            this.phone = "";

            this.validation = false;
        },

        resetFilter() {
            this.term = "";
            this.loadData();
        },

        formatString(string, isCapitalized) {
            const separator = " ";
            const stringsArray = string.trim().toLowerCase().split(separator);

            if (isCapitalized) {
                for (let i = 0; i < stringsArray.length; ++i) {
                    stringsArray[i] = stringsArray[i].charAt(0).toUpperCase() + stringsArray[i].slice(1);
                }
            }

            return stringsArray.join(separator);
        },

        addContact() {
            if (this.hasError) {
                this.validation = true;
                this.serverValidation = false;
                return;
            }

            const contact = new Contact(
                this.formatString(this.firstName, true),
                this.formatString(this.lastName, true),
                this.formatString(this.phone, false)
            );

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

        showConfirmDeleteDialog(contact) {
            this.contactForDelete = null;

            if (contact === null && this.selectedRowsIds.length === 0) {
                return;
            }

            this.contactIdsForDelete = contact === null ? this.selectedRowsIds : [contact.id];

            // _contactForDelete_ is used to pass contact data to modal dialog
            // _contactForDelete_ is passed when contact deleted with x button or
            // when only one contact is selected with checkbox
            if (contact === null) {
                if (this.contactIdsForDelete.length === 1) {
                    this.contactForDelete = this.rows.filter(row => row.id === this.contactIdsForDelete[0])[0];
                } else {
                    this.contactForDelete = null; // Set to null if _contactForDelete_ was set previously and not updated
                }
            } else {
                this.contactForDelete = contact;
            }

            new bootstrap.Modal($("#delete_confirmation_modal"), {}).show();
        },

        confirmDelete(contactIds) {
            $.ajax({
                type: "POST",
                url: "/phonebook/delete",
                data: JSON.stringify(contactIds)
            }).done(() => {
                this.serverValidation = false;

                this.contactForDelete = null;
                // Clear selectedRowsIds array from contacts ids that were deleted
                this.selectedRowsIds = this.selectedRowsIds.filter(deletedContactId => !this.contactIdsForDelete.includes(deletedContactId));
            }).fail(ajaxRequest => {
                console.log(ajaxRequest);
            }).always(() => {
                this.loadData(this.term);
            });
        },

        exportContacts() {
            var req = new XMLHttpRequest();
            req.open("GET", "/file.pdf", true);
            req.responseType = "blob";

            req.onload = function (event) {
                const blob = req.response;
                console.log(blob.size);
                var link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = "phonebook_" + new Date() + ".xlsx";
                link.click();
            };

            req.send();

            // $.ajax({
            //     dataType: "native",
            //     url: "/phonebook/export",
            //     xhrFields: {
            //         responseType: "blob"
            //     }
            // }).done(blob => {
            //     console.log(blob.size);
            //     const link = document.createElement("a");
            //     link.href = window.URL.createObjectURL(blob);
            //     link.download = "phonebook_" + new Date() + ".xlsx";
            //     link.click();
            // }).fail(()=>{
            //     console.log("Error getting file");
            // });
        },

        loadData(term) {
            $.ajax({
                type: "POST",
                url: "/phonebook/get",
                data: term === null ? "" : JSON.stringify(term)
            }).done(response => {
                const contactListFromServer = JSON.parse(response);
                this.rows = this.convertContactList(contactListFromServer);
            }).fail(ajaxRequest => {
                console.log(ajaxRequest.message);
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
                message: "Please provide your first name",
                error: true
            };
        },

        lastNameError() {
            if (!this.lastName) {
                return {
                    message: "Please provide your last name",
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
        },

        confirmDeleteModalMessage() {
            return this.contactForDelete === null ?
                "Delete selected contacts?" :
                "Delete contact " + this.contactForDelete.firstName + " " + this.contactForDelete.lastName + "?";
        }
    },

    created() {
        this.loadData();
    },

    watch: {
        // Updating GeneralCheckBox status and selectedRowsIds of selected contacts
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


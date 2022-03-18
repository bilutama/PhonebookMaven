function Contact(firstName, lastName, phone, important) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.important = important;
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
        important: false,

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
                    number: i + 1,
                    id: contact.id,
                    firstName: contact.firstName,
                    lastName: contact.lastName,
                    phone: contact.phone,
                    important: contact.important,
                    checked: false,
                    shown: true
                };
            });
        },

        clearForm() {
            this.firstName = "";
            this.lastName = "";
            this.phone = "";
            this.important = false;

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

            if (this.phoneExists) {
                new bootstrap.Modal($("#telephone_exists_modal"), {}).show();
                return;
            }

            const contact = new Contact(
                this.formatString(this.firstName, true),
                this.formatString(this.lastName, true),
                this.formatString(this.phone, false),
                this.important
            );

            console.log("ADD CONTACT:");
            console.log(contact);

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
                this.clearForm();
            });
        },

        toggleImportant(contactId) {
            $.ajax({
                type: "POST",
                url: "/phonebook/toggleimportance",
                data: JSON.stringify(contactId)
            }).fail(() => {
                console.log("Toggle importance failed. Possible reason: contact was deleted on server");
            });
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
            //window.open(("/phonebook/export"), "_blank");

            $.ajax({
                type: "GET",
                url: "/phonebook/export",
            }).done(response => {
                const url = window.URL.createObjectURL(new Blob([response]));

                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "phonebook.xlsx");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }).fail(ajaxRequest => {
                console.log(ajaxRequest);
            });
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
            // First name is required
            if (!this.firstName) {
                return {
                    error: true
                };
            }

            return {
                error: false
            };
        },

        lastNameError() {
            // Last name is required
            if (!this.lastName) {
                return {
                    error: true
                };
            }

            return {
                error: false
            };
        },

        phoneError() {
            // Phone is required
            if (!this.phone) {
                return {
                    error: true
                };
            }

            return {
                message: "",
                error: false
            };
        },

        phoneExists() {
            return this.rows.some(c => {
                return c.phone === this.phone;
            });
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
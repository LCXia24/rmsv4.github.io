// Create a new Dexie database
const db = new Dexie("InvoiceDatabase");
db.version(1).stores({
    invoices: "++id,date,particulars,address,tin_no,Receipt_Number,invoice_amount,vat_status"
});

// Load existing data from IndexedDB
async function loadInvoiceData() {
    const storedData = await db.invoices.toArray();
    if (storedData.length > 0) {
        invoiceData = storedData;
        displayInvoices(); // Display loaded invoices
    }
}

// Save data to IndexedDB
async function saveInvoiceData() {
    await db.invoices.clear(); // Clear existing data
    await db.invoices.bulkPut(invoiceData); // Save all invoices
}

let invoiceData = [];

document.getElementById('add_invoice').addEventListener('click', async function() {
    const date = document.getElementById('date').value;
    const particulars = document.getElementById('particulars').value;
    const address = document.getElementById('address').value;
    const tin_no = document.getElementById('tin_no').value;
    const Receipt_Number = document.getElementById('Receipt_Number').value;
    const invoice_amount = document.getElementById('invoice_amount').value;
    const vat_status = document.getElementById('vat_status').value;

    invoiceData.push({
        date,
        particulars,
        address,
        tin_no,
        Receipt_Number,
        invoice_amount,
        vat_status
    });

    // Clear input fields
    document.getElementById('date').value = '';
    document.getElementById('particulars').value = '';
    document.getElementById('address').value = '';
    document.getElementById('tin_no').value = '';
    document.getElementById('Receipt_Number').value = '';
    document.getElementById('invoice_amount').value = '';

    alert("Invoice data added! You can add another.");
    displayInvoices(); // Update the displayed invoices
    await saveInvoiceData(); // Save to IndexedDB
});

document.getElementById('clear_data').addEventListener('click', function() {
    // Clear input fields
    document.getElementById('date').value = '';
    document.getElementById('particulars').value = '';
    document.getElementById('address').value = '';
    document.getElementById('tin_no').value = '';
    document.getElementById('Receipt_Number').value = '';
    document.getElementById('invoice_amount').value = '';

    // Clear invoice data
    invoiceData = [];
    displayInvoices(); // Update the displayed invoices
});

document.getElementById('save_xlsx').addEventListener('click', async function() {
    if (invoiceData.length === 0) {
        alert("No invoice data to save.");
        return;
    }

    // Separate VAT and NON-VAT data
    const vatData = invoiceData.filter(invoice => invoice.vat_status === "VAT Registered");
    const nonVatData = invoiceData.filter(invoice => invoice.vat_status === "Not VAT Registered");

    // Create worksheets
    const vatWorksheet = XLSX.utils.json_to_sheet(vatData);
    const nonVatWorksheet = XLSX.utils.json_to_sheet(nonVatData);

    // Create a new workbook for VAT data
    const vatWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(vatWorkbook, vatWorksheet, "VAT");

    // Create a new workbook for NON-VAT data
    const nonVatWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(nonVatWorkbook, nonVatWorksheet, "NON-VAT");

    // Save the VAT workbook with a specific file name
    XLSX.writeFile(vatWorkbook, "Vat.xlsx");
    
    // Save the NON-VAT workbook with a specific file name
    XLSX.writeFile(nonVatWorkbook, "NonVat.xlsx");

    // Clear invoice data after saving
    invoiceData = [];
    displayInvoices(); // Update the displayed invoices
});

// Search functionality
document.getElementById('search_button').addEventListener('click', function() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    displayInvoices(searchTerm);
});

async function displayInvoices(searchTerm = '') {
    const invoiceList = document.getElementById('invoice_list');
    invoiceList.innerHTML = ''; // Clear previous results

    const filteredInvoices = invoiceData.filter(invoice => 
        invoice.particulars.toLowerCase().includes(searchTerm)
    );

    filteredInvoices.forEach(invoice => {
        const invoiceItem = document.createElement('div');
        invoiceItem.textContent = `Date: ${invoice.date}, Particulars: ${invoice.particulars}, Address: ${invoice.address}, TIN No: ${invoice.tin_no}, Receipt_Number: ${invoice.Receipt_Number}, Invoice Amount: ${invoice.invoice_amount}, VAT Status: ${invoice.vat_status}`;
        invoiceList.appendChild(invoiceItem);
    });
}

loadInvoiceData(); // Load existing data
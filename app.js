// DOM Elements
const openModalButton = document.getElementById('open-modal');
const closeModalButton = document.getElementById('close-modal');
const deleteButton = document.getElementById('delete-btn');
const modalContainer = document.getElementById('modal_container');
const filterLabel = document.querySelector('.filter-label');
const filterBox = document.querySelector('.filter-box');
const cardsContainer = document.querySelector('.cards');
const form = document.getElementById('invoice-form');
const invoiceCountElement = document.getElementById('count-invoices');
const modalTitle = document.getElementById('modal-title');
const submitButton = document.getElementById('submit-btn');
const noInvoicesMessage = document.getElementById('no-invoices-message');
const flashMessage = document.getElementById('flash-message');

// JSON Data - Initial invoices
let invoices = [
    { id: "RBEE-8372", date: "2021-08-19", customerName: "John Doe", amount: "900", currency: "$", status: "Paid" },
    { id: "RBEE-9541", date: "2021-08-20", customerName: "Mahatma Gandhi", amount: "9000", currency: "$", status: "Paid" },
    { id: "RBEE-6213", date: "2021-08-30", customerName: "Jawaharlal Nehru", amount: "909", currency: "$", status: "Pending" },
    { id: "RBEE-7845", date: "2021-08-30", customerName: "Bignesh Kumar", amount: "909", currency: "$", status: "Paid" }
];

let editingInvoiceId = null;
let currentFilter = 'all';

// Generate random invoice ID
function generateInvoiceId() {
    const prefix = "RBEE-";
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    return prefix + randomNum;
}

// Event Listeners
openModalButton.addEventListener('click', () => {
    resetForm();
    modalTitle.textContent = 'Create New Invoice';
    deleteButton.style.display = 'none';
    submitButton.textContent = 'Submit';
    
    // Generate a random invoice ID
    document.getElementById('invoice-id').value = generateInvoiceId();
    
    // Set current date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoice-date').value = today;
    
    modalContainer.classList.add('show');
});

closeModalButton.addEventListener('click', () => {
    modalContainer.classList.remove('show');
});

filterLabel.addEventListener('click', () => {
    filterBox.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.filter-box')) {
        filterBox.classList.remove('active');
    }
});

form.addEventListener('submit', handleFormSubmit);
deleteButton.addEventListener('click', handleDeleteInvoice);

filterBox.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-option')) {
        const filterValue = e.target.dataset.value;
        filterBox.classList.remove('active');
        setActiveFilter(e.target);
        currentFilter = filterValue;
        filterCards(filterValue);
    }
});

// Functions
function resetForm() {
    form.reset();
    editingInvoiceId = null;
}

function createCard(invoice) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.id = invoice.id;
    
    const cardNumber = document.createElement('p');
    cardNumber.classList.add('card-number');
    cardNumber.textContent = invoice.id;
    
    const cardDate = document.createElement('p');
    cardDate.classList.add('card-date');
    cardDate.textContent = formatDate(invoice.date);
    
    const cardName = document.createElement('p');
    cardName.classList.add('card-name');
    cardName.textContent = invoice.customerName;
    
    const cardAmount = document.createElement('p');
    cardAmount.classList.add('card-amount');
    cardAmount.textContent = `${invoice.currency}${invoice.amount}`;
    
    const statusContainer = document.createElement('div');
    statusContainer.classList.add('card-status');
    
    const statusDropdown = document.createElement('select');
    statusDropdown.classList.add('status-dropdown');
    
    const paidOption = document.createElement('option');
    paidOption.value = 'Paid';
    paidOption.textContent = 'Paid';
    
    const pendingOption = document.createElement('option');
    pendingOption.value = 'Pending';
    pendingOption.textContent = 'Pending';
    
    statusDropdown.appendChild(paidOption);
    statusDropdown.appendChild(pendingOption);
    statusDropdown.value = invoice.status;
    
    // Set background color based on status
    if (invoice.status === 'Paid') {
        statusDropdown.style.backgroundColor = '#4ade80';
    } else {
        statusDropdown.style.backgroundColor = '#ef4444';
    }
    
    statusDropdown.addEventListener('change', () => {
        const newStatus = statusDropdown.value;
        updateInvoiceStatus(invoice.id, newStatus);
        
        // Update dropdown color based on new status
        if (newStatus === 'Paid') {
            statusDropdown.style.backgroundColor = '#4ade80';
        } else {
            statusDropdown.style.backgroundColor = '#ef4444';
        }
    });
    
    statusContainer.appendChild(statusDropdown);
    
    // Add card click event for editing
    card.addEventListener('click', (e) => {
        // Don't open edit modal if clicking on the status dropdown
        if (e.target !== statusDropdown) {
            openEditModal(invoice.id);
        }
    });
    
    card.appendChild(cardNumber);
    card.appendChild(cardDate);
    card.appendChild(cardName);
    card.appendChild(cardAmount);
    card.appendChild(statusContainer);
    
    cardsContainer.appendChild(card);
    updateInvoiceCount();
}

function updateInvoiceStatus(invoiceId, newStatus) {
    const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
    if (invoiceIndex !== -1) {
        invoices[invoiceIndex].status = newStatus;
        
        // Re-filter if we're currently filtering
        if (currentFilter !== 'all') {
            filterCards(currentFilter);
        }
    }
}

function updateInvoiceCount() {
    const visibleCards = document.querySelectorAll('.card[style*="display: flex"], .card:not([style*="display"])').length;
    invoiceCountElement.textContent = visibleCards;
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(form);
    const invoiceId = formData.get('invoice-id');
    const invoiceDate = formData.get('invoice-date');
    const customerName = formData.get('customer-name');
    const amount = formData.get('amount');
    const currency = formData.get('currency');
    const status = formData.get('status');
    
    // Validate required fields
    if (!invoiceDate || !customerName || !amount || !currency) {
        showFlashMessage('Please fill all required fields');
        return;
    }
    
    if (editingInvoiceId) {
        // Update existing invoice
        const invoiceIndex = invoices.findIndex(inv => inv.id === editingInvoiceId);
        if (invoiceIndex !== -1) {
            invoices[invoiceIndex] = {
                id: invoiceId,
                date: invoiceDate,
                customerName: customerName,
                amount: amount,
                currency: currency,
                status: status
            };
            
            // Update the UI
            refreshCards();
            showFlashMessage('Invoice updated successfully!');
        }
    } else {
        // Create new invoice
        const newInvoice = {
            id: invoiceId,
            date: invoiceDate,
            customerName: customerName,
            amount: amount,
            currency: currency,
            status: status
        };
        
        invoices.push(newInvoice);
        
        // Add to UI if it matches current filter
        if (currentFilter === 'all' || currentFilter === status.toLowerCase()) {
            createCard(newInvoice);
        } else {
            updateInvoiceCount(); // Update count even if we don't add a card
        }
        
        showFlashMessage('Invoice created successfully!');
    }
    
    modalContainer.classList.remove('show');
    checkNoInvoices();
}

function handleDeleteInvoice() {
    if (editingInvoiceId) {
        const invoiceIndex = invoices.findIndex(inv => inv.id === editingInvoiceId);
        if (invoiceIndex !== -1) {
            invoices.splice(invoiceIndex, 1);
            
            // Update the UI
            refreshCards();
            showFlashMessage('Invoice deleted successfully!');
            modalContainer.classList.remove('show');
            checkNoInvoices();
        }
    }
}

function openEditModal(invoiceId) {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
        // Set form values
        document.getElementById('invoice-id').value = invoice.id;
        document.getElementById('invoice-date').value = invoice.date;
        document.getElementById('customer-name').value = invoice.customerName;
        document.getElementById('amount').value = invoice.amount;
        document.getElementById('currency').value = invoice.currency;
        document.getElementById('status').value = invoice.status;
        
        // Update modal for editing
        modalTitle.textContent = 'Edit Invoice';
        submitButton.textContent = 'Update';
        deleteButton.style.display = 'block';
        editingInvoiceId = invoiceId;
        
        modalContainer.classList.add('show');
    }
}

function filterCards(status) {
    const cards = document.querySelectorAll('.card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const cardId = card.dataset.id;
        const invoice = invoices.find(inv => inv.id === cardId);
        
        if (invoice) {
            const cardStatus = invoice.status.toLowerCase();
            const shouldShow = status === 'all' || cardStatus === status.toLowerCase();
            
            card.style.display = shouldShow ? 'flex' : 'none';
            
            if (shouldShow) {
                visibleCount++;
            }
        }
    });
    
    // Update the invoice count based on visible cards
    invoiceCountElement.textContent = visibleCount;
    
    // Show "no invoices" message if needed
    checkNoInvoices();
}

function checkNoInvoices() {
    const visibleCards = document.querySelectorAll('.card[style*="display: flex"], .card:not([style*="display"])');
    
    if (visibleCards.length === 0) {
        noInvoicesMessage.style.display = 'block';
        if (currentFilter !== 'all') {
            noInvoicesMessage.textContent = `No ${currentFilter} invoices found.`;
        } else {
            noInvoicesMessage.textContent = 'No invoices found.';
        }
    } else {
        noInvoicesMessage.style.display = 'none';
    }
}

function setActiveFilter(selectedOption) {
    document.querySelectorAll('.filter-option').forEach(option => {
        option.classList.remove('active');
    });
    selectedOption.classList.add('active');
}
function refreshCards() {
    // Clear all existing cards
    cardsContainer.innerHTML = '';
    
    // Re-create cards based on current filter
    invoices.forEach(invoice => {
        if (currentFilter === 'all' || invoice.status.toLowerCase() === currentFilter.toLowerCase()) {
            createCard(invoice);
        }
    });
    
    // Update count and check for no invoices
    updateInvoiceCount();
    checkNoInvoices();
}

function formatDate(dateString) {
    // Convert YYYY-MM-DD to a more readable format
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function showFlashMessage(message) {
    flashMessage.textContent = message;
    flashMessage.style.display = 'block';
    
    // Hide the message after 3 seconds
    // setTimeout(() => {
    //     flashMessage.style.display = 'none';
    // }, 3000);
}

// Initialize the application
function initApp() {
    // Clear cards container
    cardsContainer.innerHTML = '';
    
    // Create cards from initial data
    invoices.forEach(invoice => {
        createCard(invoice);
    });
    
    // Set active filter to 'all' by default
    const allFilterOption = document.querySelector('.filter-option[data-value="all"]');
    setActiveFilter(allFilterOption);
    
    // Check for no invoices
    checkNoInvoices();
}

// Call the init function when the page loads
window.addEventListener('DOMContentLoaded', initApp);
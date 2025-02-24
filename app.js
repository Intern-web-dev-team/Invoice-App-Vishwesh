const open = document.getElementById('open-modal');
const close = document.getElementById('close-modal');
const modal = document.getElementById('modal_container');

open.addEventListener('click', () => {
    modal.classList.add('show');
});

close.addEventListener('click', () => {
    modal.classList.remove('show');
});


let count = 0;
// JSON data
const cardData = [
    {
        "invoice-Id": "RT6969",
        "invoice-date": "2021-08-19",
        "customer-name": "John Doe",
        "amount": "$900",
        "status": "Paid"
    },
    {
        "invoice-Id": "RT9696",
        "invoice-date": "2021-08-20",
        "customer-name": "gandhi",
        "amount": "$9000",
        "status": "Paid"
    },
    {
        "invoice-Id": "RT6699",
        "invoice-date": "2021-08-30",
        "customer-name": "nehru",
        "amount": "$909",
        "status": "Paid"
    },
    {
        "invoice-Id": "RT6699",
        "invoice-date": "2021-08-30",
        "customer-name": "Bignesh",
        "amount": "$909",
        "status": "Paid"
    }
]


document.querySelector('.filter-label').addEventListener('click', function() {
    document.querySelector('.filter-box').classList.toggle('active');
});

document.querySelectorAll('.filter-option').forEach(option => {
    option.addEventListener('click', function() {
        const value = this.dataset.value;
        document.querySelector('.filter-box').classList.remove('active');
        // Handle filter selection here
    });
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.filter-box')) {
        document.querySelector('.filter-box').classList.remove('active');
    }
});

//create a card
function createCard(data){const card = document.createElement('div');
card.classList.add('card');

const cardNumber = document.createElement('p');
cardNumber.classList.add('card-number');
cardNumber.textContent = data['invoice-Id'];
card.appendChild(cardNumber);

const cardDate = document.createElement('p');
cardDate.classList.add('card-date');
cardDate.textContent = data['invoice-date'];
card.appendChild(cardDate);

const cardName = document.createElement('p');
cardName.classList.add('card-name');
cardName.textContent = data['customer-name'];
card.appendChild(cardName);

const cardAmount = document.createElement('p'); 
cardAmount.classList.add('card-amount');
cardAmount.textContent = data['amount'];
card.appendChild(cardAmount);

const cardStatus = document.createElement('p');
cardStatus.classList.add('card-status');
cardStatus.textContent = data['status'];
card.appendChild(cardStatus);

//append the card to the div called cards that is already in the html
document.querySelector('.cards').appendChild(card);
count++;
document.querySelector('#count-invoices').innerHTML = count;
}

//loop through json data and create cards for each item
cardData.forEach(createCard);

// Existing code...

// Function to handle form submission
document.querySelector('.form-elements').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from submitting

    // Get form values
    const invoiceId = document.getElementById('invoice-id').value;
    const invoiceDate = document.getElementById('invoice-date').value;
    const customerName = document.getElementById('customer-name').value;
    const amount = document.getElementById('amount').value;
    const status = "Paid"; // Default status, or you can add a status field in the form

    // Create a new card object
    const newCardData = {
        "invoice-Id": invoiceId,
        "invoice-date": invoiceDate,
        "customer-name": customerName,
        "amount": amount,
        "status": status
    };

    // Create and append the new card
    createCard(newCardData);

    // Close the modal after submission
    modal.classList.remove('show');

    // Reset the form (optional)
    document.querySelector('.form-elements').reset();
});
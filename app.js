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
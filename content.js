function applyFilterAndSort(event) {
    // Prevent default button behavior and page reload
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const tbody = document.querySelector('#tblAvailFancyNumber_data');
    if (!tbody) {
        alert("Table not found! Please make sure you are on the search results page.");
        return false;
    }

    const rows = Array.from(tbody.querySelectorAll('tr'));

    // 1. Sort based on 6th column (index 5)
    rows.sort((a, b) => {
        const valA = parseFloat(a.cells[5]?.textContent.trim()) || 0;
        const valB = parseFloat(b.cells[5]?.textContent.trim()) || 0;
        return valA - valB;
    });

    // 2. Re-append and Filter
    rows.forEach(row => {
        tbody.appendChild(row);
        const regCell = row.querySelector('[id$="regigtrationNumber"]');
        const isHR26 = regCell && regCell.textContent.trim().startsWith('HR26');
        row.style.display = isHR26 ? '' : 'none';
    });
    
    return false;
}

// Function to inject the button into the UI
function injectButton() {
    const table = document.querySelector('#tblAvailFancyNumber');
    if (table && !document.getElementById('fancy-filter-btn')) {
        const btn = document.createElement('button');
        btn.id = 'fancy-filter-btn';
        btn.type = 'button'; // Prevent form submission
        btn.innerText = 'Filter HR26 & Sort Ascending';
        btn.style.cssText = 'margin-bottom: 10px; padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;';
        
        btn.addEventListener('click', applyFilterAndSort, false);
        table.parentNode.insertBefore(btn, table);
    }
}

// Run injection check every 2 seconds because the page uses AJAX to load tables
setInterval(injectButton, 2000);


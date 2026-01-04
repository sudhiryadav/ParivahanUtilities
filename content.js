// Store original row order for reset
let originalRowOrder = [];

// Store sort state (column index and direction: null, 'asc', 'desc')
let currentSortState = {
    column: 5, // Default to Total Applicants
    direction: 'asc' // Default to ascending
};

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

    // Get filter values from inputs (respect existing filters)
    const currentFilters = {
        reservePrice: document.getElementById('filter-reserveprice')?.value || '',
        bidSecurity: document.getElementById('filter-bidsecurity')?.value || '',
        totalApplicants: document.getElementById('filter-totalapplicants')?.value.trim() || '',
        numberTypeFancy: document.getElementById('filter-numbertype-fancy')?.checked || false
    };

    // Get sort column and direction from current sort state
    const sortColumn = currentSortState.column;
    const sortDirection = currentSortState.direction;

    let rows = Array.from(tbody.querySelectorAll('tr'));

    // Apply sorting if enabled
    if (sortColumn !== null && sortDirection) {
        rows.sort((a, b) => {
            let valA, valB;

            // For numeric columns (0, 2, 3, 4, 5)
            if ([0, 2, 3, 4, 5].includes(sortColumn)) {
                valA = parseFloat(a.cells[sortColumn]?.textContent.trim()) || 0;
                valB = parseFloat(b.cells[sortColumn]?.textContent.trim()) || 0;
            } else {
                // For text columns (1, 6)
                valA = a.cells[sortColumn]?.textContent.trim().toLowerCase() || '';
                valB = b.cells[sortColumn]?.textContent.trim().toLowerCase() || '';
            }

            if (sortDirection === 'asc') {
                return valA > valB ? 1 : valA < valB ? -1 : 0;
            } else {
                return valA < valB ? 1 : valA > valB ? -1 : 0;
            }
        });
    }

    // Re-append rows (sorted if sorting was applied)
    rows.forEach(row => tbody.appendChild(row));

    // Apply filters (HR26 + existing filters with AND logic)
    rows.forEach(row => {
        let shouldShow = true;

        // Always apply HR26 filter
        const regCell = row.querySelector('[id$="regigtrationNumber"]');
        const isHR26 = regCell && regCell.textContent.trim().startsWith('HR26');
        if (!isHR26) {
            shouldShow = false;
        }

        // Apply existing filters if set
        if (shouldShow && currentFilters.srNo) {
            const srNoText = row.cells[0]?.textContent.trim() || '';
            if (!srNoText.includes(currentFilters.srNo)) {
                shouldShow = false;
            }
        }

        if (shouldShow && currentFilters.reservePrice) {
            const priceText = row.querySelector('[id$="reservenumberprice"]')?.textContent.trim() || '';
            const price = parseFloat(priceText);
            // Dropdown value is already in numeric format (e.g., 150000)
            const filterPrice = parseFloat(currentFilters.reservePrice);
            if (isNaN(price) || price !== filterPrice) {
                shouldShow = false;
            }
        }

        if (shouldShow && currentFilters.bidSecurity) {
            const securityText = row.querySelector('[id$="securityFee"]')?.textContent.trim() || '';
            const security = parseFloat(securityText);
            // Dropdown value is already in numeric format (e.g., 30000)
            const filterSecurity = parseFloat(currentFilters.bidSecurity);
            if (isNaN(security) || security !== filterSecurity) {
                shouldShow = false;
            }
        }

        if (shouldShow && currentFilters.totalApplicants) {
            const applicantsText = row.querySelector('[id$="totalapllicant"]')?.textContent.trim() || '';
            const applicants = parseFloat(applicantsText);
            const filterApplicants = parseFloat(currentFilters.totalApplicants);
            if (isNaN(applicants) || applicants !== filterApplicants) {
                shouldShow = false;
            }
        }

        if (shouldShow && currentFilters.numberTypeFancy) {
            const typeText = row.querySelector('[id$="numbeType"]')?.textContent.trim().toLowerCase() || '';
            if (typeText !== 'fancy') {
                shouldShow = false;
            }
        }

        row.style.display = shouldShow ? '' : 'none';
    });

    return false;
}

function resetFilter(event) {
    // Prevent default button behavior and page reload
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const tbody = document.querySelector('#tblAvailFancyNumber_data');
    if (!tbody) {
        return false;
    }

    // Reset all filter inputs
    const filterInputs = ['filter-totalapplicants'];
    filterInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
    });

    // Reset dropdowns
    const reservePriceSelect = document.getElementById('filter-reserveprice');
    const bidSecuritySelect = document.getElementById('filter-bidsecurity');
    if (reservePriceSelect) reservePriceSelect.value = '';
    if (bidSecuritySelect) bidSecuritySelect.value = '';

    // Reset checkbox
    const numberTypeCheckbox = document.getElementById('filter-numbertype-fancy');
    if (numberTypeCheckbox) numberTypeCheckbox.checked = false;

    // Reset sort state to default
    currentSortState = { column: 5, direction: 'asc' };
    updateSortArrows();

    // Show all rows (remove display:none)
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        row.style.display = '';
    });

    // Re-apply filters to maintain HR26 filter if needed
    applyFilterAndSort({ preventDefault: () => { }, stopPropagation: () => { } });

    return false;
}

// Function to show copy registration numbers modal
function showCopyModal(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const tbody = document.querySelector('#tblAvailFancyNumber_data');
    if (!tbody) {
        alert("Table not found! Please make sure you are on the search results page.");
        return false;
    }

    // Get all visible (filtered) rows
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const visibleRows = rows.filter(row => row.style.display !== 'none');

    if (visibleRows.length === 0) {
        alert("No filtered rows to copy!");
        return false;
    }

    // Extract registration numbers, applicants, and reserve price
    const data = [];
    visibleRows.forEach(row => {
        const regCell = row.querySelector('[id$="regigtrationNumber"]');
        const applicantsCell = row.querySelector('[id$="totalapllicant"]');
        const priceCell = row.querySelector('[id$="reservenumberprice"]');

        if (regCell) {
            let regNumber = regCell.textContent.trim();
            // Remove HR26 prefix
            if (regNumber.startsWith('HR26')) {
                regNumber = regNumber.substring(4);
            }
            // Add hyphen before the last 4 digits (e.g., AB1234 -> AB-1234)
            if (regNumber.length >= 5) {
                const prefix = regNumber.slice(0, -4);
                const suffix = regNumber.slice(-4);
                regNumber = `${prefix}-${suffix}`;
            }
            const applicants = applicantsCell ? applicantsCell.textContent.trim() : '';
            const price = priceCell ? priceCell.textContent.trim() : '';
            data.push({
                regNumber: regNumber,
                applicants: applicants,
                price: price
            });
        }
    });

    // Create or get modal
    let modalOverlay = document.getElementById('copy-reg-modal-overlay');
    if (!modalOverlay) {
        modalOverlay = document.createElement('div');
        modalOverlay.id = 'copy-reg-modal-overlay';
        modalOverlay.className = 'pv-modal-overlay';
        document.body.appendChild(modalOverlay);

        const modal = document.createElement('div');
        modal.className = 'pv-modal';

        // Modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'pv-modal-header';
        const modalTitle = document.createElement('h3');
        modalTitle.className = 'pv-modal-title';
        modalTitle.innerText = 'Filtered Registration Numbers';
        const closeBtn = document.createElement('button');
        closeBtn.className = 'pv-modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('show');
        });
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeBtn);

        // Modal body
        const modalBody = document.createElement('div');
        modalBody.className = 'pv-modal-body';
        const modalList = document.createElement('ul');
        modalList.className = 'pv-modal-list';
        modalList.id = 'copy-reg-modal-list';
        modalBody.appendChild(modalList);

        // Modal footer
        const modalFooter = document.createElement('div');
        modalFooter.className = 'pv-modal-footer';
        const copyBtn = document.createElement('button');
        copyBtn.className = 'pv-btn';
        copyBtn.style.backgroundColor = '#4CAF50';
        copyBtn.innerText = 'Copy Registration Numbers';
        copyBtn.id = 'copy-reg-modal-copy-btn';
        modalFooter.appendChild(copyBtn);

        modal.appendChild(modalHeader);
        modal.appendChild(modalBody);
        modal.appendChild(modalFooter);
        modalOverlay.appendChild(modal);

        // Close on overlay click
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('show');
            }
        });
    }

    // Update modal list
    const modalList = document.getElementById('copy-reg-modal-list');
    modalList.innerHTML = '';

    if (data.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.className = 'pv-modal-empty';
        emptyMsg.innerText = 'No registration numbers found';
        modalList.appendChild(emptyMsg);
    } else {
        data.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'pv-modal-list-item';
            listItem.innerText = `${item.regNumber}, ${item.applicants}, ${item.price}`;
            modalList.appendChild(listItem);
        });
    }

    // Update copy button handler with current data
    const copyBtn = document.getElementById('copy-reg-modal-copy-btn');
    if (copyBtn) {
        // Store current data in a data attribute
        copyBtn.setAttribute('data-reg-numbers', JSON.stringify(data));

        // Remove existing event listeners by cloning (event listeners aren't cloned)
        const newCopyBtn = copyBtn.cloneNode(true);
        copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);

        // Add click handler that reads from data attribute
        newCopyBtn.addEventListener('click', function () {
            const dataAttr = this.getAttribute('data-reg-numbers');
            const currentData = dataAttr ? JSON.parse(dataAttr) : data;
            // Copy full row: registration number, applicants, price (comma separated)
            const fullRows = currentData.map(item => `${item.regNumber}, ${item.applicants}, ${item.price}`).join('\n');
            navigator.clipboard.writeText(fullRows).then(() => {
                const originalText = this.innerText;
                this.innerText = 'Copied!';
                setTimeout(() => {
                    this.innerText = originalText;
                }, 2000);
            }).catch(err => {
                alert('Failed to copy to clipboard');
                console.error('Copy error:', err);
            });
        });
    }

    // Show modal
    modalOverlay.classList.add('show');

    return false;
}

// Function to handle column header click for sorting
function handleColumnSort(columnIndex) {
    // Cycle through: default (no sort) -> asc -> desc -> default
    if (currentSortState.column === columnIndex) {
        if (currentSortState.direction === 'asc') {
            currentSortState.direction = 'desc';
        } else if (currentSortState.direction === 'desc') {
            currentSortState.column = null;
            currentSortState.direction = null;
        }
    } else {
        currentSortState.column = columnIndex;
        currentSortState.direction = 'asc';
    }

    updateSortArrows();
    applyFilterAndSort({ preventDefault: () => { }, stopPropagation: () => { } });
}

// Function to update sort arrow indicators
function updateSortArrows() {
    const thead = document.querySelector('#tblAvailFancyNumber_head');
    if (!thead) return;

    const headers = thead.querySelectorAll('th');
    headers.forEach((header, index) => {
        // Skip the last column (Select Number - index 7)
        if (index >= 7) return;

        let arrowContainer = header.querySelector('.sort-arrow-container');
        if (!arrowContainer) return;

        const upArrow = arrowContainer.querySelector('.sort-arrow-up');
        const downArrow = arrowContainer.querySelector('.sort-arrow-down');

        if (currentSortState.column === index) {
            if (currentSortState.direction === 'asc') {
                upArrow?.classList.add('active');
                downArrow?.classList.remove('active');
            } else if (currentSortState.direction === 'desc') {
                upArrow?.classList.remove('active');
                downArrow?.classList.add('active');
            }
        } else {
            upArrow?.classList.remove('active');
            downArrow?.classList.remove('active');
        }
    });
}

// Function to inject sort arrows into table headers
function injectSortArrows() {
    const targetUrl = 'https://fancy.parivahan.gov.in/fancy/faces/app/applicanthome.xhtml';
    if (window.location.href !== targetUrl) {
        return;
    }

    const thead = document.querySelector('#tblAvailFancyNumber_head');
    if (!thead) return;

    const headers = thead.querySelectorAll('th');
    headers.forEach((header, index) => {
        // Skip the last column (Select Number - index 7)
        if (index >= 7) return;

        // Skip if already processed
        if (header.querySelector('.sort-arrow-container')) return;

        // Make header clickable
        header.classList.add('sort-header');
        header.style.cursor = 'pointer';
        header.style.position = 'relative';

        // Find the column title span
        const titleSpan = header.querySelector('.ui-column-title');
        if (!titleSpan) return;

        // Create arrow container
        const arrowContainer = document.createElement('span');
        arrowContainer.className = 'sort-arrow-container';

        const upArrow = document.createElement('span');
        upArrow.className = 'sort-arrow sort-arrow-up';
        upArrow.innerHTML = '▲';
        upArrow.title = 'Sort ascending';

        const downArrow = document.createElement('span');
        downArrow.className = 'sort-arrow sort-arrow-down';
        downArrow.innerHTML = '▼';
        downArrow.title = 'Sort descending';

        arrowContainer.appendChild(upArrow);
        arrowContainer.appendChild(downArrow);

        // Add arrows after the title
        titleSpan.parentNode.insertBefore(arrowContainer, titleSpan.nextSibling);

        // Add click handler
        header.addEventListener('click', (e) => {
            // Don't trigger if clicking on filter inputs
            if (e.target.tagName === 'INPUT') return;
            handleColumnSort(index);
        });
    });

    // Update arrows to reflect current sort state
    updateSortArrows();
}

// Inject custom Material Design-inspired CSS styles
function injectCustomStyles() {
    if (document.getElementById('parivahan-custom-styles')) return;

    const style = document.createElement('style');
    style.id = 'parivahan-custom-styles';
    style.textContent = `
        /* Sort arrows */
        .sort-arrow-container {
            display: inline-flex;
            flex-direction: column;
            margin-left: 8px;
            vertical-align: middle;
            cursor: pointer;
        }
        .sort-arrow {
            font-size: 10px;
            line-height: 0.8;
            color: #999;
            user-select: none;
            transition: color 0.2s;
        }
        .sort-arrow.active {
            color: #1976d2;
            font-weight: bold;
        }
        .sort-header {
            cursor: pointer;
            user-select: none;
            transition: background-color 0.2s;
        }
        .sort-header:hover {
            background-color: rgba(0, 0, 0, 0.04) !important;
        }

        /* Material Design-inspired Button Styles */
        .pv-btn {
            display: inline-block;
            padding: 12px 32px;
            margin: 0 8px 0 0;
            font-size: 14px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            outline: none;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.15);
            background-color: #2196F3;
            color: #fff;
            text-align: center;
            vertical-align: middle;
            user-select: none;
            min-width: 120px;
        }
        .pv-btn:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            background-color: #1976D2;
            transform: translateY(-1px);
        }
        .pv-btn:active {
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            transform: translateY(0);
        }
        .pv-btn.pv-btn-red {
            background-color: #F44336;
        }
        .pv-btn.pv-btn-red:hover {
            background-color: #D32F2F;
        }

        /* Material Design-inspired Input Field Styles */
        .pv-input-field {
            position: relative;
            margin-bottom: 24px;
        }
        .pv-input-field label {
            color: #757575;
            position: absolute;
            top: 20px;
            left: 0;
            font-size: 14px;
            cursor: text;
            transition: color 0.2s ease, transform 0.2s ease, font-size 0.2s ease;
            transform-origin: 0 0;
            pointer-events: none;
            background-color: #fff;
            padding: 0 4px;
        }
        .pv-input-field label.active {
            transform: translateY(-24px) scale(0.85);
            color: #2196F3;
            font-weight: 500;
        }
        .pv-input-field input[type=text],
        .pv-input-field input[type=number],
        .pv-input-field select {
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 4px;
            outline: none;
            height: 48px;
            width: 100%;
            font-size: 16px;
            margin: 0;
            padding: 0 12px;
            box-sizing: border-box;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
            color: rgba(0,0,0,0.87);
        }
        .pv-input-field input[type=text]:focus,
        .pv-input-field input[type=number]:focus,
        .pv-input-field select:focus {
            border-color: #2196F3;
            box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
        }
        .pv-input-field input[type=text]:focus + label,
        .pv-input-field input[type=number]:focus + label,
        .pv-input-field select:focus + label {
            color: #2196F3;
        }
        .pv-input-field input:not(:placeholder-shown) + label,
        .pv-input-field select:not([value=""]) + label {
            transform: translateY(-24px) scale(0.85);
            color: #2196F3;
            font-weight: 500;
        }
        .pv-input-field select {
            cursor: pointer;
            appearance: none;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
            background-repeat: no-repeat;
            background-position: right 8px center;
            background-size: 20px;
            padding-right: 36px;
        }
        .pv-input-field select option {
            background-color: #fff;
            color: rgba(0,0,0,0.87);
            padding: 8px;
        }

        /* Material Design-inspired Checkbox Styles */
        .pv-checkbox-wrapper {
            margin-bottom: 24px;
        }
        .pv-checkbox-label {
            display: block;
            color: #757575;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 12px;
        }
        .pv-checkbox-container {
            position: relative;
            display: inline-flex;
            align-items: center;
            cursor: pointer;
            user-select: none;
        }
        .pv-checkbox-container input[type="checkbox"] {
            position: absolute;
            opacity: 0;
            cursor: pointer;
            height: 0;
            width: 0;
        }
        .pv-checkbox-checkmark {
            position: relative;
            display: inline-block;
            height: 20px;
            width: 20px;
            background-color: #fff;
            border: 2px solid #757575;
            border-radius: 3px;
            transition: all 0.2s ease;
            margin-right: 8px;
            vertical-align: middle;
        }
        .pv-checkbox-container:hover input ~ .pv-checkbox-checkmark {
            border-color: #2196F3;
        }
        .pv-checkbox-container input:checked ~ .pv-checkbox-checkmark {
            background-color: #2196F3;
            border-color: #2196F3;
        }
        .pv-checkbox-checkmark:after {
            content: "";
            position: absolute;
            display: none;
            left: 6px;
            top: 2px;
            width: 5px;
            height: 10px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
        }
        .pv-checkbox-container input:checked ~ .pv-checkbox-checkmark:after {
            display: block;
        }

        /* Filter Grid Layout */
        .pv-filter-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            margin-bottom: 24px;
        }

        /* Container Styles */
        .pv-filter-container {
            margin-bottom: 24px;
            padding: 24px;
            background-color: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.08);
        }
        .pv-filter-title {
            margin: 0 0 24px 0;
            font-size: 20px;
            font-weight: 500;
            color: rgba(0,0,0,0.87);
            border-bottom: 2px solid #f5f5f5;
            padding-bottom: 12px;
        }
        .pv-button-container {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 8px;
        }

        /* Modal Styles */
        .pv-modal-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            justify-content: center;
            align-items: center;
        }
        .pv-modal-overlay.show {
            display: flex;
        }
        .pv-modal {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            width: 90%;
            max-width: 800px;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .pv-modal-header {
            padding: 20px 24px;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .pv-modal-title {
            font-size: 20px;
            font-weight: 500;
            color: rgba(0,0,0,0.87);
            margin: 0;
        }
        .pv-modal-close {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #757575;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s;
        }
        .pv-modal-close:hover {
            background-color: #f5f5f5;
        }
        .pv-modal-body {
            padding: 24px;
            overflow-y: auto;
            flex: 1;
        }
        .pv-modal-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .pv-modal-list-item {
            padding: 12px 16px;
            border-bottom: 1px solid #f5f5f5;
            font-family: monospace;
            font-size: 14px;
            color: rgba(0,0,0,0.87);
        }
        .pv-modal-list-item:last-child {
            border-bottom: none;
        }
        .pv-modal-footer {
            padding: 16px 24px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }
        .pv-modal-empty {
            text-align: center;
            padding: 40px;
            color: #757575;
            font-size: 16px;
        }
    `;
    document.head.appendChild(style);
}

// Function to inject the filter UI into the page
function injectButton() {
    // Only show button on the specific URL
    const targetUrl = 'https://fancy.parivahan.gov.in/fancy/faces/app/applicanthome.xhtml';
    if (window.location.href !== targetUrl) {
        return; // Exit if not on the target URL
    }

    const table = document.querySelector('#tblAvailFancyNumber');
    if (table && !document.getElementById('fancy-filter-container')) {
        // Inject custom styles
        injectCustomStyles();

        // Create main container
        const mainContainer = document.createElement('div');
        mainContainer.id = 'fancy-filter-container';
        mainContainer.className = 'pv-filter-container';

        // Title
        const title = document.createElement('h3');
        title.className = 'pv-filter-title';
        title.innerText = 'Advanced Filters & Sorting';
        mainContainer.appendChild(title);

        // Create filter grid
        const filterGrid = document.createElement('div');
        filterGrid.className = 'pv-filter-grid';

        // Reserve Price dropdown (values in thousands, labels with 'k')
        const reservePriceOptions = [
            { value: '', label: 'All' },
            { value: '150000', label: '150k' },
            { value: '75000', label: '75k' },
            { value: '50000', label: '50k' },
            { value: '20000', label: '20k' }
        ];
        const reservePriceDiv = createFilterDropdown('filter-reserveprice', 'Reserve Price', reservePriceOptions);
        filterGrid.appendChild(reservePriceDiv);

        // Bid Security dropdown (values in thousands, labels with 'k')
        const bidSecurityOptions = [
            { value: '', label: 'All' },
            { value: '30000', label: '30k' },
            { value: '15000', label: '15k' },
            { value: '10000', label: '10k' },
            { value: '4000', label: '4k' }
        ];
        const bidSecurityDiv = createFilterDropdown('filter-bidsecurity', 'Bid Security', bidSecurityOptions);
        filterGrid.appendChild(bidSecurityDiv);

        // Total Applicants filter
        const totalApplicantsDiv = createFilterInput('filter-totalapplicants', 'Total Applicants', 'number');
        filterGrid.appendChild(totalApplicantsDiv);

        // Number Type checkbox (Fancy)
        const numberTypeDiv = createFilterCheckbox('filter-numbertype-fancy', 'Fancy');
        filterGrid.appendChild(numberTypeDiv);
        mainContainer.appendChild(filterGrid);

        // Button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'pv-button-container';

        // HR26 filter button (applies HR26 filter + existing filters + sorting if selected)
        const hr26FilterBtn = document.createElement('button');
        hr26FilterBtn.id = 'fancy-filter-btn';
        hr26FilterBtn.type = 'button';
        hr26FilterBtn.className = 'pv-btn';
        hr26FilterBtn.innerText = 'Filter HR26';
        hr26FilterBtn.addEventListener('click', applyFilterAndSort, false);

        // Reset button
        const resetBtn = document.createElement('button');
        resetBtn.id = 'fancy-reset-btn';
        resetBtn.type = 'button';
        resetBtn.className = 'pv-btn pv-btn-red';
        resetBtn.innerText = 'Reset All';
        resetBtn.addEventListener('click', resetFilter, false);

        // Copy Registration Numbers button
        const copyRegBtn = document.createElement('button');
        copyRegBtn.id = 'copy-reg-numbers-btn';
        copyRegBtn.type = 'button';
        copyRegBtn.className = 'pv-btn';
        copyRegBtn.style.backgroundColor = '#4CAF50';
        copyRegBtn.innerText = 'Copy Registration Numbers';
        copyRegBtn.addEventListener('click', showCopyModal, false);

        buttonContainer.appendChild(hr26FilterBtn);
        buttonContainer.appendChild(resetBtn);
        buttonContainer.appendChild(copyRegBtn);
        mainContainer.appendChild(buttonContainer);

        // Insert container before table
        table.parentNode.insertBefore(mainContainer, table);

        // Apply filter on load
        setTimeout(() => {
            applyFilterAndSort({ preventDefault: () => { }, stopPropagation: () => { } });
        }, 100);
    }
}

// Helper function to create filter input
function createFilterInput(id, label, type) {
    const div = document.createElement('div');
    div.className = 'pv-input-field';

    const input = document.createElement('input');
    input.id = id;
    input.type = type;
    input.placeholder = ' ';
    div.appendChild(input);

    const labelEl = document.createElement('label');
    labelEl.htmlFor = id;
    labelEl.innerText = label;
    div.appendChild(labelEl);

    // Handle label activation
    input.addEventListener('focus', () => labelEl.classList.add('active'));
    input.addEventListener('blur', () => {
        if (!input.value) labelEl.classList.remove('active');
    });
    input.addEventListener('input', () => {
        if (input.value) {
            labelEl.classList.add('active');
        } else {
            labelEl.classList.remove('active');
        }
        // Auto-apply filter on input change
        applyFilterAndSort({ preventDefault: () => { }, stopPropagation: () => { } });
    });
    if (input.value) labelEl.classList.add('active');

    return div;
}

// Helper function to create filter dropdown
function createFilterDropdown(id, label, options) {
    const div = document.createElement('div');
    div.className = 'pv-input-field';

    const select = document.createElement('select');
    select.id = id;

    options.forEach(option => {
        const optionEl = document.createElement('option');
        optionEl.value = typeof option === 'object' ? option.value : option;
        optionEl.textContent = typeof option === 'object' ? option.label : (option || 'All');
        select.appendChild(optionEl);
    });

    div.appendChild(select);

    const labelEl = document.createElement('label');
    labelEl.htmlFor = id;
    labelEl.innerText = label;
    if (!select.value) labelEl.classList.add('active');
    div.appendChild(labelEl);

    // Handle label activation and auto-apply filter
    select.addEventListener('change', () => {
        if (select.value) labelEl.classList.add('active');
        else labelEl.classList.remove('active');
        // Auto-apply filter on change
        applyFilterAndSort({ preventDefault: () => { }, stopPropagation: () => { } });
    });
    select.addEventListener('focus', () => labelEl.classList.add('active'));
    if (select.value) labelEl.classList.add('active');

    return div;
}

// Helper function to create filter checkbox
function createFilterCheckbox(id, label) {
    const div = document.createElement('div');
    div.className = 'pv-checkbox-wrapper';

    const labelEl = document.createElement('label');
    labelEl.className = 'pv-checkbox-label';
    labelEl.htmlFor = id;
    labelEl.innerText = label;
    div.appendChild(labelEl);

    const checkboxContainer = document.createElement('label');
    checkboxContainer.className = 'pv-checkbox-container';
    checkboxContainer.htmlFor = id;

    const checkbox = document.createElement('input');
    checkbox.id = id;
    checkbox.type = 'checkbox';

    const checkmark = document.createElement('span');
    checkmark.className = 'pv-checkbox-checkmark';

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(checkmark);
    div.appendChild(checkboxContainer);

    // Auto-apply filter when checkbox is toggled
    checkbox.addEventListener('change', function () {
        applyFilterAndSort({ preventDefault: () => { }, stopPropagation: () => { } });
    });

    return div;
}

// Function to ping server to keep session alive
function pingServer() {
    const targetUrl = 'https://fancy.parivahan.gov.in/fancy/faces/app/applicanthome.xhtml';
    if (window.location.href !== targetUrl) {
        return; // Only ping on the target URL
    }

    // Get ViewState from the page (JSF applications use this)
    const viewStateInput = document.querySelector('input[name="javax.faces.ViewState"]');
    const viewState = viewStateInput ? viewStateInput.value : '';

    // Create minimal body for JSF keep-alive request
    // Using a simple form submission that won't change page state
    const bodyParams = new URLSearchParams({
        'javax.faces.partial.ajax': 'true',
        'javax.faces.source': 'j_idt75',
        'javax.faces.partial.execute': '@all',
        'j_idt75': 'j_idt75',
        'javax.faces.ViewState': viewState
    });

    console.log('[Parivahan Utilities] Sending keep-alive ping...', new Date().toLocaleTimeString());

    // Ping the server with JSF-specific headers to keep session alive
    fetch(targetUrl, {
        method: 'POST',
        credentials: 'include', // Include cookies automatically (browser handles session)
        headers: {
            'accept': 'application/xml, text/xml, */*; q=0.01',
            'accept-language': 'en,hi;q=0.9,it;q=0.8,ar;q=0.7',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'faces-request': 'partial/ajax',
            'x-requested-with': 'XMLHttpRequest',
            'Referer': targetUrl
        },
        body: bodyParams.toString()
    }).then(response => {
        console.log('[Parivahan Utilities] Keep-alive ping successful', new Date().toLocaleTimeString(), response.status);
    }).catch(err => {
        console.error('[Parivahan Utilities] Session keep-alive ping failed:', err);
    });
}

// Run injection check every 2 seconds because the page uses AJAX to load tables
setInterval(injectButton, 2000);
setInterval(injectSortArrows, 2000);

// Ping server every 5 minutes (300000ms) to keep session alive
// Adjust the interval as needed - common intervals are 2-5 minutes
setInterval(pingServer, 5 * 60 * 1000); // 5 minutes

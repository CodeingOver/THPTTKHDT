// State management
let purchaseState = {
    currentStep: 1,
    selectedCardType: null,
    insertedAmount: 0,
    minAmount: 1000000,
    cardInventory: 10, // Số lượng thẻ còn lại
    newCardNumber: '',
    transactionTime: null
};

// Initialize
window.addEventListener('DOMContentLoaded', function() {
    checkCardInventory();
    setupEventListeners();
    updateSummary();
});

// Check card inventory
function checkCardInventory() {
    if (purchaseState.cardInventory <= 0) {
        showError('Tạm hết thẻ. Vui lòng quay lại sau.');
        disableAllButtons();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Step 1: Card type selection
    document.querySelectorAll('.card-type-item').forEach(item => {
        item.addEventListener('click', function() {
            const cardType = this.dataset.type;
            selectCardType(cardType);
        });
    });

    // Step 1 buttons
    document.getElementById('cancelStep1Btn').addEventListener('click', handleCancelStep1);
    document.getElementById('nextStep1Btn').addEventListener('click', handleNextStep1);

    // Step 2: Change card type
    document.getElementById('changeCardTypeBtn').addEventListener('click', handleChangeCardType);

    // Step 2: Demo money insertion
    document.querySelectorAll('.demo-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.classList.contains('btn-reset')) {
                resetInsertedMoney();
            } else {
                const amount = parseInt(this.dataset.amount);
                insertMoney(amount);
            }
        });
    });

    // Step 2 buttons
    document.getElementById('backStep2Btn').addEventListener('click', handleBackStep2);
    document.getElementById('nextStep2Btn').addEventListener('click', handleNextStep2);

    // Step 3: Finish
    document.getElementById('finishBtn').addEventListener('click', handleFinish);
}

// Card type selection
function selectCardType(type) {
    purchaseState.selectedCardType = type;
    
    // Update UI
    document.querySelectorAll('.card-type-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelector(`[data-type="${type}"]`).classList.add('selected');
    
    // Enable next button
    document.getElementById('nextStep1Btn').disabled = false;
    
    hideAllAlerts();
}

// Step 1: Cancel
function handleCancelStep1() {
    if (confirm('Bạn có chắc muốn hủy giao dịch?')) {
        showInfo('Đã hủy giao dịch. Quay về màn hình chính.');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

// Step 1: Next
function handleNextStep1() {
    if (!purchaseState.selectedCardType) {
        showError('Vui lòng chọn loại thẻ');
        return;
    }
    
    // Check if selected prepaid card
    if (purchaseState.selectedCardType !== 'prepaid') {
        showWarning('Bạn đã chọn sai loại thẻ. Vui lòng chọn "Thẻ trả trước" để tiếp tục.');
        return;
    }
    
    // Move to step 2
    goToStep(2);
    showInfo('Vui lòng nạp tiền vào máy. Số tiền tối thiểu: 1.000.000đ');
}

// Step 2: Change card type
function handleChangeCardType() {
    if (purchaseState.insertedAmount > 0) {
        if (confirm('Số tiền đã nạp sẽ được hoàn trả. Bạn có muốn quay lại chọn loại thẻ?')) {
            resetInsertedMoney();
            goToStep(1);
        }
    } else {
        goToStep(1);
    }
}

// Insert money (simulated)
function insertMoney(amount) {
    // Simulate hardware detection delay
    showLoading();
    
    setTimeout(() => {
        hideLoading();
        
        // Simulate hardware error (10% chance)
        if (Math.random() < 0.1) {
            showError('Thiết bị không nhận diện được tiền mặt (lỗi phần cứng). Vui lòng liên hệ hỗ trợ hoặc thử lại sau.');
            return;
        }
        
        purchaseState.insertedAmount += amount;
        updateMoneyDisplay();
        updateSummary();
        
        // Check if meets minimum requirement
        if (purchaseState.insertedAmount >= purchaseState.minAmount) {
            document.getElementById('nextStep2Btn').disabled = false;
            showInfo(`Đã đủ số tiền tối thiểu. Bạn có thể xác nhận mua thẻ.`);
        } else {
            const remaining = purchaseState.minAmount - purchaseState.insertedAmount;
            showWarning(`Còn thiếu ${formatCurrency(remaining)} để đạt mức tối thiểu.`);
        }
    }, 1000);
}

// Reset inserted money
function resetInsertedMoney() {
    purchaseState.insertedAmount = 0;
    updateMoneyDisplay();
    updateSummary();
    document.getElementById('nextStep2Btn').disabled = true;
    showInfo('Đã reset số tiền. Vui lòng nạp lại.');
}

// Update money display
function updateMoneyDisplay() {
    document.getElementById('insertedAmount').textContent = formatCurrency(purchaseState.insertedAmount);
}

// Step 2: Back
function handleBackStep2() {
    if (purchaseState.insertedAmount > 0) {
        if (confirm('Số tiền đã nạp sẽ được hoàn trả. Bạn có muốn quay lại?')) {
            resetInsertedMoney();
            goToStep(1);
        }
    } else {
        goToStep(1);
    }
}

// Step 2: Next (Purchase)
async function handleNextStep2() {
    // Validate amount
    if (purchaseState.insertedAmount < purchaseState.minAmount) {
        showError(`Số tiền nạp không hợp lệ. Vui lòng nạp tối thiểu ${formatCurrency(purchaseState.minAmount)}`);
        return;
    }
    
    // Check inventory
    if (purchaseState.cardInventory <= 0) {
        showError('Tạm hết thẻ và không cho phép tiếp tục giao dịch.');
        disableAllButtons();
        return;
    }
    
    // Process purchase
    showLoading();
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    hideLoading();
    
    // Generate card number
    purchaseState.newCardNumber = generateCardNumber();
    purchaseState.transactionTime = new Date();
    
    // Decrease inventory
    purchaseState.cardInventory--;
    
    // Update UI for step 3
    document.getElementById('newCardNumber').textContent = purchaseState.newCardNumber;
    document.getElementById('newCardBalance').textContent = formatCurrency(purchaseState.insertedAmount);
    document.getElementById('receiptCardType').textContent = getCardTypeName(purchaseState.selectedCardType);
    document.getElementById('receiptAmount').textContent = formatCurrency(purchaseState.insertedAmount);
    document.getElementById('receiptTime').textContent = purchaseState.transactionTime.toLocaleString('vi-VN');
    
    // Move to step 3
    goToStep(3);
    
    // Print receipt (simulated)
    printReceipt();
}

// Step 3: Finish
function handleFinish() {
    showInfo('Cảm ơn bạn đã sử dụng dịch vụ. Chúc bạn có trải nghiệm tốt!');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Go to step
function goToStep(step) {
    purchaseState.currentStep = step;
    
    // Hide all step contents
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show current step content
    document.getElementById(`step${step}Content`).classList.remove('hidden');
    
    // Update progress steps
    document.querySelectorAll('.step').forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed');
        if (index + 1 < step) {
            stepEl.classList.add('completed');
        } else if (index + 1 === step) {
            stepEl.classList.add('active');
        }
    });
    
    hideAllAlerts();
}

// Update summary
function updateSummary() {
    const cardTypeName = purchaseState.selectedCardType ? getCardTypeName(purchaseState.selectedCardType) : '--';
    document.getElementById('summaryCardType').textContent = cardTypeName;
    document.getElementById('summaryAmount').textContent = formatCurrency(purchaseState.insertedAmount);
    document.getElementById('summaryBalance').textContent = formatCurrency(purchaseState.insertedAmount);
    
    // Update selected card type in step 2
    if (purchaseState.selectedCardType) {
        document.getElementById('selectedCardType').textContent = cardTypeName;
    }
}

// Generate card number
function generateCardNumber() {
    const prefix = '9704';
    let number = prefix;
    for (let i = 0; i < 12; i++) {
        number += Math.floor(Math.random() * 10);
    }
    return number.match(/.{1,4}/g).join(' ');
}

// Print receipt
function printReceipt() {
    console.log('=== BIÊN LAI MUA THẺ ===');
    console.log('Loại thẻ:', getCardTypeName(purchaseState.selectedCardType));
    console.log('Số thẻ:', purchaseState.newCardNumber);
    console.log('Số tiền nạp:', formatCurrency(purchaseState.insertedAmount));
    console.log('Số dư thẻ:', formatCurrency(purchaseState.insertedAmount));
    console.log('Thời gian:', purchaseState.transactionTime.toLocaleString('vi-VN'));
    console.log('Số thẻ còn lại:', purchaseState.cardInventory);
    console.log('========================');
}

// Get card type name
function getCardTypeName(type) {
    const names = {
        'prepaid': 'Thẻ trả trước',
        'hourly': 'Thẻ theo giờ',
        'monthly': 'Thẻ theo tháng'
    };
    return names[type] || '--';
}

// Disable all buttons
function disableAllButtons() {
    document.querySelectorAll('.btn, .card-type-item, .demo-btn').forEach(el => {
        el.disabled = true;
        el.style.opacity = '0.5';
        el.style.cursor = 'not-allowed';
    });
}

// Loading
function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

// Alerts
function showError(message) {
    hideAllAlerts();
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('alertError').classList.add('show');
}

function showWarning(message) {
    hideAllAlerts();
    document.getElementById('warningMessage').textContent = message;
    document.getElementById('alertWarning').classList.add('show');
}

function showInfo(message) {
    hideAllAlerts();
    document.getElementById('infoMessage').textContent = message;
    document.getElementById('alertInfo').classList.add('show');
}

function showSuccess(message) {
    hideAllAlerts();
    document.getElementById('successMessage').textContent = message;
    document.getElementById('alertSuccess').classList.add('show');
}

function hideAllAlerts() {
    document.querySelectorAll('.alert').forEach(alert => {
        alert.classList.remove('show');
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
}

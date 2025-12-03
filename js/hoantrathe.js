// Card Return System State
const returnState = {
    currentStep: 1,
    scannedCard: null,
    hasActiveRental: false,
    refundAmount: 0,
    depositAmount: 50000, // Default deposit
    transactionId: null
};

// Card Types
const CARD_TYPES = {
    PREPAID: 'Thẻ trả trước',
    POSTPAID: 'Thẻ trả sau'
};

// Initialize app
function initializeApp() {
    setupEventListeners();
    showStep(1);
}

function setupEventListeners() {
    // Step 1: Card scan demo
    document.querySelectorAll('[data-card]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cardType = e.target.getAttribute('data-card');
            handleCardScanDemo(cardType);
        });
    });

    // Step buttons
    document.getElementById('cancelStep1Btn').addEventListener('click', resetApp);
    document.getElementById('nextStep1Btn').addEventListener('click', () => goToStep(2));
    document.getElementById('backStep2Btn').addEventListener('click', () => goToStep(1));
    document.getElementById('confirmReturnBtn').addEventListener('click', processReturn);
    document.getElementById('finishBtn').addEventListener('click', resetApp);

    // Confirmation checkbox
    document.getElementById('confirmCheckbox').addEventListener('change', (e) => {
        document.getElementById('confirmReturnBtn').disabled = !e.target.checked;
    });
}

// Step 1: Card Scan Demo
function handleCardScanDemo(cardType) {
    const scannerAnimation = document.getElementById('scannerAnimation');
    const cardInfo = document.getElementById('cardInfo');
    const rentalStatus = document.getElementById('rentalStatus');
    const nextBtn = document.getElementById('nextStep1Btn');

    // Show scanning
    scannerAnimation.style.display = 'block';
    cardInfo.classList.add('hidden');
    rentalStatus.classList.add('hidden');
    nextBtn.disabled = true;
    hideAllAlerts();

    setTimeout(() => {
        scannerAnimation.style.display = 'none';

        if (cardType === 'prepaid-ok') {
            // Prepaid card without active rental
            returnState.scannedCard = {
                number: '1234567890123456',
                type: CARD_TYPES.PREPAID,
                balance: 80000,
                status: 'Đang hoạt động'
            };
            returnState.hasActiveRental = false;
            displayCardInfo();
            displayRentalStatus(false);
            nextBtn.disabled = false;
            showAlert('success', 'Quét thẻ thành công! Kiểm tra thông tin và nhấn "Tiếp tục".');

        } else if (cardType === 'postpaid-ok') {
            // Postpaid card without active rental
            returnState.scannedCard = {
                number: '9876543210987654',
                type: CARD_TYPES.POSTPAID,
                balance: 0,
                status: 'Đang hoạt động'
            };
            returnState.hasActiveRental = false;
            displayCardInfo();
            displayRentalStatus(false);
            nextBtn.disabled = false;
            showAlert('success', 'Quét thẻ thành công! Kiểm tra thông tin và nhấn "Tiếp tục".');

        } else if (cardType === 'has-rental') {
            // Card with active rental
            returnState.scannedCard = {
                number: '5555666677778888',
                type: CARD_TYPES.PREPAID,
                balance: 50000,
                status: 'Đang thuê xe'
            };
            returnState.hasActiveRental = true;
            displayCardInfo();
            displayRentalStatus(true);
            nextBtn.disabled = true;
            playErrorSound();
            showAlert('warning', 'Vui lòng trả xe trước khi hoàn trả thẻ. Nút "Hoàn trả" đã bị vô hiệu hóa.');

        } else if (cardType === 'negative') {
            // Card with negative balance
            returnState.scannedCard = {
                number: '1111222233334444',
                type: CARD_TYPES.PREPAID,
                balance: -15000,
                status: 'Nợ tiền'
            };
            returnState.hasActiveRental = false;
            displayCardInfo();
            displayRentalStatus(false);
            nextBtn.disabled = true;
            playErrorSound();
            showAlert('error', 'Thẻ có số dư âm. Không thể hoàn trả thẻ. Vui lòng liên hệ bộ phận hỗ trợ. Hotline: 1900 1234');
        }
    }, 2000);
}

function displayCardInfo() {
    const card = returnState.scannedCard;
    
    // Display on card visual
    document.getElementById('displayCardNumber').textContent = formatCardNumber(card.number);

    // Display in info grid
    document.getElementById('cardNumber').textContent = formatCardNumber(card.number);
    document.getElementById('cardType').textContent = card.type;
    document.getElementById('cardBalance').textContent = formatCurrency(card.balance);
    document.getElementById('cardStatus').textContent = card.status;

    // Show card info
    document.getElementById('cardInfo').classList.remove('hidden');
}

function displayRentalStatus(hasRental) {
    const rentalStatus = document.getElementById('rentalStatus');
    const rentalIcon = document.getElementById('rentalIcon');
    const rentalTitle = document.getElementById('rentalTitle');
    const rentalSubtitle = document.getElementById('rentalSubtitle');

    if (hasRental) {
        rentalStatus.className = 'rental-status has-rental';
        rentalIcon.textContent = '⚠️';
        rentalTitle.textContent = 'Đang có xe đang thuê';
        rentalSubtitle.textContent = 'Vui lòng trả xe tại trạm trước khi hoàn trả thẻ';
    } else {
        rentalStatus.className = 'rental-status no-rental';
        rentalIcon.textContent = '✓';
        rentalTitle.textContent = 'Không có xe đang thuê';
        rentalSubtitle.textContent = 'Thẻ đủ điều kiện để hoàn trả';
    }

    rentalStatus.classList.remove('hidden');
}

// Step 2: Display Confirmation
function goToStep(step) {
    if (step === 2) {
        displayConfirmation();
    }
    
    returnState.currentStep = step;
    showStep(step);
}

function displayConfirmation() {
    const card = returnState.scannedCard;

    // Display card summary
    document.getElementById('confirmCardNumber').textContent = formatCardNumber(card.number);
    document.getElementById('confirmCardType').textContent = card.type;
    document.getElementById('confirmCardBalance').textContent = formatCurrency(card.balance);

    // Show/hide refund boxes based on card type
    if (card.type === CARD_TYPES.PREPAID) {
        // Calculate refund
        returnState.refundAmount = card.balance + returnState.depositAmount;

        document.getElementById('refundBalance').textContent = formatCurrency(card.balance);
        document.getElementById('refundDeposit').textContent = formatCurrency(returnState.depositAmount);
        document.getElementById('refundTotal').textContent = formatCurrency(returnState.refundAmount);

        document.getElementById('refundBox').classList.remove('hidden');
        document.getElementById('noRefundBox').classList.add('hidden');
    } else {
        // Postpaid - no refund
        document.getElementById('refundBox').classList.add('hidden');
        document.getElementById('noRefundBox').classList.remove('hidden');
    }

    // Reset checkbox
    document.getElementById('confirmCheckbox').checked = false;
    document.getElementById('confirmReturnBtn').disabled = true;
}

// Process Return
function processReturn() {
    showLoading(true, 'Đang xử lý hoàn trả thẻ...');

    setTimeout(() => {
        // Simulate 10% refund system error (only for prepaid cards)
        if (returnState.scannedCard.type === CARD_TYPES.PREPAID && Math.random() < 0.1) {
            showLoading(false);
            playErrorSound();
            showAlert('error', 'Lỗi kết nối hệ thống hoàn tiền. Không thể hoàn tiền lúc này. Vui lòng thử lại sau hoặc liên hệ nhân viên. Hotline: 1900 1234');
            return;
        }

        // Success
        returnState.transactionId = generateTransactionId();
        showLoading(false);
        displayReceipt();
        goToStep(3);
    }, 2500);
}

function displayReceipt() {
    const card = returnState.scannedCard;

    document.getElementById('receiptTime').textContent = formatDateTime(new Date());
    document.getElementById('receiptTransactionId').textContent = returnState.transactionId;
    document.getElementById('receiptCardNumber').textContent = formatCardNumber(card.number);
    document.getElementById('receiptCardType').textContent = card.type;

    // Show refund amount for prepaid cards
    if (card.type === CARD_TYPES.PREPAID) {
        document.getElementById('receiptRefundRow').style.display = 'flex';
        document.getElementById('receiptRefundAmount').textContent = formatCurrency(returnState.refundAmount);
        document.getElementById('refundNoteText').style.display = 'list-item';
    } else {
        document.getElementById('receiptRefundRow').style.display = 'none';
        document.getElementById('refundNoteText').style.display = 'none';
    }
}

// Navigation
function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.add('hidden');
    });

    // Show current step
    document.getElementById(`step${step}Content`).classList.remove('hidden');

    // Update step indicator
    document.querySelectorAll('.step-item').forEach((item, index) => {
        if (index + 1 < step) {
            item.classList.add('completed');
            item.classList.remove('active');
        } else if (index + 1 === step) {
            item.classList.add('active');
            item.classList.remove('completed');
        } else {
            item.classList.remove('active', 'completed');
        }
    });

    hideAllAlerts();
}

// Alerts
function showAlert(type, message) {
    hideAllAlerts();
    const alertId = `alert${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const alert = document.getElementById(alertId);
    const messageSpan = document.getElementById(`${type}Message`);

    if (alert && messageSpan) {
        messageSpan.textContent = message;
        alert.classList.add('show');

        // Auto hide after 5 seconds
        setTimeout(() => {
            alert.classList.remove('show');
        }, 5000);
    }
}

function hideAllAlerts() {
    document.querySelectorAll('.alert').forEach(alert => {
        alert.classList.remove('show');
    });
}

// Loading
function showLoading(show, text = 'Đang xử lý...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    if (show) {
        loadingText.textContent = text;
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

// Reset
function resetApp() {
    if (returnState.currentStep === 3) {
        // From complete step - just reload
        location.reload();
    } else {
        // From other steps - confirm
        if (confirm('Bạn có chắc muốn hủy bỏ thao tác hoàn trả thẻ?')) {
            location.reload();
        }
    }
}

// Utilities
function formatCardNumber(number) {
    return number.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(date);
}

function generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RT${timestamp}${random}`;
}

function playErrorSound() {
    const audio = document.getElementById('errorSound');
    if (audio) {
        audio.play().catch(() => {
            // Ignore if audio play fails
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

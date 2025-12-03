// Return Bike System State
const returnState = {
    currentStep: 1,
    selectedSlot: null,
    bikeParkedCorrectly: false,
    scannedCard: null,
    rentalStartTime: null,
    rentalEndTime: null,
    duration: 0, // in minutes
    baseFee: 0,
    minimumFee: 2000,
    discount: 0,
    promoCode: null,
    totalFee: 0
};

// Available Promo Codes
const promoCodes = {
    'SAVE10': { type: 'percent', value: 10, description: 'Giảm 10%' },
    'FIRST20': { type: 'percent', value: 20, description: 'Giảm 20% lần đầu' },
    'FREE2K': { type: 'fixed', value: 2000, description: 'Miễn phí 2.000đ' }
};

// Sample rental data (simulating rental history)
const sampleRentalData = {
    bikeNumber: 'B001',
    startTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    cardNumber: '1234567890',
    cardBalance: 50000
};

// Initialize app
function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    // Initialize step
    showStep(1);
}

function setupEventListeners() {
    // Step 1: Demo controls
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            handleParkingDemo(action);
        });
    });

    // Step buttons
    document.getElementById('cancelBtn').addEventListener('click', resetApp);
    document.getElementById('nextStep1Btn').addEventListener('click', () => goToStep(2));
    document.getElementById('backStep2Btn').addEventListener('click', () => goToStep(1));
    document.getElementById('calculateBtn').addEventListener('click', calculateFee);
    document.getElementById('backStep3Btn').addEventListener('click', () => goToStep(2));
    document.getElementById('confirmPaymentBtn').addEventListener('click', processPayment);
    document.getElementById('finishBtn').addEventListener('click', resetApp);

    // Step 2: Card scan demo
    document.querySelectorAll('[data-card]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cardType = e.target.getAttribute('data-card');
            handleCardScanDemo(cardType);
        });
    });

    // Promo code
    document.getElementById('applyPromoBtn').addEventListener('click', applyPromoCode);
    document.getElementById('promoInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applyPromoCode();
    });
}

// Step 1: Parking Demo
function handleParkingDemo(action) {
    const sensorCheck = document.getElementById('sensorIcon').parentElement;
    const sensorIcon = document.getElementById('sensorIcon');
    const sensorStatus = document.getElementById('sensorStatus');
    const sensorDetail = document.getElementById('sensorDetail');
    const nextBtn = document.getElementById('nextStep1Btn');

    if (action === 'correct') {
        // Simulate correct parking
        sensorCheck.className = 'sensor-check checking';
        sensorIcon.textContent = '🔄';
        sensorStatus.textContent = 'Đang kiểm tra...';
        sensorDetail.textContent = 'Hệ thống đang xác nhận vị trí xe';

        setTimeout(() => {
            sensorCheck.className = 'sensor-check success';
            sensorIcon.textContent = '✅';
            sensorStatus.textContent = 'Xe đã được đặt đúng vị trí!';
            sensorDetail.textContent = 'Khớp nối đã kết nối, xe đã được khóa an toàn';
            returnState.bikeParkedCorrectly = true;
            returnState.selectedSlot = 2;
            nextBtn.disabled = false;
            hideAllAlerts();
            showAlert('success', 'Xe đã được đặt vào ô 02 đúng cách. Vui lòng quét thẻ để hoàn tất.');
        }, 2000);

    } else if (action === 'wrong') {
        // Simulate wrong parking
        sensorCheck.className = 'sensor-check checking';
        sensorIcon.textContent = '🔄';
        sensorStatus.textContent = 'Đang kiểm tra...';
        sensorDetail.textContent = 'Hệ thống đang xác nhận vị trí xe';

        setTimeout(() => {
            sensorCheck.className = 'sensor-check error';
            sensorIcon.textContent = '❌';
            sensorStatus.textContent = 'Xe chưa được trả đúng cách';
            sensorDetail.textContent = 'Vui lòng điều chỉnh lại vị trí xe để khớp với khớp nối';
            returnState.bikeParkedCorrectly = false;
            nextBtn.disabled = true;
            playErrorSound();
            showAlert('warning', 'Xe chưa được trả đúng cách. Vui lòng điều chỉnh lại vị trí xe.');
        }, 2000);

    } else if (action === 'reset') {
        // Reset
        sensorCheck.className = 'sensor-check';
        sensorIcon.textContent = '📡';
        sensorStatus.textContent = 'Đang chờ xe...';
        sensorDetail.textContent = 'Vui lòng đưa xe vào ô trống và đảm bảo xe khớp với khớp nối';
        returnState.bikeParkedCorrectly = false;
        returnState.selectedSlot = null;
        nextBtn.disabled = true;
        hideAllAlerts();
    }
}

// Step 2: Card Scan Demo
function handleCardScanDemo(cardType) {
    const scannerAnimation = document.getElementById('scannerAnimation');
    const cardInfo = document.getElementById('cardInfo');
    const calculateBtn = document.getElementById('calculateBtn');

    // Show scanning
    scannerAnimation.style.display = 'block';
    cardInfo.classList.add('hidden');

    setTimeout(() => {
        if (cardType === 'valid') {
            // Valid card with sufficient balance
            returnState.scannedCard = {
                number: sampleRentalData.cardNumber,
                type: 'Thẻ trả trước',
                balance: sampleRentalData.cardBalance
            };

            document.getElementById('scannedCardNumber').textContent = formatCardNumber(returnState.scannedCard.number);
            document.getElementById('scannedCardType').textContent = returnState.scannedCard.type;
            document.getElementById('scannedCardBalance').textContent = formatCurrency(returnState.scannedCard.balance);

            scannerAnimation.style.display = 'none';
            cardInfo.classList.remove('hidden');
            calculateBtn.disabled = false;
            hideAllAlerts();
            showAlert('success', 'Quét thẻ thành công! Nhấn "Tính tiền" để xem chi phí.');

        } else if (cardType === 'insufficient') {
            // Card with insufficient balance
            returnState.scannedCard = {
                number: sampleRentalData.cardNumber,
                type: 'Thẻ trả trước',
                balance: 1000 // Not enough
            };

            document.getElementById('scannedCardNumber').textContent = formatCardNumber(returnState.scannedCard.number);
            document.getElementById('scannedCardType').textContent = returnState.scannedCard.type;
            document.getElementById('scannedCardBalance').textContent = formatCurrency(returnState.scannedCard.balance);

            scannerAnimation.style.display = 'none';
            cardInfo.classList.remove('hidden');
            calculateBtn.disabled = false;
            hideAllAlerts();
            showAlert('warning', 'Thẻ đã được quét. Lưu ý: Số dư có thể không đủ để thanh toán.');

        } else if (cardType === 'error') {
            // Card reader error
            playErrorSound();
            showAlert('error', 'Lỗi thiết bị quét thẻ. Vui lòng thử lại hoặc liên hệ nhân viên hỗ trợ. Hotline: 1900 1234');
            calculateBtn.disabled = true;
        }
    }, 2000);
}

// Calculate rental fee
function calculateFee() {
    // Set rental times
    returnState.rentalStartTime = sampleRentalData.startTime;
    returnState.rentalEndTime = new Date();

    // Calculate duration in minutes
    const diffMs = returnState.rentalEndTime - returnState.rentalStartTime;
    returnState.duration = Math.floor(diffMs / (1000 * 60));

    // Calculate base fee (2,000đ per hour)
    const hours = Math.ceil(returnState.duration / 60);
    returnState.baseFee = hours * 2000;

    // Apply minimum fee if less than 1 hour
    const isUnderOneHour = returnState.duration < 60;
    if (isUnderOneHour && returnState.baseFee < returnState.minimumFee) {
        returnState.baseFee = returnState.minimumFee;
    }

    // Calculate total (before promo)
    returnState.totalFee = returnState.baseFee;

    // Display payment details
    displayPaymentDetails(isUnderOneHour);

    // Go to step 3
    goToStep(3);
}

function displayPaymentDetails(isUnderOneHour) {
    // Bike info
    document.getElementById('paymentBikeNumber').textContent = sampleRentalData.bikeNumber;

    // Time info
    document.getElementById('paymentStartTime').textContent = formatDateTime(returnState.rentalStartTime);
    document.getElementById('paymentEndTime').textContent = formatDateTime(returnState.rentalEndTime);
    document.getElementById('paymentDuration').textContent = formatDuration(returnState.duration);

    // Fee info
    document.getElementById('paymentBaseFee').textContent = formatCurrency(returnState.baseFee);

    // Show minimum fee warning if applicable
    const minimumFeeRow = document.getElementById('minimumFeeRow');
    if (isUnderOneHour) {
        minimumFeeRow.style.display = 'flex';
    } else {
        minimumFeeRow.style.display = 'none';
    }

    // Show promo section
    document.getElementById('promoSection').style.display = 'block';

    // Total
    updateTotal();
}

function updateTotal() {
    const total = returnState.totalFee;

    // Show/hide original price if discount applied
    if (returnState.discount > 0) {
        document.getElementById('originalPriceRow').style.display = 'flex';
        document.getElementById('paymentOriginalPrice').textContent = formatCurrency(returnState.baseFee);
        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('paymentDiscount').textContent = '-' + formatCurrency(returnState.discount);
    } else {
        document.getElementById('originalPriceRow').style.display = 'none';
        document.getElementById('discountRow').style.display = 'none';
    }

    document.getElementById('paymentTotal').textContent = formatCurrency(total);
}

function applyPromoCode() {
    const input = document.getElementById('promoInput');
    const code = input.value.trim().toUpperCase();
    const message = document.getElementById('promoMessage');

    if (!code) {
        message.className = 'promo-message error';
        message.textContent = 'Vui lòng nhập mã khuyến mãi';
        return;
    }

    const promo = promoCodes[code];
    if (!promo) {
        message.className = 'promo-message error';
        message.textContent = 'Mã khuyến mãi không hợp lệ';
        return;
    }

    // Apply promo
    returnState.promoCode = code;
    if (promo.type === 'percent') {
        returnState.discount = Math.floor(returnState.baseFee * promo.value / 100);
    } else {
        returnState.discount = promo.value;
    }

    returnState.totalFee = Math.max(0, returnState.baseFee - returnState.discount);

    message.className = 'promo-message success';
    message.textContent = `✓ Áp dụng thành công: ${promo.description}`;

    updateTotal();
}

function processPayment() {
    showLoading(true);

    setTimeout(() => {
        // Check if card has sufficient balance
        if (returnState.scannedCard.balance < returnState.totalFee) {
            showLoading(false);
            playErrorSound();
            showAlert('error', 'Thanh toán thất bại: Thẻ không đủ số dư. Vui lòng nạp tiền bổ sung hoặc liên hệ nhân viên. Hotline: 1900 1234');
            return;
        }

        // Simulate 10% payment error
        if (Math.random() < 0.1) {
            showLoading(false);
            playErrorSound();
            showAlert('error', 'Thanh toán thất bại: Lỗi kết nối với hệ thống thanh toán. Vui lòng thử lại hoặc liên hệ nhân viên. Hotline: 1900 1234');
            return;
        }

        // Success
        showLoading(false);
        displayReceipt();
        goToStep(4);
    }, 2000);
}

function displayReceipt() {
    document.getElementById('receiptTime').textContent = formatDateTime(new Date());
    document.getElementById('receiptBikeNumber').textContent = sampleRentalData.bikeNumber;
    document.getElementById('receiptCardNumber').textContent = formatCardNumber(returnState.scannedCard.number);
    document.getElementById('receiptDuration').textContent = formatDuration(returnState.duration);
    document.getElementById('receiptFee').textContent = formatCurrency(returnState.baseFee);

    if (returnState.discount > 0) {
        document.getElementById('receiptDiscountRow').style.display = 'flex';
        document.getElementById('receiptDiscount').textContent = '-' + formatCurrency(returnState.discount);
    } else {
        document.getElementById('receiptDiscountRow').style.display = 'none';
    }

    document.getElementById('receiptTotal').textContent = formatCurrency(returnState.totalFee);
}

// Navigation
function goToStep(step) {
    returnState.currentStep = step;
    showStep(step);
}

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
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.remove('hidden');
    } else {
        overlay.classList.add('hidden');
    }
}

// Reset
function resetApp() {
    if (confirm('Bạn có chắc muốn hủy bỏ?')) {
        location.reload();
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

function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
        return `${mins} phút`;
    } else if (mins === 0) {
        return `${hours} giờ`;
    } else {
        return `${hours} giờ ${mins} phút`;
    }
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

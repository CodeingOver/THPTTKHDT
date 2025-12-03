// State management
let rentalState = {
    currentStep: 1,
    bikes: [],
    selectedBikeId: null,
    scannedCard: null,
    countdownTimer: null,
    countdownSeconds: 60,
    rentalStartTime: null
};

// Bike statuses
const BIKE_STATUS = {
    AVAILABLE: 'available',
    RENTED: 'rented',
    MAINTENANCE: 'maintenance'
};

// Initialize
window.addEventListener('DOMContentLoaded', function() {
    initializeBikes();
    setupEventListeners();
    updateStats();
});

// Initialize bikes with different statuses
function initializeBikes() {
    const totalBikes = 16;
    rentalState.bikes = [];
    
    for (let i = 1; i <= totalBikes; i++) {
        let status;
        const rand = Math.random();
        
        if (i === 5 || i === 12) {
            // Force some bikes to maintenance
            status = BIKE_STATUS.MAINTENANCE;
        } else if (i === 3 || i === 7 || i === 10 || i === 15) {
            // Force some bikes to rented
            status = BIKE_STATUS.RENTED;
        } else {
            // Rest are available
            status = BIKE_STATUS.AVAILABLE;
        }
        
        rentalState.bikes.push({
            id: i,
            number: `B${String(i).padStart(3, '0')}`,
            status: status
        });
    }
    
    renderBikes();
}

// Render bikes grid
function renderBikes() {
    const grid = document.getElementById('bikesGrid');
    grid.innerHTML = '';
    
    rentalState.bikes.forEach(bike => {
        const bikeEl = document.createElement('div');
        bikeEl.className = `bike-slot ${bike.status}`;
        bikeEl.dataset.bikeId = bike.id;
        
        if (bike.id === rentalState.selectedBikeId) {
            bikeEl.classList.add('selected');
        }
        
        let statusText = '';
        switch(bike.status) {
            case BIKE_STATUS.AVAILABLE:
                statusText = 'Sẵn sàng';
                break;
            case BIKE_STATUS.RENTED:
                statusText = 'Đang thuê';
                break;
            case BIKE_STATUS.MAINTENANCE:
                statusText = 'Bảo trì';
                break;
        }
        
        bikeEl.innerHTML = `
            <div class="bike-slot-icon">🚲</div>
            <div class="bike-slot-number">${bike.number}</div>
            <div class="bike-slot-status">${statusText}</div>
        `;
        
        // Add click handler only for available bikes
        if (bike.status === BIKE_STATUS.AVAILABLE) {
            bikeEl.addEventListener('click', () => selectBike(bike.id));
        } else if (bike.status === BIKE_STATUS.RENTED) {
            bikeEl.addEventListener('click', () => {
                playErrorSound();
                showError('Xe không khả dụng. Xe này đã được thuê bởi người khác. Vui lòng chọn xe khác.');
            });
        } else if (bike.status === BIKE_STATUS.MAINTENANCE) {
            bikeEl.addEventListener('click', () => {
                playErrorSound();
                showError('Xe đang bảo trì. Vui lòng chọn xe khác có trạng thái "Sẵn sàng".');
            });
        }
        
        grid.appendChild(bikeEl);
    });
}

// Select bike
function selectBike(bikeId) {
    const bike = rentalState.bikes.find(b => b.id === bikeId);
    
    if (!bike || bike.status !== BIKE_STATUS.AVAILABLE) {
        return;
    }
    
    rentalState.selectedBikeId = bikeId;
    renderBikes();
    updateSelectedBikeDisplay();
    document.getElementById('nextStep1Btn').disabled = false;
    hideAllAlerts();
    showInfo(`Đã chọn xe ${bike.number}. Vui lòng nhấn "Tiếp tục" để quét thẻ.`);
}

// Update selected bike display
function updateSelectedBikeDisplay() {
    const bike = rentalState.bikes.find(b => b.id === rentalState.selectedBikeId);
    
    if (bike) {
        document.getElementById('selectedBikeNumber').textContent = bike.number;
        document.getElementById('summaryBikeNumber').textContent = bike.number;
        document.getElementById('selectedBikeCard').style.display = 'block';
    }
}

// Update stats
function updateStats() {
    const availableCount = rentalState.bikes.filter(b => b.status === BIKE_STATUS.AVAILABLE).length;
    const totalCount = rentalState.bikes.length;
    
    document.getElementById('availableBikes').textContent = availableCount;
    document.getElementById('totalBikes').textContent = totalCount;
}

// Setup event listeners
function setupEventListeners() {
    // Step 1 buttons
    document.getElementById('cancelBtn').addEventListener('click', handleCancel);
    document.getElementById('nextStep1Btn').addEventListener('click', handleNextStep1);
    
    // Step 2 buttons
    document.getElementById('changeBikeBtn').addEventListener('click', handleChangeBike);
    document.getElementById('backStep2Btn').addEventListener('click', () => goToStep(1));
    document.getElementById('confirmRentBtn').addEventListener('click', handleConfirmRent);
    
    // Demo card scan buttons
    document.querySelectorAll('.demo-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const cardType = this.dataset.card;
            simulateCardScan(cardType);
        });
    });
    
    // Step 3 button
    document.getElementById('confirmTakenBtn').addEventListener('click', handleConfirmTaken);
}

// Handle cancel
function handleCancel() {
    if (confirm('Bạn có chắc muốn hủy giao dịch?')) {
        showInfo('Đã hủy giao dịch. Quay về màn hình chính.');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

// Handle next step 1
function handleNextStep1() {
    if (!rentalState.selectedBikeId) {
        showError('Vui lòng chọn xe trước khi tiếp tục.');
        return;
    }
    
    const bike = rentalState.bikes.find(b => b.id === rentalState.selectedBikeId);
    
    if (bike.status !== BIKE_STATUS.AVAILABLE) {
        playErrorSound();
        showError('Xe đã chọn không còn khả dụng. Vui lòng chọn xe khác.');
        return;
    }
    
    goToStep(2);
    showInfo('Vui lòng quét thẻ của bạn để xác nhận thuê xe.');
}

// Handle change bike
function handleChangeBike() {
    goToStep(1);
    rentalState.scannedCard = null;
    document.getElementById('confirmRentBtn').disabled = true;
}

// Simulate card scan
function simulateCardScan(cardType) {
    showLoading();
    
    // Hide scanner animation
    document.getElementById('scannerAnimation').style.display = 'none';
    
    setTimeout(() => {
        hideLoading();
        
        let cardData;
        
        switch(cardType) {
            case 'valid':
                cardData = {
                    valid: true,
                    number: '9704 1234 5678 9012',
                    balance: 150000
                };
                break;
            case 'insufficient':
                cardData = {
                    valid: true,
                    number: '9704 5678 1234 9012',
                    balance: 5000
                };
                break;
            case 'invalid':
                cardData = {
                    valid: false,
                    number: '0000 0000 0000 0000',
                    balance: 0
                };
                break;
        }
        
        processCardScan(cardData);
    }, 1500);
}

// Process card scan
function processCardScan(cardData) {
    if (!cardData.valid) {
        playErrorSound();
        showError('Thẻ không hợp lệ. Vui lòng kiểm tra lại thẻ của bạn.');
        document.getElementById('scannerAnimation').style.display = 'block';
        return;
    }
    
    const minBalance = 20000;
    
    if (cardData.balance < minBalance) {
        playErrorSound();
        showError(`Số dư thẻ không đủ. Số dư hiện tại: ${formatCurrency(cardData.balance)}. Tối thiểu: ${formatCurrency(minBalance)}`);
        document.getElementById('scannerAnimation').style.display = 'block';
        return;
    }
    
    // Card is valid and has sufficient balance
    rentalState.scannedCard = cardData;
    
    // Show card info
    document.getElementById('scannedCardNumber').textContent = cardData.number;
    document.getElementById('scannedCardBalance').textContent = formatCurrency(cardData.balance);
    document.getElementById('cardInfo').classList.remove('hidden');
    
    // Enable confirm button
    document.getElementById('confirmRentBtn').disabled = false;
    
    showSuccess('Thẻ hợp lệ! Vui lòng nhấn "Xác nhận thuê xe" để mở khóa.');
}

// Handle confirm rent
async function handleConfirmRent() {
    if (!rentalState.scannedCard) {
        showError('Vui lòng quét thẻ trước.');
        return;
    }
    
    const bike = rentalState.bikes.find(b => b.id === rentalState.selectedBikeId);
    
    showLoading();
    
    // Simulate unlock process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate 10% chance of mechanical failure
    if (Math.random() < 0.1) {
        hideLoading();
        playErrorSound();
        
        // Mark bike as maintenance
        bike.status = BIKE_STATUS.MAINTENANCE;
        renderBikes();
        updateStats();
        
        showError('Xe đang bảo trì. Xe không thể mở khóa do chốt khóa bị kẹt (lỗi kỹ thuật). Vui lòng chọn xe khác.');
        
        setTimeout(() => {
            goToStep(1);
            rentalState.selectedBikeId = null;
            rentalState.scannedCard = null;
        }, 3000);
        
        return;
    }
    
    hideLoading();
    
    // Unlock successful
    bike.status = BIKE_STATUS.RENTED;
    rentalState.rentalStartTime = new Date();
    
    // Update UI
    document.getElementById('rentalBikeNumber').textContent = bike.number;
    document.getElementById('rentalStartTime').textContent = rentalState.rentalStartTime.toLocaleTimeString('vi-VN');
    
    goToStep(3);
    startCountdown();
    
    showSuccess('Đã mở khóa thành công! Vui lòng lấy xe trong vòng 60 giây.');
}

// Start countdown
function startCountdown() {
    rentalState.countdownSeconds = 60;
    updateCountdownDisplay();
    
    rentalState.countdownTimer = setInterval(() => {
        rentalState.countdownSeconds--;
        updateCountdownDisplay();
        
        if (rentalState.countdownSeconds <= 0) {
            clearInterval(rentalState.countdownTimer);
            handleCountdownExpired();
        }
    }, 1000);
}

// Update countdown display
function updateCountdownDisplay() {
    document.getElementById('countdownTimer').textContent = rentalState.countdownSeconds;
    
    const progressPercent = (rentalState.countdownSeconds / 60) * 100;
    document.getElementById('countdownBar').style.width = `${progressPercent}%`;
    
    // Warning sound at 10 seconds
    if (rentalState.countdownSeconds === 10) {
        playErrorSound();
        showWarning('Còn 10 giây! Vui lòng nhanh tay lấy xe.');
    }
}

// Handle countdown expired
function handleCountdownExpired() {
    playErrorSound();
    
    const bike = rentalState.bikes.find(b => b.id === rentalState.selectedBikeId);
    bike.status = BIKE_STATUS.AVAILABLE;
    
    showError('Hết thời gian! Người dùng không lấy xe ra sau khi mở khóa. Hệ thống đã tự động khóa lại xe và hủy giao dịch thuê.');
    
    setTimeout(() => {
        window.location.reload();
    }, 4000);
}

// Handle confirm taken
function handleConfirmTaken() {
    if (rentalState.countdownTimer) {
        clearInterval(rentalState.countdownTimer);
    }
    
    showSuccess('Cảm ơn bạn đã thuê xe! Chúc bạn có chuyến đi an toàn.');
    
    // Print receipt
    printReceipt();
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 3000);
}

// Go to step
function goToStep(step) {
    rentalState.currentStep = step;
    
    // Hide all step contents
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show current step content
    document.getElementById(`step${step}Content`).classList.remove('hidden');
    
    // Update step indicator
    document.querySelectorAll('.step-item').forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed');
        if (index + 1 < step) {
            stepEl.classList.add('completed');
        } else if (index + 1 === step) {
            stepEl.classList.add('active');
        }
    });
    
    hideAllAlerts();
}

// Print receipt
function printReceipt() {
    const bike = rentalState.bikes.find(b => b.id === rentalState.selectedBikeId);
    
    console.log('=== BIÊN LAI THUÊ XE ===');
    console.log('Số xe:', bike.number);
    console.log('Số thẻ:', rentalState.scannedCard.number);
    console.log('Bắt đầu thuê:', rentalState.rentalStartTime.toLocaleString('vi-VN'));
    console.log('Giá thuê: 5.000đ/giờ');
    console.log('Đặt cọc: 50.000đ');
    console.log('========================');
}

// Play error sound
function playErrorSound() {
    const audio = document.getElementById('errorSound');
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }
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

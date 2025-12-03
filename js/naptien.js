// Dữ liệu mô phỏng
let cardData = {
    cardNumber: '9704 1234 5678 9012',
    balance: 250000,
    isLocked: false,
    failedAttempts: 0,
    lockTime: null
};

let transactionData = {
    selectedAmount: 0,
    promoCode: '',
    promoDiscount: 0,
    promoBonus: 0
};

// Mã khuyến mãi mẫu
const promoCodes = {
    'WELCOME100': { type: 'bonus', value: 100000, description: 'Tặng 100.000đ khi nạp từ 200.000đ' },
    'DISCOUNT10': { type: 'percent', value: 10, description: 'Giảm 10% số tiền nạp' },
    'BONUS50K': { type: 'bonus', value: 50000, description: 'Tặng 50.000đ khi nạp từ 100.000đ' }
};

// Khởi tạo
window.addEventListener('DOMContentLoaded', function() {
    initializeCard();
    setupEventListeners();
});

function initializeCard() {
    // Mô phỏng đọc thẻ - luôn thành công cho demo
    setTimeout(() => {
        document.getElementById('cardNumber').textContent = cardData.cardNumber;
        document.getElementById('currentBalance').textContent = formatCurrency(cardData.balance);
        document.getElementById('cardStatus').classList.add('success');
        showInfo('Thẻ đã được nhận diện thành công');
    }, 1000);

    // Kiểm tra trạng thái khóa
    checkLockStatus();
}

function setupEventListeners() {
    // Chọn mệnh giá
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('customAmount').value = '';
            transactionData.selectedAmount = parseInt(this.dataset.amount);
            updateTotalDisplay();
            hideAllAlerts();
        });
    });

    // Nhập số tiền tùy chỉnh
    document.getElementById('customAmount').addEventListener('input', function() {
        document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
        transactionData.selectedAmount = parseInt(this.value) || 0;
        updateTotalDisplay();
        hideAllAlerts();
    });

    // Áp dụng mã khuyến mãi
    document.getElementById('applyPromoBtn').addEventListener('click', applyPromoCode);

    // Xử lý submit
    document.getElementById('topupForm').addEventListener('submit', handleSubmit);

    // Nút hủy
    document.getElementById('cancelBtn').addEventListener('click', handleCancel);
}

function applyPromoCode() {
    const promoInput = document.getElementById('promoCode').value.trim().toUpperCase();
    const promoMessageEl = document.getElementById('promoMessage');
    
    if (!promoInput) {
        promoMessageEl.className = 'promo-message error';
        promoMessageEl.textContent = 'Vui lòng nhập mã khuyến mãi';
        return;
    }

    if (!transactionData.selectedAmount) {
        promoMessageEl.className = 'promo-message error';
        promoMessageEl.textContent = 'Vui lòng chọn số tiền nạp trước';
        return;
    }

    const promo = promoCodes[promoInput];
    
    if (promo) {
        transactionData.promoCode = promoInput;
        
        if (promo.type === 'percent') {
            transactionData.promoBonus = Math.floor(transactionData.selectedAmount * promo.value / 100);
            promoMessageEl.className = 'promo-message success';
            promoMessageEl.textContent = `✓ ${promo.description}`;
        } else if (promo.type === 'bonus') {
            // Kiểm tra điều kiện
            if (transactionData.selectedAmount >= 200000 && promo.value === 100000) {
                transactionData.promoBonus = promo.value;
                promoMessageEl.className = 'promo-message success';
                promoMessageEl.textContent = `✓ ${promo.description}`;
            } else if (transactionData.selectedAmount >= 100000 && promo.value === 50000) {
                transactionData.promoBonus = promo.value;
                promoMessageEl.className = 'promo-message success';
                promoMessageEl.textContent = `✓ ${promo.description}`;
            } else {
                promoMessageEl.className = 'promo-message error';
                promoMessageEl.textContent = 'Số tiền nạp chưa đủ điều kiện áp dụng mã này';
                transactionData.promoBonus = 0;
                transactionData.promoCode = '';
            }
        }
        
        updateTotalDisplay();
    } else {
        promoMessageEl.className = 'promo-message error';
        promoMessageEl.textContent = '✗ Mã khuyến mãi không hợp lệ';
        transactionData.promoBonus = 0;
        transactionData.promoCode = '';
        updateTotalDisplay();
    }
}

function updateTotalDisplay() {
    const amount = transactionData.selectedAmount;
    const bonus = transactionData.promoBonus;
    const total = amount + bonus;

    document.getElementById('displayAmount').textContent = formatCurrency(amount);
    document.getElementById('displayPromo').textContent = formatCurrency(bonus);
    document.getElementById('displayTotal').textContent = formatCurrency(total);
}

async function handleSubmit(e) {
    e.preventDefault();
    
    if (cardData.isLocked) {
        showError('Tài khoản đang bị khóa. Vui lòng thử lại sau.');
        return;
    }

    // Validate
    if (!transactionData.selectedAmount || transactionData.selectedAmount < 10000) {
        showError('Vui lòng chọn số tiền nạp (tối thiểu 10.000đ)');
        return;
    }

    // Hiển thị loading
    showLoading();
    hideAllAlerts();

    // Mô phỏng kiểm tra kết nối Internet
    const hasInternet = await checkInternetConnection();
    
    if (!hasInternet) {
        hideLoading();
        showError('Mất kết nối Internet. Vui lòng kiểm tra và thử lại.');
        return;
    }

    // Mô phỏng giao dịch ngân hàng
    const bankResult = await processBankTransaction();
    
    hideLoading();

    if (bankResult.success) {
        // Cập nhật số dư
        const totalAmount = transactionData.selectedAmount + transactionData.promoBonus;
        cardData.balance += totalAmount;
        cardData.failedAttempts = 0;
        
        // Cập nhật giao diện
        document.getElementById('currentBalance').textContent = formatCurrency(cardData.balance);
        
        // Hiển thị thông báo thành công
        showInfo(`Nạp tiền thành công! Số dư mới: ${formatCurrency(cardData.balance)}`);
        
        // In biên lai (mô phỏng)
        setTimeout(() => {
            printReceipt();
        }, 1500);
        
        // Reset form
        resetForm();
        
    } else {
        cardData.failedAttempts++;
        showError(bankResult.message);
        
        if (cardData.failedAttempts >= 3) {
            lockAccount();
        } else {
            showWarning(`Giao dịch thất bại ${cardData.failedAttempts}/3 lần. ${3 - cardData.failedAttempts} lần còn lại trước khi bị khóa.`);
        }
    }
}

function handleCancel() {
    if (confirm('Bạn có chắc muốn hủy giao dịch và lấy lại thẻ?')) {
        showInfo('Đã hủy giao dịch. Vui lòng lấy thẻ của bạn.');
        setTimeout(() => {
            resetForm();
            // Quay về màn hình chính hoặc redirect
            window.location.href = 'index.html'; // Thay đổi theo cần thiết
        }, 2000);
    }
}

function checkInternetConnection() {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mô phỏng: luôn có kết nối cho demo
            resolve(true);
        }, 1000);
    });
}

function processBankTransaction() {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mô phỏng: luôn thành công cho demo
            resolve({ success: true });
        }, 2000);
    });
}

function lockAccount() {
    cardData.isLocked = true;
    cardData.lockTime = new Date().getTime() + (60 * 60 * 1000); // Khóa 1 giờ
    
    // Lưu vào localStorage để giữ trạng thái
    localStorage.setItem('cardLockData', JSON.stringify({
        isLocked: true,
        lockTime: cardData.lockTime,
        failedAttempts: cardData.failedAttempts
    }));
    
    showError('Tài khoản đã bị khóa do thất bại 3 lần liên tiếp. Vui lòng thử lại sau 1 giờ.');
    disableForm();
    startLockTimer();
}

function checkLockStatus() {
    const savedData = localStorage.getItem('cardLockData');
    
    if (savedData) {
        const lockData = JSON.parse(savedData);
        const now = new Date().getTime();
        
        if (lockData.isLocked && lockData.lockTime > now) {
            cardData.isLocked = true;
            cardData.lockTime = lockData.lockTime;
            cardData.failedAttempts = lockData.failedAttempts;
            disableForm();
            startLockTimer();
        } else if (lockData.lockTime <= now) {
            // Hết thời gian khóa
            localStorage.removeItem('cardLockData');
            cardData.isLocked = false;
            cardData.failedAttempts = 0;
        }
    }
}

function startLockTimer() {
    document.getElementById('lockedMessage').classList.add('show');
    document.getElementById('actionButtons').style.display = 'none';
    
    const timerInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = cardData.lockTime - now;
        
        if (distance < 0) {
            clearInterval(timerInterval);
            unlockAccount();
        } else {
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            document.getElementById('lockTimer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

function unlockAccount() {
    cardData.isLocked = false;
    cardData.failedAttempts = 0;
    cardData.lockTime = null;
    localStorage.removeItem('cardLockData');
    
    document.getElementById('lockedMessage').classList.remove('show');
    document.getElementById('actionButtons').style.display = 'grid';
    enableForm();
    showInfo('Tài khoản đã được mở khóa. Bạn có thể thực hiện giao dịch.');
}

function printReceipt() {
    console.log('=== BIÊN LAI NẠP TIỀN ===');
    console.log('Số thẻ:', cardData.cardNumber);
    console.log('Số tiền nạp:', formatCurrency(transactionData.selectedAmount));
    console.log('Khuyến mãi:', formatCurrency(transactionData.promoBonus));
    console.log('Tổng nhận:', formatCurrency(transactionData.selectedAmount + transactionData.promoBonus));
    console.log('Số dư mới:', formatCurrency(cardData.balance));
    console.log('Thời gian:', new Date().toLocaleString('vi-VN'));
    console.log('========================');
    
    alert('Biên lai đã được in. Vui lòng lấy thẻ của bạn.');
}

function resetForm() {
    document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('customAmount').value = '';
    document.getElementById('promoCode').value = '';
    document.getElementById('promoMessage').className = 'promo-message';
    
    transactionData = {
        selectedAmount: 0,
        promoCode: '',
        promoBonus: 0
    };
    
    updateTotalDisplay();
    hideAllAlerts();
}

function disableForm() {
    document.querySelectorAll('.amount-btn, .input-field, .apply-btn, .btn').forEach(el => {
        el.disabled = true;
    });
}

function enableForm() {
    document.querySelectorAll('.amount-btn, .input-field, .apply-btn, .btn').forEach(el => {
        el.disabled = false;
    });
}

function showLoading() {
    document.getElementById('loading').classList.add('show');
    document.getElementById('actionButtons').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').classList.remove('show');
    document.getElementById('actionButtons').style.display = 'grid';
}

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

function hideAllAlerts() {
    document.querySelectorAll('.alert').forEach(alert => {
        alert.classList.remove('show');
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
}

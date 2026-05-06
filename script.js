const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const itemList = document.getElementById('itemList');
const spinBtn = document.getElementById('spinBtn');
const winnerText = document.getElementById('winnerText');

let items = [
    { label: "โชคดีสุด", color: "#ff6b6b", weight: 1 },
    { label: "โชคปานกลาง", color: "#feca57", weight: 1 },
    { label: "โชคร้าย", color: "#a29bfe", weight: 1 }
];

let currentRotation = 0;
let isSpinning = false;

// ฟังก์ชันวาดตารางจัดการด้านขวา
function renderAdminPanel() {
    itemList.innerHTML = '';
    items.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <div class="color-dot" style="background: ${item.color}"></div>
            <input type="text" class="item-input" value="${item.label}" onchange="updateItem(${index}, 'label', this.value)">
            <input type="number" class="weight-input" value="${item.weight}" onchange="updateItem(${index}, 'weight', this.value)">
            <button class="delete-btn" onclick="removeItem(${index})">−</button>
        `;
        itemList.appendChild(row);
    });
    drawWheel();
}

function updateItem(index, key, value) {
    items[index][key] = key === 'weight' ? parseFloat(value) || 1 : value;
    drawWheel();
}

function removeItem(index) {
    if (items.length > 2) {
        items.splice(index, 1);
        renderAdminPanel();
    }
}

document.getElementById('addBtn').onclick = () => {
    const randomColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
    items.push({ label: "รายการใหม่", color: randomColor, weight: 1 });
    renderAdminPanel();
};

// ฟังก์ชันวาดวงล้อ
function drawWheel() {
    const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
    let startAngle = currentRotation;
    
    canvas.width = 1000; canvas.height = 1000;
    ctx.clearRect(0, 0, 1000, 1000);

    items.forEach(item => {
        const sliceAngle = (item.weight / totalWeight) * 2 * Math.PI;
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.moveTo(500, 500);
        ctx.arc(500, 500, 480, startAngle, startAngle + sliceAngle);
        ctx.fill();
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.stroke();

        // วาดตัวอักษร
        ctx.save();
        ctx.translate(500, 500);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 35px Kanit";
        ctx.fillText(item.label, 200, 10);
        ctx.restore();

        startAngle += sliceAngle;
    });
}

// ระบบ Spin (Physics Based)
function spin() {
    if (isSpinning) return;
    isSpinning = true;
    winnerText.innerText = "กำลังหมุน...";
    
    const spinDuration = 5000; // 5 วินาที
    const startValue = currentRotation;
    const extraSpins = (Math.random() * 5 + 10) * Math.PI * 2; // หมุน 10-15 รอบ
    const startTime = performance.now();

    function animate(currentTime) {
        let elapsed = currentTime - startTime;
        let progress = Math.min(elapsed / spinDuration, 1);
        
        // Easing function (หมุนเร็วช่วงแรก และค่อยๆ ช้าลงตอนจบ)
        const easeOut = 1 - Math.pow(1 - progress, 4);
        
        currentRotation = startValue + extraSpins * easeOut;
        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            calculateResult();
        }
    }
    requestAnimationFrame(animate);
}

function calculateResult() {
    const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
    // คำนวณหาว่ามุมปัจจุบัน (เข็มชี้อยู่ที่ -90 องศา หรือ 1.5 * PI) ตรงกับ Item ไหน
    let normalizedRotation = (currentRotation % (Math.PI * 2));
    let angleToFind = (1.5 * Math.PI - normalizedRotation);
    while (angleToFind < 0) angleToFind += Math.PI * 2;
    
    let currentAngle = 0;
    for (let item of items) {
        const sliceAngle = (item.weight / totalWeight) * 2 * Math.PI;
        if (angleToFind >= currentAngle && angleToFind < currentAngle + sliceAngle) {
            winnerText.innerText = `ยินดีด้วย! คุณได้รับ: ${item.label}`;
            break;
        }
        currentAngle += sliceAngle;
    }
}

spinBtn.onclick = spin;
renderAdminPanel();

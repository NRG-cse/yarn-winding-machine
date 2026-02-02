const TOTAL_MACHINES = 20;
let currentMachine = null;
let totalCount = 810234;
let efficiency = 92;
let currentModalMachine = null;

// Initialize 20 machines
const machines = Array.from({length: TOTAL_MACHINES}, (_, i) => ({
    id: i + 1,
    name: `CH${String(i + 1).padStart(2,'0')}`,
    isOn: false,
    value: "0000",
    efficiency: 85 + Math.floor(Math.random() * 15),
    count: Math.floor(Math.random() * 5000) + 1000,
    setValue: Math.floor(Math.random() * 9000) + 1000,
    modalSetValue: Math.floor(Math.random() * 9000) + 1000,
    currentCount: Math.floor(Math.random() * 9999)
}));

const grid = document.getElementById("machinesGrid");

// SVG for power switch icon
const powerOnSVG = `<svg class="power-switch-icon" viewBox="0 0 24 24">
    <path fill="currentColor" d="M13,3H11V13H13V3M17.83,5.17L16.41,6.59C18.05,7.91 19,9.9 19,12A7,7 0 0,1 12,19A7,7 0 0,1 5,12C5,9.91 5.95,7.91 7.58,6.58L6.17,5.17C4.23,6.82 3,9.26 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12C21,9.26 19.77,6.82 17.83,5.17Z"/>
</svg>`;

const powerOffSVG = `<svg class="power-switch-icon" viewBox="0 0 24 24">
    <path fill="currentColor" d="M12,1L7,6H9V14H15V6H17L12,1M12,3.69L14.31,6H13V12H11V6H9.69L12,3.69M4.47,6L1,9.46L2.41,10.87L5.88,7.41L4.47,6M19.53,6L18.12,7.41L21.59,10.87L23,9.46L19.53,6M12,20.31L9.69,18H11V12H13V18H14.31L12,20.31M18.12,16.59L19.53,18L23,14.54L21.59,13.13L18.12,16.59M5.88,16.59L2.41,13.13L1,14.54L4.47,18L5.88,16.59Z"/>
</svg>`;

function updateDateTime(){
    const now = new Date();
    const options = { 
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    const timeStr = now.toLocaleTimeString('en-US', options);
    const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
    document.getElementById("datetime").innerText = `${dateStr.toUpperCase()} | ${timeStr}`;
}

function updateEfficiency() {
    const activeMachines = machines.filter(m => m.isOn);
    if (activeMachines.length > 0) {
        const avgEfficiency = Math.round(
            activeMachines.reduce((sum, m) => sum + m.efficiency, 0) / activeMachines.length
        );
        efficiency = avgEfficiency;
    } else {
        efficiency = 92;
    }
    
    document.getElementById("globalEfficiency").textContent = `${efficiency}%`;
    const meterFill = document.querySelector('.meter-fill');
    if (meterFill) {
        meterFill.style.width = `${efficiency}%`;
    }
}

function updateTotalCount() {
    const activeCount = machines.filter(m => m.isOn).length;
    totalCount += activeCount * 50;
    
    let formattedCount;
    if (totalCount >= 1000000) {
        formattedCount = `${(totalCount/1000000).toFixed(1)}M`;
    } else if (totalCount >= 1000) {
        formattedCount = `${Math.floor(totalCount/1000)}k`;
    } else {
        formattedCount = totalCount;
    }
    
    const countValue = document.querySelector('.count-value');
    const countSub = document.querySelector('.count-sub');
    
    if (countValue) countValue.textContent = formattedCount;
    if (countSub) countSub.textContent = totalCount.toString();
}

function renderMachines(){
    grid.innerHTML = "";

    machines.forEach(m => {
        // Update count if machine is on
        if (m.isOn) {
            m.currentCount += Math.floor(Math.random() * 10) + 1;
        }
        
        const html = `
        <div class="machine-card ${m.isOn ? 'active' : ''}" data-id="${m.id}" data-action="openModal">
            <div class="machine-header">
                <div class="machine-id">${m.name}</div>
                <div class="status-container">
                    <div class="status-indicator ${m.isOn ? 'active' : ''}"></div>
                    <div class="machine-status ${m.isOn ? 'status-active' : 'status-inactive'}">
                        ${m.isOn ? 'ON' : 'OFF'}
                    </div>
                </div>
            </div>

            <div class="power-switch-container" data-id="${m.id}" data-action="toggle">
                <div class="power-switch ${m.isOn ? 'active' : ''}">
                    ${m.isOn ? powerOnSVG : powerOffSVG}
                </div>
            </div>

            <div class="machine-values-display">
                <div class="values-display-row">
                    <div class="value-display-item">
                        <div class="value-display-label">SET VALUE</div>
                        <div class="value-display-data">${m.modalSetValue.toString().padStart(4, '0')}</div>
                    </div>
                    <div class="value-display-item">
                        <div class="value-display-label">COUNT</div>
                        <div class="value-display-data">${m.currentCount}</div>
                    </div>
                </div>
                
                <div class="efficiency-display-bottom">
                    <div class="efficiency-label-bottom">EFFICIENCY</div>
                    <div class="efficiency-value-bottom">${m.efficiency}%</div>
                </div>
            </div>
        </div>`;

        grid.innerHTML += html;
    });

    // Update global status
    const activeCount = machines.filter(m => m.isOn).length;
    const globalStatusElement = document.getElementById("globalStatus");
    if (globalStatusElement) {
        globalStatusElement.innerHTML = 
            `<span style="color:#00ff88">${activeCount} ACTIVE</span> | 
             <span style="color:#ffaa00">${TOTAL_MACHINES - activeCount} IDLE</span> | 
             <span style="color:#00ccff">TOTAL: ${TOTAL_MACHINES}</span>`;
    }
    
    // Update system status
    const systemStatus = document.getElementById("systemStatus");
    if (systemStatus) {
        if (activeCount === TOTAL_MACHINES) {
            systemStatus.textContent = "FULL OPERATION";
            systemStatus.style.color = "#00ff88";
        } else if (activeCount > 0) {
            systemStatus.textContent = "PARTIAL OPERATION";
            systemStatus.style.color = "#ffaa00";
        } else {
            systemStatus.textContent = "STANDBY";
            systemStatus.style.color = "#ff6666";
        }
    }
    
    updateEfficiency();
    updateTotalCount();
}

/* OPEN MACHINE MODAL */
function openMachineModal(machine) {
    currentModalMachine = machine;
    
    // Update modal with machine data
    document.getElementById("machineModalTitle").textContent = `${machine.name} CONTROL`;
    document.getElementById("modalChannelName").textContent = machine.name;
    document.getElementById("modalChannelStatus").textContent = machine.isOn ? 'ON' : 'OFF';
    document.getElementById("modalChannelStatus").className = machine.isOn ? 'status-active' : 'status-inactive';
    document.getElementById("modalSetValue").value = machine.modalSetValue;
    document.getElementById("modalCurrentValue").textContent = machine.modalSetValue.toString().padStart(4, '0');
    document.getElementById("modalCountValue").textContent = machine.currentCount;
    document.getElementById("modalEfficiency").textContent = `${machine.efficiency}%`;
    
    // Show modal
    document.getElementById("machineModal").style.display = "flex";
    document.body.style.overflow = 'hidden';
}

/* CLOSE MACHINE MODAL */
function closeMachineModal() {
    document.getElementById("machineModal").style.display = "none";
    currentModalMachine = null;
    document.body.style.overflow = 'hidden';
}

/* SET VALUE IN MODAL */
function setModalValue() {
    if (!currentModalMachine) return;
    
    const valueInput = document.getElementById("modalSetValue");
    const v = valueInput.value;
    
    if(v === "" || isNaN(v)) {
        alert("Please enter a valid number (0-9999)");
        valueInput.focus();
        return;
    }
    
    const numValue = parseInt(v);
    if(numValue < 0 || numValue > 9999) {
        alert("Please enter a number between 0 and 9999");
        valueInput.focus();
        return;
    }
    
    currentModalMachine.modalSetValue = numValue;
    document.getElementById("modalCurrentValue").textContent = numValue.toString().padStart(4, '0');
    
    // সাথে সাথে মেশিন কার্ড আপডেট - NEW FEATURE
    const machineId = currentModalMachine.id;
    const machineCard = document.querySelector(`.machine-card[data-id="${machineId}"]`);
    if (machineCard) {
        const setValueElement = machineCard.querySelector('.value-display-item:first-child .value-display-data');
        if (setValueElement) {
            setValueElement.textContent = numValue.toString().padStart(4, '0');
        }
    }
}

/* RESET VALUE IN MODAL */
function resetModalValue() {
    if (!currentModalMachine) return;
    
    currentModalMachine.modalSetValue = 0;
    document.getElementById("modalSetValue").value = 0;
    document.getElementById("modalCurrentValue").textContent = "0000";
    
    // সাথে সাথে মেশিন কার্ড আপডেট - NEW FEATURE
    const machineId = currentModalMachine.id;
    const machineCard = document.querySelector(`.machine-card[data-id="${machineId}"]`);
    if (machineCard) {
        const setValueElement = machineCard.querySelector('.value-display-item:first-child .value-display-data');
        if (setValueElement) {
            setValueElement.textContent = "0000";
        }
    }
}

/* GLOBAL CONTROLS */
document.getElementById("globalStart").addEventListener('click', () => {
    machines.forEach(m => {
        m.isOn = true;
        m.efficiency = 85 + Math.floor(Math.random() * 15);
    });
    renderMachines();
});

document.getElementById("globalStop").addEventListener('click', () => {
    machines.forEach(m => {
        m.isOn = false;
    });
    renderMachines();
});

document.getElementById("globalReset").addEventListener('click', () => {
    machines.forEach(m => {
        m.value = "0000";
        m.efficiency = 85 + Math.floor(Math.random() * 15);
        m.count = Math.floor(Math.random() * 5000) + 1000;
        m.currentCount = Math.floor(Math.random() * 9999);
        m.setValue = Math.floor(Math.random() * 9000) + 1000;
        m.modalSetValue = Math.floor(Math.random() * 9000) + 1000;
    });
    totalCount = 810234;
    updateTotalCount();
    renderMachines();
});

/* MACHINE ACTIONS */
document.addEventListener("click", e => {
    const element = e.target.closest('[data-id]');
    if(!element) return;
    
    const {id, action} = element.dataset;
    const m = machines.find(x => x.id == id);

    if(action === "toggle"){
        const switchElement = element.querySelector('.power-switch');
        switchElement.style.transform = 'scale(0.9)';
        setTimeout(() => {
            switchElement.style.transform = '';
        }, 200);
        
        m.isOn = !m.isOn;
        m.efficiency = m.isOn ? 85 + Math.floor(Math.random() * 15) : 85;
        renderMachines();
    }

    if(action === "openModal"){
        openMachineModal(m);
    }
});

/* MACHINE MODAL CONTROLS */
document.getElementById("modalClose").addEventListener('click', closeMachineModal);
document.getElementById("modalBtnSet").addEventListener('click', setModalValue);
document.getElementById("modalBtnReset").addEventListener('click', resetModalValue);

// Enter key support for modal input
document.getElementById("modalSetValue").addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
        setModalValue();
    }
});

// Modal keyboard controls
document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') {
        if (document.getElementById("machineModal").style.display === 'flex') {
            closeMachineModal();
        }
        if (document.getElementById("settingsModal").style.display === 'flex') {
            document.getElementById("settingsModal").style.display = "none";
            document.body.style.overflow = 'hidden';
        }
    }
});

// Auto update values
setInterval(() => {
    machines.forEach(m => {
        if(m.isOn) {
            m.efficiency = Math.min(99, Math.max(85, m.efficiency + (Math.random() * 4 - 2)));
            m.currentCount += Math.floor(Math.random() * 5);
        }
    });
    renderMachines();
}, 3000);

/* INITIALIZATION */
function initializeMachines() {
    const machineStatus = {
        'CH01': false, 'CH02': false,
        'CH03': false, 'CH04': true,
        'CH05': false, 'CH06': false,
        'CH07': false, 'CH08': true,
        'CH09': false, 'CH10': true,
        'CH11': true, 'CH12': false,
        'CH13': false, 'CH14': true,
        'CH15': false, 'CH16': true,
        'CH17': false, 'CH18': false,
        'CH19': false, 'CH20': false
    };
    
    machines.forEach(m => {
        m.isOn = machineStatus[m.name] || false;
        m.modalSetValue = Math.floor(Math.random() * 9000) + 1000;
        if (m.isOn) {
            m.value = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
            m.efficiency = 85 + Math.floor(Math.random() * 15);
            m.setValue = Math.floor(Math.random() * 9000) + 1000;
            m.currentCount = Math.floor(Math.random() * 9999);
        }
    });
    
    efficiency = 92;
    totalCount = 810234;
}

// Initialize
setInterval(updateDateTime, 1000);
initializeMachines();
renderMachines();
updateDateTime();
updateTotalCount();

// Prevent any touch scrolling
document.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });

// Prevent mouse wheel scrolling
document.addEventListener('wheel', function(e) {
    e.preventDefault();
}, { passive: false });
const TOTAL_MACHINES = 16;
let currentMachine = null;
let totalCount = 801234;
let efficiency = 89;
let channelModalMachine = null;
let channelCounterInterval = null;

const machines = Array.from({length: TOTAL_MACHINES}, (_, i) => ({
    id: i + 1,
    name: `CH${String(i + 1).padStart(2,'0')}`,
    isOn: false,
    value: "0000",
    efficiency: 85 + Math.floor(Math.random() * 15),
    count: Math.floor(Math.random() * 5000) + 1000,
    setValue: Math.floor(Math.random() * 9000) + 1000,
    modalIsOn: false,
    modalCount: 0
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
        efficiency = 89;
    }
    
    document.getElementById("globalEfficiency").textContent = `${efficiency}%`;
    document.querySelector('.meter-fill').style.width = `${efficiency}%`;
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
    
    countValue.textContent = formattedCount;
    countSub.textContent = totalCount.toString();
}

function hexToDec(hexValue) {
    const dec = parseInt(hexValue, 16);
    return isNaN(dec) ? 0 : dec;
}

function calculateGaugeHeight(hexValue) {
    const maxValue = 65535;
    const value = hexToDec(hexValue);
    return (value / maxValue) * 100;
}

function formatValue(v){
    return v.split("").join(" ");
}

function renderMachines(){
    grid.innerHTML = "";

    machines.forEach(m => {
        const gaugeHeight = calculateGaugeHeight(m.value);
        const machineEfficiency = m.efficiency;
        
        const html = `
        <div class="machine-card ${m.isOn ? 'active' : ''}" data-id="${m.id}">
            <div class="machine-header">
                <div class="machine-id">${m.name}</div>
                <div class="status-container">
                    <div class="status-indicator ${m.isOn ? 'active' : ''}"></div>
                    <div class="machine-status ${m.isOn ? 'status-active' : 'status-inactive'}">
                        ${m.isOn ? 'ON' : 'OFF'}
                    </div>
                </div>
            </div>

            <div class="power-switch-container" data-id="${m.id}" data-action="open-controller">
                <div class="power-switch ${m.isOn ? 'active' : ''}">
                    ${m.isOn ? powerOnSVG : powerOffSVG}
                </div>
            </div>

            <div class="value-display-section">
                <div class="value-label">VALUE</div>
                <div class="value-display">${formatValue(m.value)}</div>
                <div class="gauge-container">
                    <div class="gauge-fill" style="width: ${gaugeHeight}%"></div>
                </div>
                <div class="efficiency-label">EFF: ${machineEfficiency}%</div>
            </div>

            <div class="machine-controls">
                <button class="control-btn set" data-id="${m.id}" data-action="set">SET</button>
                <button class="control-btn reset" data-id="${m.id}" data-action="reset">RESET</button>
            </div>
        </div>`;

        grid.innerHTML += html;
    });

    // Update global status
    const activeCount = machines.filter(m => m.isOn).length;
    document.getElementById("globalStatus").innerHTML = 
        `<span style="color:#00ff88">${activeCount} ACTIVE</span> | 
         <span style="color:#ffaa00">${TOTAL_MACHINES - activeCount} IDLE</span> | 
         <span style="color:#00ccff">TOTAL: ${TOTAL_MACHINES}</span>`;
    
    // Update system status
    const systemStatus = document.getElementById("systemStatus");
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
    
    // Update efficiency and count
    updateEfficiency();
    updateTotalCount();
}

/* OPEN CHANNEL CONTROLLER MODAL */
function openChannelController(machine) {
    channelModalMachine = machine;
    
    // Update modal with machine data
    document.getElementById("controllerTitle").textContent = `${machine.name} CONTROLLER`;
    document.getElementById("controllerChannelLabel").textContent = machine.name;
    document.getElementById("controller-channel").textContent = machine.name.replace("CH", "");
    document.getElementById("controller-set-value").textContent = machine.setValue;
    document.getElementById("controller-count-value").textContent = machine.count;
    document.getElementById("controller-efficiency-value").textContent = `${machine.efficiency}%`;
    
    // Set toggle state
    const toggle = document.getElementById("controller-power-toggle");
    toggle.checked = machine.modalIsOn || machine.isOn;
    
    // Start counter if modal is on
    if (toggle.checked) {
        startModalCounter();
    }
    
    // Show modal
    document.getElementById("channelControllerModal").style.display = "flex";
}

/* START COUNTER FOR MODAL */
function startModalCounter() {
    if (channelCounterInterval) clearInterval(channelCounterInterval);
    
    channelCounterInterval = setInterval(() => {
        if (channelModalMachine && document.getElementById("controller-power-toggle").checked) {
            channelModalMachine.modalCount = (channelModalMachine.modalCount || channelModalMachine.count) + 1;
            channelModalMachine.count = channelModalMachine.modalCount;
            
            document.getElementById("controller-count-value").textContent = channelModalMachine.modalCount;
            
            // Update efficiency based on count (for demo)
            const efficiency = 90 + (channelModalMachine.modalCount % 10);
            channelModalMachine.efficiency = efficiency;
            document.getElementById("controller-efficiency-value").textContent = efficiency + '%';
            
            // Also update the machine card efficiency
            const card = document.querySelector(`.machine-card[data-id="${channelModalMachine.id}"] .efficiency-label`);
            if (card) {
                card.textContent = `EFF: ${efficiency}%`;
            }
        }
    }, 1000);
}

/* CLOSE CHANNEL CONTROLLER MODAL */
function closeChannelController() {
    if (channelCounterInterval) {
        clearInterval(channelCounterInterval);
        channelCounterInterval = null;
    }
    
    document.getElementById("channelControllerModal").style.display = "none";
    channelModalMachine = null;
    
    // Update main view
    renderMachines();
}

/* GLOBAL CONTROLS */
document.getElementById("globalStart").onclick = () => {
    machines.forEach(m => {
        m.isOn = true;
        m.modalIsOn = true;
        m.efficiency = 85 + Math.floor(Math.random() * 15);
    });
    renderMachines();
};

document.getElementById("globalStop").onclick = () => {
    machines.forEach(m => {
        m.isOn = false;
        m.modalIsOn = false;
    });
    renderMachines();
};

document.getElementById("globalReset").onclick = () => {
    machines.forEach(m => {
        m.value = "0000";
        m.efficiency = 85 + Math.floor(Math.random() * 15);
        m.count = Math.floor(Math.random() * 5000) + 1000;
        m.setValue = Math.floor(Math.random() * 9000) + 1000;
        m.modalCount = 0;
    });
    totalCount = 801234;
    renderMachines();
};

/* MACHINE ACTIONS */
document.addEventListener("click", e => {
    const element = e.target.closest('[data-id]');
    if(!element) return;
    
    const {id, action} = element.dataset;
    const m = machines.find(x => x.id == id);

    if(action === "open-controller"){
        openChannelController(m);
        return;
    }

    if(action === "toggle"){
        const switchElement = element.querySelector('.power-switch');
        switchElement.style.transform = 'scale(0.9)';
        setTimeout(() => {
            switchElement.style.transform = '';
        }, 200);
        
        m.isOn = !m.isOn;
        m.modalIsOn = m.isOn;
        m.efficiency = m.isOn ? 85 + Math.floor(Math.random() * 15) : 0;
        renderMachines();
    }

    if(action === "reset"){
        e.target.style.transform = 'scale(0.9)';
        setTimeout(() => {
            e.target.style.transform = 'scale(1)';
        }, 150);
        
        m.value = "0000";
        m.efficiency = m.isOn ? 85 + Math.floor(Math.random() * 15) : 0;
        renderMachines();
    }

    if(action === "set"){
        currentMachine = m;
        document.getElementById("modalMachineLabel").innerHTML = 
            `<span style="color:#00ccff">${m.name}</span> | CURRENT: <span style="color:#ffaa00">${formatValue(m.value)}</span>`;
        document.getElementById("modalInput").value = "";
        document.getElementById("settingsModal").style.display = "flex";
        document.getElementById("modalInput").focus();
    }
});

/* CHANNEL CONTROLLER MODAL CONTROLS */
document.getElementById("closeController").onclick = closeChannelController;

document.getElementById("controller-set-button").onclick = () => {
    if (!channelModalMachine) return;
    
    // In a real application, this would open a modal or send a command
    const currentVal = parseInt(channelModalMachine.setValue);
    const newVal = currentVal + Math.floor(Math.random() * 100) - 50;
    channelModalMachine.setValue = Math.max(1000, Math.min(9999, newVal));
    
    document.getElementById("controller-set-value").textContent = channelModalMachine.setValue;
    
    // Update the actual value in the machine (hex conversion)
    const hexVal = Math.min(65535, Math.max(0, channelModalMachine.setValue)).toString(16).toUpperCase().padStart(4, '0');
    channelModalMachine.value = hexVal;
    
    // Also update efficiency based on set value
    const numericValue = parseInt(hexVal, 16);
    channelModalMachine.efficiency = Math.min(99, Math.max(85, 85 + Math.floor((numericValue / 65535) * 15)));
    document.getElementById("controller-efficiency-value").textContent = channelModalMachine.efficiency + '%';
    
    renderMachines();
};

document.getElementById("controller-power-toggle").addEventListener('change', function() {
    if (!channelModalMachine) return;
    
    channelModalMachine.modalIsOn = this.checked;
    channelModalMachine.isOn = this.checked;
    
    if (this.checked) {
        // Start counting up
        startModalCounter();
    } else {
        // Stop counting
        if (channelCounterInterval) {
            clearInterval(channelCounterInterval);
            channelCounterInterval = null;
        }
    }
    
    // Update main view
    renderMachines();
});

document.getElementById("controller-reset-button").onclick = () => {
    if (!channelModalMachine) return;
    
    // Reset machine values
    channelModalMachine.value = "0000";
    channelModalMachine.setValue = Math.floor(Math.random() * 9000) + 1000;
    channelModalMachine.count = Math.floor(Math.random() * 5000) + 1000;
    channelModalMachine.modalCount = channelModalMachine.count;
    channelModalMachine.efficiency = 85 + Math.floor(Math.random() * 15);
    
    // Turn power off
    channelModalMachine.modalIsOn = false;
    channelModalMachine.isOn = false;
    
    // Update modal display
    document.getElementById("controller-set-value").textContent = channelModalMachine.setValue;
    document.getElementById("controller-count-value").textContent = channelModalMachine.count;
    document.getElementById("controller-efficiency-value").textContent = `${channelModalMachine.efficiency}%`;
    document.getElementById("controller-power-toggle").checked = false;
    
    // Stop counter
    if (channelCounterInterval) {
        clearInterval(channelCounterInterval);
        channelCounterInterval = null;
    }
    
    // Update main view
    renderMachines();
};

/* SETTINGS MODAL */
document.getElementById("modalSave").onclick = () => {
    const v = document.getElementById("modalInput").value.toUpperCase();
    if(/^[0-9A-F]{1,4}$/.test(v)){
        currentMachine.value = v.padStart(4, "0");
        const numericValue = hexToDec(v);
        currentMachine.efficiency = Math.min(99, Math.max(85, 85 + Math.floor((numericValue / 65535) * 15)));
        
        document.getElementById("settingsModal").style.display = "none";
        renderMachines();
    } else {
        alert("INVALID! Enter 1-4 HEX characters (0-9, A-F)");
        document.getElementById("modalInput").focus();
    }
};

document.getElementById("modalCancel").onclick = () => {
    document.getElementById("settingsModal").style.display = "none";
};

// Modal keyboard controls
document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') {
        if (document.getElementById("settingsModal").style.display === 'flex') {
            document.getElementById("settingsModal").style.display = "none";
        }
        if (document.getElementById("channelControllerModal").style.display === 'flex') {
            closeChannelController();
        }
    }
});

document.getElementById("modalInput").addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
        document.getElementById("modalSave").click();
    }
});

// Auto update values
setInterval(() => {
    machines.forEach(m => {
        if(m.isOn) {
            m.efficiency = Math.min(99, Math.max(85, m.efficiency + (Math.random() * 4 - 2)));
        }
    });
    renderMachines();
}, 3000);

/* INITIALIZATION */
setInterval(updateDateTime, 1000);
renderMachines();
updateDateTime();

// Initialize with some active machines
setTimeout(() => {
    machines.forEach(m => {
        if(Math.random() > 0.5) {
            m.isOn = true;
            m.modalIsOn = true;
            m.value = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
            m.efficiency = 85 + Math.floor(Math.random() * 15);
        }
    });
    renderMachines();
}, 500);
const TOTAL_MACHINES = 20;
let currentMachine = null;
let totalCount = 810234;
let efficiency = 92;
let channelModalMachine = null;
let channelCounterInterval = null;
let currentSetChannel = null;

// Initialize 20 machines
const machines = Array.from({length: TOTAL_MACHINES}, (_, i) => ({
    id: i + 1,
    name: `CH${String(i + 1).padStart(2,'0')}`,
    isOn: false,
    value: "0000",
    efficiency: 85 + Math.floor(Math.random() * 15),
    count: Math.floor(Math.random() * 5000) + 1000,
    setValue: Math.floor(Math.random() * 9000) + 1000,
    modalIsOn: false,
    modalCount: 0,
    channelValue: Math.floor(Math.random() * 9000) + 1000,
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
        const machineEfficiency = m.efficiency;
        
        // Update count if machine is on
        if (m.isOn) {
            m.currentCount += Math.floor(Math.random() * 10) + 1;
        }
        
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

            <div class="power-switch-container" data-id="${m.id}" data-action="toggle">
                <div class="power-switch ${m.isOn ? 'active' : ''}">
                    ${m.isOn ? powerOnSVG : powerOffSVG}
                </div>
            </div>

            <div class="machine-values-section">
                <div class="values-row">
                    <div class="value-item">
                        <div class="value-item-label">SET VALUE</div>
                        <div class="value-item-value">${m.setValue.toString().padStart(4, '0')}</div>
                    </div>
                    <div class="value-item">
                        <div class="value-item-label">COUNT</div>
                        <div class="value-item-value">${m.currentCount}</div>
                    </div>
                </div>
                
                <div class="efficiency-display">
                    <div class="efficiency-label">EFFICIENCY</div>
                    <div class="efficiency-value">${machineEfficiency}%</div>
                </div>
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
    
    // Update efficiency and count
    updateEfficiency();
    updateTotalCount();
}

/* OPEN CHANNEL CONTROLLER MODAL */
function openChannelController(machine) {
    channelModalMachine = machine;
    
    // Update modal with machine data
    document.getElementById("controllerTitle").textContent = `${machine.name} CONTROLLER`;
    document.getElementById("controllerSubtitle").textContent = `Control and monitor ${machine.name} channel`;
    document.getElementById("controllerChannelLabel").textContent = machine.name;
    document.getElementById("controller-channel").textContent = machine.name.replace("CH", "");
    document.getElementById("controller-set-value").textContent = machine.channelValue.toString().padStart(4, '0');
    document.getElementById("controller-count-value").textContent = machine.currentCount;
    document.getElementById("controller-efficiency-value").textContent = `${machine.efficiency}%`;
    
    // Set power toggle state
    const toggleSwitch = document.getElementById("controller-power-toggle");
    if (machine.modalIsOn || machine.isOn) {
        toggleSwitch.classList.add("active");
    } else {
        toggleSwitch.classList.remove("active");
    }
    
    // Start counter if modal is on
    if (machine.modalIsOn || machine.isOn) {
        startModalCounter();
    }
    
    // Show modal
    document.getElementById("channelControllerModal").style.display = "flex";
    document.body.style.overflow = 'hidden';
}

/* START COUNTER FOR MODAL */
function startModalCounter() {
    if (channelCounterInterval) clearInterval(channelCounterInterval);
    
    channelCounterInterval = setInterval(() => {
        if (channelModalMachine && (channelModalMachine.modalIsOn || channelModalMachine.isOn)) {
            // Update count
            channelModalMachine.currentCount += Math.floor(Math.random() * 5) + 1;
            channelModalMachine.count = channelModalMachine.currentCount;
            
            // Update modal display
            const countElement = document.getElementById("controller-count-value");
            if (countElement) {
                countElement.textContent = channelModalMachine.currentCount;
            }
            
            // Update efficiency based on count (for demo)
            const efficiency = 90 + (channelModalMachine.currentCount % 10);
            channelModalMachine.efficiency = efficiency;
            
            const efficiencyElement = document.getElementById("controller-efficiency-value");
            if (efficiencyElement) {
                efficiencyElement.textContent = efficiency + '%';
            }
            
            // Also update the machine card efficiency
            const card = document.querySelector(`.machine-card[data-id="${channelModalMachine.id}"] .efficiency-value`);
            if (card) {
                card.textContent = `${efficiency}%`;
            }
            
            // Update count in the machine card
            const countCard = document.querySelector(`.machine-card[data-id="${channelModalMachine.id}"] .value-item-value:last-child`);
            if (countCard) {
                countCard.textContent = channelModalMachine.currentCount;
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
    document.body.style.overflow = 'hidden'; // Keep hidden for no scroll
}

/* OPEN CHANNEL SET MODAL */
function openChannelSetModal(channel) {
    currentSetChannel = channel;
    
    document.getElementById("channelSetLabel").innerHTML = 
        `<span style="color:#00ccff">${channel.name}</span> | CURRENT: <span style="color:#ffaa00">${channel.channelValue.toString().padStart(4, '0')}</span>`;
    document.getElementById("channelSetInput").value = channel.channelValue;
    document.getElementById("channelSetModal").style.display = "flex";
    document.body.style.overflow = 'hidden';
    document.getElementById("channelSetInput").focus();
    document.getElementById("channelSetInput").select();
}

/* GLOBAL CONTROLS */
document.getElementById("globalStart").addEventListener('click', () => {
    machines.forEach(m => {
        m.isOn = true;
        m.modalIsOn = true;
        m.efficiency = 85 + Math.floor(Math.random() * 15);
    });
    renderMachines();
});

document.getElementById("globalStop").addEventListener('click', () => {
    machines.forEach(m => {
        m.isOn = false;
        m.modalIsOn = false;
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
        m.channelValue = Math.floor(Math.random() * 9000) + 1000;
        m.modalCount = 0;
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
        document.body.style.overflow = 'hidden';
        document.getElementById("modalInput").focus();
    }
});

/* CHANNEL CONTROLLER MODAL CONTROLS */
document.getElementById("closeController").addEventListener('click', closeChannelController);

// Power toggle for modal
document.getElementById("controller-power-toggle").addEventListener('click', () => {
    if (!channelModalMachine) return;
    
    const toggleSwitch = document.getElementById("controller-power-toggle");
    const isOn = toggleSwitch.classList.contains("active");
    
    if (isOn) {
        // Turn OFF
        toggleSwitch.classList.remove("active");
        channelModalMachine.modalIsOn = false;
        channelModalMachine.isOn = false;
        
        // Stop counter
        if (channelCounterInterval) {
            clearInterval(channelCounterInterval);
            channelCounterInterval = null;
        }
    } else {
        // Turn ON
        toggleSwitch.classList.add("active");
        channelModalMachine.modalIsOn = true;
        channelModalMachine.isOn = true;
        channelModalMachine.efficiency = 85 + Math.floor(Math.random() * 15);
        
        // Start counter
        startModalCounter();
    }
    
    // Update main view
    renderMachines();
});

// SET button in channel controller
document.getElementById("controller-set-button").addEventListener('click', () => {
    if (!channelModalMachine) return;
    
    openChannelSetModal(channelModalMachine);
});

// RESET button in channel controller
document.getElementById("controller-reset-button").addEventListener('click', () => {
    if (!channelModalMachine) return;
    
    // Reset channel value to 0
    channelModalMachine.channelValue = 0;
    channelModalMachine.currentCount = 0;
    
    // Update modal display
    document.getElementById("controller-set-value").textContent = "0000";
    document.getElementById("controller-count-value").textContent = "0";
    
    // Also reset efficiency
    channelModalMachine.efficiency = 85 + Math.floor(Math.random() * 15);
    document.getElementById("controller-efficiency-value").textContent = `${channelModalMachine.efficiency}%`;
    
    // Update main view
    renderMachines();
});

/* CHANNEL SET MODAL CONTROLS */
document.getElementById("channelSetSave").addEventListener('click', () => {
    if (!currentSetChannel) return;
    
    const v = document.getElementById("channelSetInput").value;
    if(v === "" || isNaN(v)) {
        alert("Please enter a valid number (0-9999)");
        document.getElementById("channelSetInput").focus();
        return;
    }
    
    const numValue = parseInt(v);
    if(numValue < 0 || numValue > 9999) {
        alert("Please enter a number between 0 and 9999");
        document.getElementById("channelSetInput").focus();
        return;
    }
    
    currentSetChannel.channelValue = numValue;
    currentSetChannel.setValue = numValue;
    
    // Update channel controller display
    document.getElementById("controller-set-value").textContent = numValue.toString().padStart(4, '0');
    
    // Close modal
    document.getElementById("channelSetModal").style.display = "none";
    currentSetChannel = null;
    document.body.style.overflow = 'hidden';
    
    // Update main view
    renderMachines();
});

document.getElementById("channelSetCancel").addEventListener('click', () => {
    document.getElementById("channelSetModal").style.display = "none";
    currentSetChannel = null;
    document.body.style.overflow = 'hidden';
});

/* SETTINGS MODAL */
document.getElementById("modalSave").addEventListener('click', () => {
    const v = document.getElementById("modalInput").value.toUpperCase();
    if(/^[0-9A-F]{1,4}$/.test(v)){
        currentMachine.value = v.padStart(4, "0");
        const numericValue = hexToDec(v);
        currentMachine.efficiency = Math.min(99, Math.max(85, 85 + Math.floor((numericValue / 65535) * 15)));
        
        document.getElementById("settingsModal").style.display = "none";
        document.body.style.overflow = 'hidden';
        renderMachines();
    } else {
        alert("INVALID! Enter 1-4 HEX characters (0-9, A-F)");
        document.getElementById("modalInput").focus();
    }
});

document.getElementById("modalCancel").addEventListener('click', () => {
    document.getElementById("settingsModal").style.display = "none";
    document.body.style.overflow = 'hidden';
});

// Modal keyboard controls
document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') {
        if (document.getElementById("settingsModal").style.display === 'flex') {
            document.getElementById("settingsModal").style.display = "none";
            document.body.style.overflow = 'hidden';
        }
        if (document.getElementById("channelControllerModal").style.display === 'flex') {
            closeChannelController();
        }
        if (document.getElementById("channelSetModal").style.display === 'flex') {
            document.getElementById("channelSetModal").style.display = "none";
            currentSetChannel = null;
            document.body.style.overflow = 'hidden';
        }
    }
});

document.getElementById("modalInput").addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
        document.getElementById("modalSave").click();
    }
});

document.getElementById("channelSetInput").addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
        document.getElementById("channelSetSave").click();
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
// Set initial values based on the image
function initializeMachines() {
    // Set machines ON/OFF based on image data
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
        m.modalIsOn = m.isOn;
        if (m.isOn) {
            m.value = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
            m.efficiency = 85 + Math.floor(Math.random() * 15);
            m.channelValue = Math.floor(Math.random() * 9000) + 1000;
            m.setValue = Math.floor(Math.random() * 9000) + 1000;
            m.currentCount = Math.floor(Math.random() * 9999);
        }
    });
    
    // Set initial efficiency and count
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
// Configuration
const TOTAL_MACHINES = 16;
const MACHINES_PER_PAGE = 8;
const TOTAL_PAGES = Math.ceil(TOTAL_MACHINES / MACHINES_PER_PAGE);

// Initialize machines data
const machines = Array(TOTAL_MACHINES).fill().map((_, i) => ({
    id: i + 1,
    name: `CH${String(i + 1).padStart(2, '0')}`,
    isOn: false,
    value: "880F",
    isRunning: false,
    page: Math.floor(i / MACHINES_PER_PAGE) + 1
}));

// State variables
let currentPage = 1;
let currentEditingMachine = null;

// DOM Elements
const page1 = document.getElementById('page1');
const page2 = document.getElementById('page2');
const machinesGrid1 = document.getElementById('machinesGrid1');
const machinesGrid2 = document.getElementById('machinesGrid2');
const currentPageSpan = document.getElementById('currentPage');
const totalPagesSpan = document.getElementById('totalPages');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const globalStatus = document.getElementById('globalStatus');
const datetimeElement = document.getElementById('datetime');
const settingsModal = document.getElementById('settingsModal');
const modalInput = document.getElementById('modalInput');
const modalSave = document.getElementById('modalSave');
const modalCancel = document.getElementById('modalCancel');
const modalMachineLabel = document.getElementById('modalMachineLabel');
const globalStart = document.getElementById('globalStart');
const globalStop = document.getElementById('globalStop');
const globalReset = document.getElementById('globalReset');

// Utility functions
function updateDateTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    datetimeElement.textContent = `${dateStr} • ${timeStr}`;
}

function formatDisplayValue(value) {
    return value.split('').join(' ');
}

function updateGlobalStatus() {
    const activeMachines = machines.filter(m => m.isOn).length;
    const runningMachines = machines.filter(m => m.isRunning).length;
    globalStatus.textContent = `${activeMachines} ACTIVE • ${runningMachines} RUNNING • ${TOTAL_MACHINES} TOTAL`;
}

function updatePaginationButtons() {
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === TOTAL_PAGES;
    currentPageSpan.textContent = `PAGE ${currentPage}`;
    totalPagesSpan.textContent = TOTAL_PAGES;
}

function switchPage(pageNumber) {
    if (pageNumber < 1 || pageNumber > TOTAL_PAGES) return;
    
    currentPage = pageNumber;
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.classList.add('hidden');
    });
    
    // Show current page
    const currentPageElement = document.getElementById(`page${currentPage}`);
    if (currentPageElement) {
        currentPageElement.classList.remove('hidden');
        currentPageElement.classList.add('active');
    }
    
    updatePaginationButtons();
}

function createMachineCard(machine) {
    return `
        <div class="machine-card" data-machine-id="${machine.id}">
            <div class="machine-header">
                <div class="machine-id">${machine.name}</div>
                <div class="machine-status ${machine.isOn ? 'status-active' : 'status-inactive'}">
                    ${machine.isOn ? 'ON' : 'OFF'}
                </div>
            </div>
            
            <div class="power-container">
                <button class="power-switch ${machine.isOn ? 'on' : 'off'}" 
                        data-action="toggle-power" 
                        data-machine="${machine.id}">
                    ${machine.isOn ? 'ON' : 'OFF'}
                </button>
            </div>
            
            <div class="value-display" id="display${machine.id}">
                ${formatDisplayValue(machine.value)}
            </div>
            
            <div class="machine-controls">
                <button class="control-btn set" 
                        data-action="set-value" 
                        data-machine="${machine.id}">
                    SET
                </button>
                <button class="control-btn reset" 
                        data-action="reset" 
                        data-machine="${machine.id}">
                    RESET
                </button>
            </div>
        </div>
    `;
}

function renderMachines() {
    // Clear grids
    machinesGrid1.innerHTML = '';
    machinesGrid2.innerHTML = '';
    
    // Render machines to their respective pages
    machines.forEach(machine => {
        const cardHTML = createMachineCard(machine);
        if (machine.page === 1) {
            machinesGrid1.innerHTML += cardHTML;
        } else {
            machinesGrid2.innerHTML += cardHTML;
        }
    });
    
    updateGlobalStatus();
}

function getMachineById(id) {
    return machines.find(m => m.id === id);
}

function toggleMachinePower(machineId) {
    const machine = getMachineById(machineId);
    if (!machine) return;
    
    machine.isOn = !machine.isOn;
    
    if (!machine.isOn) {
        machine.isRunning = false;
    }
    
    renderMachines();
}

function openSetModal(machineId) {
    const machine = getMachineById(machineId);
    if (!machine) return;
    
    if (!machine.isOn) {
        alert(`Please turn ON ${machine.name} first!`);
        return;
    }
    
    currentEditingMachine = machineId;
    modalMachineLabel.textContent = `Machine ${machine.name}`;
    modalInput.value = machine.value;
    settingsModal.style.display = 'flex';
    modalInput.focus();
    modalInput.select();
}

function resetMachine(machineId) {
    const machine = getMachineById(machineId);
    if (!machine || !machine.isOn) return;
    
    machine.value = "880F";
    renderMachines();
    
    // Visual feedback
    const display = document.getElementById(`display${machineId}`);
    if (display) {
        display.style.color = "#ff5555";
        setTimeout(() => {
            display.style.color = "#ffaa00";
        }, 300);
    }
}

function startMachineSimulation(machineId) {
    const machine = getMachineById(machineId);
    if (!machine || !machine.isOn) return;
    
    machine.isRunning = true;
    
    const simulate = () => {
        if (!machine.isRunning) return;
        
        // Generate random hex value
        const randomHex = Math.floor(Math.random() * 65535)
            .toString(16)
            .toUpperCase()
            .padStart(4, '0');
        
        machine.value = randomHex;
        const display = document.getElementById(`display${machineId}`);
        if (display) {
            display.textContent = formatDisplayValue(randomHex);
        }
        
        setTimeout(simulate, 2000);
    };
    
    simulate();
}

function stopMachineSimulation(machineId) {
    const machine = getMachineById(machineId);
    if (machine) {
        machine.isRunning = false;
    }
}

function setupMachineEventDelegation(gridElement) {
    if (!gridElement) return;
    
    gridElement.addEventListener('click', (e) => {
        const machineId = parseInt(e.target.dataset.machine);
        const action = e.target.dataset.action;
        
        if (!machineId || !action) return;
        
        switch(action) {
            case 'toggle-power':
                toggleMachinePower(machineId);
                break;
                
            case 'set-value':
                openSetModal(machineId);
                break;
                
            case 'reset':
                resetMachine(machineId);
                break;
        }
    });
}

// Event Listeners
modalSave.addEventListener('click', () => {
    const newValue = modalInput.value.toUpperCase();
    
    if (/^[0-9A-F]{4}$/.test(newValue) && currentEditingMachine) {
        const machine = getMachineById(currentEditingMachine);
        if (machine) {
            machine.value = newValue;
            renderMachines();
        }
        settingsModal.style.display = 'none';
        currentEditingMachine = null;
    } else {
        alert("Please enter 4 hexadecimal digits (0-9, A-F)");
    }
});

modalCancel.addEventListener('click', () => {
    settingsModal.style.display = 'none';
    currentEditingMachine = null;
});

globalStart.addEventListener('click', () => {
    machines.forEach(machine => {
        if (machine.isOn && !machine.isRunning) {
            startMachineSimulation(machine.id);
        }
    });
    alert(`Started all active machines!`);
});

globalStop.addEventListener('click', () => {
    machines.forEach(machine => {
        stopMachineSimulation(machine.id);
    });
    alert(`Stopped all machines!`);
});

globalReset.addEventListener('click', () => {
    if (confirm("Reset ALL machines to default values?")) {
        machines.forEach(machine => {
            machine.value = "880F";
            machine.isRunning = false;
        });
        renderMachines();
        alert("All machines reset to default!");
    }
});

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        switchPage(currentPage - 1);
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < TOTAL_PAGES) {
        switchPage(currentPage + 1);
    }
});

// Initialize application
function init() {
    renderMachines();
    updateDateTime();
    updatePaginationButtons();
    
    // Setup event delegation for both grids
    setupMachineEventDelegation(machinesGrid1);
    setupMachineEventDelegation(machinesGrid2);
    
    // Auto-start some machines for demo
    setTimeout(() => {
        // Turn on first 4 machines
        [0, 1, 2, 3].forEach(i => {
            machines[i].isOn = true;
        });
        renderMachines();
    }, 500);
    
    // Update datetime every second
    setInterval(updateDateTime, 1000);
}

// Start the application
document.addEventListener('DOMContentLoaded', init);
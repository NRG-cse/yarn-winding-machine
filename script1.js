const TOTAL_MACHINES = 16;
const MACHINES_PER_PAGE = 8;
const TOTAL_PAGES = 2;

let currentPage = 1;
let currentMachine = null;

const machines = Array.from({length: TOTAL_MACHINES}, (_, i) => ({
    id: i + 1,
    name: `CH${String(i + 1).padStart(2,'0')}`,
    isOn: false,
    value: "0000",
    page: Math.floor(i / MACHINES_PER_PAGE) + 1
}));

const grid1 = document.getElementById("machinesGrid1");
const grid2 = document.getElementById("machinesGrid2");

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
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById("datetime").innerText = now.toLocaleDateString('en-US', options);
}

function hexToDec(hexValue) {
    // Convert hex value to decimal for gauge calculation
    const dec = parseInt(hexValue, 16);
    return isNaN(dec) ? 0 : dec;
}

function calculateGaugeHeight(hexValue) {
    const maxValue = 65535; // FFFF in decimal
    const value = hexToDec(hexValue);
    return (value / maxValue) * 100;
}

function formatValue(v){
    // Display as spaced characters
    return v.split("").join(" ");
}

function renderMachines(){
    grid1.innerHTML = "";
    grid2.innerHTML = "";

    machines.forEach(m => {
        const gaugeHeight = calculateGaugeHeight(m.value);
        const html = `
        <div class="machine-card ${m.isOn ? 'active' : ''}" data-id="${m.id}">
            <div class="machine-header">
                <div class="machine-id">${m.name}</div>
                <div class="status-container">
                    <div class="status-indicator ${m.isOn ? 'active' : ''}"></div>
                    <div class="machine-status ${m.isOn ? 'status-active' : 'status-inactive'}">
                        ${m.isOn ? 'ACTIVE' : 'STANDBY'}
                    </div>
                </div>
            </div>

            <div class="power-switch-container" data-id="${m.id}" data-action="toggle">
                <div class="power-switch ${m.isOn ? 'active' : ''}">
                    <div class="power-switch-base"></div>
                    <div class="power-switch-knob">
                        ${m.isOn ? powerOnSVG : powerOffSVG}
                    </div>
                </div>
            </div>

            <div class="value-display-container">
                <div class="gauge-fill" style="height: ${gaugeHeight}%"></div>
                <div class="value-display">${formatValue(m.value)}</div>
            </div>

            <div class="machine-controls">
                <button class="control-btn set" data-id="${m.id}" data-action="set">SET VALUE</button>
                <button class="control-btn reset" data-id="${m.id}" data-action="reset">RESET</button>
            </div>
        </div>`;

        (m.page === 1 ? grid1 : grid2).innerHTML += html;
    });

    // Update global status
    const activeCount = machines.filter(m => m.isOn).length;
    document.getElementById("globalStatus").innerHTML = 
        `<span style="color:#00ffaa">${activeCount} ACTIVE</span> / 
         <span style="color:#ffaa00">${TOTAL_MACHINES - activeCount} STANDBY</span> / 
         <span style="color:#00a8ff">${TOTAL_MACHINES} TOTAL</span>`;
}

function showPage(page){
    currentPage = page;
    document.getElementById("page1").classList.toggle("hidden", page !== 1);
    document.getElementById("page2").classList.toggle("hidden", page !== 2);
    document.getElementById("currentPage").innerText = `PAGE ${page}`;
    
    // Add page transition animation
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => {
        p.style.opacity = '0';
        p.style.transform = 'translateY(20px)';
        setTimeout(() => {
            p.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            p.style.opacity = '1';
            p.style.transform = 'translateY(0)';
        }, 50);
    });
}

/* PAGINATION */
document.getElementById("nextPageBtn").onclick = () => {
    if (currentPage < TOTAL_PAGES) {
        showPage(currentPage + 1);
    }
};

document.getElementById("prevPageBtn").onclick = () => {
    if (currentPage > 1) {
        showPage(currentPage - 1);
    }
};

/* GLOBAL CONTROLS */
document.getElementById("globalStart").onclick = () => {
    // Add animation effect
    document.getElementById("globalStart").classList.add('clicked');
    setTimeout(() => {
        document.getElementById("globalStart").classList.remove('clicked');
    }, 300);
    
    machines.forEach(m => m.isOn = true);
    renderMachines();
};

document.getElementById("globalStop").onclick = () => {
    // Add animation effect
    document.getElementById("globalStop").classList.add('clicked');
    setTimeout(() => {
        document.getElementById("globalStop").classList.remove('clicked');
    }, 300);
    
    machines.forEach(m => m.isOn = false);
    renderMachines();
};

document.getElementById("globalReset").onclick = () => {
    // Add animation effect
    document.getElementById("globalReset").classList.add('clicked');
    setTimeout(() => {
        document.getElementById("globalReset").classList.remove('clicked');
    }, 300);
    
    machines.forEach(m => m.value = "0000");
    renderMachines();
};

/* MACHINE ACTIONS */
document.addEventListener("click", e => {
    const {id, action} = e.target.closest('[data-id]')?.dataset || {};
    if(!id) return;

    const m = machines.find(x => x.id == id);

    if(action === "toggle"){
        // Add click animation
        const switchElement = e.target.closest('.power-switch-container');
        switchElement.style.transform = 'scale(0.9)';
        setTimeout(() => {
            switchElement.style.transform = 'scale(1)';
        }, 200);
        
        m.isOn = !m.isOn;
        renderMachines();
    }

    if(action === "reset"){
        // Add button click animation
        e.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            e.target.style.transform = 'scale(1)';
        }, 150);
        
        m.value = "0000";
        renderMachines();
    }

    if(action === "set"){
        currentMachine = m;
        document.getElementById("modalMachineLabel").innerText = `${m.name} - Current: ${formatValue(m.value)}`;
        document.getElementById("modalInput").value = "";
        document.getElementById("settingsModal").style.display = "flex";
        document.getElementById("modalInput").focus();
    }
});

/* MODAL */
document.getElementById("modalSave").onclick = () => {
    const v = document.getElementById("modalInput").value.toUpperCase();
    if(/^[0-9A-F]{1,4}$/.test(v)){
        currentMachine.value = v.padStart(4, "0");
        document.getElementById("settingsModal").style.display = "none";
        renderMachines();
        
        // Show success animation
        const machineCard = document.querySelector(`.machine-card[data-id="${currentMachine.id}"]`);
        if(machineCard) {
            machineCard.style.boxShadow = '0 0 30px rgba(0, 255, 170, 0.5)';
            setTimeout(() => {
                machineCard.style.boxShadow = '';
            }, 1000);
        }
    } else {
        alert("Please enter 1-4 hex characters (0-9, A-F)");
    }
};

document.getElementById("modalCancel").onclick = () => {
    document.getElementById("settingsModal").style.display = "none";
};

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && document.getElementById("settingsModal").style.display === 'flex') {
        document.getElementById("settingsModal").style.display = "none";
    }
});

// Enter key in modal input
document.getElementById("modalInput").addEventListener('keypress', (e) => {
    if(e.key === 'Enter') {
        document.getElementById("modalSave").click();
    }
});

/* INITIALIZATION */
setInterval(updateDateTime, 1000);
renderMachines();
showPage(1);
updateDateTime();

// Add some sample data for demo
setTimeout(() => {
    // Randomly activate some machines
    machines.forEach(m => {
        if(Math.random() > 0.5) {
            m.isOn = true;
            m.value = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
        }
    });
    renderMachines();
}, 500);
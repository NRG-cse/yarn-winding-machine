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

function updateDateTime(){
    document.getElementById("datetime").innerText =
        new Date().toLocaleString();
}

function formatValue(v){
    return v.split("").join(" ");
}

function renderMachines(){
    grid1.innerHTML = "";
    grid2.innerHTML = "";

    machines.forEach(m=>{
        const html = `
        <div class="machine-card">
            <div class="machine-header">
                <div class="machine-id">${m.name}</div>
                <div class="machine-status ${m.isOn?'status-active':'status-inactive'}">
                    ${m.isOn?'ON':'OFF'}
                </div>
            </div>

            <img class="power-switch-img"
                 src="${m.isOn?'switch_on.png':'switch_off.png'}"
                 data-id="${m.id}" data-action="toggle">

            <div class="value-display">${formatValue(m.value)}</div>

            <div class="machine-controls">
                <button class="control-btn set" data-id="${m.id}" data-action="set">SET</button>
                <button class="control-btn reset" data-id="${m.id}" data-action="reset">RESET</button>
            </div>
        </div>`;

        (m.page === 1 ? grid1 : grid2).innerHTML += html;
    });

    document.getElementById("globalStatus").innerText =
        `${machines.filter(m=>m.isOn).length} ACTIVE / ${TOTAL_MACHINES} TOTAL`;
}

function showPage(page){
    currentPage = page;
    document.getElementById("page1").classList.toggle("hidden", page !== 1);
    document.getElementById("page2").classList.toggle("hidden", page !== 2);
    document.getElementById("currentPage").innerText = `PAGE ${page}`;
}

/* PAGINATION */
nextPageBtn.onclick = ()=> currentPage < TOTAL_PAGES && showPage(currentPage+1);
prevPageBtn.onclick = ()=> currentPage > 1 && showPage(currentPage-1);

/* GLOBAL */
globalStart.onclick = ()=>{
    machines.forEach(m=>m.isOn=true);
    renderMachines();
};

globalStop.onclick = ()=>{
    machines.forEach(m=>m.isOn=false);
    renderMachines();
};

globalReset.onclick = ()=>{
    machines.forEach(m=>m.value="0000");
    renderMachines();
};

/* MACHINE ACTIONS */
document.addEventListener("click",e=>{
    const {id, action} = e.target.dataset;
    if(!id) return;

    const m = machines.find(x=>x.id==id);

    if(action==="toggle"){
        m.isOn = !m.isOn;
        renderMachines();
    }

    if(action==="reset"){
        m.value = "0000";
        renderMachines();
    }

    if(action==="set"){
        currentMachine = m;
        modalMachineLabel.innerText = m.name;
        modalInput.value = "";
        settingsModal.style.display = "flex";
        modalInput.focus();
    }
});

/* MODAL */
modalSave.onclick = ()=>{
    const v = modalInput.value.toUpperCase();
    if(/^[0-9A-F]{1,4}$/.test(v)){
        currentMachine.value = v.padStart(4,"0");
        settingsModal.style.display = "none";
        renderMachines();
    }
};

modalCancel.onclick = ()=>{
    settingsModal.style.display = "none";
};

/* INIT */
setInterval(updateDateTime,1000);
renderMachines();
showPage(1);
updateDateTime();

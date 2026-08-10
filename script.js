/**
 * Cranial Index & Cranial Vault Asymmetry Index Calculator Pro - Dual-Tab Logic Engine
 * Supervising Developer: Dr G Narenthiran MB Ch FEBNS FRCS(SN), g_narnethiran@hotmail.com
 * Copyright (c) 2026 Dr G Narenthiran. All rights reserved.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let ciTimePoints = [];
    let cvaiTimePoints = [];
    let activeTab = 'tab-ci';

    let ciChartInstance = null;
    let cvaiChartInstance = null;

    // DOM Elements - Patient Demographics & Controls
    const patientIdInput = document.getElementById('patient-id');
    const patientNameInput = document.getElementById('patient-name');
    const scanModalityInput = document.getElementById('scan-modality');
    const unitSelect = document.getElementById('unit-select');

    // CVAI Denominator Selector
    const cvaiDenominatorSelect = document.getElementById('cvai-denominator');
    const cvaiFormulaDisplay = document.getElementById('cvai-formula-display');

    // DOM Elements - Buttons
    const btnAddCiRow = document.getElementById('btn-add-ci-row');
    const btnAddCvaiRow = document.getElementById('btn-add-cvai-row');
    const btnReset = document.getElementById('btn-reset-all');
    const btnSample = document.getElementById('btn-sample-case');
    const btnPrint = document.getElementById('btn-print-report');

    // DOM Elements - Table Bodies & Badges
    const ciTableBody = document.getElementById('ci-table-body');
    const cvaiTableBody = document.getElementById('cvai-table-body');
    const ciRowsCount = document.getElementById('ci-rows-count');
    const cvaiRowsCount = document.getElementById('cvai-rows-count');

    // KPI Cards - CI
    const ciKpiCount = document.getElementById('ci-kpi-count');
    const ciKpiBaseline = document.getElementById('ci-kpi-baseline');
    const ciKpiLatest = document.getElementById('ci-kpi-latest');
    const ciKpiDelta = document.getElementById('ci-kpi-delta');

    // KPI Cards - CVAI
    const cvaiKpiCount = document.getElementById('cvai-kpi-count');
    const cvaiKpiBaseline = document.getElementById('cvai-kpi-baseline');
    const cvaiKpiLatest = document.getElementById('cvai-kpi-latest');
    const cvaiKpiDelta = document.getElementById('cvai-kpi-delta');

    // Chart Containers - CI
    const ciChartPlaceholder = document.getElementById('ci-chart-placeholder');
    const ciChartContainer = document.getElementById('ci-chart-container');
    const ciChartCanvas = document.getElementById('ciChart');

    // Chart Containers - CVAI
    const cvaiChartPlaceholder = document.getElementById('cvai-chart-placeholder');
    const cvaiChartContainer = document.getElementById('cvai-chart-container');
    const cvaiChartCanvas = document.getElementById('cvaiChart');

    // Counter Elements
    const counterViewsEl = document.getElementById('counter-views');
    const counterCalcsEl = document.getElementById('counter-calcs');

    // --- INITIALIZATION ---
    initCounters();
    initTabs();
    initApp();

    // --- GLOBAL COUNTER ENGINE (CounterAPI v2) ---
    async function initCounters() {
        if (counterViewsEl) counterViewsEl.textContent = '...';
        if (counterCalcsEl) counterCalcsEl.textContent = '...';

        fetchGlobalCounter('cranial_views', 'up').then(viewsCount => {
            if (viewsCount !== null && counterViewsEl) {
                counterViewsEl.textContent = viewsCount.toLocaleString();
            } else {
                let localViews = parseInt(localStorage.getItem('cranial_app_views') || '0', 10) + 1;
                localStorage.setItem('cranial_app_views', localViews.toString());
                if (counterViewsEl) counterViewsEl.textContent = localViews.toLocaleString();
            }
        });

        fetchGlobalCounter('cranial_calcs', 'get').then(calcsCount => {
            if (calcsCount !== null && counterCalcsEl) {
                counterCalcsEl.textContent = calcsCount.toLocaleString();
            } else {
                let localCalcs = parseInt(localStorage.getItem('cranial_app_calcs') || '0', 10);
                if (counterCalcsEl) counterCalcsEl.textContent = localCalcs.toLocaleString();
            }
        });
    }

    async function incrementCalcCounter() {
        fetchGlobalCounter('cranial_calcs', 'up').then(calcsCount => {
            if (calcsCount !== null && counterCalcsEl) {
                counterCalcsEl.textContent = calcsCount.toLocaleString();
            } else {
                let localCalcs = parseInt(localStorage.getItem('cranial_app_calcs') || '0', 10) + 1;
                localStorage.setItem('cranial_app_calcs', localCalcs.toString());
                if (counterCalcsEl) counterCalcsEl.textContent = localCalcs.toLocaleString();
            }
        });
    }

    async function fetchGlobalCounter(metricKey, action = 'up') {
        let endpoint = 'https://api.counterapi.dev/v2/test/test';
        if (metricKey === 'cranial_views' && action === 'up') {
            endpoint += '/up';
        } else if (metricKey === 'cranial_calcs' && action === 'up') {
            endpoint += '/down';
        }

        try {
            const url = `${endpoint}?_t=${Date.now()}`;
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) {
                const json = await res.json();
                if (json && json.data) {
                    const count = metricKey === 'cranial_views' ? json.data.up_count : json.data.down_count;
                    if (typeof count === 'number') return count;
                }
            }
        } catch (e) {}

        return null;
    }

    // --- TAB SWITCHING NAVIGATION ---
    function initTabs() {
        const tabBtns = document.querySelectorAll('.nav-tab');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTabId = btn.getAttribute('data-tab');
                activeTab = targetTabId;

                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
                document.getElementById(targetTabId).classList.add('active');

                if (activeTab === 'tab-ci' && ciChartInstance) ciChartInstance.resize();
                if (activeTab === 'tab-cvai' && cvaiChartInstance) cvaiChartInstance.resize();
            });
        });
    }

    // --- INITIALIZE APPLICATION DATA ---
    function initApp() {
        ciTableBody.innerHTML = '';
        cvaiTableBody.innerHTML = '';

        ciTimePoints = [];
        cvaiTimePoints = [];

        for (let i = 1; i <= 5; i++) {
            createCiRow();
            createCvaiRow();
        }

        setupEventListeners();
        updateCiUIAndAnalytics();
        updateCvaiUIAndAnalytics();
    }

    // ==========================================================================
    // 1. CRANIAL INDEX (CI) ROW GENERATION & ENGINE
    // ==========================================================================
    function createCiRow(dateVal = '', contextVal = '', bpdVal = '', ofdVal = '') {
        const rowId = `ci-row-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const rowObj = {
            id: rowId,
            number: ciTimePoints.length + 1,
            date: dateVal,
            context: contextVal,
            bpd: bpdVal !== '' ? parseFloat(bpdVal) : null,
            ofd: ofdVal !== '' ? parseFloat(ofdVal) : null,
            index: null,
            status: 'incomplete'
        };

        ciTimePoints.push(rowObj);

        const tr = document.createElement('tr');
        tr.id = rowId;
        tr.className = 'tp-row';

        tr.innerHTML = `
            <td class="col-tp">
                <span class="tp-label"><i class="fa-solid fa-head-side-virus"></i> Scan #${ciTimePoints.length}</span>
            </td>
            <td class="col-date">
                <input type="date" class="input-date" value="${dateVal}" aria-label="Scan Date">
            </td>
            <td class="col-context">
                <input type="text" class="input-context" value="${contextVal}" placeholder="e.g. Pre-op, 3m Post-Op" aria-label="Clinical Context">
            </td>
            <td class="col-measurement">
                <input type="number" class="input-bpd" step="0.1" min="0" placeholder="e.g. 102.0" value="${bpdVal}" aria-label="Biparietal Diameter BPD">
            </td>
            <td class="col-measurement">
                <input type="number" class="input-ofd" step="0.1" min="0" placeholder="e.g. 148.0" value="${ofdVal}" aria-label="Occipitofrontal Diameter OFD">
            </td>
            <td class="col-result">
                <span class="index-display">--</span>
            </td>
            <td class="col-status">
                <span class="badge badge-empty"><i class="fa-solid fa-minus"></i> Incomplete</span>
            </td>
            <td class="col-action">
                <button type="button" class="btn-icon-delete" title="Delete Time Point">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;

        ciTableBody.appendChild(tr);

        const dateInput = tr.querySelector('.input-date');
        const contextInput = tr.querySelector('.input-context');
        const bpdInput = tr.querySelector('.input-bpd');
        const ofdInput = tr.querySelector('.input-ofd');
        const btnDelete = tr.querySelector('.btn-icon-delete');

        [dateInput, contextInput, bpdInput, ofdInput].forEach(input => {
            input.addEventListener('input', () => handleCiRowUpdate(rowId));
            input.addEventListener('change', () => handleCiRowUpdate(rowId));
        });

        btnDelete.addEventListener('click', () => deleteCiRow(rowId));

        if (bpdVal !== '' && ofdVal !== '') {
            handleCiRowUpdate(rowId);
        } else {
            ciRowsCount.textContent = ciTimePoints.length;
        }
    }

    function deleteCiRow(rowId) {
        if (ciTimePoints.length <= 1) {
            alert('At least one time point row is required.');
            return;
        }
        const tr = document.getElementById(rowId);
        if (tr) tr.remove();
        ciTimePoints = ciTimePoints.filter(tp => tp.id !== rowId);
        renumberCiRowLabels();
        ciRowsCount.textContent = ciTimePoints.length;
        updateCiUIAndAnalytics();
    }

    function renumberCiRowLabels() {
        const trs = ciTableBody.querySelectorAll('tr.tp-row');
        trs.forEach((tr, index) => {
            const labelEl = tr.querySelector('.tp-label');
            if (labelEl) labelEl.innerHTML = `<i class="fa-solid fa-head-side-virus"></i> Scan #${index + 1}`;
            if (ciTimePoints[index]) ciTimePoints[index].number = index + 1;
        });
    }

    function handleCiRowUpdate(rowId) {
        const tr = document.getElementById(rowId);
        if (!tr) return;

        const rowObj = ciTimePoints.find(tp => tp.id === rowId);
        if (!rowObj) return;

        rowObj.date = tr.querySelector('.input-date').value;
        rowObj.context = tr.querySelector('.input-context').value.trim();
        const bpdVal = parseFloat(tr.querySelector('.input-bpd').value);
        const ofdVal = parseFloat(tr.querySelector('.input-ofd').value);

        const indexDisplay = tr.querySelector('.index-display');
        const statusTd = tr.querySelector('.col-status');

        rowObj.bpd = isNaN(bpdVal) ? null : bpdVal;
        rowObj.ofd = isNaN(ofdVal) ? null : ofdVal;

        if (rowObj.bpd !== null && rowObj.ofd !== null && rowObj.ofd > 0) {
            if (rowObj.bpd >= rowObj.ofd) {
                indexDisplay.innerHTML = 'Invalid';
                indexDisplay.style.color = 'var(--severe-red)';
                statusTd.innerHTML = `<span class="badge badge-severe"><i class="fa-solid fa-triangle-exclamation"></i> Check Input</span>`;
                rowObj.index = null;
                rowObj.status = 'invalid';
            } else {
                const previousIndex = rowObj.index;
                const computedRatio = rowObj.bpd / rowObj.ofd;
                rowObj.index = parseFloat(computedRatio.toFixed(2));
                const percentStr = (computedRatio * 100).toFixed(2);

                if (previousIndex === null) incrementCalcCounter();

                indexDisplay.innerHTML = `${rowObj.index.toFixed(2)} <span class="index-ratio-sub">(${percentStr}%)</span>`;
                indexDisplay.style.color = 'var(--text-primary)';

                if (rowObj.index < 0.75) {
                    rowObj.status = 'scapho';
                    statusTd.innerHTML = `<span class="badge badge-scapho"><i class="fa-solid fa-arrows-left-right"></i> Dolichocephaly (&lt; 0.75)</span>`;
                } else if (rowObj.index >= 0.75 && rowObj.index <= 0.85) {
                    rowObj.status = 'normal';
                    statusTd.innerHTML = `<span class="badge badge-normal"><i class="fa-solid fa-check-double"></i> Mesocephaly (Normal)</span>`;
                } else if (rowObj.index > 0.85 && rowObj.index <= 0.90) {
                    rowObj.status = 'brachy';
                    statusTd.innerHTML = `<span class="badge badge-brachy"><i class="fa-solid fa-arrows-up-down"></i> Brachycephaly (&gt; 0.85)</span>`;
                } else {
                    rowObj.status = 'severe';
                    statusTd.innerHTML = `<span class="badge badge-severe"><i class="fa-solid fa-triangle-exclamation"></i> Severe Brachy (&gt; 0.90)</span>`;
                }
            }
        } else {
            indexDisplay.textContent = '--';
            statusTd.innerHTML = `<span class="badge badge-empty"><i class="fa-solid fa-minus"></i> Incomplete</span>`;
            rowObj.index = null;
            rowObj.status = 'incomplete';
        }

        updateCiUIAndAnalytics();
    }

    function updateCiUIAndAnalytics() {
        const sortedValid = ciTimePoints.filter(tp => tp.index !== null && !isNaN(tp.index));
        sortedValid.sort((a, b) => {
            if (a.date && b.date) return new Date(a.date) - new Date(b.date);
            if (a.date) return -1;
            if (b.date) return 1;
            return 0;
        });

        ciKpiCount.textContent = sortedValid.length;

        if (sortedValid.length === 0) {
            ciKpiBaseline.textContent = '--';
            ciKpiLatest.textContent = '--';
            ciKpiDelta.textContent = '--';
        } else {
            const baseline = sortedValid[0].index;
            const latest = sortedValid[sortedValid.length - 1].index;
            const delta = latest - baseline;

            ciKpiBaseline.textContent = baseline.toFixed(2);
            ciKpiLatest.textContent = latest.toFixed(2);

            if (sortedValid.length >= 2) {
                const deltaStr = (delta >= 0 ? '+' : '') + delta.toFixed(2);
                const arrowIcon = delta < 0 ? '<i class="fa-solid fa-arrow-down" style="color: var(--scapho-amber)"></i>' :
                                 delta > 0 ? '<i class="fa-solid fa-arrow-up" style="color: var(--brachy-pink)"></i>' :
                                 '<i class="fa-solid fa-arrow-right"></i>';
                ciKpiDelta.innerHTML = `${arrowIcon} ${deltaStr}`;
            } else {
                ciKpiDelta.textContent = '--';
            }
        }

        if (sortedValid.length >= 1) {
            ciChartPlaceholder.classList.add('hidden');
            ciChartContainer.classList.remove('hidden');
            renderCiBarChart(sortedValid);
        } else {
            ciChartPlaceholder.classList.remove('hidden');
            ciChartContainer.classList.add('hidden');
        }
    }

    function renderCiBarChart(sortedData) {
        const labels = sortedData.map((item, idx) => {
            const formattedDate = formatDateLabel(item.date);
            if (item.context && formattedDate) return `${item.context} (${formattedDate})`;
            if (item.context) return item.context;
            if (formattedDate) return formattedDate;
            return `Scan #${idx + 1}`;
        });

        const dataValues = sortedData.map(item => item.index);
        const bgColors = sortedData.map(item => {
            if (item.index < 0.75) return 'rgba(245, 158, 11, 0.85)';
            if (item.index >= 0.75 && item.index <= 0.85) return 'rgba(16, 185, 129, 0.85)';
            if (item.index > 0.85 && item.index <= 0.90) return 'rgba(236, 72, 153, 0.85)';
            return 'rgba(239, 68, 68, 0.85)';
        });

        if (ciChartInstance) {
            ciChartInstance.data.labels = labels;
            ciChartInstance.data.datasets[0].data = dataValues;
            ciChartInstance.data.datasets[0].backgroundColor = bgColors;
            ciChartInstance.update();
        } else {
            const ctx = ciChartCanvas.getContext('2d');
            ciChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Cranial Index (CI Ratio)",
                        data: dataValues,
                        backgroundColor: bgColors,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const item = sortedData[context.dataIndex];
                                    return [
                                        `Cranial Index: ${item.index.toFixed(2)} (${(item.index * 100).toFixed(2)}%)`,
                                        `BPD: ${item.bpd} ${unitSelect.value} | OFD: ${item.ofd} ${unitSelect.value}`
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        y: { min: 0.50, max: 1.00 }
                    }
                }
            });
        }
    }

    // ==========================================================================
    // 2. CRANIAL VAULT ASYMMETRY INDEX (CVAI) ROW GENERATION & ENGINE
    // ==========================================================================
    function createCvaiRow(dateVal = '', contextVal = '', diagAVal = '', diagBVal = '') {
        const rowId = `cvai-row-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const rowObj = {
            id: rowId,
            number: cvaiTimePoints.length + 1,
            date: dateVal,
            context: contextVal,
            diagA: diagAVal !== '' ? parseFloat(diagAVal) : null,
            diagB: diagBVal !== '' ? parseFloat(diagBVal) : null,
            cva: null,
            cvai: null,
            status: 'incomplete'
        };

        cvaiTimePoints.push(rowObj);

        const tr = document.createElement('tr');
        tr.id = rowId;
        tr.className = 'tp-row';

        tr.innerHTML = `
            <td class="col-tp">
                <span class="tp-label"><i class="fa-solid fa-vector-square"></i> Scan #${cvaiTimePoints.length}</span>
            </td>
            <td class="col-date">
                <input type="date" class="input-date" value="${dateVal}" aria-label="Scan Date">
            </td>
            <td class="col-context">
                <input type="text" class="input-context" value="${contextVal}" placeholder="e.g. Pre-Helmet, 3m Follow-up" aria-label="Clinical Context">
            </td>
            <td class="col-measurement">
                <input type="number" class="input-diag-a" step="0.1" min="0" placeholder="e.g. 135.0" value="${diagAVal}" aria-label="Shorter diagonal diameter">
            </td>
            <td class="col-measurement">
                <input type="number" class="input-diag-b" step="0.1" min="0" placeholder="e.g. 144.0" value="${diagBVal}" aria-label="Longer diagonal diameter">
            </td>
            <td class="col-result">
                <span class="cva-display">--</span>
            </td>
            <td class="col-result">
                <span class="cvai-display">--</span>
            </td>
            <td class="col-status">
                <span class="badge badge-empty"><i class="fa-solid fa-minus"></i> Incomplete</span>
            </td>
            <td class="col-action">
                <button type="button" class="btn-icon-delete" title="Delete Time Point">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;

        cvaiTableBody.appendChild(tr);

        const dateInput = tr.querySelector('.input-date');
        const contextInput = tr.querySelector('.input-context');
        const diagAInput = tr.querySelector('.input-diag-a');
        const diagBInput = tr.querySelector('.input-diag-b');
        const btnDelete = tr.querySelector('.btn-icon-delete');

        [dateInput, contextInput, diagAInput, diagBInput].forEach(input => {
            input.addEventListener('input', () => handleCvaiRowUpdate(rowId));
            input.addEventListener('change', () => handleCvaiRowUpdate(rowId));
        });

        btnDelete.addEventListener('click', () => deleteCvaiRow(rowId));

        if (diagAVal !== '' && diagBVal !== '') {
            handleCvaiRowUpdate(rowId);
        } else {
            cvaiRowsCount.textContent = cvaiTimePoints.length;
        }
    }

    function deleteCvaiRow(rowId) {
        if (cvaiTimePoints.length <= 1) {
            alert('At least one time point row is required.');
            return;
        }
        const tr = document.getElementById(rowId);
        if (tr) tr.remove();
        cvaiTimePoints = cvaiTimePoints.filter(tp => tp.id !== rowId);
        renumberCvaiRowLabels();
        cvaiRowsCount.textContent = cvaiTimePoints.length;
        updateCvaiUIAndAnalytics();
    }

    function renumberCvaiRowLabels() {
        const trs = cvaiTableBody.querySelectorAll('tr.tp-row');
        trs.forEach((tr, index) => {
            const labelEl = tr.querySelector('.tp-label');
            if (labelEl) labelEl.innerHTML = `<i class="fa-solid fa-vector-square"></i> Scan #${index + 1}`;
            if (cvaiTimePoints[index]) cvaiTimePoints[index].number = index + 1;
        });
    }

    function handleCvaiRowUpdate(rowId) {
        const tr = document.getElementById(rowId);
        if (!tr) return;

        const rowObj = cvaiTimePoints.find(tp => tp.id === rowId);
        if (!rowObj) return;

        rowObj.date = tr.querySelector('.input-date').value;
        rowObj.context = tr.querySelector('.input-context').value.trim();
        const valA = parseFloat(tr.querySelector('.input-diag-a').value);
        const valB = parseFloat(tr.querySelector('.input-diag-b').value);

        const cvaDisplay = tr.querySelector('.cva-display');
        const cvaiDisplay = tr.querySelector('.cvai-display');
        const statusTd = tr.querySelector('.col-status');

        rowObj.diagA = isNaN(valA) ? null : valA;
        rowObj.diagB = isNaN(valB) ? null : valB;

        if (rowObj.diagA !== null && rowObj.diagB !== null && rowObj.diagA > 0 && rowObj.diagB > 0) {
            const previousIndex = rowObj.cvai;
            
            const shorterDiag = Math.min(rowObj.diagA, rowObj.diagB);
            const longerDiag = Math.max(rowObj.diagA, rowObj.diagB);
            const absDiff = longerDiag - shorterDiag;

            // Choose denominator based on user selection: 'shorter' (default) vs 'longer'
            const denomChoice = cvaiDenominatorSelect.value;
            const denominator = denomChoice === 'longer' ? longerDiag : shorterDiag;

            // CVAI (%) = (|B - A| / denominator) * 100
            const cvaiPct = (absDiff / denominator) * 100;

            rowObj.cva = parseFloat(absDiff.toFixed(2));
            rowObj.cvai = parseFloat(cvaiPct.toFixed(2));

            if (previousIndex === null) incrementCalcCounter();

            cvaDisplay.textContent = `${rowObj.cva.toFixed(2)} ${unitSelect.value}`;
            cvaiDisplay.textContent = `${rowObj.cvai.toFixed(2)}%`;
            cvaiDisplay.style.color = 'var(--text-primary)';

            // CVAI Thresholds (<3.5% Normal, 3.5-6.25% Mild, 6.25-8.75% Moderate, >8.75% Severe)
            if (rowObj.cvai < 3.5) {
                rowObj.status = 'normal';
                statusTd.innerHTML = `<span class="badge badge-normal"><i class="fa-solid fa-check-double"></i> Normal (&lt; 3.5%)</span>`;
            } else if (rowObj.cvai >= 3.5 && rowObj.cvai < 6.25) {
                rowObj.status = 'mild';
                statusTd.innerHTML = `<span class="badge badge-scapho"><i class="fa-solid fa-circle-exclamation"></i> Mild (3.5 - 6.25%)</span>`;
            } else if (rowObj.cvai >= 6.25 && rowObj.cvai <= 8.75) {
                rowObj.status = 'moderate';
                statusTd.innerHTML = `<span class="badge badge-brachy"><i class="fa-solid fa-triangle-exclamation"></i> Moderate (6.25 - 8.75%)</span>`;
            } else {
                rowObj.status = 'severe';
                statusTd.innerHTML = `<span class="badge badge-severe"><i class="fa-solid fa-triangle-exclamation"></i> Severe (&gt; 8.75%)</span>`;
            }
        } else {
            cvaDisplay.textContent = '--';
            cvaiDisplay.textContent = '--';
            statusTd.innerHTML = `<span class="badge badge-empty"><i class="fa-solid fa-minus"></i> Incomplete</span>`;
            rowObj.cva = null;
            rowObj.cvai = null;
            rowObj.status = 'incomplete';
        }

        updateCvaiUIAndAnalytics();
    }

    function recalculateAllCvaiRows() {
        // Update Formula Math Display
        if (cvaiDenominatorSelect.value === 'longer') {
            cvaiFormulaDisplay.innerHTML = `$$\\text{CVAI (\\%)} = \\frac{|\\text{Longer} - \\text{Shorter}|}{\\text{Longer Diagonal}} \\times 100$$`;
        } else {
            cvaiFormulaDisplay.innerHTML = `$$\\text{CVAI (\\%)} = \\frac{|\\text{Longer} - \\text{Shorter}|}{\\text{Shorter Diagonal}} \\times 100$$`;
        }

        // Trigger math formula rendering if MathJax or LaTeX is present
        if (window.MathJax) {
            window.MathJax.typesetPromise();
        }

        // Recalculate each CVAI row
        cvaiTimePoints.forEach(tp => {
            handleCvaiRowUpdate(tp.id);
        });
    }

    function updateCvaiUIAndAnalytics() {
        const sortedValid = cvaiTimePoints.filter(tp => tp.cvai !== null && !isNaN(tp.cvai));
        sortedValid.sort((a, b) => {
            if (a.date && b.date) return new Date(a.date) - new Date(b.date);
            if (a.date) return -1;
            if (b.date) return 1;
            return 0;
        });

        cvaiKpiCount.textContent = sortedValid.length;

        if (sortedValid.length === 0) {
            cvaiKpiBaseline.textContent = '--';
            cvaiKpiLatest.textContent = '--';
            cvaiKpiDelta.textContent = '--';
        } else {
            const baseline = sortedValid[0].cvai;
            const latest = sortedValid[sortedValid.length - 1].cvai;
            const delta = latest - baseline;

            cvaiKpiBaseline.textContent = `${baseline.toFixed(2)}%`;
            cvaiKpiLatest.textContent = `${latest.toFixed(2)}%`;

            if (sortedValid.length >= 2) {
                const deltaStr = (delta >= 0 ? '+' : '') + delta.toFixed(2) + '%';
                const arrowIcon = delta < 0 ? '<i class="fa-solid fa-arrow-down" style="color: var(--normal-emerald)"></i>' :
                                 delta > 0 ? '<i class="fa-solid fa-arrow-up" style="color: var(--severe-red)"></i>' :
                                 '<i class="fa-solid fa-arrow-right"></i>';
                cvaiKpiDelta.innerHTML = `${arrowIcon} ${deltaStr}`;
            } else {
                cvaiKpiDelta.textContent = '--';
            }
        }

        if (sortedValid.length >= 1) {
            cvaiChartPlaceholder.classList.add('hidden');
            cvaiChartContainer.classList.remove('hidden');
            renderCvaiBarChart(sortedValid);
        } else {
            cvaiChartPlaceholder.classList.remove('hidden');
            cvaiChartContainer.classList.add('hidden');
        }
    }

    function renderCvaiBarChart(sortedData) {
        const labels = sortedData.map((item, idx) => {
            const formattedDate = formatDateLabel(item.date);
            if (item.context && formattedDate) return `${item.context} (${formattedDate})`;
            if (item.context) return item.context;
            if (formattedDate) return formattedDate;
            return `Scan #${idx + 1}`;
        });

        const dataValues = sortedData.map(item => item.cvai);
        const bgColors = sortedData.map(item => {
            if (item.cvai < 3.5) return 'rgba(16, 185, 129, 0.85)';
            if (item.cvai >= 3.5 && item.cvai < 6.25) return 'rgba(245, 158, 11, 0.85)';
            if (item.cvai >= 6.25 && item.cvai <= 8.75) return 'rgba(236, 72, 153, 0.85)';
            return 'rgba(239, 68, 68, 0.85)';
        });

        const maxCvaiVal = Math.max(...dataValues, 0);
        // Maximum Y axis scale set to 10% higher than any of the calculated CVAI
        const yAxisMax = maxCvaiVal > 0 ? parseFloat((maxCvaiVal * 1.10).toFixed(2)) : 10.0;

        if (cvaiChartInstance) {
            cvaiChartInstance.data.labels = labels;
            cvaiChartInstance.data.datasets[0].data = dataValues;
            cvaiChartInstance.data.datasets[0].backgroundColor = bgColors;
            cvaiChartInstance.options.scales.y.max = yAxisMax;
            cvaiChartInstance.update();
        } else {
            const ctx = cvaiChartCanvas.getContext('2d');
            cvaiChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: "CVAI Asymmetry Index (%)",
                        data: dataValues,
                        backgroundColor: bgColors,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const item = sortedData[context.dataIndex];
                                    const unitStr = unitSelect.value;
                                    const denomText = cvaiDenominatorSelect.value === 'longer' ? 'Longer' : 'Shorter';
                                    return [
                                        `CVAI (${denomText} Denom): ${item.cvai.toFixed(2)}% | CVA: ${item.cva} ${unitStr}`,
                                        `Shorter: ${Math.min(item.diagA, item.diagB)} ${unitStr} | Longer: ${Math.max(item.diagA, item.diagB)} ${unitStr}`
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            },
                            ticks: {
                                color: '#94a3b8',
                                font: {
                                    family: 'Outfit',
                                    size: 12
                                }
                            }
                        },
                        y: {
                            min: 0,
                            max: yAxisMax,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.05)'
                            },
                            ticks: {
                                color: '#94a3b8',
                                callback: function(value) {
                                    return value.toFixed(1) + '%';
                                },
                                font: {
                                    family: 'Outfit',
                                    size: 12
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    function formatDateLabel(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
            return dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        return dateStr;
    }

    // --- GLOBAL EVENT LISTENERS ---
    function setupEventListeners() {
        btnAddCiRow.addEventListener('click', () => {
            createCiRow();
            ciRowsCount.textContent = ciTimePoints.length;
        });

        btnAddCvaiRow.addEventListener('click', () => {
            createCvaiRow();
            cvaiRowsCount.textContent = cvaiTimePoints.length;
        });

        btnReset.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all data for both calculators?')) {
                initApp();
            }
        });

        btnSample.addEventListener('click', loadSampleCases);
        btnPrint.addEventListener('click', () => window.print());

        unitSelect.addEventListener('change', () => {
            updateCiUIAndAnalytics();
            updateCvaiUIAndAnalytics();
        });

        cvaiDenominatorSelect.addEventListener('change', () => {
            recalculateAllCvaiRows();
        });
    }

    // --- LOAD SAMPLE CASES FOR BOTH TABS ---
    function loadSampleCases() {
        document.getElementById('patient-id').value = 'CRN-90412';
        document.getElementById('patient-name').value = 'M.K. (Plagiocephaly & Brachycephaly)';
        scanModalityInput.value = 'CT head';
        unitSelect.value = 'mm';

        const today = new Date();
        const d1 = new Date(today); d1.setMonth(d1.getMonth() - 6);
        const d2 = new Date(today); d2.setMonth(d2.getMonth() - 3);
        const d3 = new Date(today);

        const formatDate = d => d.toISOString().split('T')[0];

        // 1. Populate CI Tab Sample Case
        ciTableBody.innerHTML = '';
        ciTimePoints = [];
        createCiRow(formatDate(d1), 'Pre-Op Baseline', '122.0', '142.0'); // CI = 0.86 (Brachycephalic)
        createCiRow(formatDate(d2), '3m Post-Treatment', '124.0', '151.0'); // CI = 0.82 (Normal)
        createCiRow(formatDate(d3), '6m Final Follow-up', '126.0', '156.0'); // CI = 0.81 (Normal)
        ciRowsCount.textContent = ciTimePoints.length;
        updateCiUIAndAnalytics();

        // 2. Populate CVAI Tab Sample Case (Deformational Plagiocephaly)
        cvaiTableBody.innerHTML = '';
        cvaiTimePoints = [];
        createCvaiRow(formatDate(d1), 'Pre-Helmet Baseline', '132.0', '145.0'); // CVA = 13mm, CVAI = 9.85% (Severe)
        createCvaiRow(formatDate(d2), '3m Post-Helmet Therapy', '138.0', '144.0'); // CVA = 6mm, CVAI = 4.35% (Mild)
        createCvaiRow(formatDate(d3), '6m Final Follow-up', '142.0', '145.0'); // CVA = 3mm, CVAI = 2.11% (Normal)
        cvaiRowsCount.textContent = cvaiTimePoints.length;
        updateCvaiUIAndAnalytics();
    }
});

/**
 * Cranial Index, Cranial Vault Asymmetry Index & WHO Head Circumference Centile Calculator Pro
 * Supervising Developer: Dr G Narenthiran MB Ch FEBNS FRCS(SN), g_narnethiran@hotmail.com
 * Copyright (c) 2026 Dr G Narenthiran. All rights reserved.
 * Dedicated to my mother Mrs Nirmaladevy Ganesalingam BSc
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let ciTimePoints = [];
    let cvaiTimePoints = [];
    let hcTimePoints = [];
    let activeTab = 'tab-ci';

    let ciChartInstance = null;
    let cvaiChartInstance = null;
    let hcChartInstance = null;
    let topHcChartInstance = null;

    // --- WHO CHILD GROWTH STANDARDS (0 to 60 Months) DATASETS ---
    const WHO_HC_BOYS = [
        { m: 0, M: 34.5, SD: 1.3 },
        { m: 1, M: 37.3, SD: 1.2 },
        { m: 2, M: 39.1, SD: 1.2 },
        { m: 3, M: 40.5, SD: 1.2 },
        { m: 4, M: 41.6, SD: 1.2 },
        { m: 5, M: 42.6, SD: 1.2 },
        { m: 6, M: 43.3, SD: 1.2 },
        { m: 7, M: 44.0, SD: 1.2 },
        { m: 8, M: 44.5, SD: 1.2 },
        { m: 9, M: 45.0, SD: 1.2 },
        { m: 10, M: 45.4, SD: 1.2 },
        { m: 11, M: 45.8, SD: 1.2 },
        { m: 12, M: 46.1, SD: 1.2 },
        { m: 15, M: 47.0, SD: 1.3 },
        { m: 18, M: 47.6, SD: 1.3 },
        { m: 21, M: 48.1, SD: 1.3 },
        { m: 24, M: 48.6, SD: 1.3 },
        { m: 30, M: 49.3, SD: 1.3 },
        { m: 36, M: 49.8, SD: 1.3 },
        { m: 42, M: 50.3, SD: 1.3 },
        { m: 48, M: 50.7, SD: 1.4 },
        { m: 54, M: 51.0, SD: 1.4 },
        { m: 60, M: 51.3, SD: 1.4 }
    ];

    const WHO_HC_GIRLS = [
        { m: 0, M: 33.9, SD: 1.2 },
        { m: 1, M: 36.5, SD: 1.2 },
        { m: 2, M: 38.3, SD: 1.2 },
        { m: 3, M: 39.5, SD: 1.2 },
        { m: 4, M: 40.6, SD: 1.2 },
        { m: 5, M: 41.5, SD: 1.2 },
        { m: 6, M: 42.2, SD: 1.2 },
        { m: 7, M: 42.8, SD: 1.2 },
        { m: 8, M: 43.4, SD: 1.2 },
        { m: 9, M: 43.9, SD: 1.2 },
        { m: 10, M: 44.3, SD: 1.2 },
        { m: 11, M: 44.7, SD: 1.2 },
        { m: 12, M: 45.0, SD: 1.2 },
        { m: 15, M: 45.8, SD: 1.2 },
        { m: 18, M: 46.4, SD: 1.3 },
        { m: 21, M: 46.9, SD: 1.3 },
        { m: 24, M: 47.4, SD: 1.3 },
        { m: 30, M: 48.1, SD: 1.3 },
        { m: 36, M: 48.6, SD: 1.3 },
        { m: 42, M: 49.1, SD: 1.3 },
        { m: 48, M: 49.5, SD: 1.3 },
        { m: 54, M: 49.9, SD: 1.3 },
        { m: 60, M: 50.2, SD: 1.4 }
    ];

    // DOM Elements - Patient Demographics & Controls
    const patientIdInput = document.getElementById('patient-id');
    const patientNameInput = document.getElementById('patient-name');
    const scanModalityInput = document.getElementById('scan-modality');
    const headCircumferenceInput = document.getElementById('head-circumference');
    const headCircDateInput = document.getElementById('head-circ-date');
    const topHcAgeInput = document.getElementById('top-hc-age');
    const btnTopHcSubmit = document.getElementById('btn-top-hc-submit');
    const unitSelect = document.getElementById('unit-select');

    // CVAI Denominator Selector
    const cvaiDenominatorSelect = document.getElementById('cvai-denominator');
    const cvaiFormulaDisplay = document.getElementById('cvai-formula-display');

    // Tab 3 Head Circumference Centile Inputs
    const hcAgeMonthsInput = document.getElementById('hc-age-months');
    const hcValueCmInput = document.getElementById('hc-value-cm');
    const btnHcSubmit = document.getElementById('btn-hc-submit');

    const hcKpiCentile = document.getElementById('hc-kpi-centile');
    const hcKpiZscore = document.getElementById('hc-kpi-zscore');
    const hcStatusBadge = document.getElementById('hc-status-badge');

    // DOM Elements - Buttons
    const btnAddCiRow = document.getElementById('btn-add-ci-row');
    const btnAddCvaiRow = document.getElementById('btn-add-cvai-row');
    const btnAddHcRow = document.getElementById('btn-add-hc-row');
    const btnReset = document.getElementById('btn-reset-all');
    const btnSample = document.getElementById('btn-sample-case');
    const btnPrint = document.getElementById('btn-print-report');

    // DOM Elements - Table Bodies & Badges
    const ciTableBody = document.getElementById('ci-table-body');
    const cvaiTableBody = document.getElementById('cvai-table-body');
    const hcTableBody = document.getElementById('hc-table-body');

    const ciRowsCount = document.getElementById('ci-rows-count');
    const cvaiRowsCount = document.getElementById('cvai-rows-count');
    const hcRowsCount = document.getElementById('hc-rows-count');

    // KPI Cards - CI & CVAI
    const ciKpiCount = document.getElementById('ci-kpi-count');
    const ciKpiBaseline = document.getElementById('ci-kpi-baseline');
    const ciKpiLatest = document.getElementById('ci-kpi-latest');
    const ciKpiDelta = document.getElementById('ci-kpi-delta');

    const cvaiKpiCount = document.getElementById('cvai-kpi-count');
    const cvaiKpiBaseline = document.getElementById('cvai-kpi-baseline');
    const cvaiKpiLatest = document.getElementById('cvai-kpi-latest');
    const cvaiKpiDelta = document.getElementById('cvai-kpi-delta');

    // Chart Canvas Wrappers
    const ciChartPlaceholder = document.getElementById('ci-chart-placeholder');
    const ciChartContainer = document.getElementById('ci-chart-container');
    const ciChartCanvas = document.getElementById('ciChart');

    const cvaiChartPlaceholder = document.getElementById('cvai-chart-placeholder');
    const cvaiChartContainer = document.getElementById('cvai-chart-container');
    const cvaiChartCanvas = document.getElementById('cvaiChart');

    const hcChartContainer = document.getElementById('hc-chart-container');
    const hcChartCanvas = document.getElementById('hcChart');

    const topHcChartSection = document.getElementById('top-hc-chart-section');
    const topHcChartCanvas = document.getElementById('topHcChart');

    // Counter Elements
    const counterViewsEl = document.getElementById('counter-views');
    const counterCalcsEl = document.getElementById('counter-calcs');

    // Helper: Get selected gender from radio buttons
    function getSelectedHcGender() {
        const topChecked = document.querySelector('input[name="top-hc-gender-radio"]:checked');
        if (topChecked) return topChecked.value;
        const tabChecked = document.querySelector('input[name="hc-gender-radio"]:checked');
        if (tabChecked) return tabChecked.value;
        return 'boy';
    }

    // --- INITIALIZATION ---
    initCounters();
    initTabs();
    initApp();
    setupEventListeners();

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
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTabId = btn.getAttribute('data-tab');
                activeTab = targetTabId;

                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                tabContents.forEach(tc => {
                    tc.classList.remove('active');
                    tc.style.display = '';
                });

                const targetEl = document.getElementById(targetTabId);
                if (targetEl) {
                    targetEl.classList.add('active');
                    targetEl.style.display = '';
                }

                setTimeout(() => {
                    if (activeTab === 'tab-ci') updateCiUIAndAnalytics();
                    if (activeTab === 'tab-cvai') updateCvaiUIAndAnalytics();
                    if (activeTab === 'tab-hc') updateHcUIAndAnalytics();
                }, 30);
            });
        });
    }

    // --- INITIALIZE APPLICATION DATA ---
    function initApp() {
        ciTableBody.innerHTML = '';
        cvaiTableBody.innerHTML = '';
        if (hcTableBody) hcTableBody.innerHTML = '';

        if (headCircumferenceInput) headCircumferenceInput.value = '';
        if (headCircDateInput) headCircDateInput.value = '';
        if (hcAgeMonthsInput) hcAgeMonthsInput.value = '';
        if (hcValueCmInput) hcValueCmInput.value = '';

        const boyRadio = document.querySelector('input[name="hc-gender-radio"][value="boy"]');
        if (boyRadio) boyRadio.checked = true;

        ciTimePoints = [];
        cvaiTimePoints = [];
        hcTimePoints = [];

        for (let i = 1; i <= 5; i++) {
            createCiRow();
            createCvaiRow();
            createHcRow();
        }

        updateCiUIAndAnalytics();
        updateCvaiUIAndAnalytics();
        updateHcUIAndAnalytics();
    }

    // ==========================================================================
    // MATHEMATICAL CENTILE & Z-SCORE ENGINE (WHO STANDARDS)
    // ==========================================================================
    function getWhoParams(ageMonths, gender) {
        const table = (gender === 'girl') ? WHO_HC_GIRLS : WHO_HC_BOYS;
        if (ageMonths <= table[0].m) return table[0];
        if (ageMonths >= table[table.length - 1].m) return table[table.length - 1];

        for (let i = 0; i < table.length - 1; i++) {
            if (ageMonths >= table[i].m && ageMonths <= table[i + 1].m) {
                const t = (ageMonths - table[i].m) / (table[i + 1].m - table[i].m);
                const M = table[i].M + t * (table[i + 1].M - table[i].M);
                const SD = table[i].SD + t * (table[i + 1].SD - table[i].SD);
                return { M, SD };
            }
        }
        return table[0];
    }

    function calculateZScore(hcCm, ageMonths, gender) {
        const { M, SD } = getWhoParams(ageMonths, gender);
        return (hcCm - M) / SD;
    }

    function calculatePercentile(zScore) {
        const sign = zScore < 0 ? -1 : 1;
        const x = Math.abs(zScore) / Math.sqrt(2);
        const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        const erfVal = sign * y;
        const percentile = 0.5 * (1.0 + erfVal) * 100;
        return Math.max(0.1, Math.min(99.9, percentile));
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
                <input type="number" class="input-bpd" step="0.1" min="0" placeholder="e.g. 122.0" value="${bpdVal}" aria-label="Biparietal Diameter BPD">
            </td>
            <td class="col-measurement">
                <input type="number" class="input-ofd" step="0.1" min="0" placeholder="e.g. 142.0" value="${ofdVal}" aria-label="Occipitofrontal Diameter OFD">
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

        const ciTabEl = document.getElementById('tab-ci');
        if (sortedValid.length >= 1) {
            if (ciChartPlaceholder) ciChartPlaceholder.classList.add('hidden');
            if (ciChartContainer) ciChartContainer.classList.remove('hidden');
            if (ciTabEl && (ciTabEl.classList.contains('active') || activeTab === 'tab-ci')) {
                renderCiBarChart(sortedValid);
            }
        } else {
            if (ciChartPlaceholder) ciChartPlaceholder.classList.remove('hidden');
            if (ciChartContainer) ciChartContainer.classList.add('hidden');
        }
    }

    // Custom Chart.js Plugin to draw numerical values directly above each bar
    const barValueLabelsPlugin = {
        id: 'barValueLabelsPlugin',
        afterDatasetsDraw(chart) {
            const { ctx } = chart;
            chart.data.datasets.forEach((dataset, datasetIndex) => {
                if (dataset.type === 'line' || dataset.label.includes('Centile') || dataset.label.includes('Patient')) return;
                const meta = chart.getDatasetMeta(datasetIndex);
                meta.data.forEach((bar, index) => {
                    const val = dataset.data[index];
                    if (val !== null && val !== undefined && !isNaN(val)) {
                        ctx.save();
                        ctx.font = 'bold 12px "Outfit", system-ui, -apple-system, sans-serif';
                        ctx.fillStyle = '#38bdf8';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'bottom';

                        let labelText = '';
                        if (chart.canvas.id === 'cvaiChart') {
                            labelText = val.toFixed(2) + '%';
                        } else {
                            labelText = val.toFixed(2);
                        }

                        ctx.fillText(labelText, bar.x, bar.y - 6);
                        ctx.restore();
                    }
                });
            });
        }
    };

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

        const maxCiVal = Math.max(...dataValues, 0);
        const yAxisMax = maxCiVal > 0 ? parseFloat(Math.min(1.05, maxCiVal * 1.12).toFixed(2)) : 1.0;

        if (ciChartInstance) {
            ciChartInstance.destroy();
            ciChartInstance = null;
        }

        const ctx = ciChartCanvas.getContext('2d');
        ciChartInstance = new Chart(ctx, {
            type: 'bar',
            plugins: [barValueLabelsPlugin],
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
                                        `BPD: ${item.bpd} ${unitSelect ? unitSelect.value : 'mm'} | OFD: ${item.ofd} ${unitSelect ? unitSelect.value : 'mm'}`
                                    ];
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 12 } }
                        },
                        y: {
                            min: 0.50,
                            max: yAxisMax,
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 12 } }
                        }
                    }
                }
            });
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
                <input type="number" class="input-diag-a" step="0.1" min="0" placeholder="e.g. 132.0" value="${diagAVal}" aria-label="Shorter diagonal diameter">
            </td>
            <td class="col-measurement">
                <input type="number" class="input-diag-b" step="0.1" min="0" placeholder="e.g. 145.0" value="${diagBVal}" aria-label="Longer diagonal diameter">
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

            const denomChoice = cvaiDenominatorSelect.value;
            const denominator = denomChoice === 'longer' ? longerDiag : shorterDiag;

            const cvaiPct = (absDiff / denominator) * 100;

            rowObj.cva = parseFloat(absDiff.toFixed(2));
            rowObj.cvai = parseFloat(cvaiPct.toFixed(2));

            if (previousIndex === null) incrementCalcCounter();

            cvaDisplay.textContent = `${rowObj.cva.toFixed(2)} ${unitSelect ? unitSelect.value : 'mm'}`;
            cvaiDisplay.textContent = `${rowObj.cvai.toFixed(2)}%`;
            cvaiDisplay.style.color = 'var(--text-primary)';

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
        if (cvaiDenominatorSelect.value === 'longer') {
            cvaiFormulaDisplay.innerHTML = `$$\\text{CVAI (\\%)} = \\frac{|\\text{Longer} - \\text{Shorter}|}{\\text{Longer Diagonal}} \\times 100$$`;
        } else {
            cvaiFormulaDisplay.innerHTML = `$$\\text{CVAI (\\%)} = \\frac{|\\text{Longer} - \\text{Shorter}|}{\\text{Shorter Diagonal}} \\times 100$$`;
        }

        if (window.MathJax) {
            window.MathJax.typesetPromise();
        }

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

        const cvaiTabEl = document.getElementById('tab-cvai');
        if (sortedValid.length >= 1) {
            if (cvaiChartPlaceholder) cvaiChartPlaceholder.classList.add('hidden');
            if (cvaiChartContainer) cvaiChartContainer.classList.remove('hidden');
            if (cvaiTabEl && (cvaiTabEl.classList.contains('active') || activeTab === 'tab-cvai')) {
                renderCvaiBarChart(sortedValid);
            }
        } else {
            if (cvaiChartPlaceholder) cvaiChartPlaceholder.classList.remove('hidden');
            if (cvaiChartContainer) cvaiChartContainer.classList.add('hidden');
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
        const yAxisMax = maxCvaiVal > 0 ? parseFloat((maxCvaiVal * 1.15).toFixed(2)) : 10.0;

        if (cvaiChartInstance) {
            cvaiChartInstance.destroy();
            cvaiChartInstance = null;
        }

        const ctx = cvaiChartCanvas.getContext('2d');
        cvaiChartInstance = new Chart(ctx, {
            type: 'bar',
            plugins: [barValueLabelsPlugin],
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
                                    const unitStr = unitSelect ? unitSelect.value : 'mm';
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
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 12 } }
                        },
                        y: {
                            min: 0,
                            max: yAxisMax,
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: {
                                color: '#94a3b8',
                                callback: function(value) { return value.toFixed(1) + '%'; },
                                font: { family: 'Outfit', size: 12 }
                            }
                        }
                    }
                }
            });
    }

    // ==========================================================================
    // 3. TAB 3: HEAD CIRCUMFERENCE CENTILE & WHO GROWTH CHART ENGINE
    // ==========================================================================
    function handleSingleHcCalculation() {
        const gender = getSelectedHcGender();
        const ageVal = parseFloat(hcAgeMonthsInput && hcAgeMonthsInput.value !== '' ? hcAgeMonthsInput.value : (topHcAgeInput ? topHcAgeInput.value : ''));
        const hcVal = parseFloat(hcValueCmInput && hcValueCmInput.value !== '' ? hcValueCmInput.value : (headCircumferenceInput ? headCircumferenceInput.value : ''));

        const bannerEl = document.getElementById('top-hc-result-banner');
        const bannerText = document.getElementById('top-hc-banner-text');

        if (!isNaN(ageVal) && !isNaN(hcVal) && ageVal >= 0 && hcVal > 0) {
            const zScore = calculateZScore(hcVal, ageVal, gender);
            const percentile = calculatePercentile(zScore);

            const ordinalSuffix = (p) => {
                const rounded = Math.round(p);
                if (rounded >= 11 && rounded <= 13) return `${p.toFixed(1)}th`;
                switch (rounded % 10) {
                    case 1: return `${p.toFixed(1)}st`;
                    case 2: return `${p.toFixed(1)}nd`;
                    case 3: return `${p.toFixed(1)}rd`;
                    default: return `${p.toFixed(1)}th`;
                }
            };

            if (hcKpiCentile) hcKpiCentile.textContent = ordinalSuffix(percentile);
            if (hcKpiZscore) hcKpiZscore.textContent = (zScore >= 0 ? '+' : '') + zScore.toFixed(2) + ' SD';

            let statusStr = 'Normal Range';
            if (percentile > 97) statusStr = 'Macrocephaly (>97th)';
            else if (percentile < 3) statusStr = 'Microcephaly (<3rd)';

            if (hcStatusBadge) {
                if (percentile > 97) {
                    hcStatusBadge.innerHTML = `<span class="badge badge-severe"><i class="fa-solid fa-arrow-up"></i> Macrocephaly (&gt; 97th Centile)</span>`;
                } else if (percentile < 3) {
                    hcStatusBadge.innerHTML = `<span class="badge badge-severe"><i class="fa-solid fa-arrow-down"></i> Microcephaly (&lt; 3rd Centile)</span>`;
                } else {
                    hcStatusBadge.innerHTML = `<span class="badge badge-normal"><i class="fa-solid fa-check-double"></i> Normal Range (3rd - 97th Centile)</span>`;
                }
            }

            if (bannerEl && bannerText) {
                bannerEl.classList.remove('hidden');
                bannerText.innerHTML = `WHO Head Circumference Centile: <strong style="color: #38bdf8; font-size: 17px;">${ordinalSuffix(percentile)}</strong> (Z-Score: <strong>${(zScore >= 0 ? '+' : '') + zScore.toFixed(2)} SD</strong>) &nbsp;|&nbsp; <strong>${statusStr}</strong> &nbsp;|&nbsp; Age: <strong>${ageVal}m</strong>, HC: <strong>${hcVal} cm</strong> (${gender === 'girl' ? 'Female' : 'Male'} Standard)`;
            }

            if (topHcChartSection) {
                topHcChartSection.classList.remove('hidden');
                renderTopHcGrowthChart(ageVal, hcVal, gender);
            }
        } else {
            if (hcKpiCentile) hcKpiCentile.textContent = '--';
            if (hcKpiZscore) hcKpiZscore.textContent = '--';
            if (hcStatusBadge) hcStatusBadge.innerHTML = `<span class="badge badge-empty"><i class="fa-solid fa-minus"></i> Enter Age &amp; Circumference</span>`;
            if (bannerEl) bannerEl.classList.add('hidden');
            if (topHcChartSection) topHcChartSection.classList.add('hidden');
        }

        updateHcUIAndAnalytics();
    }

    function createHcRow(dateVal = '', contextVal = '', ageVal = '', hcVal = '') {
        if (!hcTableBody) return;
        const rowId = `hc-row-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const rowObj = {
            id: rowId,
            number: hcTimePoints.length + 1,
            date: dateVal,
            context: contextVal,
            ageMonths: ageVal !== '' ? parseFloat(ageVal) : null,
            hcCm: hcVal !== '' ? parseFloat(hcVal) : null,
            percentile: null,
            zScore: null,
            status: 'incomplete'
        };

        hcTimePoints.push(rowObj);

        const tr = document.createElement('tr');
        tr.id = rowId;
        tr.className = 'tp-row';

        tr.innerHTML = `
            <td class="col-tp">
                <span class="tp-label"><i class="fa-solid fa-tape"></i> Scan #${hcTimePoints.length}</span>
            </td>
            <td class="col-date">
                <input type="date" class="input-date" value="${dateVal}" aria-label="Measurement Date">
            </td>
            <td class="col-context">
                <input type="text" class="input-context" value="${contextVal}" placeholder="e.g. 6m Follow-up" aria-label="Clinical Context">
            </td>
            <td class="col-measurement">
                <input type="number" class="input-age" step="0.1" min="0" max="60" placeholder="e.g. 6.0" value="${ageVal}" aria-label="Age in months">
            </td>
            <td class="col-measurement">
                <input type="number" class="input-hc" step="0.1" min="20" max="65" placeholder="e.g. 43.5" value="${hcVal}" aria-label="Head Circumference in cm">
            </td>
            <td class="col-result">
                <span class="centile-display">--</span>
            </td>
            <td class="col-result">
                <span class="zscore-display">--</span>
            </td>
            <td class="col-status">
                <span class="badge badge-empty"><i class="fa-solid fa-minus"></i> Incomplete</span>
            </td>
            <td class="col-action">
                <button type="button" class="btn-icon-delete" title="Delete Measurement">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;

        hcTableBody.appendChild(tr);

        const dateInput = tr.querySelector('.input-date');
        const contextInput = tr.querySelector('.input-context');
        const ageInput = tr.querySelector('.input-age');
        const hcInput = tr.querySelector('.input-hc');
        const btnDelete = tr.querySelector('.btn-icon-delete');

        [dateInput, contextInput, ageInput, hcInput].forEach(input => {
            input.addEventListener('input', () => handleHcRowUpdate(rowId));
            input.addEventListener('change', () => handleHcRowUpdate(rowId));
        });

        btnDelete.addEventListener('click', () => deleteHcRow(rowId));

        if (ageVal !== '' && hcVal !== '') {
            handleHcRowUpdate(rowId);
        } else {
            if (hcRowsCount) hcRowsCount.textContent = hcTimePoints.length;
        }
    }

    function deleteHcRow(rowId) {
        if (hcTimePoints.length <= 1) {
            alert('At least one measurement row is required.');
            return;
        }
        const tr = document.getElementById(rowId);
        if (tr) tr.remove();
        hcTimePoints = hcTimePoints.filter(tp => tp.id !== rowId);
        renumberHcRowLabels();
        if (hcRowsCount) hcRowsCount.textContent = hcTimePoints.length;
        updateHcUIAndAnalytics();
    }

    function renumberHcRowLabels() {
        if (!hcTableBody) return;
        const trs = hcTableBody.querySelectorAll('tr.tp-row');
        trs.forEach((tr, index) => {
            const labelEl = tr.querySelector('.tp-label');
            if (labelEl) labelEl.innerHTML = `<i class="fa-solid fa-tape"></i> Scan #${index + 1}`;
            if (hcTimePoints[index]) hcTimePoints[index].number = index + 1;
        });
    }

    function handleHcRowUpdate(rowId) {
        const tr = document.getElementById(rowId);
        if (!tr) return;

        const rowObj = hcTimePoints.find(tp => tp.id === rowId);
        if (!rowObj) return;

        rowObj.date = tr.querySelector('.input-date').value;
        rowObj.context = tr.querySelector('.input-context').value.trim();
        const valAge = parseFloat(tr.querySelector('.input-age').value);
        const valHc = parseFloat(tr.querySelector('.input-hc').value);

        const centileDisplay = tr.querySelector('.centile-display');
        const zscoreDisplay = tr.querySelector('.zscore-display');
        const statusTd = tr.querySelector('.col-status');

        rowObj.ageMonths = isNaN(valAge) ? null : valAge;
        rowObj.hcCm = isNaN(valHc) ? null : valHc;

        if (rowObj.ageMonths !== null && rowObj.hcCm !== null && rowObj.ageMonths >= 0 && rowObj.hcCm > 0) {
            const gender = getSelectedHcGender();
            const previousIndex = rowObj.percentile;

            rowObj.zScore = calculateZScore(rowObj.hcCm, rowObj.ageMonths, gender);
            rowObj.percentile = calculatePercentile(rowObj.zScore);

            if (previousIndex === null) incrementCalcCounter();

            centileDisplay.textContent = `${rowObj.percentile.toFixed(1)}%`;
            zscoreDisplay.textContent = `${(rowObj.zScore >= 0 ? '+' : '')}${rowObj.zScore.toFixed(2)} SD`;

            if (rowObj.percentile > 97) {
                rowObj.status = 'macro';
                statusTd.innerHTML = `<span class="badge badge-severe"><i class="fa-solid fa-arrow-up"></i> Macrocephaly (&gt;97th)</span>`;
            } else if (rowObj.percentile < 3) {
                rowObj.status = 'micro';
                statusTd.innerHTML = `<span class="badge badge-severe"><i class="fa-solid fa-arrow-down"></i> Microcephaly (&lt;3rd)</span>`;
            } else {
                rowObj.status = 'normal';
                statusTd.innerHTML = `<span class="badge badge-normal"><i class="fa-solid fa-check-double"></i> Normal (3rd-97th)</span>`;
            }
        } else {
            centileDisplay.textContent = '--';
            zscoreDisplay.textContent = '--';
            statusTd.innerHTML = `<span class="badge badge-empty"><i class="fa-solid fa-minus"></i> Incomplete</span>`;
            rowObj.percentile = null;
            rowObj.zScore = null;
            rowObj.status = 'incomplete';
        }

        updateHcUIAndAnalytics();
    }

    function updateHcUIAndAnalytics() {
        const sortedValid = hcTimePoints.filter(tp => tp.ageMonths !== null && tp.hcCm !== null);
        sortedValid.sort((a, b) => a.ageMonths - b.ageMonths);

        if (hcRowsCount) hcRowsCount.textContent = hcTimePoints.length;

        const hcTabEl = document.getElementById('tab-hc');
        if (hcTabEl && (hcTabEl.classList.contains('active') || activeTab === 'tab-hc')) {
            renderHcGrowthChart(sortedValid, getSelectedHcGender());
        }
    }

    function renderHcGrowthChart(sortedData, gender) {
        if (!hcChartCanvas) return;

        const table = (gender === 'girl') ? WHO_HC_GIRLS : WHO_HC_BOYS;
        const ages = table.map(item => item.m);

        const p3Data = table.map(item => parseFloat((item.M - 1.88 * item.SD).toFixed(1)));
        const p15Data = table.map(item => parseFloat((item.M - 1.04 * item.SD).toFixed(1)));
        const p50Data = table.map(item => parseFloat(item.M.toFixed(1)));
        const p85Data = table.map(item => parseFloat((item.M + 1.04 * item.SD).toFixed(1)));
        const p97Data = table.map(item => parseFloat((item.M + 1.88 * item.SD).toFixed(1)));

        // Patient Trajectory Datapoints formatted as {x: age, y: hcCm}
        const patientPoints = sortedData.map(item => ({
            x: item.ageMonths,
            y: item.hcCm,
            context: item.context,
            date: item.date,
            percentile: item.percentile,
            zScore: item.zScore
        }));

        // Include single side-panel or top-bar entry if entered
        const singleAge = parseFloat(
            (hcAgeMonthsInput && hcAgeMonthsInput.value !== '') ? hcAgeMonthsInput.value :
            (topHcAgeInput && topHcAgeInput.value !== '' ? topHcAgeInput.value : '')
        );
        const singleHc = parseFloat(
            (hcValueCmInput && hcValueCmInput.value !== '') ? hcValueCmInput.value :
            (headCircumferenceInput && headCircumferenceInput.value !== '' ? headCircumferenceInput.value : '')
        );

        if (!isNaN(singleAge) && !isNaN(singleHc) && singleAge >= 0 && singleHc > 0) {
            const singleZ = calculateZScore(singleHc, singleAge, gender);
            const singleP = calculatePercentile(singleZ);
            patientPoints.push({
                x: singleAge,
                y: singleHc,
                context: 'Current Entry',
                date: '',
                percentile: singleP,
                zScore: singleZ
            });
            patientPoints.sort((a, b) => a.x - b.x);
        }

        const chartDatasets = [
            {
                label: '97th Centile (+2 SD)',
                data: ages.map((age, i) => ({ x: age, y: p97Data[i] })),
                borderColor: 'rgba(239, 68, 68, 0.75)',
                borderWidth: 1.5,
                borderDash: [4, 4],
                pointRadius: 0,
                fill: false,
                tension: 0.3
            },
            {
                label: '85th Centile (+1 SD)',
                data: ages.map((age, i) => ({ x: age, y: p85Data[i] })),
                borderColor: 'rgba(245, 158, 11, 0.75)',
                borderWidth: 1.5,
                borderDash: [3, 3],
                pointRadius: 0,
                fill: false,
                tension: 0.3
            },
            {
                label: '50th Centile (Median)',
                data: ages.map((age, i) => ({ x: age, y: p50Data[i] })),
                borderColor: 'rgba(16, 185, 129, 0.9)',
                borderWidth: 2.5,
                pointRadius: 0,
                fill: false,
                tension: 0.3
            },
            {
                label: '15th Centile (-1 SD)',
                data: ages.map((age, i) => ({ x: age, y: p15Data[i] })),
                borderColor: 'rgba(245, 158, 11, 0.75)',
                borderWidth: 1.5,
                borderDash: [3, 3],
                pointRadius: 0,
                fill: false,
                tension: 0.3
            },
            {
                label: '3rd Centile (-2 SD)',
                data: ages.map((age, i) => ({ x: age, y: p3Data[i] })),
                borderColor: 'rgba(239, 68, 68, 0.75)',
                borderWidth: 1.5,
                borderDash: [4, 4],
                pointRadius: 0,
                fill: false,
                tension: 0.3
            },
            {
                label: 'Patient Head Circumference Trajectory',
                data: patientPoints,
                borderColor: '#38bdf8',
                backgroundColor: '#0284c7',
                borderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#38bdf8',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                showLine: true,
                tension: 0.2
            }
        ];

        if (hcChartInstance) {
            hcChartInstance.destroy();
            hcChartInstance = null;
        }

        const ctx = hcChartCanvas.getContext('2d');
        hcChartInstance = new Chart(ctx, {
            type: 'line',
            data: { datasets: chartDatasets },
            options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: '#94a3b8',
                                font: { family: 'Outfit', size: 11 },
                                boxWidth: 14
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const pt = context.raw;
                                    if (context.dataset.label.includes('Patient')) {
                                        return [
                                            `Patient HC: ${pt.y.toFixed(1)} cm at ${pt.x} months`,
                                            `Centile: ${pt.percentile ? pt.percentile.toFixed(1) + '%' : '--'} (Z: ${pt.zScore ? (pt.zScore >= 0 ? '+' : '') + pt.zScore.toFixed(2) + ' SD' : '--'})`
                                        ];
                                    }
                                    return `${context.dataset.label}: ${pt.y} cm at ${pt.x}m`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'linear',
                            min: 0,
                            max: 60,
                            title: {
                                display: true,
                                text: 'Age (months)',
                                color: '#94a3b8',
                                font: { family: 'Outfit', size: 12, weight: 'bold' }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 11 } }
                        },
                        y: {
                            min: 30,
                            max: 56,
                            title: {
                                display: true,
                                text: 'Head Circumference (cm)',
                                color: '#94a3b8',
                                font: { family: 'Outfit', size: 12, weight: 'bold' }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            ticks: {
                                color: '#94a3b8',
                                callback: function(value) { return value.toFixed(0) + ' cm'; },
                                font: { family: 'Outfit', size: 11 }
                            }
                        }
                    }
                }
            });
    }

    function renderTopHcGrowthChart(singleAge, singleHc, gender) {
        if (!topHcChartCanvas) return;

        const table = (gender === 'girl') ? WHO_HC_GIRLS : WHO_HC_BOYS;
        const ages = table.map(item => item.m);

        const p3Data = table.map(item => parseFloat((item.M - 1.88 * item.SD).toFixed(1)));
        const p15Data = table.map(item => parseFloat((item.M - 1.04 * item.SD).toFixed(1)));
        const p50Data = table.map(item => parseFloat(item.M.toFixed(1)));
        const p85Data = table.map(item => parseFloat((item.M + 1.04 * item.SD).toFixed(1)));
        const p97Data = table.map(item => parseFloat((item.M + 1.88 * item.SD).toFixed(1)));

        const singleZ = calculateZScore(singleHc, singleAge, gender);
        const singleP = calculatePercentile(singleZ);

        const patientPoint = [{
            x: singleAge,
            y: singleHc,
            context: 'Patient Entry',
            percentile: singleP,
            zScore: singleZ
        }];

        const chartDatasets = [
            {
                label: '97th Centile (+2 SD)',
                data: ages.map((age, i) => ({ x: age, y: p97Data[i] })),
                borderColor: 'rgba(239, 68, 68, 0.75)',
                borderWidth: 1.5,
                borderDash: [4, 4],
                pointRadius: 0,
                fill: false,
                tension: 0.3
            },
            {
                label: '85th Centile (+1 SD)',
                data: ages.map((age, i) => ({ x: age, y: p85Data[i] })),
                borderColor: 'rgba(245, 158, 11, 0.75)',
                borderWidth: 1.5,
                borderDash: [3, 3],
                pointRadius: 0,
                fill: false,
                tension: 0.3
            },
            {
                label: '50th Centile (Median)',
                data: ages.map((age, i) => ({ x: age, y: p50Data[i] })),
                borderColor: 'rgba(16, 185, 129, 0.9)',
                borderWidth: 2.5,
                pointRadius: 0,
                fill: false,
                tension: 0.3
            },
            {
                label: '15th Centile (-1 SD)',
                data: ages.map((age, i) => ({ x: age, y: p15Data[i] })),
                borderColor: 'rgba(245, 158, 11, 0.75)',
                borderWidth: 1.5,
                borderDash: [3, 3],
                pointRadius: 0,
                fill: false,
                tension: 0.3
            },
            {
                label: '3rd Centile (-2 SD)',
                data: ages.map((age, i) => ({ x: age, y: p3Data[i] })),
                borderColor: 'rgba(239, 68, 68, 0.75)',
                borderWidth: 1.5,
                borderDash: [4, 4],
                pointRadius: 0,
                fill: false,
                tension: 0.3
            },
            {
                label: 'Patient Measurement',
                data: patientPoint,
                borderColor: '#38bdf8',
                backgroundColor: '#0284c7',
                borderWidth: 3,
                pointRadius: 8,
                pointHoverRadius: 10,
                pointBackgroundColor: '#38bdf8',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                showLine: false
            }
        ];

        if (topHcChartInstance) {
            topHcChartInstance.destroy();
            topHcChartInstance = null;
        }

        const ctx = topHcChartCanvas.getContext('2d');
        topHcChartInstance = new Chart(ctx, {
            type: 'line',
            data: { datasets: chartDatasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#94a3b8',
                            font: { family: 'Outfit', size: 11 },
                            boxWidth: 14
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (context.datasetIndex === 5) {
                                    return `Patient: ${singleHc.toFixed(1)} cm at ${singleAge}m (${singleP.toFixed(1)}th centile, Z: ${singleZ.toFixed(2)} SD)`;
                                }
                                return `${context.dataset.label}: ${context.parsed.y} cm`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        min: 0,
                        max: 60,
                        title: {
                            display: true,
                            text: 'Age (months)',
                            color: '#94a3b8',
                            font: { family: 'Outfit', size: 12, weight: 'bold' }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#94a3b8', font: { family: 'Outfit', size: 11 } }
                    },
                    y: {
                        min: 30,
                        max: 56,
                        title: {
                            display: true,
                            text: 'Head Circumference (cm)',
                            color: '#94a3b8',
                            font: { family: 'Outfit', size: 12, weight: 'bold' }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: {
                            color: '#94a3b8',
                            callback: function(value) { return value.toFixed(0) + ' cm'; },
                            font: { family: 'Outfit', size: 11 }
                        }
                    }
                }
            }
        });
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

        if (btnAddHcRow) {
            btnAddHcRow.addEventListener('click', () => {
                createHcRow();
                if (hcRowsCount) hcRowsCount.textContent = hcTimePoints.length;
            });
        }

        btnReset.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all data for all three calculators?')) {
                initApp();
            }
        });

        btnSample.addEventListener('click', loadSampleCases);

        btnPrint.addEventListener('click', () => {
            document.querySelectorAll('input').forEach(input => {
                input.setAttribute('value', input.value);
            });
            document.querySelectorAll('select').forEach(select => {
                Array.from(select.options).forEach(opt => opt.removeAttribute('selected'));
                if (select.options[select.selectedIndex]) {
                    select.options[select.selectedIndex].setAttribute('selected', 'selected');
                }
            });
            window.print();
        });

        if (unitSelect) {
            unitSelect.addEventListener('change', () => {
                updateCiUIAndAnalytics();
                updateCvaiUIAndAnalytics();
            });
        }

        cvaiDenominatorSelect.addEventListener('change', () => {
            recalculateAllCvaiRows();
        });

        // Tab 3 Submit & Event Handlers
        if (btnHcSubmit) {
            btnHcSubmit.addEventListener('click', () => {
                handleSingleHcCalculation();
                hcTimePoints.forEach(tp => handleHcRowUpdate(tp.id));
            });
        }

        document.querySelectorAll('input[name="top-hc-gender-radio"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const val = radio.value;
                const matchTabRadio = document.querySelector(`input[name="hc-gender-radio"][value="${val}"]`);
                if (matchTabRadio) matchTabRadio.checked = true;
                handleSingleHcCalculation();
            });
        });

        document.querySelectorAll('input[name="hc-gender-radio"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const val = radio.value;
                const matchTopRadio = document.querySelector(`input[name="top-hc-gender-radio"][value="${val}"]`);
                if (matchTopRadio) matchTopRadio.checked = true;
                handleSingleHcCalculation();
                hcTimePoints.forEach(tp => handleHcRowUpdate(tp.id));
            });
        });

        if (hcAgeMonthsInput) hcAgeMonthsInput.addEventListener('input', handleSingleHcCalculation);
        if (hcValueCmInput) hcValueCmInput.addEventListener('input', handleSingleHcCalculation);

        if (headCircumferenceInput && hcValueCmInput) {
            headCircumferenceInput.addEventListener('input', () => {
                hcValueCmInput.value = headCircumferenceInput.value;
                handleSingleHcCalculation();
            });
            hcValueCmInput.addEventListener('input', () => {
                headCircumferenceInput.value = hcValueCmInput.value;
            });
        }

        if (topHcAgeInput && hcAgeMonthsInput) {
            topHcAgeInput.addEventListener('input', () => {
                hcAgeMonthsInput.value = topHcAgeInput.value;
                handleSingleHcCalculation();
            });
            hcAgeMonthsInput.addEventListener('input', () => {
                topHcAgeInput.value = hcAgeMonthsInput.value;
            });
        }

        window.submitTopHcForm = function(e) {
            if (e && e.preventDefault) e.preventDefault();

            const topAge = document.getElementById('top-hc-age');
            const topHc = document.getElementById('head-circumference');
            const hcAge = document.getElementById('hc-age-months');
            const hcVal = document.getElementById('hc-value-cm');

            if (topAge && topAge.value !== '' && hcAge) {
                hcAge.value = topAge.value;
            }
            if (topHc && topHc.value !== '' && hcVal) {
                hcVal.value = topHc.value;
            }
            if (hcAge && hcAge.value !== '' && topAge) {
                topAge.value = hcAge.value;
            }
            if (hcVal && hcVal.value !== '' && topHc) {
                topHc.value = hcVal.value;
            }

            // Click Tab 3 button natively to trigger clean tab navigation
            const hcTabBtn = document.querySelector('button[data-tab="tab-hc"]') || document.getElementById('tab-btn-hc');
            if (hcTabBtn) {
                hcTabBtn.click();
            }

            handleSingleHcCalculation();
            hcTimePoints.forEach(tp => handleHcRowUpdate(tp.id));

            setTimeout(() => {
                const sortedValid = hcTimePoints.filter(tp => tp.ageMonths !== null && tp.hcCm !== null);
                sortedValid.sort((a, b) => a.ageMonths - b.ageMonths);
                renderHcGrowthChart(sortedValid, getSelectedHcGender());

                const chartContainerEl = document.getElementById('hc-chart-container');
                if (chartContainerEl) {
                    chartContainerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    const hcTabEl = document.getElementById('tab-hc');
                    if (hcTabEl) hcTabEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 60);
        };

        if (btnTopHcSubmit) {
            btnTopHcSubmit.addEventListener('click', window.submitTopHcForm);
        }
    }

    // --- LOAD SAMPLE CASES FOR ALL THREE TABS ---
    function loadSampleCases() {
        document.getElementById('patient-id').value = 'CRN-90412';
        document.getElementById('patient-name').value = 'M.K. (Plagiocephaly & Brachycephaly)';
        scanModalityInput.value = 'CT head';
        if (headCircumferenceInput) headCircumferenceInput.value = '41.5';
        if (unitSelect) unitSelect.value = 'mm';

        const today = new Date();
        const d1 = new Date(today); d1.setMonth(d1.getMonth() - 6);
        const d2 = new Date(today); d2.setMonth(d2.getMonth() - 3);
        const d3 = new Date(today);

        const formatDate = d => d.toISOString().split('T')[0];
        if (headCircDateInput) headCircDateInput.value = formatDate(d1);

        // 1. Populate CI Tab Sample Case
        ciTableBody.innerHTML = '';
        ciTimePoints = [];
        createCiRow(formatDate(d1), 'Pre-Op Baseline', '122.0', '142.0');
        createCiRow(formatDate(d2), '3m Post-Treatment', '124.0', '151.0');
        createCiRow(formatDate(d3), '6m Final Follow-up', '126.0', '156.0');
        ciRowsCount.textContent = ciTimePoints.length;
        updateCiUIAndAnalytics();

        // 2. Populate CVAI Tab Sample Case
        cvaiTableBody.innerHTML = '';
        cvaiTimePoints = [];
        createCvaiRow(formatDate(d1), 'Pre-Helmet Baseline', '132.0', '145.0');
        createCvaiRow(formatDate(d2), '3m Post-Helmet Therapy', '138.0', '144.0');
        createCvaiRow(formatDate(d3), '6m Final Follow-up', '142.0', '145.0');
        cvaiRowsCount.textContent = cvaiTimePoints.length;
        updateCvaiUIAndAnalytics();

        // 3. Populate Head Circumference Centile Tab Sample Case
        const boyRadio = document.querySelector('input[name="hc-gender-radio"][value="boy"]');
        if (boyRadio) boyRadio.checked = true;
        if (hcAgeMonthsInput) hcAgeMonthsInput.value = '6.0';
        if (hcValueCmInput) hcValueCmInput.value = '43.5';
        handleSingleHcCalculation();

        if (hcTableBody) {
            hcTableBody.innerHTML = '';
            hcTimePoints = [];
            createHcRow(formatDate(d1), 'Birth Baseline', '0.0', '34.5');
            createHcRow(formatDate(d2), '3m Check', '3.0', '40.5');
            createHcRow(formatDate(d3), '6m Check', '6.0', '43.5');
            if (hcRowsCount) hcRowsCount.textContent = hcTimePoints.length;
            updateHcUIAndAnalytics();
        }
    }
});

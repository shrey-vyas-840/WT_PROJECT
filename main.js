
function buildFuelInputs() {
        if (!electricityCalculator) return;

        const vehicleTypes = [
            { value: 'car_petrol', label: 'Car (Petrol)' },
            { value: 'car_diesel', label: 'Car (Diesel)' },
            { value: 'bike_petrol', label: 'Bike (Petrol)' },
            { value: 'bus_diesel', label: 'Bus (Diesel)' },
            { value: 'truck_diesel', label: 'Truck (Diesel)' },
            { value: 'auto_cng', label: 'Auto (CNG)' },
            { value: 'generator_diesel', label: 'Generator (Diesel)' },
            { value: 'lpg_stove', label: 'LPG Stove' }
        ];

        let html = `
            <div class="fuel-vehicles-section">
                <label for="numVehicles">How many vehicles do you have in total?</label>
                <input type="number" id="numVehicles" min="1" value="1" style="width:60px; margin-left:8px;">
                <div class="vehicle-list" id="vehicleList"></div>
                <button type="button" class="add-vehicle-btn" id="addVehicleBtn">+ Add Vehicle</button>
            </div>
        `;
        electricityCalculator.innerHTML = html;

        const numVehiclesInput = document.getElementById('numVehicles');
        const vehicleList = document.getElementById('vehicleList');
        const addVehicleBtn = document.getElementById('addVehicleBtn');

        function renderVehicles() {
            const num = parseInt(numVehiclesInput.value) || 1;
            let vehicleCards = '';
            for (let i = 0; i < num; i++) {
                vehicleCards += `
                <div class="vehicle-card" data-index="${i}">
                    <label>Type:
                        <select class="vehicle-type">
                            ${vehicleTypes.map(v => `<option value="${v.value}">${v.label}</option>`).join('')}
                        </select>
                    </label>
                    <label>Units:
                        <input type="number" class="vehicle-units" min="1" value="1" style="width:60px;">
                    </label>
                    <label>Usage:
                        <input type="number" class="vehicle-usage" min="0" value="0" style="width:80px;">
                        <select class="vehicle-usage-type">
                            <option value="distance">km</option>
                            <option value="hours">hours</option>
                        </select>
                    </label>
                    <label>Period:
                        <select class="vehicle-period">
                            <option value="day">per day</option>
                            <option value="week">per week</option>
                            <option value="month">per month</option>
                        </select>
                    </label>
                    <button type="button" class="remove-vehicle-btn" title="Remove Vehicle">&times;</button>
                </div>
                `;
            }
            vehicleList.innerHTML = vehicleCards;
        }

        renderVehicles();

        numVehiclesInput.addEventListener('input', () => {
            renderVehicles();
        });

        addVehicleBtn.addEventListener('click', () => {
            numVehiclesInput.value = parseInt(numVehiclesInput.value) + 1;
            renderVehicles();
        });

        vehicleList.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-vehicle-btn')) {
                const card = e.target.closest('.vehicle-card');
                card.remove();
                // Update numVehicles to match cards
                numVehiclesInput.value = vehicleList.querySelectorAll('.vehicle-card').length;
            }
        });
    }

    function calculateFuelEmissions() {
        const vehicleCards = document.querySelectorAll('.vehicle-card');
        const factors = {
            car_petrol: { mileage: 15, ef: 2.31, unit: "litre" },
            car_diesel: { mileage: 20, ef: 2.68, unit: "litre" },
            bike_petrol: { mileage: 40, ef: 2.31, unit: "litre" },
            bus_diesel: { mileage: 5, ef: 2.68, unit: "litre" },
            truck_diesel: { mileage: 4, ef: 2.68, unit: "litre" },
            auto_cng: { mileage: 25, ef: 2.75, unit: "kg" },
            generator_diesel: { fuelPerHour: 2.5, ef: 2.68, unit: "litre" },
            lpg_stove: { fuelPerHour: 0.08, ef: 1.51, unit: "kg" }
        };

        let totalFuel = 0;
        let totalEmissions = 0;
        let details = [];

        vehicleCards.forEach(card => {
            const type = card.querySelector('.vehicle-type').value;
            const units = parseInt(card.querySelector('.vehicle-units').value) || 1;
            const usage = parseFloat(card.querySelector('.vehicle-usage').value) || 0;
            const usageType = card.querySelector('.vehicle-usage-type').value;
            const period = card.querySelector('.vehicle-period').value;
            const f = factors[type];
            let fuel = 0;

            if (usageType === 'distance') {
                fuel = usage / (f.mileage || 1);
            } else if (usageType === 'hours') {
                fuel = usage * (f.fuelPerHour || 1);
            }

            let multiplier = 1;
            if (period === "day") multiplier = 30;
            if (period === "week") multiplier = 4.3;

            fuel *= multiplier * units;
            const emissions = fuel * f.ef;

            totalFuel += fuel;
            totalEmissions += emissions;
            details.push({ type, units, usage, usageType, period, fuel, emissions });
        });

        resultsContainer.innerHTML = `
            <div class='results-section'>
                <h3>Vehicle Fuel Emissions Results</h3>
                <div class='results-grid'>
                    <div class='result-card'>
                        <div class='result-label'>Total Fuel Used</div>
                        <div class='result-value'>${totalFuel.toFixed(2)}</div>
                        <div class='result-unit'>litres/kg/month</div>
                    </div>
                    <div class='result-card'>
                        <div class='result-label'>Total CO₂ Emissions</div>
                        <div class='result-value'>${totalEmissions.toFixed(2)}</div>
                        <div class='result-unit'>kg CO₂/month</div>
                    </div>
                </div>
                <div style='margin-top:1.5rem;'>
                    <table class='results-table'>
                        <thead>
                            <tr><th>Type</th><th>Units</th><th>Usage</th><th>Fuel</th><th>CO₂ (kg)</th></tr>
                        </thead>
                        <tbody>
                        ${details.map(d => `
                            <tr>
                                <td>${d.type.replace(/_/g, ' ').toUpperCase()}</td>
                                <td>${d.units}</td>
                                <td>${d.usage} ${d.usageType === 'distance' ? 'km' : 'hr'} / ${d.period}</td>
                                <td>${d.fuel.toFixed(2)}</td>
                                <td>${d.emissions.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        saveResultsToBackend([{ type: 'fuel', totalFuel, totalEmissions, details, date: new Date().toISOString() }]);
    }
// Initialize calculator functionality

// Make APPLIANCES global so all functions can access it
const APPLIANCES = {
    led: { name: 'LED Bulb', watt: 9, defaultHours: 4 },
    tube: { name: 'Tube Light', watt: 20, defaultHours: 5 },
    fan: { name: 'Ceiling Fan', watt: 70, defaultHours: 8 },
    ac: { name: 'Air Conditioner', watt: 1500, defaultHours: 6 },
    fridge: { name: 'Refrigerator', watt: 150, defaultHours: 24 },
    microwave: { name: 'Microwave Oven', watt: 1200, defaultHours: 0.5 },
    induction: { name: 'Induction Cooktop', watt: 1800, defaultHours: 1 },
    geyser: { name: 'Electric Geyser', watt: 2000, defaultHours: 1 },
    tv: { name: 'Television', watt: 80, defaultHours: 3 },
    laptop: { name: 'Laptop', watt: 60, defaultHours: 6 },
    desktop: { name: 'Desktop Computer', watt: 200, defaultHours: 4 },
    router: { name: 'WiFi Router', watt: 10, defaultHours: 24 }
};

document.addEventListener('DOMContentLoaded', setup);

function setup() {

    // Helper to re-attach listeners after dynamic content
    function attachCategoryListeners() {
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');
                // Remove active class from all buttons
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // Show calculate button
                const calculateBtn = document.getElementById('calculateBtn');
                if (calculateBtn) calculateBtn.style.display = 'block';
                // Clear previous content
                const electricityCalculator = document.getElementById('electricityCalculator');
                const resultsContainer = document.getElementById('resultsContainer');
                if (electricityCalculator) electricityCalculator.innerHTML = '';
                if (resultsContainer) resultsContainer.innerHTML = '';
                // Show appropriate calculator
                switch(category) {
                    case 'electricity': buildElectricityInputs(); break;
                    case 'water': buildWaterInputs(); break;
                    case 'building': buildBuildingInputs(); break;
                    case 'fuel': buildFuelInputs(); break;
                    case 'overall': buildOverallInputs(); break;
                }
                // Re-attach listeners after rendering
                setTimeout(() => { attachCategoryListeners(); attachCalculateListener(); }, 0);
            });
        });
    }
    function attachCalculateListener() {
        const calculateBtn = document.getElementById('calculateBtn');
        if (calculateBtn) {
            calculateBtn.onclick = () => {
                const activeCategory = document.querySelector('.category-btn.active');
                if (activeCategory) {
                    calculateEmissions(activeCategory.getAttribute('data-category'));
                }
            };
        }
    }
    attachCategoryListeners();
    attachCalculateListener();

    // Calculator building functions
    function buildElectricityInputs() {
        if (!electricityCalculator) return;

        let html = `
            <div class="electricity-calculator">
                <div class="electricity-header">
                    <h3>Electricity Usage Calculator</h3>
                    <p>Select your appliances and customize their usage patterns</p>
                </div>
                <div style="margin-bottom:1rem;">
                    <label style="font-weight:600;">Do you want to change the wattage for your appliances?</label>
                    <button type="button" id="editWattsAllBtn" class="btn btn-secondary" style="margin-left:1rem;">Edit Watts for All</button>
                    <button type="button" id="keepDefaultWattsBtn" class="btn btn-secondary" style="margin-left:0.5rem;">Keep Default</button>
                </div>
                <div class="appliance-groups">
        `;

        // Group appliances by category with icons
        const groups = {
            'Lighting': {
                icon: '💡',
                items: ['led', 'tube']
            },
            'Cooling': {
                icon: '❄️',
                items: ['fan', 'ac']
            },
            'Kitchen': {
                icon: '🍳',
                items: ['fridge', 'microwave', 'induction', 'geyser']
            },
            'Electronics': {
                icon: '🖥️',
                items: ['tv', 'laptop', 'desktop', 'router']
            }
        };

        // Generate appliance groups
        Object.entries(groups).forEach(([groupName, { icon, items }]) => {
            html += `
                <div class="appliance-group">
                    <div class="appliance-group-header">
                        <span class="appliance-group-icon">${icon}</span>
                        <h4 class="appliance-group-title">${groupName}</h4>
                    </div>
            `;

            items.forEach(id => {
                const app = APPLIANCES[id];
                html += `
                    <div class="appliance-item" id="container_${id}">
                        <div class="appliance-header">
                            <label class="appliance-name">
                                <input type="checkbox" id="select_${id}" data-app="${id}">
                                ${app.name}
                            </label>
                            <span class="appliance-watts"><input type="number" id="watt_${id}" class="appliance-watt-input" value="${app.watt}" min="1" style="width:60px;" readonly>W</span>
                        </div>
                        <div class="appliance-controls" style="display: none;">
                            <div class="control-group">
                                <label class="control-label" for="units_${id}">Units</label>
                                <input type="number" id="units_${id}" class="appliance-input" value="1" min="1">
                            </div>
                            <div class="control-group">
                                <label class="control-label" for="hours_${id}">Hours/day: <span id="hours_display_${id}">${app.defaultHours}</span></label>
                                <input type="range" id="hours_${id}" class="hours-slider" 
                                       min="0" max="24" step="0.5" value="${app.defaultHours}">
                            </div>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
        });

        html += `
                </div>
            </div>
        `;

        electricityCalculator.innerHTML = html;

        // Add event listeners
        Object.keys(APPLIANCES).forEach(id => {
            const checkbox = document.getElementById('select_' + id);
            const controls = document.querySelector(`#container_${id} .appliance-controls`);
            const hoursSlider = document.getElementById('hours_' + id);
            const hoursDisplay = document.getElementById('hours_display_' + id);
            const wattInput = document.getElementById('watt_' + id);

            if (checkbox && controls) {
                checkbox.addEventListener('change', () => {
                    controls.style.display = checkbox.checked ? 'grid' : 'none';
                    if (checkbox.checked) {
                        controls.style.animation = 'fadeInUp 0.3s cubic-bezier(.77,0,.18,1)';
                    }
                });
            }

            if (hoursSlider && hoursDisplay) {
                hoursSlider.addEventListener('input', () => {
                    hoursDisplay.textContent = hoursSlider.value;
                });
            }

            // Listen for watt input changes
            if (wattInput) {
                wattInput.addEventListener('input', () => {
                    APPLIANCES[id].watt = parseInt(wattInput.value) || APPLIANCES[id].watt;
                });
            }
        });

        // Edit all watts or keep default
        const editWattsAllBtn = document.getElementById('editWattsAllBtn');
        const keepDefaultWattsBtn = document.getElementById('keepDefaultWattsBtn');
        if (editWattsAllBtn) {
            editWattsAllBtn.addEventListener('click', () => {
                Object.keys(APPLIANCES).forEach(id => {
                    const wattInput = document.getElementById('watt_' + id);
                    if (wattInput) wattInput.removeAttribute('readonly');
                });
            });
        }
        if (keepDefaultWattsBtn) {
            keepDefaultWattsBtn.addEventListener('click', () => {
                Object.keys(APPLIANCES).forEach(id => {
                    const wattInput = document.getElementById('watt_' + id);
                    if (wattInput) {
                        wattInput.value = APPLIANCES[id].watt;
                        wattInput.setAttribute('readonly', 'readonly');
                    }
                });
            });
        }
    }

    function updateApplianceInputs() {
        const inputsContainer = document.getElementById('applianceInputs');
        if (!inputsContainer) return;

        let html = '';
        
        Object.keys(APPLIANCES).forEach(id => {
            const checkbox = document.getElementById('select_' + id);
            if (checkbox && checkbox.checked) {
                const app = APPLIANCES[id];
                html += `
                    <div class="improved-appliance-input">
                        <span class="appliance-label">
                            ${app.name}
                            <span class="appliance-watt">(${app.watt}W)</span>
                        </span>
                        <label>
                            Units:
                            <input type="number" id="units_${id}" value="1" min="1" class="appliance-units">
                        </label>
                        <label>
                            Hours/day:
                            <input type="range" id="hours_${id}" min="0" max="24" step="0.5" 
                                   value="${app.defaultHours}" class="appliance-hours-slider">
                            <span id="hours_display_${id}">${app.defaultHours}</span>
                        </label>
                    </div>
                `;
            }
        });

        inputsContainer.innerHTML = html;

        // Add listeners for hour sliders
        Object.keys(APPLIANCES).forEach(id => {
            const slider = document.getElementById('hours_' + id);
            const display = document.getElementById('hours_display_' + id);
            if (slider && display) {
                slider.addEventListener('input', () => {
                    display.textContent = slider.value;
                });
            }
        });
    }

    function buildWaterInputs() {
        if (!electricityCalculator) return;

        // Indian states array for dropdown
        const indianStates = [
            "Andaman & Nicobar", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
            "Chandigarh", "Chhattisgarh", "Dadra & Nagar Haveli", "Daman & Diu", "Delhi", 
            "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu & Kashmir", "Jharkhand", 
            "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", 
            "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", 
            "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
            "Uttarakhand", "West Bengal"
        ];

        electricityCalculator.innerHTML = `
            <div class="calculator-section">
                <div class="section-header">
                    <h3>Water Usage Calculator</h3>
                    <p class="section-description">Calculate your water-related carbon emissions</p>
                </div>
                <div class="water-form">
                    <div class="form-group">
                        <label for="waterState">Which state/UT are you in?</label>
                        <select id="waterState" class="form-control">
                            <option value="">Select your state</option>
                            ${indianStates.map(state => `<option value="${state}">${state}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="waterAmount">How much water did you use?</label>
                        <div class="input-with-unit">
                            <input type="number" id="waterAmount" class="form-control" min="0" step="0.01" required>
                            <select id="waterUnit" class="form-control">
                                <option value="litres">Litres</option>
                                <option value="m3">Cubic Meters (m³)</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="waterPeriod">When was this used?</label>
                        <div class="date-inputs">
                            <input type="month" id="waterPeriod" class="form-control" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="includeWastewater">
                            Include wastewater treatment?
                            <span class="tooltip" title="If your household is connected to sewerage or the utility treats sewage, choose Yes.">ⓘ</span>
                        </label>
                    </div>

                    <div class="advanced-settings">
                        <button type="button" id="showAdvanced" class="btn-link">Edit assumptions ▼</button>
                        <div id="advancedOptions" style="display: none;">
                            <div class="form-group">
                                <label for="energyIntensity">Energy intensity (kWh per m³)</label>
                                <input type="number" id="energyIntensity" class="form-control" step="0.01">
                            </div>
                            <div class="form-group">
                                <label for="emissionFactor">Electricity emission factor (kg CO₂/kWh)</label>
                                <input type="number" id="emissionFactor" class="form-control" step="0.001" value="0.716">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listener for advanced settings toggle
        const showAdvancedBtn = document.getElementById('showAdvanced');
        const advancedOptions = document.getElementById('advancedOptions');
        if (showAdvancedBtn && advancedOptions) {
            showAdvancedBtn.addEventListener('click', () => {
                advancedOptions.style.display = advancedOptions.style.display === 'none' ? 'block' : 'none';
                showAdvancedBtn.textContent = advancedOptions.style.display === 'none' ? 'Edit assumptions ▼' : 'Hide assumptions ▲';
            });
        }

        // Add event listener for state selection to update energy intensity
        const waterState = document.getElementById('waterState');
        const energyIntensity = document.getElementById('energyIntensity');
        if (waterState && energyIntensity) {
            const stateEnergyIntensity = {
                'Andhra Pradesh': 0.45,
                'Arunachal Pradesh': 0.40,
                'Assam': 0.50,
                'Bihar': 0.60,
                'Chhattisgarh': 0.55,
                'Goa': 0.35,
                'Gujarat': 0.55,
                'Haryana': 0.50,
                'Himachal Pradesh': 0.45,
                'Jammu & Kashmir': 0.45,
                'Jharkhand': 0.60,
                'Karnataka': 0.55,
                'Kerala': 0.40,
                'Ladakh': 0.70,
                'Lakshadweep': 0.80,
                'Madhya Pradesh': 0.55,
                'Maharashtra': 0.60,
                'Manipur': 0.45,
                'Meghalaya': 0.45,
                'Mizoram': 0.45,
                'Nagaland': 0.45,
                'Odisha': 0.55,
                'Puducherry': 0.50,
                'Punjab': 0.50,
                'Rajasthan': 0.70,
                'Sikkim': 0.40,
                'Tamil Nadu': 0.55,
                'Telangana': 0.55,
                'Tripura': 0.45,
                'Uttar Pradesh': 0.60,
                'Uttarakhand': 0.50,
                'West Bengal': 0.55
            };

            waterState.addEventListener('change', () => {
                const state = waterState.value;
                energyIntensity.value = stateEnergyIntensity[state] || 0.5; // Default to 0.5 if state not found
            });
        }
    }
    }

    function buildBuildingInputs() {
        if (!electricityCalculator) return;

        electricityCalculator.innerHTML = `
            <div class="calculator-section">
                <div class="section-header">
                    <h3>Green Building Score Calculator</h3>
                    <p class="section-description">Answer "Yes" or "No" to each question. Each "Yes" = 1 point. Total score out of 10.</p>
                </div>
                <div class="building-checklist">
                    <div class="checklist-item">
                        <h4>1. Energy Efficiency</h4>
                        <p>Does your home/building have energy-saving features like LED lights, good insulation, or energy-efficient appliances?</p>
                        <div class="radio-group">
                            <label><input type="radio" name="energy" value="yes"> Yes</label>
                            <label><input type="radio" name="energy" value="no"> No</label>
                        </div>
                    </div>
                    <div class="checklist-item">
                        <h4>2. Renewable Energy</h4>
                        <p>Do you use renewable energy sources (solar panels, solar water heater, wind, etc.)?</p>
                        <div class="radio-group">
                            <label><input type="radio" name="renewable" value="yes"> Yes</label>
                            <label><input type="radio" name="renewable" value="no"> No</label>
                        </div>
                    </div>
                    <div class="checklist-item">
                        <h4>3. Water Conservation</h4>
                        <p>Do you have water-saving fixtures (low-flow taps, dual-flush toilets, rainwater harvesting)?</p>
                        <div class="radio-group">
                            <label><input type="radio" name="water" value="yes"> Yes</label>
                            <label><input type="radio" name="water" value="no"> No</label>
                        </div>
                    </div>
                    <div class="checklist-item">
                        <h4>4. Waste Management</h4>
                        <p>Do you recycle or compost home/building waste?</p>
                        <div class="radio-group">
                            <label><input type="radio" name="waste" value="yes"> Yes</label>
                            <label><input type="radio" name="waste" value="no"> No</label>
                        </div>
                    </div>
                    <div class="checklist-item">
                        <h4>5. Healthy Indoor Air</h4>
                        <p>Do you use low-VOC paints and non-toxic materials indoors?</p>
                        <div class="radio-group">
                            <label><input type="radio" name="air" value="yes"> Yes</label>
                            <label><input type="radio" name="air" value="no"> No</label>
                        </div>
                    </div>
                    <div class="checklist-item">
                        <h4>6. Green Materials</h4>
                        <p>Was your home/building built or renovated using eco-friendly or recycled materials?</p>
                        <div class="radio-group">
                            <label><input type="radio" name="materials" value="yes"> Yes</label>
                            <label><input type="radio" name="materials" value="no"> No</label>
                        </div>
                    </div>
                    <div class="checklist-item">
                        <h4>7. Smart Controls</h4>
                        <p>Do you use smart thermostats, sensors, or automation to reduce energy use?</p>
                        <div class="radio-group">
                            <label><input type="radio" name="smart" value="yes"> Yes</label>
                            <label><input type="radio" name="smart" value="no"> No</label>
                        </div>
                    </div>
                    <div class="checklist-item">
                        <h4>8. Local Sourcing</h4>
                        <p>Were most building materials sourced locally (within 200 km)?</p>
                        <div class="radio-group">
                            <label><input type="radio" name="local" value="yes"> Yes</label>
                            <label><input type="radio" name="local" value="no"> No</label>
                        </div>
                    </div>
                    <div class="checklist-item">
                        <h4>9. Green Landscaping</h4>
                        <p>Does your property have native plants, green roofs, or permeable paving?</p>
                        <div class="radio-group">
                            <label><input type="radio" name="landscape" value="yes"> Yes</label>
                            <label><input type="radio" name="landscape" value="no"> No</label>
                        </div>
                    </div>
                    <div class="checklist-item">
                        <h4>10. Transport & Community</h4>
                        <p>Is your home/building close to public transport, bike paths, or walkable services?</p>
                        <div class="radio-group">
                            <label><input type="radio" name="transport" value="yes"> Yes</label>
                            <label><input type="radio" name="transport" value="no"> No</label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ...existing code...

    function buildOverallInputs() {
                if (!electricityCalculator) return;

                electricityCalculator.innerHTML = `
                <div class="report-section" style="background:#f5fff7; border-radius:16px; box-shadow:0 4px 16px #43e97b11; padding:2.5rem 2rem; max-width:700px; margin:0 auto;">
                    <h3 style="color:#23413f; margin-bottom:1.2rem;">Comprehensive Carbon Emission Report</h3>
                    <form id="reportForm" style="display:flex; flex-direction:column; gap:1.2rem;">
                        <label style="font-weight:600;">1. Number of People
                            <span style="font-weight:400; color:#388e3c; display:block; font-size:0.98rem;">How many people live in your home or work in your organization?<br>Example: If you have 4 family members, write “4”.</span>
                            <input type="number" id="numPeople" min="1" required style="margin-top:0.4rem; padding:0.7rem; border-radius:8px; border:1.5px solid #b2dfdb;">
                        </label>
                        <label style="font-weight:600;">2. Electricity Use
                            <span style="font-weight:400; color:#388e3c; display:block; font-size:0.98rem;">What was the last highest electricity bill do you use remember?<br>Check your electricity bill for “units” or “kWh” used per month.<br>Example: If your bill says 250 units or kWh per month, enter “250”.</span>
                            <input type="number" id="electricityKwh" min="0" required style="margin-top:0.4rem; padding:0.7rem; border-radius:8px; border:1.5px solid #b2dfdb;">
                        </label>
                        <label style="font-weight:600;">3. Cooking Fuel
                            <span style="font-weight:400; color:#388e3c; display:block; font-size:0.98rem;">Which fuel do you use for cooking? (Pick one or more)</span>
                            <div style="margin-top:0.4rem; display:flex; gap:1.2rem; flex-wrap:wrap;">
                                <label>LPG/Cooking Gas: <input type="number" id="lpgCylinders" min="0" placeholder="Cylinders/month" style="width:110px; border-radius:8px; border:1.5px solid #b2dfdb; padding:0.5rem;"></label>
                                <label>PNG (Piped Gas): <input type="number" id="pngUnits" min="0" placeholder="Units/month" style="width:110px; border-radius:8px; border:1.5px solid #b2dfdb; padding:0.5rem;"></label>
                                <label>Induction/Electric: <input type="checkbox" id="inductionElectric"></label>
                            </div>
                        </label>
                        <label style="font-weight:600;">4. Vehicle Use
                            <span style="font-weight:400; color:#388e3c; display:block; font-size:0.98rem;">How many kilometers do you drive per month (all vehicles together)?<br>Example: If you drive 20 km/day and 25 days/month = 500 km/month</span>
                            <input type="number" id="vehicleKm" min="0" style="margin-top:0.4rem; padding:0.7rem; border-radius:8px; border:1.5px solid #b2dfdb;">
                            <select id="vehicleType" style="margin-top:0.4rem; border-radius:8px; border:1.5px solid #b2dfdb; padding:0.5rem;">
                                <option value="petrol">Petrol Car</option>
                                <option value="diesel">Diesel Car</option>
                                <option value="bike">Bike/Scooter</option>
                                <option value="electric">Electric Vehicle</option>
                            </select>
                        </label>
                        <label style="font-weight:600;">5. Public Transport
                            <span style="font-weight:400; color:#388e3c; display:block; font-size:0.98rem;">How many kilometers do you travel by bus, train, or metro per month?</span>
                            <input type="number" id="publicKm" min="0" style="margin-top:0.4rem; padding:0.7rem; border-radius:8px; border:1.5px solid #b2dfdb;">
                            <select id="publicType" style="margin-top:0.4rem; border-radius:8px; border:1.5px solid #b2dfdb; padding:0.5rem;">
                                <option value="bus">Bus</option>
                                <option value="train">Train/Metro</option>
                            </select>
                        </label>
                        <label style="font-weight:600;">6. Flights
                            <span style="font-weight:400; color:#388e3c; display:block; font-size:0.98rem;">How many flights do you take per year?</span>
                            <input type="number" id="shortFlights" min="0" placeholder="Short (<1000km)" style="margin-top:0.4rem; width:110px; border-radius:8px; border:1.5px solid #b2dfdb; padding:0.5rem;">
                            <input type="number" id="longFlights" min="0" placeholder="Long (>1000km)" style="margin-top:0.4rem; width:110px; border-radius:8px; border:1.5px solid #b2dfdb; padding:0.5rem;">
                        </label>
                        <label style="font-weight:600;">7. Water Use
                            <span style="font-weight:400; color:#388e3c; display:block; font-size:0.98rem;">How much water do you use per month? (Check your water bill or estimate in litres)</span>
                            <input type="number" id="waterLitres" min="0" style="margin-top:0.4rem; padding:0.7rem; border-radius:8px; border:1.5px solid #b2dfdb;">
                        </label>
                        <label style="font-weight:600;">8. Waste Generation
                            <span style="font-weight:400; color:#388e3c; display:block; font-size:0.98rem;">How much garbage do you throw away per week (in kg)?<br>Example: 2 dustbins/week, each ~5 kg = 10 kg/week</span>
                            <input type="number" id="wasteKg" min="0" style="margin-top:0.4rem; padding:0.7rem; border-radius:8px; border:1.5px solid #b2dfdb;">
                        </label>
                        <label style="font-weight:600;">9. Shopping & Food
                            <span style="font-weight:400; color:#388e3c; display:block; font-size:0.98rem;">How much do you spend on shopping (clothes, electronics, etc.) per month (in ₹ or $)?<br>How often do you eat meat or dairy?</span>
                            <input type="number" id="shoppingSpend" min="0" placeholder="₹/month" style="margin-top:0.4rem; width:110px; border-radius:8px; border:1.5px solid #b2dfdb; padding:0.5rem;">
                            <select id="dietType" style="margin-top:0.4rem; border-radius:8px; border:1.5px solid #b2dfdb; padding:0.5rem;">
                                <option value="veg">Vegetarian</option>
                                <option value="nonveg">Non-vegetarian</option>
                            </select>
                        </label>
                        <div style="margin-top:1.5rem; color:#23413f; font-size:1.08rem; background:#e0ffe7; border-radius:8px; padding:1.2rem;">
                            <b>Calculation Guide:</b><br>
                            1 kWh = 0.82 kg CO₂<br>
                            1 LPG cylinder = 42.5 kg CO₂<br>
                            1 unit PNG (SCM) = 1.9 kg CO₂<br>
                            Petrol Car: 0.19 kg CO₂/km<br>
                            Diesel Car: 0.23 kg CO₂/km<br>
                            Bike/Scooter: 0.09 kg CO₂/km<br>
                            Bus: 0.09 kg CO₂/km<br>
                            Train/Metro: 0.04 kg CO₂/km<br>
                            1,000 litres water = 0.29 kg CO₂<br>
                            1 kg waste = 1.8 kg CO₂<br>
                            ₹1,000 = 5 kg CO₂<br>
                            Vegetarian: 0.5 tCO₂/year per person<br>
                            Non-vegetarian: 1.6 tCO₂/year per person
                        </div>
                    </form>
                </div>
                `;
    }

    function calculateBuildingScore() {
        let score = 0;
        const questions = ['energy', 'renewable', 'water', 'waste', 'air', 'materials', 'smart', 'local', 'landscape', 'transport'];
        
        questions.forEach(q => {
            const radio = document.querySelector(`input[name='${q}'][value='yes']`);
            if (radio && radio.checked) score++;
        });

        let rating = '';
        if (score >= 9) rating = 'Excellent – Your home/building is very green!';
        else if (score >= 7) rating = 'Good – Your home/building is quite eco-friendly.';
        else if (score >= 5) rating = 'Moderate – Some green features, but room for improvement.';
        else if (score >= 3) rating = 'Low – Consider more green upgrades.';
        else rating = 'Poor – High environmental impact, many improvements possible.';

        resultsContainer.innerHTML = `
            <div class='results-section'>
                <h3>Green Building Score Results</h3>
                <div class='score-card' style='text-align: center; padding: 2rem; background: #fff; border-radius: 12px; margin: 1rem 0;'>
                    <div style='font-size: 3rem; color: ${score >= 7 ? '#388e3c' : score >= 5 ? '#fb8c00' : '#e53935'};'>${score}/10</div>
                    <div style='font-size: 1.2rem; color: #23413f; margin: 1rem 0;'>${rating}</div>
                </div>
                <div class='improvement-tips' style='margin-top: 2rem;'>
                    <h4>Improvement Tips:</h4>
                    <ul style='color: #388e3c;'>
                        ${questions.map((q, i) => {
                            const radio = document.querySelector(`input[name='${q}'][value='yes']`);
                            if (!radio || !radio.checked) {
                                const tips = {
                                    energy: 'Consider upgrading to LED lights and energy-efficient appliances.',
                                    renewable: 'Look into installing solar panels or solar water heaters.',
                                    water: 'Install water-saving fixtures and consider rainwater harvesting.',
                                    waste: 'Start composting and implement a recycling system.',
                                    air: 'Use low-VOC paints and materials in your next renovation.',
                                    materials: 'Choose eco-friendly materials for future renovations.',
                                    smart: 'Install smart thermostats and automation systems.',
                                    local: 'Source materials locally for future projects.',
                                    landscape: 'Plant native species and consider permeable paving.',
                                    transport: 'Consider proximity to public transport in future location decisions.'
                                };
                                return `<li>${tips[q]}</li>`;
                            }
                            return '';
                        }).filter(tip => tip).join('')}
                    </ul>
                </div>
            </div>
        `;

        saveResultsToBackend([{
            type: 'building',
            score: score,
            rating: rating,
            date: new Date().toISOString()
        }]);
    }

    function calculateWaterEmissions() {
        const state = document.getElementById('waterState').value;
        const amount = parseFloat(document.getElementById('waterAmount').value) || 0;
        const unit = document.getElementById('waterUnit').value;
        const includeWastewater = document.getElementById('includeWastewater').checked;
        const energyIntensity = parseFloat(document.getElementById('energyIntensity').value) || 0.5;
        const emissionFactor = parseFloat(document.getElementById('emissionFactor').value) || 0.716;

        // Convert to m³ if input is in litres
        const volumeInM3 = unit === 'litres' ? amount / 1000 : amount;

        // Calculate energy and emissions
        let totalEnergyIntensity = energyIntensity;
        if (includeWastewater) {
            const wastewaterEI = {
                'Andhra Pradesh': 0.35, 'Arunachal Pradesh': 0.30, 'Assam': 0.40,
                'Bihar': 0.45, 'Chhattisgarh': 0.40, 'Goa': 0.30, 'Gujarat': 0.35,
                'Haryana': 0.35, 'Himachal Pradesh': 0.30, 'Jammu & Kashmir': 0.30,
                'Jharkhand': 0.45, 'Karnataka': 0.35, 'Kerala': 0.30, 'Ladakh': 0.40,
                'Lakshadweep': 0.50, 'Madhya Pradesh': 0.40, 'Maharashtra': 0.40,
                'Manipur': 0.30, 'Meghalaya': 0.30, 'Mizoram': 0.30, 'Nagaland': 0.30,
                'Odisha': 0.40, 'Puducherry': 0.35, 'Punjab': 0.35, 'Rajasthan': 0.45,
                'Sikkim': 0.30, 'Tamil Nadu': 0.35, 'Telangana': 0.35, 'Tripura': 0.30,
                'Uttar Pradesh': 0.45, 'Uttarakhand': 0.35, 'West Bengal': 0.40
            };
            totalEnergyIntensity += wastewaterEI[state] || 0.35;
        }

        const energyUsed = volumeInM3 * totalEnergyIntensity;
        const emissions = energyUsed * emissionFactor;

        // Display results
        resultsContainer.innerHTML = `
            <div class='results-section'>
                <h3>Water Usage Emissions Results</h3>
                <div class='results-grid'>
                    <div class='result-card'>
                        <div class='result-label'>Water Volume</div>
                        <div class='result-value'>${volumeInM3.toFixed(2)}</div>
                        <div class='result-unit'>m³</div>
                    </div>
                    <div class='result-card'>
                        <div class='result-label'>Energy Used</div>
                        <div class='result-value'>${energyUsed.toFixed(2)}</div>
                        <div class='result-unit'>kWh</div>
                    </div>
                    <div class='result-card'>
                        <div class='result-label'>CO₂ Emissions</div>
                        <div class='result-value'>${emissions < 100 ? emissions.toFixed(2) : (emissions/1000).toFixed(3)}</div>
                        <div class='result-unit'>${emissions < 100 ? 'kg CO₂e' : 'tonnes CO₂e'}</div>
                    </div>
                </div>
                <div class='details-section' style='margin-top: 2rem; padding: 1rem; background: #f5fff7; border-radius: 12px;'>
                    <h4>Calculation Details:</h4>
                    <ul>
                        <li>State: ${state || 'National default'}</li>
                        <li>Energy Intensity: ${totalEnergyIntensity.toFixed(2)} kWh/m³</li>
                        <li>Grid Emission Factor: ${emissionFactor} kg CO₂/kWh</li>
                        <li>Includes Wastewater: ${includeWastewater ? 'Yes' : 'No'}</li>
                    </ul>
                </div>
            </div>
        `;

        saveResultsToBackend([{
            type: 'water',
            volume: volumeInM3,
            energy: energyUsed,
            emissions: emissions,
            state: state,
            includeWastewater: includeWastewater,
            date: new Date().toISOString()
        }]);
    }

    function calculateEmissions(category) {
        if (!resultsContainer) return;

        switch(category) {
            case 'electricity':
                calculateElectricityEmissions();
                break;
            case 'water':
                calculateWaterEmissions();
                break;
            case 'building':
                calculateBuildingScore();
                break;
            case 'fuel':
                calculateFuelEmissions();
                break;
            case 'overall':
                calculateOverallEmissions();
                break;
        }
    }

    function calculateElectricityEmissions() {
        let results = [];
        let totalKwh = 0, totalCo2 = 0;
        const GRID_EF = 0.85; // Grid emission factor

        // Show loading state
        resultsContainer.innerHTML = `
            <div class="results-section" style="text-align: center; padding: 2rem;">
                <div class="loading-spinner" style="margin-bottom: 1rem;">⚡</div>
                <p style="color: #388e3c;">Calculating your electricity consumption...</p>
            </div>
        `;

        Object.keys(APPLIANCES).forEach(id => {
            const checkbox = document.getElementById('select_' + id);
            if (checkbox?.checked) {
                const units = parseInt(document.getElementById('units_' + id)?.value || '1');
                const hours = parseFloat(document.getElementById('hours_' + id)?.value || '0');
                const watt = APPLIANCES[id].watt;

                const kwh = (watt * units * hours * 30) / 1000; // Monthly consumption
                const co2 = kwh * GRID_EF;

                results.push({
                    appliance: APPLIANCES[id].name,
                    units: units,
                    watt: watt,
                    hours: hours,
                    kwh: kwh,
                    co2: co2
                });

                totalKwh += kwh;
                totalCo2 += co2;
            }
        });

        // Show results instantly (remove delay)
        displayResults(results, totalKwh, totalCo2);
        if (results.length > 0) {
            saveResultsToBackend(results);
        }
    }

    function displayResults(results, totalKwh, totalCo2) {
        if (!resultsContainer || !results.length) {
            resultsContainer.innerHTML = `
                <div class="results-section" style="text-align: center; padding: 2rem;">
                    <p style="color: #c62828;">Please select at least one appliance to calculate emissions.</p>
                </div>
            `;
            return;
        }

    const averageMonthlyKwh = 300; // Average household consumption
    let efficiencyScore = 100 - ((totalKwh / averageMonthlyKwh) * 100);
    if (efficiencyScore < 10) efficiencyScore = 10;
    if (efficiencyScore > 100) efficiencyScore = 100;
    efficiencyScore = Math.round(efficiencyScore);

        let html = `
            <div class="results-section">
                <div class="results-header">
                    <h3 class="results-title">Your Electricity Consumption Analysis</h3>
                    <p class="results-subtitle">Here's a detailed breakdown of your energy usage</p>
                </div>

                <div class="results-grid">
                    <div class="result-card">
                        <div class="result-label">Total Monthly Consumption</div>
                        <div class="result-value">${totalKwh.toFixed(1)}</div>
                        <div class="result-unit">kWh/month</div>
                    </div>

                    <div class="result-card">
                        <div class="result-label">CO₂ Emissions</div>
                        <div class="result-value">${totalCo2.toFixed(1)}</div>
                        <div class="result-unit">kg CO₂/month</div>
                    </div>

                    <div class="result-card">
                        <div class="result-label">Efficiency Score</div>
                        <div class="result-value" style="color: ${efficiencyScore > 50 ? '#388e3c' : '#c62828'}">
                            ${efficiencyScore.toFixed(0)}%
                        </div>
                        <div class="result-unit">vs. avg. household</div>
                    </div>
                </div>

                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Appliance</th>
                            <th>Units</th>
                            <th>Hours/day</th>
                            <th>Monthly kWh</th>
                            <th>CO₂ (kg)</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        // Sort results by energy consumption (kWh) in descending order
        results.sort((a, b) => b.kwh - a.kwh);

        results.forEach(item => {
            const percentage = (item.kwh / totalKwh * 100).toFixed(1);
            html += `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            ${item.appliance}
                            <span style="color: #388e3c; font-size: 0.9em;">(${percentage}%)</span>
                        </div>
                    </td>
                    <td>${item.units}</td>
                    <td>${item.hours}</td>
                    <td>${item.kwh.toFixed(2)}</td>
                    <td>${item.co2.toFixed(2)}</td>
                </tr>
            `;
        });

        html += `
                        <tr class="total-row" style="background: #f5fff7; font-weight: 700;">
                            <td colspan="3"><strong>Total</strong></td>
                            <td><strong>${totalKwh.toFixed(2)}</strong></td>
                            <td><strong>${totalCo2.toFixed(2)}</strong></td>
                        </tr>
                    </tbody>
                </table>

                ${getEfficiencyTips(totalKwh, results)}
            </div>
        `;

        resultsContainer.innerHTML = html;
    }

    function getEfficiencyTips(totalKwh, results) {
        const highConsumers = results
            .filter(item => (item.kwh / totalKwh) > 0.2)
            .map(item => item.appliance);

        let tipsArr = [];
        if (highConsumers.includes('Air Conditioner')) {
            tipsArr.push('Consider setting your AC temperature 1-2 degrees higher to save energy.');
            tipsArr.push('Clean AC filters regularly for better efficiency.');
        }
        if (highConsumers.includes('Refrigerator')) {
            tipsArr.push('Ensure your refrigerator door seals properly and avoid frequent opening.');
            tipsArr.push('Defrost your fridge regularly and keep it away from heat sources.');
        }
        if (highConsumers.includes('Electric Geyser')) {
            tipsArr.push('Consider using a solar water heater or timer for your geyser.');
            tipsArr.push('Reduce geyser thermostat temperature to 50-55°C.');
        }
        if (highConsumers.includes('Desktop Computer')) {
            tipsArr.push('Turn off your desktop when not in use and enable power-saving mode.');
        }
        if (highConsumers.includes('Tube Light')) {
            tipsArr.push('Switch to LED bulbs for better efficiency.');
        }
        if (highConsumers.length === 0) {
            tipsArr.push('Great job! Your energy usage is well balanced.');
        }
        // Always show at least 3-4 tips
        while (tipsArr.length < 4) {
            tipsArr.push('Unplug chargers and devices when not in use.');
            if (tipsArr.length < 4) tipsArr.push('Use natural light during the day to reduce lighting needs.');
        }
        return `
            <div style="margin-top: 2rem; padding: 1.5rem; background: #f5fff7; border-radius: 12px;">
                <h4 style="color: #23413f; margin-bottom: 1rem;">💡 Energy Saving Tips</h4>
                <ul style="color: #388e3c; margin-left: 1.5rem;">
                    ${tipsArr.slice(0, 4).map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    function saveResultsToBackend(results) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'save-message';
        resultsContainer.appendChild(messageDiv);

        messageDiv.textContent = 'Saving results...';
        messageDiv.style.color = '#388e3c';

        fetch('save.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(results)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                messageDiv.textContent = 'Results saved successfully!';
                messageDiv.style.color = '#388e3c';
            } else {
                messageDiv.textContent = 'Error: ' + (data.error || 'Failed to save results');
                messageDiv.style.color = '#c62828';
            }
        })
        .catch(error => {
            messageDiv.textContent = 'Error: Could not connect to the server';
            messageDiv.style.color = '#c62828';
            console.error('Backend error:', error);
        });
    }

    // Initialize contact form if it exists
    const contactForm = document.querySelector(".contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Thank you for reaching out! We'll get back to you soon.");
            contactForm.reset();
        });
    }
// End of setup
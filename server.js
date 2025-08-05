const express = require('express');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Route: Offloading Calculation
app.post('/api/offload', (req, res) => {
    const {
        target,
        availability,
        tankSize,
        numTanks,
        lngDensity,
        offloadingRate,
        pumpsPerTank
    } = req.body;

    // Your hidden calculation formulas
    const annualDays = 365 * availability;
    const annualProduction = target * 1000000;
    const lngVolume = (annualProduction * 1000) / lngDensity;

    const feedGasFlowrate = (lngVolume * 620) / (24 * annualDays);
    const feedGasFlowratemmscfd = (feedGasFlowrate * 35.3147 * 24) / 1000000;
    const lngProductionRate = lngVolume / annualDays;
    const lngProductionRateKg = lngProductionRate * lngDensity;

    const inventoryTurns = lngVolume / tankSize;
    const tankPumpRate = offloadingRate / numTanks;
    const pumpRate = tankPumpRate / pumpsPerTank;
    const pumpRateDay = pumpRate * 24;

    const timeFullOp = 180000 / offloadingRate;
    const timeOnePumpFail = 180000 / (offloadingRate - pumpRate);
    const timeTwoPumpFail = 180000 / (offloadingRate - 2 * pumpRate);

    const carrierSizes = [180000, 225000, 265000];
    const offloadingTimes = carrierSizes.map(size => ({
        full: size / offloadingRate,
        oneFail: size / (offloadingRate - pumpRate),
        twoFail: size / (offloadingRate - 2 * pumpRate)
    }));

    res.json({
        annualDays,
        annualProduction,
        lngVolume,
        inventoryTurns,
        tankPumpRate,
        pumpRate,
        pumpRateDay,
        feedGasFlowrate,
        feedGasFlowratemmscfd,
        lngProductionRate,
        lngProductionRateKg,
        timeFullOp,
        timeOnePumpFail,
        timeTwoPumpFail,
        offloadingTimes
    });
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
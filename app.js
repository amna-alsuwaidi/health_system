const express = require('express')
const app = express()
var cors = require('cors')
const port = 8080

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
app.use(express.json());

app.post('/',  function (req, res, next) {
    console.log(req.body);

    let { Age, BMI, BP, FD } = req.body;

    // 🚨 **Validation Checks**
    let errors = [];

    // ✅ Age Validation (Must be realistic)
    if (typeof Age !== 'number' || Age < 0 || Age > 120) {
        errors.push("Invalid Age: Must be a number between 0 and 120.");
    }

    // ✅ BMI Validation (Ensure structure and realistic values)
    if (!BMI || typeof BMI.height !== 'number' || typeof BMI.weight !== 'number') {
        errors.push("Invalid BMI: Height and Weight must be numbers.");
    } else {
        if (BMI.height < 60 || BMI.height > 250) {
            errors.push("Invalid Height: Must be between 60 cm and 250 cm.");
        }
        if (BMI.weight < 10 || BMI.weight > 500) {
            errors.push("Invalid Weight: Must be between 10 kg and 500 kg.");
        }
    }

    // ✅ Blood Pressure Validation (Ensure systolic & diastolic exist)
    if (!BP || typeof BP.systolic !== 'number' || typeof BP.diastolic !== 'number') {
        errors.push("Invalid Blood Pressure: Systolic and Diastolic must be numbers.");
    } else {
        if (BP.systolic < 50 || BP.systolic > 250) {
            errors.push("Invalid Systolic Pressure: Must be between 50 and 250.");
        }
        if (BP.diastolic < 30 || BP.diastolic > 150) {
            errors.push("Invalid Diastolic Pressure: Must be between 30 and 150.");
        }
    }

    // ✅ Family Disease Validation (Must be 0 or 1)
    if (!FD || [FD.diabetes, FD.cancer, FD.alzheimer].some(d => d !== 0 && d !== 1)) {
        errors.push("Invalid Family Disease Data: Must be 0 or 1.");
    }

    // 🚨 **Return Errors if Any Validation Fails**
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // ✅ Convert Height to Meters if Needed
    let heightInMeters = BMI.height >= 3 ? BMI.height / 100 : BMI.height;
    let bmiValue = BMI.weight / (heightInMeters ** 2);
    let bmiPoints = bmiValue < 25 ? 0 : bmiValue < 30 ? 30 : 75;

    // ✅ Compute Age Risk Score
    let agePoints = Age < 30 ? 0 : Age < 45 ? 10 : Age < 60 ? 20 : 30;

    // ✅ Compute Blood Pressure Risk Score
    let bpPoints = 0;
    if (BP.systolic >= 180 || BP.diastolic >= 120) bpPoints = 100;
    else if (BP.systolic >= 140 || BP.diastolic >= 90) bpPoints = 75;
    else if (BP.systolic >= 130 || BP.diastolic >= 80) bpPoints = 30;
    else if (BP.systolic >= 120) bpPoints = 15;

    // ✅ Compute Family Disease Risk Score
    let diseasePoints = (FD.diabetes ? 10 : 0) + (FD.cancer ? 10 : 0) + (FD.alzheimer ? 10 : 0);

    // ✅ Compute Total Risk and Category
    let totalRisk = agePoints + bmiPoints + bpPoints + diseasePoints;
    let riskCategory = totalRisk <= 20 ? "Low Risk" :
        totalRisk <= 50 ? "Moderate Risk" :
            totalRisk <= 75 ? "High Risk" : "Uninsurable";

    // Return the calculated risk
    res.json({
        agePoints,
        bmiValue: bmiValue.toFixed(2), // Round to 2 decimal places
        bmiPoints,
        bpPoints,
        diseasePoints,
        totalRisk,
        riskCategory
    });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
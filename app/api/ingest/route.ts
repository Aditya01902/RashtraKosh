import { NextResponse } from 'next/server';

export async function GET() {
    const data = [
        {
            "scheme_name_raw": "Gati Shakti Master Plan",
            "scheme_name_mapped": "PM Gati Shakti",
            "BE": 450000,
            "RE": 420000,
            "Actuals": 405000,
            "ki_allocated": 450000,
            "ki_utilized": 405000,
            "variance_pct": 0.0,
            "anomaly_flag": false,
            "confidence_score": 0.95,
            "timestamp": new Date(Date.now() - 5000).toISOString()
        },
        {
            "scheme_name_raw": "National Infra Fund (NIF)",
            "scheme_name_mapped": "National Infrastructure Fund",
            "BE": 620000,
            "RE": 580000,
            "Actuals": 390000,
            "ki_allocated": 620000,
            "ki_utilized": 558000,
            "variance_pct": 30.1,
            "anomaly_flag": true,
            "confidence_score": 0.92,
            "timestamp": new Date(Date.now() - 4000).toISOString()
        },
        {
            "scheme_name_raw": "Sov. Green Bonds Prog",
            "scheme_name_mapped": "Sovereign Green Bonds",
            "BE": 320000,
            "RE": 280000,
            "Actuals": 233600,
            "ki_allocated": 320000,
            "ki_utilized": 233600,
            "variance_pct": 0.0,
            "anomaly_flag": false,
            "confidence_score": 0.88,
            "timestamp": new Date(Date.now() - 3000).toISOString()
        },
        {
            "scheme_name_raw": "Ayushman Bharat - PMJAY",
            "scheme_name_mapped": "Ayushman Bharat PM-JAY",
            "BE": 42000,
            "RE": 35000,
            "Actuals": 20000,
            "ki_allocated": 42000,
            "ki_utilized": 38640,
            "variance_pct": 48.2,
            "anomaly_flag": true,
            "confidence_score": 0.98,
            "timestamp": new Date(Date.now() - 2000).toISOString()
        },
        {
            "scheme_name_raw": "Mahatma Gandhi NREGA",
            "scheme_name_mapped": "MGNREGA",
            "BE": 480000,
            "RE": 550000,
            "Actuals": 650000,
            "ki_allocated": 480000,
            "ki_utilized": 432000,
            "variance_pct": 50.4,
            "anomaly_flag": true,
            "confidence_score": 0.99,
            "timestamp": new Date(Date.now() - 1000).toISOString()
        },
        {
            "scheme_name_raw": "PM Poshan Scheme",
            "scheme_name_mapped": "PM POSHAN",
            "BE": 28000,
            "RE": 27000,
            "Actuals": 26600,
            "ki_allocated": 28000,
            "ki_utilized": 26600,
            "variance_pct": 0.0,
            "anomaly_flag": false,
            "confidence_score": 0.96,
            "timestamp": new Date().toISOString()
        }
    ];

    return NextResponse.json(data);
}

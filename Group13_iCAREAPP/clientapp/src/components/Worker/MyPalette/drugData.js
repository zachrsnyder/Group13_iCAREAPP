// drugData.js
export const drugData = {
    "categories": [
        {
            "category": "Pain Medications",
            "drugs": [
                {
                    "name": "Acetaminophen (Tylenol)",
                    "dosages": ["325mg", "500mg", "650mg", "1000mg"],
                    "commonIndications": ["Pain relief", "Fever reduction"],
                    "contraindications": ["Liver disease", "Alcohol use"]
                },
                {
                    "name": "Ibuprofen (Advil)",
                    "dosages": ["200mg", "400mg", "600mg", "800mg"],
                    "commonIndications": ["Pain relief", "Inflammation"],
                    "contraindications": ["Stomach ulcers", "Bleeding disorders"]
                },
                {
                    "name": "Naproxen (Aleve)",
                    "dosages": ["220mg", "375mg", "500mg"],
                    "commonIndications": ["Pain relief", "Inflammation"],
                    "contraindications": ["Stomach ulcers", "Heart disease"]
                },
                {
                    "name": "Tramadol (Ultram)",
                    "dosages": ["50mg", "100mg"],
                    "commonIndications": ["Moderate to severe pain"],
                    "contraindications": ["Seizure disorders", "MAO inhibitors"]
                }
            ]
        },
        {
            "category": "Antibiotics",
            "drugs": [
                {
                    "name": "Amoxicillin",
                    "dosages": ["250mg", "500mg", "875mg"],
                    "commonIndications": ["Bacterial infections", "Strep throat"],
                    "contraindications": ["Penicillin allergy"]
                },
                {
                    "name": "Azithromycin (Z-pak)",
                    "dosages": ["250mg", "500mg"],
                    "commonIndications": ["Respiratory infections", "Skin infections"],
                    "contraindications": ["Liver disease"]
                },
                {
                    "name": "Ciprofloxacin (Cipro)",
                    "dosages": ["250mg", "500mg", "750mg"],
                    "commonIndications": ["Urinary tract infections", "Skin infections"],
                    "contraindications": ["Tendon disorders"]
                },
                {
                    "name": "Doxycycline",
                    "dosages": ["50mg", "100mg"],
                    "commonIndications": ["Bacterial infections", "Acne"],
                    "contraindications": ["Pregnancy", "Children under 8"]
                }
            ]
        }
    ],
    "prescriptionOptions": {
        "frequencies": [
            "Once daily",
            "Twice daily",
            "Three times daily",
            "Four times daily",
            "Every 4 hours",
            "Every 6 hours",
            "Every 8 hours",
            "Every 12 hours",
            "As needed",
            "Before meals",
            "After meals",
            "At bedtime"
        ],
        "durations": [
            "3 days",
            "5 days",
            "7 days",
            "10 days",
            "14 days",
            "21 days",
            "28 days",
            "30 days",
            "60 days",
            "90 days"
        ],
        "quantities": [
            "14 tablets",
            "20 tablets",
            "28 tablets",
            "30 tablets",
            "60 tablets",
            "90 tablets",
            "120 tablets"
        ]
    }
};
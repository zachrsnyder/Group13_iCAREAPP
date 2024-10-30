import React, { useState } from 'react';
import { X, Search } from 'lucide-react';

const DrugInfoModal = ({ isOpen, onClose, onDrugSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const commonDrugs = [
        {
            category: "Pain Medications",
            drugs: ["Acetaminophen (Tylenol)", "Ibuprofen (Advil)", "Naproxen (Aleve)", "Tramadol (Ultram)"]
        },
        {
            category: "Antibiotics",
            drugs: ["Amoxicillin", "Azithromycin (Z-pak)", "Ciprofloxacin (Cipro)", "Doxycycline"]
        },
        {
            category: "Antidepressants",
            drugs: ["Sertraline (Zoloft)", "Fluoxetine (Prozac)", "Escitalopram (Lexapro)", "Bupropion (Wellbutrin)"]
        },
        {
            category: "Blood Pressure Medications",
            drugs: ["Lisinopril", "Amlodipine (Norvasc)", "Metoprolol", "Losartan (Cozaar)"]
        },
        {
            category: "Diabetes Medications",
            drugs: ["Metformin (Glucophage)", "Glipizide (Glucotrol)", "Insulin (Lantus)", "Jardiance"]
        },
        {
            category: "Respiratory Medications",
            drugs: ["Albuterol (Ventolin)", "Fluticasone (Flovent)", "Montelukast (Singulair)", "Tiotropium (Spiriva)"]
        },
        {
            category: "Gastrointestinal Medications",
            drugs: ["Omeprazole (Prilosec)", "Pantoprazole (Protonix)", "Ondansetron (Zofran)", "Dicyclomine (Bentyl)"]
        }
    ];

    const filteredDrugs = searchTerm
        ? commonDrugs.map(category => ({
            ...category,
            drugs: category.drugs.filter(drug =>
                drug.toLowerCase().includes(searchTerm.toLowerCase())
            )
        })).filter(category => category.drugs.length > 0)
        : commonDrugs;

    if (!isOpen) return null;

    return (
        <div className="fixed top-[5vh] left-[75%] h-[90vh] w-96 bg-white rounded-lg shadow-xl z-50 flex flex-col">
            <div className="flex-none px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Drug Information</h2>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    title="Close"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-none p-4 border-b">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search medications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                    {filteredDrugs.map((category, index) => (
                        <div key={index} className="border-b pb-4 last:border-b-0">
                            <h3 className="font-medium text-gray-900 mb-3">{category.category}</h3>
                            <div className="space-y-2">
                                {category.drugs.map((drug, drugIndex) => (
                                    <button
                                        key={drugIndex}
                                        onClick={() => onDrugSelect(drug)}
                                        className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md transition-colors duration-150 hover:text-blue-600"
                                    >
                                        {drug}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DrugInfoModal;
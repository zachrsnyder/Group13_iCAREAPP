import React, { useState } from 'react';
import { X, Search, ChevronLeft } from 'lucide-react';
import { drugData } from './drugData';

/// <summary>
/// Modal that appears when the user clicks to view drug information.
/// Facilitates the search of drugs, the selection of a drug from the tables, and allows the user to set dosage, frequency, duration, and quantity for a prescription
/// </summary>
const DrugInfoModal = ({ isOpen, onClose, onDrugSelect }) => {
    // State management for search, drug selection, and prescription options
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({
        dosage: '',
        frequency: '',
        duration: '',
        quantity: ''
    });

    // Filter drugs based on search term
    // Returns categories with matching drugs, excluding empty categories
    const filteredDrugs = searchTerm
        ? drugData.categories.map(category => ({
            ...category,
            drugs: category.drugs.filter(drug =>
                drug.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
        })).filter(category => category.drugs.length > 0)
        : drugData.categories;

    // Helper function to find and return detailed information for a specific drug
    const getDrugDetails = (drugName) => {
        for (const category of drugData.categories) {
            const drug = category.drugs.find(d => d.name === drugName);
            if (drug) return drug;
        }
        return null;
    };

    // Update selected options (dosage, frequency, duration, quantity)
    const handleOptionSelect = (category, value) => {
        setSelectedOptions(prev => ({
            ...prev,
            [category]: value
        }));
    };

    // Handler for adding a new prescription
    // Combines drug details with selected options and passes to parent component
    const handleAddPrescription = () => {
        const drugDetails = getDrugDetails(selectedDrug);
        const prescriptionData = {
            medication: selectedDrug,
            dosage: selectedOptions.dosage,
            frequency: selectedOptions.frequency,
            duration: selectedOptions.duration,
            quantity: selectedOptions.quantity,
            indications: drugDetails?.commonIndications,
            contraindications: drugDetails?.contraindications
        };

        onDrugSelect(prescriptionData);
        // Reset form state after submission
        setSelectedDrug(null);
        setSelectedOptions({
            dosage: '',
            frequency: '',
            duration: '',
            quantity: ''
        });
    };

    // Check if all required prescription options are selected
    const isAllSelected = () => {
        return selectedOptions.dosage &&
            selectedOptions.frequency &&
            selectedOptions.duration &&
            selectedOptions.quantity;
    };

    // Don't render anything if modal is closed
    if (!isOpen) return null;

    return (
        <div className="fixed top-[5vh] left-[74%] h-[90vh] w-90 bg-white rounded-lg shadow-xl z-50 flex flex-col">
            {/* Modal Header */}
            <div className="flex-none px-6 py-4 border-b">
                <div className="flex items-center">
                    {/* Back button - only shown when a drug is selected */}
                    {selectedDrug && (
                        <button
                            onClick={() => setSelectedDrug(null)}
                            className="mr-2 p-1 hover:bg-gray-100 rounded"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                    )}
                    <h2 className="text-xl font-semibold text-gray-800">
                        {selectedDrug ? selectedDrug : 'Drug Information'}
                    </h2>
                </div>
                {/* Close modal button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    title="Close"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Conditional rendering based on whether a drug is selected */}
            {!selectedDrug ? (
                // Drug Search and Selection View
                <>
                    {/* Search Input */}
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

                    {/* Drug Categories and List */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-6 space-y-6">
                            {filteredDrugs.map((category, index) => (
                                <div key={index} className="border-b pb-4 last:border-b-0">
                                    <h3 className="font-medium text-gray-900 mb-3">{category.category}</h3>
                                    <div className="space-y-2">
                                        {category.drugs.map((drug, drugIndex) => (
                                            <button
                                                key={drugIndex}
                                                onClick={() => setSelectedDrug(drug.name)}
                                                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md transition-colors duration-150 hover:text-blue-600"
                                            >
                                                {drug.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                // Drug Details and Prescription Options View
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            {/* Drug Details Section - Uses IIFE for cleaner rendering of drug details */}
                            {(() => {
                                const drugDetails = getDrugDetails(selectedDrug);
                                return (
                                    <>
                                        {/* Common Indications */}
                                        <div className="mb-6">
                                            <h3 className="font-medium text-gray-900 mb-2">Common Indications</h3>
                                            <ul className="list-disc pl-5 text-gray-600">
                                                {drugDetails?.commonIndications.map((indication, index) => (
                                                    <li key={index}>{indication}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        {/* Contraindications */}
                                        <div className="mb-6">
                                            <h3 className="font-medium text-gray-900 mb-2">Contraindications</h3>
                                            <ul className="list-disc pl-5 text-gray-600">
                                                {drugDetails?.contraindications.map((contraindication, index) => (
                                                    <li key={index}>{contraindication}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                );
                            })()}

                            {/* Prescription Options - Radio button groups for each option */}
                            {/* Dosage Options */}
                            <div>
                                <h3 className="font-medium text-gray-900 mb-3">Dosage</h3>
                                <div className="space-y-2">
                                    {getDrugDetails(selectedDrug)?.dosages.map((dosage, index) => (
                                        <label key={index} className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="dosage"
                                                value={dosage}
                                                checked={selectedOptions.dosage === dosage}
                                                onChange={(e) => handleOptionSelect('dosage', e.target.value)}
                                                className="text-blue-600 focus:ring-blue-500"
                                            />
                                            <span>{dosage}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Frequency Options */}
                            <div>
                                <h3 className="font-medium text-gray-900 mb-3">Frequency</h3>
                                <div className="space-y-2">
                                    {drugData.prescriptionOptions.frequencies.map((frequency, index) => (
                                        <label key={index} className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="frequency"
                                                value={frequency}
                                                checked={selectedOptions.frequency === frequency}
                                                onChange={(e) => handleOptionSelect('frequency', e.target.value)}
                                                className="text-blue-600 focus:ring-blue-500"
                                            />
                                            <span>{frequency}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Duration Options */}
                            <div>
                                <h3 className="font-medium text-gray-900 mb-3">Duration</h3>
                                <div className="space-y-2">
                                    {drugData.prescriptionOptions.durations.map((duration, index) => (
                                        <label key={index} className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="duration"
                                                value={duration}
                                                checked={selectedOptions.duration === duration}
                                                onChange={(e) => handleOptionSelect('duration', e.target.value)}
                                                className="text-blue-600 focus:ring-blue-500"
                                            />
                                            <span>{duration}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity Options */}
                            <div>
                                <h3 className="font-medium text-gray-900 mb-3">Quantity</h3>
                                <div className="space-y-2">
                                    {drugData.prescriptionOptions.quantities.map((quantity, index) => (
                                        <label key={index} className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                name="quantity"
                                                value={quantity}
                                                checked={selectedOptions.quantity === quantity}
                                                onChange={(e) => handleOptionSelect('quantity', e.target.value)}
                                                className="text-blue-600 focus:ring-blue-500"
                                            />
                                            <span>{quantity}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Add Prescription Button - Disabled until all options are selected */}
                        <div className="border-t pt-4">
                            <button
                                onClick={handleAddPrescription}
                                disabled={!isAllSelected()}
                                className={`w-full px-4 py-2 text-white rounded-md transition-colors ${isAllSelected()
                                    ? 'bg-blue-600 hover:bg-blue-700'
                                    : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Add Prescription
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DrugInfoModal;
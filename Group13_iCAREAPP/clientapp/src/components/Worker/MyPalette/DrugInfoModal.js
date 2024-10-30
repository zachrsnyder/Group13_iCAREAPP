import React from 'react';
import { X } from 'lucide-react';

const DrugInfoModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed top-[5vh] left-[calc(55%+24rem)] h-[90vh] w-96 bg-white rounded-lg shadow-xl z-50">
            <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Drug Information</h2>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    title="Close"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {/* Placeholder content */}
                <div className="space-y-4">
                    <div className="border-b pb-4">
                        <h3 className="font-medium text-gray-900 mb-2">Drug Details</h3>
                        <p className="text-gray-500">Drug information will be displayed here...</p>
                    </div>

                    <div className="border-b pb-4">
                        <h3 className="font-medium text-gray-900 mb-2">Dosage</h3>
                        <p className="text-gray-500">Dosage information will be displayed here...</p>
                    </div>

                    <div className="border-b pb-4">
                        <h3 className="font-medium text-gray-900 mb-2">Side Effects</h3>
                        <p className="text-gray-500">Side effects information will be displayed here...</p>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-900 mb-2">Interactions</h3>
                        <p className="text-gray-500">Drug interactions will be displayed here...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DrugInfoModal;
import React from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

// modal to display successful assignment or failed assignment
const NotificationModal = ({ message, type = 'success', failedItems = [], onClose }) => {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center">
                        {type === 'success' ? (
                            <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                        ) : (
                            <XCircle className="h-6 w-6 text-rose-500 mr-3" />
                        )}
                        <h3 className="text-lg font-medium text-gray-900">
                            {type === 'success' ? 'Success' : 'Partial Success'}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-4">
                    <p className="text-sm text-gray-600">{message}</p>

                    {failedItems.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Failed Assignments:</h4>
                            <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-md">
                                {failedItems.map((item, index) => (
                                    <div key={index} className="px-3 py-2 text-sm text-gray-600 border-b border-gray-200 last:border-0">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;
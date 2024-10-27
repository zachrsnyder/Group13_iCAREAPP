import {React, useEffect, useState} from 'react'



//TODO: Add box for failing to add doc.
//TODO:

const AddDocumentModal = (setShowAddModal) => {
  
    const [newDocument, setDocument] = useState({})
    const [patients, setPatients] = useState([])
    const [error, setError] = useState('')
    const [loadingPatients, setLoadingPatients] = useState(true)


    const fetchPatients = async () => {
        try {
            const response = await fetch('/PatientRecords/MyPatients', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to fetch patients');
            }

            const data = await response.json();
            setPatients(data);
            setLoadingPatients(false);
        } catch (err) {
            setError(err.message);
            setLoadingPatients(false);
        }
    };

    useEffect(() => {
        fetchPatients()
    }, [])



    const handleAddDoc = async(e) => {
        e.preventDefault();
        try{
            const url = 'DocumentMetadatas/AddDocument';
            const requestData = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newDocument),
                credentials: 'include'
            };

            const response = await fetch(url, requestData);

            if (response.status == 400) {
                const errorText = await response.text();
                console.error('Error response text:', errorText);
                throw new Error(`Failed to create patient: ${errorText}`);
            }
        }catch(ex){
            console.log("Failed to add document.")
        }
        setShowAddModal(false)
    }
  
    return (
    
    <div className='fixed inset-0 bg-opacity-50 bg-gray-400 justify-center align-center'>
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
            {loadingPatients ? (
            <div>
                <h2>Loading Info...</h2>
            </div>
            ) : error === '' ? (<>
            <h2 className="text-2xl font-bold mb-4">Add New Document</h2>
            <form onSubmit={handleAddDoc} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        value={newDocument.Name}
                        onChange={(e) => setDocument({ ...newDocument, Name: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Corresponding Patient</label>
                    <select
                        value={newDocument.roleID}
                        onChange={(e) => setDocument({ ...newDocument, patientID: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    >
                        {patients.map((patient) => (
                            <option value={patient.ID}>{patient.name} Id: {patient.ID}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="fileUpload">Upload Document:</label>
                    <input type="file" id="fileUpload" onChange={(e) => setDocument({...newDocument, FileData: new Blob([e.target.files[0]], { type: e.target.files[0].type })})} />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Add Document
                    </button>
                </div>
            </form>
            </>) : (
                <div>
                    <h2>Couldn't get necessary info.</h2>
                </div>
            )}
        </div>
    </div>    
  )
}

export default AddDocumentModal
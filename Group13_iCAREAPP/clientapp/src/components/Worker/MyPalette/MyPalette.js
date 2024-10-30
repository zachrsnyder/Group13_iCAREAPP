import React, { useState, useEffect } from 'react'
import DocCard from './DocCard'
import AddDocumentModal from './AddDocumentModal'
import DocumentViewModal from './DocumentViewModal'


// This class defines a GUI window that show the available
// iCARE documents and help the interested worker to choose a
// document he or she wish to work on. This window fits in one
// tablet screen size so the worker can see all choices in one
// view which consists of a series of buttons to facilitate such
// purpose.

const MyPalette = () => {
    const [isLoading, setIsLoading] = useState(true)
    const [documents, setDocuments] = useState([])
    const [renderModal, setModal] = useState(false)

    const [selectedDoc, setSelectedDoc] = useState(null)
    const [showDoc, setShowDoc] = useState(false)

    const updateAddModal = (newState) => {
        setModal(false)
    }

    const fetchDocs = async () => {
        const response = await fetch('DocumentMetadatas', {
            credentials: 'include'
        })

        const json = await response.json();

        if (json.error) {
            console.log(`Error ${json.error}`)
        } else {
            console.log(json)
            setDocuments(json)
            setIsLoading(false)
        }

    }

    useEffect(() => {
        fetchDocs()
    }, [showDoc, renderModal])

    return (
        <div className='bg-gray-300'>
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setModal(true)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Add New Document
                </button>
            </div>
           
            {isLoading ?
                <div className='w-full bg-gray-50'>
                    <h1>Loading Document Data...</h1>
                </div>
                :
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/5">
                                Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/5">
                                Date Created
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/5">
                                Patient Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/5">
                                Worker Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/5">
                                Worker Role
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {documents.map((document) => (
                            <DocCard doc={document} setShowDoc={setShowDoc} setSelectedDoc={setSelectedDoc}/>
                        ))}
                    </tbody>
                </table>
            }

            {renderModal && !isLoading && (
                <AddDocumentModal setShowAddModal={updateAddModal}/>
                
            )}

            {showDoc && selectedDoc && (
                <DocumentViewModal doc={selectedDoc} showDoc={setShowDoc} selectedDoc={setSelectedDoc} />
            )}

            
        </div>


    )
}

export default MyPalette
import React, { useState, useEffect } from 'react'
import WorkerNavBar from '../WorkerNavBar'
import DocCard from './DocCard'


// This class defines a GUI window that show the available
// iCARE documents and help the interested worker to choose a
// document he or she wish to work on. This window fits in one
// tablet screen size so the worker can see all choices in one
// view which consists of a series of buttons to facilitate such
// purpose.

const MyPalette = () => {
    let docs = [
        { name: "PatientDedLol", dateOfCreation: "yesterday", patientName: "Rick", userName: "Jessica", userRole: "Nurse" },
        { name: "PatientDedLol", dateOfCreation: "yesterday", patientName: "Rick", userName: "Jessica", userRole: "Nurse" },
        { name: "PatientDedLol", dateOfCreation: "yesterday", patientName: "Rick", userName: "Jessica", userRole: "Nurse" }
    ]

    const [isLoading, setIsLoading] = useState(true)
    const [documents, setDocuments] = useState([]);


    const fetchUsers = async () => {
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
        fetchUsers()
    }, [])

    return (
        <div className='w-screen h-screen bg-gray-300'>
           
            {isLoading ?
                <div className='min-w-full bg-gray-50'>
                    <h1>Loading Document Data...</h1>
                </div>
                :
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Patient Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Worker Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Worker Role
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y min-w-full divide-gray-200">
                        {documents.map((document) => (
                            <DocCard
                                doc={document}
                            />
                        ))}
                    </tbody>
                </table>
            }
        </div>
    )
}

export default MyPalette
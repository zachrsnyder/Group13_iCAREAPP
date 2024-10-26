import React from 'react'
import { useState } from 'react'
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
    {name: "PatientDedLol", dateOfCreation: "yesterday", patientName: "Rick", userName: "Jessica", userRole: "Nurse"},
    {name: "PatientDedLol", dateOfCreation: "yesterday", patientName: "Rick", userName: "Jessica", userRole: "Nurse"},
    {name: "PatientDedLol", dateOfCreation: "yesterday", patientName: "Rick", userName: "Jessica", userRole: "Nurse"}
  ]
  
  
  return (
    <div className='w-screen h-screen bg-gray-300'>
      <WorkerNavBar/>
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
        <tbody className="bg-white divide-y divide-gray-200">
            {docs.map((doc) => (
                <DocCard 
                    doc = {doc}
                />
            ))}
        </tbody>
      </table>     
    </div>
  )
}

export default MyPalette
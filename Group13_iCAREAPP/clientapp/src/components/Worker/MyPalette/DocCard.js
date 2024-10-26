import React from 'react'

const DocCard = ({ doc }) => {
  return (
    <button>
        <tr key={doc.id}>
            <td className="px-6 py-4 whitespace-nowrap">{doc.name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{doc.dateOfCreation}</td>
            <td className="px-6 py-4 whitespace-nowrap">{doc.patientName}</td>
            <td className="px-6 py-4 whitespace-nowrap">{doc.userName}</td>
            <td className="px-6 py-4 whitespace-nowrap">{doc.userRole}</td>
        </tr>
    </button>
  )
}

export default DocCard
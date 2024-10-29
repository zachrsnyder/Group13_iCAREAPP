import React from 'react'





const DocCard = ({ doc, setShowDoc, setSelectedDoc }) => {

    const onRowClick = (doc) => {
        console.log(`Clicked Doc: ${doc.documentTitle}`)
        setShowDoc(true)
        setSelectedDoc(doc)
    }


    return (
        <tr className="hover:bg-gray-100 cursor-pointer">
            <td colSpan="5">
                <button
                    onClick={() => onRowClick(doc)}
                    className="w-full text-left py-2 flex justify-between items-center"
                >
                    <span className="px-4 w-1/5">{doc.documentTitle}</span>
                    <span className="px-4 w-1/5">{doc.documentDate}</span>
                    <span className="px-4 w-1/5">{doc.patientName}</span>
                    <span className="px-4 w-1/5">{doc.userName}</span>
                    <span className="px-4 w-1/5">{doc.userRole}</span>
                </button>
            </td>
        </tr>
  )
}

export default DocCard
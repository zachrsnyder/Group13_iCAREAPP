import {React, useEffect, useState} from 'react'



/// <summary>
/// Each document in the list of documents is mapped to a DocCard. Which can be found in MyPallete.js. The documents information 
/// is passed via the doc prop and control props are also passed in the forms of setShowDoc and setSelectedDoc
/// </summary>
const DocCard = ({ doc, setShowDoc, setSelectedDoc }) => {

    const [title, setTitle] = useState('')

    // When the row is clikced, show a modal of information pertaining to that doc. In hinde sight, the setShowDoc is unnecessary if selected doc is null when no document is selected.
    const onRowClick = (doc) => {
        console.log(`Clicked Doc: ${doc.documentTitle}`)
        setShowDoc(true)
        setSelectedDoc(doc)
    }

    // Happens on component mount. If the doc ends with _Image in the db, we want to remove that because that wasnt initially passed by the user.
    useEffect(()=>{
        if (doc.documentTitle.endsWith("_Image")) {
            setTitle(doc.documentTitle.slice(0, -6)); // Remove the last 6 characters ("_Image")
        }else{
            setTitle(doc.documentTitle)
        }
    }, [])




    return (
        <tr className="hover:bg-gray-100 cursor-pointer">
            <td colSpan="5">
                <button
                    onClick={() => onRowClick(doc)}
                    className="w-full text-left py-2 flex justify-between items-center"
                >
                    <span className="px-4 w-1/5">{title}</span>
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
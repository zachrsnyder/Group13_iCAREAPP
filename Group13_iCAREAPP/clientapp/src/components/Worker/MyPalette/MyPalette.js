import React from 'react'
import { useState } from 'react'
import WorkerNavBar from '../WorkerNavBar'


// This class defines a GUI window that show the available
// iCARE documents and help the interested worker to choose a
// document he or she wish to work on. This window fits in one
// tablet screen size so the worker can see all choices in one
// view which consists of a series of buttons to facilitate such
// purpose.

const MyPalette = () => {
  return (
    <div>
      <WorkerNavBar/>
      
    </div>
  )
}

export default MyPalette
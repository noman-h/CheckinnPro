import React, { useEffect, useState } from 'react'

function UseDebouncing(value,time) {
    
    const [debouncedvalue,setdebouncedvalue]=useState(value)

    useEffect(()=>{

        const handler=setTimeout(()=>{
              
         setdebouncedvalue(value)

        },[time])

        return ()=>{
            clearTimeout(handler)
        }

    },[value,time])


  return debouncedvalue;
}

export default UseDebouncing
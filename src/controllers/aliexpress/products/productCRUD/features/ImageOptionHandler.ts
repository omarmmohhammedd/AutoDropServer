import axios from "axios"

interface ImageOptionHandlerProps{
    option_id:number
    options:any,imageIds :any,
    token:string
    images:{name:string,id:number}[]
}

export const ImageOptionHandler = async({option_id,options,token}:ImageOptionHandlerProps)=>{
let url =`https://api.salla.dev/admin/v2/products/options/${option_id}`
let reqOpt = {
    url,method:"PUT",Authorization:"Bearer " +token
}

let res = await axios.request(reqOpt)
return 
} 
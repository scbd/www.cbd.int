// THIS FILE IS TO FIX PROBLEM 
// WHEN CURRENT MEETINGs ARE NOT USING
// THE SAME MEETING FOR REGISTRATION. 

// Mapping should be deleted after the end of the meeting

const mappings = {

    //Conferences 
    ['2024'] : '2024-r2',

    //Meetings
    ['COP-16']                   : 'COP-16-R2',
    ['52000000cbd0495c000018e9'] : '52000000cbd0495c00001975',

    ['CP-MOP-11']                : 'CP-MOP-11-R2',
    ['52000000cbd0495c000018ea'] : '52000000cbd0495c00001976',
    
    ['NP-MOP-05']                : 'NP-MOP-05-R2',
    ['52000000cbd0495c000018eb'] : '52000000cbd0495c00001977',
}


export default function remap(code) {
    const normalizedCode = (code||'').toLocaleUpperCase();

    for(let [key, value] of Object.entries(mappings)) {
        if(key.toLocaleUpperCase() == normalizedCode) return value;
    }

    return code;
}
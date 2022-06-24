export default function remap(code) {

    // THIS FILE IS TO FIX PROBLEM 
    // WHEN CURRENT MEETINGs ARE NOT USING
    // THE SAME MEETING FOR REGISTRATION. 

    var normalizedCode = (code||'').toLocaleUpperCase();

    //conferences

    if(normalizedCode == 'POST2020')    return 'wg2020-04';

    //Meetings

    // if(normalizedCode == 'COP-15')    return 'COP-15-PART1';
    // if(normalizedCode == 'CP-MOP-10') return 'CP-MOP-10-PART1';
    // if(normalizedCode == 'NP-MOP-10') return 'NP-MOP-04-PART1';

    // if(normalizedCode == '52000000CBD0495C00001741') return '52000000cbd0495c00001821'; // 'COP-15'    => 'COP-15-PART1';    
    // if(normalizedCode == '52000000CBD0495C00001742') return '52000000cbd0495c00001822'; // 'CP-MOP-10' => 'CP-MOP-10-PART1';
    // if(normalizedCode == '52000000CBD0495C00001743') return '52000000cbd0495c00001823'; // 'NP-MOP-10' => 'NP-MOP-04-PART1';

    return code;
}
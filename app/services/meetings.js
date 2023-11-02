//==============================
//
//==============================
export function normalizeMeeting(meeting) {

    let { EVT_CD: code, printSmart, agenda, venueText } = meeting;

    const isMontreal = /montr.al.*canada/i.test((venueText || {}).en || '');

    printSmart = !!printSmart;
    agenda = normalizeAgenda(agenda || {});

    return {
        ...meeting,
        code,
        agenda,
        printSmart,
        isMontreal
    };
}

export function normalizeAgenda(agenda) {

    agenda = agenda || {};
    const { prefix, color } = agenda;

    const items = (agenda?.items || []).map((item) => ({
        prefix,
        color,
        ...item
    }));

    return { ...agenda, items }
}

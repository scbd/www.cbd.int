

export const getSessions = async (conferenceId='5f626862cabfb1fd7d67eac2') => {
  console.log(`getSessions: ${conferenceId}`)
  return sessions
}










const sessions = [
  {
    _id : '6011572f2bfb07816e088fd9',
    title: { en: 'Informal sessions in preperation for ExCOP2'},
    summary : { en: 'Montreal (Online), 16-19 November 2020' }, // unused in sketches
    conferenceId: '5f626862cabfb1fd7d67eac2',
    meetingIds: ['52000000cbd0495c00001796', '52000000cbd0495c00001797', '52000000cbd0495c00001798'],
    meetingCodes: ['cbd-excop-02', 'cp-exmop-01', 'np-exmop-01'], // automatically filled 
    group: null,//String oneof [null, "WG1", "WG2"]
    date: '2020-11-16T00:00:00.000Z',      // Scheduled start date/time in UTC (based on meeting timezone)
    startDate: '2020-11-16T09:00:00.000Z',  // actual start in UTC (based on meeting timezone)
  },
  {
    _id : '601427d186b9bf000128662f',
    title: { en: 'Informal sessions in preperation for CP ExMOP 1'},
    summary : { en: 'Montreal (Online), 16-19 November 2020' }, // unused in sketches
    conferenceId: '5f626862cabfb1fd7d67eac2',
    meetingIds: ['52000000cbd0495c00001796', '52000000cbd0495c00001797', '52000000cbd0495c00001798'],
    meetingCodes: ['cbd-excop-02', 'cp-exmop-01', 'np-exmop-01'], // automatically filled 
    group: null,//String oneof [null, "WG1", "WG2"]
    date: '2020-11-16T00:00:00.000Z',      // Scheduled start date/time in UTC (based on meeting timezone)
    startDate: '2020-11-16T13:00:00.000Z',  // actual start in UTC (based on meeting timezone)
  },
  {
    _id : '601427d186b9bf000158662f',
    title: { en: 'Informal sessions in preperation for NP ExMOP 1'},
    summary : { en: 'Montreal (Online), 16-19 November 2020' }, // unused in sketches
    conferenceId: '5f626862cabfb1fd7d67eac2',
    meetingIds: ['52000000cbd0495c00001796', '52000000cbd0495c00001797', '52000000cbd0495c00001798'],
    meetingCodes: ['cbd-excop-02', 'cp-exmop-01', 'np-exmop-01'], // automatically filled 
    group: null,//String oneof [null, "WG1", "WG2"]
    date: '2020-11-16T00:00:00.000Z',      // Scheduled start date/time in UTC (based on meeting timezone)
    startDate: '2020-11-16T18:00:00.000Z',  // actual start in UTC (based on meeting timezone)
  }
]
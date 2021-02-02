

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
    statements:[
      { time: '2020-11-16T09:05:00.000Z', agendaItems: [{  item: 2 }], organization: { title: 'India', type: 'gov' }, public: true, files: [ { url: 'https://www.cbd.int/doc/c/c7e8/adfa/b0ecb7506ab5935e05f9b5f5/excop-02-01-en.docx', lang:'en' }, { url: 'https://www.cbd.int/doc/c/e7ff/c4e3/4e42fc19152c82f15c47a0fd/excop-02-01-es.docx', lang:'es'}]  },
      { time: '2020-11-16T09:10:00.000Z', agendaItems: [{ meeting: 'cbd-excop-02', item: 3 }], organization: { title: 'Canada', type: 'gov' },  public: true, files: [ { url: 'https://www.cbd.int/doc/c/c7e8/adfa/b0ecb7506ab5935e05f9b5f5/excop-02-01-en.docx', lang:'en' }, { url: 'https://www.cbd.int/doc/c/e7ff/c4e3/4e42fc19152c82f15c47a0fd/excop-02-01-es.docx', lang:'es'}]  },
      { time: '2020-11-16T09:15:00.000Z', agendaItems: [{ meeting: 'cbd-excop-02', item: 4 }], organization: { title: 'Every Woman Hope Centre (EWHC)', type: 'NGO' }, files: [ { url: 'https://www.cbd.int/doc/c/c7e8/adfa/b0ecb7506ab5935e05f9b5f5/excop-02-01-en.docx', lang:'en' }, { url: 'https://www.cbd.int/doc/c/e7ff/c4e3/4e42fc19152c82f15c47a0fd/excop-02-01-es.docx', lang:'es',  public: true }]  },
      { time: '2020-11-16T09:25:00.000Z', agendaItems: [{ meeting: 'cbd-excop-02', item: 5 }], organization: { title: 'Ireland', type: 'gov' }, files: [ { url: 'https://www.cbd.int/doc/c/c7e8/adfa/b0ecb7506ab5935e05f9b5f5/excop-02-01-en.docx', lang:'en' }, { url: 'https://www.cbd.int/doc/c/e7ff/c4e3/4e42fc19152c82f15c47a0fd/excop-02-01-es.docx', lang:'es'}]  },
    ]
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
    statements:[
      { time: '2020-11-16T09:05:00.000Z', agendaItems: [{  meetingName: 'XXX', item: 2 }], organization: { title: 'India', type: 'gov' }, public: true, files: [ { url: 'https://www.cbd.int/doc/c/c7e8/adfa/b0ecb7506ab5935e05f9b5f5/excop-02-01-en.docx', lang:'en' }, { url: 'https://www.cbd.int/doc/c/e7ff/c4e3/4e42fc19152c82f15c47a0fd/excop-02-01-es.docx', lang:'es'}]  },

      { time: '2020-11-16T13:10:00.000Z', agendaItems: [{ meeting: 'cp-exmop-01', item: 3 }], organization: { title: 'Canada', type: 'gov' },  public: true, files: [ { url: 'https://www.cbd.int/doc/c/c7e8/adfa/b0ecb7506ab5935e05f9b5f5/excop-02-01-en.docx', lang:'en' }, { url: 'https://www.cbd.int/doc/c/e7ff/c4e3/4e42fc19152c82f15c47a0fd/excop-02-01-es.docx', lang:'es'}]  },
      { time: '2020-11-16T13:15:00.000Z', agendaItems: [{ meeting: 'cp-exmop-01', item: 4 }], organization: { title: 'Every Woman Hope Centre (EWHC)', type: 'NGO' }, files: [ { url: 'https://www.cbd.int/doc/c/c7e8/adfa/b0ecb7506ab5935e05f9b5f5/excop-02-01-en.docx', lang:'en' }, { url: 'https://www.cbd.int/doc/c/e7ff/c4e3/4e42fc19152c82f15c47a0fd/excop-02-01-es.docx', lang:'es',  public: true }]  },
      { time: '2020-11-16T14:25:00.000Z', agendaItems: [{ meeting: 'cp-exmop-01', item: 5 }, { meeting: 'cp-exmop-01', item: 6 }], organization: { title: 'Ireland', type: 'gov' }, files: [ { url: 'https://www.cbd.int/doc/c/c7e8/adfa/b0ecb7506ab5935e05f9b5f5/excop-02-01-en.docx', lang:'en' }, { url: 'https://www.cbd.int/doc/c/e7ff/c4e3/4e42fc19152c82f15c47a0fd/excop-02-01-es.docx', lang:'es'}]  },
    ]
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
    statements:[
      { time: '2020-11-16T18:10:00.000Z', agendaItems: [{ meeting: 'np-exmop-01', item: 2 }, { meeting: 'np-exmop-01', item: 3 }], organization: { title: 'Canada', type: 'gov' }, public: true, files: [ { url: 'https://www.cbd.int/doc/c/c7e8/adfa/b0ecb7506ab5935e05f9b5f5/excop-02-01-en.docx', lang:'en' }, { url: 'https://www.cbd.int/doc/c/e7ff/c4e3/4e42fc19152c82f15c47a0fd/excop-02-01-es.docx', lang:'es'}]  },
      { time: '2020-11-16T18:15:00.000Z', agendaItems: [{ meeting: 'cnp-exmop-01', item: 4 }], organization: { title: 'Every Woman Hope Centre (EWHC)', type: 'NGO' }, public: true, iles: [ { url: 'https://www.cbd.int/doc/c/c7e8/adfa/b0ecb7506ab5935e05f9b5f5/excop-02-01-en.docx', lang:'en' }, { url: 'https://www.cbd.int/doc/c/e7ff/c4e3/4e42fc19152c82f15c47a0fd/excop-02-01-es.docx', lang:'es',  public: true }]  },
      { time: '2020-11-16T19:25:00.000Z', agendaItems: [{ meeting: 'np-exmop-01', item: 5 }, { meeting: 'cp-exmop-01', item: 6 }], organization: { title: 'Ireland', type: 'gov' }, files: [ { url: 'https://www.cbd.int/doc/c/c7e8/adfa/b0ecb7506ab5935e05f9b5f5/excop-02-01-en.docx', lang:'en' }, { url: 'https://www.cbd.int/doc/c/e7ff/c4e3/4e42fc19152c82f15c47a0fd/excop-02-01-es.docx', lang:'es'}]  },
    ]
  }
]
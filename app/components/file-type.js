
export const types = {
  'application/pdf':                                                            { priority: 10,  color: 'red',    btn: 'btn-danger',  icon: 'fa-file-pdf-o'   },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :   { priority: 20,  color: 'blue',   btn: 'btn-primary', icon: 'fa-file-word-o'  },
  'application/msword':                                                         { priority: 30,  color: 'blue',   btn: 'btn-primary', icon: 'fa-file-word-o'  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :         { priority: 40,  color: 'green',  btn: 'btn-success', icon: 'fa-file-excel-o' },
  'application/vnd.ms-excel':                                                   { priority: 50,  color: 'green',  btn: 'btn-success', icon: 'fa-file-excel-o' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation' : { priority: 60,  color: 'orange', btn: 'btn-warning', icon: 'fa-file-powerpoint-o' },
  'application/vnd.ms-powerpoint':                                              { priority: 70,  color: 'orange', btn: 'btn-warning', icon: 'fa-file-powerpoint-o' },
  'application/zip':                                                            { priority: 80,  color: '',       btn: 'btn-default', icon: 'fa-file-archive-o' },
  'text/html':                                                                  { priority: 80,  color: '',       btn: 'btn-default', icon: 'fa-link' },
  'default':                                                                    { priority:999,  color: 'orange', btn: 'btn-default', icon: 'fa-file-o' }
}

export default {
  ...types
} 
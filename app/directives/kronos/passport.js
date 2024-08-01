import   app          from '~/app';
import   html         from './passport.html';
import   mime         from 'mime';


import '~/services/conference-service';
import '~/directives/file';
import   nationalities               from '~/data/kronos/nationalities.js';
import   authorities                 from '~/data/kronos/authorities.js'  ;
import   participationT              from '~/i18n/participation/index.js' ;
import { toFile         , toDataUrl} from '~/services/data-converter.js'  ;

app.directive('passport', ['$http','$filter','translationService','locale','kronos',function($http, $filter, $i18n, locale, kronos) {

    return {
			restrict : "E",
			template : html,
      replace: true,
      scope: {
        participant : "=?"       ,
        request     : "=?"       ,
        binding     : "=ngModel" ,
        show        : '=?'       ,     
      },
      link:function($scope){
        $scope.binding ={};

        $http.get('/api/v2015/countries',{ params: {f:{code3:1,code:1} } }) .then(({data})=> $scope.countries = data) .then(loadBinding);
        

        $i18n.set('participationT', participationT );

        getPassport()

        async function getPassport(){
            try{

              const passportObj = $scope.participant.attachment.find(({ tag })=> tag === 'passport')

              $scope.passportObj = passportObj;

              if(!passportObj) return


              const signedUrl = await $http.post('/api/v2018/kronos/participation-requests/'+encodeURIComponent(passportObj.url)+'/sign');

              const res = await  fetch(signedUrl.data.url || signedUrl.data.signedUrl );

              const type = mime.getType(passportObj.title);

              if(!type) throw new Error('No file type given');

              $scope.passportObj.type = type;

              const tBlob = (await res.blob());
              const blob = tBlob.slice(0, tBlob.size, type );

              
              if(type.startsWith('image')) $scope.image = await toDataUrl(blob);

              const body    =  await toFile(blob, passportObj.title, { type });
              const headers = { 'Content-type':  body.type };

              if(type.startsWith('image')) $scope.binding.imageSrc = $scope.image;


              const { imageSrc, fields, valid } = (await $http.post(`https://cbd.kronos.cbddev.xyz/passports/api/read`, body, { headers })).data;

              if(!valid) $scope.triggerForm();

              $scope.valid = valid;

              if(imageSrc)
                $scope.image = imageSrc

              $scope.$applyAsync(()=> $scope.binding = mapDataToFieldsKronos(fields||{}, imageSrc || $scope.binding.imageSrc ));


            }
            catch(error){
              $scope.triggerForm();
              $scope.valid = false;

              $scope.error = error.data || error;

              if(error?.data?.imageSrc)
                $scope.$applyAsync(()=>{ 
                                    $scope.image = error.data.imageSrc;
                                    $scope.binding.imageSrc = error.data.imageSrc;
                                  });

            }
            finally{
              if(!$scope.valid) $scope.passportForm.$submitted = true;
            }
        }

        $scope.save = async () =>{
          if($scope.passportForm.$invalid) return;

          const formData = _.cloneDeep($scope.binding);

          formData.birthDate      = $filter('date')(formData.birthDate, 'yyyy-MM-dd');
          formData.expirationDate = $filter('date')(formData.expirationDate, 'yyyy-MM-dd');

          const resp = await kronos.createPassport($scope.binding.contactId, $scope.binding.conferenceId, formData);

          $scope.$applyAsync(()=>{
            $scope.participant.passport = formData;

            $scope.show = false;
          })

        }

        async function loadBinding(){
          const { conference: conferenceId } = $scope.request || {};
          const { kronosId:contactId, firstName, lastName, dateOfBirth:dob, nationality:n, passportNumber:number } = $scope.participant

          const dateOfBirth      = dob? new Date(`${dob}\n`): undefined;
          const nationality      =  getCode3(n);
          const issuingAuthority = nationality;

          if(!nationality)
            $scope.binding = { ...$scope.binding, number,conferenceId, contactId, firstName, lastName, birthDate: dateOfBirth }
          else
            $scope.binding = { ...$scope.binding, number,nationality, issuingAuthority, conferenceId, contactId, firstName, lastName, birthDate: dateOfBirth }
        }

        function getCode3(c){
          const country = $scope.countries?.find(({code})=> code === c);

          return country?.code3

        }

        function mapDataToFieldsKronos(data, imageSrc ){
          const { birthDate: bd, expirationDate: ed, } = data;
        
          const birthDate = bd? (new Date(`${bd}\n`)) : null;
          const expirationDate = ed ? (new Date(`${ed}\n`)) : null;

          $scope.binding = { ...$scope.binding, ...data, birthDate, expirationDate, imageSrc };

          return $scope.binding;
        }

        $scope.triggerForm = ()=> {
          const button = document.getElementById('save');

          button.click()
        }
        $scope.previewImage = async (picture) =>{
          let objUrl = null;
          try {
            objUrl = URL.createObjectURL(await toFile(picture, { filename: 'preview.jpg' }));
        
            const anchor = document.createElement('a');
            anchor.href = objUrl;
            anchor.target = 'preview';
            anchor.click();
          } finally {
            if (objUrl) { URL.revokeObjectURL(objUrl); }
          }
        }
      }
		};
	}]);


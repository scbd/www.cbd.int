<template>
    <div>
        <footer class="footer" style="position: unset;">

            <div id="block-followblock" class="follow-us settings-tray-editable block block-cbd-utility block-follow-block"
                data-drupal-settingstray="editable">


                <div class="container">
                    <div class="row">
                        <div class="col-12 col-lg-3 d-flex align-items-center">
                            <div class="h2 text-white text-uppercase m-0">{{$t('followUs')}}</div>
                        </div>
                        <div class="col-12 col-lg-9">
                            <div class="nav flex-follow-us">
                                <a href="http://www.youtube.com/user/chmcbd" title="YouTube">
                                    <img src="https://www.cbd.int/themes/custom/bootstrap_sass/images/someround_youtube_neg.svg" alt="YouTube"
                                        loading="lazy">
                                </a>
                                <a href="http://www.facebook.com/UNBiodiversity" title="Facebook">
                                    <img src="https://www.cbd.int/themes/custom/bootstrap_sass/images/someround_facebook_neg.svg"
                                        alt="Facebook" loading="lazy">
                                </a>
                                <a href="https://twitter.com/unbiodiversity" title="Twitter">
                                    <img src="https://www.cbd.int/themes/custom/bootstrap_sass/images/someround_twitter_neg.svg" alt="Twitter"
                                        loading="lazy">
                                </a>
                                <a href="https://www.linkedin.com/company/unbiodiversity" title="LinkedIn">
                                    <img src="https://www.cbd.int/themes/custom/bootstrap_sass/images/someround_linkedin_neg.svg"
                                        alt="LinkedIn" loading="lazy">
                                </a>
                                <a href="https://instagram.com/unbiodiversity" title="Instagram">
                                    <img src="https://www.cbd.int/themes/custom/bootstrap_sass/images/someround_instagram_neg.svg"
                                        alt="Instagram" loading="lazy">
                                </a>
                                <a href="https://www.cbd.int/rss" title="RSS">
                                    <img src="https://www.cbd.int/themes/custom/bootstrap_sass/images/someround_feed_neg.svg" alt="RSS"
                                        loading="lazy">
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>




            <div class="cbd-footer">
                <div class="container">
                    <div class="row">
                        <div id="block-quicklinksblock"
                            class="footer-block footer-margin col-12 col-lg-5 settings-tray-editable block block-cbd-utility block-quick-links-block"
                            data-drupal-settingstray="editable">


                            <h5 class="h4 text-uppercase">{{$t('quickLinks')}}</h5>
                            <hr>
                            <div class="footer-links two-column">
                                <a href="https://absch.cbd.int/" :title="$t('accessAndBenefitSharingClearingHouse')">{{$t('accessAndBenefitSharingClearingHouse')}}</a>
                                <a href="https://bch.cbd.int/" :title="$t('biosafetyClearingHouse')">{{$t('biosafetyClearingHouse')}}</a>
                                <a href="https://chm.cbd.int/" :title="$t('clearingHouseMechanism')">{{$t('clearingHouseMechanism')}}</a>
                                <a href="https://www.cbd.int/contributions" :title="$t('contributions')">{{$t('contributions')}}</a>
                                <a href="https://www.cbd.int/countries/" :title="$t('countryProfiles')">{{$t('countryProfiles')}}</a>
                                <a href="https://www.cbd.int/meetings/" :title="$t('meetingsAndEvents')">{{$t('meetingsAndEvents')}}</a>
                                <a href="https://www.cbd.int/nbsap" :title="$t('nbspas')">{{$t('nbspas')}}</a>
                                <a href="https://www.cbd.int/nfp" :title="$t('nationalFocalPoints')">{{$t('nationalFocalPoints')}}</a>
                                <a href="https://www.cbd.int/reports" :title="$t('nationalReports')">{{$t('nationalReports')}}</a>
                                <a href="https://www.cbd.int/news/" :title="$t('newsHeadlines')">{{$t('newsHeadlines')}}</a>
                                <a href="https://www.cbd.int/notifications/" :title="$t('notifications')">{{$t('notifications')}}</a>
                                <a href="https://www.cbd.int/parties" :title="$t('parties')">{{$t('parties')}}</a>
                                <a href="https://www.cbd.int/publications" :title="$t('publications')">{{$t('publications')}}</a>
                            </div>

                        </div>


                        <div id="block-topicsfooterblock"
                            class="footer-block footer-margin col-12 col-lg-3 settings-tray-editable block block-cbd-utility block-topics-footer-block"
                            data-drupal-settingstray="editable">


                            <h5 class="h4 text-uppercase">{{$t('topics')}}</h5>
                            <hr>
                            <div class="footer-links">
                                <a href="https://www.cbd.int/topic/business-women-youth-and-other-stakeholders"
                                    :title="$t('bwy')">{{$t('bwy')}}</a>
                                <a href="https://www.cbd.int/topic/climate-change" :title="$t('climateChange')">{{$t('climateChange')}}</a>
                                <a href="https://www.cbd.int/topic/poverty-reduction" :title="$t('povertyReduction')">{{$t('povertyReduction')}}</a>
                                <a href="https://www.cbd.int/topic/food" :title="$t('food')">{{$t('food')}}</a>
                                <a href="https://www.cbd.int/topic/water" :title="$t('water')">{{$t('water')}}</a>
                                <a href="https://www.cbd.int/topic/indigenous-peoples-and-local-communities"
                                    :title="$t('iplcs')">{{$t('iplcs')}}</a>
                            </div>

                        </div>



                        <div class="desktop-only footer-block footer-margin col-6 col-lg-2">
                            <h5 class="h4 text-uppercase">{{$t('info')}}</h5>
                            <hr>
                            <div class="flex-one-column">
                                <a href="https://www.cbd.int/contact" :title="$t('contactUs')">{{$t('contactUs')}}</a>
                                <a href="https://www.cbd.int/terms" :title="$t('termsOfUse')">{{$t('termsOfUse')}}</a>
                                <a href="https://www.cbd.int/privacy" :title="$t('pp')">{{$t('pp')}}</a>
                                <a href="https://www.cbd.int/credits" :title="$t('credits')">{{$t('credits')}}</a>
                                <a href="https://www.cbd.int/copyright" :title="$t('cbdSecretariat')">{{$t('cbdSecretariat')}}</a>
                            </div>
                        </div>
                        <div class="desktop-only footer-block footer-margin col-6 col-lg-2">
                            <h5 class="h4 text-uppercase">A part of</h5>
                            <hr>
                            <img class="uno-brand" src="https://www.cbd.int/themes/custom/bootstrap_sass/images/UN_brand_neg.svg" alt="UN logo"
                                loading="lazy">
                            <img class="uno-environment"
                                src="https://www.cbd.int/themes/custom/bootstrap_sass/images/UNEP_2019_brand_white.svg"
                                alt="UN Environment Programme logo" loading="lazy">
                        </div>

                        <div class="mobile-only footer-block footer-margin col-12">
                            <div class="row">
                                <div class="col-6">
                                    <div class="footer-headline">{{$t('infoCaps')}}</div>
                                </div>
                                <div class="col-6">
                                    <div class="footer-headline">{{$t('aPartOf')}}</div>
                                </div>
                            </div>
                            <div class="row">
                                <div class=" col-12">
                                    <hr>
                                </div>
                            </div>
                            <div class="row">
                                <div class="footer-block col-6 ">
                                    <div class="flex-one-column">
                                        <a href="https://www.cbd.int/contact" :title="$t('contactUs')">{{$t('contactUs')}}</a>
                                        <a href="https://www.cbd.int/terms" :title="$t('termsOfUse')">{{$t('termsOfUse')}}</a>
                                        <a href="https://www.cbd.int/privacy" :title="$t('pp')">{{$t('pp')}}</a>
                                        <a href="https://www.cbd.int/credits" :title="$t('credits')">{{$t('credits')}}</a>
                                        <a href="https://www.cbd.int/copyright" :title="$t('cbdSecretariat')">{{$t('cbdSecretariat')}}</a>
                                    </div>
                                </div>
                                <div class="footer-block col-6 ">
                                    <img class="uno-brand" src="https://www.cbd.int/themes/custom/bootstrap_sass/images/UN_brand_neg.svg"
                                        alt="UN logo" loading="lazy">
                                    <img class="uno-environment"
                                        src="https://www.cbd.int/themes/custom/bootstrap_sass/images/UNEP_2019_brand_white.svg"
                                        alt="UN Environment Programme logo" loading="lazy">
                                </div>
                            </div>
                        </div>




                    </div>
                </div>
            </div>


        </footer>
    </div>
</template>
<script>
import messages from '~/i18n/shared/index.js'
export default {
    name: 'ScbdFooter',
    data() {
        return {
        }
    }, 
    computed : {
    },
    mounted() {      
        
    },
    methods:{
    },
    i18n: {
        messages
    },
}
</script>

<style scoped src="./cbd.css"></style>
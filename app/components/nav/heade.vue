<template>
    <div>
        <header id="header" class="header" role="banner" aria-label="Site header">
            <svg  aria-hidden="true" version="1.1" xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                style="position: absolute; width: 0px; height: 0px; overflow: hidden;">
                <defs >
                    <symbol  id="icon-sign-out" viewBox="0 0 25 28">
                        <title > {{$t('signOut')}}</title>
                        <path 
                            d="M10 22.5c0 0.438 0.203 1.5-0.5 1.5h-5c-2.484 0-4.5-2.016-4.5-4.5v-11c0-2.484 2.016-4.5 4.5-4.5h5c0.266 0 0.5 0.234 0.5 0.5 0 0.438 0.203 1.5-0.5 1.5h-5c-1.375 0-2.5 1.125-2.5 2.5v11c0 1.375 1.125 2.5 2.5 2.5h4.5c0.391 0 1-0.078 1 0.5zM24.5 14c0 0.266-0.109 0.516-0.297 0.703l-8.5 8.5c-0.187 0.187-0.438 0.297-0.703 0.297-0.547 0-1-0.453-1-1v-4.5h-7c-0.547 0-1-0.453-1-1v-6c0-0.547 0.453-1 1-1h7v-4.5c0-0.547 0.453-1 1-1 0.266 0 0.516 0.109 0.703 0.297l8.5 8.5c0.187 0.187 0.297 0.438 0.297 0.703z">
                        </path>
                    </symbol>
                    <symbol  id="icon-profile" viewBox="0 0 20 28">
                        <title >{{$t('profile')}}</title>
                        <path 
                            d="M20 21.859c0 2.281-1.5 4.141-3.328 4.141h-13.344c-1.828 0-3.328-1.859-3.328-4.141 0-4.109 1.016-8.859 5.109-8.859 1.266 1.234 2.984 2 4.891 2s3.625-0.766 4.891-2c4.094 0 5.109 4.75 5.109 8.859zM16 8c0 3.313-2.688 6-6 6s-6-2.688-6-6 2.688-6 6-6 6 2.688 6 6z">
                        </path>
                    </symbol>
                    <symbol  id="icon-password" viewBox="0 0 18 28">
                        <title >{{$t('password')}}</title>
                        <path 
                            d="M5 12h8v-3c0-2.203-1.797-4-4-4s-4 1.797-4 4v3zM18 13.5v9c0 0.828-0.672 1.5-1.5 1.5h-15c-0.828 0-1.5-0.672-1.5-1.5v-9c0-0.828 0.672-1.5 1.5-1.5h0.5v-3c0-3.844 3.156-7 7-7s7 3.156 7 7v3h0.5c0.828 0 1.5 0.672 1.5 1.5z">
                        </path>
                    </symbol>
                    <symbol  id="icon-lock" viewBox="0 0 32 32">
                        <title >{{$t('lock')}}</title>
                        <path 
                            d="M15 21.915v0c-0.583-0.206-1-0.762-1-1.415 0-0.828 0.672-1.5 1.5-1.5s1.5 0.672 1.5 1.5c0 0.653-0.417 1.209-1 1.415v2.594c0 0.263-0.224 0.491-0.5 0.491-0.268 0-0.5-0.22-0.5-0.491v-2.594zM8 14v0 0c-1.658 0.005-3 1.34-3 3.009v9.981c0 1.662 1.346 3.009 3.009 3.009h14.982c1.662 0 3.009-1.337 3.009-3.009v-9.981c0-1.659-1.341-3.005-3-3.009v-3.501c0-4.142-3.366-7.499-7.5-7.499-4.142 0-7.5 3.357-7.5 7.499v3.501zM11 14v-3.499c0-2.492 2.015-4.501 4.5-4.501 2.48 0 4.5 2.015 4.5 4.501v3.499h-9z">
                        </path>
                    </symbol>
                    <symbol  id="icon-search" viewBox="0 0 250 270"
                        preserveAspectRatio="xMidYMid meet">
                        <title >{{$t('search')}}</title>
                        <path 
                            d="M16 254 c-20 -20 -20 -22 5 -63 14 -24 19 -44 15 -63 -7 -37 15 -90 45 -112 13 -9 43 -16 67 -16 62 0 102 40 102 104 0 64 -40 109 -100 112 -31 1 -49 9 -67 28 -27 30 -45 33 -67 10z m164 -104 c36 -36 14 -100 -34 -100 -60 1 -81 79 -29 109 26 15 41 13 63 -9z">
                        </path>
                    </symbol>
                    <symbol  id="icon-menu" viewBox="0 0 24 24">
                        <title >{{$t('menu')}}</title>
                        <path 
                            d="M-1.77635684e-15,-8.8817842e-16 L29.461538,-8.8817842e-16 L29.461538,2 L-1.77635684e-15,2 L-1.77635684e-15,-8.8817842e-16 Z M4.91025633,10.6407675 L4.91025633,9.64076753 L29.461538,9.64076753 L29.461538,10.6407675 L4.91025633,10.6407675 Z M-1.77635684e-15,20.2777774 L-1.77635684e-15,18.2777774 L29.461538,18.2777774 L29.461538,20.2777774 L-1.77635684e-15,20.2777774 Z">
                        </path>
                    </symbol>
                    <symbol  id="icon-close" viewBox="0 0 30 30">
                        <title >{{$t('close')}}</title>
                        <path 
                            d="M18.984 6.422l-5.578 5.578 5.578 5.578-1.406 1.406-5.578-5.578-5.578 5.578-1.406-1.406 5.578-5.578-5.578-5.578 1.406-1.406 5.578 5.578 5.578-5.578z">
                        </path>
                    </symbol>
                    <filter  id="blur" x="0" y="0">
                        <feGaussianBlur  in="SourceGraphic" stdDeviation=".5"></feGaussianBlur>
                    </filter>
                </defs>
            </svg>
            <nav class="navbar navbar-expand-lg navbar-light bg-white" >
                <a class="navbar-brand" href="https://www.cbd.int/" :title="$t('scbd')">
                    <img src="https://www.cbd.int/themes/custom/bootstrap_sass/images/CBD_logo_green.png"
                        :alt="$t('scbd')">
                </a>
                <button class="navbar-toggler hamburger-icon collapsed" type="button" data-toggle="collapse"
                    data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                    aria-label="Toggle navigation">
                    <span class="line line-1"></span>
                    <span class="line line-2"></span>
                    <span class="line line-3"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                    <div class="navbar-wrapper">
                        <div class="nav-top">

                            <ul class="navbar-nav mr-auto">


                                <li class="topmenu nav-item dropdown">
                                    <a class="nav-link dropdown-toggle" href="" role="button" data-toggle="dropdown"
                                        aria-haspopup="true" aria-expanded="false" :title="$t('info')">

                                        {{$t('info')}}

                                    </a>
                                    <div class="information dropdown-menu">
                                        <div class="dropdown-item-container">

                                            <a href="https://www.cbd.int/contact" :title="$t('contactUs')" class="dropdown-item">
                                                <span class="dropdown-item-label">{{$t('contactUs')}}</span>
                                            </a>


                                            <a href="https://www.cbd.int/terms" :title="$t('termsOfUse')" class="dropdown-item">
                                                <span class="dropdown-item-label">{{$t('termsOfUse')}}</span>
                                            </a>


                                            <a href="https://www.cbd.int/privacy" :title="$t('pp')"
                                                class="dropdown-item"> <span class="dropdown-item-label">{{$t('pp')}}</span>
                                            </a>


                                            <a href="https://www.cbd.int/credits" :title="$t('credits')" class="dropdown-item">
                                                <span class="dropdown-item-label">{{$t('credits')}}</span>
                                            </a>


                                            <a href="https://www.cbd.int/copyright" title="© CBD Secretariat"
                                                class="dropdown-item"> <span class="dropdown-item-label">{{$t('cbdSecretariat')}}</span>
                                            </a>

                                        </div>
                                    </div>
                                </li>
                                <li class="topmenu nav-item dropdown">
                                    <a class="nav-link dropdown-toggle" href="" role="button" data-toggle="dropdown"
                                        aria-haspopup="true" aria-expanded="false" :title="$t('aboutTheSecretariat')">

                                        {{$t('aboutTheSecretariat')}}

                                    </a>

                                    <div class="about dropdown-menu">
                                        <div class="dropdown-item-container">

                                            <a href="https://www.cbd.int/staff" :title="$t('staff')" class="dropdown-item"> <span
                                                    class="dropdown-item-label">{{$t('staff')}}</span>
                                            </a>


                                            <a href="https://www.cbd.int/secretariat/executive-secretary/"
                                                :title="$t('es')" class="dropdown-item"> <span
                                                    class="dropdown-item-label">{{$t('es')}}</span>
                                            </a>


                                            <a href="https://www.cbd.int/museum" :title="$t('museumOfNatureAndCulture')"
                                                class="dropdown-item">
                                                <span class="dropdown-item-label">{{$t('museumOfNatureAndCulture')}}</span>
                                            </a>


                                            <a href="https://www.cbd.int/secretariat/initiatives.shtml" :title="$t('initiatives')"
                                                class="dropdown-item"> <span
                                                    class="dropdown-item-label">{{$t('initiatives')}}</span>
                                            </a>


                                            <a href="https://www.cbd.int/secretariat/documents.shtml"
                                                :title="$t('docs')" class="dropdown-item"> <span
                                                    class="dropdown-item-label">{{$t('docs')}}</span>
                                            </a>


                                            <a href="https://www.cbd.int/employment" :title="$t('employmentOpportunities')"
                                                class="dropdown-item">
                                                <span class="dropdown-item-label">{{$t('employmentOpportunities')}}</span>
                                            </a>


                                            <a href="https://www.cbd.int/secretariat/business"
                                                :title="$t('doingBiz')" class="dropdown-item"> <span
                                                    class="dropdown-item-label">{{$t('doingBiz')}}</span>
                                            </a>

                                        </div>
                                    </div>

                                </li>


                            </ul>
                            <ul class="navbar-nav">
                                <li class="nav-item" v-if="!isAuthenticated">
                                    <a id="accountsLink-SNE"
                                        v-bind:href="$accountsBaseUrl+`/signin?returnUrl=${encodeURIComponent(returnUrl)}`"
                                        class="nav-link login di"> 
                                        <span>{{$t('login')}} </span>
                                        <span v-if="isAuthenticated">
                                            {{$t('welcomeUserName')}} {{user.name}}
                                        </span>
                                        <svg class="icon icon-lock">
                                            <use xlink:href="#icon-lock"></use>
                                        </svg>
                                    </a>                                
                                </li>
                                <li class="topmenu nav-item dropdown" v-if="isAuthenticated">                                      
                                    <a class="nav-link dropdown-toggle" href="" role="button" data-toggle="dropdown"
                                        aria-haspopup="true" aria-expanded="false" title="User" > 
                                        {{$t('welcomeUserName')}} {{user.name}}
                                        <svg class="icon icon-lock">
                                            <use xlink:href="#icon-lock"></use>
                                        </svg>
                                    </a>     
                                    <div class="user-profile dropdown-menu">
                                        <div class="dropdown-item-container">
                                            <a v-bind:href="$accountsBaseUrl+'/profile'" :title="$t('profile')" class="dropdown-item"> <span
                                                    class="dropdown-item-label">{{$t('profile')}}</span></a>
                                            <a v-bind:href="$accountsBaseUrl+'/password'" :title="$t('password')" class="dropdown-item"> <span
                                                    class="dropdown-item-label">{{$t('password')}}</span></a>
                                            <a href="" v-on:click.stop.prevent="logout()" title="Sign Out" class="dropdown-item"> <span
                                                    class="dropdown-item-label">{{$t('signOut')}}</span></a>
                                        </div>
                                    </div>  
                                </li>
                            </ul>
                            <ul class="navbar-nav">
                                <li class="topmenu nav-item dropdown">
                                    <a class="nav-link dropdown-toggle" href="" role="button" data-toggle="dropdown"
                                        aria-haspopup="true" aria-expanded="false" title="Language">
                                        {{languages[$locale||'en']}} <span class="flag-icon"></span>
                                    </a>

                                    <div class="Languages dropdown-menu">
                                        <div class="dropdown-item-container">
                                            <a v-for="(lang, key) in languages" v-bind:href="`/language-switch?lg=${encodeURIComponent(key)}&returnUrl=${encodeURIComponent(returnUrl)}`" 
                                                v-bind:title="lang" class="dropdown-item" :key="lang"> <span
                                                    class="dropdown-item-label">{{lang}}</span></a>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <div id="block-topsearchblock"
                                class="settings-tray-editable block block-cbd-utility block-top-search-block"
                                data-drupal-settingstray="editable">



                                <form class="views-exposed-form" data-drupal-selector="views-exposed-form-search-search"
                                    action="https://www.cbd.int/search" method="get" id="views-exposed-form-search-search"
                                    accept-charset="UTF-8">
                                    <div class="form-row">
                                        <div data-drupal-selector="edit-actions" class="form-actions"
                                            id="edit-actions--2">
                                            <input data-drupal-selector="edit-submit-search" type="submit"
                                                id="edit-submit-search" value="Submit"
                                                class="button js-form-submit form-submit btn btn-primary form-control">
                                        </div>




                                        <fieldset
                                            class="js-form-item js-form-type-textfield form-type-textfield js-form-item-query form-item-query form-group">
                                            <label for="edit-query">{{$t('search')}}</label>
                                            <input data-drupal-selector="edit-query" :placeholder="$t('search')" type="text"
                                                id="edit-query" name="query" value="" size="30" maxlength="128"
                                                class="form-text form-control">

                                        </fieldset>

                                    </div>

                                </form>


                            </div>
                        </div>
                        <div class="nav-main">



                            <ul class="navbar-nav main-nav">
                                <li class="nav-item  main-menu-item">
                                    <a class="nav-link " href="https://www.cbd.int/convention/" role="button"
                                        :title="$t('biodiversityConvention')">
                                        {{$t('biodiversityConvention')}}
                                    </a>

                                </li>
                                <li class="nav-item  main-menu-item">
                                    <a class="nav-link " href="http://bch.cbd.int/protocol" role="button"
                                        :title="$t('cartagenaProtocol')">
                                        {{$t('cartagenaProtocol')}}
                                    </a>

                                </li>
                                <li class="nav-item  main-menu-item">
                                    <a class="nav-link " href="https://www.cbd.int/abs" role="button"
                                        :title="$t('nagoyaProtocol')">
                                        {{$t('nagoyaProtocol')}}
                                    </a>

                                </li>
                                <li class="nav-item  main-menu-item">
                                    <a class="nav-link " href="https://www.cbd.int/countries" role="button"
                                        :title="$t('countries')">
                                        {{$t('countries')}}
                                    </a>

                                </li>
                                <li class="nav-item  main-menu-item">
                                    <a class="nav-link " href="https://www.cbd.int/programmes/" role="button"
                                        :title="$t('programmes')">
                                        {{$t('programmes')}}
                                    </a>

                                </li>




                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    </div>
</template>
<script>
import messages from '~/i18n/shared/index.js'
import { UN as UNlanguages }  from '~/data/languages.js'

export default {
    name: 'ScbdHeader',
    data() {
        return {
            isAuthenticated : false,
            user            : undefined,
            returnUrl       : undefined,
            languages       : { ... UNlanguages } 
        }
    }, 
    i18n: {
        messages
    },
    computed : {
        userName(){
            if(this.user?.userID > 1)
                return this.user.userName;
        }
    },
    mounted() {      
        this.returnUrl = window.location.href;   
        setTimeout(async() => {
            const user = await Vue?.prototype.$auth.fetchUser()
            this.user = user;
            this.isAuthenticated = user.isAuthenticated;
        }, 1000);
    },
    methods:{
        async logout(){
            await Vue?.prototype.$auth.logout();
        }
    }
}
</script>

<style scoped src="./cbd.css"></style>
<style scoped>
.icon {
    display: inline-block;
    width: 1em;
    height: 1em;
    stroke-width: 0;
    stroke: currentColor;
    fill: currentColor
}

.icon-sign-out {
    width: .875em
}

.icon-profile {
    width: .7138671875em
}

.icon-lock {
    width: .8em;
    margin-bottom: .25em
}

.icon-search {
    width: 1em;
    fill: #fff
}

.icon-menu {
    width: 1.6em;
    fill: #fff
}

.icon-close {
    font-size: 1.5em;
    fill: #fff
}

.flag-icon {
    background-image: url(https://cdn.cbd.int/@scbd/www-css@0.0.17/dist/images/icon_language_neg.png);
    background-repeat: no-repeat;
    height: 12px;
    width: 12px;
    display: inline-block;
    background-size: 11px 12px;
    margin-left: 4px
}

.navbar .nav-top .navbar-nav .nav-item .nav-link,
.navbar .nav-top .navbar-nav .nav-item .dropdown-item{
    font-size: 16px!important;
}

</style>

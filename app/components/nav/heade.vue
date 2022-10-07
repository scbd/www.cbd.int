<template>
    <div>

        <!-- <link rel="preload"
            href="https://www.cbd.int/themes/custom/bootstrap_sass/fonts/benchnine-v9-latin-regular.woff2" as="font"
            type="font/woff2" crossorigin=""> -->

        <header id="header" class="header" role="banner" aria-label="Site header">
            <svg  aria-hidden="true" version="1.1" xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                style="position: absolute; width: 0px; height: 0px; overflow: hidden;">
                <defs >
                    <symbol  id="icon-sign-out" viewBox="0 0 25 28">
                        <title >Sign Out</title>
                        <path 
                            d="M10 22.5c0 0.438 0.203 1.5-0.5 1.5h-5c-2.484 0-4.5-2.016-4.5-4.5v-11c0-2.484 2.016-4.5 4.5-4.5h5c0.266 0 0.5 0.234 0.5 0.5 0 0.438 0.203 1.5-0.5 1.5h-5c-1.375 0-2.5 1.125-2.5 2.5v11c0 1.375 1.125 2.5 2.5 2.5h4.5c0.391 0 1-0.078 1 0.5zM24.5 14c0 0.266-0.109 0.516-0.297 0.703l-8.5 8.5c-0.187 0.187-0.438 0.297-0.703 0.297-0.547 0-1-0.453-1-1v-4.5h-7c-0.547 0-1-0.453-1-1v-6c0-0.547 0.453-1 1-1h7v-4.5c0-0.547 0.453-1 1-1 0.266 0 0.516 0.109 0.703 0.297l8.5 8.5c0.187 0.187 0.297 0.438 0.297 0.703z">
                        </path>
                    </symbol>
                    <symbol  id="icon-profile" viewBox="0 0 20 28">
                        <title >Profile</title>
                        <path 
                            d="M20 21.859c0 2.281-1.5 4.141-3.328 4.141h-13.344c-1.828 0-3.328-1.859-3.328-4.141 0-4.109 1.016-8.859 5.109-8.859 1.266 1.234 2.984 2 4.891 2s3.625-0.766 4.891-2c4.094 0 5.109 4.75 5.109 8.859zM16 8c0 3.313-2.688 6-6 6s-6-2.688-6-6 2.688-6 6-6 6 2.688 6 6z">
                        </path>
                    </symbol>
                    <symbol  id="icon-password" viewBox="0 0 18 28">
                        <title >Password</title>
                        <path 
                            d="M5 12h8v-3c0-2.203-1.797-4-4-4s-4 1.797-4 4v3zM18 13.5v9c0 0.828-0.672 1.5-1.5 1.5h-15c-0.828 0-1.5-0.672-1.5-1.5v-9c0-0.828 0.672-1.5 1.5-1.5h0.5v-3c0-3.844 3.156-7 7-7s7 3.156 7 7v3h0.5c0.828 0 1.5 0.672 1.5 1.5z">
                        </path>
                    </symbol>
                    <symbol  id="icon-lock" viewBox="0 0 32 32">
                        <title >Lock</title>
                        <path 
                            d="M15 21.915v0c-0.583-0.206-1-0.762-1-1.415 0-0.828 0.672-1.5 1.5-1.5s1.5 0.672 1.5 1.5c0 0.653-0.417 1.209-1 1.415v2.594c0 0.263-0.224 0.491-0.5 0.491-0.268 0-0.5-0.22-0.5-0.491v-2.594zM8 14v0 0c-1.658 0.005-3 1.34-3 3.009v9.981c0 1.662 1.346 3.009 3.009 3.009h14.982c1.662 0 3.009-1.337 3.009-3.009v-9.981c0-1.659-1.341-3.005-3-3.009v-3.501c0-4.142-3.366-7.499-7.5-7.499-4.142 0-7.5 3.357-7.5 7.499v3.501zM11 14v-3.499c0-2.492 2.015-4.501 4.5-4.501 2.48 0 4.5 2.015 4.5 4.501v3.499h-9z">
                        </path>
                    </symbol>
                    <symbol  id="icon-search" viewBox="0 0 250 270"
                        preserveAspectRatio="xMidYMid meet">
                        <title >Search</title>
                        <path 
                            d="M16 254 c-20 -20 -20 -22 5 -63 14 -24 19 -44 15 -63 -7 -37 15 -90 45 -112 13 -9 43 -16 67 -16 62 0 102 40 102 104 0 64 -40 109 -100 112 -31 1 -49 9 -67 28 -27 30 -45 33 -67 10z m164 -104 c36 -36 14 -100 -34 -100 -60 1 -81 79 -29 109 26 15 41 13 63 -9z">
                        </path>
                    </symbol>
                    <symbol  id="icon-menu" viewBox="0 0 24 24">
                        <title >Menu</title>
                        <path 
                            d="M-1.77635684e-15,-8.8817842e-16 L29.461538,-8.8817842e-16 L29.461538,2 L-1.77635684e-15,2 L-1.77635684e-15,-8.8817842e-16 Z M4.91025633,10.6407675 L4.91025633,9.64076753 L29.461538,9.64076753 L29.461538,10.6407675 L4.91025633,10.6407675 Z M-1.77635684e-15,20.2777774 L-1.77635684e-15,18.2777774 L29.461538,18.2777774 L29.461538,20.2777774 L-1.77635684e-15,20.2777774 Z">
                        </path>
                    </symbol>
                    <symbol  id="icon-close" viewBox="0 0 30 30">
                        <title >Close</title>
                        <path 
                            d="M18.984 6.422l-5.578 5.578 5.578 5.578-1.406 1.406-5.578-5.578-5.578 5.578-1.406-1.406 5.578-5.578-5.578-5.578 1.406-1.406 5.578 5.578 5.578-5.578z">
                        </path>
                    </symbol>
                    <filter  id="blur" x="0" y="0">
                        <feGaussianBlur  in="SourceGraphic" stdDeviation=".5"></feGaussianBlur>
                    </filter>
                </defs>
            </svg>
            <nav class="navbar navbar-expand-lg navbar-light bg-white">
                <a class="navbar-brand" href="https://cbd.int/" title="Convention on Biological Diversity">
                    <img src="https://cbd.int/themes/custom/bootstrap_sass/images/CBD_logo_green.png"
                        alt="Convention on Biological Diversity">
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
                                        aria-haspopup="true" aria-expanded="false" title="Information">

                                        Information

                                    </a>
                                    <div class="Information dropdown-menu">
                                        <div class="dropdown-item-container">

                                            <a href="https://cbd.int/contact" title="Contact us" class="dropdown-item">
                                                <span class="dropdown-item-label">Contact us</span>
                                            </a>


                                            <a href="https://cbd.int/terms" title="Terms of Use" class="dropdown-item">
                                                <span class="dropdown-item-label">Terms of Use</span>
                                            </a>


                                            <a href="https://cbd.int/privacy" title="Privacy Policy"
                                                class="dropdown-item"> <span class="dropdown-item-label">Privacy
                                                    Policy</span>
                                            </a>


                                            <a href="https://cbd.int/credits" title="Credits" class="dropdown-item">
                                                <span class="dropdown-item-label">Credits</span>
                                            </a>


                                            <a href="https://cbd.int/copyright" title="© CBD Secretariat"
                                                class="dropdown-item"> <span class="dropdown-item-label">© CBD
                                                    Secretariat</span>
                                            </a>

                                        </div>
                                    </div>
                                </li>
                                <li class="topmenu nav-item dropdown">
                                    <a class="nav-link dropdown-toggle" href="" role="button" data-toggle="dropdown"
                                        aria-haspopup="true" aria-expanded="false" title="About the Secretariat">

                                        About the Secretariat

                                    </a>

                                    <div class="About the Secretariat dropdown-menu">
                                        <div class="dropdown-item-container">

                                            <a href="https://cbd.int/staff" title="Staff" class="dropdown-item"> <span
                                                    class="dropdown-item-label">Staff</span>
                                            </a>


                                            <a href="https://cbd.int/secretariat/executive-secretary/"
                                                title="Executive Secretary" class="dropdown-item"> <span
                                                    class="dropdown-item-label">Executive
                                                    Secretary</span>
                                            </a>


                                            <a href="https://cbd.int/museum" title="Museum of Nature and Culture"
                                                class="dropdown-item">
                                                <span class="dropdown-item-label">Museum of Nature and Culture</span>
                                            </a>


                                            <a href="https://cbd.int/secretariat/initiatives.shtml" title="Initiatives"
                                                class="dropdown-item"> <span
                                                    class="dropdown-item-label">Initiatives</span>
                                            </a>


                                            <a href="https://cbd.int/secretariat/documents.shtml"
                                                title="Secretariat Documents" class="dropdown-item"> <span
                                                    class="dropdown-item-label">Secretariat
                                                    Documents</span>
                                            </a>


                                            <a href="https://cbd.int/employment" title="Employment Opportunities"
                                                class="dropdown-item">
                                                <span class="dropdown-item-label">Employment Opportunities</span>
                                            </a>


                                            <a href="https://cbd.int/secretariat/business"
                                                title="Doing Business with the CBD" class="dropdown-item"> <span
                                                    class="dropdown-item-label">Doing Business
                                                    with
                                                    the CBD</span>
                                            </a>

                                        </div>
                                    </div>

                                </li>


                            </ul>
                            <ul class="navbar-nav">
                                <li class="nav-item" v-if="!isAuthenticated">
                                    <a id="accountsLink-SNE"
                                        v-bind:href="$accountsBaseUrl+'/signin?returnUrl='+returnUrl"
                                        class="nav-link login di"> 
                                        <span>Login </span>
                                        <span v-if="isAuthenticated">
                                            Welcome {{user.name}}
                                        </span>
                                        <svg class="icon icon-lock">
                                            <use xlink:href="#icon-lock"></use>
                                        </svg>
                                    </a>                                
                                </li>
                                <li class="topmenu nav-item dropdown" v-if="isAuthenticated">                                      
                                    <a class="nav-link dropdown-toggle" href="" role="button" data-toggle="dropdown"
                                        aria-haspopup="true" aria-expanded="false" title="User" > 
                                        Welcome {{user.name}}
                                        <svg class="icon icon-lock">
                                            <use xlink:href="#icon-lock"></use>
                                        </svg>
                                    </a>     
                                    <div class="user-profile dropdown-menu">
                                        <div class="dropdown-item-container">
                                            <a v-bind:href="$accountsBaseUrl+'/profile'" title="Profile" class="dropdown-item"> <span
                                                    class="dropdown-item-label">Profile</span></a>
                                            <a v-bind:href="$accountsBaseUrl+'/password'" title="Password" class="dropdown-item"> <span
                                                    class="dropdown-item-label">Password</span></a>
                                            <a href="" v-on:click="logout()" title="Sign Out" class="dropdown-item"> <span
                                                    class="dropdown-item-label">Sign out</span></a>
                                        </div>
                                    </div>  
                                </li>
                            </ul>
                            <ul class="navbar-nav">
                                <li class="topmenu nav-item dropdown">
                                    <a class="nav-link dropdown-toggle" href="" role="button" data-toggle="dropdown"
                                        aria-haspopup="true" aria-expanded="false" title="Language">
                                        English <span class="flag-icon"></span>
                                    </a>

                                    <div class="Languages dropdown-menu">
                                        <div class="dropdown-item-container">
                                            <a href="language/ar" title="العربية" class="dropdown-item"> <span
                                                    class="dropdown-item-label">العربية</span></a>
                                            <a href="language/es" title="Español" class="dropdown-item"> <span
                                                    class="dropdown-item-label">Español</span></a>
                                            <a href="language/en" title="English" class="dropdown-item"> <span
                                                    class="dropdown-item-label">English</span></a>
                                            <a href="language/fr" title="Français" class="dropdown-item"> <span
                                                    class="dropdown-item-label">Français</span></a>
                                            <a href="language/ru" title="Русский" class="dropdown-item"> <span
                                                    class="dropdown-item-label">Русский</span></a>
                                            <a href="language/zh" title="中文" class="dropdown-item"> <span
                                                    class="dropdown-item-label">中文</span></a>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <div id="block-topsearchblock"
                                class="settings-tray-editable block block-cbd-utility block-top-search-block"
                                data-drupal-settingstray="editable">



                                <form class="views-exposed-form" data-drupal-selector="views-exposed-form-search-search"
                                    action="https://cbd.int/search" method="get" id="views-exposed-form-search-search"
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
                                            <label for="edit-query">Search</label>
                                            <input data-drupal-selector="edit-query" placeholder="Search" type="text"
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
                                    <a class="nav-link " href="https://cbd.int/convention/" role="button"
                                        title="Biodiversity Convention">
                                        BIODIVERSITY CONVENTION
                                    </a>

                                </li>
                                <li class="nav-item  main-menu-item">
                                    <a class="nav-link " href="http://bch.cbd.int/protocol" role="button"
                                        title="Cartagena Protocol">
                                        CARTAGENA PROTOCOL
                                    </a>

                                </li>
                                <li class="nav-item  main-menu-item">
                                    <a class="nav-link " href="https://cbd.int/abs" role="button"
                                        title="Nagoya Protocol">
                                        NAGOYA PROTOCOL
                                    </a>

                                </li>
                                <li class="nav-item  main-menu-item">
                                    <a class="nav-link " href="https://cbd.int/countries" role="button"
                                        title="Countries">
                                        COUNTRIES
                                    </a>

                                </li>
                                <li class="nav-item  main-menu-item">
                                    <a class="nav-link " href="https://cbd.int/programmes/" role="button"
                                        title="Programmes">
                                        PROGRAMMES
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
export default {
    name: 'ScbdHeader',
    data() {
        return {
            isAuthenticated : false,
            user            : undefined,
            returnUrl       : undefined
        }
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
            window.location.reload();
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

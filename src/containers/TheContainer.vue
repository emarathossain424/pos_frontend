<template>
    <div class="c-app" v-if="is_user_logged_in">
        <TheSidebar/>
        <CWrapper>
            <TheHeader/>
            <div class="c-body">
                <main class="c-main">
                    <CContainer fluid>
                      <CAlert
                              :show.sync="$store.state.alertShowingSec"
                              closeButton
                              :color="$store.state.alertColor"
                              fade
                      >
                        {{$store.state.alertMessages}}
                      </CAlert>
                        <transition name="fade" mode="out-in">
                            <router-view :key="$route.path"></router-view>
                        </transition>
                    </CContainer>
                </main>
            </div>
            <TheFooter/>
        </CWrapper>
    </div>
</template>

<script>
    import TheSidebar from './TheSidebar'
    import TheHeader from './TheHeader'
    import TheFooter from './TheFooter'
    import store from '../store.js'

    export default {
        name: 'TheContainer',
        components: {
            TheSidebar,
            TheHeader,
            TheFooter
        },
      data() {
        return {
          is_user_logged_in: false,
          dismissSecs: 10,
          dismissCountDown: 10,
        }
      },
      mounted() {
        this.checkLoginStatus()
      },
      methods: {
        /**
         * This method will check user login status &
         * Will redirect to "Login" page if user is not logged in
         */
        checkLoginStatus() {
          store.dispatch('checkAuthenticationStatus').then(() => {
            this.is_user_logged_in = store.getters.isAuthenticated;
            if (!this.is_user_logged_in) {
              return this.$router.push({name: "Login"});
            }
          })
        }
      }
    }
</script>

<style scoped>
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.3s;
    }

    .fade-enter,
    .fade-leave-to {
        opacity: 0;
    }
</style>

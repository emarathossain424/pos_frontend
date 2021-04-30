import Vue from 'vue'
import Vuex from 'vuex'
import axios from "axios";


import cookieUniversal from 'cookie-universal';

const Cookies = cookieUniversal(false, false);

Vue.use(Vuex)

const api_url = 'http://localhost:8080/personal/product_order_system'

export default new Vuex.Store({
  state: {
    api_url: api_url,
    sidebarShow: 'responsive',
    sidebarMinimize: false,
    user: null,
    isLogin: Cookies.get("accessToken") ? Cookies.get("accessToken") : false,

    alertShowingSec: 0,
    alertColor: "warning",
    alertMessages: "A simple alert",
    showAlert: false,
  },
  mutations: {
    toggleSidebarDesktop(state) {
      const sidebarOpened = [true, 'responsive'].includes(state.sidebarShow)
      state.sidebarShow = sidebarOpened ? false : 'responsive'
    },
    toggleSidebarMobile(state) {
      const sidebarClosed = [false, 'responsive'].includes(state.sidebarShow)
      state.sidebarShow = sidebarClosed ? true : 'responsive'
    },
    set(state, [variable, value]) {
      state[variable] = value
    },

    /**
     * will change necessary states after login
     * @param state
     * @param details
     */
    userLogin: (state, details) => {
      state.isLogin = true;
      state.user = details.user;
      Cookies.set("accessToken", details.token);
    },

    userLogout: (state) => {
      state.isLogin = false;
      state.user = null;
      Cookies.remove("accessToken");
    },

    /**
     * Will change login status
     * @param state
     * @param details
     */
    setAuthenticationStatus: (state, details) => {
      state.isLogin = details.is_login
      state.user = details.user
    },

    deleteAuthenticationToken:(state)=>{
      Cookies.remove("accessToken");
      state.isLogin = false
    },

    /**
     * Will set alert property
     * @param state
     * @param data
     */
    setAlertProperty: (state, data) => {
      state.alertShowingSec = data.alert_showing_sec
      state.alertColor = data.alert_color
      state.alertMessages = data.message
    },
  },
  actions: {

    /**
     * This action will call for mutation to set necessary states after login
     * @param commit
     * @param details
     */
    login: ({commit}, details) => {
      return commit("userLogin", details);
    },

    logout: ({commit}) => {
      return commit("userLogout");
    },

    /**
     * This action will send request to check user authentication status
     * @param commit
     * @returns {Promise<void>}
     */
    checkAuthenticationStatus: ({commit}) => {
      axios.defaults.headers.common = {
        'Content-Type': 'multipart/form-data',
        Authorization: `${Cookies.get("accessToken")}`
      };
      return axios.post(api_url+"/api/v1/check_authentication.php")
          .then((response) => {
            let details = response.data.details;
            return commit("setAuthenticationStatus", details);
          })
          .catch(() => {
            return commit("deleteAuthenticationToken");
          });
    },

    /**
     * Will call for mutation to set alert property
     * @param commit
     * @param data
     */
    showAlert: ({commit}, data) => {
      return commit("setAlertProperty", data);
    },
  },
  getters: {
    /**
     * This getters will return user authentication status
     * @param state
     * @returns {string | boolean}
     */
    isAuthenticated: (state) => {
      return state.isLogin
    },

    getUser: (state) => {
      return state.user
    }
  },
})

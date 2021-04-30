<template>
  <CSidebar 
    fixed 
    :minimize="minimize"
    :show="show"
    @update:show="(value) => $store.commit('set', ['sidebarShow', value])"
  >
    <CSidebarBrand class="d-md-down-none" to="/">
      <CIcon 
        class="c-sidebar-brand-full" 
        name="logo" 
        size="custom-size" 
        :height="35" 
        viewBox="0 0 556 134"
      />
      <CIcon 
        class="c-sidebar-brand-minimized" 
        name="logo" 
        size="custom-size" 
        :height="35" 
        viewBox="0 0 110 134"
      />
    </CSidebarBrand>

    <CRenderFunction flat :content-to-render="nav"/>
    <CSidebarMinimizer
      class="d-md-down-none"
      @click.native="$store.commit('set', ['sidebarMinimize', !minimize])"
    />
  </CSidebar>
</template>

<script>
import nav from './_nav'
import store from "../store";
import settings from "../config/settings";
export default {
  name: 'TheSidebar',
  data() {
    return {
      nav:nav,
      user_type:settings.user_type,
    }
  },
  computed: {
    show () {
      return this.$store.state.sidebarShow 
    },
    minimize () {
      return this.$store.state.sidebarMinimize 
    }
  },
  mounted() {
    this.rearrangeNav()
  },
  methods:{
    /**
     * Will setup navigations based on permission
     */
    rearrangeNav(){
      let all_menus=this.nav[0]._children
      if(store.getters.getUser.user_type+''===this.user_type.admin+''){
        for (let i=0; i<all_menus.length;i++){
          if(all_menus[i].name+''==='Products'){
            let menu={
              name: 'Create Product',
              to: '/product/create-product'
            }
            all_menus[i].items.push(menu)
          }
        }
      }
      this.nav[0]._children=all_menus
    }
  }
}
</script>

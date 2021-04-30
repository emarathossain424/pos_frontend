<template>
  <CDropdown
    inNav
    class="c-header-nav-items"
    placement="bottom-end"
    add-menu-classes="pt-0"
  >
    <template #toggler>
      <CHeaderNavLink>
        <div class="c-avatar">
          <img
            src="img/avatars/6.jpg"
            class="c-avatar-img "
          />
        </div>
      </CHeaderNavLink>
    </template>
    <CDropdownItem>
      <CButton @click="logout"><CIcon name="cil-lock-locked" /> Logout</CButton>
    </CDropdownItem>
  </CDropdown>
</template>

<script>
import store from "../store";

export default {
  name: 'TheHeaderDropdownAccnt',
  data () {
    return { 
      itemsCount: 42
    }
  },
  methods:{
    /**
     * Will send logout request
     */
    logout(){
      store.dispatch("logout").then(() => {
        return this.$router.push({name: "Login"});
      });
    }
  }
}
</script>

<style scoped>
  .c-icon {
    margin-right: 0.3rem;
  }
</style>
<template>
    <div class="c-app flex-row align-items-center" v-if="!is_user_logged_in">
        <CContainer>
            <CRow class="justify-content-center">
                <CCol md="5">
                    <CCardGroup>
                        <CCard class="p-4">
                            <CCardBody>
                                <CForm>
                                    <h1>Login</h1>
                                    <p class="text-muted">Sign In to your account</p>
                                    <p class="text-danger" v-if="login_errors.error">{{login_errors.error}}</p>
                                    <CInput
                                            v-model="email"
                                            placeholder="User Email"
                                            required
                                            autocomplete="off"
                                            :is-valid="!('email' in login_errors) && !('error' in login_errors) && (email!=='')"
                                            :invalid-feedback="login_errors.email"
                                    >
                                        <template #prepend-content>
                                            <CIcon name="cil-user"/>
                                        </template>
                                    </CInput>

                                    <CInput
                                            v-model="password"
                                            placeholder="Password"
                                            type="password"
                                            required
                                            autocomplete="off"
                                            :is-valid="!('password' in login_errors) && !('error' in login_errors) && (password!=='')"
                                            :invalid-feedback="login_errors.password"
                                    >
                                        <template #prepend-content>
                                            <CIcon name="cil-lock-locked"/>
                                        </template>
                                    </CInput>
                                    <CRow>
                                        <CCol col="6" class="text-left">
                                            <CButton color="primary" class="px-4" @click="login"
                                            >Login
                                            </CButton
                                            >
                                        </CCol>
                                    </CRow>
                                </CForm>
                            </CCardBody>
                        </CCard>
                    </CCardGroup>
                </CCol>
            </CRow>
        </CContainer>
    </div>
</template>

<script>
    import store from "../../store";
    import axios from "axios";

    export default {
        name: "Login",
        data() {
            return {
                email: "",
                password: "",
                is_user_logged_in: true,
                login_errors:{
                    'email':'',
                    'password':'',
                    'error':''
                },
            };
        },
        mounted() {
            this.checkLoginStatus()
        },
        methods: {
            /**
             * This method will send login request
             */
            login() {
                let credentials = {
                    email: this.email,
                    password: this.password,
                };
                axios.post("http://localhost:8080/personal/product_order_system/api/v1/login.php", credentials).then((response) => {
                    let details = response.data.details;
                    store.dispatch("login", details).then(() => {
                        this.checkLoginStatus()
                    });
                }).catch((error) => {
                    this.login_errors=error.response.data.errors
                    if (this.login_errors.error) {
                        let data = {
                            alert_showing_sec: 10,
                            alert_color: "danger",
                            message: this.login_errors.error,
                        }
                        store.dispatch('showAlert', data)
                    }
                });
            },

            /**
             * This method will check user login status &
             * Will redirect to "Login" page if user is not logged in
             */
            checkLoginStatus() {
                store.dispatch("checkAuthenticationStatus").then(() => {
                    this.is_user_logged_in = store.getters.isAuthenticated;
                    if (this.is_user_logged_in) {
                        return this.$router.push({name: "Product"});
                    }
                });
            },
        },
    };
</script>
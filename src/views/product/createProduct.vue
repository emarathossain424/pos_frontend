<template>
    <div>
        <CRow>
            <CCol md="6">
                <!-- product adding form-->
                <CCard>
                    <CCardHeader>
                        <strong>Add Products</strong>
                    </CCardHeader>
                    <CCardBody>
                        <CForm>
                            <CCardBody>
                                <CInput
                                        type="text"
                                        label="Product Name*"
                                        placeholder="Enter Product name"
                                        v-model="name"
                                >
                                    <template #invalid-feedback v-if="store_errors.name">
                                        <small class="form-text text-danger w-100">{{store_errors.name}}</small>
                                    </template>
                                </CInput>
                                <CRow>
                                    <CCol md="7">
                                        <CInput
                                                type="text"
                                                label="Product SKU*"
                                                placeholder="Enter Product sku"
                                                v-model="sku"
                                                :disabled="true"
                                        >
                                            <template #invalid-feedback v-if="store_errors.sku">
                                                <small class="form-text text-danger w-100">{{store_errors.sku}}</small>
                                            </template>
                                        </CInput>
                                    </CCol>
                                    <CCol md="4" class="mt-4">
                                        <CButton block color="primary" @click="generateSKU">Generate</CButton>
                                    </CCol>
                                </CRow>
                                <CSelect
                                        label="Select Categories*"
                                        :value.sync="selected_category"
                                        :options="categories"
                                        placeholder="Please select categories"
                                >
                                    <template #invalid-feedback v-if="store_errors.category">
                                        <small class="form-text text-danger w-100">{{store_errors.category}}</small>
                                    </template>
                                </CSelect>
                                <CTextarea
                                        label="Product Details"
                                        v-model="description"
                                        placeholder="Please product details"
                                        rows="5"
                                />
                                <CInput
                                        type="text"
                                        label="Product Price*"
                                        placeholder="Enter Product Price"
                                        v-model="price"
                                >
                                    <template #invalid-feedback v-if="store_errors.price">
                                        <small class="form-text text-danger w-100">{{store_errors.price}}</small>
                                    </template>
                                </CInput>
                                <h6>Product Image</h6>
                                <CInputFile
                                        label="Select Image"
                                        @change="handleFileInput($event)"
                                        :placeholder="product_image_placeholder"
                                        custom
                                >
                                    <template #invalid-feedback v-if="store_errors.product_image">
                                        <small class="form-text text-danger w-100">{{store_errors.product_image}}</small>
                                    </template>
                                </CInputFile>
                            </CCardBody>
                            <CCardFooter>
                                <CButton type="button" size="sm" color="primary" @click="addProduct">
                                    <CIcon name="cil-check-circle"/>
                                    Submit
                                </CButton>
                                <CButton type="button" size="sm" color="danger" @click="flush">
                                    <CIcon name="cil-ban"/>
                                    Reset
                                </CButton>
                            </CCardFooter>
                        </CForm>
                    </CCardBody>
                </CCard>
                <!-- /product adding form-->
            </CCol>
        </CRow>
    </div>
</template>

<script>
    import axios from "axios";
    import store from '../../store.js'
    import settings from "../../config/settings";
    import cookieUniversal from 'cookie-universal';

    const Cookies = cookieUniversal(false, false);

    export default {
        data() {
            return {
                categories: [],

                name: '',
                sku: '',
                description: '',
                price: 0,
                selected_category: "",
                product_image: "",
                product_image_placeholder: "",
                store_errors: {},
            }
        },
        mounted() {
            this.checkPermission()
            this.getCategories()
            this.generateSKU()
        },
        methods: {
            /**
             *  Will send request to get all categories
             */
            getCategories() {
                axios.get(store.state.api_url + "/api/v1/get_categories.php").then((response) => {
                    let all_categories = response.data.details;
                    this.categories = all_categories.map((category) => {
                        return {
                            'label': category.name,
                            'value': category.id,
                        }
                    });
                }).catch(() => {
                    let data = {
                        alert_showing_sec: 10,
                        alert_color: "danger",
                        message: "Something went wrong",
                    }
                    store.dispatch('showAlert', data)
                });
            },

            /**
             * Will send request to generate sku
             */
            generateSKU() {
                axios.post(store.state.api_url + "/api/v1/generate_sku.php").then((response) => {
                    this.sku = response.data.details.sku;
                }).catch(() => {
                    let data = {
                        alert_showing_sec: 10,
                        alert_color: "danger",
                        message: "Something went wrong",
                    }
                    store.dispatch('showAlert', data)
                });
            },

            /**
             * Will handle general file inputs
             */
            handleFileInput(files) {
                if (files.length > 0) {
                    this.product_image = files[0]
                    this.product_image_placeholder = this.product_image.name
                }
            },

            /**
             * send request to add product
             */
            addProduct() {
                if(this.isValidated()) {
                    let data = this.prepareData()
                    axios.defaults.headers.common = {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `${Cookies.get("accessToken")}`
                    };
                    axios.post(store.state.api_url + "/api/v1/create_product.php", data).then(() => {
                        this.isLoading = false
                        let data = {
                            alert_showing_sec: 10,
                            alert_color: "success",
                            message: "Product creation successfully",
                        }
                        store.dispatch('showAlert', data)
                        this.flush()
                        this.scrollToTop()
                    }).catch((error) => {
                        this.store_errors = error.response.data.errors
                        if (this.store_errors.error) {
                            let data = {
                                alert_showing_sec: 10,
                                alert_color: "danger",
                                message: this.store_errors.error,
                            }
                            store.dispatch('showAlert', data)
                        }
                        this.scrollToTop()
                    });
                }
            },

            /**
             * Will prepare product store request
             */
            prepareData(){
                let data = new FormData();
                data.append('name', this.name);
                data.append('sku', this.sku);
                data.append('price', this.price);
                data.append('category', this.selected_category);
                data.append('description', this.description);
                data.append('product_image', this.product_image);

                return data
            },

            /**
             * Will check the validity of input field
             */
            isValidated() {
                this.store_errors = {
                    name: this.name + '' === '' ? 'Product name field is required' : '',
                    price: !Number(this.price) ? 'Product price field is required' : '',
                    category: this.selected_category + '' === '' ? 'Product category field is required' : '',
                    sku: this.sku + '' === '' ? 'Product sku field is required' : '',
                }

                if(this.store_errors.name!=="" ||this.store_errors.price!=="" ||
                    this.store_errors.category!=="" ||this.store_errors.sku!==""){
                    return false
                }
                return true
            },

            /**
             * Will scroll to the top of the page
             */
            scrollToTop() {
                window.scrollTo(0, 0);
            },

            /**
             * Will check user permission
             */
            checkPermission(){
                if(store.getters.getUser.user_type+''!==settings.user_type.admin+''){
                    store.dispatch("logout").then(() => {
                        return this.$router.push({name: "Login"});
                    });
                }
            },

            /**
             * This will flush/reset all data of input fields
             */
            flush() {
                this.name = ''
                this.sku = ''
                this.description = ''
                this.price = 0
                this.selected_category = ""
                this.product_image = ""
                this.product_image_placeholder = ""
                this.store_errors = {}
            }
        }
    }
</script>

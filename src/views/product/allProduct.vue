<template>
    <div>
        <CRow>
            <CCol md="8">
                <!--product list-->
                <CCard>
                    <CCardBody>
                        <CDataTable
                                :items="items"
                                :fields="fields"
                                column-filter
                                table-filter
                                items-per-page-select
                                :items-per-page="5"
                                hover
                                sorter
                                pagination
                                striped

                        >
                            <template #description="{item}">
                                <td v-if="item.description+''!=='null' && item.description+''!==''">
                                    {{item.description}}
                                </td>
                                <td v-else>
                                    -
                                </td>
                            </template>
                            <template #image="{item}">
                                <td v-if="item.image+''!=='null' && item.image+''!==''">
                                    <div class="c-avatar">
                                        <img :src="$store.state.api_url+'/assets/uploads/'+item.image"
                                             class="c-avatar-img "/>
                                    </div>
                                </td>
                                <td v-else>
                                    -
                                </td>
                            </template>
                            <template #actions="{item}">
                                <td class="py-2" v-if="$store.getters.getUser.user_type+'' === user_type.admin+''">
                                    <CButtonGroup>
                                        <CButton color="warning" size="sm">
                                            <router-link :to="{ name: 'Edit Product', params: { id:item.id} }">
                                                Edit
                                            </router-link>
                                        </CButton>
                                        <CButton color="danger" size="sm" @click="takeConfirmationToDeleteProduct(item.id)">
                                            Delete
                                        </CButton>
                                    </CButtonGroup>
                                </td>
                                <td v-else/>
                            </template>
                        </CDataTable>
                    </CCardBody>
                </CCard>
                <!-- /product list-->
            </CCol>
        </CRow>
        <CRow>
            <!-- Delete confirmation modal-->
            <CModal
                    title="Confirm Your Decision"
                    color="danger"
                    :show.sync="should_show_confirmation_msg"
            >
                Are you sure that you want to delete this information?
                Once you delete, you will not retrieve that information.

                <template #footer>
                    <button
                            type="button"
                            class="btn btn-secondary"
                            @click="should_show_confirmation_msg=false"
                    >
                        Cancel
                    </button>
                    <button
                            type="button"
                            class="btn btn-danger"
                            @click="deleteProduct()"
                    >
                        OK
                    </button>
                </template>
            </CModal>
            <!-- /Delete confirmation modal-->
        </CRow>
    </div>
</template>

<script>
    import axios from "axios";
    import store from "../../store";
    import settings from "../../config/settings";

    export default {
        data() {
            return {
                user_type: settings.user_type,
                items: [],
                fields: [
                    {key: 'image', label: 'Image', filter: false, sorter: false},
                    {key: 'name', label: 'Name', filter: false, sorter: false},
                    {key: 'sku', label: 'SKU', filter: false, sorter: false},
                    {key: 'category', label: 'Category', filter: false, sorter: false},
                    {key: 'price', label: 'Price', filter: false, sorter: true},
                    {key: 'description', label: 'Description', filter: false, sorter: false},
                    {
                        key: 'actions',
                        label: '',
                        sorter: false,
                        filter: false
                    }
                ],
                deletable_item_id: "",
                should_show_confirmation_msg: false,
            }
        },
        mounted() {
            this.getProducts()
        },
        methods: {

            /**
             * Will return all product list
             */
            getProducts() {
                axios.get(store.state.api_url + "/api/v1/get_products.php").then((response) => {
                    this.items = response.data.details;
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
             * Will request to delete a product
             */
            deleteProduct() {
                axios.post(store.state.api_url + "/api/v1/delete_product.php",{
                    'product_id':this.deletable_item_id
                }).then(() => {
                    this.flush()
                    this.getProducts();
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
             * Will take confirmation from user before delete
             */
            takeConfirmationToDeleteProduct(item_id) {
                this.should_show_confirmation_msg = true
                this.deletable_item_id = item_id
            },

            /**
             * Will flush data
             */
            flush(){
                this.deletable_item_id= ""
                this.should_show_confirmation_msg= false
            }
        }
    }
</script>

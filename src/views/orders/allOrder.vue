<template>
    <div>
        <CRow>
            <CCol md="7">
                <!--All orders-->
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
                            <template #status="{item}">
                                <td class="py-2" v-if="item.status+''===order_status.processing+''">
                                    Processing
                                </td>
                                <td class="py-2" v-if="item.status+''===order_status.shipped+''">
                                    Shipped
                                </td>
                                <td class="py-2" v-if="item.status+''===order_status.delivered+''">
                                    Delivered
                                </td>
                            </template>
                            <template #actions="{item}">
                                <td class="py-2">
                                    <CButtonGroup>
                                        <CButton color="primary" size="sm" @click="getOrderDetails(item.id)">
                                            View
                                        </CButton>
                                        <CButton color="success" size="sm"
                                                 @click="showStatusUpdateForm(item.status,item.id)"
                                                 v-if="$store.getters.getUser.user_type+'' === user_type.admin+''"
                                        >
                                            Update Status
                                        </CButton>
                                    </CButtonGroup>
                                </td>
                            </template>
                        </CDataTable>
                    </CCardBody>
                </CCard>
                <!-- /All orders-->
            </CCol>
            <CCol md="5">
                <!--Order details-->
                <CCard v-if="show_order_details">
                    <CCardHeader>
                        <strong>Order details of order number {{showable_order_id}}</strong>
                        <div class="card-header-actions">
                            <CLink class="card-header-action btn-minimize" @click="show_order_details=false">
                                close
                            </CLink>
                        </div>
                    </CCardHeader>
                    <CCardBody>
                        <CDataTable
                                :items="orderDetails"
                                :fields="orderDetailsFields"
                                column-filter
                                table-filter
                                items-per-page-select
                                :items-per-page="5"
                                hover
                                sorter
                                pagination
                                striped

                        >
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
                        </CDataTable>
                    </CCardBody>
                </CCard>
                <!-- /Order details-->

                <!--Update order status-->
                <CCard v-if="show_update_form">
                    <CCardHeader>
                        <strong>Update order status of order Number {{editable_order_id}}</strong>
                        <div class="card-header-actions">
                            <CLink class="card-header-action btn-minimize" @click="show_update_form=false">
                                close
                            </CLink>
                        </div>
                    </CCardHeader>
                    <CCardBody>
                        <CSelect
                                label="Update Status*"
                                :value.sync="status"
                                :options="allStatus"
                                placeholder="Please select status"
                        >
                        </CSelect>
                    </CCardBody>
                    <CCardFooter>
                        <CButton type="button" size="sm" color="success" @click="updateOrder">
                            <CIcon name="cil-check-circle"/>
                            Update Order
                        </CButton>
                    </CCardFooter>
                </CCard>
                <!-- /Update order status-->
            </CCol>
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
                order_status: settings.order_status,
                user_type: settings.user_type,
                items: [],
                fields: [
                    {key: 'id', label: 'SL', filter: false, sorter: false},
                    {key: 'customer_name', label: 'Customer', filter: false, sorter: false},
                    {key: 'status', label: 'Status', filter: false, sorter: false},
                    {key: 'total_price', label: 'Amount', filter: false, sorter: false},
                    {key: 'created_at', label: 'Order Date', filter: false, sorter: true},
                    {
                        key: 'actions',
                        label: '',
                        sorter: false,
                        filter: false
                    }
                ],

                orderDetails: [],
                orderDetailsFields: [
                    {key: 'id', label: 'SL', filter: false, sorter: false},
                    {key: 'image', label: 'Image', filter: false, sorter: false},
                    {key: 'name', label: 'product', filter: false, sorter: false},
                    {key: 'quantity', label: 'Quantity', filter: false, sorter: false},
                    {key: 'unit_price', label: 'Unit price', filter: false, sorter: false},
                    {key: 'final_price', label: 'Final Price', filter: false, sorter: true}
                ],

                status: "",

                show_update_form: false,
                show_order_details: false,
                showable_order_id: "",
                editable_order_id: "",
            }
        },
        mounted() {
            this.getOrders()
        },
        computed: {
            /**
             * Will setup order status for select box
             */
            allStatus() {
                return [
                    {
                        'value': this.order_status.processing,
                        'label': "Processing"
                    }, {
                        'value': this.order_status.shipped,
                        'label': "Shipped"
                    }, {
                        'value': this.order_status.delivered,
                        'label': "Delivered"
                    }
                ]
            }
        },
        methods: {

            /**
             * Will send request to get all orders
             */
            getOrders() {
                axios.get(store.state.api_url + "/api/v1/get_order_details.php", {
                    params: {
                        user_type: store.getters.getUser.user_type,
                        customer_id: store.getters.getUser.id
                    }
                }).then((response) => {
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
             * Will send request get single order details
             */
            getOrderDetails(order_id) {
                axios.get(store.state.api_url + "/api/v1/get_single_order_details.php", {
                    params: {
                        order_id: order_id
                    }
                }).then((response) => {
                    this.orderDetails = response.data.details;
                    this.show_order_details = true
                    this.showable_order_id = order_id
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
             * will show order status update form
             */
            showStatusUpdateForm(status, order_id) {
                this.status = parseInt(status)
                this.show_update_form = true
                this.editable_order_id = order_id
            },

            /**
             * Will send request to update order status
             */
            updateOrder() {
                axios.post(store.state.api_url + "/api/v1/update_order.php", {
                    order_id: this.editable_order_id,
                    user_type: store.getters.getUser.user_type,
                    status: this.status
                }).then(() => {
                    let data = {
                        alert_showing_sec: 10,
                        alert_color: "success",
                        message: "Order updated successfully",
                    }
                    store.dispatch('showAlert', data)
                    this.getOrders();
                    this.flush()
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
             * Will flush data
             */
            flush() {
                this.status=""
                this.show_update_form = false
                this.show_order_details = false
                this.showable_order_id = ""
                this.editable_order_id = ""
            }
        }
    }
</script>

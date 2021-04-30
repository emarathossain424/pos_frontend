<template>
    <div>
        <CRow>
            <!-- Add products-->
            <CCol md="6">
                <CCard>
                    <CCardHeader>
                        Add Product
                    </CCardHeader>
                    <CCardBody>
                        <CSelect
                                label="Select Product*"
                                :value.sync="selected_product"
                                :options="products_for_select_box"
                                placeholder="Please select product"
                        >
                            <template #invalid-feedback v-if="store_errors.product">
                                <small class="form-text text-danger w-100">{{store_errors.product}}</small>
                            </template>
                        </CSelect>
                        <CInput
                                type="number"
                                label="Quantity*"
                                placeholder="Enter Product Quantity"
                                v-model="quantity"
                        >
                            <template #invalid-feedback v-if="store_errors.quantity">
                                <small class="form-text text-danger w-100">{{store_errors.quantity}}</small>
                            </template>
                        </CInput>
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
                </CCard>
            </CCol>
            <!-- /Add products-->

            <!-- Order summery-->
            <CCol md="6">
                <CCard>
                    <CCardHeader>
                        Traffic &amp; Sales
                    </CCardHeader>
                    <CCardBody>
                        <CDataTable
                                class="mb-0 table-outline"
                                hover
                                :items="tableItems"
                                :fields="tableFields"
                                head-color="light"
                                no-sorting
                        >
                            <td slot="image" class="text-center" slot-scope="{item}">
                                <div class="c-avatar" v-if="item.image!=='' && item.image+''!=='null'">
                                    <img :src="$store.state.api_url+'/assets/uploads/'+item.image" class="c-avatar-img" alt="">
                                </div>
                                <div v-else>
                                    -
                                </div>
                            </td>
                            <template #action="{item,index}">
                                <td class="py-2">
                                    <CButtonGroup>
                                        <CButton color="danger" size="sm" @click="deleteItem(index)">
                                            Delete
                                        </CButton>
                                    </CButtonGroup>
                                </td>
                            </template>
                            <template #footer>
                                <tfoot>
                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th class="text-center">Total : {{totalFinalPrice}}</th>
                                </tr>
                                </tfoot>
                            </template>
                        </CDataTable>
                    </CCardBody>
                    <CCardFooter>
                        <CButton type="button" size="sm" color="success" @click="placeOrder" v-if="tableItems.length>0">
                            <CIcon name="cil-check-circle"/>
                            Place Order
                        </CButton>
                    </CCardFooter>
                </CCard>
            </CCol>
            <!-- Order summery-->
        </CRow>
    </div>
</template>

<script>
    import axios from "axios";
    import store from "../../store";

    export default {
        name: 'Dashboard',
        data () {
            return {
                selected: 'Month',
                tableItems: [],
                tableFields: [
                    { key: 'image', label: 'Image', _classes: 'text-center' },
                    { key: 'name', label: 'Name', _classes: 'text-center' },
                    { key: 'price', label: 'Unit Price', _classes: 'text-center' },
                    { key: 'quantity', label: 'Quantity', _classes: 'text-center' },
                    { key: 'final_price', label: 'Final Price', _classes: 'text-center' },
                    { key: 'action', label: '', _classes: 'text-center' }
                ],

                // categories
                myValue: [],
                myOptions: ['op1', 'op2', 'op3'],
                products:[],
                products_for_select_box:[],

                selected_product:"",
                quantity:0,
                store_errors:{}

            }
        },
        computed:{
            /**
             * Will compute final order price
             */
            totalFinalPrice(){
                let final_price=0;
                for(let i=0;i<this.tableItems.length;i++){
                    final_price =final_price + this.tableItems[i].final_price
                }

                return final_price.toFixed(2);
            }
        },
        mounted() {
            this.getProducts()
        },
        methods: {
            /**
             * Will return all branch list
             */
            getProducts() {
                axios.get(store.state.api_url + "/api/v1/get_products.php").then((response) => {
                    this.products = response.data.details;
                    this.products_for_select_box = this.products.map((product) => {
                        return {
                            'label': product.name,
                            'value': product.id,
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
             * Will add product to order
             */
            addProduct(){
                if(this.isValidated()){
                    this.quantity=parseInt(this.quantity)

                    for(let i=0;i<this.products.length; i++){
                        if(this.products[i].id === this.selected_product){
                            let data = {
                                'sl': this.tableItems.length,
                                'image': this.products[i].image,
                                'product_id': this.selected_product,
                                'name': this.products[i].name,
                                'price': this.products[i].price,
                                'quantity': this.quantity,
                                'final_price': this.quantity * parseFloat(this.products[i].price)
                            }
                            this.tableItems.push(data)
                        }
                    }
                }
            },

            /**
             * Will delete items from order
             */
            deleteItem(index){
                this.tableItems.splice(index, 1);
            },

            /**
             * Will check the validity of input field
             */
            isValidated() {
                this.store_errors = {
                    product: this.selected_product + '' === '' ? 'Please select a product' : '',
                    quantity: (this.quantity===0)||!Number(this.quantity) ? 'Please select a valid quantity' : ''
                }

                if(this.store_errors.product!=="" ||this.store_errors.quantity!==""){
                    return false
                }
                return true
            },

            /**
             * Will send request to place order
             */
            placeOrder(){
                axios.post(store.state.api_url + "/api/v1/order_product.php",{
                    'customer_id':store.getters.getUser.id,
                    'orders':this.tableItems
                }).then(() => {
                    let data = {
                        alert_showing_sec: 10,
                        alert_color: "success",
                        message: "Order placed successfully",
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
            },

            /**
             * Will scroll to the top of the page
             */
            scrollToTop() {
                window.scrollTo(0, 0);
            },

            /**
             * Will flush input field
             */
            flush(){
                this.selected_product=""
                this.quantity=0
                this.tableItems=[];
            }
        }
    }
</script>

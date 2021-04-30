import Vue from 'vue'
import Router from 'vue-router'

// Containers
const TheContainer = () => import('@/containers/TheContainer')

//start
const Login = () => import('@/views/auth/login')

//product
const CreateProduct = () => import('@/views/product/createProduct')
const AllProduct = () => import('@/views/product/allProduct')
const EditProduct = () => import('@/views/product/editProduct')

//Orders
const CreateOrder = () => import('@/views/orders/createOrder')
const AllOrder = () => import('@/views/orders/allOrder')

Vue.use(Router)

export default new Router({
  mode: 'history', // https://router.vuejs.org/api/#mode
  linkActiveClass: 'active',
  scrollBehavior: () => ({y: 0}),
  routes: configRoutes()
})

function configRoutes() {
  return [
    {
      path: '/',
      redirect: '/product',
      name: 'Home',
      component: TheContainer,
      children: [
        {
          path: 'product',
          redirect: '/product/all-product',
          name: 'Product',
          component: {
            render(c) {
              return c('router-view')
            }
          },
          children: [
            {
              path: 'create-product',
              name: 'Create Product',
              component: CreateProduct
            },
            {
              path: 'all-product',
              name: 'All Product',
              component: AllProduct
            },
            {
              path: 'edit-product/:id',
              name: 'Edit Product',
              component: EditProduct
            }
          ]
        },
        {
          path: 'order',
          redirect: '/order/create-order',
          name: 'Order',
          component: {
            render(c) {
              return c('router-view')
            }
          },
          children: [
            {
              path: 'create-order',
              name: 'Create Order',
              component: CreateOrder
            },
            {
              path: 'all-order',
              name: 'All Order',
              component: AllOrder
            }
          ]
        }
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
  ]
}


export default [
    {
        _name: 'CSidebarNav',
        _children: [
            {
                _name: 'CSidebarNavDropdown',
                name: 'Products',
                route: '/product/create-product',
                icon: 'cil-puzzle',
                items: [
                    {
                        name: 'All Product',
                        to: '/product/all-product'
                    }
                ]
            },

            {
                _name: 'CSidebarNavDropdown',
                name: 'Orders',
                route: '/order/create-order',
                icon: 'cil-puzzle',
                items: [
                    {
                        name: 'Create Order',
                        to: '/order/create-order'
                    },
                    {
                        name: 'All Orders',
                        to: '/order/all-order'
                    }
                ]
            }
        ]
    }
]
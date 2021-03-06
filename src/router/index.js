import Vue from 'vue'
import Router from 'vue-router'
import Login from "../components/Login.vue"
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import User from '../components/user/User.vue'
import Roles from '../components/rights/Roles.vue'
import Rights from '../components/rights/rights.vue'
import Goods from '../components/goods/Goods.vue'
import Categories from '../components/goods/Categories.vue'
import Params from '../components/goods/Params.vue'
import AddGoods from '../components/goods/Add.vue'
import EditGoods from '../components/goods/Edit.vue'
import Order from '../components/orders/Orders.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    { path:'/',redirect:'/Login'},
    { path:'/login',component:Login},  
    { 
      path:'/home',
      component:Home,
      redirect:'/welcome',
      children:[
        {path:'/welcome',component:Welcome},
        {path:'/users',component:User},
        {path:'/roles',component:Roles},
        {path:'/rights',component:Rights},
        {path:'/goods',component:Goods},
        {path:'/categories',component:Categories},
        {path:'/params',component:Params},
        {path:'/add',component:AddGoods},
        {path:'/edit/:id',component:EditGoods},
        {path:'/orders',component:Order}
      ]
    }
   ]
})
//挂载路由导航守卫
router.beforeEach((to,from,next)=>{
  if(to.path == '/login') return next();
   //获取token
   const tokenStr = window.sessionStorage.getItem('token');
   //console.log(tokenStr);
   if(!tokenStr) return next('/login');
   next();
})

export default router;
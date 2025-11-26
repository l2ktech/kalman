import Vue from 'vue'
import VueRouter from 'vue-router'
import KalmanView from '../views/KalmanView.vue'
import PIDView from '../views/PIDView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/kalman'
  },
  {
    path: '/kalman',
    name: 'Kalman',
    component: KalmanView,
    meta: { title: '卡尔曼滤波器' }
  },
  {
    path: '/pid',
    name: 'PID',
    component: PIDView,
    meta: { title: 'PID 控制器' }
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router

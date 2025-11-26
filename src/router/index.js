import Vue from 'vue'
import VueRouter from 'vue-router'
import KalmanView from '../views/KalmanView.vue'
import PIDView from '../views/PIDView.vue'
import ForwardKinematicsView from '../views/ForwardKinematicsView.vue'
import AStarView from '../views/AStarView.vue'
import InverseKinematicsView from '../views/InverseKinematicsView.vue'

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
  },
  {
    path: '/forward-kinematics',
    name: 'ForwardKinematics',
    component: ForwardKinematicsView,
    meta: { title: '正运动学' }
  },
  {
    path: '/astar',
    name: 'AStar',
    component: AStarView,
    meta: { title: 'A* 寻路算法' }
  },
  {
    path: '/inverse-kinematics',
    name: 'InverseKinematics',
    component: InverseKinematicsView,
    meta: { title: '逆运动学' }
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router

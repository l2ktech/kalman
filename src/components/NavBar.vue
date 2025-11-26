<template>
  <div class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <span class="brand-icon">🎓</span>
        <span class="brand-text">控制算法学习平台</span>
      </div>
      <nav class="navbar-menu">
        <router-link
          to="/kalman"
          class="nav-item"
          active-class="active"
        >
          <span class="nav-icon">📊</span>
          <span class="nav-text">卡尔曼滤波</span>
        </router-link>
        <router-link
          to="/pid"
          class="nav-item"
          active-class="active"
        >
          <span class="nav-icon">🎮</span>
          <span class="nav-text">PID 控制</span>
        </router-link>
        <router-link
          to="/forward-kinematics"
          class="nav-item"
          active-class="active"
        >
          <span class="nav-icon">🦾</span>
          <span class="nav-text">正运动学</span>
        </router-link>
        <router-link
          to="/astar"
          class="nav-item"
          active-class="active"
        >
          <span class="nav-icon">🗺️</span>
          <span class="nav-text">A* 寻路</span>
        </router-link>
        <router-link
          to="/inverse-kinematics"
          class="nav-item"
          active-class="active"
        >
          <span class="nav-icon">🤖</span>
          <span class="nav-text">逆运动学</span>
        </router-link>
      </nav>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NavBar'
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-weight: 700;
  font-size: 1.3rem;
}

.brand-icon {
  font-size: 1.8rem;
}

.brand-text {
  letter-spacing: -0.02em;
}

.navbar-menu {
  display: flex;
  gap: 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: translateY(-2px);
}

.nav-item.active {
  background: white;
  color: #667eea;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-text {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column;
    height: auto;
    padding: 15px 10px;
    gap: 15px;
  }

  .navbar-brand {
    font-size: 1.1rem;
  }

  .brand-icon {
    font-size: 1.4rem;
  }

  .navbar-menu {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .nav-item {
    padding: 6px 15px;
    font-size: 0.9rem;
  }
}
</style>

<template>
  <view class="admin-container">
    <view class="sidebar">
      <view class="logo">
        <image :src="settings.site_logo || '/static/logo.png'" mode="heightFix"></image>
        <text>{{ settings.site_name || '小程序后台' }}</text>
      </view>
      <view 
        v-for="(item, index) in menuList" 
        :key="index"
        class="menu-item"
        :class="{ active: currentMenu === item.id }"
        @click="handleMenuClick(item)"
      >
        {{ item.name }}
      </view>
    </view>
    <view class="main-content">
      <view class="header">
        <view class="header-left">
          <!-- <text class="title">后台管理系统1</text> -->
        </view>
        <view class="header-right">
          <view class="user-info" @click="showUserMenu = !showUserMenu">
            <view class="user-avatar">
              <template v-if="userInfo.avatarUrl">
                <image class="avatar" :src="userInfo.avatarUrl" mode="aspectFill"></image>
              </template>
              <template v-else>
                <view class="avatar-placeholder">
                  <uni-icons color="#ffffff" size="20" type="person-filled" />
                </view>
              </template>
              <uni-tag :text="userInfo.role === 'admin' ? '管理员' : '普通用户'" 
                :type="userInfo.role === 'admin' ? 'primary' : ''" 
                size="mini"
                class="role-tag"
              />
            </view>
            <view class="user-detail">
              <text class="username">{{ userInfo.nickName || userInfo.username }}</text>
              <!-- <text class="sub-text">欢迎回来</text> -->
            </view>
            <!-- 下拉菜单 -->
            <view class="dropdown-menu" v-if="showUserMenu">
              <view class="menu-item" @click="handleLogout">
                <uni-icons type="logout" size="16"></uni-icons>
                <text>退出登录</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="content">
        <component :is="currentComponent"></component>
      </view>
    </view>
  </view>
</template>

<script>
import adminDashboard from '@/components/admin-dashboard/admin-dashboard.vue'
import adminUsers from '@/components/admin-users/admin-users.vue'
import adminApps from '@/components/admin-apps/admin-apps.vue'
import adminVideos from '@/components/admin-videos/admin-videos.vue'
import adminImages from '@/components/admin-images/admin-images.vue'
import adminSettings from '@/components/admin-settings/admin-settings.vue'
import { getSystemSettings } from '@/common/utils/settings.js'

export default {
  components: {
    adminDashboard,
    adminUsers,
    adminApps,
    adminVideos,
    adminImages,
    adminSettings,
  },
  onShow() {
    // 检查登录状态
    const token = uni.getStorageSync('token')
    if (!token) {
      uni.redirectTo({
        url: '/pages/admin/login'
      })
      return
    }
  },
  onLoad() {
    // 监听设置更新事件
    uni.$on('settingsUpdated', this.refreshSettings)
    this.refreshSettings() // 初始加载设置
  },
  onUnload() {
    // 移除事件监听
    uni.$off('settingsUpdated', this.refreshSettings)
  },
  data() {
    return {
      currentMenu: 'dashboard',
      menuList: [
        { id: 'dashboard', name: '控制台', component: 'admin-dashboard' },
        { id: 'users', name: '用户管理', component: 'admin-users' },
        { id: 'apps', name: '应用管理', component: 'admin-apps' },
        { id: 'videos', name: '视频管理', component: 'admin-videos' },
        { id: 'images', name: '图片管理', component: 'admin-images' },
        { id: 'settings', name: '系统设置', component: 'admin-settings' },
      ],
      currentComponent: 'admin-dashboard',
      showUserMenu: false,
      userInfo: {
        username: 'admin',
        nickName: '管理员',
        avatarUrl: '',
        role: 'admin'
      },
      settings: {}
    }
  },
  methods: {
    handleMenuClick(item) {
      this.currentMenu = item.id
      this.currentComponent = item.component
    },
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('token')
            uni.redirectTo({
              url: '/pages/admin/login'
            })
          }
        }
      })
    },
    async refreshSettings() {
      this.settings = await getSystemSettings()
    }
  },
  created() {
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
      this.userInfo = userInfo
    }
  },
  async mounted() {
    this.settings = await getSystemSettings()
  }
}
</script>

<style lang="scss">
.admin-container {
  display: flex;
  height: 100vh;
  background-color: #f0f2f5;
  
  .sidebar {
    width: 200px;
    background-color: #001529;
    color: #fff;
    
    .logo {
      height: 64px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 20px;
      text-align: center;
      font-size: 18px;
      border-bottom: 1px solid #1f2d3d;
      
      image {
        width: 32px;
        height: 32px;
        flex-shrink: 0;
      }
      
      text {
        color: #fff;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
    
    .menu-item {
      padding: 15px 20px;
      cursor: pointer;
      
      &:hover {
        background-color: #263445;
      }
      
      &.active {
        background-color: #263445;
      }
    }
  }
  
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    
    .header {
      height: 60px;
      background-color: #fff;
      border-bottom: 1px solid #e6e6e6;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      .header-left {
        .title {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
      }
      
      .header-right {
        display: flex;
        align-items: center;
        gap: 15px;
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          position: relative;
          padding: 5px 12px;
          
          &:hover {
            background-color: #f5f5f5;
            border-radius: 4px;
          }
          
          .user-avatar {
            position: relative;
            
            .avatar {
              width: 36px;
              height: 36px;
              border-radius: 50%;
              border: 2px solid #fff;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .avatar-placeholder {
              width: 36px;
              height: 36px;
              border-radius: 50%;
              background-color: #1890ff;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid #fff;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .role-tag {
              position: absolute;
              top: -6px;
              right: -12px;
              transform: scale(0.85);
            }
          }
          
          .user-detail {
            display: flex;
            flex-direction: column;
            gap: 2px;
            
            .username {
              font-size: 14px;
              font-weight: 500;
              color: #333;
            }
            
            .sub-text {
              font-size: 12px;
              color: #999;
            }
          }
          
          .dropdown-menu {
            position: absolute;
            top: 100%;
            right: 0;
            background-color: #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            border-radius: 4px;
            padding: 6px 0;
            margin-top: 8px;
            min-width: 120px;
            z-index: 1000;
            
            .menu-item {
              padding: 10px 16px;
              display: flex;
              align-items: center;
              gap: 8px;
              
              &:hover {
                background-color: #f5f5f5;
              }
              
              .uni-icons {
                font-size: 16px;
                color: #999;
              }
              
              text {
                font-size: 14px;
                color: #666;
              }
            }
          }
        }
      }
    }
    
    .content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }
  }
}
</style> 
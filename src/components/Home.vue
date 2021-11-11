<template>
    <el-container class="home-container">
        <!-- 头部区域 -->
        <el-header>
            <div>
                <img src="../assets/img/logo.png" alt="" width="50">
                <span>电商后台管理系统</span>
            </div> 
            <el-button @click="logout">退出</el-button>
        </el-header>
        <!-- 页面主体部分 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse?'64px':'200px'">
               <div class="toggle-button" @click="toggleCollapse">|||</div>
                <el-menu background-color="#333744" active-text-color="#409eff" unique-opened :collapse='isCollapse' :collapse-transition="false" router  
                :default-active ="defaultActive">
                    <!-- 一级菜单 -->
                    <el-submenu :index="'/'+item.path" v-for="item in menuList" :key="item.id">
                        <template slot="title">
                            <i :class="itemIcon[item.id]"></i>
                            <span>{{item.authName}}</span>
                        </template>
                        <el-menu-item :index="'/'+subItem.path " v-for="subItem in item.children" :key="subItem.id" @click="defActive(subItem.path)">
                            <i class="el-icon-menu"></i>
                            {{subItem.authName}}
                        </el-menu-item>                                              
                    </el-submenu>
                </el-menu>
            <!-- 侧边栏————end -->
            </el-aside>
            <el-main>
                <!-- 路由占位符 -->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>
<script>
import welcome from '../components/Welcome.vue'
export default {
    data(){
        return {
            //左侧菜单数据
            menuList:[],
            //菜单栏图标
            itemIcon:{
                '125': 'iconfont el-icon-user-solid',
                '103': 'iconfont el-icon-s-help',
                '101': 'iconfont el-icon-s-goods',
                '102': 'iconfont el-icon-s-order',
                '145': 'iconfont el-icon-s-marketing'
            },
            isCollapse: false,
            defaultActive:''
        }
    },
    components:{welcome},
    created(){
        this.getMenuList();
        this.defaultActive = window.sessionStorage.getItem('activePath');
    },
    methods:{
        logout(){
            window.sessionStorage.clear();
            this.$router.push('/login')
        },
        async getMenuList(){
            const {data:res} = await this.$http.get('/menus');
            if(res.meta.status != 200){
               return this.$message.error(res.meta.msg);
            }
           
            this.menuList = res.data;
            //console.log(this.menuList);
        },
        //点击按钮，切换菜单的折叠与展开
        toggleCollapse(){
            this.isCollapse = !this.isCollapse
        },
        defActive(path){
            this.defaultActive = '/'+ path;
            window.sessionStorage.setItem('activePath','/'+ path)
        }
    }
}
</script>
<style lang="less" scoped>
.el-header{
    background: #373d41; 
    display: flex; 
    justify-content: space-between;
    color:#fff;
    align-items: center;
    > div{
      display: flex;
      align-items: center; 
      span{
          margin-left: 15px;
      } 
    }
}
.el-aside,.el-menu{background: #333744;}
.el-menu{border:none;}
.el-main{}
.home-container{height: 100%;}
.el-submenu__title span,.el-menu-item{color:#fff;}
.iconfont{margin-right: 5px;}
.toggle-button{background: #4a5064;font-size: 10px; text-align:center;color:#fff; line-height: 24px; letter-spacing: 3px; cursor: pointer;}
</style>

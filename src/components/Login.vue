<template>
   <div class="login_container">
       <div class="login_box">
           <div class="vue-logo">
               <img src="../assets/img/logo.png" alt="">
           </div>
           <!-- 登录表单区域 -->
          <el-form :model="LoginForm" ref="LoginFormRef" :rules="LoginFormRules" class="login-form">
            <el-form-item prop="username">
                <el-input prefix-icon="el-icon-user" v-model="LoginForm.username"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input prefix-icon="el-icon-lock" v-model="LoginForm.password" show-password></el-input>
            </el-form-item>
             <el-form-item class="btns">
                <el-button type="primary" @click = "login">登录</el-button>
                <el-button type="info" @click = "resetLoginForm">重置</el-button>
            </el-form-item>
          </el-form>          
       </div>
    </div>
</template>
<script>
export default {
    data(){
        //设定密码自定义校验规则
        let validatorPass = (rule,value,callback)=>{
            if(value){
                let reg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}:";'<>?,.\/]).{8,64}$/;
               if(!reg.test(value)){
                   callback(new Error('密码必须由数字、字母和特殊字符组成'));
               }
            }
        };
        return {
            //登录表单的数据绑定对象
            LoginForm:{
                username:'',
                password:''
            },
            //表单的验证规则
             LoginFormRules:{
                username:[
                    {required:true,message:'请输入用户名',trigger:'blur'},
                ],
                password:[
                    {required:true,message:'请输入密码',trigger:'blur'},
                    // {min:3,max:15,message:'密码长度在3到15个字符',trigger:'blur'},
                    // {validator:validatorPass,trigger:'blur'}//自定义校验规则
                ]
            },
        }
    },
   
    methods:{
        login(){
            this.$refs.LoginFormRef.validate(async valid=>{
                if(!valid)return;
                const {data:res} = await this.$http.post('login',this.LoginForm);
                 //  console.log(res);
                if(res.meta.status != 200){
                    return this.$message({
                        message: res.meta.msg,
                        type: 'error'
                     });
                }
               this.$message.success('登录成功');
               //登录成功之后的token,保存在客户端的sessionStorage中
               window.sessionStorage.setItem('token',res.data.token);
               //通过编程式导航跳转到后台主页，路由地址是 /home
               this.$router.push('home');
               
            })
        },
        resetLoginForm(){
            this.$refs.LoginFormRef.resetFields();
        }
    }
}
</script>
<style lang="less" scoped>
    .login_container{
        height: 100%;
        background-color:#ccc;
    }
    .login_box {
        width:450px; 
        height:300px; 
        background-color:#fff;
        border-radius: 3px;
        position:absolute;
        left:50%;
        top:50%;
        transform: translate(-50%,-50%);
    }
    .vue-logo{
        height: 130px;
        width: 130px;
        border:1px solid #eee;
        border-radius: 50%;
        padding:10px;
        box-shadow: 0 0 10px #eee;
        position:absolute;
        left:50%;
        transform: translate(-50%,-50%); 
        background: #fff;       
            img{
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: #eee;
            }
    }
    .login-form{
        width:100%;
        position:absolute;
        bottom:0;
        padding:0 20px;
        box-sizing: border-box;
    }
    .btns {
        display: flex;
        justify-content: flex-end;
    }
</style>
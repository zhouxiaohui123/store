<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="box-card">
          <!-- 搜索与添加区域 -->
          <el-row :gutter="20">
            <el-col :span="6">
                <el-input v-model="queryInfo.query" placeholder="请输入内容" class="input-with-select" clearable @clear="getUserList">
                    <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                </el-input>
            </el-col>
            <el-col :span="12">
               <el-button type="primary" @click="addialogVisible=true">添加用户</el-button>
            </el-col>
          </el-row>
          <!-- 用户数据列表 -->
          <el-table :data="tableData" border stripe borderstyle="width: 100%" >
            <el-table-column type="index"></el-table-column>
            <el-table-column label="姓名" prop="username" width="180"></el-table-column>
            <el-table-column label="邮箱" prop="email"></el-table-column>
            <el-table-column label="电话" prop="mobile"></el-table-column>
            <el-table-column label="角色" prop="role_name"></el-table-column>
            <el-table-column label="状态" prop="mg_state">
              <template slot-scope="scope">
                  <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
              </template>
            </el-table-column>
            <el-table-column label="操作">
                 <template slot-scope="scope">
                    <!-- 修改按钮 -->
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="getUserItem(scope.row.id)"></el-button>
                    <!-- 删除按钮 -->
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUserItem(scope.row.id)"></el-button>
                    <!-- 分配角色按钮 -->
                    <el-tooltip content="分配角色" placement="top" :enterable="false">
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRoleDialog(scope.row)"></el-button>
                    </el-tooltip>
                 </template>
            </el-table-column>
           </el-table>  
            <!-- 分页 -->
            <template>
             <div class="block">
                 <!-- page-size 每页显示条目个数  -->
                <el-pagination  @size-change="handleSizeChange"  @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1,2, 5, 10, 20]"
                :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
                </el-pagination>
            </div>
            </template>
        </el-card>
        <!-- <people>
            <p>匿名插槽</p>
           <div slot="slot1">具名插槽</div>
           <div slot="slot2">具名插槽</div>
           <template >
               <ul>
                   <li v-for="item in user.data">{{item}}</li>
               </ul>
           </template>
        </people> -->
        <!-- 添加用户对话框 -->
        <el-dialog title="添加用户信息"  :visible.sync="addialogVisible"  width="30%" @close="addDialogClosed">
            <el-form :model="addForm" ref="addFormRef" :rules="addFormRules" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input  v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
                <!-- <el-form-item class="btns">
                    <el-button type="primary" @click = "login">添加</el-button>
                    <el-button type="info" @click = "resetLoginForm">取消</el-button>
                </el-form-item> -->
            </el-form>        
            <span slot="footer" class="dialog-footer">
                <el-button @click="addialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>
         <!-- 修改用户对话框 -->
        <el-dialog title="修改用户信息"  :visible.sync="editordialogVisible"  width="30%" @close="editorDialogClosed">
            <el-form :model="editorForm" ref="editorFormRef" :rules="addFormRules" label-width="70px">
                <el-form-item label="用户名">
                    <el-input  v-model="editorForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input  v-model="editorForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input  v-model="editorForm.mobile"></el-input>
                </el-form-item>
            </el-form>
             <span slot="footer" class="dialog-footer">
                <el-button @click="editordialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editorUser">确 定</el-button>
            </span>
        </el-dialog>     
        
          <!-- 分配角色对话框 -->
        <el-dialog title="分配角色"  :visible.sync="setRoleVisible"  width="30%" @close="setRoleClosed">
           <p>姓名：{{this.currRoleInfo.username}}</p>
           <p>当前角色：{{this.currRoleInfo.role_name}}</p>
           <p>分配新角色：
                <el-select v-model="rolesListSelected" placeholder="请选择">
                    <el-option  v-for="item in rolesList"   :key="item.id"
                    :label="item.roleName"  :value="item.id">
                    </el-option>
                </el-select>         
          </p> 
           <span slot="footer" class="dialog-footer">
                <el-button @click="setRoleVisible = false">取 消</el-button>
                <el-button type="primary" @click="setRole">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data(){
        //自定义邮箱校验规则
        var checkEmail = (rule,val,callback)=>{
          const regEmail =  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          if(regEmail.test(val)){
              return callback();
          }
          callback(new Error('请输入合法的邮箱'))
       };
        //自定手机号校验规则
        var checkMobile = (rule,val,callback) =>{
            const regMobile = /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[189]))\d{8}$/
            if(regMobile.test(val)){
                return callback();
            }
            callback(new Error('请输入合法的手机号'));
        };
        return {
            //分页数据源 
            queryInfo:{
                query:'',
                pagenum:1,//当前的页
                pagesize:2 //每页显示多少条数据
            },
            tableData:[],
            total: 0,
            addialogVisible: false, //添加用户对话框
            editordialogVisible:false,//修改用户对话框
            deletedialogVisible:false,//删除用户对话框
            setRoleVisible:false,//分配用户角色对话框
            //添加用户表单数据源 
            addForm:{
                username:'',
                password:'',
                email:'',
                mobile:''
            },
            //修改用户表单数据源 
            editorForm:{
                username:'',
                email:'',
                mobile:''
            },
            //添加用户表单验证规则
            addFormRules:{
                username:[
                    {required:true,message:'请设置用户名',trigger:'blur'},
                    {min:3,max:10,message:'用户名的长度在3~10之间',trigger:'blur'}
                ],
                password:[
                    {required:true,message:'请设置密码',trigger:'blur'},
                    {min:6,max:15,message:'用户名的长度在6~15之间',trigger:'blur'}
                ],
                email:[
                    {required:true,message:'请设置邮箱',trigger:'blur'},
                    {validator:checkEmail,trigger:'blur'}//自定义校验规则
                ],
                mobile:[
                    {required:true,message:'请设置手机号',trigger:'blur'},
                    {validator:checkMobile,trigger:'blur'}//自定义校验规则
                ]

            },
            //修改用户表单验证规则
            editorFormRules:{
                
            },
            //当前角色信息 
            currRoleInfo:{ },
            //所有角色数据源
            rolesList:[],
            rolesListSelected:'' //已被选中的角色id
        }
    },
    created(){
        this.getUserList();
    },
    methods:{
        //获取用户列表数据
       async getUserList(){
           const {data:res} = await this.$http.get('users',{params:this.queryInfo});
           if(res.meta.status!= 200){return this.$message.error(res.meta.message);}
           this.tableData = res.data.users; 
           this.total = res.data.total;   
           //console.log(res);
        },
        //页码大小触发事件 
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize;
            this.getUserList();

        },
        //当前页变动触发事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage;
            this.getUserList();
           // console.log(newPage);
        },
        //监听switch 开关状态的改变 
        async userStateChange(userInfo){
            const {data:res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_mg_state}`)
            if(res.meta.status!= 200){return this.$message.error("更新用户状态失败！");}
            this.$message.success("更新用户状态成功！")
            //console.log(userInfo);
        },
        //关闭新增用户对话框时，清空数据
        addDialogClosed(){
            this.$refs.addFormRef.resetFields()
        },
        editorDialogClosed(){
            this.$refs.editorFormRef.resetFields()
        },
        //点击按钮，新增用户
        addUser(){
            this.$refs.addFormRef.validate(async valid=>{
                if(!valid) return 
            //发起添加用户的请求
             const {data:res} = await this.$http.post('users',this.addForm);
             if(res.meta.status != 201){
                return this.$message.error(res.meta.msg);
             }
             this.$message.success('添加用户成功！');
             this.addialogVisible = false;
             this.getUserList();
            })
        },
        //点击按钮，获取需修改用户信息
        async getUserItem(id){
          this.editordialogVisible = true;
           //根据id，返回用户信息
          const {data:res} = await this.$http.get(`users/${id}`);
          
           if(res.meta.status != 200){
                return this.$message.error('获取用户失败');
            }
            this.editorForm = res.data;
            
        },
        //点击按钮，提交用户修改信息 
        editorUser(){
            this.$refs.editorFormRef.validate(async val=>{
                if(!val)return;
                 const {data:res} = await this.$http.put(`users/${this.editorForm.id}`,{email:this.editorForm.email,
                 mobile:this.editorForm.mobile})
                 console.log('huo',res);
                 if(res.meta.status != 200){
                     return this.$message.error('更新失败');
                 }
                 this.$message.success('更新成功！');
                 this.editordialogVisible = false;
                 this.getUserList();
            })
        },
        //点击按钮，获取需删除的用户信息
        async deleteUserItem(id){
            const confirm = await this.$confirm('此操作将永久删除改用户，是否继续？','提示',{
                confirmButtonTxt:'确定',
                cancelfirmButtonTxt:'取消',
                type:'warning'
            }).catch(err=>err)
            if(confirm !== 'cancel'){
               const {data:res} = await this.$http.delete(`users/${id}`);  
               console.log('删除',res); 
                 if(res.meta.status != 200){
                     return this.$message.error(res.meta.msg);
                 }
                this.$message.success('删除成功！');
                this.getUserList();
             }
        },
        //点击按钮，给用户分配角色
        async setRoleDialog(node){
            this.setRoleVisible = true;
            this.currRoleInfo = node;
            //获取所有角色
            const {data:res} = await this.$http.get('roles');
            if(res.meta.status !== 200){
                return this.$message.error(res.meta.msg);
            }
            this.rolesList = res.data;
       
            
        },
        setRoleClosed(){
            this.rolesListSelected = '';
        },
        async setRole(){
           const {data:res} = await this.$http.put(`users/${this.currRoleInfo.id}/role`,{rid:this.rolesListSelected});
           if(res.meta.status !==200){
               return this.$message.error(res.meta.msg);
           }
           this.$message.success('设置角色成功！');
           this.setRoleVisible = false;
           //res.data.rid
           //console.log('角色id',res.data);
           //console.log(this.rolesList);
            this.getUserList();
        }
    }
}
</script>
<style lang="less" scoped>
 
</style>

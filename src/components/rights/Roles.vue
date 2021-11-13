<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <el-button type="primary">添加角色</el-button>
            <!-- 角色列表区域 -->
            <el-table :data="rolesTable" border stripe>
                 <el-table-column type="expand">
                    <!-- 展开列 -->
                    <template slot-scope="scope">
                        <pre>{{scope.row}}</pre>
                        <el-row  class="borderTop vcenter" v-for="item in scope.row.children" :key="item.id" >
                            <el-col :span="1">
                            </el-col>
                            <!-- 一级权限 -->
                            <el-col :span="4">
                                <el-tag closable @close='thirdLevelClose(scope.row,item.id)'>{{item.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 二级和三级权限 -->
                            <el-col :span="18">
                                <el-row :class="[index===0?'':'borderTop']" v-for="(item,index) in item.children" :key="item.id" >
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close='thirdLevelClose(scope.row,item.id)'>{{item.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <!-- 三级权限 -->
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="item in item.children" :key="item.id" closable @close='thirdLevelClose(scope.row,item.id)'>{{item.authName}}</el-tag>        
                                    </el-col>
                                </el-row>
                            </el-col>  
                             <el-col :span="1">
                            </el-col>                       
                        </el-row>
                    </template>
                 </el-table-column>
                 <el-table-column type="index"></el-table-column>
                 <el-table-column label="角色名称" prop="roleName"></el-table-column>
                 <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                 <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                        <el-button type="warning" icon="el-icon-setting" size="mini"  @click="SetRightsDialog(scope.row)">分配权限</el-button>
                    </template>
                 </el-table-column>
            </el-table>
        </el-card>
         <!-- 分配权限对话框 -->
        <el-dialog title="分配权限"  :visible.sync="rightsDialogVisible"  width="30%" @close="rightsDialogClose">
          
            <el-tree :data="rightsData" :props="rightsProps" show-checkbox node-key="id" :default-checked-keys='defKeys' ref="treeRef"></el-tree>

             <span slot="footer" class="dialog-footer">
                <el-button @click="editordialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="showSetRightsDialog">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data(){
        return {
            rolesTable:[],
            rightsDialogVisible:false,//分配权限对话框
            rightsData: [],//权限数据源
            rightsProps:{
              label:'authName',
              children:'children'
            },//设置权限tree形显示规则
            defKeys:[],//默认选择权限
            roleId:''
        }
    },
    created(){
        this.getRolesList();
    },
    methods:{
        async getRolesList(){
            const {data:res} = await this.$http.get('roles');
            if(res.meta.status !== 200){
                return this.$message.error(res.meta.msg);
            }
            console.log(res.data);
            this.rolesTable = res.data;
        },
        //删除某一个三级权限 
        async thirdLevelClose(role,id){
            const confirm = await this.$confirm('此权限将会被删除，是否继续？','提示',{
                confirmButtonTxt:'确定',
                cancelfirmButtonTxt:'取消',
                type:'warning'
            }).catch(err=>err);
            if(confirm !=='cancel'){
                 const {data:res} = await this.$http.delete(`roles/${role.id}/rights/${id}`);
                 if(res.meta.status !== 200){
                     return this.$message.error(res.meta.msg);
                 }
                 role.children = res.data;
                // this.getRolesList();
                 this.$message.success('删除成功！');
                 
            }
        },
        //点击按钮，获取所有权限列表
        async SetRightsDialog(node){
            console.log('node',node);
            const {data:res} = await this.$http.get('rights/tree');
            if(res.meta.status!== 200){
                return this.$message.error(res.meta.msg);
            }
            this.rightsData = res.data;
            this.roleId =node.id;
            this.getLeafKeys(node,this.defKeys);
            //console.log('this.defKeys',this.defKeys);
            this.rightsDialogVisible = true;
        },
       //通过递归函数来获取最后一个层级权限的id并存放到defKeys数组中 
        getLeafKeys(node,arr){
            //当前node没有children子节点时，即为最后一个节点，跳出递归函数
            if(!node.children){               
                return arr.push(node.id)
            } 
            node.children.forEach(item=>{
                this.getLeafKeys(item,arr);
            })
        },
        rightsDialogClose(){
           this.defKeys = [];
        },
        async showSetRightsDialog(){
            console.log('rightsData',this.rightsData);
            const idStr =[...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()].join(',')
            const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr});
            if(res.meta.status!== 200){
                return this.$message.error(res.meta.msg);
            }
            console.log('res',res);
            this.$message.success('权限更新成功！');
            this.rightsDialogVisible = false;
            this.getRolesList();
        }
    }
}
</script>
<style lang="less" scoped>
    .el-tag{margin: 10px 10px 0 0;}
    .el-col{margin-bottom:10px;}
    .borderTop{border-top:1px solid #eee;}
    .vcenter{display: flex; justify-content: center; align-items: center; justify-items: center;}
</style>
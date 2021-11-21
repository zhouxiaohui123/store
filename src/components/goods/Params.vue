<template>
    <div>
         <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
             <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning"  show-icon> </el-alert>
             <!-- 级联选择器 -->
             <el-row>
                 <el-col><span>选择商品分类：</span>
                      <el-cascader class="cascader" v-model="goodsCascaderValue" :options="goodsCascaderOption" :props="goodsCascaderProps" @change="goodsCascaderChange">
                      </el-cascader>
                 </el-col>
             </el-row>
             <!-- Tabs标签类 -->
             <el-tabs v-model="activeName" @tab-click="handleClick">
                 <!-- 添加动态参数面板 -->
                 <el-tab-pane label="动态参数" name="many">
                     <!-- 添加参数的按钮 -->
                    <el-row>
                        <el-col>                            
                            <el-button type="primary" size="mini" :disabled="addParamDisable"  @click="showDialog('addDialog','')" >添加参数</el-button>                        
                        </el-col>
                    </el-row>
                     <el-table :data="manyTableData" border>
                        <el-table-column type="expand">
                            <!-- 展开列 -->
                            <template slot-scope="scope">
                                <!-- 循环渲染tag标签 -->
                                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable  @close="handleClose(item,scope.row)">
                                    {{item}}
                                </el-tag>
                                <!-- 输入文本框 -->
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible"  v-model="scope.row.inputValue"  ref="saveTagInput"  size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)" >                              
                                </el-input>
                                <!-- 添加按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showDialog('editDialog',scope.row)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteDialog(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                     </el-table>
                  </el-tab-pane>
                  <!-- 添加静态属性面板 -->
                 <el-tab-pane label="静态属性" name="only">
                     <!-- 添加属性的按钮 -->
                      <el-row>
                        <el-col>                            
                            <el-button type="primary" size="mini" :disabled="addParamDisable" @click="showDialog('addDialog','')">添加属性</el-button>                        
                        </el-col>
                     </el-row>
                      <el-table :data="onlyTableData" border>
                        <el-table-column type="expand">
                            <!-- 展开列 -->
                            <template slot-scope="scope">
                                <el-tag class="attr_vals" v-for="(item,i) in scope.row.attr_vals" :key="i" closable>
                                    {{item}}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" icon="el-icon-edit" size="mini" @click="showDialog('editDialog',scope.row)">编辑</el-button>
                                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteDialog(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                     </el-table>
                 </el-tab-pane>                
             </el-tabs>
        </el-card>
        <!-- 增加动态/静态参数对话框 -->
        <el-dialog :title="`增加${dialogTitle}`" :visible.sync="addDialogVisible" width="30%" @close="manyDialogClose" >
            <el-form :model="manyForm" ref="manyFormRef" :rules="manyFormRules" label-width="100px">
                <el-form-item :label="dialogTitle" prop="attr_name">
                    <el-input v-model="manyForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
             <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="setManyParams">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑动态/静态参数对话框 -->
        <el-dialog :title="`修改${dialogTitle}属性`" :visible.sync="editDialogVisible" width="30%" @close="editDialogClose">
            <el-form :model="editForm" ref="editFormRef" :rules="manyFormRules" label-width="100px">
                <el-form-item :label="dialogTitle" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
             <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
     data(){
         return {
             goodsCascaderValue:[],
             goodsCascaderOption:[],//cascader级联选择器数据源
             goodsCascaderProps:{ //级联选择器配置对象
                 label:'cat_name',
                 value:'cat_id',
                 children:'children'
             },
             activeName:'many', //Tabs 标签数据源
             manyTableData:[],//动态参数table 数据源
             onlyTableData:[], //静态参数table数据源
             addDialogVisible:false,//动态数据对话框
             manyForm:{  //新增动态参数表单数据源
                 attr_name:'',
                 attr_sel:''  
             },
             editForm:{
                 attr_id:'',
                 attr_name:'',
                 attr_sel:''  
             },
             manyFormRules:{
                 attr_name:[{required:true,message:'请输入动态参数',trigger:'blur'}]
             },
             dialogTitle:'', //对话框标题
             editDialogVisible:false,

         }
     },
     created(){
         this.getGoodscategories();
     },
     methods:{
         //获取商品分类
         async getGoodscategories(){
            const {data:res} = await this.$http.get('categories');
            if(res.meta.status != 200){
                return this.$message.error(res.meta.msg);
            }
            this.goodsCascaderOption = res.data;
            console.log(this.goodsCascaderOption);
        },
        //级联选择器change监控
         goodsCascaderChange(){
             //只能选中三级分类
           if(this.goodsCascaderValue.length!==3)
            {
               this.goodsCascaderValue = [];
               this.manyTableData = [];
               this.onlyTableData = [];
               return;
            }
         //获取当前三级分类产品的动态参数
            this.loadProductsParams();
        },
        //加载三级分类产品的参数
        async loadProductsParams(){
            const {data:res} = await this.$http.get(`categories/${this.categoryId}/attributes`,{params:{sel:this.activeName}})
            if(res.meta.status !=200){
                return this.$message.error(res.meta.msg);
            }
            res.data.forEach(item=>{
                item.attr_vals = item.attr_vals?item.attr_vals.split(','):[];//将attr_vals 转化为数组
                console.log('attr_vals',item.attr_vals);
                item.inputValue ='';  // tag 输入文本框的值
                item.inputVisible = false; // tag 输入文本框是否显示
            })
          
            if(this.activeName == 'many'){
                this.manyTableData = res.data;
            }
            else if (this.activeName == 'only'){
                this.onlyTableData = res.data;
            }
           //console.log('manyTableData',this.manyTableData);
        },
        //tabs切换
        handleClick(){
            // console.log(this.goodsCascaderValue.length);
           if(this.goodsCascaderValue.length!==0){
                this.loadProductsParams();
           }
        },
        //点击新增动态参数按钮，触发动态参数对话框
        showDialog(dialog,row){
            if(dialog == 'addDialog'){
                this.addDialogVisible = true;
            }
            else if(dialog == 'editDialog' && row){
                console.log('row',row);
                this.editForm.attr_id = row.attr_id;
                this.editForm.attr_name = row.attr_name;
                this.editDialogVisible = true;
            }
            if(this.activeName == 'many'){
                this.dialogTitle = '动态参数';
            }else if(this.activeName == 'only'){
                this.dialogTitle = '静态属性';
            }

            
        },
        //关闭动态参数对话框
        manyDialogClose(){
            this.addDialogVisible = false;
            this.$refs.manyFormRef.resetFields();
        },
        //新增动态参数数据的提交
        setManyParams(){
            this.manyForm.attr_sel = this.activeName;
            this.$refs.manyFormRef.validate(async val=>{
                if(!val) return;
               const {data:res} = await this.$http.post(`categories/${this.categoryId}/attributes`,this.manyForm);
               if(res.meta.status!= 201){
                   return this.$message.error(res.meta.msg);
               }
               this.$message.success(res.meta.msg);
            })              
            this.addDialogVisible = false;
            this.loadProductsParams(); 
        },
        //tag新增
        showInput(row){
            row.inputVisible = true;
            // this.$refs.saveTagInput.focus();
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        //增加tag标签
        handleInputConfirm(row){
            if(row.inputValue.trim()){//去除新增tag左右空格
               row.attr_vals.push(row.inputValue);  
                //console.log(row); 
              this.editorTags(row);
            }
             row.inputValue = '';
             row.inputVisible = false;
        },
        //关闭tag标签，删除tag数据
         handleClose(tag,row){
            row.attr_vals.splice(row.attr_vals.indexOf(tag),1);    
            this.editorTags(row);    
        },
        //新增、删除tag标签数据
        async editorTags(row){
            const {data:res} = await this.$http.put(`categories/${this.categoryId}/attributes/${row.attr_id}`,{attr_name:row.attr_name,attr_sel:row.attr_sel,attr_vals:row.attr_vals.join()});
               if(res.meta.status!=200){
                    return this.$message.error(res.meta.msg);
                }
             this.$message.success('操作成功！');
        },
        //点击编辑按钮，弹出修改参数对话框
        editDialogClose(){
            this.editDialogVisible = false
        },
       editParams(){
            this.$refs.editFormRef.validate(async val=>{
                if(!val) return ;
               
                const {data:res} =await this.$http.put(`categories/${this.categoryId}/attributes/${this.editForm.attr_id}`,{attr_name:this.editForm.attr_name,attr_sel:this.activeName});
                if(res.meta.status != 200){
                    return this.$message.error(res.mete.msg);
                }
                this.$message.success('修改成功！');
                this.editDialogVisible = false;
                this.loadProductsParams();
            })
           
        },
        //删除参数
        async deleteDialog(row){
             const {data:res} =await this.$http.delete(`categories/${this.categoryId}/attributes/${row.attr_id}`);
            if(res.meta.status != 200){
                return this.$message.error(res.mete.msg);
            }
            this.$message.success('删除成功！');
            this.loadProductsParams();
        }
       
     },
     
     computed:{
         addParamDisable(){
            if(this.goodsCascaderValue.length !==3)
            {
               return true
            }
            return false;
         },
        //当前选中的三级分类的id
        categoryId(){
            if(this.goodsCascaderValue.length == 3){
                return this.goodsCascaderValue[2];
            }
            return;
        }
     },
     watch:{

     }
}
</script>
<style lang="less" scoped>
    .cascader{margin: 20px 0;}
    .el-tag,.button-new-tag,.input-new-tag{margin:10px;}
    .active{color:#cc0000}
    .input-new-tag {width: 90px;}
</style>

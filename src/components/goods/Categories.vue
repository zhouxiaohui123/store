<template>
    <div>
         <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary"  @click="addGoodsCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            
            <tree-table :data="tabelData" :show-index='props.showIndex' :show-header="props.showHeader" :selection-type="props.selectionType" :expand-type="props.expandType" :columns="columns" :border="props.border"> 
                     <!-- 是否有效列插槽 -->
                     <template slot="isOk" slot-scope="scope"> 
                         <i v-if="scope.row.cat_deleted" class="el-icon-error iconErrorColor"></i>
                         <i v-else-if="!scope.row.cat_deleted" class="el-icon-success iconSuccessColor"></i>
                         <!-- <i :class="scope.row.cat_deleted?'el-icon-error':'el-icon-success'"></i>  -->
                    </template> 
                    <!-- 排序列插槽 -->
                    <template slot="order" slot-scope="scope"> 
                        <el-tag v-if="scope.row.cat_level==0">一级</el-tag>
                        <el-tag v-else-if="scope.row.cat_level==1" type="success">二级</el-tag>
                        <el-tag v-else-if="scope.row.cat_level==2" type="warning">三级</el-tag>
                    </template>
                     <!-- 操作列插槽 -->
                    <template slot="option" slot-scope="scope"> 
                       <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                       <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGoodsCateDialog(scope.row.cat_id)">删除</el-button>
                    </template>
            </tree-table>
            
            <!-- <el-table :data="tabelData" border>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="分类名称" prop="cat_name"></el-table-column>
                <el-table-column label="是否有效" prop=""></el-table-column>
                <el-table-column label="排序" prop="cat_level"></el-table-column>
                <el-table-column label="操作" prop=""></el-table-column>
            </el-table> -->
            <!-- 分页 -->
            <template>
             <div class="block">
                 <!-- page-size 每页显示条目个数  -->
                <el-pagination  @size-change="handleSizeChange"  @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1,2, 5, 10, 20]"
                :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"> 
                </el-pagination>
            </div>
            </template>
            <!-- 添加分类对话框 -->
            <el-dialog title="添加分类" :visible.sync="addGoodsCateVisible" @close="addGoodsCateClose" width="30%">
                <el-form :model="addForm" ref="addFormRef" :rules="addFormRules" label-width="80px"> 
                    <el-form-item label="分类名称" prop="cat_name">
                        <el-input v-model="addForm.cat_name"></el-input>
                    </el-form-item>
                    <el-form-item label="父级分类">
                         <el-cascader v-model="goodsCateSelectValue"  :options="parentCategories" :props="goodsCateProps"   @change="handleChange" clearable >
                         </el-cascader>
                    </el-form-item>
                    
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addGoodsCateVisible=false">取消</el-button>
                    <el-button type="primary" @click="setAddGoodsCate">确定</el-button>
                </span>
            </el-dialog>
        </el-card>
    </div>
</template>
<script>
export default {
    data(){
        return {           
            queryInfo:{
                pagenum:1,//当前显示页
                pagesize:5 //每页显示多少条数据
                
            },
            total: 0, //
            props:{
                border:true,
                showHeader:true,
                showIndex:true,
                expandType:false,
                selectionType:false
            },//tree-table 配置对象
            tabelData:[],//分类名称数据源
            columns:[
                {
                    label:'分类名称',
                    prop:"cat_name"
                },
                 {
                    label:'是否有效',
                   // prop:"cat_deleted",
                    //自定义模板列
                    type:'template',
                    //模板名称
                    template:'isOk'
                },
                 {
                    label:'排序',
                    type:'template',
                    template:'order'
                },
                {
                    label:'操作',
                    type:'template',
                    template:'option'
                }                
            ],
            addGoodsCateVisible:false,//添加分类对话框
            addForm:{//添加分类表单数据源
                cat_pid:0,//父级分类id
                cat_level: 0 //分类层级，0代表一级，1代表二级，2代表三级
            },
            goodsCateOptions:[],//添加分类对话框中父级分类数据源
            addFormRules:{
               cat_name:[
                   {required:true,message:'请设置分类名称',trigger:'blur'},
                   {min:3,max:10,message:'用户名的长度在3到10之前',trigger:'blur'}
               ] 
            },
            goodsCateSelectValue:[],
            goodsCateProps:{  //级联选择器配置对象
                label:'cat_name',
                value:'cat_id',
                children:'children',
                checkStrictly:true  //是否严格执行父子节点不相互关联
            },
            //父级分类列表
            parentCategories:[],
            //点击确定按钮，向列表中添加分类
           
          
        }
    },
    created(){
        this.getGoodsList();
    },
    methods:{
        //获取商品分类
        async getGoodsList(){
            const {data:res} = await this.$http.get('categories',{params:this.queryInfo});
            if(res.meta.status!==200){
                return this.$message.error(res.meta.msg);
            }
             this.tabelData = res.data.result;
             console.log(this.tabelData);
             this.total = res.data.total;
        },
        //页面大小触发事件
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize;
            this.getGoodsList();
        },
        //当前页变动触发事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage;
            this.getGoodsList();
        },
        //级联选择器触发事件
        handleChange(){
            if(this.goodsCateSelectValue.length > 0){
                this.addForm.cat_pid = this.goodsCateSelectValue[this.goodsCateSelectValue.length-1];
                this.addForm.cat_level = this.goodsCateSelectValue.length;
           }
           else{
               this.addForm.cat_pid = 0;
               this.addForm.cat_level = 0;
           }
        },
        //点击编辑按钮，触发添加分类对话框
        async addGoodsCateDialog(node){
            this.addForm.cat_pid = 0;
            this.addForm.cat_level = 0;
            const {data:res} = await this.$http.get('categories',{params:{type:2}});
            if(res.meta.status !== 200){
                return this.$message.error(res.meta.msg);
            }           
            this.parentCategories = res.data;
            this.addGoodsCateVisible = true;           
        },  
        //点击确定按钮，添加分类
        setAddGoodsCate(){
            this.$refs.addFormRef.validate(async val=>{
                if(!val) return;
                console.log(this.addForm);
                const {data:res} = await this.$http.post('categories',this.addForm);
                if(res.meta.status != 201){
                    return this.$message.error(res.meta.msg);
                }
                this.$message.success('创建成功！');
                this.addGoodsCateVisible = false;
                this.getGoodsList();
            })
        },
        //添加分类对话框关闭触发事件
        addGoodsCateClose(){
            this.$refs.addFormRef.resetFields();//重置分类对话框表单
            this.goodsCateSelectValue = [];
        }
    }
}
</script>
<style lang="less" scoped>
    .el-row{margin-bottom:20px;}
    .iconSuccessColor{color:#0cb3a1}
    .iconErrorColor{color:#cc0000}
</style>
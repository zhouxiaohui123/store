<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>            
            <el-row :gutter="20">
                <el-col :span ="6">
                    <!-- 搜索框 -->
                    <el-input v-model="queryInfo.query" placeholder="输入内容" @keyup.enter.native="loadGoodsList" clearable @clear="loadGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="loadGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span ="6">
                    <router-link to="/"></router-link>
                    <el-button type="primary" @click="goAddpage">添加商品</el-button>
                </el-col>
            </el-row>
             <el-table :data="tableData" border stripe style="width: 100%" >
                <el-table-column type="index"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格（元）" prop="goods_price" width="150px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="150px"></el-table-column>
                <el-table-column label="创建时间" prop="add_time" width="200px">
                    <template v-slot="scope">
                        {{scope.row.add_time | dataFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" prop="" width="200px">
                    <template v-slot="scope">
                        <!-- :to="{ path: '/home' }" -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="goEditpage(scope.row.goods_id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGoods(scope.row.goods_id)">删除</el-button>
                    </template>
                </el-table-column>
             </el-table> 
              <div class="block">
                 <!-- page-size 每页显示条目个数  -->
                <el-pagination  @size-change="handleSizeChange"  @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1,2, 5, 10, 20]"
                :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total">
                </el-pagination>
            </div>         
        </el-card>
    </div>
</template>
<script>
export default {
    data(){
        return {
            queryInfo:{
                query:'',
                pagenum: 1,
                pagesize: 10
            },
            tableData:[],
            total:0
        }
    },
    created(){
       this.loadGoodsList();
    },
    methods:{
        //获取商品列表数据
        async loadGoodsList(){
           const {data:res} = await this.$http.get('goods',{params:this.queryInfo});
            if(res.meta.status != 200){
                return this.$message.error(res.meta.msg);
            }
            // res.data.goods.forEach(val=>{
            //     val.add_time = val.add_time /3600;
            // })
            // res.data.goods.add_time = res.data.goods.add_time/3600;
            this.tableData = res.data.goods;
            this.total = res.data.total;
        },
        //页码大小触发事件 
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize;
            this.loadGoodsList();
        },
        //当前页变动触发事件
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage;
             this.loadGoodsList();
        },
        //删除商品 
        async deleteGoods(id){
            this.$confirm("此数据将永久删除，是否继续","提示",{
                confirmButtonText:"确定",
                cancelButtonText:"取消",
                type:"warning"
            }).then(async()=>{
               const {data:res} = await this.$http.delete(`goods/${id}`)
               if(res.meta.status!=200){
                   return this.$message.error(res.meta.msg);
               }            
                this.$message.success("删除成功！");
                this.loadGoodsList(); //刷新列表
            }).catch(err=>err)
        },
        //点击""添加商品"按钮，跳转到添加页
        goAddpage(){
            this.$router.push('/add')
        },
        goEditpage(id){
            //this.$router.push('/add')
            this.$router.push(`/edit/${id}`)
        }
    }, 
    //过滤器
    filters:{
        dataFormat(value){
            if(!value) return;
            const dt = new Date(value);
            const y = dt.getFullYear();
            const m = (dt.getMonth() + 1 + '').padStart(2,'0');
            const d = (dt.getDay() + '').padStart(2,'0');
            const hh =(dt.getHours() + '').padStart(2,'0');
            const mm =(dt.getMinutes() + '').padStart(2,'0');
            const ss =(dt.getSeconds() + '').padStart(2,'0');
            return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
        }
    }
}
</script>
<style lang="less" scoped>
    
</style>
